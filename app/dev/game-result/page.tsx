'use client';

import React, { Suspense } from 'react';
import GameResultDialog from '../../../components/GameSession/GameResultDialog';

export default function DevGameResultPage() {
  return (
    <div className="page scrollbar-subtle page--game-session margin-none text-default font-ui leading-base">
      <Suspense fallback={<div>Loading...</div>}>
        <GameResultDialog
          gameTitle="Hextris"
          score={4120}
          highScore={3421}
          duration={372}
          adjustmentsCount={2}
          targetMood="Focus"
          onReplay={() => console.log('Replay')}
        />
      </Suspense>
    </div>
  );
}
