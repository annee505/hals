import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Sparkles } from 'lucide-react';

const ChatInterface = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Hello! I'm your AI Coach. I see you're interested in learning. How can I help you get started today?" }
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

        // Mock AI response delay
        setTimeout(() => {
            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "That's a great question. Let's break it down using the P-P-A-R cycle. First, let's perceive the core concept..."
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsThinking(false);
            setSuggestedReplies([
                "Tell me more",
                "Give me an example",
                "Let's practice"
            ]);
        }, 1500);
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
