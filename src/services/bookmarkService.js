const BOOKMARK_KEY = 'hals_bookmarks';

function getAll() {
    try {
        const saved = localStorage.getItem(BOOKMARK_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        return {};
    }
}

function saveAll(bookmarks) {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
}

function makeKey(userId, courseId) {
    return `${userId}_${courseId}`;
}

export const bookmarkService = {
    // Check if a lesson is bookmarked
    isBookmarked: (userId, courseId, lessonId) => {
        const all = getAll();
        const key = makeKey(userId, courseId);
        return (all[key] || []).some(b => b.lessonId === lessonId);
    },

    // Toggle bookmark on/off — returns new state
    toggleBookmark: (userId, courseId, lessonId, lessonTitle = '') => {
        const all = getAll();
        const key = makeKey(userId, courseId);
        if (!all[key]) all[key] = [];

        const idx = all[key].findIndex(b => b.lessonId === lessonId);
        if (idx >= 0) {
            // Remove bookmark
            all[key].splice(idx, 1);
            if (all[key].length === 0) delete all[key];
            saveAll(all);
            return false; // no longer bookmarked
        } else {
            // Add bookmark
            all[key].push({
                lessonId,
                lessonTitle,
                createdAt: Date.now()
            });
            saveAll(all);
            return true; // now bookmarked
        }
    },

    // Get all bookmarks for a course
    getBookmarksForCourse: (userId, courseId) => {
        const all = getAll();
        const key = makeKey(userId, courseId);
        return (all[key] || []).sort((a, b) => b.createdAt - a.createdAt);
    },

    // Count bookmarks for a course
    getBookmarkCount: (userId, courseId) => {
        const all = getAll();
        const key = makeKey(userId, courseId);
        return (all[key] || []).length;
    }
};
