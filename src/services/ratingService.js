const RATING_KEY = 'hals_ratings';

function getAll() {
    try {
        const saved = localStorage.getItem(RATING_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        return {};
    }
}

function saveAll(ratings) {
    localStorage.setItem(RATING_KEY, JSON.stringify(ratings));
}

function makeKey(userId, courseId) {
    return `${userId}_${courseId}`;
}

export const ratingService = {
    // Get user's rating for a course
    getRating: (userId, courseId) => {
        const all = getAll();
        const key = makeKey(userId, courseId);
        return all[key] || null; // { stars: 1-5, review: "text", createdAt }
    },

    // Set or update rating
    setRating: (userId, courseId, stars, review = '') => {
        const all = getAll();
        const key = makeKey(userId, courseId);
        all[key] = {
            stars: Math.max(1, Math.min(5, Math.round(stars))),
            review: review.trim(),
            createdAt: all[key]?.createdAt || Date.now(),
            updatedAt: Date.now()
        };
        saveAll(all);
        return all[key];
    },

    // Remove rating
    removeRating: (userId, courseId) => {
        const all = getAll();
        const key = makeKey(userId, courseId);
        delete all[key];
        saveAll(all);
    },

    // Get average rating across all users (localStorage = single user, but future-proof)
    getAverageRating: (courseId) => {
        const all = getAll();
        const ratings = Object.entries(all)
            .filter(([key]) => key.endsWith(`_${courseId}`))
            .map(([, val]) => val.stars);

        if (ratings.length === 0) return null;
        return {
            average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
            count: ratings.length
        };
    }
};
