import { supabase } from './supabase-config';
import { clearEnrollmentCache } from './database';

// Simple in-memory cache to avoid re-fetching when navigating back
const courseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const courseContentService = {
    // Get the first incomplete lesson for "continue where you left off"
    getLastLesson: async (userId, courseId) => {
        try {
            // Get course content and progress
            const [content, progress] = await Promise.all([
                courseContentService.getCourseContent(courseId),
                courseContentService.getProgress(userId, courseId)
            ]);

            if (!content.modules || content.modules.length === 0) return null;

            const completedLessons = new Set(progress.completedLessons || []);

            // Find first incomplete lesson
            for (const module of content.modules) {
                for (const lesson of module.lessons) {
                    if (!completedLessons.has(lesson.id)) {
                        return {
                            courseId,
                            lessonId: lesson.id,
                            lessonTitle: lesson.title,
                            moduleTitle: module.title
                        };
                    }
                }
            }

            // All lessons complete, return the last lesson
            const lastModule = content.modules[content.modules.length - 1];
            const lastLesson = lastModule.lessons[lastModule.lessons.length - 1];
            return {
                courseId,
                lessonId: lastLesson.id,
                lessonTitle: lastLesson.title,
                moduleTitle: lastModule.title,
                isComplete: true
            };
        } catch (error) {
            console.error('Error getting last lesson:', error);
            return null;
        }
    },
    getCourseContent: async (courseId) => {
        // Check cache first — avoid re-fetching when navigating back
        const cached = courseCache.get(courseId);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return cached.data;
        }

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

        const result = { modules: sortedModules };

        // Cache the result
        courseCache.set(courseId, { data: result, timestamp: Date.now() });

        return result;
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
        try {
            // Calculate percentage
            const { data: modules, error: modulesError } = await supabase
                .from('modules')
                .select('id, lessons(id)')
                .eq('course_id', courseId);

            if (modulesError) {
                console.error('Error fetching modules:', modulesError);
                return 0;
            }

            let totalLessons = 0;
            let lessonIds = [];

            modules?.forEach(m => {
                if (m.lessons) {
                    totalLessons += m.lessons.length;
                    lessonIds = [...lessonIds, ...m.lessons.map(l => l.id)];
                }
            });

            if (totalLessons === 0) {
                console.log('No lessons found for course:', courseId);
                return 0;
            }

            const { count, error: countError } = await supabase
                .from('lesson_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('completed', true)
                .in('lesson_id', lessonIds);

            if (countError) {
                console.error('Error counting completed lessons:', countError);
                return 0;
            }

            const percentage = Math.round(((count || 0) / totalLessons) * 100);
            console.log(`Progress update: ${count || 0}/${totalLessons} = ${percentage}%`);

            // Update enrollment
            const { error: updateError } = await supabase
                .from('enrollments')
                .update({ progress: percentage })
                .eq('user_id', userId)
                .eq('course_id', courseId);

            if (updateError) {
                console.error('Error updating enrollment progress:', updateError);
            } else {
                console.log('Successfully updated progress to', percentage, '%');
                // Clear enrollment cache so Profile shows fresh progress
                clearEnrollmentCache(userId);
            }

            return percentage;
        } catch (error) {
            console.error('Error in updateEnrollmentProgress:', error);
            return 0;
        }
    }
};
