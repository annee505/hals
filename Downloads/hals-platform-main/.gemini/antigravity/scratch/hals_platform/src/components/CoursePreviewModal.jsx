import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, Award } from 'lucide-react';
import { courseContentService } from '../services/courseContent';

// Convert a lesson duration string like "25 min" or "60 min" into minutes
const parseDurationToMinutes = (duration) => {
    if (!duration || typeof duration !== 'string') return 0;

    const minutesMatch = duration.match(/(\d+)\s*min/i);
    if (minutesMatch) {
        return parseInt(minutesMatch[1], 10);
    }

    const hoursMatch = duration.match(/(\d+)\s*h(r|rs)?/i);
    if (hoursMatch) {
        return parseInt(hoursMatch[1], 10) * 60;
    }

    return 0;
};

// Map total minutes into a simple hours-per-week range string
const formatMinutesToHourRange = (minutes) => {
    const hours = (minutes || 0) / 60;

    if (hours < 1) {
        return '< 1 hr';
    }

    if (hours <= 2) {
        return '1-2 hrs';
    }

    if (hours <= 3.5) {
        return '2-3 hrs';
    }

    if (hours <= 5) {
        return '3-5 hrs';
    }

    return '5+ hrs';
};

const CoursePreviewModal = ({ course, onClose, onEnroll }) => {
    const [curriculum, setCurriculum] = React.useState([]);

    React.useEffect(() => {
        const content = courseContentService.getCourseContent(course.id);

        if (!content || !Array.isArray(content.modules)) {
            setCurriculum([]);
            return;
        }

        // Treat each module as a week in the preview and
        // base the hours-per-week on real lesson durations.
        const weeks = content.modules.map((mod, index) => {
            const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];

            const totalMinutes = lessons.reduce(
                (sum, lesson) => sum + parseDurationToMinutes(lesson.duration),
                0
            );

            const topics = lessons.length > 0
                ? lessons.map((lesson) => lesson.title)
                : ['Review & Practice'];

            return {
                week: index + 1,
                title: mod.title,
                topics,
                duration: formatMinutesToHourRange(totalMinutes)
            };
        });

        setCurriculum(weeks);
    }, [course]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-primary to-indigo-600 text-white p-6 rounded-t-2xl">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                        <p className="opacity-90">{course.description}</p>

                        <div className="flex items-center gap-6 mt-4 text-sm">
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                {course.duration}
                            </div>
                            <div className="flex items-center">
                                <Award className="w-4 h-4 mr-2" />
                                {course.difficulty}
                            </div>
                            <div className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-2" />
                                {course.enrolled}+ enrolled
                            </div>
                        </div>
                    </div>

                    {/* Curriculum Content */}
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Course Curriculum</h3>

                        <div className="space-y-4">
                            {curriculum.map((module, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-sm font-semibold text-primary">Week {module.week}</span>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{module.title}</h4>
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{module.duration}</span>
                                    </div>
                                    <ul className="space-y-1 mt-2">
                                        {module.topics.map((topic, j) => (
                                            <li key={j} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                                                {topic}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>

                        {/* What You'll Learn */}
                        <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3">What You'll Learn</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {[
                                    'Fundamental concepts and theory',
                                    'Hands-on practical projects',
                                    'Real-world application skills',
                                    'Industry best practices',
                                    'Problem-solving techniques',
                                    'Portfolio-ready projects'
                                ].map((item, i) => (
                                    <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                        <Award className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Enroll Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                onEnroll(course);
                                onClose();
                            }}
                            className="w-full mt-6 bg-gradient-to-r from-primary to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                            Enroll in This Course
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CoursePreviewModal;
