'use client';

import React, { useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomTabs from '../../../components/BottomTabs';
import { getGameConfig, getGameDetails } from '../../../config/gameConfig';

interface GameInterstitialProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function GameInterstitial({ params }: GameInterstitialProps) {
  const { slug } = React.use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Decode the URL slug (handle spaces and special characters)
  const decodedSlug = decodeURIComponent(slug);

  // Get game configuration and details
  const gameConfig = getGameConfig(decodedSlug);
  const gameDetails = getGameDetails(decodedSlug);

  if (!gameDetails) {
    notFound();
  }

  const handleStartGame = () => {
    setIsLoading(true);
    router.push(`/game/${encodeURIComponent(decodedSlug)}`);
  };

  const handleBackToGames = () => {
    router.push('/games');
  };

  return (
    <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col min-h-screen pb-32">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={handleBackToGames}
                className="mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Game Details
              </h1>
            </div>
          </div>
        </header>

        {/* Game Preview Section */}
        <main className="flex-1 px-4 py-6">
          <div className="max-w-2xl mx-auto">
            {/* Game Title and Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {gameDetails.name}
                </h2>
                {gameDetails.image ? (
                  <div className="w-32 h-32 mx-auto mb-4">
                    <img
                      src={gameDetails.image}
                      alt={gameDetails.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {gameDetails.description}
                </p>
              </div>
            </div>

            {/* Game Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                About This Game
              </h3>

              {gameDetails.category && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category:</span>
                  <span className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                    {gameDetails.category}
                  </span>
                </div>
              )}

              {gameDetails.difficulty && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Difficulty:</span>
                  <span className="ml-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                    {gameDetails.difficulty}
                  </span>
                </div>
              )}

              {gameDetails.estimatedTime && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Time:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {gameDetails.estimatedTime}
                  </span>
                </div>
              )}

              {gameDetails.skills && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills Developed:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {gameDetails.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {gameDetails.instructions && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">How to Play:</span>
                  <p className="mt-2 text-gray-900 dark:text-white">
                    {gameDetails.instructions}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartGame}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Game
                  </>
                )}
              </button>

              <button
                onClick={handleBackToGames}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
              >
                Back to Games
              </button>
            </div>
          </div>
        </main>

        {/* Bottom tabs */}
        <BottomTabs />
      </div>
    </div>
  );
} 