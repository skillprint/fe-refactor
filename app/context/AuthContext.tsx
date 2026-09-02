'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setCookie, deleteCookie } from '../utils/cookieUtils';

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


const safeStorage = {
    getItem: (key: string): string | null => { try { return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null; } catch (e) { return null; } },
    setItem: (key: string, value: string) => { try { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); } catch (e) { } },
    removeItem: (key: string) => { try { if (typeof window !== 'undefined') window.localStorage.removeItem(key); } catch (e) { } }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>('loggedOut');
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<{ firstName: string; picture?: string } | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isEmbedded = window.self !== window.top;
            const urlParams = new URLSearchParams(window.location.search);
            const urlUserId = urlParams.get('user_id') || urlParams.get('userId');
            const firstName = urlParams.get('first_name');
            const profileImage = urlParams.get('profile_image');

            if (urlUserId) {
                const newStatus = isEmbedded ? 'partner' : 'social';
                setStatus(newStatus);
                setUserProfile({
                    firstName: firstName || '',
                    picture: profileImage || undefined
                });

                safeStorage.setItem('auth_status', newStatus);
                safeStorage.setItem('user_id', urlUserId);
                safeStorage.setItem('userId', urlUserId);

                if (firstName || profileImage) {
                    safeStorage.setItem('user_profile', JSON.stringify({
                        firstName: firstName || '',
                        picture: profileImage || undefined
                    }));
                } else {
                    safeStorage.removeItem('user_profile');
                }

                setCookie('user_id', urlUserId);

                setIsLoading(false);
                return;
            }

            if (isEmbedded) {
                const existingUserId = safeStorage.getItem('userId');
                if (existingUserId) {
                    safeStorage.setItem('auth_status', 'partner');
                    safeStorage.setItem('user_id', existingUserId);
                    setCookie('user_id', existingUserId);
                }
            } else {
                const currentStatus = safeStorage.getItem('auth_status');
                if (currentStatus === 'partner') {
                    safeStorage.setItem('auth_status', 'loggedOut');
                    safeStorage.removeItem('user_profile');
                }
            }
        }

        const storedStatus = safeStorage.getItem('auth_status') as AuthStatus | null;
        if (storedStatus) {
            setStatus(storedStatus);
        }
        const storedProfile = safeStorage.getItem('user_profile');
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
        safeStorage.setItem('auth_status', 'guest');
    };

    const logout = () => {
        setStatus('loggedOut');
        setUserProfile(null);
        safeStorage.setItem('auth_status', 'loggedOut');
        safeStorage.removeItem('user_profile');
        safeStorage.removeItem('org_token');
        safeStorage.removeItem('user_id');
        safeStorage.removeItem('userId');
        deleteCookie('user_id');
        deleteCookie('ftue_completed');
    };

    const loginWithSocialId = (socialId: string, profile: { firstName: string; picture?: string }) => {
        setStatus('social');
        setUserProfile(profile);
        safeStorage.setItem('auth_status', 'social');
        safeStorage.setItem('user_profile', JSON.stringify(profile));
        safeStorage.setItem('user_id', socialId); // Added to sync with localStorage
        // Treat the socialId as the local user_id setting so the profile data fetches properly
        setCookie('user_id', socialId);
    };

    const loginAsOrg = (token: string, profile: { firstName: string }) => {
        setStatus('organization');
        setUserProfile(profile);
        safeStorage.setItem('auth_status', 'organization');
        safeStorage.setItem('user_profile', JSON.stringify(profile));
        safeStorage.setItem('org_token', token);
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
