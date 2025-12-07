'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomTabs from "./components/BottomTabs";

// Skills data
const skills = [
  {
    id: 'memory',
    name: 'Memory',
    color: 'bg-indigo-100 text-indigo-800',
    gradient: 'from-indigo-500 to-purple-500',
    icon: '🧠',
    description: 'Enhance your recall and retention abilities'
  },
  {
    id: 'logic',
    name: 'Logic',
    color: 'bg-red-100 text-red-800',
    gradient: 'from-red-500 to-pink-500',
    icon: '🧩',
    description: 'Sharpen your reasoning and problem-solving'
  },
  {
    id: 'speed',
    name: 'Speed',
    color: 'bg-orange-100 text-orange-800',
    gradient: 'from-orange-500 to-yellow-500',
    icon: '⚡',
    description: 'Improve your reaction time and quick thinking'
  },
  {
    id: 'pattern',
    name: 'Pattern Recognition',
    color: 'bg-teal-100 text-teal-800',
    gradient: 'from-teal-500 to-cyan-500',
    icon: '🔍',
    description: 'Develop your ability to identify patterns'
  },
  {
    id: 'coordination',
    name: 'Coordination',
    color: 'bg-emerald-100 text-emerald-800',
    gradient: 'from-emerald-500 to-green-500',
    icon: '🎯',
    description: 'Build hand-eye coordination skills'
  },
];

// Games with their associated skills
const allGames = [
  {
    name: '2048',
    slug: '2048',
    description: 'Slide tiles to reach 2048',
    skills: ['logic', 'pattern']
  },
  {
    name: 'Alchemy',
    slug: 'alchemy',
    description: 'Combine elements to create new ones',
    skills: ['logic', 'pattern']
  },
  {
    name: 'Brick Out',
    slug: 'brick-out',
    description: 'Break all the bricks with your paddle',
    skills: ['coordination', 'speed']
  },
  {
    name: 'Bubble Spirit',
    slug: 'bubble-spirit',
    description: 'Pop bubbles in this puzzle game',
    skills: ['pattern', 'coordination']
  },
  {
    name: 'Change Word',
    slug: 'change-word',
    description: 'Transform words letter by letter',
    skills: ['memory', 'logic']
  },
  {
    name: 'Flapcat Steampunk',
    slug: 'flapcat-steampunk',
    description: 'Navigate through obstacles',
    skills: ['coordination', 'speed']
  },
  {
    name: 'Fruit Sorting',
    slug: 'fruit-sorting',
    description: 'Sort fruits by color and type',
    skills: ['pattern', 'coordination']
  },
  {
    name: 'Garden Match',
    slug: 'garden-match',
    description: 'Match garden items in this puzzle',
    skills: ['memory', 'pattern']
  },
  {
    name: 'Hextris',
    slug: 'hextris',
    description: 'Rotate and match hexagons',
    skills: ['coordination', 'speed']
  },
  {
    name: 'I Love Hue',
    slug: 'i-love-hue',
    description: 'Arrange colors in perfect harmony',
    skills: ['pattern', 'memory']
  },
  {
    name: 'Mahjong Deluxe',
    slug: 'mahjong-deluxe',
    description: 'Classic tile matching game',
    skills: ['memory', 'pattern']
  },
  {
    name: 'Mine Rusher',
    slug: 'mine-rusher',
    description: 'Navigate through the minefield',
    skills: ['logic', 'coordination']
  },
  {
    name: 'Snake Attack',
    slug: 'snake-attack',
    description: 'Grow your snake by eating food',
    skills: ['coordination', 'speed']
  },
  {
    name: 'Space Trip',
    slug: 'space-trip',
    description: 'Explore space in this adventure',
    skills: ['pattern', 'memory']
  },
  {
    name: 'Ultimate Sudoku',
    slug: 'ultimate-sudoku',
    description: 'Solve number puzzles',
    skills: ['logic', 'memory']
  },
];

// New games data - games marked as recently added
const newGames = [
  {
    name: 'Space Trip',
    slug: 'space-trip',
    description: 'Explore space in this adventure',
    gradient: 'from-purple-500 to-blue-500'
  },
  {
    name: 'I Love Hue',
    slug: 'i-love-hue',
    description: 'Arrange colors in perfect harmony',
    gradient: 'from-pink-500 to-purple-500'
  },
  {
    name: 'Hextris',
    slug: 'hextris',
    description: 'Rotate and match hexagons',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    name: 'Garden Match',
    slug: 'garden-match',
    description: 'Match garden items in this puzzle',
    gradient: 'from-green-500 to-emerald-500'
  },
];

export default function Home() {
  const [featuredSkill, setFeaturedSkill] = useState(skills[0]);
  const [skillGames, setSkillGames] = useState<typeof allGames>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Check for spotlight cookie
    const hasSeenSpotlight = document.cookie.split('; ').find(row => row.startsWith('spotlight_dismissed='));
    if (!hasSeenSpotlight) {
      setShowTooltip(true);
    }

    // Randomly select a skill on component mount
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    setFeaturedSkill(randomSkill);

    // Filter games that have this skill
    const gamesForSkill = allGames.filter(game =>
      game.skills.includes(randomSkill.id)
    );
    setSkillGames(gamesForSkill);
  }, []);

  const dismissTooltip = () => {
    setShowTooltip(false);
    // Set cookie to expire in 1 year
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `spotlight_dismissed=true; expires=${date.toUTCString()}; path=/`;
  };
  return (
    <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Spotlight Overlay */}
      {showTooltip && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
          onClick={dismissTooltip}
        />
      )}
      <div className="flex flex-col min-h-screen pb-32">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 px-8 py-12 sm:px-20 sm:py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Skillprint
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              Build skills through engaging games and track your progress
            </p>

            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <a
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gray-900 text-white gap-2 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 font-medium text-sm sm:text-base h-12 px-6 w-full sm:w-auto shadow-lg"
                href="/games"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Play Games
              </a>
              <a
                className="rounded-full border-2 border-gray-900 dark:border-white transition-colors flex items-center justify-center bg-transparent text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 font-medium text-sm sm:text-base h-12 px-6 w-full sm:w-auto"
                href="/profile"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </a>
            </div>
          </div>
        </div>

        {/* New Games Section */}
        <div className="px-4 sm:px-8 py-8 relative">
          {/* Tooltip for first item - Positioned relative to the section */}
          {showTooltip && (
            <div className="absolute top-24 left-80 sm:left-96 z-[60] w-64 bg-white dark:bg-white p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-bounce-slight">
              <div className="absolute top-6 -left-2 -translate-x-1/2 rotate-45 w-4 h-4 bg-white dark:bg-white border-l border-b border-gray-200 dark:border-gray-700"></div>
              <h3 className="font-bold text-gray-900 dark:text-black mb-1">Game Tile</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                This is a game tile. Click it to begin your game!
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dismissTooltip();
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 uppercase tracking-wide"
              >
                Got it
              </button>
            </div>
          )}

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                New Games
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Check out our latest additions
              </p>
            </div>
            <Link
              href="/games"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1"
            >
              See all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Horizontal scrollable game cards */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-4 min-w-min">
              {newGames.map((game, index) => (
                <div key={game.slug} className={`relative ${index === 0 && showTooltip ? 'z-50' : ''}`}>
                  <Link
                    href={`/game/${encodeURIComponent(game.slug)}/interstitial`}
                    className="block group flex-shrink-0 w-72"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      {/* Gradient header */}
                      <div className={`h-32 bg-gradient-to-br ${game.gradient} relative`}>
                        <div className="absolute top-3 right-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          NEW
                        </div>
                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-4">
                            <svg className="w-8 h-8 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {game.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {game.description}
                        </p>

                        <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                          Play Now
                          <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Skill Section */}
        <div className="px-4 sm:px-8 py-8 bg-gray-100 dark:bg-gray-800/50">
          <div className="mb-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{featuredSkill.icon}</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Featured Skill: {featuredSkill.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {featuredSkill.description}
                  </p>
                </div>
              </div>
              {/* Gradient underline */}
              <div className={`h-1 bg-gradient-to-r ${featuredSkill.gradient} rounded-full`}></div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Games to develop this skill
              </h3>
              <Link
                href="/games"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Horizontal scrollable skill game cards */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-4 min-w-min">
              {skillGames.length > 0 ? (
                skillGames.map((game) => (
                  <Link
                    key={game.slug}
                    href={`/game/${encodeURIComponent(game.slug)}/interstitial`}
                    className="block group flex-shrink-0 w-64"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      {/* Skill-themed header */}
                      <div className={`h-24 bg-gradient-to-br ${featuredSkill.gradient} relative flex items-center justify-center`}>
                        <span className="text-5xl opacity-30">{featuredSkill.icon}</span>
                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                          <div className="bg-white/95 dark:bg-gray-900/95 rounded-full p-3">
                            <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="p-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {game.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {game.description}
                        </p>

                        <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                          Play Now
                          <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-center py-8 w-full">
                  Loading games...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats or Additional Content */}
        <div className="px-4 sm:px-8 py-8 bg-white dark:bg-gray-800 mt-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              What would you like to do today?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/games"
                className="group p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Browse All Games</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Explore our full collection of games</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/profile"
                className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">View Your Progress</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track your skills and achievements</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}
