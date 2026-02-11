import { supabase } from './supabase-config';

// In-memory cache for fast back-navigation
const cache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

function getCached(key) {
    const entry = cache.get(key);
    if (entry && (Date.now() - entry.ts < CACHE_TTL)) return entry.data;
    return null;
}

function setCache(key, data) {
    cache.set(key, { data, ts: Date.now() });
}

// Exported so courseContent can invalidate enrollment cache when progress changes
export function clearEnrollmentCache(userId) {
    cache.delete(`enrollments_${userId}`);
}

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
            return null;
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
        const cacheKey = `course_${courseId}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

        if (error) throw error;
        setCache(cacheKey, data);
        return data;
    },

    getRecommendedCourses: async (userProfile) => {
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
        const { data: existing } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (existing) throw new Error('Already enrolled');

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

        await supabase.rpc('increment_enrollment_count', { course_id: courseId });

        // Clear cache so new course shows immediately
        cache.delete(`enrollments_${userId}`);

        return data;
    },

    getUserEnrollments: async (userId) => {
        const cacheKey = `enrollments_${userId}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                *,
                course:courses(*)
            `)
            .eq('user_id', userId);

        if (error) throw error;
        setCache(cacheKey, data);
        return data;
    },

    unenrollFromCourse: async (userId, courseId) => {
        console.log('Unenrolling:', { userId, courseId });

        // Delete lesson progress for this course's lessons
        const { data: modules } = await supabase
            .from('modules')
            .select('id, lessons(id)')
            .eq('course_id', courseId);

        if (modules) {
            const lessonIds = modules.flatMap(m => (m.lessons || []).map(l => l.id));
            if (lessonIds.length > 0) {
                const { error: progressError } = await supabase
                    .from('lesson_progress')
                    .delete()
                    .eq('user_id', userId)
                    .in('lesson_id', lessonIds);
                if (progressError) console.warn('Error deleting lesson progress:', progressError);
            }
        }

        // Delete enrollment
        const { error } = await supabase
            .from('enrollments')
            .delete()
            .eq('user_id', userId)
            .eq('course_id', courseId);

        if (error) throw error;

        // Verify the delete actually worked (RLS can silently block it)
        const { data: stillExists } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle();

        if (stillExists) {
            throw new Error('Unable to remove course — please check your database permissions (RLS policies)');
        }

        // Decrement enrolled count
        try { await supabase.rpc('increment_enrollment_count', { course_id: courseId, amount: -1 }); } catch (e) { /* ignore */ }

        // Clear caches
        cache.delete(`enrollments_${userId}`);
        cache.delete(`course_${courseId}`);

        return true;
    }
};
