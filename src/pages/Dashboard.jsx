import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { curriculumService } from '../services/curriculum';
import { gamificationService } from '../services/gamification';
import { aiCourseGenerator } from '../services/aiCourseGenerator';
import { database } from '../services/database';
import CurriculumView from '../components/CurriculumView';
import AnalyticsPanel from '../components/AnalyticsPanel';
import ChatInterface from '../components/ChatInterface';
import GamificationPanel from '../components/GamificationPanel';
import DailyChallenge from '../components/DailyChallenge';
import Assessment from '../components/Assessment';
import BadgeUnlockPopup from '../components/BadgeUnlockPopup';
import ThemeToggle from '../components/ThemeToggle';
import { MessageSquare, Plus, Sparkles, Loader2, X } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [curriculum, setCurriculum] = useState([]);
    const [stats, setStats] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [showAssessment, setShowAssessment] = useState(false);
    const [gamificationStats, setGamificationStats] = useState(null);
    const [badges, setBadges] = useState([]);
    const [newBadges, setNewBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // AI Generation State
    const [showGenerator, setShowGenerator] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationGoal, setGenerationGoal] = useState('');

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                // Initialize default empty structure for immediate render
                setCurriculum([]);
                setStats(curriculumService.getAnalytics());
                if (gamificationService) {
                    setGamificationStats(gamificationService.updateStreak());
                    setBadges(gamificationService.getBadges());
                }

                // Load real enrollments (Async)
                const enrollments = await database.getUserEnrollments(user.id);

                if (enrollments && enrollments.length > 0) {
                    const newCurriculum = enrollments.map(enrollment => ({
                        id: enrollment.course.id,
                        title: enrollment.course.title,
                        modules: [
                            {
                                id: `mod-${enrollment.course.id}`,
                                title: 'Continue Learning',
                                status: enrollment.progress > 0 ? 'in-progress' : 'in-progress'
                            }
                        ]
                    }));
                    setCurriculum(newCurriculum);
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadData();
        }
    }, [user, navigate]);

    const handleChallengeStart = () => {
        setShowAssessment(true);
    };

    const handleAssessmentComplete = (feedback) => {
        const gamStats = gamificationService.getStats();
        setGamificationStats(gamStats);

        if (feedback.newBadges && feedback.newBadges.length > 0) {
            setNewBadges(feedback.newBadges);
        }

        if (showAssessment) {
            gamificationService.completeChallenge();
        }
    };

    const handleGenerateCourse = async (e) => {
        e.preventDefault();
        if (!generationGoal.trim()) return;

        setIsGenerating(true);
        try {
            const course = await aiCourseGenerator.generateCourse(generationGoal, {
                learningStyle: user.learningStyle,
                hobbies: user.hobbies
            });

            // Auto-enroll
            await database.enrollInCourse(user.id, course.id);

            setIsGenerating(false);
            setShowGenerator(false);

            // Navigate to the new course
            navigate(`/course/${course.id}`);
        } catch (error) {
            console.error("Error generating course:", error);
            setIsGenerating(false);
            alert("Failed to generate course. Please try again.");
        }
    };

    // If user is not yet set (should be rare due to AuthContext), show simple loader
    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HALS Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <button
                            onClick={() => navigate('/profile')}
                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium"
                        >
                            Welcome, {user.name}
                        </button>
                        <button
                            onClick={() => { authService.logout(); navigate('/'); }}
                            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Curriculum */}
                    <div className="lg:col-span-2 space-y-6">
                        <DailyChallenge onStartChallenge={handleChallengeStart} />

                        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-2">Ready to learn something new?</h2>
                                <p className="mb-4 opacity-90">Generate a custom course with AI tailored to your goals.</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowGenerator(true)}
                                        className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center shadow-md"
                                    >
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Generate New Course
                                    </button>
                                    <button
                                        onClick={() => setShowChat(true)}
                                        className="bg-primary/20 backdrop-blur border border-white/30 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/30 transition-colors flex items-center"
                                    >
                                        <MessageSquare className="w-5 h-5 mr-2" />
                                        AI Coach
                                    </button>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                                <Sparkles className="w-64 h-64" />
                            </div>
                        </div>

                        {/* Search Bar for Enrolled Courses */}
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                                placeholder="Search your courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Sparkles className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Filtered Curriculum View */}
                        {loading ? (
                            <div className="space-y-4">
                                {Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                                        <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <CurriculumView
                                curriculum={curriculum.filter(c =>
                                    c.title.toLowerCase().includes(searchTerm.toLowerCase())
                                )}
                            />
                        )}
                    </div>

                    {/* Sidebar: Analytics & Gamification */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Links</h3>
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-white py-2 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors mb-3"
                            >
                                View My Profile & Courses
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Browse Course Catalog
                            </button>
                        </div>

                        <GamificationPanel stats={gamificationStats} badges={badges} />
                        <AnalyticsPanel stats={stats} />
                    </div>
                </div>
            </main>

            {/* AI Generator Modal */}
            <AnimatePresence>
                {showGenerator && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative"
                        >
                            <button
                                onClick={() => setShowGenerator(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Custom Course</h2>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">
                                    Tell AI what you want to learn, and we'll build a complete curriculum for you.
                                </p>
                            </div>

                            <form onSubmit={handleGenerateCourse}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        What do you want to learn?
                                    </label>
                                    <input
                                        type="text"
                                        value={generationGoal}
                                        onChange={(e) => setGenerationGoal(e.target.value)}
                                        placeholder="e.g. Advanced Python for Data Science, History of Rome..."
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isGenerating || !generationGoal.trim()}
                                    className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Generating Course...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Generate Course
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {showChat && <ChatInterface onClose={() => setShowChat(false)} />}
            {showAssessment && (
                <Assessment
                    topic={user.goal}
                    onClose={() => setShowAssessment(false)}
                    onComplete={handleAssessmentComplete}
                />
            )}
            {newBadges.length > 0 && (
                <BadgeUnlockPopup
                    badges={newBadges}
                    onClose={() => setNewBadges([])}
                />
            )}
        </div>
    );
};

export default Dashboard;
