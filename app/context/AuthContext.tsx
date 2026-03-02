'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthStatus = 'loggedOut' | 'guest' | 'social' | 'partner' | 'organization';

interface AuthContextType {
    status: AuthStatus;
    isLoading: boolean;
    userProfile: { firstName: string; picture?: string } | null;
    loginAsGuest: () => void;
    loginWithSocialId: (socialId: string, profile: { firstName: string; picture?: string }) => void;
    loginAsOrg: (token: string, profile: { firstName: string }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>('loggedOut');
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<{ firstName: string; picture?: string } | null>(null);

    useEffect(() => {
        // Partner Mode Detection
        if (typeof window !== 'undefined' && window.self !== window.top) {
            const urlParams = new URLSearchParams(window.location.search);
            const partnerUserId = urlParams.get('user_id');
            const firstName = urlParams.get('first_name');
            const profileImage = urlParams.get('profile_image');

            if (partnerUserId) {
                setStatus('partner');
                setUserProfile({
                    firstName: firstName || '',
                    picture: profileImage || undefined
                });

                localStorage.setItem('auth_status', 'partner');
                localStorage.setItem('user_id', partnerUserId);

                if (firstName || profileImage) {
                    localStorage.setItem('user_profile', JSON.stringify({
                        firstName: firstName || '',
                        picture: profileImage || undefined
                    }));
                } else {
                    localStorage.removeItem('user_profile');
                }

                const date = new Date();
                date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
                document.cookie = `user_id=${partnerUserId}; expires=${date.toUTCString()}; path=/`;

                setIsLoading(false);
                return;
            }
        }

        // If not embedded, ensure partner mode is cleared
        if (typeof window !== 'undefined' && window.self === window.top) {
            const currentStatus = localStorage.getItem('auth_status');
            if (currentStatus === 'partner') {
                localStorage.setItem('auth_status', 'loggedOut');
                localStorage.removeItem('user_profile');
            }
        }

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
        localStorage.removeItem('org_token');
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

    const loginAsOrg = (token: string, profile: { firstName: string }) => {
        setStatus('organization');
        setUserProfile(profile);
        localStorage.setItem('auth_status', 'organization');
        localStorage.setItem('user_profile', JSON.stringify(profile));
        localStorage.setItem('org_token', token);
        // Cookies are set dynamically by the API, but we maintain the frontend state here.
    };

    return (
        <AuthContext.Provider value={{ status, isLoading, userProfile, loginAsGuest, loginWithSocialId, loginAsOrg, logout }}>
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
