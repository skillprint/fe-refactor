import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import EmbedGameClient from './EmbedGameClient';

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
 * on the portal).
 */
export default function EmbedGamePage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      <EmbedGameClient />
    </Suspense>
  );
}
