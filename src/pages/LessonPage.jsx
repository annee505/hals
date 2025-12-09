import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/auth';
import { database } from '../services/database';
import { courseContentService } from '../services/courseContent';
import { gamificationService } from '../services/gamification';
import { ArrowLeft, CheckCircle, Circle, ChevronRight, ChevronLeft, BookOpen, Loader2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LessonPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [course, setCourse] = useState(null);
    const [content, setContent] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentModule, setCurrentModule] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLessonData = async () => {
            const currentUser = authService.getUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }
            setUser(currentUser);

            try {
                // Fetch course info and content structure
                const [courseData, courseContent, userProgress] = await Promise.all([
                    database.getCourseById(courseId),
                    courseContentService.getCourseContent(courseId),
                    courseContentService.getProgress(currentUser.id, courseId)
                ]);

                setCourse(courseData);
                setContent(courseContent);
                setProgress(userProgress);

                // Find the specific lesson
                let foundLesson = null;
                let foundModule = null;

                for (const mod of courseContent.modules) {
                    const lesson = mod.lessons.find(l => l.id.toString() === lessonId || l.id === lessonId);
                    if (lesson) {
                        foundLesson = lesson;
                        foundModule = mod;
                        break;
                    }
                }

                if (foundLesson) {
                    setCurrentLesson(foundLesson);
                    setCurrentModule(foundModule);
                } else {
                    console.error("Lesson not found");
                    // navigate(`/course/${courseId}`); // fallback
                }

            } catch (error) {
                console.error("Error loading lesson:", error);
            } finally {
                setLoading(false);
            }
        };

        loadLessonData();
    }, [courseId, lessonId, navigate]);

    const handleComplete = async () => {
        if (!user || !currentLesson) return;

        // Optimistic update
        const alreadyCompleted = progress?.completedLessons.includes(currentLesson.id);
        if (alreadyCompleted) return; // Already done

        try {
            await courseContentService.markLessonComplete(user.id, courseId, currentLesson.id);

            // Refresh progress
            const newProgress = await courseContentService.getProgress(user.id, courseId);
            setProgress(newProgress);

            // Gamification
            gamificationService.addXP(10);
        } catch (error) {
            console.error("Error marking complete:", error);
        }
    };

    const handleNext = () => {
        // Logic to find next lesson
        if (!content || !currentLesson) return;

        let allLessons = [];
        content.modules.forEach(m => allLessons.push(...m.lessons));

        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentIndex + 1];
            navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
        } else {
            // Course Complete!
            navigate(`/course/${courseId}`, { state: { courseCompleted: true } });
        }
    };

    const handlePrev = () => {
        if (!content || !currentLesson) return;

        let allLessons = [];
        content.modules.forEach(m => allLessons.push(...m.lessons));

        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex > 0) {
            const prevLesson = allLessons[currentIndex - 1];
            navigate(`/course/${courseId}/lesson/${prevLesson.id}`);
        }
    };

    if (loading || !currentLesson) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const isCompleted = progress?.completedLessons.includes(currentLesson.id);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
            {/* Top Bar */}
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(`/course/${courseId}`)}
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="font-medium hidden sm:inline">Back to Course</span>
                    </button>

                    <div className="flex-1 text-center px-4 truncate">
                        <span className="text-sm text-gray-500 dark:text-gray-400 block sm:hidden">Lesson</span>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">{course?.title}</h1>
                    </div>

                    <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">
                            {currentModule?.title}
                        </span>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-8 md:p-12">
                        <div className="flex items-center space-x-2 text-sm text-primary font-semibold mb-4 uppercase tracking-wide">
                            <BookOpen className="w-4 h-4" />
                            <span>Lesson</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
                            {currentLesson.title}
                        </h2>

                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                a: ({ node, ...props }) => <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" />,
                                img: ({ node, ...props }) => <img {...props} className="rounded-xl shadow-lg my-6 w-full" alt={props.alt || 'Lesson Image'} />
                            }}>
                                {currentLesson.content}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-4 w-full sm:w-auto">
                            <button
                                onClick={handlePrev}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center transition-colors disabled:opacity-30"
                            >
                                <ChevronLeft className="w-5 h-5 mr-1" />
                                Previous
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                handleComplete();
                                if (!isCompleted) handleNext(); // Auto advance if checking off
                                else handleNext(); // Just navigation
                            }}
                            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 w-full sm:w-auto ${isCompleted
                                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
                                : 'bg-gradient-to-r from-primary to-indigo-600 hover:shadow-indigo-500/30'
                                }`}
                        >
                            {isCompleted ? (
                                <>
                                    <span>Completed</span>
                                    <CheckCircle className="w-5 h-5 ml-2" />
                                </>
                            ) : (
                                <>
                                    <span>Complete & Continue</span>
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>

                        <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
                            <button
                                onClick={handleNext}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center transition-colors"
                            >
                                Next
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default LessonPage;
