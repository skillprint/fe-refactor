'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameResultDialog from '../../../components/GameSession/GameResultDialog';

/**
 * `/dev/game-result/?synthetic=1` renders the mock session, which includes an
 * estimated skill score, skills the game does not measure, and a personal
 * best (SKI-181). Without `synthetic` there is no session, so the dialog shows
 * what a game that reported no score looks like; add `&score=4120` to give it
 * one, and `&best=3421` a previous best to beat.
 */
function DevGameResultContent() {
  const searchParams = useSearchParams();
  const synthetic = searchParams.get('synthetic') === '1';
  const score = searchParams.get('score');
  const best = searchParams.get('best');
  return (
    <div className="page scrollbar-subtle page--game-session margin-none text-default font-ui leading-base">
      <Suspense fallback={<div>Loading...</div>}>
        <GameResultDialog
          gameTitle="Hextris"
          score={score === null ? null : Number(score)}
          previousBestScore={best === null ? null : Number(best)}
          duration={372}
          adjustmentsCount={2}
          targetMood="focus"
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
