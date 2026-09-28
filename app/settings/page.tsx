'use client';

import React, { Suspense, useState, useEffect } from 'react';
import PortalLayout from '../../components/PortalLayout';
import PortalHead from '../../components/PortalHead';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../components/ThemeProvider';
import { getCookie, deleteCookie } from '../utils/cookieUtils';
import { useNotificationPreferences } from '../../lib/models/portal/useNotificationPreferences';
import { useEmailAddress } from '../../lib/models/portal/useEmailAddress';
import { useUserSession } from '../hooks/useUserSession';
import EmailCapture from '../components/EmailCapture';

export default function SettingsPage() {
    const { status, userProfile, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    // Only 'light' renders light. The default 'skillprint' theme strips the
    // theme attributes, which leaves the portal's base (dark navy) palette.
    const isLight = theme === 'light';
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
        deleteCookie('ftue_completed');
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
                                aria-pressed={isLight}
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
                                aria-pressed={!isLight}
                                onClick={() => setTheme('dark')}
                            >
                                <svg className="sp-icon button-group__icon" aria-hidden="true" viewBox="0 0 24 24">
                                    <use href="#ti-moon"></use>
                                </svg>
                                Dark
                            </button>
                        </div>
                    </div>

                    {/* Email (SKI-234). In its own component under Suspense: it reads
                        the player session, which reads the URL, and a static page may
                        only do that inside a Suspense boundary. */}
                    <Suspense fallback={null}>
                        <EmailSettings />
                    </Suspense>

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

/**
 * Settings → Email.
 *
 * For a consumer account (SKI-265) the section follows the address: the
 * opt-in form until there is one, "check your inbox" while a confirmation
 * link is pending, and the address with one switch per kind of email once
 * it is confirmed. A verified address with nothing switched on (a Google
 * sign-in) still goes through the form, which asks the age question.
 *
 * Coaches and coached players (`available` false) keep the switches only
 * (SKI-234): their school manages their address.
 */
function EmailSettings() {
    const prefs = useNotificationPreferences();
    const address = useEmailAddress();
    const { userId } = useUserSession();
    const { reportedEmail } = useAuth();
    const [changing, setChanging] = useState(false);
    const state = address.data;

    if (!state || !state.available) {
        return <EmailToggles prefs={prefs} />;
    }

    const categories = prefs.data || [];
    const receiving = state.verified && categories.some((row) => row.enabled);
    let body: React.ReactNode;
    if (receiving && !changing) {
        body = (
            <div className="layout-grid gap-lg">
                <div className="layout-flex items-center gap-md wrap">
                    <p className="margin-none font-sm">
                        We email <strong className="text-strong">{state.email}</strong>.
                    </p>
                    <button type="button" className="button button--tertiary button--sm" onClick={() => setChanging(true)}>
                        Change
                    </button>
                </div>
                <EmailToggleList prefs={prefs} />
            </div>
        );
    } else if (state.pending && !changing) {
        body = (
            <div className="email-capture__done" role="status">
                <p className="margin-none font-sm">
                    Check your inbox: we sent a link to <strong className="text-strong">{state.pending}</strong>. Open it to confirm.
                </p>
                <button type="button" className="button button--tertiary button--sm" onClick={() => setChanging(true)}>
                    Use a different address
                </button>
            </div>
        );
    } else if (categories.length > 0) {
        body = (
            <EmailCapture
                categories={categories}
                submit={address.submit}
                userId={userId}
                defaultEmail={changing ? '' : state.verified ? state.email : reportedEmail}
                idPrefix="settings-email"
            />
        );
    }

    return (
        <div className="pp-setting pp-setting--stack separator-bottom" id="ppEmail">
            <div>
                <h2>Email</h2>
                <p className="margin-none text-muted font-sm">
                    {receiving
                        ? 'Choose what we email you about. Account emails, like confirmations, are always sent.'
                        : 'Get Skillprint by email. Nothing is sent until you choose it and confirm your address.'}
                </p>
                {prefs.error && (
                    <p className="margin-none font-sm text--danger" role="alert">{prefs.error}</p>
                )}
            </div>
            {body}
        </div>
    );
}

type Prefs = ReturnType<typeof useNotificationPreferences>;

/** One switch per kind of email this player can get (SKI-234). */
function EmailToggleList({ prefs }: { prefs: Prefs }) {
    return (
        <ul className="pp-email-list">
            {(prefs.data || []).map((row) => (
                <li key={row.category} className="pp-email-row">
                    <div>
                        <span className="font-sm weight-semibold" id={`email-${row.category}`}>{row.label}</span>
                        <p className="margin-none text-muted font-xs">{row.description}</p>
                    </div>
                    <button
                        className="sp-toggle"
                        type="button"
                        role="switch"
                        aria-checked={row.enabled}
                        aria-labelledby={`email-${row.category}`}
                        disabled={prefs.saving === row.category}
                        onClick={() => prefs.setEnabled(row.category, !row.enabled)}
                    >
                        <span className="sp-toggle__thumb"></span>
                    </button>
                </li>
            ))}
        </ul>
    );
}

/**
 * The switches alone, for accounts whose address is managed elsewhere. The
 * weekly summary switch is the old weekly_email_opt_in, not a second copy.
 */
function EmailToggles({ prefs }: { prefs: Prefs }) {
    return (
        <>
            {prefs.data && prefs.data.length > 0 && (
                <div className="pp-setting separator-bottom" id="ppEmail">
                    <div>
                        <h2>Email</h2>
                        <p className="margin-none text-muted font-sm">
                            Choose what we email you about. Account emails, like password resets, are always sent.
                        </p>
                        {prefs.error && (
                            <p className="margin-none font-sm text--danger" role="alert">{prefs.error}</p>
                        )}
                    </div>
                    <EmailToggleList prefs={prefs} />
                </div>
            )}
            {!prefs.data && prefs.error && (
                <div className="pp-setting separator-bottom">
                    <div>
                        <h2>Email</h2>
                        <p className="margin-none text-muted font-sm">{prefs.error}</p>
                    </div>
                </div>
            )}
        </>
    );
}
