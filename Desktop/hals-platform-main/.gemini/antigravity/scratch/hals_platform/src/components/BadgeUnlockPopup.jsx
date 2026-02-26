import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';

const BadgeUnlockPopup = ({ badges, onClose }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center"
                    >
                        <Trophy className="w-10 h-10 text-white" />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Badge Unlocked!
                    </h2>

                    <div className="space-y-4">
                        {badges.map((badge, i) => (
                            <motion.div
                                key={badge.id}
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="flex items-center bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4"
                            >
                                <div className="text-4xl mr-4">{badge.icon}</div>
                                <div className="text-left">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{badge.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{badge.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg font-semibold"
                    >
                        Awesome!
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BadgeUnlockPopup;
