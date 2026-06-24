'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Badge } from '../types';

interface GoalModalProps {
    badge: Badge;
    onClose: () => void;
}

export default function GoalModal({ badge, onClose }: GoalModalProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);

    // Confetti firework bursts
    const triggerConfettiExplosion = () => {
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval: any = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            // Side bursts
            confetti({ 
                ...defaults, 
                particleCount, 
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
            });
            confetti({ 
                ...defaults, 
                particleCount, 
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
            });
        }, 250);
    };

    useEffect(() => {
        setIsMounted(true);
        triggerConfettiExplosion();
    }, []);

    const handleClose = () => {
        setIsDismissing(true);
        setTimeout(() => {
            onClose();
        }, 300); // match exit transition duration
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 overflow-hidden">
            {/* Embedded styles for premium animations */}
            <style jsx global>{`
                @keyframes floatBob {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-8px) rotate(0.5deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes pulseGlow {
                    0% { opacity: 0.25; transform: scale(1) translate(-50%, -50%); }
                    50% { opacity: 0.55; transform: scale(1.25) translate(-50%, -50%); }
                    100% { opacity: 0.25; transform: scale(1) translate(-50%, -50%); }
                }
                @keyframes badgeSpin {
                    0% { transform: scale(0.3) rotate(-180deg); opacity: 0; }
                    60% { transform: scale(1.1) rotate(15deg); opacity: 1; }
                    100% { transform: scale(1) rotate(0deg); }
                }
                .animate-float-bob {
                    animation: floatBob 4s ease-in-out infinite;
                }
                .animate-pulse-glow {
                    animation: pulseGlow 3s ease-in-out infinite;
                }
                .animate-badge-spin {
                    animation: badgeSpin 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>

            {/* Backdrop Overlay */}
            <div
                className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300
                    ${isMounted && !isDismissing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={handleClose}
            />

            {/* Modal Card Container */}
            <div 
                className={`relative bg-card dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl border border-yellow-400/40 dark:border-yellow-400/20 transform transition-all duration-300 animate-float-bob
                    ${isMounted && !isDismissing 
                        ? 'opacity-100 scale-100 translate-y-0 rotate-0' 
                        : 'opacity-0 scale-90 translate-y-8 rotate-3 pointer-events-none'
                    }`}
            >
                {/* Radiant Sparkle Frame */}
                <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-yellow-400/30 pointer-events-none m-1 animate-pulse" />

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 dark:hover:bg-zinc-800 transition-colors z-20"
                    aria-label="Dismiss modal"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center relative z-10 flex flex-col items-center">
                    {/* Header Sparks */}
                    <span className="text-xs font-black tracking-widest text-yellow-500 uppercase mb-2">
                        🌟 Goal Reached! 🌟
                    </span>
                    <h2 className="text-2xl font-black text-foreground tracking-tight mb-6">
                        Achievement Unlocked
                    </h2>

                    {/* Animated Badge Icon Display */}
                    <div className="mb-6 relative w-32 h-32 flex items-center justify-center">
                        {/* Glow Aura */}
                        <div className={`absolute left-1/2 top-1/2 w-28 h-28 rounded-full bg-gradient-to-br ${badge.color} blur-xl animate-pulse-glow`} style={{ transform: 'translate(-50%, -50%)' }} />
                        
                        {/* Golden Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-yellow-400 flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }} />

                        {/* Actual Icon Wrapper */}
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${badge.color} text-white flex items-center justify-center text-5xl shadow-lg ring-4 ring-card dark:ring-zinc-900 animate-badge-spin z-10`}>
                            {badge.icon}
                        </div>
                    </div>

                    {/* Badge Details */}
                    <h3 className="text-xl font-bold text-foreground mb-2">
                        {badge.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed px-4">
                        {badge.longDescription}
                    </p>

                    {/* Reward Panel */}
                    <div className="w-full bg-muted/40 dark:bg-zinc-800/40 border border-border/40 rounded-2xl p-4 mb-6 text-left">
                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest block mb-2">
                            Rewards Earned
                        </span>
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">🏆</span>
                            <div>
                                <h4 className="font-extrabold text-sm text-foreground">
                                    +150 Brain Power Points
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Contributes to your overall {badge.category} cognitive rank.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Game Details */}
                    <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground mb-8 bg-zinc-100 dark:bg-zinc-800/60 px-3.5 py-1.5 rounded-full">
                        <span className="font-semibold text-foreground">Game:</span>
                        <span>{badge.gameTitle}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg shadow-purple-600/20 active:scale-95"
                        >
                            Awesome!
                        </button>
                        <button
                            onClick={() => {
                                alert(`Sharing achievement: "${badge.name}"!`);
                            }}
                            className="py-3 px-4 bg-muted hover:bg-muted-foreground/15 text-foreground font-bold rounded-xl transition-all border border-border/40 hover:border-border active:scale-95 flex items-center justify-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.754-3.458M8.684 13.258l4.754 3.458M14 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zM5 13a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
