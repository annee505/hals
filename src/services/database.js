import { supabase } from './supabase-config';

export const database = {
    // User operations
    createUser: async (email, password, profile) => {
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

        if (authError) throw authError;

        // 2. Create user profile in our users table
        if (authData.user) {
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
                throw dbError;
            }
            return user;
        }
    },

    findUserByEmail: async (email) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .maybeSingle(); // Use maybeSingle to avoid errors when no row found

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
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new Error(error.message || 'Invalid email or password');
        }

        if (!data?.user) {
            throw new Error('Authentication failed');
        }

        // Return the user profile from our table
        const profile = await database.findUserByEmail(email);

        // If user authenticated but profile doesn't exist, they were deleted from the database
        if (!profile) {
            // Sign them out of Supabase Auth
            await supabase.auth.signOut();
            throw new Error('Your account no longer exists. Please sign up again.');
        }

        return profile;
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
