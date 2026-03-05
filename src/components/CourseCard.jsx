import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Star, Clock, Users } from 'lucide-react';

/**
 * Parse a duration string like "15 min", "1 hr 30 min", "2 hours", "45 minutes"
 * Returns total minutes as a number, or null if unparseable.
 */
function parseDurationMinutes(str) {
    if (!str || typeof str !== 'string') return null;
    const s = str.toLowerCase().trim();
    let total = 0;
    const hrMatch = s.match(/(\d+\.?\d*)\s*(?:hr|hrs|hour|hours)/);
    const minMatch = s.match(/(\d+\.?\d*)\s*(?:min|mins|minute|minutes)/);
    if (!hrMatch && !minMatch) return null;
    if (hrMatch) total += parseFloat(hrMatch[1]) * 60;
    if (minMatch) total += parseFloat(minMatch[1]);
    return total > 0 ? Math.round(total) : null;
}

const CourseCard = ({ course, onEnroll }) => {
    const navigate = useNavigate();

    const difficultyColors = {
        Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };

    const imageGradients = {
        finance: 'from-green-400 to-emerald-500',
        coding: 'from-blue-400 to-indigo-500',
        web: 'from-purple-400 to-pink-500'
    };

    // Compute real display duration — only show it if it's a time-based string
    const displayDuration = (() => {
        const stored = course.duration || '';
        // If it's already a time-based string (has min/hrs), use it directly
        if (parseDurationMinutes(stored) !== null) return stored;
        // "6 weeks" style — show Self-paced instead of confusing week count
        return 'Self-paced';
    })();

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all"
        >
            <div className={`h-40 bg-gradient-to-br ${imageGradients[course.image] || imageGradients.coding} flex items-center justify-center`}>
                <BookOpen className="w-16 h-16 text-white opacity-80" />
            </div>

            <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[course.difficulty] || difficultyColors.Beginner}`}>
                        {course.difficulty}
                    </span>
                    <div className="flex items-center text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm ml-1 font-medium">{course.rating || '4.8'}</span>
                    </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {displayDuration}
                    </div>
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {(course.enrolled_count || 0).toLocaleString()}+ enrolled
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {(course.tags || []).slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEnroll(course)}
                    className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                    Enroll Now
                </motion.button>
            </div>
        </motion.div>
    );
};

export default CourseCard;
