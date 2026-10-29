import React from 'react';
import type { PreGameCoachBriefing } from '@/lib/coachBridge';
import PreGameCoachCard from './PreGameCoachCard';

interface PlayStageProps {
  gameTitle: string;
  onPlay: () => void;
  briefing?: PreGameCoachBriefing | null;
  isLoadingBriefing?: boolean;
  tipsEnabled?: boolean;
  onToggleTips?: (enabled: boolean) => void;
  selectedCoachId?: string;
  onSelectCoach?: (coachId: string) => void;
}

export default function PlayStage({
  gameTitle,
  onPlay,
  briefing,
  isLoadingBriefing = false,
  tipsEnabled = true,
  onToggleTips,
  selectedCoachId = '',
  onSelectCoach,
}: PlayStageProps) {
  return (
    <main className="play-stage" id="top">
      <h1 className="sr-only" data-stage-title>{gameTitle}</h1>
      <div
        style={{
          display: 'grid',
          justifyItems: 'center',
          gap: '18px',
          maxHeight: 'calc(100dvh - 88px)',
          overflowY: 'auto',
          padding: '16px',
        }}
      >
        <button
          aria-label="Play"
          className="play-stage__toggle"
          data-play-toggle
          type="button"
          onClick={onPlay}
        >
          <span aria-hidden="true" className="play-stage__mark"></span>
        </button>

        {(briefing || isLoadingBriefing) && onToggleTips && onSelectCoach && (
          <PreGameCoachCard
            briefing={briefing || null}
            isLoading={isLoadingBriefing}
            tipsEnabled={tipsEnabled}
            onToggleTips={onToggleTips}
            selectedCoachId={selectedCoachId}
            onSelectCoach={onSelectCoach}
            variant="stage"
            onStartPlay={onPlay}
          />
        )}
      </div>
    </main>
  );
}
