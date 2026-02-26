import React from 'react';
import { CheckCircle, Circle, Lock } from 'lucide-react';

const CurriculumView = ({ curriculum }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Path</h3>
            <div className="space-y-6">
                {curriculum.map((section) => (
                    <div key={section.id}>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">{section.title}</h4>
                        <div className="space-y-3">
                            {section.modules.map((module) => (
                                <div key={module.id} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex-shrink-0 mr-3">
                                        {module.status === 'completed' && <CheckCircle className="w-5 h-5 text-secondary" />}
                                        {module.status === 'in-progress' && <Circle className="w-5 h-5 text-primary" />}
                                        {module.status === 'locked' && <Lock className="w-5 h-5 text-gray-400" />}
                                    </div>
                                    <span className={`text-sm font-medium ${module.status === 'locked' ? 'text-gray-400' : 'text-gray-900'}`}>
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
                ))}
            </div>
        </div>
    );
};

export default CurriculumView;
