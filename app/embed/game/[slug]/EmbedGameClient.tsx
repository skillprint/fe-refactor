'use client';

import { useSearchParams } from 'next/navigation';
import GameClient from '@/app/game/[slug]/GameClient';
import { gameSharePath } from '@/lib/share';
import { absoluteUrl } from '@/lib/siteUrl';
import { useRouteParams } from '@/lib/useRouteParams';

/**
 * Closing the results restarts the game: `?r=` changes, so the client
 * remounts.
 */
export default function EmbedGameClient() {
  const { slug } = useRouteParams('/embed/game/[slug]');
  const restart = Number(useSearchParams().get('r')) || 0;
  const self = `/embed/game/${encodeURIComponent(slug)}/`;
  return (
    <GameClient
      key={restart}
      slug={slug}
      autoPlay
      exitHref={`${self}?r=${restart + 1}`}
      resultOptions={{
        exitLabel: 'Done',
        hidePortalLinks: true,
        primaryAction: (
          <a className="button button--primary button--md" href={absoluteUrl(`${gameSharePath(slug)}&utm_source=embed`)} target="_blank" rel="noopener noreferrer">
            Open on Skillprint
          </a>
        ),
      }}
    />
  );
}
