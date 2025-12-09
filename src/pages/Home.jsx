import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { database } from '../services/database';
import { authService } from '../services/auth';
import CourseCard from '../components/CourseCard';
import CourseSkeleton from '../components/CourseSkeleton';
import CoursePreviewModal from '../components/CoursePreviewModal';
import ThemeToggle from '../components/ThemeToggle';
import { Sparkles, TrendingUp, Award, ArrowRight } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [previewCourse, setPreviewCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const currentUser = authService.getUser();
            setUser(currentUser);

            try {
                const allCourses = await database.getAllCourses();
                setCourses(allCourses);

                if (currentUser) {
                    const recommended = await database.getRecommendedCourses(currentUser);
                    setRecommendedCourses(recommended);
                } else {
                    setRecommendedCourses(allCourses.slice(0, 6));
                }
            } catch (error) {
                console.error("Error loading courses:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleEnroll = (course) => {
        setPreviewCourse(course);
    };

    const handleConfirmEnroll = async (course) => {
        if (!user) {
            navigate('/signup');
            return;
        }

        try {
            await database.enrollInCourse(user.id, course.id);
            navigate(`/course/${course.id}`);
        } catch (error) {
            if (error.message === 'Already enrolled') {
                navigate(`/course/${course.id}`);
            } else {
                console.error('Enrollment error:', error);
            }
        }
    };

    const handleGetStarted = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/signup');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HALS Platform</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        {user ? (
                            <>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Hi, {user.name}</span>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Dashboard
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary via-indigo-600 to-purple-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Transform Your Learning Journey
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
                            24+ courses across programming, finance, design, wellness & more. Enroll in as many as you want!
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGetStarted}
                            className="px-8 py-4 bg-white text-primary rounded-lg font-bold text-lg hover:shadow-2xl transition-all inline-flex items-center"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </motion.button>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                        {[
                            { icon: TrendingUp, label: 'Active Learners', value: '10,000+' },
                            { icon: Award, label: 'Courses Available', value: '24+' },
                            { icon: Sparkles, label: 'Success Rate', value: '95%' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/10 backdrop-blur rounded-xl p-6 text-center"
                            >
                                <stat.icon className="w-12 h-12 mx-auto mb-3 text-amber-300" />
                                <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                                <p className="text-white/80">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recommended Courses */}
            {user && recommendedCourses.length > 0 && (
                <section className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Recommended For You
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-lg">
                                Based on your interests and goals
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendedCourses.map((course, i) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <CourseCard course={course} onEnroll={handleEnroll} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* All Courses Section */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            All Courses
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            {loading ? 'Finding the best courses for you...' : `${courses.length} courses available - Choose as many as you like!`}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            // Show 8 skeletons while loading
                            Array(8).fill(0).map((_, i) => (
                                <CourseSkeleton key={i} />
                            ))
                        ) : (
                            courses.map((course, i) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                >
                                    <CourseCard course={course} onEnroll={handleEnroll} />
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 py-8 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
                    <p>© 2025 HALS Platform. Empowering learners worldwide.</p>
                </div>
            </footer>

            {/* Course Preview Modal */}
            {previewCourse && (
                <CoursePreviewModal
                    course={previewCourse}
                    onClose={() => setPreviewCourse(null)}
                    onEnroll={handleConfirmEnroll}
                />
            )}
        </div>
    );
};

export default Home;
