'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthStatus = 'loggedOut' | 'guest' | 'social';

interface AuthContextType {
    status: AuthStatus;
    isLoading: boolean;
    loginAsGuest: () => void;
    loginWithGoogle: (googleId: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>('loggedOut');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage on mount
        const storedStatus = localStorage.getItem('auth_status') as AuthStatus | null;
        if (storedStatus) {
            setStatus(storedStatus);
        }
        setIsLoading(false);
    }, []);

    const loginAsGuest = () => {
        setStatus('guest');
        localStorage.setItem('auth_status', 'guest');
    };

    const logout = () => {
        setStatus('loggedOut');
        localStorage.setItem('auth_status', 'loggedOut');
    };

    const loginWithGoogle = (googleId: string) => {
        setStatus('social');
        localStorage.setItem('auth_status', 'social');
        // Treat the googleId as the local user_id setting so the profile data fetches properly
        const date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `user_id=${googleId}; expires=${date.toUTCString()}; path=/`;
    };

    return (
        <AuthContext.Provider value={{ status, isLoading, loginAsGuest, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
