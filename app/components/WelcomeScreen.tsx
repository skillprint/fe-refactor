'use client';

import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export function WelcomeScreen() {
    const { loginAsGuest } = useAuth();
    const [isHovered, setIsHovered] = useState<string | null>(null);

    // Decorative ambient circles
    const circles = [
        { bg: "bg-blue-500", size: "w-64 h-64", top: "-top-32", left: "-left-32", delay: "animation-delay-0" },
        { bg: "bg-purple-500", size: "w-72 h-72", top: "top-1/4", left: "-right-24", delay: "animation-delay-2000" },
        { bg: "bg-pink-500", size: "w-80 h-80", top: "-bottom-40", left: "left-1/3", delay: "animation-delay-4000" },
    ];

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
                {circles.map((circle, i) => (
                    <div
                        key={i}
                        className={`absolute ${circle.bg} ${circle.size} ${circle.top} ${circle.left} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob ${circle.delay}`}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 mx-4 bg-card/60 backdrop-blur-xl border border-border rounded-3xl shadow-2xl transition-all duration-500">

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
                <div className="flex flex-col gap-4">

                    <button
                        onClick={loginAsGuest}
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
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-card hover:bg-accent border border-border rounded-xl font-medium text-foreground transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Google</span>
                        </button>

                        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-card hover:bg-accent border border-border rounded-xl font-medium text-foreground transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5">
                            <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.73 3.93-.65 1.31.06 2.53.53 3.4 1.45-2.92 1.62-2.96 5.8 4.29 8.35v1.23c-1.12 3.19-2.9 5.84-6.7 1.79zm-2.12-14.34C15.93 2.92 13.92 2.61 12 3.4c-.66.27-1.12.75-1.39 1.4-.41.95-.5 2.01-.25 3.05 1.6.22 3.65-1.57 4.57-1.91z" />
                            </svg>
                            <span>Apple</span>
                        </button>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-8 text-center text-xs text-muted-foreground">
                    By continuing, you agree to our <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
                </div>
            </div>
        </div>
    );
}
