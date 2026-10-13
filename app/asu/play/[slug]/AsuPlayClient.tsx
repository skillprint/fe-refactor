'use client';

import GameClient from '../../../game/[slug]/GameClient';
import { NextVisitorButton } from '../../NextVisitorButton';
import { StickerPanel } from '../../StickerPanel';
import { useStationGuest } from '../../useStationGuest';

/**
 * The portal's own game session, kept inside the station: every way out of the
 * results leads back to /asu, the results end with the sticker to hand over,
 * and nothing links into the rest of the portal.
 */
export default function AsuPlayClient({ slug }: { slug: string }) {
  useStationGuest();

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
        renderExtra: (session, isProcessing) => (
          <StickerPanel gameSlug={slug} session={session} isProcessing={isProcessing} />
        ),
      }}
    />
  );
}
