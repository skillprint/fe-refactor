'use client';

import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

export function WelcomeScreen() {
    const { loginAsGuest, loginWithSocialId } = useAuth();
    const [isHovered, setIsHovered] = useState<string | null>(null);
    const [isCompletingLogin, setIsCompletingLogin] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const handleLoginAction = (action: () => void) => {
        setIsCompletingLogin(true);
        setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                action();
            }, 500); // Wait for transition fade out to complete
        }, 300); // Show spinner briefly 
    };

    // Decorative ambient circles
    const circles = [
        { bg: "bg-blue-500", size: "w-64 h-64", top: "-top-32", left: "-left-32", delay: "animation-delay-0" },
        { bg: "bg-purple-500", size: "w-72 h-72", top: "top-1/4", left: "-right-24", delay: "animation-delay-2000" },
        { bg: "bg-pink-500", size: "w-80 h-80", top: "-bottom-40", left: "left-1/3", delay: "animation-delay-4000" },
    ];

    return (
        <div className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-background transition-all duration-500 ease-in-out ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
                {circles.map((circle, i) => (
                    <div
                        key={i}
                        className={`absolute ${circle.bg} ${circle.size} ${circle.top} ${circle.left} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob ${circle.delay}`}
                    />
                ))}
            </div>

            <div className={`relative z-10 w-full max-w-md p-8 sm:p-10 mx-4 bg-card/60 backdrop-blur-xl border border-border rounded-3xl shadow-2xl transition-all duration-500 ${isExiting ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>

                {/* Header & Branding */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="relative w-20 h-20 mb-6 drop-shadow-xl overflow-hidden rounded-2xl ring-1 ring-border shadow-inner">
                        <Image
                            src="/logo192.png"
                            alt="Skillprint Logo"
                            layout="fill"
                            objectFit="cover"
                            className="hover:scale-105 transition-transform duration-500 ease-out"
                        />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                        Welcome to Skillprint
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base px-4">
                        Unlock your potential with games that adapt to improve your cognitive abilities.
                    </p>
                </div>

                {/* Login Actions */}
                <div className="flex flex-col gap-4 relative min-h-[160px]">
                    {isCompletingLogin ? (
                        <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
                            <div className="w-12 h-12 rounded-full border-4 border-muted border-t-foreground animate-spin"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 w-full animate-fade-in">
                            <button
                                onClick={() => handleLoginAction(loginAsGuest)}
                                onMouseEnter={() => setIsHovered('guest')}
                                onMouseLeave={() => setIsHovered(null)}
                                className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/25 overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-white/20 transform -translate-x-full transition-transform duration-500 ease-out ${isHovered === 'guest' ? 'translate-x-0' : ''}`} />
                                <span className="relative flex flex-row gap-2">Play as Guest
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg></span>
                            </button>

                            <div className="relative flex items-center py-4">
                                <div className="flex-grow border-t border-border"></div>
                                <span className="flex-shrink-0 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Or continue with</span>
                                <div className="flex-grow border-t border-border"></div>
                            </div>

                            {/* Social Provider Stubs */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-center w-full">
                                    <GoogleLogin
                                        onSuccess={credentialResponse => {
                                            if (credentialResponse.credential) {
                                                const decoded = jwtDecode(credentialResponse.credential) as any;
                                                if (decoded && decoded.sub) {
                                                    const firstName = decoded.given_name || decoded.name || 'User';
                                                    const picture = decoded.picture;
                                                    handleLoginAction(() => loginWithSocialId(decoded.sub, { firstName, picture }));
                                                }
                                            }
                                        }}
                                        onError={() => {
                                            console.error('Google Login Failed');
                                        }}
                                        useOneTap
                                        theme="outline"
                                        size="large"
                                        text="continue_with"
                                        shape="rectangular"
                                        width="384"
                                    />
                                </div>
                                <div className="flex items-center justify-center w-full">
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
                                            <button
                                                onClick={renderProps.onClick}
                                                className="flex items-center justify-center gap-2 w-full max-w-[384px] h-[40px] px-4 py-2 bg-white border border-[#747775] rounded text-[#1F1F1F] font-medium transition-colors hover:bg-gray-50"
                                                style={{ fontFamily: '"Roboto", arial, sans-serif', fontSize: '14px' }}
                                            >
                                                <svg className="w-[18px] h-[18px] text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                                Continue with Facebook
                                            </button>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer info */}
                <div className="mt-8 text-center text-xs text-muted-foreground">
                    By continuing, you agree to our <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
                </div>
            </div>
        </div>
    );
}
