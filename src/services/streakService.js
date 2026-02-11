import { supabase } from './supabase-config';

const STREAK_CACHE_KEY = 'hals_streak_cache';
const DAILY_GOAL_KEY = 'hals_daily_goal';

// Default daily goal: 3 lessons per day
const DEFAULT_DAILY_GOAL = 3;

function getTodayStr() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getDateStr(date) {
    return new Date(date).toISOString().split('T')[0];
}

function getCachedStreak() {
    try {
        const saved = localStorage.getItem(STREAK_CACHE_KEY);
        if (!saved) return null;
        const data = JSON.parse(saved);
        // Only valid if cached today
        if (data.date === getTodayStr()) return data;
    } catch (e) { /* ignore */ }
    return null;
}

function cacheStreak(data) {
    try {
        localStorage.setItem(STREAK_CACHE_KEY, JSON.stringify({ ...data, date: getTodayStr() }));
    } catch (e) { /* ignore */ }
}

export const streakService = {
    /**
     * Compute the user's current streak and today's progress.
     * Returns { currentStreak, longestStreak, todayCompleted, dailyGoal, streakDays }
     */
    getStreakData: async (userId) => {
        // Check cache first
        const cached = getCachedStreak();
        if (cached && cached.userId === userId) return cached;

        try {
            // Fetch all completion timestamps
            const { data: completions, error } = await supabase
                .from('lesson_progress')
                .select('completed_at')
                .eq('user_id', userId)
                .eq('completed', true)
                .not('completed_at', 'is', null)
                .order('completed_at', { ascending: false });

            if (error) throw error;

            if (!completions || completions.length === 0) {
                const result = {
                    userId,
                    currentStreak: 0,
                    longestStreak: 0,
                    todayCompleted: 0,
                    dailyGoal: streakService.getDailyGoal(),
                    streakDays: [],
                    totalLessonsCompleted: 0
                };
                cacheStreak(result);
                return result;
            }

            // Group completions by day
            const dayMap = {};
            completions.forEach(c => {
                const day = getDateStr(c.completed_at);
                dayMap[day] = (dayMap[day] || 0) + 1;
            });

            const today = getTodayStr();
            const todayCompleted = dayMap[today] || 0;

            // Get sorted unique days (descending)
            const uniqueDays = Object.keys(dayMap).sort().reverse();

            // Calculate current streak (consecutive days ending today or yesterday)
            let currentStreak = 0;
            const checkDate = new Date();

            // If no activity today, start checking from yesterday
            if (!dayMap[today]) {
                checkDate.setDate(checkDate.getDate() - 1);
            }

            while (true) {
                const dayStr = getDateStr(checkDate);
                if (dayMap[dayStr]) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }

            // Calculate longest streak
            let longestStreak = 0;
            let tempStreak = 1;

            const sortedDays = [...uniqueDays].sort(); // ascending
            for (let i = 1; i < sortedDays.length; i++) {
                const prev = new Date(sortedDays[i - 1]);
                const curr = new Date(sortedDays[i]);
                const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);

            // Last 7 days for the mini calendar
            const streakDays = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dStr = getDateStr(d);
                streakDays.push({
                    date: dStr,
                    dayLabel: d.toLocaleDateString('en', { weekday: 'short' }).charAt(0),
                    completed: dayMap[dStr] || 0,
                    isToday: dStr === today
                });
            }

            const result = {
                userId,
                currentStreak,
                longestStreak,
                todayCompleted,
                dailyGoal: streakService.getDailyGoal(),
                streakDays,
                totalLessonsCompleted: completions.length
            };

            cacheStreak(result);
            return result;
        } catch (error) {
            console.error('Error computing streak:', error);
            return {
                userId,
                currentStreak: 0,
                longestStreak: 0,
                todayCompleted: 0,
                dailyGoal: streakService.getDailyGoal(),
                streakDays: [],
                totalLessonsCompleted: 0
            };
        }
    },

    getDailyGoal: () => {
        try {
            const saved = localStorage.getItem(DAILY_GOAL_KEY);
            return saved ? parseInt(saved, 10) : DEFAULT_DAILY_GOAL;
        } catch (e) {
            return DEFAULT_DAILY_GOAL;
        }
    },

    setDailyGoal: (goal) => {
        localStorage.setItem(DAILY_GOAL_KEY, goal.toString());
        // Invalidate cache
        localStorage.removeItem(STREAK_CACHE_KEY);
    },

    // Call this after completing a lesson to invalidate the cache
    invalidateCache: () => {
        localStorage.removeItem(STREAK_CACHE_KEY);
    }
};
