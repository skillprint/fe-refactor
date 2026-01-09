'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getGameDetails } from '../config/gameConfig';

interface GameResults {
  score?: number;
  time?: number;
  level?: number;
  achievements?: string[];
  accuracy?: number;
  mistakes?: number;
  bonus?: number;
}

interface GameResultsInterstitialProps {
  gameSlug: string;
  results: GameResults;
  onPlayAgain: () => void;
  onBackToGames: () => void;
  isEarlyExit?: boolean;
}

export default function GameResultsInterstitial({
  gameSlug,
  results,
  onPlayAgain,
  onBackToGames,
  isEarlyExit = false
}: GameResultsInterstitialProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Decode the URL slug (handle spaces and special characters)
  const decodedSlug = decodeURIComponent(gameSlug);

  // Get game details
  const gameDetails = getGameDetails(decodedSlug);

  const handlePlayAgain = () => {
    setIsLoading(true);
    onPlayAgain();
  };

  const handleBackToGames = () => {
    onBackToGames();
  };

  const handleViewProfile = () => {
    router.push('/profile');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-destructive';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 80) return 'Great job!';
    if (score >= 70) return 'Good work!';
    if (score >= 60) return 'Not bad!';
    return 'Keep practicing!';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-center text-white">
          <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            {isEarlyExit ? (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isEarlyExit ? 'Game Paused' : 'Game Complete!'}
          </h2>
          <p className="text-blue-100">
            {isEarlyExit ? 'Here\'s your progress so far' : gameDetails?.name || decodedSlug}
          </p>
        </div>

        {/* Results Content */}
        <div className="p-6">
          {/* Score Section */}
          {results.score !== undefined && (
            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">
                <span className={getScoreColor(results.score)}>{results.score}</span>
                <span className="text-2xl text-gray-500">/100</span>
              </div>
              <p className="text-lg text-muted-foreground mb-2">
                {getScoreMessage(results.score)}
              </p>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${results.score}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {results.time !== undefined && (
              <div className="bg-secondary rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(results.time)}
                </div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>
            )}

            {results.level !== undefined && (
              <div className="bg-secondary rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.level}
                </div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
            )}

            {results.accuracy !== undefined && (
              <div className="bg-secondary rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {results.accuracy}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            )}

            {results.mistakes !== undefined && (
              <div className="bg-secondary rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.mistakes}
                </div>
                <div className="text-sm text-muted-foreground">Mistakes</div>
              </div>
            )}
          </div>

          {/* Bonus Points */}
          {results.bonus && results.bonus > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6 text-center">
              <div className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                🎉 Bonus Points!
              </div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                +{results.bonus}
              </div>
            </div>
          )}

          {/* Achievements */}
          {results.achievements && results.achievements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                🏆 Achievements Unlocked
              </h3>
              <div className="space-y-2">
                {results.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePlayAgain}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                  {isEarlyExit ? 'Continue Game' : 'Play Again'}
                </>
              )}
            </button>

            <button
              onClick={handleViewProfile}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </button>

            <button
              onClick={handleBackToGames}
              className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back to Games
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 