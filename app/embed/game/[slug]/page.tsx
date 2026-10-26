import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import GameClient from '@/app/game/[slug]/GameClient';
import { gameSharePath } from '@/lib/share';
import { absoluteUrl } from '@/lib/siteUrl';

interface EmbedGamePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ r?: string }>;
}

export const metadata: Metadata = {
  title: 'Play',
  robots: { index: false },
};

/**
 * A game inside someone else's page.
 *
 * The share sheet hands out an iframe pointing here. There is no portal
 * chrome, the visitor plays as a guest, and the results card keeps to the
 * session (no profile links: the iframe's guest is not the visitor's account
 * on the portal). Closing the results restarts the game: `?r=` changes, so
 * the client remounts.
 */
export default async function EmbedGamePage({ params, searchParams }: EmbedGamePageProps) {
  const { slug } = await params;
  const { r } = await searchParams;
  const restart = Number(r) || 0;
  const self = `/embed/game/${encodeURIComponent(slug)}/`;
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
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
    </Suspense>
  );
}
