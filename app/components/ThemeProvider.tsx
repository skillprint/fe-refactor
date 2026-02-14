'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'midnight' | 'skillprint';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check local storage or default to light
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && ['light', 'dark', 'midnight', 'skillprint'].includes(savedTheme)) {
            setTheme(savedTheme);
        } else {
            // Default to light as requested
            setTheme('light');
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        // Remove all possible theme classes/attributes first
        root.classList.remove('dark', 'midnight', 'skillprint');
        root.removeAttribute('data-theme');

        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
            root.classList.add('dark');
        } else if (theme === 'midnight') {
            root.setAttribute('data-theme', 'midnight');
            root.classList.add('midnight'); // Optional, but consistent
        } else if (theme === 'skillprint') {
            root.setAttribute('data-theme', 'skillprint');
            root.classList.add('skillprint');
            root.classList.add('dark'); // Add dark class to enable dark mode tailwind utilities since it's a dark theme
        } else {
            // Light theme (default)
            root.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme, mounted]);

    // Prevent hydration mismatch by rendering nothing until mounted, 
    // or render children with default theme (light) to avoid flash if possible.
    // Since we default to light and the server renders light (no data-theme), 
    // we can just render children. 
    // However, if the user was dark, there might be a flash of light mode.
    // To avoid flash, we might need a script in head, but for now this is fine.

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
