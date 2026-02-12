import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const StarRating = ({ rating = 0, onRate, size = 'md', readOnly = false, showLabel = true }) => {
    const [hover, setHover] = useState(0);

    const sizeMap = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const starSize = sizeMap[size] || sizeMap.md;

    const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
    const activeValue = hover || rating;

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                        key={star}
                        type="button"
                        disabled={readOnly}
                        whileHover={!readOnly ? { scale: 1.2 } : {}}
                        whileTap={!readOnly ? { scale: 0.9 } : {}}
                        onClick={() => !readOnly && onRate?.(star)}
                        onMouseEnter={() => !readOnly && setHover(star)}
                        onMouseLeave={() => !readOnly && setHover(0)}
                        className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                        <Star
                            className={`${starSize} transition-colors duration-150 ${star <= activeValue
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-transparent text-gray-300 dark:text-gray-600'
                                }`}
                        />
                    </motion.button>
                ))}
            </div>
            {showLabel && activeValue > 0 && (
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    {labels[activeValue]}
                </span>
            )}
        </div>
    );
};

export default StarRating;
