'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface FirstGameBadgeProps {
    onDismiss: () => void;
}

export default function FirstGameBadge({ onDismiss }: FirstGameBadgeProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation on mount
        setIsVisible(true);

        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-500 scale-100 animate-bounce-slight border-4 border-yellow-400">
                <div className="text-center">
                    <div className="mb-6 relative inline-block">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <span className="relative text-6xl">🏆</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        First Game Played!
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                        Congratulations on completing your first game! You're on your way to building your Skillprint.
                    </p>

                    <button
                        onClick={onDismiss}
                        className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
                    >
                        Awesome!
                    </button>
                </div>
            </div>
        </div>
    );
}
