import { supabase } from './supabase-config';

export const database = {
    // User operations
    createUser: async (email, password, profile) => {
        console.log('[Signup] Starting createUser for:', email);
        console.log('[Signup] Profile data:', profile);

        // 1. Try to sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
                data: {
                    name: profile.name,
                    hobbies: profile.hobbies,
                    learning_style: profile.learningStyle,
                    goal: profile.goal
                }
            }
        });

        console.log('[Signup] Supabase Auth response:', { authData, authError });

        // If user already exists in Auth, try to sign them in and recreate profile
        if (authError && authError.message?.includes('already registered')) {
            // Try to sign in with the provided credentials
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                throw new Error('This email is already registered. Please log in instead, or use a different password.');
            }

            // Check if profile exists in users table
            const existingProfile = await database.findUserByEmail(email);
            if (existingProfile) {
                return existingProfile;
            }

            // Profile doesn't exist - recreate it (user was deleted from database but Auth remains)
            const { data: newProfile, error: profileError } = await supabase
                .from('users')
                .insert({
                    id: signInData.user.id,
                    email: email,
                    name: profile.name,
                    hobbies: profile.hobbies || '',
                    learning_style: profile.learningStyle || 'visual',
                    goal: profile.goal || ''
                })
                .select()
                .single();

            if (profileError) {
                console.error('Error recreating profile:', profileError);
                throw new Error('Failed to create user profile. Please try again.');
            }

            return newProfile;
        }

        // Handle any other auth errors
        if (authError) {
            console.error('[Signup] Auth error:', authError);
            // Check for rate limit error
            if (authError.message?.includes('rate limit') || authError.status === 429) {
                throw new Error('Too many signup attempts. Please wait a few minutes and try again.');
            }
            throw new Error(authError.message || 'Failed to create account. Please try again.');
        }

        // Check if email confirmation is required (user exists but no session)
        if (authData?.user && !authData?.session) {
            console.log('[Signup] Email confirmation may be required');
            // User was created but needs to confirm email
            // Still create the profile in our database so they can complete setup after confirming
        }

        // Check if we have a user to work with
        if (!authData?.user) {
            console.error('[Signup] No user data returned from Supabase');
            throw new Error('Failed to create account. Please try again.');
        }

        // 2. Create user profile in our users table
        const { data: user, error: dbError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id, // Link to Auth ID
                email: email,
                name: profile.name,
                hobbies: profile.hobbies,
                learning_style: profile.learningStyle,
                goal: profile.goal
            })
            .select()
            .single();

        if (dbError) {
            // If user already exists in public table (e.g. from previous run), just return it
            if (dbError.code === '23505') { // Unique violation
                return await database.findUserByEmail(email);
            }
            console.error('[Signup] Database error:', dbError);
            throw new Error('Failed to create user profile. Please try again.');
        }

        console.log('[Signup] User created successfully:', user);
        return user;
    },

    findUserByEmail: async (email) => {
        console.log('[DB] findUserByEmail called for:', email);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .maybeSingle(); // Use maybeSingle to avoid errors when no row found

            console.log('[DB] findUserByEmail result:', { data, error });

            if (error) {
                console.warn('Error fetching user by email:', error);
                return null; // Return null instead of throwing
            }
            return data;
        } catch (err) {
            console.error('findUserByEmail exception:', err);
            return null; // Return null on any error
        }
    },

    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        return profile;
    },

    authenticateUser: async (email, password) => {
        console.log('[Auth] Starting login for:', email);
        const startTime = Date.now();

        try {
            // Clear any existing session first to prevent stale session issues
            // Use timeout because signOut can also hang on corrupted sessions
            console.log('[Auth] Clearing existing session...');
            try {
                const signOutPromise = supabase.auth.signOut();
                const signOutTimeout = new Promise((resolve) => setTimeout(resolve, 3000));
                await Promise.race([signOutPromise, signOutTimeout]);
            } catch (e) {
                console.warn('[Auth] signOut failed, clearing localStorage instead:', e);
            }
            // Also manually clear localStorage as backup
            localStorage.removeItem('hals-auth-token');
            localStorage.removeItem('hals_session');
            console.log('[Auth] Session cleared');

            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timed out. Please check your connection and try again.')), 15000)
            );

            const authPromise = supabase.auth.signInWithPassword({
                email,
                password
            });

            const { data, error } = await Promise.race([authPromise, timeoutPromise]);

            console.log('[Auth] Supabase auth completed in:', Date.now() - startTime, 'ms');
            console.log('[Auth] Supabase auth response:', { data, error });

            if (error) {
                // Check for rate limit
                if (error.message?.includes('rate limit') || error.status === 429) {
                    throw new Error('Too many login attempts. Please wait a few minutes and try again.');
                }
                throw new Error(error.message || 'Invalid email or password');
            }

            if (!data?.user) {
                throw new Error('Authentication failed - no user returned');
            }

            // Return the user profile from our table
            console.log('[Auth] Fetching user profile...');
            const profileStart = Date.now();
            const profile = await database.findUserByEmail(email);
            console.log('[Auth] Profile fetch completed in:', Date.now() - profileStart, 'ms');

            // If user authenticated but profile doesn't exist, create a basic one
            if (!profile) {
                console.log('[Auth] Profile not found, creating basic profile...');
                // Instead of failing, create a basic profile for the user
                const { data: newProfile, error: createError } = await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email: email,
                        name: data.user.email?.split('@')[0] || 'User',
                        hobbies: '',
                        learning_style: 'visual',
                        goal: ''
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('[Auth] Failed to create profile:', createError);
                    // If we can't create profile, still return basic user data
                    return {
                        id: data.user.id,
                        email: email,
                        name: data.user.email?.split('@')[0] || 'User',
                        hobbies: '',
                        learning_style: 'visual',
                        goal: ''
                    };
                }

                console.log('[Auth] Created new profile:', newProfile);
                return newProfile;
            }

            console.log('[Auth] Login complete. Total time:', Date.now() - startTime, 'ms');
            return profile;
        } catch (err) {
            console.error('[Auth] Login error:', err);
            throw err;
        }
    },

    updateUserProfile: async (userId, profileData) => {
        const { data, error } = await supabase
            .from('users')
            .update({
                name: profileData.name,
                hobbies: profileData.hobbies,
                learning_style: profileData.learningStyle,
                goal: profileData.goal
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Course operations
    getAllCourses: async () => {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('enrolled_count', { ascending: false });

        if (error) throw error;
        return data;
    },

    getCourseById: async (courseId) => {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

        if (error) throw error;
        return data;
    },

    getRecommendedCourses: async (userProfile) => {
        // Fetch all courses first
        const courses = await database.getAllCourses();

        if (!userProfile || !userProfile.goal) return courses.slice(0, 6);

        const goal = userProfile.goal.toLowerCase();
        const recommended = courses.filter(c => {
            const tags = c.tags || [];
            return tags.some(tag => goal.includes(tag.toLowerCase())) ||
                c.title.toLowerCase().includes(goal) ||
                (c.description && c.description.toLowerCase().includes(goal));
        });

        return recommended.length > 0 ? recommended.slice(0, 6) : courses.slice(0, 6);
    },

    // Enrollment operations
    enrollInCourse: async (userId, courseId) => {
        // Check if already enrolled
        const { data: existing } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (existing) throw new Error('Already enrolled');

        // Create enrollment
        const { data, error } = await supabase
            .from('enrollments')
            .insert({
                user_id: userId,
                course_id: courseId,
                progress: 0
            })
            .select()
            .single();

        if (error) throw error;

        // Increment enrolled count
        await supabase.rpc('increment_enrollment_count', { course_id: courseId });

        return data;
    },

    getUserEnrollments: async (userId) => {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                *,
                course:courses(*)
            `)
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    }
};
