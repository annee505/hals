import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import { database } from '../services/database';
import { courseContentService } from '../services/courseContent';
import { flashcardService } from '../services/flashcards';
import { aiKnowledgeService } from '../services/aiKnowledge';
import { gamificationService } from '../services/gamification';
import { quizGenerator } from '../services/quizGenerator';
import Flashcards from '../components/Flashcards';
import FileUpload from '../components/FileUpload';
import Assessment from '../components/Assessment';
import QuizTaker from '../components/QuizTaker';
import ThemeToggle from '../components/ThemeToggle';
import BadgeUnlockPopup from '../components/BadgeUnlockPopup';
import { BookOpen, CheckCircle, Circle, Award, Brain, Upload, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

const CourseDetail = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [content, setContent] = useState(null);
    const [progress, setProgress] = useState(null);
    const [expandedModules, setExpandedModules] = useState({});
    const [showFlashcards, setShowFlashcards] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [flashcardProgress, setFlashcardProgress] = useState(null);
    const [newBadges, setNewBadges] = useState([]);
    const [activeQuizId, setActiveQuizId] = useState(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.state?.courseCompleted) {
            setShowCompletionModal(true);
            triggerConfetti();
            // Clear state so it doesn't fire on reload
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const triggerConfetti = () => {
        var duration = 3 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        var random = function (min, max) {
            return Math.random() * (max - min) + min;
        };

        var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                const courseData = await database.getCourseById(courseId);
                setCourse(courseData);

                const courseContent = await courseContentService.getCourseContent(courseId);
                setContent(courseContent);

                const userProgress = await courseContentService.getProgress(user.id, courseId);
                setProgress(userProgress);

                const files = aiKnowledgeService.getUserFiles(user.id);
                setUploadedFiles(files.filter(f => f.courseId === courseId || !f.courseId));

                const fcProgress = flashcardService.getProgress(user.id, courseId);
                setFlashcardProgress(fcProgress);
            } catch (error) {
                console.error("Error loading course data:", error);
            }
        };

        loadData();
    }, [courseId, user]);

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    const handleLessonComplete = async (lessonId) => {
        try {
            const updatedProgress = await courseContentService.markLessonComplete(user.id, courseId, lessonId);

            // Refresh progress
            const newProgress = await courseContentService.getProgress(user.id, courseId);
            setProgress(newProgress);

            // Award XP
            const result = gamificationService.completeQuiz(10);
            if (result.newBadges && result.newBadges.length > 0) {
                setNewBadges(result.newBadges);
            }
        } catch (error) {
            console.error("Error completing lesson:", error);
        }
    };

    const handleFileUploaded = (fileData) => {
        const uploaded = aiKnowledgeService.uploadFile(user.id, fileData, courseId);
        setUploadedFiles(prev => [...prev, uploaded]);
    };

    const handleFlashcardMastered = (cardId) => {
        const updated = flashcardService.markCardMastered(user.id, courseId, cardId);
        setFlashcardProgress(updated);
        gamificationService.addXP(5);
    };

    const handleFlashcardStudying = (cardId) => {
        const updated = flashcardService.markCardStudying(user.id, courseId, cardId);
        setFlashcardProgress(updated);
    };

    const handleTakeQuiz = async () => {
        setIsGeneratingQuiz(true);
        try {
            // For now, generate a quiz based on the first module's content or generic
            // In a real app, we'd select a specific module
            if (!content.modules || content.modules.length === 0) {
                alert("This course has no content to generate a quiz from.");
                setIsGeneratingQuiz(false);
                return;
            }

            const moduleToQuiz = content.modules[0];
            const lessonContent = moduleToQuiz.lessons.map(l => l.content).join('\n');

            const quiz = await quizGenerator.generateQuiz(courseId, moduleToQuiz.id, lessonContent);
            setActiveQuizId(quiz.id);
            setShowQuiz(true);
        } catch (error) {
            console.error("Error generating quiz:", error);
            alert("Failed to generate quiz. Please try again.");
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    if (!user || !course || !content || !progress) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    const progressPercentage = progress.completedLessons && content.modules
        ? Math.round((progress.completedLessons.length / content.modules.reduce((acc, m) => acc + m.lessons.length, 0)) * 100) || 0
        : 0;

    const deck = flashcardService.getDeck(courseId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/dashboard')} className="text-primary hover:text-indigo-700">
                            ← Dashboard
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <button onClick={() => navigate('/')} className="text-gray-600 dark:text-gray-300 hover:text-gray-900">
                            Home
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Progress</h2>
                            <p className="text-gray-600 dark:text-gray-300">{progress.completedLessons.length} lessons completed</p>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold text-primary">{progressPercentage}%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Complete</p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-primary to-indigo-600 h-3 rounded-full transition-all"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Curriculum */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Curriculum</h3>
                        {content.modules.map((module, i) => (
                            <motion.div
                                key={module.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center">
                                        {expandedModules[module.id] ? <ChevronDown className="w-5 h-5 mr-2" /> : <ChevronRight className="w-5 h-5 mr-2" />}
                                        <div className="text-left">
                                            <h4 className="font-bold text-gray-900 dark:text-white">{module.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-primary">{module.lessons.length} lessons</span>
                                </button>

                                {expandedModules[module.id] && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
                                        {module.lessons.map((lesson) => {
                                            const isComplete = progress.completedLessons.includes(lesson.id);
                                            return (
                                                <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                                                    <div className="flex items-center flex-1">
                                                        {isComplete ? (
                                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-gray-400 mr-3" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{lesson.title}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.duration}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => navigate(`/course/${courseId}/lesson/${lesson.id}`)}
                                                            className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        >
                                                            Start Lesson
                                                        </button>
                                                        <button
                                                            onClick={() => handleLessonComplete(lesson.id)}
                                                            className={`px-4 py-2 rounded-lg transition-colors text-sm ${isComplete
                                                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                                                : 'bg-primary text-white hover:bg-indigo-700'
                                                                }`}
                                                        >
                                                            {isComplete ? 'Undo' : 'Complete'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Learning Tools Sidebar */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Learning Tools</h3>

                        {/* Flashcards */}
                        {deck.cards.length > 0 && (
                            <button
                                onClick={() => setShowFlashcards(true)}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 hover:shadow-lg transition-all"
                            >
                                <Award className="w-6 h-6 mx-auto mb-2" />
                                <p className="font-semibold">Study Flashcards</p>
                                <p className="text-sm opacity-90">{deck.cards.length} cards available</p>
                            </button>
                        )}

                        {/* Quiz */}
                        <button
                            onClick={handleTakeQuiz}
                            disabled={isGeneratingQuiz}
                            className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl p-4 hover:shadow-lg transition-all disabled:opacity-70"
                        >
                            {isGeneratingQuiz ? (
                                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                            ) : (
                                <Brain className="w-6 h-6 mx-auto mb-2" />
                            )}
                            <p className="font-semibold">Take Quiz</p>
                            <p className="text-sm opacity-90">Test your knowledge</p>
                        </button>

                        {/* Upload Materials */}
                        {progressPercentage === 100 && (
                            <button
                                onClick={() => {
                                    import('../services/certificate').then(({ certificateService }) => {
                                        certificateService.generateCertificate(user.name, course.title);
                                    });
                                }}
                                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl p-4 hover:shadow-lg transition-all"
                            >
                                <Award className="w-6 h-6 mx-auto mb-2" />
                                <p className="font-semibold">Download Certificate</p>
                                <p className="text-sm opacity-90">You earned it!</p>
                            </button>
                        )}

                        {/* Upload Materials */}
                        <button
                            onClick={() => setShowFileUpload(!showFileUpload)}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 hover:shadow-lg transition-all"
                        >
                            <Upload className="w-6 h-6 mx-auto mb-2" />
                            <p className="font-semibold">Upload Materials</p>
                            <p className="text-sm opacity-90">Train AI with your docs</p>
                        </button>

                        {showFileUpload && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Upload Learning Materials</h4>
                                <FileUpload userId={user.id} courseId={courseId} onFileUploaded={handleFileUploaded} />

                                {uploadedFiles.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Uploaded Files ({uploadedFiles.length})</p>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {uploadedFiles.map(file => (
                                                <div key={file.id} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <BookOpen className="w-4 h-4 mr-2" />
                                                    <span className="flex-1 truncate">{file.name}</span>
                                                    {file.processed && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showFlashcards && deck.cards.length > 0 && (
                <Flashcards
                    deck={deck}
                    progress={flashcardProgress}
                    onCardMastered={handleFlashcardMastered}
                    onCardStudying={handleFlashcardStudying}
                    onClose={() => setShowFlashcards(false)}
                />
            )}

            {showQuiz && activeQuizId && (
                <QuizTaker
                    quizId={activeQuizId}
                    userId={user.id}
                    onClose={() => setShowQuiz(false)}
                />
            )}

            {newBadges.length > 0 && (
                <BadgeUnlockPopup badges={newBadges} onClose={() => setNewBadges([])} />
            )}

            <AnimatePresence>
                {showCompletionModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-indigo-500/10 z-0"></div>
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
                                    <Award className="w-12 h-12 text-white" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                                    Course Completed!
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                                    Congratulations! You've mastered <strong>{course.title}</strong>.
                                </p>
                                <button
                                    onClick={() => setShowCompletionModal(false)}
                                    className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                                >
                                    Awesome!
                                </button>
                                <button
                                    onClick={() => {
                                        import('../services/certificate').then(({ certificateService }) => {
                                            certificateService.generateCertificate(user.name, course.title);
                                        });
                                    }}
                                    className="w-full mt-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center"
                                >
                                    <Award className="w-5 h-5 mr-2 text-amber-500" />
                                    Download Certificate
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CourseDetail;
