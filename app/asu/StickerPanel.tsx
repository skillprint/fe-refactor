'use client';

import { useEffect, useState } from 'react';
import type { SessionDetail } from '@/lib/models/portal/SessionDetail';
import { PORTAL_SKILLS } from '../config/skillsTaxonomy';
import { titleFromSlug } from '@/lib/skillIcons';
import { BONUS_GAME_COUNT, STICKERS, pickSticker, recordPlayedGame, stationGame } from '@/lib/asuStation';
import { MIN_SCORED_SECONDS } from '@/components/GameSession/GameResultDialog';

interface StickerPanelProps {
  gameSlug: string;
  session: SessionDetail | null;
  isProcessing: boolean;
  /** Under the scoring minimum: no sticker, and it doesn't count toward the bonus. */
  unscored?: boolean;
}

const skillName = (slug: string) => PORTAL_SKILLS[slug]?.name || titleFromSlug(slug);

/**
 * The script's last step, at the top of the results: which sticker the host
 * hands over. It leads with the sticker for the skill the visitor scored
 * highest; the game's other stickers are there if they'd rather have one.
 */
export function StickerPanel({ gameSlug, session, isProcessing, unscored = false }: StickerPanelProps) {
  const game = stationGame(gameSlug);
  const [playedCount, setPlayedCount] = useState(0);

  // Reaching the results of a scored session counts as having played this game.
  useEffect(() => {
    if (unscored) return;
    let userId: string | null = null;
    try {
      userId = localStorage.getItem('userId');
    } catch {
      // Storage blocked: count this browser as one visitor.
    }
    setPlayedCount(recordPlayedGame(userId, gameSlug).length);
  }, [gameSlug, unscored]);

  if (!game) return null;

  // Too short to score means nothing was measured, so there's nothing to earn yet.
  if (unscored) {
    return (
      <section aria-labelledby="asu-sticker-title" className="asu-sticker-card asu-sticker-card--none">
        <div className="asu-sticker-card__copy layout-grid">
          <span className="asu-sticker-card__eyebrow">No sticker yet</span>
          <h3 id="asu-sticker-title" className="asu-sticker-card__name">Play a little longer</h3>
          <p className="asu-sticker-card__text margin-none">
            Stickers go to games played for at least {MIN_SCORED_SECONDS} seconds, so there&apos;s a score to match them to. Choose Play again to earn one.
          </p>
        </div>
      </section>
    );
  }

  const cognition = session?.cognition ?? [];
  const hasScores = cognition.length > 0;
  const hasChoice = game.stickers.length > 1;
  // With a choice to make, wait for the scores before naming one.
  const featured = !hasChoice || hasScores ? pickSticker(gameSlug, cognition) : null;
  const matchedScore = featured?.skill ? cognition.find((metric) => metric.slug === featured.skill) : undefined;
  const others = game.stickers.map((id) => STICKERS[id]).filter((sticker) => sticker.id !== featured?.id);
  const bonus = playedCount >= BONUS_GAME_COUNT ? STICKERS['leverage-our-place'] : null;

  return (
    <section aria-labelledby="asu-sticker-title" className="asu-sticker-card">
      <div className="asu-sticker-card__main">
        {featured ? (
          <img className="asu-sticker-card__art" src={featured.art} alt="" width={176} height={176} />
        ) : (
          <span className="asu-sticker-card__art asu-sticker-card__art--pending" aria-hidden="true">
            {isProcessing && <span className="session-spinner"></span>}
          </span>
        )}
        <div className="asu-sticker-card__copy layout-grid">
          <span className="asu-sticker-card__eyebrow">Your sticker</span>
          <h3 id="asu-sticker-title" className="asu-sticker-card__name">
            {featured ? featured.name : 'Picking your sticker'}
          </h3>
          <p className="asu-sticker-card__text margin-none">
            {featured
              ? matchedScore && hasChoice
                ? `Matched to your strongest skill: ${skillName(matchedScore.slug)}, ${Math.round(matchedScore.score)} out of 100. Show this screen to the host to get it.`
                : 'Show this screen to the host to get it.'
              : isProcessing
                ? 'Your sticker appears as soon as your skill scores are in.'
                : `Ask the host for one of the ${game.name} stickers.`}
          </p>
        </div>
      </div>

      {(others.length > 0 || bonus) && (
        <div className="asu-sticker-card__more layout-flex wrap items-center gap-lg">
          {others.length > 0 && (
            <div className="layout-flex wrap items-center gap-md">
              <span className="font-sm">{featured ? 'Or choose' : 'Stickers'}</span>
              <ul className="asu-sticker-card__others layout-flex wrap gap-sm margin-none padding-none">
                {others.map((sticker) => (
                  <li key={sticker.id} className="asu-sticker-chip">
                    <img src={sticker.art} alt="" width={40} height={40} />
                    <span className="font-sm weight-semibold">{sticker.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {bonus && (
            <div className="asu-sticker-chip asu-sticker-chip--bonus">
              <img src={bonus.art} alt="" width={40} height={40} />
              <span className="font-sm"><strong>Bonus: {bonus.name}</strong> for playing {BONUS_GAME_COUNT} different games</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
