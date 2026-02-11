import { supabase } from './supabase-config';

export const database = {
    // User operations

    findUserByEmail: async (email) => {
        console.log('[DB] findUserByEmail called for:', email);
        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database timeout')), 5000)
            );

            // Execute query
            const queryPromise = supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .maybeSingle();

            // Race them
            const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

            console.log('[DB] findUserByEmail result:', { data, error });

            if (error) {
                console.warn('Error fetching user by email:', error);
                return null;
            }
            return data;
        } catch (err) {
            console.error('findUserByEmail exception:', err);
            return null; // Return null on any error (including timeout) to allow app to proceed
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
        const updateData = {
            name: profileData.name,
            hobbies: profileData.hobbies,
            learning_style: profileData.learningStyle,
            goal: profileData.goal
        };
        // Only include new fields if they exist
        if (profileData.pace) updateData.pace = profileData.pace;
        if (profileData.contentDepth) updateData.content_depth = profileData.contentDepth;

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
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
