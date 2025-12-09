import { supabase } from './supabase-config';

export const database = {
    // User operations
    createUser: async (email, password, profile) => {
        // 1. Sign up with Supabase Auth
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
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
        return data;
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

        if (error) throw error;

        // Return the user profile from our table
        return await database.findUserByEmail(email);
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
