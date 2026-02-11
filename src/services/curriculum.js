import { supabase } from './supabase-config';

export const curriculumService = {
    getAnalytics: async (userId) => {
        try {
            // Get real progress from enrollments
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('progress, course:courses(title, tags)')
                .eq('user_id', userId);

            let avgProgress = 0;
            const strengths = [];
            const weaknesses = [];

            if (enrollments && enrollments.length > 0) {
                const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
                avgProgress = Math.round(totalProgress / enrollments.length);

                const sorted = [...enrollments]
                    .filter(e => e.course)
                    .sort((a, b) => (b.progress || 0) - (a.progress || 0));

                sorted.forEach(e => {
                    const name = e.course.tags?.[0] || e.course.title;
                    if ((e.progress || 0) >= 50) {
                        if (strengths.length < 3) strengths.push(name);
                    } else {
                        if (weaknesses.length < 3) weaknesses.push(name);
                    }
                });
            }

            // Streak is handled by streakService — no need to duplicate here
            return {
                progress: avgProgress,
                streak: 0,
                strengths: strengths.length > 0 ? strengths : ['Getting Started'],
                weaknesses: weaknesses.length > 0 ? weaknesses : ['Keep Learning!']
            };
        } catch (error) {
            console.error('Error computing analytics:', error);
            return {
                progress: 0,
                streak: 0,
                strengths: ['Getting Started'],
                weaknesses: ['Keep Learning!']
            };
        }
    }
};
