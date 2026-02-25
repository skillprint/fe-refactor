'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthStatus = 'loggedOut' | 'guest' | 'social';

interface AuthContextType {
    status: AuthStatus;
    isLoading: boolean;
    loginAsGuest: () => void;
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

    return (
        <AuthContext.Provider value={{ status, isLoading, loginAsGuest, logout }}>
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
