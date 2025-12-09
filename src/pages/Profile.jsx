import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { database } from '../services/database';
import ThemeToggle from '../components/ThemeToggle';
import { Edit, BookOpen, Award, Target } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
// ...

const Profile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!user) return; // Handled by PrivateRoute

        setFormData({
            name: user.name,
            hobbies: user.hobbies,
            learningStyle: user.learningStyle,
            goal: user.goal
        });

        const loadData = async () => {
            try {
                // Get user enrollments
                const userEnrollments = await database.getUserEnrollments(user.id);
                setEnrollments(userEnrollments);
            } catch (error) {
                console.error("Error loading enrollments:", error);
            }
        };

        loadData();
    }, [user, navigate]);

    const handleUpdate = () => {
        authService.updateProfile(formData);
        // User context should ideally update here, but for now local mutation or re-fetch is fine
        // Since we are using context, we can just close mode. Context might need refresh logic later.
        setIsEditing(false);
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => { authService.logout(); navigate('/'); }}
                            className="text-red-600 hover:text-red-800"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8"
                >
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white dark:border-gray-700 shadow-lg">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{user.email}</p>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-xs font-semibold">
                                    🚀 Early Adopter
                                </span>
                                {enrollments.length > 2 && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                                        📚 Avid Learner
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center px-4 py-2 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hobbies</label>
                                <input
                                    type="text"
                                    value={formData.hobbies}
                                    onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Learning Style</label>
                                <select
                                    value={formData.learningStyle}
                                    onChange={(e) => setFormData({ ...formData, learningStyle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="visual">Visual</option>
                                    <option value="auditory">Auditory</option>
                                    <option value="reading">Reading/Writing</option>
                                    <option value="kinesthetic">Kinesthetic</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Goal</label>
                                <input
                                    type="text"
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <button
                                onClick={handleUpdate}
                                className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start">
                                <Target className="w-5 h-5 text-primary mr-3 mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Goal</p>
                                    <p className="text-gray-900 dark:text-white">{user.goal || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Award className="w-5 h-5 text-primary mr-3 mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hobbies</p>
                                    <p className="text-gray-900 dark:text-white">{user.hobbies || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <BookOpen className="w-5 h-5 text-primary mr-3 mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Learning Style</p>
                                    <p className="text-gray-900 dark:text-white capitalize">{user.learningStyle || 'Not set'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Enrolled Courses */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Courses ({enrollments.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enrollment) => (
                        <motion.div
                            key={enrollment.id}
                            whileHover={{ y: -4 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/course/${enrollment.courseId}`)}
                        >
                            <div className="h-32 bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                                <BookOpen className="w-12 h-12 text-white opacity-80" />
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{enrollment.course?.title}</h4>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                    <div className="bg-primary h-2 rounded-full" style={{ width: `${enrollment.progress}%` }} />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{enrollment.progress}% Complete</p>
                            </div>
                        </motion.div>
                    ))}

                    {enrollments.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">No courses enrolled yet</p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Browse Courses
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;
