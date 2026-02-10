'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TopNav from '../components/TopNav';
import ProgressBanner from '../components/ProgressBanner';
import Image from 'next/image';
import { useGamesBySkill } from '../hooks/useGamesBySkill';
import { unifiedSlugFromBESlug } from '../game/[slug]/GameClient';
import { newGameSlugs } from '../config/newGames';

type FilterType = 'moods' | 'skills';

function GamesPageContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as FilterType) || 'moods';
  const initialFilter = searchParams.get('filter');
  const isNewFilter = initialFilter === 'new';

  const [activeTab, setActiveTab] = useState<FilterType>(initialTab);
  const [selectedFilterSlug, setSelectedFilterSlug] = useState<string | null>(isNewFilter ? null : initialFilter);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { moods, skills, gamesBySkill, gamesByMood, isLoading, error } = useGamesBySkill();


  const filteredSkillsGames = gamesBySkill.filter((game: any) => {
    // First apply tab filtering
    let matchesTab = true;
    if (activeTab === 'skills' && selectedFilterSlug) {
      matchesTab = game.skills.map((skill: any) => skill.slug).includes(selectedFilterSlug);
    }

    // Then apply search filtering
    const matchesSearch = searchQuery === '' ||
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description && game.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const filteredMoodGames = gamesByMood.filter((game: any) => {
    // First apply tab filtering
    let matchesTab = true;
    if (activeTab === 'moods' && selectedFilterSlug) {
      matchesTab = game.moods.map((mood: any) => mood.slug).includes(selectedFilterSlug);
    }

    // Then apply search filtering
    const matchesSearch = searchQuery === '' ||
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description && game.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const nonDedupedFilteredGames = activeTab === 'skills' ? filteredSkillsGames : filteredMoodGames;

  // Apply deduplication
  let filteredGames = nonDedupedFilteredGames.filter((game: any, index: number) => {
    // TODO: import these games
    if (['infinite-runner-3d', 'hextris', 'fruit-ninja', 'plastoblasto', 'flappy-bird-1', 'lastwar-frontline', 'line-color'].includes(game.slug)) {
      return false;
    };
    return nonDedupedFilteredGames.findIndex((g: any) => g.slug === game.slug) === index;
  });

  // Apply 'new' filter if specified
  if (isNewFilter) {
    filteredGames = filteredGames.filter((game: any) =>
      newGameSlugs.includes(unifiedSlugFromBESlug(game.slug))
    );
  }

  const handleTabChange = (tab: FilterType) => {
    setActiveTab(tab);
    setSelectedFilterSlug(null);
    setIsSearchActive(false);
    setSearchQuery('');
  };

  const handleFilterSelect = (filterSlug: string) => {
    setSelectedFilterSlug(selectedFilterSlug === filterSlug ? null : filterSlug);
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

  const getColorForSlug = (slug: string) => {
    const colorMap: Record<string, string> = {
      'focus': '#6366F1', // indigo-500
      'relax': '#10B981', // emerald-500
      'memory': '#8B5CF6', // violet-500
      'speed': '#EF4444', // red-500
      'logic': '#06B6D4', // cyan-500
      'attention': '#F59E0B', // amber-500
      'problem-solving': '#3B82F6', // blue-500
      'language': '#EC4899', // pink-500
      'math': '#84CC16', // lime-500
      'visual': '#F97316', // orange-500
      'creativity': '#D946EF', // fuchsia-500
    };

    if (colorMap[slug]) return colorMap[slug];

    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
      hash = slug.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const getTintedBackground = (color: string, opacity: number) => {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };

  const activeColor = selectedFilterSlug ? getColorForSlug(selectedFilterSlug) : null;

  return (
    <div
      className="font-sans min-h-screen bg-background transition-colors duration-500 ease-in-out"
      style={{
        backgroundColor: activeColor ? getTintedBackground(activeColor, 0.03) : undefined
      }}
    >
      <div className="flex flex-col min-h-screen pb-32">
        <TopNav />
        <ProgressBanner />
        <div className="flex flex-col sticky top-16 z-40">

          {/* Tab Menu */}
          <div className="bg-card shadow-sm border-b border-border">
            <div className="px-4">
              <div className="flex space-x-1 py-1">
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
                {(activeTab === 'moods' ? moods : skills).map((item: any) => {
                  const color = getColorForSlug(item.slug);
                  const isSelected = selectedFilterSlug === item.slug;
                  return (
                    <button
                      key={item.slug}
                      onClick={() => handleFilterSelect(item.slug)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 border ${isSelected
                        ? 'text-white shadow-md transform scale-105'
                        : 'bg-transparent hover:bg-secondary text-foreground border-transparent'
                        }`}
                      style={{
                        backgroundColor: isSelected ? color : undefined,
                        borderColor: isSelected ? color : 'transparent',
                        color: isSelected ? '#ffffff' : undefined
                      }}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter Options - Show when search is active but tab is not 'all' */}
          {isSearchActive && (
            <div className="bg-card px-4 py-2 border-b border-border">
              <div className="flex flex-wrap gap-2">
                {(activeTab === 'moods' ? moods : skills).map((item: any) => {
                  const color = getColorForSlug(item.slug);
                  const isSelected = selectedFilterSlug === item.slug;
                  return (
                    <button
                      key={item.slug}
                      onClick={() => handleFilterSelect(item.slug)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 border ${isSelected
                        ? 'text-white shadow-md transform scale-105'
                        : 'bg-transparent hover:bg-secondary text-foreground border-transparent'
                        }`}
                      style={{
                        backgroundColor: isSelected ? color : undefined,
                        borderColor: isSelected ? color : 'transparent',
                        color: isSelected ? '#ffffff' : undefined
                      }}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 mt-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Games Grid */}
        <main className="flex-1 px-4 py-6">
          {filteredGames.length === 0 ? (
            <div className="text-center">
              <p className="text-muted-foreground text-lg font-semibold">
                {isLoading ? 'Loading games...' : ''}
                {!isLoading && !searchQuery ? 'No games found with the selected filter.' : !isLoading && searchQuery ? 'No games found matching your search.' : ''}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map((game: any) => (
                <Link
                  key={game.slug + Math.random().toString()}
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
                          if (!mood) return null;
                          const color = getColorForSlug(mood.slug);
                          return (
                            <span
                              key={moodId}
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: color }}
                            >
                              {mood.name}
                            </span>
                          );
                        })}
                        {game.skills.map((skillId: any) => {
                          const skill = skills.find((s: any) => s.id === skillId);
                          if (!skill) return null;
                          const color = getColorForSlug(skill.slug);
                          return (
                            <span
                              key={skillId}
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: color }}
                            >
                              {skill.name}
                            </span>
                          );
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

function GamesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <GamesPageContent />
    </Suspense>
  );
}

export default GamesPage;
