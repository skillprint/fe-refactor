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

            {games.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No games found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't generated any games yet. Head over to the Sandbox to create your first one!</p>
                    <Link href="/sandbox" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:dark:text-indigo-300">
                        Go to Sandbox &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map((game) => {
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
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize mb-2">
                                        {game.target_value}
                                    </h3>
                                    {game.optional_prompt ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                            "{game.optional_prompt}"
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No prompt provided</p>
                                    )}
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                                    <Link
                                        href={gameRouteUrl}
                                        className="block w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    >
                                        Play Game
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
