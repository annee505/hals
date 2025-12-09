import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Zap } from 'lucide-react';
import { gamificationService } from '../services/gamification';

const DailyChallenge = ({ onStartChallenge }) => {
    const isCompleted = gamificationService.isChallengeCompletedToday();

    const challenge = {
        title: "Problem of the Day",
        description: "Solve a real-world budgeting scenario in under 5 minutes",
        xp: 50,
        difficulty: "Medium"
    };

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
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mr-3">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">{challenge.title}</h3>
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

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${difficultyColors[challenge.difficulty]} text-white`}>
                            {challenge.difficulty}
                        </span>
                        <span className="text-sm font-medium">+{challenge.xp} XP</span>
                    </div>

                    <motion.button
                        whileHover={{ scale: isCompleted ? 1 : 1.05 }}
                        whileTap={{ scale: isCompleted ? 1 : 0.95 }}
                        onClick={() => !isCompleted && onStartChallenge && onStartChallenge()}
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
        </motion.div>
    );
};

export default DailyChallenge;
