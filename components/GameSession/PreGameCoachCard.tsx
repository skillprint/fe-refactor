'use client';

import React, { useState } from 'react';
import type { CoachPersonaSummary, CoachTipItem, PreGameCoachBriefing } from '@/lib/coachBridge';
import CoachCharacterAvatar from './CoachCharacterAvatar';
import { MockDataTag } from '../MockDataTag';

interface PreGameCoachCardProps {
  briefing: PreGameCoachBriefing | null;
  isLoading?: boolean;
  tipsEnabled: boolean;
  onToggleTips: (enabled: boolean) => void;
  selectedCoachId: string;
  onSelectCoach: (coachId: string) => void;
  variant?: 'stage' | 'detail';
  onStartPlay?: () => void;
}

const KIND_BADGE: Record<
  string,
  { label: string; bg: string; border: string; color: string; icon: string }
> = {
  works: {
    label: 'What works',
    bg: 'rgba(9, 224, 143, 0.14)',
    border: 'rgba(9, 224, 143, 0.4)',
    color: '#4ce7ae',
    icon: '✔',
  },
  avoid: {
    label: 'Avoid trap',
    bg: 'rgba(255, 81, 141, 0.14)',
    border: 'rgba(255, 81, 141, 0.4)',
    color: '#ff518d',
    icon: '✘',
  },
  thought: {
    label: 'Agent thought',
    bg: 'rgba(132, 115, 240, 0.16)',
    border: 'rgba(132, 115, 240, 0.45)',
    color: '#c8c2f7',
    icon: '💭',
  },
  question: {
    label: 'Try testing',
    bg: 'rgba(255, 178, 27, 0.14)',
    border: 'rgba(255, 178, 27, 0.42)',
    color: '#fdc65a',
    icon: '?',
  },
};

export default function PreGameCoachCard({
  briefing,
  isLoading = false,
  tipsEnabled,
  onToggleTips,
  selectedCoachId,
  onSelectCoach,
  variant = 'stage',
  onStartPlay,
}: PreGameCoachCardProps) {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'works' | 'avoid' | 'thought'>('all');

  if (!briefing && isLoading) {
    return (
      <aside
        aria-label="Pre-game AI Coach briefing"
        style={{
          pointerEvents: 'auto',
          width: variant === 'stage' ? 'min(480px, calc(100vw - 32px))' : '100%',
          padding: '16px 20px',
          borderRadius: '18px',
          background: 'color-mix(in srgb, var(--panel-navy-950, #171a38) 92%, transparent)',
          border: '1px solid color-mix(in srgb, var(--geistface-grey-25, #fff) 16%, transparent)',
          backdropFilter: 'blur(12px)',
          color: 'var(--geistface-grey-25, #f8f9fc)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <span className="font-xs text-muted">Loading AI coach & peer insights…</span>
      </aside>
    );
  }

  if (!briefing) return null;

  const coach: CoachPersonaSummary = briefing.selectedCoach;
  const coaches: CoachPersonaSummary[] = briefing.availableCoaches || [coach];
  const filteredTips: CoachTipItem[] =
    activeFilter === 'all'
      ? briefing.tips.slice(0, 3)
      : briefing.tips.filter((t) => t.kind === activeFilter || (activeFilter === 'thought' && t.kind === 'question')).slice(0, 3);

  return (
    <aside
      aria-label="Pre-game AI Coach briefing"
      data-coach-briefing={variant}
      style={{
        position: 'relative',
        pointerEvents: 'auto',
        width: variant === 'stage' ? 'min(520px, calc(100vw - 28px))' : '100%',
        padding: variant === 'stage' ? '18px 20px' : '22px 24px',
        borderRadius: '20px',
        background:
          variant === 'stage'
            ? 'color-mix(in srgb, var(--panel-navy-950, #171a38) 94%, transparent)'
            : 'var(--surface-panel, #171a38)',
        border: '1px solid color-mix(in srgb, var(--mindset-violet-400, #8473f0) 34%, rgba(255,255,255,0.12))',
        backdropFilter: 'blur(14px)',
        color: 'var(--geistface-grey-25, #f8f9fc)',
        boxShadow: variant === 'stage' ? '0 20px 50px rgba(4, 6, 22, 0.55)' : 'var(--shadow-sm)',
        display: 'grid',
        gap: '12px',
        textAlign: 'left',
      }}
    >
      <MockDataTag />

      {/* Top Row: Coach identity + Live Whispers toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          paddingRight: '76px', // space for MockDataTag
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <CoachCharacterAvatar look={coach.look} name={coach.name} size={36} pulse={tipsEnabled} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '14px', lineHeight: '20px', color: '#ffffff' }}>
                {coach.name}
              </strong>
              <span
                className="ui-badge ui-badge--pill"
                style={{
                  fontSize: '11px',
                  height: '20px',
                  background: 'rgba(132, 115, 240, 0.2)',
                  borderColor: 'rgba(132, 115, 240, 0.45)',
                  color: '#dedcf9',
                }}
              >
                {coach.label}
              </span>
              {coach.playsOnGame > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--geistface-grey-400, #aab0bd)' }}>
                  · {coach.playsOnGame} {coach.playsOnGame === 1 ? 'run' : 'runs'} on {briefing.gameTitle}
                </span>
              )}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '11.5px',
                lineHeight: '16px',
                color: 'var(--geistface-grey-400, #aab0bd)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              LLM Island Peer Coach · Pre-game & live tips
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: '9999px',
              background: tipsEnabled ? 'rgba(9, 224, 143, 0.16)' : 'rgba(255, 255, 255, 0.06)',
              border: tipsEnabled
                ? '1px solid rgba(9, 224, 143, 0.45)'
                : '1px solid rgba(255, 255, 255, 0.14)',
              color: tipsEnabled ? '#4ce7ae' : 'var(--geistface-grey-400, #aab0bd)',
            }}
            title="Show light chatbot tips in the bottom bar while you play"
          >
            <input
              type="checkbox"
              checked={tipsEnabled}
              onChange={(e) => onToggleTips(e.target.checked)}
              style={{ accentColor: '#09e08f', margin: 0, cursor: 'pointer' }}
            />
            <span>Live tips {tipsEnabled ? 'ON' : 'OFF'}</span>
          </label>

          {variant === 'stage' && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="button button--tertiary button--sm"
              style={{ minHeight: '28px', padding: '2px 8px', fontSize: '11px' }}
              aria-expanded={expanded}
            >
              {expanded ? 'Hide' : 'Tips'}
            </button>
          )}
        </div>
      </div>

      {/* 1. Light Profile & Past Experience Analysis */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: '12px',
          background: 'rgba(87, 62, 235, 0.14)',
          borderLeft: '3px solid var(--mindset-violet-400, #8473f0)',
          fontSize: '13px',
          lineHeight: '19px',
          color: '#eceef5',
        }}
      >
        <span
          style={{
            display: 'block',
            fontSize: '10.5px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#aba0f4',
            marginBottom: '2px',
          }}
        >
          Your Profile & Game Readout
        </span>
        {briefing.profileAnalysis}
      </div>

      {expanded && (
        <>
          {/* 2. Switch AI Character / Coach */}
          {coaches.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--geistface-grey-400, #aab0bd)', marginRight: '2px' }}>
                Hear from:
              </span>
              {coaches.map((c) => {
                const isSelected = c.id === (selectedCoachId || coach.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCoach(c.id)}
                    aria-pressed={isSelected}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 9px 3px 5px',
                      borderRadius: '9999px',
                      fontSize: '11.5px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      background: isSelected
                        ? 'var(--mindset-violet-500, #573eeb)'
                        : 'rgba(255, 255, 255, 0.06)',
                      border: isSelected
                        ? '1px solid var(--mindset-violet-400, #8473f0)'
                        : '1px solid rgba(255, 255, 255, 0.14)',
                      color: isSelected ? '#ffffff' : '#d9dcea',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <CoachCharacterAvatar look={c.look} name={c.name} size={18} />
                    <span>{c.name}</span>
                    {c.playsOnGame > 0 && (
                      <span style={{ opacity: 0.75, fontSize: '10px' }}>({c.playsOnGame}x)</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. Filter Pills for What Works / Traps / Thoughts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {(
              [
                { id: 'all', label: 'Top Insights' },
                { id: 'works', label: '✔ What Works' },
                { id: 'avoid', label: '✘ Traps to Avoid' },
                { id: 'thought', label: '💭 Agent Thoughts' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background:
                    activeFilter === tab.id ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                  border:
                    activeFilter === tab.id
                      ? '1px solid rgba(255, 255, 255, 0.28)'
                      : '1px solid transparent',
                  color: activeFilter === tab.id ? '#ffffff' : 'var(--geistface-grey-400, #aab0bd)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 4. Bite-sized Chat Bubbles from Character & Peers */}
          <div style={{ display: 'grid', gap: '8px' }}>
            {filteredTips.map((tip) => {
              const badge = KIND_BADGE[tip.kind] || KIND_BADGE.works;
              return (
                <div
                  key={tip.id}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    display: 'grid',
                    gap: '4px',
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
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '1px 7px',
                        borderRadius: '9999px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.color,
                      }}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--geistface-grey-400, #aab0bd)' }}>
                      {tip.fromName} ({tip.fromKind === 'human' ? 'Player' : tip.fromLabel || 'AI Agent'})
                      {tip.count > 1 ? ` · ×${tip.count}` : ''}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      lineHeight: '18px',
                      color: '#f8f9fc',
                    }}
                  >
                    “{tip.text}”
                  </p>
                </div>
              );
            })}

            {/* Show latest community lesson if any player shared one on this game */}
            {briefing.communityLessons && briefing.communityLessons.length > 0 && activeFilter === 'all' && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: 'rgba(91, 253, 225, 0.07)',
                  border: '1px solid rgba(91, 253, 225, 0.25)',
                  fontSize: '12px',
                  lineHeight: '17px',
                  color: '#adfbef',
                }}
              >
                <strong style={{ color: '#5bfde1' }}>
                  Community Lesson ({briefing.communityLessons[0].userName}):
                </strong>{' '}
                “{briefing.communityLessons[0].text}”
              </div>
            )}
          </div>
        </>
      )}

      {variant === 'stage' && onStartPlay && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            paddingTop: '4px',
          }}
        >
          <span style={{ fontSize: '11.5px', color: 'var(--geistface-grey-400, #aab0bd)' }}>
            {tipsEnabled
              ? `${coach.name} will whisper light tips in the bottom bar while you play.`
              : 'Live whispers are muted for this run.'}
          </span>
          <button
            type="button"
            onClick={onStartPlay}
            className="button button--primary button--sm"
            style={{ flexShrink: 0 }}
          >
            Start Game
          </button>
        </div>
      )}
    </aside>
  );
}
