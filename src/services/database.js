import { supabase } from './supabase-config';

export const database = {
    // User operations

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
