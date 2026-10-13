'use client';

import { useState } from 'react';
import GameClient from '../../../game/[slug]/GameClient';
import { NextVisitorButton } from '../../NextVisitorButton';
import { StickerPanel } from '../../StickerPanel';
import { useStationGuest } from '../../useStationGuest';
import { HowToPlay } from '../../HowToPlay';
import { stationGame } from '@/lib/asuStation';

/**
 * The portal's own game session, kept inside the station: a how-to-play screen
 * first, then the game; every way out of the results leads back to /asu, the
 * results lead with the sticker to hand over, and nothing links into the rest
 * of the portal.
 */
export default function AsuPlayClient({ slug }: { slug: string }) {
  useStationGuest();
  const [started, setStarted] = useState(false);
  const game = stationGame(slug);

  if (game && !started) return <HowToPlay game={game} onStart={() => setStarted(true)} />;

  return (
    <GameClient
      slug={slug}
      autoPlay
      exitHref="/asu/"
      resultOptions={{
        exitLabel: 'Pick another game',
        hidePortalLinks: true,
        // The sticker is what the visitor came for, so it leads; the mood question is skipped at the event.
        extraPlacement: 'top',
        hideMoodSurvey: true,
        primaryAction: <NextVisitorButton variant="primary" />,
        renderExtra: (session, isProcessing, unscored) => (
          <StickerPanel gameSlug={slug} session={session} isProcessing={isProcessing} unscored={unscored} />
        ),
      }}
    />
  );
}
