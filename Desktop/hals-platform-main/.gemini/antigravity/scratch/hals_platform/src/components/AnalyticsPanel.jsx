import React from 'react';
import { TrendingUp, Award, AlertCircle } from 'lucide-react';

const AnalyticsPanel = ({ stats }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-2">
                            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-900">Progress</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-700">{stats.progress}%</span>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                        <div className="flex items-center mb-2">
                            <Award className="w-5 h-5 text-amber-600 mr-2" />
                            <span className="text-sm font-medium text-amber-900">Streak</span>
                        </div>
                        <span className="text-2xl font-bold text-amber-700">{stats.streak} Days</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" /> Strengths
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {stats.strengths.map((s, i) => (
                                <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{s}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> Focus Areas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {stats.weaknesses.map((w, i) => (
                                <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{w}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for icon
function CheckCircle({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

export default AnalyticsPanel;
