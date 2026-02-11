import React, { useState } from 'react';
import { CheckCircle, Circle, Lock, Trash2, X } from 'lucide-react';

const CurriculumView = ({ curriculum, onDeleteCourse }) => {
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (courseId, courseTitle) => {
        setDeleting(true);
        try {
            await onDeleteCourse(courseId);
        } catch (error) {
            console.error('Error deleting course:', error);
        } finally {
            setDeleting(false);
            setConfirmDelete(null);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Learning Path</h3>
            <div className="space-y-6">
                {curriculum.length > 0 ? (
                    curriculum.map((section) => (
                        <div key={section.id} className="group relative">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{section.title}</h4>
                                {onDeleteCourse && (
                                    confirmDelete === section.id ? (
                                        <div className="flex items-center gap-2 animate-in fade-in">
                                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Remove course?</span>
                                            <button
                                                onClick={() => handleDelete(section.id, section.title)}
                                                disabled={deleting}
                                                className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                            >
                                                {deleting ? 'Removing...' : 'Yes'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(null)}
                                                className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDelete(section.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                            title="Remove course"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )
                                )}
                            </div>
                            <div className="space-y-3">
                                {section.modules.map((module) => (
                                    <div key={module.id} className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-default">
                                        <div className="flex-shrink-0 mr-3">
                                            {module.status === 'completed' && <CheckCircle className="w-5 h-5 text-secondary" />}
                                            {module.status === 'in-progress' && <Circle className="w-5 h-5 text-primary" />}
                                            {module.status === 'locked' && <Lock className="w-5 h-5 text-gray-400" />}
                                        </div>
                                        <span className={`text-sm font-medium ${module.status === 'locked' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                            {module.title}
                                        </span>
                                        {module.status === 'in-progress' && (
                                            <span className="ml-auto text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't enrolled in any courses yet.</p>
                        <a href="/" className="text-primary font-medium hover:underline">
                            Browse Catalog &rarr;
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurriculumView;
