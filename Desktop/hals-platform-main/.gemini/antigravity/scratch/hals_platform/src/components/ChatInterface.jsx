import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Sparkles } from 'lucide-react';

// Contextual AI response bank
const responseBank = {
    greeting: [
        "Hello! I'm your AI Coach. I see you're interested in learning. How can I help you get started today?",
        "Hi there! Welcome back. I'm ready to help you learn. What would you like to explore?",
        "Hey! Great to see you. Let's dive into your learning journey. What's on your mind?"
    ],
    explain: [
        "Great question! Let me break this down step by step. The core concept here is about understanding the fundamentals first, then building upon them. Think of it like building a house — you need a strong foundation before adding the walls and roof.",
        "I'd love to explain that! The key idea is to start with the basics and gradually increase complexity. Every expert was once a beginner. Focus on understanding 'why' something works, not just 'how'.",
        "Sure thing! Think of this concept as a puzzle. Each piece represents a smaller idea, and when you put them together, the bigger picture becomes clear. Let's start with the first piece..."
    ],
    example: [
        "Here's a practical example: Imagine you're organizing your bookshelf. First, you categorize books by type (the planning phase). Then you arrange them (the execution phase). Finally, you step back and see if it makes sense (the review phase). This same pattern applies to most problem-solving!",
        "Let me give you a real-world scenario: Think about how you learned to ride a bicycle. First you observed others, then practiced with training wheels, and eventually rode independently. Learning any new skill follows this same progression.",
        "Consider this example: When a chef creates a recipe, they don't just throw ingredients together. They understand how flavors interact, test small batches, and refine over time. Your learning process works the same way!"
    ],
    practice: [
        "Let's practice! Try this exercise: Take the concept we just discussed and explain it in your own words, as if you were teaching it to a friend. This 'teach-back' method is one of the most effective ways to solidify understanding.",
        "Ready for a challenge? Here's what I want you to try: Apply what you've learned to a small project. Start simple — the goal isn't perfection, it's practice. You'll learn more from doing than from reading.",
        "Time to put theory into action! Pick one concept from your recent lessons and try to use it in a real scenario. If you get stuck, that's actually great — it shows you where to focus your learning next."
    ],
    motivation: [
        "You're doing amazing! Remember, every expert was once a beginner. The fact that you're here asking questions shows real dedication. Keep pushing forward!",
        "I can see you're making great progress! Learning isn't always linear — sometimes you'll feel stuck, and that's completely normal. Those moments often precede breakthroughs.",
        "You've got this! The most important thing is consistency, not perfection. Even 15 minutes of focused learning each day adds up to incredible growth over time."
    ],
    quiz: [
        "Let's test your knowledge! Think about the core principles we've covered. Can you name three key takeaways from your recent lessons? Try to recall them without looking at your notes.",
        "Pop quiz time! What's the difference between the concepts in Module 1 and Module 2? Understanding how ideas connect is just as important as knowing them individually.",
        "Here's a quick self-check: If someone asked you what you've been learning, could you explain it in 30 seconds? That's a great test of true understanding."
    ],
    default: [
        "That's an interesting point! Let me think about the best way to approach this. In my experience, the most effective learning happens when you connect new ideas to things you already know. What aspects of this topic are you most curious about?",
        "I appreciate your curiosity! This is exactly the kind of thinking that leads to deep understanding. Let's explore this further — what specific part would you like me to clarify?",
        "Good question! There are several ways to approach this. Let me share a framework that might help: first, identify what you already know, then map out what you need to learn, and finally create a plan to fill the gaps."
    ]
};

// Determine which response category best matches the user's message
function categorizeMessage(text) {
    const lower = text.toLowerCase();

    if (/\b(explain|what is|what are|how does|how do|tell me about|define|meaning|describe)\b/.test(lower)) {
        return 'explain';
    }
    if (/\b(example|show me|demonstrate|scenario|real.?world|practical|use case)\b/.test(lower)) {
        return 'example';
    }
    if (/\b(practice|exercise|try|hands.?on|let.?s do|apply|project|build)\b/.test(lower)) {
        return 'practice';
    }
    if (/\b(quiz|test|check|assess|evaluate|score|question me)\b/.test(lower)) {
        return 'quiz';
    }
    if (/\b(thank|thanks|great|awesome|cool|good|nice|helpful|stuck|hard|difficult|can.?t|struggling)\b/.test(lower)) {
        return 'motivation';
    }
    if (/\b(hi|hello|hey|start|begin|how do i start)\b/.test(lower)) {
        return 'greeting';
    }
    return 'default';
}

function getAIResponse(userMessage) {
    const category = categorizeMessage(userMessage);
    const responses = responseBank[category];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Suggested replies based on response category
const suggestedRepliesMap = {
    greeting: ["How do I start?", "Quiz me on this topic", "Explain in simple terms"],
    explain: ["Give me an example", "Let's practice", "Tell me more"],
    example: ["Let's practice this", "Explain the theory", "Another example?"],
    practice: ["How did I do?", "Give me more practice", "Explain the concept"],
    motivation: ["Let's keep going!", "Quiz me", "What should I learn next?"],
    quiz: ["Explain the answer", "More questions!", "Let's practice"],
    default: ["Tell me more", "Give me an example", "Let's practice"]
};

const ChatInterface = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: responseBank.greeting[Math.floor(Math.random() * responseBank.greeting.length)] }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [suggestedReplies, setSuggestedReplies] = useState([
        "How do I start?",
        "Quiz me on this topic",
        "Explain in simple terms"
    ]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (textToSend) => {
        const messageText = textToSend || input;
        if (!messageText.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);
        setSuggestedReplies([]);

        // Generate contextual AI response
        const aiResponseText = getAIResponse(messageText);
        const category = categorizeMessage(messageText);

        setTimeout(() => {
            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: aiResponseText
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsThinking(false);
            setSuggestedReplies(suggestedRepliesMap[category] || suggestedRepliesMap.default);
        }, 1000 + Math.random() * 1000); // Vary response time 1-2s
    };

    const messageVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-indigo-600 p-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mr-3"
                        >
                            <Bot className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-white">AI Learning Coach</h3>
                            <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-xs text-white/90 flex items-center"
                            >
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                Online
                            </motion.span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                    <AnimatePresence>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={msg.id}
                                variants={messageVariants}
                                initial="hidden"
                                animate="visible"
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user'
                                    ? 'bg-gradient-to-r from-primary to-indigo-600 text-white rounded-tr-none shadow-lg'
                                    : 'bg-white text-gray-800 shadow-md rounded-tl-none border border-gray-100'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isThinking && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 rounded-tl-none">
                                <div className="flex space-x-2">
                                    <motion.div
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                        className="w-2 h-2 bg-primary rounded-full"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                        className="w-2 h-2 bg-primary rounded-full"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                        className="w-2 h-2 bg-primary rounded-full"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Suggested Replies */}
                    {suggestedReplies.length > 0 && !isThinking && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-wrap gap-2"
                        >
                            {suggestedReplies.map((reply, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSend(reply)}
                                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/20 flex items-center"
                                >
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {reply}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask your coach anything..."
                            className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className="bg-gradient-to-r from-primary to-indigo-600 text-white p-3 rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChatInterface;
