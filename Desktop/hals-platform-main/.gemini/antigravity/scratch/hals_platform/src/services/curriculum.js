import { database } from './database';
import { courseContentService } from './courseContent';
import { gamificationService } from './gamification';

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

    getAnalytics: (userId) => {
        // Compute real stats from actual user data
        const gamStats = gamificationService.getStats();
        const enrollments = userId ? database.getUserEnrollments(userId) : [];

        // Calculate real progress from enrolled courses
        let totalProgress = 0;
        let courseCount = enrollments.length;

        if (userId && courseCount > 0) {
            enrollments.forEach(enrollment => {
                const pct = courseContentService.getProgressPercentage(userId, enrollment.courseId);
                totalProgress += pct;
            });
            totalProgress = Math.round(totalProgress / courseCount);
        }

        // Determine strengths and weaknesses from enrolled course categories
        const strengths = [];
        const weaknesses = [];

        if (enrollments.length > 0) {
            const tagCounts = {};
            enrollments.forEach(enrollment => {
                if (enrollment.course && enrollment.course.tags) {
                    enrollment.course.tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                }
            });

            const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
            // Top tags are strengths (areas user is investing in)
            sortedTags.slice(0, 2).forEach(([tag]) => strengths.push(tag));

            // Suggest areas the user hasn't explored
            const allCategories = ['Problem Solving', 'Communication', 'Leadership', 'Creativity', 'Analytics'];
            const enrolled = strengths.map(s => s.toLowerCase());
            allCategories
                .filter(c => !enrolled.some(e => c.toLowerCase().includes(e)))
                .slice(0, 2)
                .forEach(cat => weaknesses.push(cat));
        } else {
            strengths.push('Getting Started');
            weaknesses.push('Enroll in a course');
        }

        return {
            progress: totalProgress,
            streak: gamStats.streak || 0,
            strengths,
            weaknesses
        };
    }
};
