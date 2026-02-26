'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthStatus = 'loggedOut' | 'guest' | 'social';

interface AuthContextType {
    status: AuthStatus;
    isLoading: boolean;
    userProfile: { firstName: string; picture?: string } | null;
    loginAsGuest: () => void;
    loginWithSocialId: (socialId: string, profile: { firstName: string; picture?: string }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>('loggedOut');
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<{ firstName: string; picture?: string } | null>(null);

    useEffect(() => {
        // Check local storage on mount
        const storedStatus = localStorage.getItem('auth_status') as AuthStatus | null;
        if (storedStatus) {
            setStatus(storedStatus);
        }
        const storedProfile = localStorage.getItem('user_profile');
        if (storedProfile) {
            try {
                setUserProfile(JSON.parse(storedProfile));
            } catch (e) {
                console.error("Failed to parse user profile", e);
            }
        }
        setIsLoading(false);
    }, []);

    const loginAsGuest = () => {
        setStatus('guest');
        localStorage.setItem('auth_status', 'guest');
    };

    const logout = () => {
        setStatus('loggedOut');
        setUserProfile(null);
        localStorage.setItem('auth_status', 'loggedOut');
        localStorage.removeItem('user_profile');
    };

    const loginWithSocialId = (socialId: string, profile: { firstName: string; picture?: string }) => {
        setStatus('social');
        setUserProfile(profile);
        localStorage.setItem('auth_status', 'social');
        localStorage.setItem('user_profile', JSON.stringify(profile));
        localStorage.setItem('user_id', socialId); // Added to sync with localStorage
        // Treat the socialId as the local user_id setting so the profile data fetches properly
        const date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `user_id=${socialId}; expires=${date.toUTCString()}; path=/`;
    };

    return (
        <AuthContext.Provider value={{ status, isLoading, userProfile, loginAsGuest, loginWithSocialId, logout }}>
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
