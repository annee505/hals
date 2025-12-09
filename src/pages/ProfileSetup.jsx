import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { database } from '../services/database';
import { authService } from '../services/auth';
import { Loader2 } from 'lucide-react';

const ProfileSetup = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        hobbies: '',
        learningStyle: 'visual',
        goal: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Show loading while auth is checking
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!user || !user.id) {
                throw new Error('User not found. Please log in again.');
            }

            // Update profile in database
            await database.updateUserProfile(user.id, formData);

            // Update local session
            authService.createSession({
                id: user.id,
                email: user.email,
                name: user.name,
                ...formData
            });

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.message || 'Failed to update profile. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Customize Your Experience
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
                        Help us tailor the curriculum to you.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hobbies & Interests</label>
                            <input
                                id="hobbies"
                                name="hobbies"
                                type="text"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="e.g., Gaming, Music, Sports"
                                value={formData.hobbies}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Learning Style</label>
                            <select
                                id="learningStyle"
                                name="learningStyle"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                value={formData.learningStyle}
                                onChange={handleChange}
                            >
                                <option value="visual">Visual (Images, Videos)</option>
                                <option value="auditory">Auditory (Listening, Discussing)</option>
                                <option value="reading">Reading/Writing</option>
                                <option value="kinesthetic">Kinesthetic (Hands-on)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Goal</label>
                            <input
                                id="goal"
                                name="goal"
                                type="text"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="e.g., Learn Python, Manage Budget"
                                value={formData.goal}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                    Setting up...
                                </>
                            ) : (
                                'Generate My Curriculum'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
