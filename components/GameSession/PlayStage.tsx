import React from 'react';

interface PlayStageProps {
  gameTitle: string;
  onPlay: () => void;
}

export default function PlayStage({ gameTitle, onPlay }: PlayStageProps) {
  return (
    <main className="play-stage" id="top">
      <h1 className="sr-only" data-stage-title>{gameTitle}</h1>
      <button 
        aria-label="Play" 
        className="play-stage__toggle" 
        data-play-toggle 
        type="button"
        onClick={onPlay}
      >
        <span aria-hidden="true" className="play-stage__mark"></span>
      </button>
    </main>
  );
}
