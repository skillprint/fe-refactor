'use client';

import { useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useGamesBySkill } from '../hooks/useGamesBySkill';
import { unifiedSlugFromBESlug } from '../game/[slug]/GameClient';
import { newGameSlugs } from '../config/newGames';
import BuckyballLoading from '../components/BuckyballLoading';
import GamePreviewShareSheet from '../components/GamePreviewShareSheet';
import { PLAYBOOKS } from '../hooks/usePlaybook';
import { useGameSessions } from '../hooks/useGameSessions';
import { getGameDetails } from '../config/gameConfig';
import { useAuth } from '../context/AuthContext';
import PortalLayout from '@/components/PortalLayout';
import { PortalPageMain, PortalSection } from '@/components/LayoutGrid';
import { PortalSectionHint, PortalSectionTitle } from '@/components/Typography';
import { GameTile } from '@/components/GameTile';
import { PlaybookTile } from '@/components/PlaybookTile';
import { GameRail } from '@/components/GameRail';
import { GamesFilter, SkillOption } from '@/components/GamesFilter';
import { useRecommendedGames } from '../hooks/useRecommendedGames';

function GamesPageContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter');
  const isNewFilter = initialFilter === 'new';
  const { status } = useAuth();

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedCognition, setSelectedCognition] = useState<string | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewGameSlug, setPreviewGameSlug] = useState<string | null>(null);
  
  const { moods, skills, gamesBySkill, gamesByMood, isLoading } = useGamesBySkill();
  const { sessions } = useGameSessions();
  const { recommendedGames, isLoading: isLoadingRecommended } = useRecommendedGames(10);

  // Games to exclude (blacklist)
  const BLACKLISTED_GAMES = ['infinite-runner-3d', 'hextris', 'fruit-ninja', 'plastoblasto', 'flappy-bird-1', 'lastwar-frontline', 'line-color'];

  const availableSkillSlugs = new Set(
    gamesBySkill
      .filter((game: any) => !BLACKLISTED_GAMES.includes(game.slug))
      .flatMap((game: any) => game.skills?.map((s: any) => s.slug) || [])
  );

  const availableMoodSlugs = new Set(
    gamesByMood
      .filter((game: any) => !BLACKLISTED_GAMES.includes(game.slug))
      .flatMap((game: any) => game.moods?.map((m: any) => m.slug) || [])
  );

  // Re-map skills to pillars for the filter
  const moodOptions: SkillOption[] = moods
    .filter((m: any) => availableMoodSlugs.has(m.slug))
    .map((m: any) => ({ slug: m.slug, name: m.name, pillar: 'mood' }));
    
  const cognitionOptions: SkillOption[] = skills
    .filter((s: any) => availableSkillSlugs.has(s.slug))
    // We assume skills from useGamesBySkill are mostly cognition.
    // In a real app we'd map this accurately from the taxonomy.
    .map((s: any) => ({ slug: s.slug, name: s.name, pillar: 'cognition' }));

  const personalityOptions: SkillOption[] = []; // Add if available

  // Get all unique games
  const allAvailableGames = useMemo(() => {
    const combined = [...gamesBySkill, ...gamesByMood];
    const unique = Array.from(new Map(combined.map(item => [item.slug, item])).values());
    return unique.filter((game: any) => !BLACKLISTED_GAMES.includes(game.slug));
  }, [gamesBySkill, gamesByMood]);

  // Apply filters
  let filteredGames = allAvailableGames.filter((game: any) => {
    let matchesMood = true;
    let matchesCognition = true;
    let matchesPersonality = true;

    if (selectedMood) {
      matchesMood = game.moods?.some((m: any) => m.slug === selectedMood) || false;
    }
    if (selectedCognition) {
      matchesCognition = game.skills?.some((s: any) => s.slug === selectedCognition) || false;
    }
    // No personality games implemented yet, so skip matching it

    const matchesSearch = searchQuery === '' ||
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.description && game.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesMood && matchesCognition && matchesPersonality && matchesSearch;
  });

  if (isNewFilter) {
    filteredGames = filteredGames.filter((game: any) =>
      newGameSlugs.includes(unifiedSlugFromBESlug(game.slug))
    );
  }

  const handleClearAll = () => {
    setSelectedMood(null);
    setSelectedCognition(null);
    setSelectedPersonality(null);
  };

  const playbookData = Object.values(PLAYBOOKS).map((playbook) => {
    let nextGameSlug = playbook.games[0];
    let completedCount = 0;

    for (let i = 0; i < playbook.games.length; i++) {
      const slug = playbook.games[i];
      const isCompleted = sessions.some(s => s.gameSlug === slug && s.metadata?.playbookId === playbook.id && s.completed);
      if (isCompleted) {
        completedCount++;
      } else if (nextGameSlug === playbook.games[0] && completedCount === i) {
        nextGameSlug = slug;
      }
    }
    const isFinished = completedCount === playbook.games.length;
    const firstGameDetails = getGameDetails(playbook.games[0]);

    return { playbook, completedCount, isFinished, nextGameSlug, firstGameDetails };
  });

  return (
    <>
      <PortalLayout>
        <PortalPageMain>
          {/* Header */}
          <div className="portal-head">
            <div className="portal-eyebrow">Games</div>
            <div className="portal-head__row">
              <h1>Ready to play</h1>
              <Link className="button button--secondary button--md" href="/skills">
                How games build skills 
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
              </Link>
            </div>
            <p>50 short games, and every one of them is a measurement. Play a round and it reads how you think, decide and hold your nerve, then feeds that reading back as skills you can watch build session by session.</p>
          </div>

          {/* Recommended for you */}
          <PortalSection ariaLabelledBy="gamesPicked">
            <div className="portal-section__bar">
                <div>
                  <PortalSectionTitle id="gamesPicked">Recommended for you</PortalSectionTitle>
                  <PortalSectionHint>Attention has the most headroom this week, so these read it hardest.</PortalSectionHint>
                </div>
                <Link className="portal-section__link" href="/skills">
                  Develop a specific skill <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
                </Link>
              </div>
              <GameRail isLibrary>
                {recommendedGames.slice(0, 5).map((game: any, i: number) => (
                  <GameTile
                    key={game.slug}
                    id={game.slug}
                    title={game.name}
                    description={game.description}
                    image={game.screenshot || game.image || '/images/default-game.jpg'}
                    url={`/game_session?game=${game.slug}`}
                    skills={game.skills ? game.skills.map((s: string | any) => ({ id: s.id || s, name: s.name || s, dimension: 'cognition' as const })) : []}
                    tone={(["pink", "mint", "green", "blue", "yellow", "purple"] as const)[i % 6]}
                    statusBadge="Recommended"
                  />
                ))}
              </GameRail>
          </PortalSection>

          {/* Playbooks */}
          {status !== 'partner' && (
            <PortalSection ariaLabelledBy="gamesPlaybooks">
              <div className="portal-section__bar">
                <div>
                  <PortalSectionTitle id="gamesPlaybooks">Playbooks</PortalSectionTitle>
                  <PortalSectionHint>A short sequence with one job. Finish the set and the skills it targets move together.</PortalSectionHint>
                </div>
              </div>
              <GameRail>
                {playbookData.map((data, i) => (
                  <PlaybookTile
                    key={data.playbook.id}
                    id={data.playbook.id}
                    title={data.playbook.title}
                    description={data.playbook.description}
                    iconSrc={`/assets/icons/playbook-${['focus', 'learning', 'wellness'][i % 3]}.svg`}
                    nextGameSlug={data.nextGameSlug}
                    nextGameImage={data.firstGameDetails?.image || '/images/default-game.jpg'}
                    totalGames={data.playbook.games.length}
                    completedGames={data.completedCount}
                    isFinished={data.isFinished}
                    tone={(["pink", "magenta", "orange", "blue", "green", "yellow", "purple"] as const)[i % 7]}
                  />
                ))}
              </GameRail>
            </PortalSection>
          )}

          {/* All Games */}
          <PortalSection ariaLabelledBy="gamesAll">
            <div className="portal-section__bar">
              <div>
                <PortalSectionTitle id="gamesAll">All games</PortalSectionTitle>
                <PortalSectionHint>Every game adapts to you as you play. Start from the skill you want to move.</PortalSectionHint>
              </div>
              
              {/* Search Field */}
              <label className="search-field field__control--both position-relative">
                <span className="sr-only position-absolute padding-none clip no-wrap border-none">Search games</span>
                <svg className="sp-icon position-absolute text-muted" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-search"></use></svg>
                <input 
                  className="full-width" 
                  aria-label="Search games" 
                  autoComplete="off" 
                  id="gameSearch" 
                  placeholder="Search games or skills" 
                  type="search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  aria-label="Clear search" 
                  className="clear-search button button--tertiary button--icon-only button--md surface-transparent text-muted position-absolute border-none radius-control layout-grid place-center" 
                  hidden={!searchQuery}
                  id="clearSearch" 
                  type="button"
                  onClick={() => setSearchQuery('')}
                >
                  <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-close"></use></svg>
                </button>
              </label>
            </div>

            <GamesFilter
              moods={moodOptions}
              cognitions={cognitionOptions}
              personalities={personalityOptions}
              selectedMood={selectedMood}
              selectedCognition={selectedCognition}
              selectedPersonality={selectedPersonality}
              onSelectMood={setSelectedMood}
              onSelectCognition={setSelectedCognition}
              onSelectPersonality={setSelectedPersonality}
              onClearAll={handleClearAll}
            />

            <div className="portal-toolbar">
              <span className="portal-toolbar__count" id="resultCount" role="status" aria-atomic="true">
                {isLoading ? 'Loading...' : `${filteredGames.length} games`}
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <BuckyballLoading />
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="portal-blank">
                <p className="portal-blank__title">No games found</p>
                <p className="portal-blank__note">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="game-grid game-grid--portal grid grid-3" id="gameGrid">
                {filteredGames.map((game: any, i: number) => (
                  <GameTile
                    key={game.slug}
                    id={game.slug}
                    title={game.name}
                    description={game.description || ''}
                    image={game.screenshot || game.image || '/images/default-game.jpg'}
                    url={`/game_session?game=${game.slug}`}
                    skills={game.skills ? game.skills.map((s: string | any) => ({ id: s.id || s, name: s.name || s, dimension: 'cognition' as const })) : []}
                    tone={(["pink", "mint", "green", "blue", "yellow", "purple"] as const)[i % 6]}
                  />
                ))}
              </div>
            )}
          </PortalSection>
        </PortalPageMain>
      </PortalLayout>

      <GamePreviewShareSheet 
        slug={previewGameSlug} 
        isOpen={!!previewGameSlug} 
        onClose={() => setPreviewGameSlug(null)} 
      />
    </>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><BuckyballLoading /></div>}>
      <GamesPageContent />
    </Suspense>
  );
}
