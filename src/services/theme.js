const THEME_KEY = 'hals_theme';

export const themeService = {
    getTheme: () => {
        const saved = localStorage.getItem(THEME_KEY);
        return saved || 'light';
    },

    setTheme: (theme) => {
        localStorage.setItem(THEME_KEY, theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    },

    toggleTheme: () => {
        const current = themeService.getTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        themeService.setTheme(newTheme);
        return newTheme;
    },

    initTheme: () => {
        const theme = themeService.getTheme();
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }
};
