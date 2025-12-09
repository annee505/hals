const GAMIFICATION_KEY = 'hals_gamification';

export const gamificationService = {
    getStats: () => {
        const saved = localStorage.getItem(GAMIFICATION_KEY);
        if (saved) {
            return JSON.parse(saved);
        }

        // Default stats
        return {
            xp: 0,
            level: 1,
            badges: [],
            streak: 0,
            lastActive: new Date().toISOString(),
            quizzesCompleted: 0,
            lastChallengeDate: null
        };
    },

    addXP: (amount) => {
        const stats = gamificationService.getStats();
        stats.xp += amount;

        // Level up logic (every 100 XP = 1 level)
        const newLevel = Math.floor(stats.xp / 100) + 1;
        const leveledUp = newLevel > stats.level;
        stats.level = newLevel;

        localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(stats));
        return { stats, leveledUp };
    },

    addBadge: (badge) => {
        const stats = gamificationService.getStats();
        if (!stats.badges.find(b => b.id === badge.id)) {
            stats.badges.push(badge);
            localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(stats));
        }
        return stats;
    },

    updateStreak: () => {
        const stats = gamificationService.getStats();
        const lastActive = new Date(stats.lastActive);
        const now = new Date();
        const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            // Same day, no change
            return stats;
        } else if (daysDiff === 1) {
            // Next day, increment streak
            stats.streak += 1;
        } else {
            // Streak broken
            stats.streak = 1;
        }

        stats.lastActive = now.toISOString();
        localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(stats));
        return stats;
    },

    getBadges: () => [
        { id: 'first_step', name: 'First Step', description: 'Complete your first lesson', icon: '🎯', unlocked: false },
        { id: 'streak_3', name: '3-Day Streak', description: 'Learn for 3 days in a row', icon: '🔥', unlocked: false },
        { id: 'quiz_master', name: 'Quiz Master', description: 'Complete 5 quizzes', icon: '🏆', unlocked: false },
        { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: '⭐', unlocked: false }
    ],

    completeQuiz: (quizXP = 25) => {
        const result = gamificationService.addXP(quizXP);

        // Track quiz completion
        const stats = result.stats;
        stats.quizzesCompleted = (stats.quizzesCompleted || 0) + 1;
        localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(stats));

        // Check for badge unlocks
        const newBadges = gamificationService.checkBadgeUnlocks(stats);

        return { ...result, newBadges };
    },

    completeChallenge: (challengeXP = 50) => {
        const result = gamificationService.addXP(challengeXP);

        // Mark challenge as completed for today
        const stats = result.stats;
        stats.lastChallengeDate = new Date().toISOString().split('T')[0];
        localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(stats));

        return result;
    },

    checkBadgeUnlocks: (stats) => {
        const newBadges = [];

        // Check first step
        if ((stats.quizzesCompleted || 0) >= 1) {
            const badge = { id: 'first_step', name: 'First Step', description: 'Complete your first lesson', icon: '🎯' };
            if (!stats.badges.find(b => b.id === badge.id)) {
                gamificationService.addBadge(badge);
                newBadges.push(badge);
            }
        }

        // Check streak
        if (stats.streak >= 3) {
            const badge = { id: 'streak_3', name: '3-Day Streak', description: 'Learn for 3 days in a row', icon: '🔥' };
            if (!stats.badges.find(b => b.id === badge.id)) {
                gamificationService.addBadge(badge);
                newBadges.push(badge);
            }
        }

        // Check quiz master
        if ((stats.quizzesCompleted || 0) >= 5) {
            const badge = { id: 'quiz_master', name: 'Quiz Master', description: 'Complete 5 quizzes', icon: '🏆' };
            if (!stats.badges.find(b => b.id === badge.id)) {
                gamificationService.addBadge(badge);
                newBadges.push(badge);
            }
        }

        // Check level 5
        if (stats.level >= 5) {
            const badge = { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: '⭐' };
            if (!stats.badges.find(b => b.id === badge.id)) {
                gamificationService.addBadge(badge);
                newBadges.push(badge);
            }
        }

        return newBadges;
    },

    isChallengeCompletedToday: () => {
        const stats = gamificationService.getStats();
        const today = new Date().toISOString().split('T')[0];
        return stats.lastChallengeDate === today;
    }
};
