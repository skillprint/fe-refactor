'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setCookie, deleteCookie } from '../utils/cookieUtils';
import { clearPlayerSession } from '../../lib/models/portal/playerSession';
import { holdToken } from '../../lib/models/portal/sharedToken';
import type { GoogleSignInResult } from '../../lib/models/portal/googleSignIn';

type AuthStatus = 'loggedOut' | 'guest' | 'social' | 'partner';

interface AuthContextType {
    status: AuthStatus;
    isLoading: boolean;
    userProfile: { firstName: string; picture?: string } | null;
    loginAsGuest: () => void;
    /**
     * A sign-in the backend verified and resolved to an account (Google,
     * SKI-264): this browser becomes that account from now on.
     */
    completeGoogleSignIn: (result: GoogleSignInResult, picture?: string) => void;
    /**
     * A provider whose token the backend does not verify yet (Facebook,
     * LinkedIn): the browser stays the guest it is and just shows the name.
     * `reportedEmail` is held in memory only, to prefill the email prompt;
     * it is never trusted and never stored.
     */
    loginWithProfile: (profile: { firstName: string; picture?: string }, reportedEmail?: string) => void;
    /** The address an unverified provider reported this page load, if any. */
    reportedEmail: string | null;
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
    const [reportedEmail, setReportedEmail] = useState<string | null>(null);

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

        // The org prototype that signed browsers in as an 'organization' is
        // gone (SKI-217). A browser still holding that status would otherwise
        // count as signed in with a token nothing accepts.
        if (safeStorage.getItem('auth_status') === 'organization') {
            safeStorage.setItem('auth_status', 'loggedOut');
            safeStorage.removeItem('org_token');
            safeStorage.removeItem('user_profile');
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
        setReportedEmail(null);
        safeStorage.setItem('auth_status', 'loggedOut');
        safeStorage.removeItem('user_profile');
        safeStorage.removeItem('org_token');
        clearPlayerSession();
        safeStorage.removeItem('user_id');
        safeStorage.removeItem('userId');
        deleteCookie('user_id');
        deleteCookie('ftue_completed');
    };

    const completeGoogleSignIn = (result: GoogleSignInResult, picture?: string) => {
        const profile = { firstName: result.firstName || 'Player', picture };
        // The account's internalId is this browser's identity from now on:
        // useUserSession and the SDK read `userId`, legacy routes the cookie.
        safeStorage.setItem('userId', result.internalId);
        safeStorage.setItem('user_id', result.internalId);
        setCookie('user_id', result.internalId);
        // A token cached for the previous guest must not outlive the switch.
        safeStorage.removeItem('userToken');
        holdToken(`guest:${result.internalId}`, result.token);
        setStatus('social');
        setUserProfile(profile);
        safeStorage.setItem('auth_status', 'social');
        safeStorage.setItem('user_profile', JSON.stringify(profile));
    };

    const loginWithProfile = (profile: { firstName: string; picture?: string }, email?: string) => {
        // No identity change: a provider id the backend has not verified is
        // not a credential, so it must not become this browser's userId.
        setStatus('social');
        setUserProfile(profile);
        setReportedEmail(email || null);
        safeStorage.setItem('auth_status', 'social');
        safeStorage.setItem('user_profile', JSON.stringify(profile));
    };

    return (
        <AuthContext.Provider value={{ status, isLoading, userProfile, loginAsGuest, completeGoogleSignIn, loginWithProfile, reportedEmail, logout }}>
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
