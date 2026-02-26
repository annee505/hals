import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { curriculumService } from '../services/curriculum';
import { gamificationService } from '../services/gamification';
import CurriculumView from '../components/CurriculumView';
import AnalyticsPanel from '../components/AnalyticsPanel';
import ChatInterface from '../components/ChatInterface';
import GamificationPanel from '../components/GamificationPanel';
import DailyChallenge from '../components/DailyChallenge';
import Assessment from '../components/Assessment';
import BadgeUnlockPopup from '../components/BadgeUnlockPopup';
import ThemeToggle from '../components/ThemeToggle';
import { MessageSquare } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [curriculum, setCurriculum] = useState([]);
    const [stats, setStats] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [showAssessment, setShowAssessment] = useState(false);
    const [gamificationStats, setGamificationStats] = useState(null);
    const [badges, setBadges] = useState([]);
    const [newBadges, setNewBadges] = useState([]);

    useEffect(() => {
        const currentUser = authService.getUser();
        if (!currentUser) {
            navigate('/');
            return;
        }
        setUser(currentUser);

        // Load personalized data
        const userCurriculum = curriculumService.generateCurriculum(currentUser);
        const userStats = curriculumService.getAnalytics(currentUser.id);

        setCurriculum(userCurriculum);
        setStats(userStats);

        // Load gamification data
        const gamStats = gamificationService.updateStreak();
        setGamificationStats(gamStats);
        setBadges(gamificationService.getBadges());
    }, [navigate]);

    const handleChallengeStart = () => {
        // Start the daily challenge (open assessment)
        setShowAssessment(true);
    };

    const handleAssessmentComplete = (feedback) => {
        // Refresh gamification stats
        const gamStats = gamificationService.getStats();
        setGamificationStats(gamStats);

        // Show badge popup if any new badges
        if (feedback.newBadges && feedback.newBadges.length > 0) {
            setNewBadges(feedback.newBadges);
        }

        // Mark challenge as completed if it was a challenge
        if (showAssessment) {
            gamificationService.completeChallenge();
        }
    };

    if (!user || !stats || !gamificationStats) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
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

                        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                            <h2 className="text-2xl font-bold mb-2">Ready to continue learning?</h2>
                            <p className="mb-4 opacity-90">Your personalized path to mastering {user.goal} is ready.</p>
                            <button
                                onClick={() => setShowChat(true)}
                                className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
                            >
                                <MessageSquare className="w-5 h-5 mr-2" />
                                Start Session with AI Coach
                            </button>
                        </div>

                        <CurriculumView curriculum={curriculum} />
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
