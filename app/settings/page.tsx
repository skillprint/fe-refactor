'use client';

import React, { useState, useEffect } from 'react';
import PortalLayout from '../../components/PortalLayout';
import PortalHead from '../../components/PortalHead';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../components/ThemeProvider';
import { getCookie } from '../utils/cookieUtils';

export default function SettingsPage() {
    const { status, userProfile, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [userId, setUserId] = useState<string>('');
    const [apiKey, setApiKey] = useState<string>('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [showTourResetAlert, setShowTourResetAlert] = useState(false);

    useEffect(() => {
        // Fetch user ID
        if (typeof window !== 'undefined') {
            const storedUserId = localStorage.getItem('user_id') || getCookie('user_id') || '';
            setUserId(storedUserId);
            
            const storedApiKey = getCookie('api_key') || process.env.NEXT_PUBLIC_API_KEY || '';
            setApiKey(storedApiKey);
        }
    }, []);

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleResetTour = () => {
        // Placeholder for actual reset logic
        setShowTourResetAlert(true);
        setTimeout(() => setShowTourResetAlert(false), 5000); // Auto-hide after 5 seconds
    };

    return (
        <PortalLayout pageClass="page--portal-settings">
            <PortalHead 
                eyebrow="Settings"
                title="Settings"
                description="Credentials, appearance and session controls for this account."
            />

            <section className="pp-section" id="settings">
                <div className="pp-settings sp-card" id="ppSettings">
                    
                    {/* API Configuration */}
                    <div className="pp-setting pp-setting--stack separator-bottom">
                        <h2>
                            <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-key"></use>
                            </svg>
                            API configuration
                        </h2>
                        <p className="pp-credential__note">Issued when this account was created. Read-only here &mdash; rotate them from the developer dashboard.</p>
                        
                        <div className="pp-setting__fields grid">
                            {/* User ID Field */}
                            <div className="pp-credential">
                                <div className="pp-credential__row">
                                    <div className="field">
                                        <label htmlFor="user_id">User ID</label>
                                        <input 
                                            id="user_id" 
                                            name="user_id" 
                                            type="text" 
                                            value={userId || 'sp_demo_7f3a91'} 
                                            readOnly 
                                            aria-describedby="user_id_help" 
                                        />
                                    </div>
                                    <button 
                                        className="button button--secondary button--md" 
                                        type="button" 
                                        onClick={() => handleCopy(userId || 'sp_demo_7f3a91')}
                                    >
                                        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                                            <use href="#ti-copy"></use>
                                        </svg>
                                        <span data-credential-label>Copy</span>
                                        <span className="sr-only"> User ID</span>
                                    </button>
                                </div>
                                <p className="pp-credential__note" id="user_id_help">Identifies this account to the API.</p>
                            </div>

                            {/* API Key Field */}
                            <div className="pp-credential">
                                <div className="pp-credential__row">
                                    <div className="field">
                                        <label htmlFor="api_key">API Key</label>
                                        <input 
                                            id="api_key" 
                                            name="api_key" 
                                            type={showApiKey ? 'text' : 'password'} 
                                            value={apiKey || 'skp_live_9042'} 
                                            readOnly 
                                            aria-describedby="api_key_help" 
                                        />
                                    </div>
                                    <button 
                                        className="button button--secondary button--icon-only button--md" 
                                        type="button" 
                                        aria-pressed={showApiKey} 
                                        aria-label="Show API Key"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                    >
                                        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                                            <use href={showApiKey ? "#ti-eye-off" : "#ti-eye"}></use>
                                        </svg>
                                    </button>
                                    <button 
                                        className="button button--secondary button--md" 
                                        type="button"
                                        onClick={() => handleCopy(apiKey || 'skp_live_9042')}
                                    >
                                        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                                            <use href="#ti-copy"></use>
                                        </svg>
                                        <span data-credential-label>Copy</span>
                                        <span className="sr-only"> API Key</span>
                                    </button>
                                </div>
                                <p className="pp-credential__note" id="api_key_help">Keep this secret. Anyone holding it can act as this account.</p>
                            </div>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="pp-setting separator-bottom">
                        <div>
                            <h2>Appearance</h2>
                            <p className="margin-none text-muted font-sm">Customize your interface theme</p>
                        </div>
                        <div className="button-group" role="group" aria-label="Interface theme">
                            <button 
                                className="button-group__item" 
                                type="button"
                                aria-pressed={theme === 'light' || theme === 'skillprint'}
                                onClick={() => setTheme('light')}
                            >
                                <svg className="sp-icon button-group__icon" aria-hidden="true" viewBox="0 0 24 24">
                                    <use href="#ti-sun"></use>
                                </svg>
                                Light
                            </button>
                            <button 
                                className="button-group__item" 
                                type="button"
                                aria-pressed={theme === 'dark'}
                                onClick={() => setTheme('dark')}
                            >
                                <svg className="sp-icon button-group__icon" aria-hidden="true" viewBox="0 0 24 24">
                                    <use href="#ti-moon"></use>
                                </svg>
                                Dark
                            </button>
                            <button 
                                className="button-group__item" 
                                type="button" 
                                aria-pressed={theme === 'midnight'}
                                onClick={() => setTheme('midnight')}
                            >
                                <svg className="sp-icon button-group__icon" aria-hidden="true" viewBox="0 0 24 24">
                                    <use href="#ti-star"></use>
                                </svg>
                                Midnight
                            </button>
                        </div>
                    </div>

                    {/* Reset the welcome tour */}
                    <div className="pp-setting separator-bottom">
                        <div>
                            <h2>Reset the welcome tour</h2>
                            <p className="margin-none text-muted font-sm">Clears the record of what you have already seen, so the welcome tour runs again.</p>
                        </div>
                        <button 
                            className="button button--secondary button--md" 
                            type="button"
                            onClick={handleResetTour}
                        >
                            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-refresh"></use>
                            </svg>
                            Reset
                        </button>
                    </div>

                    {/* Alert for tour reset */}
                    {!showTourResetAlert && (
                        <div className="sp-alert" data-alert="" data-alert-tone="success" hidden>
                        </div>
                    )}
                    {showTourResetAlert && (
                        <div className="sp-alert" data-alert="" data-alert-tone="success">
                            <svg className="sp-icon sp-alert__icon" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-success"></use>
                            </svg>
                            <div className="sp-alert__body">
                                <span className="sp-alert__title">Tour reset</span>
                                <p className="sp-alert__text">Refresh the page to see the welcome tour again.</p>
                            </div>
                            <button 
                                aria-label="Dismiss" 
                                className="icon-button button button--tertiary button--icon-only button--sm sp-alert__dismiss" 
                                type="button"
                                onClick={() => setShowTourResetAlert(false)}
                            >
                                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                                    <use href="#ti-close"></use>
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Legal */}
                    <div className="pp-setting separator-bottom">
                        <div>
                            <h2>Legal</h2>
                            <p className="margin-none text-muted font-sm">The policies this account is held to</p>
                        </div>
                        <div className="cluster gap-md">
                            <a className="button button--secondary button--md" href="https://skillprint.co/privacy" target="_blank" rel="noopener noreferrer" aria-label="Privacy Policy, opens in a new tab">Privacy Policy</a>
                            <a className="button button--secondary button--md" href="https://skillprint.co/terms" target="_blank" rel="noopener noreferrer" aria-label="Terms of Service, opens in a new tab">Terms of Service</a>
                        </div>
                    </div>

                    {/* Sign out */}
                    <div className="pp-setting">
                        <div>
                            <h2 className="text--danger">Sign out</h2>
                            <p className="margin-none text-muted font-sm">Signs this browser out. Your Skillprint and your history are kept.</p>
                            <p className="pp-credential__note pp-token" role="status">ID: {userId || 'none'}  Token: stored in this browser</p>
                        </div>
                        <button 
                            className="button button--danger button--md" 
                            type="button"
                            onClick={() => logout()}
                        >
                            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-logout"></use>
                            </svg>
                            Sign out
                        </button>
                    </div>

                </div>
            </section>
        </PortalLayout>
    );
}
