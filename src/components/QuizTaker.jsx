import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle } from 'lucide-react';
import { quizGenerator } from '../services/quizGenerator';

export default function QuizTaker({ quizId, userId, onClose }) {
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    const loadQuiz = async () => {
        try {
            const quizData = await quizGenerator.getQuiz(quizId);
            setQuiz(quizData);
            setLoading(false);
        } catch (error) {
            console.error('Error loading quiz:', error);
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId, answer) => {
        setSelectedAnswers({ ...selectedAnswers, [questionId]: answer });
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            const attempt = await quizGenerator.submitQuizAttempt(userId, quizId, selectedAnswers);
            setResults(attempt);
            setShowResults(true);

            if (attempt.percentage >= 70) {
                // Success Sound & Confetti
                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
                audio.play().catch(e => console.log('Audio play failed', e)); // Ignore interaction processing errors

                import('canvas-confetti').then((confetti) => {
                    confetti.default({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                });
            } else {
                // Failure/Try Again Sound (Subtle)
                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-click-error-1110.mp3');
                audio.play().catch(e => console.log('Audio play failed', e));
            }

        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4"
                >
                    <p className="text-center text-gray-600">Loading quiz...</p>
                </motion.div>
            </div>
        );
    }

    if (!quiz) return null;

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
                        <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                            Question {currentQuestion + 1} of {quiz.questions.length}
                        </span>
                        <span className="text-sm font-medium text-indigo-600">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Question Content */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 250px)' }}>
                    <AnimatePresence mode="wait">
                        {!showResults ? (
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                    {question.question}
                                </h3>

                                <div className="space-y-3">
                                    {Object.entries(question.options).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleAnswerSelect(question.id, key)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition ${selectedAnswers[question.id] === key
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-indigo-300'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div
                                                    className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${selectedAnswers[question.id] === key
                                                        ? 'border-indigo-500 bg-indigo-500'
                                                        : 'border-gray-300'
                                                        }`}
                                                >
                                                    {selectedAnswers[question.id] === key && (
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-700 mr-2">{key}.</span>
                                                <span className="text-gray-900">{value}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${results.percentage >= 70 ? 'bg-green-100' : 'bg-orange-100'
                                    }`}>
                                    {results.percentage >= 70 ? (
                                        <Check className="w-12 h-12 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-12 h-12 text-orange-600" />
                                    )}
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                                    {results.percentage}%
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    You scored {results.score} out of {results.total_questions} questions correct
                                </p>
                                <p className="text-lg font-medium text-gray-700">
                                    {results.percentage >= 90 ? 'Excellent work! 🎉' :
                                        results.percentage >= 70 ? 'Great job! 👍' :
                                            'Keep practicing! 💪'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                    {!showResults ? (
                        <>
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                className="px-6 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Previous
                            </button>
                            <div className="flex gap-3">
                                {currentQuestion === quiz.questions.length - 1 ? (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                                        className="px-8 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Submit Quiz
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="px-8 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
                        >
                            Close
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
