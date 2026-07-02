'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Badge } from '../profile/badges/types';

interface BadgeUnlockPopupProps {
    badge: Badge;
    onDismiss: () => void;
}

export default function BadgeUnlockPopup({ badge, onDismiss }: BadgeUnlockPopupProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger opening animation
        const showTimer = setTimeout(() => setIsVisible(true), 50);

        // Confetti animation settings
        const duration = 2500;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 28, spread: 360, ticks: 60, zIndex: 10000 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 45 * (timeLeft / duration);
            // Confetti bursts from left and right sides
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 200);

        return () => {
            clearTimeout(showTimer);
            clearInterval(interval);
        };
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        // Wait for the exit scale-out transition before calling onDismiss
        setTimeout(onDismiss, 350);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            {/* Dark glassmorphic backdrop */}
            <div
                className={`absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-500 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={handleDismiss}
            />

            {/* Glowing container */}
            <div
                className={`relative bg-slate-900/90 dark:bg-slate-950/90 text-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/10 dark:border-slate-800/80 backdrop-blur-xl transform transition-all duration-500 ease-out ${
                    isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'
                }`}
            >
                {/* Rotating/pulsing halo behind the badge */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-full blur-[40px] opacity-35 animate-pulse pointer-events-none" />

                <div className="text-center relative z-10">
                    {/* Badge Icon Display */}
                    <div className="mb-6 relative inline-block">
                        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-6xl shadow-xl ring-8 ring-white/10 dark:ring-black/20 transform hover:scale-105 transition-transform duration-300`}>
                            {badge.icon || '🏆'}
                        </div>
                        
                        {/* UNLOCKED tag badge */}
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black tracking-widest px-4 py-1.5 rounded-full uppercase border border-white/20 shadow-md">
                            Unlocked!
                        </span>
                    </div>

                    {/* Badge Details */}
                    <span className="block text-xs font-bold text-amber-400/80 uppercase tracking-widest mb-1.5">
                        {badge.category || 'Milestone'} Badge
                    </span>

                    <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                        {badge.name}
                    </h2>

                    <p className="text-slate-200 font-medium text-lg leading-relaxed mb-4 px-2">
                        {badge.description}
                    </p>

                    {badge.longDescription && (
                        <p className="text-sm text-slate-400 leading-relaxed italic px-4 border-l-2 border-slate-700/60 mb-6 text-left">
                            {badge.longDescription}
                        </p>
                    )}

                    {/* Earned in Game reference */}
                    {badge.gameTitle && (
                        <div className="flex items-center gap-4 bg-slate-800/40 dark:bg-slate-900/60 rounded-2xl p-4 border border-white/5 mb-8 hover:bg-slate-800/60 transition-colors duration-200 text-left">
                            {badge.gameImage ? (
                                <img
                                    src={badge.gameImage}
                                    alt={badge.gameTitle}
                                    className="w-14 h-14 rounded-xl object-cover shadow-inner flex-shrink-0"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-xl bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                                    🎮
                                </div>
                            )}
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Earned in Game
                                </span>
                                <span className="text-base font-bold text-white block">
                                    {badge.gameTitle}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleDismiss}
                        className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-lg rounded-2xl shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                        Awesome!
                    </button>
                </div>
            </div>
        </div>
    );
}
