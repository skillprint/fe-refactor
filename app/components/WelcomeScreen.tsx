'use client';

import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { useLinkedIn } from 'react-linkedin-login-oauth2';
import { knownGameSlugs, getGameDetails } from '../config/gameConfig';

const ROWS = [
  { duration: 115, delay: -41, reverse: false },
  { duration: 132, delay: -15, reverse: true },
  { duration: 96, delay: -11, reverse: false },
  { duration: 129, delay: -47, reverse: true },
  { duration: 108, delay: -29, reverse: false },
  { duration: 143, delay: -73, reverse: true },
  { duration: 117, delay: -5, reverse: false },
  { duration: 104, delay: -33, reverse: true },
  { duration: 135, delay: -62, reverse: false },
  { duration: 122, delay: -21, reverse: true },
  { duration: 98, delay: -55, reverse: false },
  { duration: 140, delay: -38, reverse: true },
  { duration: 125, delay: -25, reverse: false },
  { duration: 110, delay: -50, reverse: true },
];

export function WelcomeScreen() {
    const { loginAsGuest, loginWithSocialId } = useAuth();
    const [isCompletingLogin, setIsCompletingLogin] = useState(false);

    const { linkedInLogin } = useLinkedIn({
        clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || 'dummy-client-id',
        redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/linkedin` : '',
        scope: 'openid profile email',
        onSuccess: async (code) => {
            setIsCompletingLogin(true);
            try {
                const response = await fetch('/api/auth/linkedin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });

                if (response.ok) {
                    const data = await response.json();
                    loginWithSocialId(`linkedin-${data.id || code.substring(0, 8)}`, {
                        firstName: data.firstName || 'LinkedIn User',
                        picture: data.picture
                    });
                } else {
                    console.error('LinkedIn backend error:', await response.text());
                    setIsCompletingLogin(false);
                }
            } catch (err) {
                console.error('LinkedIn network error', err);
                setIsCompletingLogin(false);
            }
        },
        onError: (error) => {
            console.error('LinkedIn Login Failed', error);
        },
    });

    const handleLoginAction = (action: () => void) => {
        setIsCompletingLogin(true);
        action();
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsCompletingLogin(true);
            try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const decoded = await userInfoRes.json();
                if (decoded && decoded.sub) {
                    const firstName = decoded.given_name || decoded.name || 'User';
                    const picture = decoded.picture;
                    loginWithSocialId(decoded.sub, { firstName, picture });
                } else {
                    setIsCompletingLogin(false);
                }
            } catch (err) {
                console.error('Failed to fetch Google user info', err);
                setIsCompletingLogin(false);
            }
        },
        onError: errorResponse => {
            console.error('Google Login Failed', errorResponse);
        },
    });

    // Build pool of known good game images for the animated tiles
    const tileImages = [
        '/images/activities/covers/2048.png',
        '/images/activities/covers/Hextris.png',
        '/images/activities/covers/alchemy-0d0a33e5-d249-42d2-91cc-a734b00e6113.png',
        '/images/activities/covers/box-tower.png',
        '/images/activities/covers/brick-out.png',
        '/images/activities/covers/bubble-spirit-d1e8e962-1243-4e94-a9f4-351dec27ae8a.png',
        '/images/activities/covers/change-word-0bc38905-8138-43f2-9ff5-a01a5f038782.png',
        '/images/activities/covers/colorize-2-79f1475d-c180-43e0-a496-0123c3972709.png',
        '/images/activities/covers/flapcat-steampunk-fe310887-b4c3-4cbb-96d4-575e5786.png',
        '/images/activities/covers/fruit-boom-cfc9640c-477d-437b-9d2f-54f972163c09.png',
        '/images/activities/covers/0hh1-e28b593f-4355-4b9e-8444-6f9e04ca1846.png',
        '/images/activities/covers/garden-match-f883d184-cb16-434c-a866-6eaff7bd05b2.png',
        '/images/activities/covers/i-love-hue-115ad80c-adb3-47fb-8be7-4b683133a94e.png',
        '/images/activities/covers/mine-rusher-08ac08e4-61d5-4ac8-8cef-d29273cf8448.png',
        '/images/activities/covers/snake-attack-3b730898-fe67-4e51-a655-57c81bd3efbc.png',
        '/images/activities/covers/space-trip-ce24666e-4467-4a25-8658-0f86a0fdcb20.png',
        '/images/activities/covers/ultimate-sudoku-c5f5177d-6a3e-43f6-b2d2-6a7a78c88e.png',
        '/images/activities/covers/sweet-memory-2-6b558e2a-cf49-4ea7-be60-2a8dda06b60.png',
        '/images/activities/covers/star-puzzles-c2b7b115-b851-419e-8052-cad293bac997.png',
        '/images/activities/covers/mahjong-deluxe-77a68085-f806-48c8-a3a8-a11450f3d80.png'
    ];

    return (
        <div className="page--portal-welcome" data-skillprint-page="portal-welcome">
            <div className="welcome-shell">
                {/* Animated Tiles Background */}
                <div className="welcome-field" data-welcome-field aria-hidden="true">
                    <div className="welcome-field__stage">
                        {ROWS.map((row, i) => {
                            // Deterministic shuffle for this row
                            const order = [...tileImages].sort((a, b) => (a.length * (i + 1)) % 5 - (b.length * (i + 1)) % 5);
                            // Ensure enough tiles to fill a large screen row (approx 24 cards per half)
                            const extendedOrder = [];
                            while (extendedOrder.length < 24) {
                                extendedOrder.push(...order);
                            }
                            const half = extendedOrder.slice(0, 24);
                            const trackItems = [...half, ...half]; // Duplicate for seamless loop

                            return (
                                <div key={i} className={`welcome-field__row ${row.reverse ? 'welcome-field__row--reverse' : ''}`}>
                                    <div className="welcome-field__track" style={{
                                        '--row-duration': `${row.duration}s`,
                                        '--row-delay': `${row.delay}s`,
                                        '--row-rest': `-${(((Math.abs(row.delay) / row.duration) % 1) * 50).toFixed(2)}%`,
                                    } as React.CSSProperties}>
                                        {trackItems.map((src, j) => (
                                            <span key={j} className="welcome-field__card">
                                                <img src={src} alt="" width="160" height="160" decoding="async" />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <main className="welcome-main" id="top">
                    <article className="auth-card sp-card">
                        
                        <div className="auth-card__head">
                            <h1 className="auth-card__title margin-none">Welcome to Skillprint</h1>
                            <p className="auth-card__lede margin-none text-muted">Short games that read how you think, and turn what you already play into a profile you can use.</p>
                        </div>
                        
                        <div className="auth-card__body">
                            {isCompletingLogin ? (
                                <div className="layout-flex items-center justify-center p-8">
                                    <svg className="sp-icon animate-spin text-muted" aria-hidden="true" viewBox="0 0 24 24">
                                        <use href="#ti-loading"></use>
                                    </svg>
                                </div>
                            ) : (
                                <>
                                    <button 
                                        className="auth-guest button button--primary button--lg full-width" 
                                        type="button"
                                        onClick={() => handleLoginAction(loginAsGuest)}
                                    >
                                        Play as guest 
                                        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                                            <use href="#ti-arrow-right"></use>
                                        </svg>
                                    </button>
                                    
                                    <p className="auth-divider layout-flex items-center gap-lg margin-none">
                                        <span className="auth-divider__rule no-grow border-none" aria-hidden="true"></span>
                                        <span className="ui-label auth-divider__label no-grow">Or continue with</span>
                                        <span className="auth-divider__rule no-grow border-none" aria-hidden="true"></span>
                                    </p>
                                    
                                    <div className="auth-providers layout-grid gap-md">
                                        <button 
                                            className="auth-provider button button--secondary button--md full-width" 
                                            type="button" 
                                            onClick={() => loginWithGoogle()}
                                        >
                                            <img className="auth-provider__mark" src="/assets/logos/google-mark.svg" alt="" width="20" height="20" />
                                            <span>Continue with Google</span>
                                        </button>
                                        
                                        <FacebookLogin
                                            appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'dummy-app-id'}
                                            autoLoad={false}
                                            fields="name,email,picture"
                                            callback={(response: any) => {
                                                const socialId = response.id || response.userID;
                                                if (socialId) {
                                                    const firstName = response.name ? response.name.split(' ')[0] : 'User';
                                                    const picture = response.picture?.data?.url;
                                                    handleLoginAction(() => loginWithSocialId(socialId, { firstName, picture }));
                                                } else {
                                                    console.error('Facebook Login Failed', response);
                                                }
                                            }}
                                            render={(renderProps: any) => (
                                                <button className="auth-provider button button--secondary button--md full-width" type="button" onClick={renderProps.onClick}>
                                                    <img className="auth-provider__mark" src="/assets/logos/facebook-mark.svg" alt="" width="20" height="20" />
                                                    <span>Continue with Facebook</span>
                                                </button>
                                            )}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <p className="auth-legal margin-none text-center text-muted font-xs leading-md">
                            By continuing you agree to our <a className="text-link text-strong" href="https://skillprint.co/terms" target="_blank" rel="noopener noreferrer" aria-label="Terms of Service, opens in a new tab">Terms of Service</a> and <a className="text-link text-strong" href="https://skillprint.co/privacy" target="_blank" rel="noopener noreferrer" aria-label="Privacy Policy, opens in a new tab">Privacy Policy</a>.
                        </p>
                    </article>
                </main>
            </div>
        </div>
    );
}

