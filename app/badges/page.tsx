'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomTabs from '../components/BottomTabs';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    date: string;
    color: string;
    gameTitle: string;
    gameImage: string;
    longDescription: string;
}

const mockBadges: Badge[] = [
    {
        id: '1',
        name: 'First Steps',
        description: 'Played your first game',
        icon: '🏆',
        date: '2023-12-01',
        color: 'from-yellow-400 to-orange-500',
        gameTitle: '2048',
        gameImage: '/games/live/2048/screenshot.png',
        longDescription: 'You took your first step into the world of cognitive training by playing your very first game. This badge marks the beginning of your journey!'
    },
    {
        id: '2',
        name: 'Sharp Mind',
        description: 'Reached level 10 in Memory',
        icon: '🧠',
        date: '2023-12-05',
        color: 'from-blue-400 to-indigo-500',
        gameTitle: 'Memory Match',
        gameImage: '/games/live/Alchemy/icon_144.png',
        longDescription: 'Your memory skills are getting sharper! You reached level 10 in Memory Match, showing great retention and focus.'
    },
    {
        id: '3',
        name: 'Speed Demon',
        description: 'Completed a speed game in under 30s',
        icon: '⚡',
        date: '2023-12-10',
        color: 'from-red-400 to-pink-500',
        gameTitle: 'Speed Racer',
        gameImage: '/games/live/Bubble Spirit/bubble-spirit.png',
        longDescription: 'Lightning fast! You completed a round of Speed Racer in under 30 seconds. Your reaction time is impressive.'
    },
    {
        id: '4',
        name: 'Consistent',
        description: 'Played 7 days in a row',
        icon: '🔥',
        date: '2023-12-15',
        color: 'from-green-400 to-emerald-500',
        gameTitle: 'Daily Challenge',
        gameImage: '/games/live/hextris/icon_144.png',
        longDescription: 'Consistency is key to improvement. You have played for 7 consecutive days, building a strong habit of mental fitness.'
    }
];

const mockUnearnedBadges: Badge[] = [
    {
        id: '5',
        name: 'Puzzle Master',
        description: 'Complete 50 puzzle games',
        icon: '🧩',
        date: '',
        color: 'from-gray-300 to-gray-400',
        gameTitle: 'Any Puzzle Game',
        gameImage: '',
        longDescription: 'Show your dedication to solving problems by completing 50 different puzzle games. Keep playing to unlock this achievement!'
    },
    {
        id: '6',
        name: 'Night Owl',
        description: 'Play games after midnight',
        icon: '🦉',
        date: '',
        color: 'from-gray-300 to-gray-400',
        gameTitle: 'All Games',
        gameImage: '',
        longDescription: 'Burn the midnight oil! Play any game between 12 AM and 4 AM to earn this badge.'
    },
    {
        id: '7',
        name: 'Marathon Runner',
        description: 'Play for 2 hours in one session',
        icon: '🏃',
        date: '',
        color: 'from-gray-300 to-gray-400',
        gameTitle: 'All Games',
        gameImage: '',
        longDescription: 'Test your endurance by playing continuously for 2 hours. Take breaks if you need to, but keep the session active!'
    }
];

export default function BadgesPage() {
    const router = useRouter();
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const openModal = (badge: Badge) => {
        setSelectedBadge(badge);
        // Small delay to ensure the component is mounted before starting the transition
        setTimeout(() => setIsVisible(true), 10);
    };

    const closeModal = () => {
        setIsVisible(false);
        // Wait for the transition to finish before unmounting
        setTimeout(() => setSelectedBadge(null), 300);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isLocked = (badge: Badge) => !badge.date;

    return (
        <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
            <div className="p-8">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.back()}
                        className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Badges
                    </h1>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Earned Badges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {mockBadges.map((badge) => (
                        <div
                            key={badge.id}
                            onClick={() => openModal(badge)}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4 transform transition-all hover:scale-105 cursor-pointer"
                        >
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-3xl shadow-md flex-shrink-0`}>
                                {badge.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{badge.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Earned on {badge.date}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Available Badges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockUnearnedBadges.map((badge) => (
                        <div
                            key={badge.id}
                            onClick={() => openModal(badge)}
                            className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center space-x-4 transform transition-all hover:scale-105 cursor-pointer opacity-75 hover:opacity-100"
                        >
                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl shadow-inner flex-shrink-0 grayscale">
                                {badge.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">{badge.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">{badge.description}</p>
                                <div className="flex items-center mt-1 text-xs text-gray-400 font-medium">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Locked
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {selectedBadge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                        onClick={closeModal}
                    />
                    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className={`w-24 h-24 rounded-full ${isLocked(selectedBadge) ? 'bg-gray-200 dark:bg-gray-700 grayscale' : `bg-gradient-to-br ${selectedBadge.color}`} flex items-center justify-center text-5xl shadow-lg mb-6 ring-4 ring-white dark:ring-gray-700`}>
                                {selectedBadge.icon}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {selectedBadge.name}
                            </h2>

                            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                {selectedBadge.longDescription}
                            </p>

                            <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 text-left">
                                    {isLocked(selectedBadge) ? 'How to Earn' : 'Earned in Game'}
                                </p>
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {selectedBadge.gameImage ? (
                                            <img
                                                src={selectedBadge.gameImage}
                                                alt={selectedBadge.gameTitle}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-2xl">🎮</span>';
                                                }}
                                            />
                                        ) : (
                                            <span className="text-2xl">🎮</span>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                            {selectedBadge.gameTitle}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {isLocked(selectedBadge) ? 'Not yet earned' : `Played on ${selectedBadge.date}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {isLocked(selectedBadge) && (
                                <div className="mt-6 w-full">
                                    <button
                                        onClick={() => router.push('/games')}
                                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors shadow-lg"
                                    >
                                        Go to Games
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <BottomTabs />
        </div>
    );
}
