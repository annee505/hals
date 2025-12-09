import { supabase } from './supabase-config';

export const courseContentService = {
    getCourseContent: async (courseId) => {
        // Fetch modules and lessons
        const { data: modules, error: modulesError } = await supabase
            .from('modules')
            .select(`
                *,
                lessons (*)
            `)
            .eq('course_id', courseId)
            .order('order_index');

        if (modulesError) throw modulesError;

        // Sort lessons by order_index
        const sortedModules = modules.map(mod => ({
            ...mod,
            lessons: mod.lessons.sort((a, b) => a.order_index - b.order_index)
        }));

        return { modules: sortedModules };
    },

    getProgress: async (userId, courseId) => {
        // Get all completed lessons for this user and course
        // We need to join with lessons to filter by course_id, but Supabase simple join might be tricky for deep filtering
        // Easier approach: Get all lesson_progress for user, then filter in memory or better query

        // 1. Get all lesson IDs for this course
        const { data: courseLessons } = await supabase
            .from('lessons')
            .select('id, module_id, modules!inner(course_id)')
            .eq('modules.course_id', courseId);

        const lessonIds = courseLessons ? courseLessons.map(l => l.id) : [];

        if (lessonIds.length === 0) return { completedLessons: [] };

        // 2. Get progress for these lessons
        const { data: progress } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('completed', true)
            .in('lesson_id', lessonIds);

        return {
            completedLessons: progress ? progress.map(p => p.lesson_id) : []
        };
    },

    markLessonComplete: async (userId, courseId, lessonId) => {
        // Check if already completed
        const { data: existing } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('lesson_id', lessonId)
            .single();

        let result;
        if (existing) {
            // Toggle completion
            const { data, error } = await supabase
                .from('lesson_progress')
                .update({ completed: !existing.completed, completed_at: !existing.completed ? new Date() : null })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            // Create new record
            const { data, error } = await supabase
                .from('lesson_progress')
                .insert({
                    user_id: userId,
                    lesson_id: lessonId,
                    completed: true,
                    completed_at: new Date()
                })
                .select()
                .single();
            if (error) throw error;
            result = data;
        }

        // Update overall course progress in enrollments
        await courseContentService.updateEnrollmentProgress(userId, courseId);

        return result;
    },

    updateEnrollmentProgress: async (userId, courseId) => {
        // Calculate percentage
        const { data: modules } = await supabase
            .from('modules')
            .select('id, lessons(id)')
            .eq('course_id', courseId);

        let totalLessons = 0;
        let lessonIds = [];

        modules?.forEach(m => {
            if (m.lessons) {
                totalLessons += m.lessons.length;
                lessonIds = [...lessonIds, ...m.lessons.map(l => l.id)];
            }
        });

        if (totalLessons === 0) return;

        const { count } = await supabase
            .from('lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('completed', true)
            .in('lesson_id', lessonIds);

        const percentage = Math.round((count / totalLessons) * 100);

        // Update enrollment
        await supabase
            .from('enrollments')
            .update({ progress: percentage })
            .eq('user_id', userId)
            .eq('course_id', courseId);

        return percentage;
    }
};
