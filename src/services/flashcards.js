import { supabase } from './supabase-config';
import Groq from 'groq-sdk';

const FLASHCARD_KEY = 'hals_flashcards';
const FLASHCARD_DECK_KEY = 'hals_flashcard_decks';
const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

// Cache generated decks in localStorage so we don't regenerate every time
function getCachedDeck(courseId) {
    try {
        const saved = localStorage.getItem(FLASHCARD_DECK_KEY);
        const decks = saved ? JSON.parse(saved) : {};
        const entry = decks[courseId];
        // Cache for 24 hours
        if (entry && (Date.now() - entry.ts < 24 * 60 * 60 * 1000)) {
            return entry.deck;
        }
    } catch (e) { /* ignore */ }
    return null;
}

function saveDeckToCache(courseId, deck) {
    try {
        const saved = localStorage.getItem(FLASHCARD_DECK_KEY);
        const decks = saved ? JSON.parse(saved) : {};
        decks[courseId] = { deck, ts: Date.now() };
        localStorage.setItem(FLASHCARD_DECK_KEY, JSON.stringify(decks));
    } catch (e) { /* ignore */ }
}

// Generate flashcards from lesson content using AI
async function generateFlashcardsFromContent(courseTitle, lessonContents) {
    if (!groqApiKey) return null;

    const contentSummary = lessonContents
        .slice(0, 5) // Use up to 5 lessons to keep prompt size down
        .map(l => `## ${l.title}\n${(l.content || '').substring(0, 500)}`)
        .join('\n\n');

    const prompt = `Based on this course "${courseTitle}" with the following lesson content, generate exactly 8 flashcards for studying.

${contentSummary}

Return ONLY a valid JSON array of objects with "front" (question) and "back" (answer) properties. Keep answers concise (1-2 sentences max). Make questions specific to the actual course content, not generic.

Example format:
[{"front": "What is X?", "back": "X is..."}]`;

    try {
        const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 1500
        });

        const text = response.choices[0]?.message?.content || '';
        // Extract JSON array from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const cards = JSON.parse(jsonMatch[0]);
            return cards.map((card, i) => ({
                id: `ai-card-${i + 1}`,
                front: card.front,
                back: card.back
            }));
        }
    } catch (error) {
        console.error('Error generating flashcards:', error);
    }
    return null;
}

// Extract flashcards from existing lesson content (no AI needed)
function extractFlashcardsFromContent(courseTitle, lessonContents) {
    const cards = [];
    let cardId = 1;

    for (const lesson of lessonContents) {
        if (!lesson.content) continue;

        // Extract key takeaways section
        const takeawayMatch = lesson.content.match(/## Key Takeaways\s*\n([\s\S]*?)(?=\n## |\n---|\n$)/i);
        if (takeawayMatch) {
            const bullets = takeawayMatch[1].match(/[-*] (.+)/g);
            if (bullets) {
                for (const bullet of bullets.slice(0, 2)) { // Max 2 cards per lesson
                    const text = bullet.replace(/^[-*] /, '').trim();
                    if (text.length > 10) {
                        cards.push({
                            id: `ext-card-${cardId++}`,
                            front: `What is a key concept from "${lesson.title}"?`,
                            back: text
                        });
                    }
                }
            }
        }

        // Extract learning objectives
        const objectiveMatch = lesson.content.match(/## Learning Objectives\s*\n([\s\S]*?)(?=\n## |\n---|\n$)/i);
        if (objectiveMatch) {
            const bullets = objectiveMatch[1].match(/[-*] (.+)/g);
            if (bullets && bullets.length > 0) {
                const text = bullets[0].replace(/^[-*] /, '').trim();
                cards.push({
                    id: `ext-card-${cardId++}`,
                    front: `Learning objective for "${lesson.title}"?`,
                    back: text
                });
            }
        }

        if (cards.length >= 8) break; // Cap at 8 cards
    }

    return cards.length > 0 ? cards : null;
}

export const flashcardService = {
    getDeck: async (courseId) => {
        // Check cache first
        const cached = getCachedDeck(courseId);
        if (cached) return cached;

        try {
            // Fetch course title and lesson content from Supabase
            const { data: course } = await supabase
                .from('courses')
                .select('title')
                .eq('id', courseId)
                .single();

            const { data: modules } = await supabase
                .from('modules')
                .select('id, lessons(id, title, content)')
                .eq('course_id', courseId)
                .order('order_index', { ascending: true });

            const lessonContents = modules
                ?.flatMap(m => m.lessons || [])
                .filter(l => l.content) || [];

            if (lessonContents.length === 0) {
                return { title: `${course?.title || 'Course'} Flashcards`, cards: [] };
            }

            const courseTitle = course?.title || 'Course';

            // Try AI generation first, then content extraction as fallback
            let cards = await generateFlashcardsFromContent(courseTitle, lessonContents);
            if (!cards) {
                cards = extractFlashcardsFromContent(courseTitle, lessonContents);
            }
            if (!cards) {
                // Last resort fallback — generate basic cards from lesson titles
                cards = lessonContents.slice(0, 6).map((l, i) => ({
                    id: `basic-card-${i + 1}`,
                    front: `What are the key concepts of "${l.title}"?`,
                    back: (l.content || '').substring(0, 200).replace(/[#*`]/g, '').trim() + '...'
                }));
            }

            const deck = { title: `${courseTitle} Flashcards`, cards };
            saveDeckToCache(courseId, deck);
            return deck;
        } catch (error) {
            console.error('Error loading flashcard deck:', error);
            return { title: 'Flashcards', cards: [] };
        }
    },

    getProgress: (userId, courseId) => {
        const saved = localStorage.getItem(FLASHCARD_KEY);
        const allProgress = saved ? JSON.parse(saved) : {};
        return allProgress[`${userId}-${courseId}`] || { masteredCards: [], studyingCards: [] };
    },

    markCardMastered: (userId, courseId, cardId) => {
        const saved = localStorage.getItem(FLASHCARD_KEY);
        const allProgress = saved ? JSON.parse(saved) : {};
        const key = `${userId}-${courseId}`;

        if (!allProgress[key]) {
            allProgress[key] = { masteredCards: [], studyingCards: [] };
        }

        if (!allProgress[key].masteredCards.includes(cardId)) {
            allProgress[key].masteredCards.push(cardId);
            allProgress[key].studyingCards = allProgress[key].studyingCards.filter(id => id !== cardId);
        }

        localStorage.setItem(FLASHCARD_KEY, JSON.stringify(allProgress));
        return allProgress[key];
    },

    markCardStudying: (userId, courseId, cardId) => {
        const saved = localStorage.getItem(FLASHCARD_KEY);
        const allProgress = saved ? JSON.parse(saved) : {};
        const key = `${userId}-${courseId}`;

        if (!allProgress[key]) {
            allProgress[key] = { masteredCards: [], studyingCards: [] };
        }

        if (!allProgress[key].studyingCards.includes(cardId) && !allProgress[key].masteredCards.includes(cardId)) {
            allProgress[key].studyingCards.push(cardId);
        }

        localStorage.setItem(FLASHCARD_KEY, JSON.stringify(allProgress));
        return allProgress[key];
    }
};
