'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNav from '../components/TopNav';
import Image from 'next/image';
import { useGamesBySkill } from '../hooks/useGamesBySkill';
import { unifiedSlugFromBESlug } from '../game/[slug]/GameClient';
import { getGameDetails } from '../config/gameConfig';

type FilterType = 'moods' | 'skills';

export default function GamesPage() {
  const [activeTab, setActiveTab] = useState<FilterType>('moods');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { moods, skills, gamesBySkill, gamesByMood, isLoading, error } = useGamesBySkill();

  const filteredSkillsGames = gamesBySkill.filter((game: any) => {
    // First apply tab filtering
    let matchesTab = true;
    if (activeTab === 'skills' && selectedFilter) {
      matchesTab = game.skills.includes(selectedFilter);
    }

    // Then apply search filtering
    const matchesSearch = searchQuery === '' ||
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const filteredMoodGames = gamesByMood.filter((game: any) => {
    // First apply tab filtering
    let matchesTab = true;
    if (activeTab === 'moods' && selectedFilter) {
      matchesTab = game.moods.includes(selectedFilter);
    }

    // Then apply search filtering
    const matchesSearch = searchQuery === '' ||
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const filteredGames = activeTab === 'skills' ? filteredSkillsGames : filteredMoodGames;

  const handleTabChange = (tab: FilterType) => {
    setActiveTab(tab);
    setSelectedFilter(null);
    setIsSearchActive(false);
    setSearchQuery('');
  };

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(selectedFilter === filterId ? null : filterId);
  };

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchQuery('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="font-sans min-h-screen bg-background">
      <div className="flex flex-col min-h-screen pb-32">
        <TopNav />
        <div className="flex flex-col sticky top-16 z-40">

          {/* Tab Menu */}
          <div className="bg-card shadow-sm border-b border-border">
            <div className="px-4">
              <div className="flex space-x-1 py-1">
                {/* <button
                  onClick={() => handleTabChange('all')}
                  className={`px-4 py-1 text-[13px] rounded-lg font-medium transition-colors ${activeTab === 'all'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  All Games
                </button> */}
                <button
                  onClick={() => handleTabChange('moods')}
                  className={`px-4 py-1 text-[13px] rounded-lg font-medium transition-colors ${activeTab === 'moods'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Moods
                </button>
                <button
                  onClick={() => handleTabChange('skills')}
                  className={`px-4 py-1 text-[13px] rounded-lg font-medium transition-colors ${activeTab === 'skills'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Skills
                </button>
                {/* search button */}
                <button
                  onClick={handleSearchToggle}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${isSearchActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Search Box - Overlaps filter menu when active */}
          {isSearchActive && (
            <div className="bg-card px-4 py-3 border-b border-border shadow-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 pl-10 pr-4 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder-muted-foreground"
                  autoFocus
                />
                <svg
                  className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Options */}
          {!isSearchActive && (
            <div className="bg-card px-4 py-2 border-b border-border">
              <div className="flex flex-wrap gap-2">
                {(activeTab === 'moods' ? moods : skills).map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleFilterSelect(item.id)}
                    className={`px-2 py-1 rounded-full text-[12px] font-medium transition-colors ${selectedFilter === item.id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                      } ${item.color} hover:opacity-80`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter Options - Show when search is active but tab is not 'all' */}
          {isSearchActive && (
            <div className="bg-card px-4 py-2 border-b border-border">
              <div className="flex flex-wrap gap-2">
                {(activeTab === 'moods' ? moods : skills).map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleFilterSelect(item.id)}
                    className={`px-2 py-1 rounded-full text-[12px] font-medium transition-colors ${selectedFilter === item.id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                      } ${item.color} hover:opacity-80`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Games Grid */}
        <main className="flex-1 px-4 py-6">
          {filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {isLoading ? 'Loading games...' : ''}
                {!isLoading && !searchQuery ? 'No games found with the selected filter.' : !isLoading && searchQuery ? 'No games found matching your search.' : ''}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map((game: any) => (
                <Link
                  key={game.slug}
                  href={`/game/${unifiedSlugFromBESlug(game.slug)}/interstitial`}
                  className="block group"
                >
                  <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-200">
                    {game.screenshot && (
                      <div className="relative h-40 w-full bg-secondary">
                        <Image
                          src={game.screenshot}
                          alt={game.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                        {game.description}
                      </p>

                      {/* Game Tags */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {game.moods.map((moodId: any) => {
                          const mood = moods.find((m: any) => m.id === moodId);
                          return mood ? (
                            <span key={moodId} className={`px-2 py-1 rounded-full text-xs font-medium ${mood.color}`}>
                              {mood.name}
                            </span>
                          ) : null;
                        })}
                        {game.skills.map((skillId: any) => {
                          const skill = skills.find((s: any) => s.id === skillId);
                          return skill ? (
                            <span key={skillId} className={`px-2 py-1 rounded-full text-xs font-medium ${skill.color}`}>
                              {skill.name}
                            </span>
                          ) : null;
                        })}
                      </div>

                      <div className="mt-3 flex items-center text-primary text-sm font-medium">
                        Play Now
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        {/* Bottom tabs */}

      </div>
    </div>
  );
} 