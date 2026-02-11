import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { database } from '../services/database';
import { courseContentService } from '../services/courseContent';
import { gamificationService } from '../services/gamification';
import { ArrowLeft, CheckCircle, Circle, ChevronRight, ChevronLeft, BookOpen, Loader2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.min.css';

const LessonPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [content, setContent] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentModule, setCurrentModule] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadLessonData = async () => {
            if (!user) return;
            setLoading(true);
            setError(null);

            try {
                // Fetch course info and content structure
                const [courseData, courseContent, userProgress] = await Promise.all([
                    database.getCourseById(courseId),
                    courseContentService.getCourseContent(courseId),
                    courseContentService.getProgress(user.id, courseId)
                ]);

                setCourse(courseData);
                setContent(courseContent);
                setProgress(userProgress);

                if (!courseContent || !courseContent.modules) {
                    console.error("Course content or modules not found");
                    // Could navigate back or show error state here
                    setLoading(false);
                    return;
                }

                // Find the specific lesson
                let foundLesson = null;
                let foundModule = null;

                for (const mod of courseContent.modules) {
                    if (!mod.lessons) continue; // Skip if no lessons in module

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
                    setError("Lesson not found");
                }

            } catch (error) {
                console.error("Error loading lesson:", error);
                setError("Failed to load lesson content");
            } finally {
                setLoading(false);
            }
        };

        loadLessonData();
    }, [courseId, lessonId, user]);

    const handleComplete = async () => {
        if (!user || !currentLesson) return;

        // Optimistic update
        const alreadyCompleted = progress?.completedLessons?.includes(currentLesson.id);
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={() => navigate(`/course/${courseId}`)} className="text-primary hover:underline">
                    Back to Course
                </button>
            </div>
        );
    }

    if (!currentLesson) return null;

    const isCompleted = progress?.completedLessons?.includes(currentLesson.id) || false;

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

                        <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed font-sans
                            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                            prose-p:text-gray-700 dark:prose-p:text-gray-300
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-gray-900 dark:prose-strong:text-white
                            prose-code:text-primary prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                            prose-pre:bg-gray-900 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:border prose-pre:border-gray-700
                            prose-blockquote:border-primary prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-900/10 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                            prose-table:overflow-hidden prose-table:rounded-lg
                            prose-th:bg-gray-100 dark:prose-th:bg-gray-700 prose-th:px-4 prose-th:py-2
                            prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-gray-200 dark:prose-td:border-gray-600
                            prose-li:marker:text-primary
                            prose-hr:border-gray-200 dark:prose-hr:border-gray-700
                            prose-img:rounded-xl prose-img:shadow-lg">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                    a: ({ node, ...props }) => (
                                        <a {...props} className="text-primary hover:underline transition-colors" target="_blank" rel="noopener noreferrer" />
                                    ),
                                    img: ({ node, ...props }) => (
                                        <img {...props} className="rounded-xl shadow-lg my-6 w-full" alt={props.alt || 'Lesson Image'} />
                                    ),
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                            <table {...props} className="min-w-full" />
                                        </div>
                                    ),
                                    pre: ({ node, ...props }) => (
                                        <pre {...props} className="!bg-gray-900 rounded-xl shadow-lg border border-gray-700 overflow-x-auto" />
                                    ),
                                }}
                            >
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
