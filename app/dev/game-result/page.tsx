'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameResultDialog, { SessionOutcome } from '../../../components/GameSession/GameResultDialog';

/**
 * `/dev/game-result/?synthetic=1` renders the mock session, which includes an
 * estimated skill score and skills the game does not measure. Add `&best=0`
 * to see the first-session score note (no previous best). Add `&emailPrompt=1`
 * to show the email prompt whatever this player's session count (SKI-265).
 * `&outcome=exited|unknown` switches the status badge (default `complete`).
 */
function DevGameResultContent() {
  const searchParams = useSearchParams();
  const synthetic = searchParams.get('synthetic') === '1';
  const highScore = searchParams.get('best') === '0' ? 0 : 3421;
  const forceEmailPrompt = searchParams.get('emailPrompt') === '1';
  const outcomeParam = searchParams.get('outcome');
  const outcome: SessionOutcome = outcomeParam === 'exited' || outcomeParam === 'unknown' ? outcomeParam : 'complete';
  return (
    <div className="page scrollbar-subtle page--game-session margin-none text-default font-ui leading-base">
      <Suspense fallback={<div>Loading...</div>}>
        <GameResultDialog
          gameTitle="Hextris"
          score={4120}
          highScore={highScore}
          outcome={outcome}
          duration={372}
          adjustmentsCount={2}
          targetMood="Focus"
          onReplay={() => console.log('Replay')}
          useSyntheticData={synthetic}
          forceEmailPrompt={forceEmailPrompt}
        />
      </Suspense>
    </div>
  );
}

export default function DevGameResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DevGameResultContent />
    </Suspense>
  );
}
