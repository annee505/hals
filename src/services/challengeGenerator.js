import Groq from 'groq-sdk';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

// Cache challenge for the day to avoid regenerating
const CACHE_KEY = 'hals_daily_challenge';

// Challenge categories for variety
const CATEGORIES = [
    'Problem Solving',
    'Critical Thinking',
    'Creative Thinking',
    'Logic Puzzle',
    'Brain Teaser',
    'Mindfulness',
    'Memory Challenge',
    'Pattern Recognition'
];

export const challengeGenerator = {
    /**
     * Get today's challenge - either from cache or generate new
     */
    getTodayChallenge: async (userGoal = '') => {
        try {
            // Check cache first
            const cached = challengeGenerator.getCachedChallenge();
            if (cached) {
                return cached;
            }

            // Generate new challenge
            const challenge = await challengeGenerator.generateChallenge(userGoal);

            // Cache it for today
            challengeGenerator.cacheChallenge(challenge);

            return challenge;
        } catch (error) {
            console.error('Error getting daily challenge:', error);
            // Return fallback challenge
            return challengeGenerator.getFallbackChallenge();
        }
    },

    /**
     * Generate a new AI challenge
     */
    generateChallenge: async (userGoal = '') => {
        if (!apiKey) {
            console.warn('No Groq API key, using fallback challenge');
            return challengeGenerator.getFallbackChallenge();
        }

        try {
            const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

            // Pick a random category
            const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

            const prompt = `Generate a unique, engaging daily challenge for ${today}.
Category: ${category}
${userGoal ? `User's learning goal: ${userGoal}` : ''}

The challenge should be:
- Completable in 3-7 minutes
- Intellectually stimulating but fun
- Clear instructions
- Educational value

IMPORTANT: Respond ONLY with valid JSON:
{
    "title": "Short catchy title (max 5 words)",
    "description": "Clear, engaging description of what to do (1-2 sentences)",
    "category": "${category}",
    "difficulty": "Easy" or "Medium" or "Hard",
    "xp": number between 30-100 based on difficulty,
    "hint": "Optional helpful hint",
    "estimatedMinutes": number between 3-7
}`;

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.8,
                response_format: { type: "json_object" }
            });

            const responseText = completion.choices[0]?.message?.content || "{}";
            const challenge = JSON.parse(responseText);

            // Ensure required fields
            return {
                title: challenge.title || "Daily Brain Boost",
                description: challenge.description || "Challenge your mind with today's puzzle!",
                category: challenge.category || category,
                difficulty: challenge.difficulty || "Medium",
                xp: challenge.xp || 50,
                hint: challenge.hint || null,
                estimatedMinutes: challenge.estimatedMinutes || 5,
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating challenge:', error);
            return challengeGenerator.getFallbackChallenge();
        }
    },

    /**
     * Get cached challenge if still valid for today
     */
    getCachedChallenge: () => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const data = JSON.parse(cached);
            const today = new Date().toISOString().split('T')[0];

            // Check if challenge is from today
            if (data.date === today && data.challenge) {
                return data.challenge;
            }
            return null;
        } catch {
            return null;
        }
    },

    /**
     * Cache challenge for today
     */
    cacheChallenge: (challenge) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                date: today,
                challenge
            }));
        } catch (error) {
            console.error('Error caching challenge:', error);
        }
    },

    /**
     * Clear cached challenge (for testing)
     */
    clearCache: () => {
        localStorage.removeItem(CACHE_KEY);
    },

    /**
     * Fallback challenge if AI fails
     */
    getFallbackChallenge: () => {
        const fallbacks = [
            {
                title: "Memory Matrix",
                description: "Close your eyes and try to recall 5 things you learned yesterday. Write them down without looking at any notes.",
                category: "Memory Challenge",
                difficulty: "Medium",
                xp: 50,
                estimatedMinutes: 5
            },
            {
                title: "Reverse Engineering",
                description: "Pick any app or website you use daily. Spend 5 minutes thinking about how you would build one key feature.",
                category: "Problem Solving",
                difficulty: "Medium",
                xp: 60,
                estimatedMinutes: 5
            },
            {
                title: "Pattern Spotter",
                description: "Look around your environment. Find and document 3 patterns you've never noticed before.",
                category: "Pattern Recognition",
                difficulty: "Easy",
                xp: 40,
                estimatedMinutes: 4
            },
            {
                title: "5-Minute Teach",
                description: "Explain one concept you recently learned as if teaching a 10-year-old. Use simple words only!",
                category: "Creative Thinking",
                difficulty: "Medium",
                xp: 55,
                estimatedMinutes: 5
            },
            {
                title: "Logic Ladder",
                description: "Write down a problem you're facing. List 3 possible solutions, then find at least one pro and con for each.",
                category: "Critical Thinking",
                difficulty: "Hard",
                xp: 70,
                estimatedMinutes: 7
            }
        ];

        // Use day of year to pick a consistent fallback for today
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        return fallbacks[dayOfYear % fallbacks.length];
    }
};
