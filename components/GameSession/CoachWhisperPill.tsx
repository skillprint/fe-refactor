'use client';

import React, { useEffect, useState } from 'react';
import type { CoachPersonaSummary, CoachTipItem } from '@/lib/coachBridge';
import CoachCharacterAvatar from './CoachCharacterAvatar';

interface CoachWhisperPillProps {
  coach?: CoachPersonaSummary | null;
  availableCoaches?: CoachPersonaSummary[];
  selectedCoachId?: string;
  onSelectCoach?: (id: string) => void;
  tipsEnabled: boolean;
  onToggleTips: (enabled: boolean) => void;
  activeWhisper: CoachTipItem | null;
  whisperHistory: CoachTipItem[];
  isAsking?: boolean;
  onAskCoach: (question: string) => void;
  onDismissWhisper: () => void;
  onRefocusGame?: () => void;
}

export default function CoachWhisperPill({
  coach,
  availableCoaches = [],
  selectedCoachId,
  onSelectCoach,
  tipsEnabled,
  onToggleTips,
  activeWhisper,
  whisperHistory,
  isAsking = false,
  onAskCoach,
  onDismissWhisper,
  onRefocusGame,
}: CoachWhisperPillProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  // Whenever a new activeWhisper arrives and tips are enabled, show the non-blocking toast for 6.5s
  useEffect(() => {
    if (activeWhisper && tipsEnabled) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 6500);
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [activeWhisper, tipsEnabled]);

  const coachName = coach?.name || activeWhisper?.fromName || 'AI Coach';
  const coachLook = coach?.look || activeWhisper?.fromLook;

  const handleToggleDrawer = () => {
    const next = !drawerOpen;
    setDrawerOpen(next);
    if (!next) {
      onRefocusGame?.();
    }
  };

  const handleQuickAsk = (q: string) => {
    onAskCoach(q);
    // Keep focus on the game if drawer wasn't explicitly pinned open for typing
    setTimeout(() => {
      onRefocusGame?.();
    }, 50);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    onAskCoach(customQuestion.trim());
    setCustomQuestion('');
  };

  return (
    <>
      {/* Pill control inside PlayBar */}
      <button
        type="button"
        className="play-bar__control play-bar__action"
        onClick={handleToggleDrawer}
        aria-expanded={drawerOpen}
        title={`Coach tips from ${coachName}`}
        style={{
          position: 'relative',
          gap: '6px',
          background: drawerOpen
            ? 'rgba(87, 62, 235, 0.35)'
            : showToast
            ? 'rgba(9, 224, 143, 0.2)'
            : undefined,
          border: showToast
            ? '1px solid rgba(9, 224, 143, 0.5)'
            : drawerOpen
            ? '1px solid rgba(132, 115, 240, 0.55)'
            : undefined,
        }}
      >
        <CoachCharacterAvatar look={coachLook} name={coachName} size={22} pulse={showToast} />
        <span className="play-bar__action-label">{coachName}</span>
        {tipsEnabled && (
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: showToast ? '#09e08f' : '#8473f0',
              display: 'inline-block',
            }}
          />
        )}
      </button>

      {/* Non-blocking Live Whisper Toast (when drawer is closed and a new tip arrives) */}
      {showToast && !drawerOpen && activeWhisper && tipsEnabled && (
        <div
          role="status"
          aria-live="polite"
          className="play-help"
          style={{
            width: 'min(420px, calc(100vw - 28px))',
            padding: '12px 14px',
            borderRadius: '16px',
            background: 'color-mix(in srgb, var(--panel-navy-950, #171a38) 94%, transparent)',
            border: '1px solid rgba(76, 231, 174, 0.45)',
            boxShadow: '0 14px 36px rgba(4, 6, 22, 0.55)',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CoachCharacterAvatar
                look={activeWhisper.fromLook || coachLook}
                name={activeWhisper.fromName || coachName}
                size={24}
                pulse
              />
              <strong style={{ fontSize: '12.5px', color: '#4ce7ae' }}>
                {activeWhisper.fromName || coachName} whispers:
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(true);
                  setShowToast(false);
                }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '6px',
                  color: '#d9dcea',
                  fontSize: '10.5px',
                  padding: '2px 7px',
                  cursor: 'pointer',
                }}
              >
                Ask more
              </button>
              <button
                type="button"
                aria-label="Dismiss tip"
                onClick={() => {
                  setShowToast(false);
                  onDismissWhisper();
                  onRefocusGame?.();
                }}
                style={{
                  background: 'transparent',
                  border: 0,
                  color: '#8f96a7',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '0 4px',
                }}
              >
                ×
              </button>
            </div>
          </div>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '13px',
              lineHeight: '18px',
              color: '#f8f9fc',
            }}
          >
            “{activeWhisper.text}”
          </p>
        </div>
      )}

      {/* Expandable Interactive Coach Drawer above PlayBar */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-label="Live AI Coach tips"
          className="play-help"
          style={{
            width: 'min(440px, calc(100vw - 24px))',
            padding: '14px 16px',
            borderRadius: '18px',
            background: 'color-mix(in srgb, var(--panel-navy-950, #171a38) 96%, transparent)',
            border: '1px solid rgba(132, 115, 240, 0.45)',
            boxShadow: '0 18px 46px rgba(4, 6, 22, 0.65)',
            display: 'grid',
            gap: '10px',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CoachCharacterAvatar look={coachLook} name={coachName} size={28} pulse={tipsEnabled} />
              <div>
                <strong style={{ fontSize: '13.5px', color: '#ffffff', display: 'block' }}>
                  {coachName} · {coach?.label || 'AI Coach'}
                </strong>
                <span style={{ fontSize: '11px', color: '#aab0bd' }}>
                  {coach?.playsOnGame
                    ? `Played ${coach.playsOnGame}x · Sharing live playbook thoughts`
                    : 'Sharing live arcade tactics'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: tipsEnabled ? '#4ce7ae' : '#8f96a7',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={tipsEnabled}
                  onChange={(e) => onToggleTips(e.target.checked)}
                  style={{ accentColor: '#09e08f', margin: 0 }}
                />
                Auto-whispers
              </label>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onRefocusGame?.();
                }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 0,
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '2px 8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>

          {/* Character switcher inside drawer */}
          {availableCoaches.length > 1 && onSelectCoach && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10.5px', color: '#8f96a7' }}>Coach:</span>
              {availableCoaches.map((c) => {
                const active = c.id === (selectedCoachId || coach?.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCoach(c.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px 2px 4px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      background: active ? '#573eeb' : 'rgba(255,255,255,0.06)',
                      border: active ? '1px solid #8473f0' : '1px solid rgba(255,255,255,0.12)',
                      color: '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <CoachCharacterAvatar look={c.look} name={c.name} size={16} />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Current / Recent Whispers */}
          <div
            style={{
              maxHeight: '130px',
              overflowY: 'auto',
              display: 'grid',
              gap: '6px',
              padding: '8px 10px',
              borderRadius: '10px',
              background: 'rgba(4, 6, 22, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {whisperHistory.length === 0 && !activeWhisper ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#aab0bd' }}>
                Ask {coachName} for a tactic below, or keep playing for automatic mid-game whispers.
              </p>
            ) : (
              (whisperHistory.length > 0 ? whisperHistory.slice(0, 3) : activeWhisper ? [activeWhisper] : []).map(
                (item) => (
                  <div
                    key={item.id}
                    style={{
                      fontSize: '12.5px',
                      lineHeight: '17px',
                      color: '#f8f9fc',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      paddingBottom: '5px',
                    }}
                  >
                    <span style={{ color: '#4ce7ae', fontWeight: 600, fontSize: '11px' }}>
                      [{item.fromName}]:{' '}
                    </span>
                    “{item.text}”
                  </div>
                )
              )
            )}
          </div>

          {/* Quick-Ask Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { label: '✔ What works?', q: 'What tactic worked best for you here?' },
              { label: '✘ Trap to avoid?', q: 'What mistake or trap should I avoid?' },
              { label: '💭 Your thought?', q: 'What were your thoughts while playing?' },
              { label: '? Hypothesis', q: 'What hypothesis should I test right now?' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                disabled={isAsking}
                onClick={() => handleQuickAsk(chip.q)}
                style={{
                  padding: '4px 9px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'rgba(132, 115, 240, 0.16)',
                  border: '1px solid rgba(132, 115, 240, 0.38)',
                  color: '#dedcf9',
                  cursor: 'pointer',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Optional short question input */}
          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder={`Ask ${coachName} about this game…`}
              style={{
                flex: 1,
                minHeight: '32px',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                fontSize: '12px',
              }}
            />
            <button
              type="submit"
              disabled={isAsking || !customQuestion.trim()}
              className="button button--primary button--sm"
              style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
            >
              {isAsking ? '…' : 'Ask'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
