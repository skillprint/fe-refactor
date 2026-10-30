import React, { useEffect, useState } from 'react';
import type { CoachPersonaSummary, CoachTipItem } from '@/lib/coachBridge';
import CoachWhisperPill from './CoachWhisperPill';

interface PlayBarProps {
  gameTitle: string;
  gameSlug: string;
  onExit: () => void;
  onHelp?: () => void;
  targetMood: string;
  adjustmentName?: string;
  adjustmentValue?: any;
  adjustmentCreateDate?: string;
  // Coach whisper props
  coach?: CoachPersonaSummary | null;
  availableCoaches?: CoachPersonaSummary[];
  selectedCoachId?: string;
  onSelectCoach?: (id: string) => void;
  tipsEnabled?: boolean;
  onToggleTips?: (enabled: boolean) => void;
  activeWhisper?: CoachTipItem | null;
  whisperHistory?: CoachTipItem[];
  isAskingCoach?: boolean;
  onAskCoach?: (question: string) => void;
  onDismissWhisper?: () => void;
  onRefocusGame?: () => void;
}

export default function PlayBar({
  gameTitle,
  gameSlug,
  onExit,
  onHelp,
  targetMood,
  adjustmentName,
  adjustmentValue,
  adjustmentCreateDate,
  coach,
  availableCoaches,
  selectedCoachId,
  onSelectCoach,
  tipsEnabled = true,
  onToggleTips,
  activeWhisper = null,
  whisperHistory = [],
  isAskingCoach = false,
  onAskCoach,
  onDismissWhisper,
  onRefocusGame,
}: PlayBarProps) {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (adjustmentCreateDate) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [adjustmentCreateDate]);

  return (
    <div aria-label="Game controls" className="play-bar scrollbar-none" data-play-bar data-scroll-fade role="group">
      <div className="play-bar__group play-bar__identity">
        <span aria-hidden="true" className="play-bar__art">
          {/* We assume game art follows this naming convention, or fallback */}
          <img alt="" data-stage-art src={`/assets/images/games/game-${gameSlug}.svg`} onError={(e) => (e.currentTarget.style.display = 'none')} />
        </span>
        <span className="play-bar__name" data-stage-title>{gameTitle}</span>
      </div>
      
      <span aria-hidden="true" className="play-bar__sep"></span>
      
      <button className="play-bar__control play-bar__action" data-sequence-go="review" type="button" onClick={onExit}>
        <svg className="play-bar__icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-logout"></use></svg>
        <span className="play-bar__action-label">Exit</span>
      </button>
      
      {onHelp && (
        <button className="play-bar__control play-bar__action" data-play-help type="button" onClick={onHelp}>
          <svg className="play-bar__icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-help"></use></svg>
          <span className="play-bar__action-label">Help</span>
        </button>
      )}
      
      <span aria-hidden="true" className="play-bar__sep"></span>
      
      <div className="play-bar__group play-bar__readout">
        {/* Mood icon mapping can be complex, using a default target glyph for now */}
        <svg className="play-bar__icon" aria-hidden="true" viewBox="0 0 24 24">
          <use href={`#ti-mood-${targetMood.toLowerCase()}`} data-stage-target-glyph></use>
        </svg>
        <span className="play-bar__stack">
          <span className="play-bar__label">Targeting</span>
          <span className="play-bar__value" data-stage-mood>{targetMood}</span>
        </span>
      </div>
      
      {adjustmentName && (
        <div className="play-bar__group play-bar__readout">
          {showNotification && (
            <style>{`
              @keyframes playBarPulse {
                0% { transform: scale(0.8); opacity: 0.5; }
                50% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(0.8); opacity: 0.5; }
              }
            `}</style>
          )}
          <svg className="play-bar__icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-clock"></use></svg>
          <span className="play-bar__stack">
            <span className="play-bar__label">{adjustmentName}</span>
            <span className="play-bar__value" data-combo-value style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {adjustmentValue}
              {showNotification && (
                <span 
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981', // green-500
                    animation: 'playBarPulse 1s infinite'
                  }}
                  title="Value updated!"
                />
              )}
            </span>
          </span>
        </div>
      )}

      {onAskCoach && onToggleTips && onDismissWhisper && (
        <>
          <span aria-hidden="true" className="play-bar__sep"></span>
          <CoachWhisperPill
            coach={coach}
            availableCoaches={availableCoaches}
            selectedCoachId={selectedCoachId}
            onSelectCoach={onSelectCoach}
            tipsEnabled={tipsEnabled}
            onToggleTips={onToggleTips}
            activeWhisper={activeWhisper}
            whisperHistory={whisperHistory}
            isAsking={isAskingCoach}
            onAskCoach={onAskCoach}
            onDismissWhisper={onDismissWhisper}
            onRefocusGame={onRefocusGame}
          />
        </>
      )}
    </div>
  );
}
