import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { gamificationService } from '../services/gamification';

const Assessment = ({ topic, onClose, onComplete }) => {
    const [step, setStep] = useState('question');
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const question = {
        text: `Based on your interest in ${topic}, what is the most important first step?`,
        options: [
            { id: 'a', text: 'Define the problem clearly' },
            { id: 'b', text: 'Jump straight to coding' },
            { id: 'c', text: 'Ask for the solution' }
        ],
        correctId: 'a',
        explanation: "Defining the problem is crucial before attempting any solution."
    };

    const handleSubmit = () => {
        if (!selectedAnswer) return;

        const isCorrect = selectedAnswer === question.correctId;

        // Award XP for completing quiz
        const result = gamificationService.completeQuiz(25);

        setFeedback({
            isCorrect,
            text: isCorrect ? "Excellent! That's correct." : "Not quite. Let's review.",
            xpGained: 25,
            leveledUp: result.leveledUp,
            newBadges: result.newBadges
        });
        setStep('result');
    };

    const handleClose = () => {
        if (feedback && onComplete) {
            onComplete(feedback);
        }
        onClose();
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3 }
        }
    };

    const optionVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.1 }
        })
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                }}
            >
                {step === 'question' && (
                    <>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mr-3">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Check: {topic}</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">{question.text}</p>

                        <div className="space-y-3 mb-6">
                            {question.options.map((option, i) => (
                                <motion.button
                                    key={option.id}
                                    custom={i}
                                    variants={optionVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedAnswer(option.id)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAnswer === option.id
                                            ? 'border-primary bg-gradient-to-r from-primary/10 to-indigo-500/10 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 bg-white/50 dark:bg-gray-700/50'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedAnswer === option.id ? 'border-primary bg-primary' : 'border-gray-300'
                                            }`}>
                                            {selectedAnswer === option.id && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-2 h-2 bg-white rounded-full"
                                                />
                                            )}
                                        </div>
                                        <span className="font-medium dark:text-white">{option.text}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 transition-colors"
                            >
                                Skip
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubmit}
                                disabled={!selectedAnswer}
                                className="px-6 py-2 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Submit Answer
                            </motion.button>
                        </div>
                    </>
                )}

                {step === 'result' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-6"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${feedback.isCorrect
                                    ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                    : 'bg-gradient-to-br from-red-400 to-rose-500'
                                }`}
                        >
                            {feedback.isCorrect ? (
                                <Check className="w-10 h-10 text-white" />
                            ) : (
                                <X className="w-10 h-10 text-white" />
                            )}
                        </motion.div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {feedback.text}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{question.explanation}</p>

                        <div className="bg-gradient-to-r from-primary/10 to-indigo-600/10 rounded-lg p-4 mb-4">
                            <p className="text-primary font-semibold">+{feedback.xpGained} XP Earned!</p>
                            {feedback.leveledUp && (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">🎉 Level Up!</p>
                            )}
                            {feedback.newBadges && feedback.newBadges.length > 0 && (
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">🏆 New Badge Unlocked!</p>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleClose}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                        >
                            Continue Learning
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Assessment;
