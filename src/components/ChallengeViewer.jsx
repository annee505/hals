import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Clock, Lightbulb, Trophy, Sparkles } from 'lucide-react';
import { gamificationService } from '../services/gamification';

const ChallengeViewer = ({ challenge, onClose, onComplete }) => {
    const [showHint, setShowHint] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleComplete = () => {
        // Award XP and mark challenge as completed
        const result = gamificationService.completeChallenge(challenge?.xp || 50);

        setFeedback({
            xpGained: challenge?.xp || 50,
            leveledUp: result.leveledUp,
            newBadges: result.newBadges
        });
        setIsCompleted(true);

        // Notify parent
        if (onComplete) {
            onComplete(feedback);
        }
    };

    const difficultyColors = {
        Easy: 'from-green-400 to-emerald-500',
        Medium: 'from-amber-400 to-orange-500',
        Hard: 'from-red-400 to-rose-500'
    };

    if (!challenge) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-white/70">Daily Challenge</p>
                            <h2 className="text-2xl font-bold">{challenge.title}</h2>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${difficultyColors[challenge.difficulty] || difficultyColors.Medium}`}>
                            {challenge.difficulty}
                        </span>
                        <span className="flex items-center text-sm">
                            <Trophy className="w-4 h-4 mr-1" />
                            +{challenge.xp} XP
                        </span>
                        {challenge.estimatedMinutes && (
                            <span className="flex items-center text-sm text-white/80">
                                <Clock className="w-4 h-4 mr-1" />
                                ~{challenge.estimatedMinutes} min
                            </span>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {!isCompleted ? (
                        <>
                            {/* Challenge Category */}
                            {challenge.category && (
                                <p className="text-sm text-primary font-medium mb-2">{challenge.category}</p>
                            )}

                            {/* Challenge Description */}
                            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                                {challenge.description}
                            </p>

                            {/* Hint Section */}
                            {challenge.hint && (
                                <div className="mb-6">
                                    <button
                                        onClick={() => setShowHint(!showHint)}
                                        className="flex items-center text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
                                    >
                                        <Lightbulb className="w-4 h-4 mr-2" />
                                        {showHint ? 'Hide hint' : 'Need a hint?'}
                                    </button>

                                    {showHint && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4"
                                        >
                                            <p className="text-amber-800 dark:text-amber-200 text-sm">
                                                💡 {challenge.hint}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Do Later
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleComplete}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    I Did It!
                                </motion.button>
                            </div>
                        </>
                    ) : (
                        /* Completion Celebration */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-6"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <CheckCircle className="w-10 h-10 text-white" />
                            </motion.div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Challenge Complete! 🎉
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Great job pushing yourself today!
                            </p>

                            <div className="bg-gradient-to-r from-primary/10 to-indigo-600/10 rounded-lg p-4 mb-6">
                                <p className="text-primary font-semibold text-lg">+{feedback?.xpGained || challenge.xp} XP Earned!</p>
                                {feedback?.leveledUp && (
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">🎉 Level Up!</p>
                                )}
                                {feedback?.newBadges && feedback.newBadges.length > 0 && (
                                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">🏆 New Badge Unlocked!</p>
                                )}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Awesome!
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChallengeViewer;
