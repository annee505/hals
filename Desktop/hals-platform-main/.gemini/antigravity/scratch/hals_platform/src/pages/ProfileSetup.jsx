import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const ProfileSetup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        hobbies: '',
        learningStyle: 'visual',
        goal: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        authService.updateProfile(formData);
        // Simulate curriculum generation delay
        setTimeout(() => {
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Customize Your Experience
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Help us tailor the curriculum to you.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700">Hobbies & Interests</label>
                            <input
                                id="hobbies"
                                name="hobbies"
                                type="text"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="e.g., Gaming, Music, Sports"
                                value={formData.hobbies}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700">Learning Style</label>
                            <select
                                id="learningStyle"
                                name="learningStyle"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
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
                            <label htmlFor="goal" className="block text-sm font-medium text-gray-700">Primary Goal</label>
                            <input
                                id="goal"
                                name="goal"
                                type="text"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="e.g., Learn Python, Manage Budget"
                                value={formData.goal}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                        >
                            Generate My Curriculum
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
