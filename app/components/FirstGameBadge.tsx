import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { getGameDetails } from '../config/gameConfig';

interface FirstGameBadgeProps {
    onDismiss: () => void;
    nextGameSlug?: string;
}

export default function FirstGameBadge({ onDismiss, nextGameSlug }: FirstGameBadgeProps) {
    const [isVisible, setIsVisible] = useState(false);
    const nextGame = nextGameSlug ? getGameDetails(nextGameSlug) : null;

    useEffect(() => {
        // Trigger animation on mount with a small delay
        const timer = setTimeout(() => setIsVisible(true), 10);

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

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        // Wait for the transition to finish before calling onDismiss
        setTimeout(onDismiss, 300);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleDismiss}
            />
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 border-4 border-yellow-400 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="text-center">
                    <div className="mb-4 relative inline-block">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <span className="relative text-6xl">🏆</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        First Game Played!
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-base">
                        Congratulations! Play <span className="font-bold text-yellow-600 dark:text-yellow-400">2 more games</span> to unlock your unique Skillprint profile.
                    </p>

                    {nextGame && nextGameSlug && (
                        <div className="mb-6 text-left">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Recommended Next Game</p>
                            <Link href={`/game/${encodeURIComponent(nextGameSlug)}/interstitial`} onClick={handleDismiss}>
                                <div className="group bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                                    <div className="flex">
                                        <div className="w-24 h-24 relative flex-shrink-0">
                                            {nextGame.image ? (
                                                <img
                                                    src={nextGame.image}
                                                    alt={nextGame.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                                                    <span className="text-2xl">🎮</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 flex-1 flex flex-col justify-center">
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">
                                                {nextGame.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                                {nextGame.description}
                                            </p>
                                            <div className="flex items-center text-xs font-bold text-blue-500">
                                                Play Now
                                                <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    <button
                        onClick={handleDismiss}
                        className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
