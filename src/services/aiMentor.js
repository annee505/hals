import Groq from 'groq-sdk';
import { searchKnowledge, formatKnowledgeContext } from '../data/knowledgeBase';
import { aiKnowledgeService } from './aiKnowledge';
import { tryOpenRouter } from './aiCourseGenerator';

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

// Models to try in order of preference (keep in sync with aiCourseGenerator.js)
const MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'gemma2-9b-it'
];

// Mentor prompt template with RAG context
const MENTOR_PROMPT = `You are an intelligent, friendly AI mentor for the HALS learning platform.

User profile:
{user_profile}

Relevant Knowledge Base:
{knowledge_context}

Your Uploaded Materials:
{user_files_context}

Conversation history:
{history}

User message:
{user_input}

Instructions:
- Use the knowledge base content above to provide accurate, specific guidance.
- If the knowledge base has relevant roadmaps or tutorials, reference and summarize them.
- If the information is sufficient, generate a clear, step-by-step learning roadmap or helpful answer.
- If not sufficient, ask smart follow-up questions to understand the user better.
- Be human-like, encouraging, and structured.
- Use markdown formatting for clarity.
- Keep responses focused and actionable.
- Reference the user's learning goals and level when relevant.`;

// Build user profile string from user data
function buildUserProfile(user) {
    if (!user) {
        return "Purpose: learning\nWeekly study time: flexible\nCurrent level: beginner";
    }

    const parts = [];
    if (user.goal) parts.push(`Learning goal: ${user.goal}`);
    if (user.learning_style) parts.push(`Learning style: ${user.learning_style}`);
    if (user.hobbies) parts.push(`Interests: ${user.hobbies}`);
    parts.push(`Current level: ${user.level || 'beginner'}`);

    return parts.join('\n') || "Purpose: learning\nCurrent level: beginner";
}

// Format conversation history for context
function formatHistory(messages) {
    if (!messages || messages.length === 0) return "No previous messages.";

    // Take last 10 messages for context
    const recent = messages.slice(-10);
    return recent.map(msg =>
        `${msg.sender === 'user' ? 'User' : 'AI Mentor'}: ${msg.text}`
    ).join('\n');
}

export const aiMentor = {
    /**
     * Send a message to the AI mentor and get a response
     * @param {string} userMessage - The user's message
     * @param {Array} conversationHistory - Previous messages in the conversation
     * @param {Object} userProfile - The user's profile data
     * @returns {Promise<string>} - The AI mentor's response
     */
    chat: async (userMessage, conversationHistory = [], userProfile = null) => {
        if (!groqApiKey) {
            throw new Error('Groq API key not configured');
        }

        const groq = new Groq({
            apiKey: groqApiKey,
            dangerouslyAllowBrowser: true
        });

        // Search knowledge base for relevant context
        const knowledgeResults = searchKnowledge(userMessage, 3);
        const knowledgeContext = formatKnowledgeContext(knowledgeResults) || 'No specific knowledge base content found for this query.';

        // Search user's uploaded files for additional context
        const userId = userProfile?.id;
        const userFilesResults = userId ? aiKnowledgeService.searchUserFiles(userId, userMessage, 2) : [];
        const userFilesContext = aiKnowledgeService.formatUserFilesContext(userFilesResults) || 'No uploaded materials available.';

        // Build the prompt with knowledge context
        const prompt = MENTOR_PROMPT
            .replace('{user_profile}', buildUserProfile(userProfile))
            .replace('{knowledge_context}', knowledgeContext)
            .replace('{user_files_context}', userFilesContext)
            .replace('{history}', formatHistory(conversationHistory))
            .replace('{user_input}', userMessage);

        // Try each model until one works
        for (const model of MODELS) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful AI learning mentor. Be encouraging, clear, and structured in your responses. Use markdown formatting."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    model: model,
                    temperature: 0.4,
                    max_tokens: 1024
                });

                const response = completion.choices[0]?.message?.content;
                if (response) {
                    return response;
                }
            } catch (error) {
                console.warn(`AI Mentor: ${model} failed:`, error.message);
                // Continue to next model
            }
        }

        // All Groq models failed — try OpenRouter as fallback
        console.warn('AI Mentor: All Groq models failed, trying OpenRouter...');
        const orResponse = await tryOpenRouter(prompt);
        if (orResponse) return orResponse;

        // All providers failed
        throw new Error('AI mentor is currently unavailable. Please try again later.');
    },

    /**
     * Generate suggested replies based on context
     * @param {string} lastAiMessage - The last message from the AI
     * @returns {Array<string>} - Array of suggested replies
     */
    getSuggestedReplies: (lastAiMessage) => {
        // Simple keyword-based suggestions
        const lowered = (lastAiMessage || '').toLowerCase();

        if (lowered.includes('what') || lowered.includes('tell me more')) {
            return [
                "I'm a complete beginner",
                "I have some experience",
                "I have a specific project in mind"
            ];
        }

        if (lowered.includes('roadmap') || lowered.includes('plan')) {
            return [
                "What should I learn first?",
                "How long will this take?",
                "Can you break this down more?"
            ];
        }

        if (lowered.includes('question') || lowered.includes('quiz')) {
            return [
                "Quiz me on this topic",
                "Give me an example",
                "Explain in simpler terms"
            ];
        }

        // Default suggestions
        return [
            "Tell me more",
            "Give me an example",
            "What's the next step?"
        ];
    }
};
