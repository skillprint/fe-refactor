'use client';

import GameClient from './GameClient';
import { useRouteParams } from '@/lib/useRouteParams';

/** The game screen at `/game/<slug>/`. */
export default function GamePageClient() {
  const { slug } = useRouteParams('/game/[slug]');
  // Every game has its own start screen, so the portal's Play overlay
  // would only be a second Play button in front of it.
  return <GameClient slug={slug} autoPlay />;
}
