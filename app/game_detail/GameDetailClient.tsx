'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PortalLayout from '@/components/PortalLayout';
import { PortalPageLayout, PortalPageMain, PortalPageRail, PortalSection } from '@/components/LayoutGrid';
import { PortalSectionTitle, PortalSectionHint } from '@/components/Typography';
import { GameTile, GameTileSkill } from '@/components/GameTile';
import { SkillCard, SkillCardProps } from '@/components/SkillCard';
import { GameDetailRecord } from '@/components/GameDetailRecord';
import { GameDetailBadge } from '@/components/GameDetailBadge';
import { IconInfoCardWithDescription } from '@/components/IconInfoCardWithDescription';
import { GameRail } from '@/components/GameRail';
import BuckyballLoading from '@/app/components/BuckyballLoading';
import { useLibraryGameDetail } from '@/lib/models/portal/useLibraryGameDetail';
import { useLibraryGame } from '@/lib/models/portal/useLibraryGame';
import { useLibraryPersonalStats } from '@/lib/models/portal/useLibraryPersonalStats';
import { useLibraryCommunityStats } from '@/lib/models/portal/useLibraryCommunityStats';
import { useTaxonomySkills } from '@/lib/models/portal/useTaxonomySkills';
import { allTaxonomySkills, findTaxonomySkill } from '@/lib/models/portal/TaxonomySkills';
import { useProfileAggregate } from '@/lib/models/portal/useProfileAggregate';
import { profileDimensionMap } from '@/lib/models/portal/ProfileAggregate';
import { useLibraryGameBadges } from '@/lib/models/portal/useLibraryGameBadges';
import type { LibraryGame } from '@/lib/models/portal/LibraryGame';
import type { TaxonomySkillsResponse } from '@/lib/models/portal/TaxonomySkills';
import { useRecommendedGames } from '@/app/hooks/useRecommendedGames';
import { Pillar, skillIconId, titleFromSlug } from '@/lib/skillIcons';
import { PORTAL_SKILLS } from '@/app/config/skillsTaxonomy';
import { getGameConfig, getGameDetails } from '@/app/config/gameConfig';
import { baseSlug } from '@/lib/gameSlug';
import { DEFAULT_GAME_IMAGE, formatEstimatedDuration } from '@/lib/playbookUtils';

interface GameDetailClientProps {
  /** The `?game=` value: any slug form; the library detail resolves it. */
  slug: string;
}

const TILE_TONES = ['pink', 'mint', 'green', 'blue', 'yellow', 'purple'] as const;

/** A skill slug as a pill, with its real pillar from the taxonomy. */
function skillPill(slug: string, taxonomy: TaxonomySkillsResponse | null, fallbackPillar: Pillar): GameTileSkill {
  const tax = findTaxonomySkill(taxonomy, slug);
  const local = PORTAL_SKILLS[slug];
  return {
    id: slug,
    name: tax?.name || local?.name || titleFromSlug(slug),
    dimension: tax?.pillar || local?.pillar || fallbackPillar,
  };
}

/** Cover art for a library record: backend artwork first, the local asset for games the backend has none for. */
function gameImage(game: Pick<LibraryGame, 'screenshot' | 'thumbnail' | 'baseSlug'>): string {
  return game.screenshot || game.thumbnail || localGameImage(game.baseSlug);
}

/** The cover shipped with this frontend, or the generic art. */
function localGameImage(slug: string): string {
  return getGameDetails(slug)?.image || DEFAULT_GAME_IMAGE;
}

/** When backend artwork fails to load, step down to the local cover, then the generic art. */
function stepDownImage(img: HTMLImageElement, slug: string) {
  const current = img.getAttribute('src');
  const local = localGameImage(slug);
  if (current !== local && current !== DEFAULT_GAME_IMAGE) img.src = local;
  else if (current !== DEFAULT_GAME_IMAGE) img.src = DEFAULT_GAME_IMAGE;
}

function BackToGames() {
  return (
    <Link className="stat-hero__back layout-inline-flex items-center gap-md font-sm weight-semibold no-grow" href="/games">
      <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-left"></use></svg>
      Games
    </Link>
  );
}

export default function GameDetailClient({ slug }: GameDetailClientProps) {
  const decodedSlug = decodeURIComponent(slug || '');
  // Dev only: `?synthetic=1` renders the mock record (a player with history)
  // and mock community stats without a backend.
  const synthetic = useSearchParams().get('synthetic') === '1';
  const { data: game, isLoading, error, notFound } = useLibraryGameDetail(decodedSlug);
  // The record and community calls take the slug the detail resolved to, so a
  // placeholder or legacy slug in the URL still finds the player's history.
  const canonicalSlug = game?.slug || '';
  const { data: personal, isLoading: isLoadingPersonal } = useLibraryPersonalStats(canonicalSlug, synthetic);
  const { data: community } = useLibraryCommunityStats(canonicalSlug, synthetic);
  const { data: library } = useLibraryGame();
  const { data: taxonomy } = useTaxonomySkills();
  const { data: profile } = useProfileAggregate();
  const { data: gameBadges } = useLibraryGameBadges(canonicalSlug, synthetic);
  const { recommendedGames } = useRecommendedGames(10);

  const scores = useMemo(() => profileDimensionMap(profile), [profile]);

  // Skills the game exercises (cognition) and moods it targets, each with the
  // pillar, description and icon the taxonomy gives it and the player's own
  // score as progress. Nothing here is assigned round-robin.
  const skillCards: SkillCardProps[] = useMemo(() => {
    if (!game) return [];
    const tags = [
      ...game.skills.map((t) => ({ ...t, fallback: 'cognition' as Pillar })),
      ...game.moods.map((t) => ({ ...t, fallback: 'mood' as Pillar })),
    ];
    return tags.map((tag) => {
      const tax = findTaxonomySkill(taxonomy, tag.slug);
      const local = PORTAL_SKILLS[tag.slug];
      const pillar = tax?.pillar || local?.pillar || tag.fallback;
      return {
        id: tag.slug,
        name: tax?.name || tag.name || local?.name || titleFromSlug(tag.slug),
        description: tax?.description || local?.blurb || '',
        dimension: pillar,
        iconId: skillIconId(pillar, tag.slug, tax?.icon),
        progressPercentage: Math.round(scores[tag.slug]?.score ?? 0),
      };
    });
  }, [game, taxonomy, scores]);

  const skillPills: GameTileSkill[] = skillCards.map((s) => ({ id: s.id, name: s.name, dimension: s.dimension }));

  // "N of your M skills": the measured pillars, from the taxonomy.
  const totalSkills = useMemo(() => {
    const all = allTaxonomySkills(taxonomy).filter((s) => s.pillar !== 'personality');
    return all.length || Object.values(PORTAL_SKILLS).filter((s) => s.pillar !== 'personality').length;
  }, [taxonomy]);

  // Games that share a skill or mood with this one, most overlap first. Only
  // games this frontend ships a build for: the library also lists games the
  // PWA cannot open yet (their "playable" flag is the backend's, not ours).
  const moreLikeThis = useMemo(() => {
    if (!game || !library) return [];
    const mine = new Set([...game.skills.map((s) => s.slug), ...game.moods.map((m) => m.slug)]);
    return library
      .filter((g) => g.baseSlug !== game.baseSlug && getGameDetails(g.baseSlug))
      .map((g) => ({ game: g, overlap: [...g.skills, ...g.moods].filter((s) => mine.has(s)).length }))
      .filter((x) => x.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 5)
      .map((x) => x.game);
  }, [game, library]);

  const isRecommended = !!game && recommendedGames.some((g: any) => g?.slug && baseSlug(g.slug) === game.baseSlug);

  // The badges this game works toward and how far the player is (SKI-182);
  // empty until the endpoint answers, so the card only renders with data.
  const badges = gameBadges?.badges ?? [];

  if (notFound) {
    return (
      <PortalLayout pageClass="page--portal-game-detail">
        <div className="portal-head">
          <BackToGames />
          <div className="portal-head__row"><h1>Game not found</h1></div>
        </div>
        <div className="portal-blank">
          <p className="portal-blank__title">We could not find that game</p>
          <p className="portal-blank__note">It may have been retired, or the link is out of date.</p>
          <Link className="button button--secondary button--sm" href="/games">Browse games</Link>
        </div>
      </PortalLayout>
    );
  }

  if (isLoading || !game) {
    return (
      <PortalLayout pageClass="page--portal-game-detail">
        <div className="portal-head">
          <BackToGames />
          <div className="portal-head__row"><h1>Game</h1></div>
        </div>
        {error ? (
          <div className="portal-blank">
            <p className="portal-blank__title">We could not load this game</p>
            <p className="portal-blank__note">Please try again in a moment.</p>
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <BuckyballLoading />
          </div>
        )}
      </PortalLayout>
    );
  }

  const playUrl = `/game/${encodeURIComponent(game.slug)}`;
  const blurb = game.longDescription || game.shortDescription;
  const category = game.category || game.genres[0] || null;
  const targetMoods = game.moods.map((m) => findTaxonomySkill(taxonomy, m.slug)?.name || m.name || titleFromSlug(m.slug));
  // Adjustable games ship a parameter manifest the backend tunes during play.
  const adaptsToYou = Boolean(getGameConfig(game.baseSlug).parameterManifest);
  const instructions = game.instructions || getGameDetails(game.baseSlug)?.instructions || '';
  const hasRecord = (personal?.sessionsPlayed ?? 0) > 0;

  return (
    <PortalLayout pageClass="page--portal-game-detail">
      <div className="portal-head">
        <BackToGames />
        <div className="portal-head__row">
          <h1 data-gd-title="" id="gdTitle">{game.name}</h1>
        </div>
      </div>

      <PortalPageLayout>
        <PortalPageMain>
          {/* Game Overview */}
          <PortalSection ariaLabelledBy="gameOverview">
            <div className="gd-hero__grid grid">
              <div className="gd-art position-relative clip" data-gd-art="">
                <div className="gd-art__stack stack position-absolute inset-none clip">
                  <img
                    alt={`${game.name} game artwork`}
                    className="gd-art__layer gd-art__layer--static position-absolute layout-block"
                    data-gd-art-static=""
                    src={gameImage(game)}
                    onError={(e) => stepDownImage(e.currentTarget, game.baseSlug)}
                  />
                </div>
                {isRecommended && (
                  <span className="gd-art__flag media-badge ui-badge position-absolute layout-inline-flex items-center radius-full font-xs leading-sm" data-gd-status="" data-status="recommended">
                    <span data-gd-status-label="">Recommended</span>
                  </span>
                )}
              </div>

              <div className="gd-hero__copy">
                {blurb && <p className="gd-blurb text-muted" data-gd-blurb="">{blurb}</p>}
                <ul className="gd-facts layout-flex wrap gap-lg margin-none padding-none">
                  {!!game.suggestedDurationSeconds && (
                    <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                      <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-clock"></use></svg>
                      <span className="text-muted">Est. time:</span><span data-gd-time="">{formatEstimatedDuration(game.suggestedDurationSeconds)}</span>
                    </li>
                  )}
                  {category && (
                    <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                      <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg>
                      <span className="text-muted">Category:</span><span data-gd-category="">{category}</span>
                    </li>
                  )}
                  {game.difficulty ? (
                    <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                      <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trending"></use></svg>
                      <span className="text-muted">Difficulty:</span><span data-gd-difficulty="">{game.difficulty}</span>
                    </li>
                  ) : adaptsToYou && (
                    <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                      <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trending"></use></svg>
                      <span className="text-muted">Challenge:</span><span>Adapts to you</span>
                    </li>
                  )}
                </ul>
                {targetMoods.length > 0 && (
                  <p className="gd-target margin-none layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold text-muted">
                    <svg className="sp-icon sp-icon--sm sp-icon--mood" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-category-mood"></use></svg>
                    Targeting: <strong className="text-default" data-gd-target="">{targetMoods.join(', ')}</strong>
                  </p>
                )}

                <div className="gd-actions cluster wrap">
                  <Link className="gd-play button button--primary button--lg no-grow" data-gd-play="" href={playUrl}>
                    <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
                    <span data-gd-play-label="">Play {game.name}</span>
                  </Link>
                </div>
              </div>
            </div>
          </PortalSection>

          {/* Skills */}
          {skillCards.length > 0 && (
            <PortalSection ariaLabelledBy="gdSkills">
              <div className="portal-section__bar">
                <div className="min-width-0">
                  <PortalSectionTitle id="gdSkills">Skills</PortalSectionTitle>
                  <PortalSectionHint data-gd-insight="">Develops {skillCards.map((s) => s.name.toLowerCase()).join(', ')}.</PortalSectionHint>
                </div>
                <Link className="portal-section__link" href="/skills">
                  All skills <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
                </Link>
              </div>
              <div className="skill-grid grid" data-gd-skill-groups="">
                {skillCards.map((skill) => (
                  <SkillCard key={skill.id} {...skill} />
                ))}
              </div>
            </PortalSection>
          )}

          {/* Adapts to You */}
          {adaptsToYou && (
            <PortalSection ariaLabelledBy="gdAdapt">
              <IconInfoCardWithDescription
                title="Adapts to you"
                note="This game adjusts its speed and difficulty to your performance as you play, so the reading stays useful whether it is your first run or your fiftieth."
                iconId="ti-bolt"
              />
            </PortalSection>
          )}

          {/* How to play */}
          {instructions && (
            <PortalSection ariaLabelledBy="gdHowto" className="separator-top">
              <div className="portal-section__bar">
                <div>
                  <PortalSectionTitle id="gdHowto">How to play</PortalSectionTitle>
                </div>
              </div>
              <div className="gd-panel sp-card">
                <p className="margin-none text-muted leading-md" data-gd-how="">{instructions}</p>
              </div>
            </PortalSection>
          )}

          {/* More like this */}
          {moreLikeThis.length > 0 && (
            <PortalSection ariaLabelledBy="gdRelated" className="separator-top">
              <div className="portal-section__bar">
                <div>
                  <PortalSectionTitle id="gdRelated">More like this</PortalSectionTitle>
                  <PortalSectionHint>Games that train the same skills.</PortalSectionHint>
                </div>
              </div>

              <GameRail className="margin-none padding-none">
                {moreLikeThis.map((g, i) => (
                  <GameTile
                    key={g.slug}
                    id={g.slug}
                    title={g.name}
                    description={g.shortDescription || ''}
                    image={gameImage(g)}
                    url={`/game/${encodeURIComponent(g.slug)}`}
                    duration={g.suggestedDurationSeconds ? formatEstimatedDuration(g.suggestedDurationSeconds) : undefined}
                    skills={[
                      ...g.skills.map((s) => skillPill(s, taxonomy, 'cognition')),
                      ...g.moods.map((m) => skillPill(m, taxonomy, 'mood')),
                    ]}
                    tone={TILE_TONES[i % TILE_TONES.length]}
                  />
                ))}
              </GameRail>
            </PortalSection>
          )}
        </PortalPageMain>

        <PortalPageRail>
          <GameDetailRecord
            gameTitle={game.name}
            gameSlug={game.slug}
            hasRecord={hasRecord}
            isLoading={isLoadingPersonal && !personal}
            sessionsCount={personal?.sessionsPlayed ?? 0}
            sessionsThisWeek={personal?.sessionsThisWeek ?? 0}
            bestFlow={personal?.bestFlowScore ?? null}
            lastFlow={personal?.lastFlowScore ?? null}
            bestScore={personal?.bestScore ?? null}
            lastScore={personal?.lastScore ?? null}
            minutes={Math.round((personal?.totalPlaySeconds ?? 0) / 60)}
            streak={personal?.streakDays ?? 0}
            lastPlayedAt={personal?.lastPlayedAt ?? null}
            community={community}
            skillsCount={skillCards.length}
            totalSkills={totalSkills}
            skills={skillPills.slice(0, 3)}
          />

          <GameDetailBadge badges={badges} gameTitle={game.name} gameImage={gameImage(game)} />
        </PortalPageRail>
      </PortalPageLayout>
    </PortalLayout>
  );
}
