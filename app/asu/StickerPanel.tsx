'use client';

import { useEffect, useState } from 'react';
import type { SessionDetail } from '@/lib/models/portal/SessionDetail';
import { BONUS_GAME_COUNT, STICKERS, pickSticker, recordPlayedGame, stationGame } from '@/lib/asuStation';

interface StickerPanelProps {
  gameSlug: string;
  session: SessionDetail | null;
  isProcessing: boolean;
}

/**
 * The script's last step, in the results: which sticker the host hands over.
 * The best match is the game's sticker for the skill the visitor scored
 * highest; the others are there if the visitor would rather have one of them.
 */
export function StickerPanel({ gameSlug, session, isProcessing }: StickerPanelProps) {
  const game = stationGame(gameSlug);
  const [playedCount, setPlayedCount] = useState(0);

  // Reaching the results counts as having played this game.
  useEffect(() => {
    let userId: string | null = null;
    try {
      userId = localStorage.getItem('userId');
    } catch {
      // Storage blocked: count this browser as one visitor.
    }
    setPlayedCount(recordPlayedGame(userId, gameSlug).length);
  }, [gameSlug]);

  if (!game) return null;

  const cognition = session?.cognition ?? [];
  const hasScores = cognition.length > 0;
  const pick = pickSticker(gameSlug, cognition);
  const earnedBonus = playedCount >= BONUS_GAME_COUNT;
  const stickers = [...game.stickers.map((id) => STICKERS[id]), ...(earnedBonus ? [STICKERS['leverage-our-place']] : [])];

  return (
    <section aria-label="Your sticker" className="game-result__section separator-top layout-grid asu-result-stickers">
      <h3 className="portal-eyebrow game-result__section-title">Your sticker</h3>
      <p className="game-result__note margin-none">
        {stickers.length === 1
          ? `Ask the host for your ${game.name} sticker.`
          : hasScores
            ? 'Ask the host for your sticker. The best match is for the skill you scored highest.'
            : isProcessing
              ? 'Ask the host for your sticker. The best match appears once your skill scores are in.'
              : `Ask the host for one of the ${game.name} stickers.`}
      </p>
      <ul className="asu-result-stickers__list layout-flex wrap gap-lg margin-none padding-none">
        {stickers.map((sticker) => {
          const isPick = hasScores && game.stickers.length > 1 && sticker.id === pick?.id;
          const isBonus = sticker.skill === null;
          return (
            <li key={sticker.id} className="asu-result-sticker layout-grid" data-pick={isPick ? 'true' : undefined}>
              <img src={sticker.art} alt="" width={112} height={112} />
              <strong className="font-sm">{sticker.name}</strong>
              {isPick && <span className="ui-badge ui-badge--sm ui-badge--pill">Best match</span>}
              {isBonus && <span className="ui-badge ui-badge--sm ui-badge--pill">Bonus: {BONUS_GAME_COUNT} games played</span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
