import React from 'react';

const CourseSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
            <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-5 space-y-4">
                <div className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex justify-between">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
        </div>
    );
};

export default CourseSkeleton;
