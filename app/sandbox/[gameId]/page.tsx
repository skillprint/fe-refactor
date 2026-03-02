"use client";

import { use } from 'react';
import Link from 'next/link';

export default function GameViewPage({ params }: { params: Promise<{ gameId: string }> }) {
    const resolvedParams = use(params);
    const gameId = resolvedParams.gameId;

    // The game path corresponds to the file inside public/games/generated
    const gameUrl = `/games/generated/${gameId}.html`;

    return (
        <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Top Navigation Bar */}
            <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/sandbox"
                        className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center text-sm font-medium"
                    >
                        ← Back to Sandbox
                    </Link>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px] md:max-w-md">
                        {gameId}
                    </h1>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Link copied to clipboard!");
                        }}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                        Copy Link
                    </button>
                    <a
                        href={gameUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md transition-colors"
                    >
                        Open Original
                    </a>
                </div>
            </div>

            {/* Fullscreen Iframe */}
            <div className="flex-1 w-full relative bg-black">
                <iframe
                    src={gameUrl}
                    title={`Generated Game: ${gameId}`}
                    className="absolute inset-0 w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                />
            </div>
        </div>
    );
}
