'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'midnight' | 'skillprint';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('skillprint');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check local storage or default to light
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && ['light', 'dark', 'midnight', 'skillprint'].includes(savedTheme)) {
            setTheme(savedTheme);
        } else {
            // Default to light as requested
            setTheme('skillprint');
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        const body = document.body;
        // Remove all possible theme classes/attributes first
        root.classList.remove('dark', 'light');
        body.classList.remove('dark', 'light');
        root.removeAttribute('data-theme');
        root.removeAttribute('data-surface');
        root.removeAttribute('data-appearance');
        body.removeAttribute('data-theme');
        body.removeAttribute('data-surface');
        body.removeAttribute('data-appearance');

        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
            root.setAttribute('data-surface', 'dark');
            body.setAttribute('data-theme', 'dark');
            body.setAttribute('data-surface', 'dark');
            root.classList.add('dark');
            body.classList.add('dark');
        } else if (theme === 'midnight') {
            root.setAttribute('data-theme', 'dark');
            root.setAttribute('data-surface', 'dark');
            root.setAttribute('data-appearance', 'midnight');
            body.setAttribute('data-theme', 'dark');
            body.setAttribute('data-surface', 'dark');
            body.setAttribute('data-appearance', 'midnight');
            root.classList.add('dark');
            body.classList.add('dark');
        } else if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
            root.setAttribute('data-surface', 'light');
            body.setAttribute('data-theme', 'light');
            body.setAttribute('data-surface', 'light');
            root.classList.add('light');
            body.classList.add('light');
        } else {
            // Skillprint (default)
            // Leave attributes un-set or set defaults here if needed
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
