import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCcw } from 'lucide-react';

const Flashcards = ({ deck, progress, onCardMastered, onCardStudying, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const currentCard = deck.cards[currentIndex];
    const isMastered = progress.masteredCards.includes(currentCard.id);

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % deck.cards.length);
    };

    const handleMastered = () => {
        onCardMastered(currentCard.id);
        handleNext();
    };

    const handleStudyMore = () => {
        onCardStudying(currentCard.id);
        handleNext();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 relative"
            >
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 md:top-4 md:right-4 p-2 bg-white/10 hover:bg-white/20 md:bg-transparent md:hover:bg-gray-100 dark:md:hover:bg-gray-700 text-white md:text-gray-500 dark:md:text-gray-400 rounded-full md:rounded-lg transition-colors z-50"
                >
                    <X className="w-6 h-6 md:w-5 md:h-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{deck.title}</h2>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                        <span>Card {currentIndex + 1} of {deck.cards.length}</span>
                        <span>{progress.masteredCards.length} mastered</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${(progress.masteredCards.length / deck.cards.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Flashcard */}
                <div
                    className="perspective-1000 mb-6 cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <motion.div
                        className="relative h-64 md:h-80"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Front */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br from-primary to-indigo-600 rounded-xl p-8 flex items-center justify-center ${isFlipped ? 'invisible' : 'visible'
                                }`}
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <div className="text-center">
                                <p className="text-sm text-white/80 mb-2">Question</p>
                                <p className="text-xl md:text-2xl font-bold text-white">{currentCard.front}</p>
                                <p className="text-sm text-white/60 mt-4">Click to reveal answer</p>
                            </div>
                        </div>

                        {/* Back */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-8 flex items-center justify-center ${!isFlipped ? 'invisible' : 'visible'
                                }`}
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            <div className="text-center">
                                <p className="text-sm text-white/80 mb-2">Answer</p>
                                <p className="text-lg md:text-xl text-white">{currentCard.back}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Actions */}
                {isFlipped && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4"
                    >
                        <button
                            onClick={handleStudyMore}
                            className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                        >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            Study More
                        </button>
                        <button
                            onClick={handleMastered}
                            className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center"
                        >
                            <Check className="w-5 h-5 mr-2" />
                            {isMastered ? 'Next Card' : 'I Know This'}
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Flashcards;
