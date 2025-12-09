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

    getAnalytics: () => {
        return {
            progress: 35,
            streak: 3,
            weaknesses: ['Abstract Reasoning'],
            strengths: ['Pattern Recognition']
        };
    }
};
