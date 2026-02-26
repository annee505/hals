import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award } from 'lucide-react';

const GamificationPanel = ({ stats, badges }) => {
    const xpToNextLevel = ((stats.level * 100) - stats.xp);
    const progressPercent = ((stats.xp % 100) / 100) * 100;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 text-amber-500 mr-2" />
                Your Progress
            </h3>

            {/* Level & XP */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-lg">{stats.level}</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Level {stats.level}</p>
                            <p className="text-xs text-gray-500">{stats.xp} XP</p>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500">{xpToNextLevel} XP to Level {stats.level + 1}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-indigo-600"
                    />
                </div>
            </div>

            {/* Badges */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    Badges
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    {badges.map((badge, i) => {
                        const isUnlocked = stats.badges.some(b => b.id === badge.id);
                        return (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-3 rounded-lg border-2 transition-all ${isUnlocked
                                        ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50'
                                        : 'border-gray-200 bg-gray-50 opacity-50'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-1">{badge.icon}</div>
                                    <p className={`text-xs font-medium ${isUnlocked ? 'text-amber-700' : 'text-gray-500'}`}>
                                        {badge.name}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GamificationPanel;
