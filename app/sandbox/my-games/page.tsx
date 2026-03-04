"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { GeneratedGame } from '@/lib/models/GeneratedGame';

export default function MyGamesPage() {
    const { status, isLoading: isAuthLoading } = useAuth();
    const [games, setGames] = useState<GeneratedGame[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Filtering states
    const [activeTab, setActiveTab] = useState<'all' | 'mood' | 'skill'>('all');
    const [selectedFilterValue, setSelectedFilterValue] = useState<string | null>(null);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isAuthLoading) return;

        if (status === 'loggedOut' || status === 'guest') {
            setIsLoading(false);
            setError('Please log in to view your saved games.');
            return;
        }

        const fetchGames = async () => {
            try {
                const res = await fetch('/api/my-games');
                if (!res.ok) {
                    throw new Error('Failed to load games.');
                }
                const data = await res.json();
                setGames(data.games || []);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'An error occurred fetching your games.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGames();
    }, [isAuthLoading, status]);

    const handleTabChange = (tab: 'all' | 'mood' | 'skill') => {
        setActiveTab(tab);
        setSelectedFilterValue(null);
        setIsSearchActive(false);
        setSearchQuery('');
    };

    const handleFilterSelect = (value: string) => {
        setSelectedFilterValue(selectedFilterValue === value ? null : value);
    };

    const handleSearchToggle = () => {
        setIsSearchActive(!isSearchActive);
        if (isSearchActive) {
            setSearchQuery('');
        }
    };

    const getColorForValue = (val: string) => {
        const colorMap: Record<string, string> = {
            'focus': '#6366F1', // indigo-500
            'relax': '#10B981', // emerald-500
            'energy': '#F59E0B', // amber-500
            'logic': '#06B6D4', // cyan-500
            'memory': '#8B5CF6', // violet-500
            'reflex': '#EF4444', // red-500
        };
        if (colorMap[val]) return colorMap[val];

        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
        let hash = 0;
        for (let i = 0; i < val.length; i++) hash = val.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    // Calculate available filters from loaded games
    const availableMoods = Array.from(new Set(games.filter(g => g.target_mode === 'mood').map(g => g.target_value)));
    const availableSkills = Array.from(new Set(games.filter(g => g.target_mode === 'skill').map(g => g.target_value)));

    // Filter games
    const filteredGames = games.filter(game => {
        let matchesTab = true;
        if (activeTab === 'mood') matchesTab = game.target_mode === 'mood';
        if (activeTab === 'skill') matchesTab = game.target_mode === 'skill';

        let matchesFilter = true;
        if (selectedFilterValue) {
            matchesFilter = game.target_value === selectedFilterValue;
        }

        let matchesSearch = true;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            matchesSearch = Boolean(
                (game.title && game.title.toLowerCase().includes(query)) ||
                game.target_value.toLowerCase().includes(query) ||
                (game.optional_prompt && game.optional_prompt.toLowerCase().includes(query))
            );
        }

        return matchesTab && matchesFilter && matchesSearch;
    });

    if (isAuthLoading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-5xl">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">My Generated Games</h1>
                <Link href="/sandbox" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md shadow transition">
                    Create New Game
                </Link>
            </div>

            {/* Filter UI */}
            {games.length > 0 && (
                <div className="mb-8 flex flex-col gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleTabChange('all')}
                                    className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${activeTab === 'all'
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => handleTabChange('mood')}
                                    className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${activeTab === 'mood'
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Moods
                                </button>
                                <button
                                    onClick={() => handleTabChange('skill')}
                                    className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${activeTab === 'skill'
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Skills
                                </button>
                            </div>
                            <button
                                onClick={handleSearchToggle}
                                className={`p-2 rounded-lg transition-colors ${isSearchActive
                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>

                        {isSearchActive && (
                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by title, prompt, or target..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        autoFocus
                                    />
                                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {!isSearchActive && activeTab !== 'all' && (
                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex flex-wrap gap-2">
                                    {(activeTab === 'mood' ? availableMoods : availableSkills).map(val => {
                                        const color = getColorForValue(val);
                                        const isSelected = selectedFilterValue === val;
                                        return (
                                            <button
                                                key={val}
                                                onClick={() => handleFilterSelect(val)}
                                                className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 border ${isSelected
                                                    ? 'text-white shadow-md transform scale-105'
                                                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                                                    }`}
                                                style={{
                                                    backgroundColor: isSelected ? color : undefined,
                                                    borderColor: isSelected ? color : undefined,
                                                    color: isSelected ? '#ffffff' : undefined
                                                }}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {filteredGames.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No games found</h3>
                    {games.length === 0 ? (
                        <>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't generated any games yet. Head over to the Sandbox to create your first one!</p>
                            <Link href="/sandbox" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:dark:text-indigo-300">
                                Go to Sandbox &rarr;
                            </Link>
                        </>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query.</p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGames.map((game) => {
                        // Calculate game URL for the dedicated /sandbox/[gameId] route
                        // Assuming file_url looks like /games/generated/target-value-uuid.html
                        let gameRouteUrl = game.file_url;
                        if (game.file_url.startsWith('/games/generated/') && game.file_url.endsWith('.html')) {
                            const gameId = game.file_url.substring('/games/generated/'.length, game.file_url.length - 5);
                            gameRouteUrl = `/sandbox/${gameId}`;
                        }

                        return (
                            <div key={game.id} className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                <div className="p-6 flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${game.target_mode === 'mood'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            }`}>
                                            {game.target_mode}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(game.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <span className="text-2xl">{game.icon || '🎮'}</span>
                                        <span>{game.title || <span className="capitalize">{game.target_value}</span>}</span>
                                    </h3>
                                    {game.optional_prompt ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                            "{game.optional_prompt}"
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No prompt provided</p>
                                    )}
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                                    <Link
                                        href={gameRouteUrl}
                                        className="block flex-1 text-center py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                    >
                                        Play Game
                                    </Link>
                                    <Link
                                        href={`/sandbox?edit=${gameRouteUrl.replace('/sandbox/', '')}`}
                                        className="block flex-1 text-center py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Edit Game
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
