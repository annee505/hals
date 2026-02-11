import { supabase } from './supabase-config';

export const curriculumService = {
    generateCurriculum: (profile) => {
        // Mock logic to personalize based on profile
        const baseCurriculum = [
            {
                id: 1,
                title: 'Foundations',
                modules: [
                    { id: '1-1', title: 'Introduction to Problem Solving', status: 'completed' },
                    { id: '1-2', title: 'Understanding the Basics', status: 'in-progress' },
                    { id: '1-3', title: 'Key Concepts', status: 'locked' }
                ]
            },
            {
                id: 2,
                title: 'Advanced Application',
                modules: [
                    { id: '2-1', title: 'Real-world Scenarios', status: 'locked' },
                    { id: '2-2', title: 'Complex Analysis', status: 'locked' }
                ]
            }
        ];

        // Simple personalization
        if (profile.goal.toLowerCase().includes('code') || profile.goal.toLowerCase().includes('python')) {
            baseCurriculum[0].title = 'Coding Foundations';
            baseCurriculum[0].modules[0].title = 'Intro to Logic';
        } else if (profile.goal.toLowerCase().includes('budget') || profile.goal.toLowerCase().includes('finance')) {
            baseCurriculum[0].title = 'Financial Basics';
            baseCurriculum[0].modules[0].title = 'Money Mindset';
        }

        return baseCurriculum;
    },

    getAnalytics: async (userId) => {
        try {
            // 1. Get real progress from enrollments
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('progress, course:courses(title, tags)')
                .eq('user_id', userId);

            let avgProgress = 0;
            const strengths = [];
            const weaknesses = [];

            if (enrollments && enrollments.length > 0) {
                // Average progress across all courses
                const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
                avgProgress = Math.round(totalProgress / enrollments.length);

                // Derive strengths (courses with high progress) and focus areas (low progress)
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

            // 2. Calculate real streak from lesson completions
            let streak = 0;
            const { data: completions } = await supabase
                .from('lesson_progress')
                .select('completed_at')
                .eq('user_id', userId)
                .eq('completed', true)
                .order('completed_at', { ascending: false });

            if (completions && completions.length > 0) {
                // Count consecutive days with at least one completion
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Get unique dates (as date strings)
                const uniqueDates = [...new Set(
                    completions
                        .filter(c => c.completed_at)
                        .map(c => {
                            const d = new Date(c.completed_at);
                            d.setHours(0, 0, 0, 0);
                            return d.getTime();
                        })
                )].sort((a, b) => b - a); // Most recent first

                if (uniqueDates.length > 0) {
                    const msPerDay = 86400000;
                    // Check if today or yesterday has activity (allow for timezone flexibility)
                    const mostRecent = uniqueDates[0];
                    const daysSinceLast = Math.floor((today.getTime() - mostRecent) / msPerDay);

                    if (daysSinceLast <= 1) {
                        streak = 1;
                        for (let i = 1; i < uniqueDates.length; i++) {
                            const diff = Math.round((uniqueDates[i - 1] - uniqueDates[i]) / msPerDay);
                            if (diff === 1) {
                                streak++;
                            } else {
                                break;
                            }
                        }
                    }
                }
            }

            return {
                progress: avgProgress,
                streak,
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
