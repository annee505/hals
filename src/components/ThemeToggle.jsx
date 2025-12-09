import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { themeService } from '../services/theme';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(themeService.getTheme());

    useEffect(() => {
        themeService.initTheme();
    }, []);

    const toggleTheme = () => {
        const newTheme = themeService.toggleTheme();
        setTheme(newTheme);
    };

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-indigo-400" />
                ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                )}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;
