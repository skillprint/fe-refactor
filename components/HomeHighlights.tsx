import React from 'react';
import Link from 'next/link';
import { PortalSection } from './LayoutGrid';
import { PortalSectionTitle, PortalSectionHint } from './Typography';
import { GameRail } from './GameRail';
import { GameTile } from './GameTile';
import { getGameDetails } from '@/app/config/gameConfig';
import { DEFAULT_GAME_IMAGE } from '@/lib/playbookUtils';
import type { HomeHighlightGame, HomeHighlights as HomeHighlightsData } from '@/lib/models/portal/HomeHighlights';

const TILE_TONES = ['pink', 'mint', 'green', 'blue', 'yellow', 'purple'] as const;

/** A game score as the game counts it: whole points plain, fractions kept. */
function formatScore(score: number): string {
  return score.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function plural(n: number, one: string, many: string): string {
  return `${n.toLocaleString()} ${n === 1 ? one : many}`;
}

/** Top score and plays for one tile, in the slot above its Play button. */
function HighlightFigures({ entry }: { entry: HomeHighlightGame }) {
  const top = entry.topScore;
  return (
    <dl className="game-highlight margin-none" data-home-highlight="">
      <div className="game-highlight__row">
        <dt className="text-muted">Top score</dt>
        <dd className="margin-none">
          {top ? (
            <>
              <span className="font-mono weight-semibold text-default">{formatScore(top.score)}</span>
              {top.isYou && <span className="game-highlight__yours"> yours</span>}
            </>
          ) : (
            <span className="text-muted">none posted yet</span>
          )}
        </dd>
      </div>
      {entry.yourBest != null && !top?.isYou && (
        <div className="game-highlight__row">
          <dt className="text-muted">Your best</dt>
          <dd className="margin-none font-mono weight-semibold text-default">{formatScore(entry.yourBest)}</dd>
        </div>
      )}
      <div className="game-highlight__row">
        <dt className="text-muted">Plays</dt>
        <dd className="margin-none">
          <span className="weight-semibold text-default">{entry.plays.toLocaleString()}</span>
          {entry.players > 0 && <span className="text-muted"> by {plural(entry.players, 'player', 'players')}</span>}
        </dd>
      </div>
    </dl>
  );
}

export interface HomeHighlightsProps {
  highlights: HomeHighlightsData;
}

/**
 * "Top scores this week": the most played games across Skillprint in the
 * window, each tile carrying the best score set on it and its play count
 * (marketplace #149). Renders nothing for an empty window.
 */
export function HomeHighlights({ highlights }: HomeHighlightsProps) {
  if (highlights.games.length === 0) return null;
  const days = highlights.periodDays;
  const window = days === 7 ? 'this week' : days === 1 ? 'today' : `in the last ${days} days`;

  return (
    <PortalSection ariaLabelledBy="highlightsTitle">
      <div className="portal-section__bar">
        <div className="min-width-0">
          <PortalSectionTitle id="highlightsTitle">Top scores {window}</PortalSectionTitle>
          <PortalSectionHint>The games everyone is playing, and the best score set on each. Beat it and the top spot is yours.</PortalSectionHint>
        </div>
        <Link className="portal-section__link" href="/games">
          All games <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
        </Link>
      </div>
      <GameRail isLibrary>
        {highlights.games.map((entry, i) => {
          const local = getGameDetails(entry.game.slug);
          return (
            <GameTile
              key={entry.game.slug}
              id={entry.game.slug}
              title={entry.game.name}
              description={local?.description || ''}
              image={local?.image || entry.game.thumbnail || DEFAULT_GAME_IMAGE}
              url={`/game/${encodeURIComponent(entry.game.slug)}`}
              statusBadge={entry.topScore?.isYou ? 'Your top score' : undefined}
              tone={TILE_TONES[(i + 4) % TILE_TONES.length]}
              extra={<HighlightFigures entry={entry} />}
            />
          );
        })}
      </GameRail>
    </PortalSection>
  );
}
