'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameResultDialog from '../../../components/GameSession/GameResultDialog';

/**
 * `/dev/game-result/?synthetic=1` renders the mock session, which includes an
 * estimated skill score and skills the game does not measure. Add `&best=0`
 * to see the first-session score note (no previous best).
 */
function DevGameResultContent() {
  const searchParams = useSearchParams();
  const synthetic = searchParams.get('synthetic') === '1';
  const highScore = searchParams.get('best') === '0' ? 0 : 3421;
  return (
    <div className="page scrollbar-subtle page--game-session margin-none text-default font-ui leading-base">
      <Suspense fallback={<div>Loading...</div>}>
        <GameResultDialog
          gameTitle="Hextris"
          score={4120}
          highScore={highScore}
          duration={372}
          adjustmentsCount={2}
          targetMood="Focus"
          onReplay={() => console.log('Replay')}
          useSyntheticData={synthetic}
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
