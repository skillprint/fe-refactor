import React from 'react';
import SessionVeil from './SessionVeil';
import { AnimatedGameTiles } from '../../app/components/AnimatedGameTiles';

/**
 * The game page before its client has mounted: the play field and the same
 * "Loading game" veil the session opens on, so the hand-off is seamless. The
 * route's loading.tsx, so a click on Play swaps to this at once.
 */
export default function GameSessionLoading() {
  return (
    <div className="page scrollbar-subtle page--game-session margin-none text-default font-ui leading-base" data-sequence="loading" data-skillprint-page="game-session">
      <div aria-hidden="true" className="play-field" data-stage-field data-tiles-active="">
        <AnimatedGameTiles />
      </div>
      <SessionVeil step="loading" title="Loading game" description="Your game is starting up." isCanvas />
    </div>
  );
}
