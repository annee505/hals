import React, { useState } from 'react';
import { Flame, Target, Trophy, Settings, X } from 'lucide-react';
import { streakService } from '../services/streakService';

const StreakDisplay = ({ streakData, onGoalChange }) => {
    const [showSettings, setShowSettings] = useState(false);
    const [newGoal, setNewGoal] = useState(streakData?.dailyGoal || 3);

    if (!streakData) return null;

    const { currentStreak, longestStreak, todayCompleted, dailyGoal, streakDays, totalLessonsCompleted } = streakData;
    const goalProgress = Math.min((todayCompleted / dailyGoal) * 100, 100);
    const goalMet = todayCompleted >= dailyGoal;

    const handleSaveGoal = () => {
        streakService.setDailyGoal(newGoal);
        setShowSettings(false);
        if (onGoalChange) onGoalChange(newGoal);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                    Study Streak
                </h3>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    {showSettings ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                </button>
            </div>

            {/* Goal Settings */}
            {showSettings && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Daily Goal (lessons per day)
                    </label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 5, 7].map(g => (
                            <button
                                key={g}
                                onClick={() => setNewGoal(g)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${newGoal === g
                                        ? 'bg-primary text-white'
                                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
                                    }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleSaveGoal}
                        className="mt-2 w-full text-sm bg-primary text-white py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            )}

            {/* Streak Counter */}
            <div className="flex items-center gap-6 mb-5">
                <div className="text-center">
                    <div className={`text-4xl font-extrabold ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {currentStreak}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {currentStreak === 1 ? 'Day' : 'Days'}
                    </p>
                </div>

                {/* Daily Goal Ring */}
                <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${goalProgress}, 100`}
                            strokeLinecap="round"
                            className={goalMet ? 'text-green-500' : 'text-primary'}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {goalMet ? (
                            <span className="text-green-500 text-sm">✓</span>
                        ) : (
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                {todayCompleted}/{dailyGoal}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-gray-600 dark:text-gray-400">Best:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{longestStreak} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Target className="w-3.5 h-3.5 text-primary" />
                        <span className="text-gray-600 dark:text-gray-400">Today:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {todayCompleted} lesson{todayCompleted !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* 7-Day Calendar */}
            <div className="flex justify-between gap-1">
                {streakDays.map((day, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 font-medium">
                            {day.dayLabel}
                        </span>
                        <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${day.completed > 0
                                    ? day.isToday
                                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                    : day.isToday
                                        ? 'border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                }`}
                            title={`${day.date}: ${day.completed} lessons`}
                        >
                            {day.completed > 0 ? (
                                <Flame className="w-3.5 h-3.5" />
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>

            {/* Motivation message */}
            <div className="mt-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentStreak === 0 && '🔥 Complete a lesson to start your streak!'}
                    {currentStreak > 0 && currentStreak < 3 && '🔥 Keep going! Build that habit!'}
                    {currentStreak >= 3 && currentStreak < 7 && '🔥 Nice streak! You\'re on fire!'}
                    {currentStreak >= 7 && currentStreak < 30 && '🏆 Incredible dedication! Keep it up!'}
                    {currentStreak >= 30 && '👑 Legendary! You\'re unstoppable!'}
                </p>
            </div>
        </div>
    );
};

export default StreakDisplay;
