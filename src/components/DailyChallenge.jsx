import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Zap, Clock, Lightbulb, RefreshCw } from 'lucide-react';
import { gamificationService } from '../services/gamification';
import { challengeGenerator } from '../services/challengeGenerator';
import { useAuth } from '../context/AuthContext';

const DailyChallenge = ({ onStartChallenge }) => {
    const { user } = useAuth();
    const isCompleted = gamificationService.isChallengeCompletedToday();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        loadChallenge();
    }, []);

    const loadChallenge = async () => {
        setLoading(true);
        try {
            const todayChallenge = await challengeGenerator.getTodayChallenge(user?.goal || '');
            setChallenge(todayChallenge);
        } catch (error) {
            console.error('Error loading challenge:', error);
            setChallenge(challengeGenerator.getFallbackChallenge());
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white mb-6"
            >
                <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading today's challenge...</span>
                </div>
            </motion.div>
        );
    }

    // Fallback if no challenge
    if (!challenge) {
        return null;
    }

    const difficultyColors = {
        Easy: 'from-green-400 to-emerald-500',
        Medium: 'from-amber-400 to-orange-500',
        Hard: 'from-red-400 to-rose-500'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${isCompleted ? 'from-gray-400 to-gray-500' : 'from-purple-500 to-indigo-600'} rounded-xl shadow-lg p-6 text-white mb-6 overflow-hidden relative`}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

            <div className="relative z-10">
                {/* Header with category */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mr-3">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{challenge.title}</h3>
                            {challenge.category && (
                                <span className="text-xs text-white/70">{challenge.category}</span>
                            )}
                        </div>
                    </div>
                    {!isCompleted && (
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Zap className="w-6 h-6 text-amber-300" />
                        </motion.div>
                    )}
                </div>

                <p className="text-white/90 mb-4">
                    {isCompleted ? "Challenge completed! Come back tomorrow for a new one." : challenge.description}
                </p>

                {/* Hint section */}
                {!isCompleted && challenge.hint && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: showHint ? 'auto' : 0, opacity: showHint ? 1 : 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/10 rounded-lg p-3 mb-4 flex items-start">
                            <Lightbulb className="w-4 h-4 text-amber-300 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-white/90">{challenge.hint}</span>
                        </div>
                    </motion.div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${difficultyColors[challenge.difficulty] || difficultyColors.Medium} text-white`}>
                            {challenge.difficulty}
                        </span>
                        <span className="text-sm font-medium">+{challenge.xp} XP</span>
                        {challenge.estimatedMinutes && (
                            <span className="flex items-center text-xs text-white/70">
                                <Clock className="w-3 h-3 mr-1" />
                                ~{challenge.estimatedMinutes} min
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Hint button */}
                        {!isCompleted && challenge.hint && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowHint(!showHint)}
                                className="px-3 py-2 rounded-lg text-sm font-medium bg-white/20 hover:bg-white/30 transition-all"
                            >
                                <Lightbulb className="w-4 h-4" />
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: isCompleted ? 1 : 1.05 }}
                            whileTap={{ scale: isCompleted ? 1 : 0.95 }}
                            onClick={() => !isCompleted && onStartChallenge && onStartChallenge(challenge)}
                            disabled={isCompleted}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${isCompleted
                                ? 'bg-white/50 text-gray-700 cursor-not-allowed'
                                : 'bg-white text-purple-600 hover:shadow-lg'
                                }`}
                        >
                            {isCompleted ? 'Completed ✓' : 'Start Challenge'}
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DailyChallenge;
