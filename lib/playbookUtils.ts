import type { GameTileProps } from '@/components/GameTile';
import { getGameDetails } from '@/app/config/gameConfig';
import { unifiedSlugFromBESlug } from '@/app/utils/slugUtils';
import type { PlaybookDetail, PlaybookGame, PlaybookSummary } from './models/portal/Playbooks';
import { PORTAL_SKILLS } from '@/app/config/skillsTaxonomy';
import { titleFromSlug } from './skillIcons';

export const DEFAULT_GAME_IMAGE = '/skillprint-portal-redesign/assets/images/games/game-arcade-machine.svg';
export const PLAYBOOK_ICON_BASE = '/skillprint-portal-redesign/assets/icons';

/** Generated playbooks carry no presentation; pick one off the pillar. */
const PILLAR_ICON: Record<string, string> = {
  cognition: 'playbook-focus',
  mood: 'playbook-wellness',
  personality: 'playbook-learning',
};

const PILLAR_TONE: Record<string, string> = {
  cognition: 'blue',
  mood: 'green',
  personality: 'purple',
};

type PlaybookLike = Pick<PlaybookSummary, 'icon' | 'tone' | 'pillar' | 'slug'>;

export function playbookIconSrc(playbook: PlaybookLike): string {
  const icon = playbook.icon || PILLAR_ICON[playbook.pillar] || 'playbook-focus';
  return `${PLAYBOOK_ICON_BASE}/${icon}.svg`;
}

/** Bare tone name (`pink`), whatever prefix the backend stored. */
export function playbookToneName(playbook: PlaybookLike): string {
  const raw = playbook.tone?.replace(/^tone--/, '');
  return raw || PILLAR_TONE[playbook.pillar] || 'pink';
}

/** Full class for the hero band (`tone--pink`). */
export function playbookToneClass(playbook: PlaybookLike): string {
  return `tone--${playbookToneName(playbook)}`;
}

export function formatEstimatedDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '5–10 min';
  const mins = Math.max(1, Math.round(seconds / 60));
  return `~${mins} min`;
}

/** Sum of the games' suggested durations, as the hero's "Est. time". */
export function playbookEstimatedTime(playbook: PlaybookDetail): string {
  if (playbook.estTime) return playbook.estTime;
  const total = playbook.games.reduce((n, g) => n + (g.estimatedDurationSeconds || 0), 0);
  if (!total) return `${playbook.games.length * 5}–${playbook.games.length * 10} min`;
  const mins = Math.round(total / 60);
  return `~${mins} min`;
}

export function playbookGameUrl(gameSlug: string, playbookSlug: string): string {
  return `/game/${encodeURIComponent(gameSlug)}?source=playbook&playbookId=${encodeURIComponent(playbookSlug)}`;
}

export function playbookGameImage(game: Pick<PlaybookGame, 'slug' | 'image'>): string {
  if (game.image) return game.image;
  const local = getGameDetails(unifiedSlugFromBESlug(game.slug));
  return local?.image || DEFAULT_GAME_IMAGE;
}

export function playbookGameToTile(
  game: PlaybookGame,
  playbook: Pick<PlaybookDetail, 'slug' | 'pillar'>,
  options: { played?: boolean; isNext?: boolean } = {}
): GameTileProps {
  const skills = (game.targetedSkills || []).map((slug) => ({
    id: slug,
    name: PORTAL_SKILLS[slug]?.name || titleFromSlug(slug),
    dimension: (PORTAL_SKILLS[slug]?.pillar || 'cognition') as 'mood' | 'cognition' | 'personality',
  }));

  return {
    id: game.slug,
    title: game.title,
    description: game.description || getGameDetails(unifiedSlugFromBESlug(game.slug))?.description || '',
    image: playbookGameImage(game),
    url: playbookGameUrl(game.slug, playbook.slug),
    duration: formatEstimatedDuration(game.estimatedDurationSeconds),
    skills,
    statusBadge: options.played ? 'Played' : options.isNext ? 'Next up' : undefined,
    tone: playbookToneName({ icon: null, tone: null, pillar: playbook.pillar, slug: playbook.slug }) as GameTileProps['tone'],
  };
}

/** Index of the next unplayed game in sequence order; wraps to 0 once the set is finished. */
export function nextGameIndex(playbook: Pick<PlaybookDetail, 'games' | 'progress'>): number {
  const played = playbook.progress?.playedGames ?? 0;
  if (!playbook.games.length) return 0;
  return played >= playbook.games.length ? 0 : played;
}
