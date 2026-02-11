import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { database } from '../services/database';
import { Loader2, Eye, Headphones, BookOpen, Wrench, Zap, Scale, Coffee, Layers, BarChart3, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const LEARNING_STYLES = [
    {
        id: 'visual',
        label: 'Visual',
        description: 'Diagrams, videos & infographics',
        icon: Eye,
        color: 'from-violet-500 to-purple-600',
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        border: 'border-violet-300 dark:border-violet-600',
        ring: 'ring-violet-500'
    },
    {
        id: 'auditory',
        label: 'Auditory',
        description: 'Discussions, podcasts & explanations',
        icon: Headphones,
        color: 'from-blue-500 to-cyan-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-300 dark:border-blue-600',
        ring: 'ring-blue-500'
    },
    {
        id: 'reading',
        label: 'Reading / Writing',
        description: 'In-depth text, notes & documentation',
        icon: BookOpen,
        color: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-300 dark:border-emerald-600',
        ring: 'ring-emerald-500'
    },
    {
        id: 'kinesthetic',
        label: 'Hands-on',
        description: 'Projects, coding challenges & experiments',
        icon: Wrench,
        color: 'from-orange-500 to-amber-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-300 dark:border-orange-600',
        ring: 'ring-orange-500'
    }
];

const PACE_OPTIONS = [
    { id: 'intensive', label: 'Intensive', description: 'Daily, 45-60 min', icon: Zap },
    { id: 'balanced', label: 'Balanced', description: '3-4x/week, 30 min', icon: Scale },
    { id: 'relaxed', label: 'Relaxed', description: '1-2x/week, casual', icon: Coffee }
];

const DEPTH_OPTIONS = [
    { id: 'overview', label: 'Quick Overview', description: 'Key takeaways only', icon: Search },
    { id: 'standard', label: 'Standard', description: 'Theory + practice', icon: Layers },
    { id: 'deep', label: 'Deep Dive', description: 'Full mastery', icon: BarChart3 }
];

const ProfileSetup = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, refreshProfile } = useAuth();
    const [step, setStep] = useState(0); // 0: basics, 1: learning style, 2: pace & depth
    const [formData, setFormData] = useState({
        hobbies: '',
        learningStyle: 'visual',
        goal: '',
        pace: 'balanced',
        contentDepth: 'standard'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        try {
            if (!user || !user.id) {
                throw new Error('User not found. Please log in again.');
            }

            await database.updateUserProfile(user.id, formData);
            await refreshProfile();
            navigate('/dashboard');
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.message || 'Failed to update profile. Please try again.');
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 0 && (!formData.hobbies || !formData.goal)) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const SelectionCard = ({ item, selected, onSelect, size = 'normal' }) => {
        const Icon = item.icon;
        const isSelected = selected === item.id;
        return (
            <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(item.id)}
                className={`relative rounded-xl border-2 p-4 text-left transition-all duration-200 w-full ${isSelected
                        ? `${item.border || 'border-primary'} ${item.bg || 'bg-primary/5'} ring-2 ${item.ring || 'ring-primary'} shadow-lg`
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                    }`}
            >
                {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
                <div className={`w-10 h-10 rounded-lg ${isSelected ? `bg-gradient-to-br ${item.color || 'from-primary to-indigo-600'}` : 'bg-gray-100 dark:bg-gray-700'} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                </div>
                <h4 className={`font-semibold text-sm ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.label}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
            </motion.button>
        );
    };

    const stepIndicators = ['About You', 'Learning Style', 'Pace & Depth'];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                {/* Step indicator */}
                <div className="flex items-center justify-center space-x-2 mb-2">
                    {stepIndicators.map((label, i) => (
                        <div key={i} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step
                                    ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-md'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                }`}>
                                {i + 1}
                            </div>
                            {i < 2 && (
                                <div className={`w-12 h-0.5 mx-1 ${i < step ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">{stepIndicators[step]}</p>

                <div>
                    <h2 className="text-center text-2xl font-extrabold text-gray-900 dark:text-white">
                        {step === 0 && 'Tell Us About You'}
                        {step === 1 && 'How Do You Learn Best?'}
                        {step === 2 && 'Set Your Pace'}
                    </h2>
                    <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                        {step === 0 && 'We\'ll tailor your curriculum to your interests.'}
                        {step === 1 && 'Pick the style that feels most natural to you.'}
                        {step === 2 && 'Choose how fast and deep you want to go.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Step 0: Basics */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hobbies & Interests</label>
                                <input
                                    id="hobbies"
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                    placeholder="e.g., Gaming, Music, Sports"
                                    value={formData.hobbies}
                                    onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Goal</label>
                                <input
                                    id="goal"
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                    placeholder="e.g., Learn Python, Manage Budget"
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 1: Learning Style */}
                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-3">
                            {LEARNING_STYLES.map((style) => (
                                <SelectionCard
                                    key={style.id}
                                    item={style}
                                    selected={formData.learningStyle}
                                    onSelect={(id) => setFormData({ ...formData, learningStyle: id })}
                                />
                            ))}
                        </div>
                    )}

                    {/* Step 2: Pace & Depth */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Study Pace</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {PACE_OPTIONS.map((opt) => (
                                        <SelectionCard
                                            key={opt.id}
                                            item={opt}
                                            selected={formData.pace}
                                            onSelect={(id) => setFormData({ ...formData, pace: id })}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Content Depth</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {DEPTH_OPTIONS.map((opt) => (
                                        <SelectionCard
                                            key={opt.id}
                                            item={opt}
                                            selected={formData.contentDepth}
                                            onSelect={(id) => setFormData({ ...formData, contentDepth: id })}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-2">
                    {step > 0 ? (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 2 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-6 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Setting up...
                                </>
                            ) : (
                                'Generate My Curriculum ✨'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
