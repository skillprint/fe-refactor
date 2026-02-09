'use client';

import { useGameSessions } from '../hooks/useGameSessions';
import { useRouter } from 'next/navigation';

export default function ProgressBanner() {
    const { count } = useGameSessions();
    const router = useRouter();
    const targetGames = 3;
    const showProgress = count < targetGames;

    if (!showProgress) return null;

    // Calculate progress with minimum 5% for CTA feel
    const rawProgress = (count / targetGames) * 100;
    const displayProgress = Math.max(5, rawProgress);

    const handleClick = () => {
        router.push('/game/hextris/interstitial');
    };

    return (
        <div
            onClick={handleClick}
            className="sticky top-[4rem] z-[9] bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border-b border-white/20 cursor-pointer group transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
        >
            <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-4 flex flex-col items-center justify-center gap-2">
                    <div className="w-full max-w-2xl">
                        <div className="flex flex-col items-center gap-1 mb-3">
                            <span className="text-base font-bold text-white tracking-wide drop-shadow-md">
                                Play {targetGames - count} more {targetGames - count === 1 ? 'game' : 'games'} to unlock your profile!
                            </span>
                            <span className="text-xs text-white/80 font-medium flex items-center gap-1 group-hover:text-white transition-colors">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                                Click to play a random game
                            </span>
                        </div>
                        {/* Progress bar as bottom border effect */}
                        <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 transition-all duration-500 ease-out shadow-lg shadow-yellow-400/50 group-hover:shadow-yellow-400/70"
                                style={{ width: `${displayProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

