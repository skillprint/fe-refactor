'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { CoachPersonaSummary, CoachTipItem, UserSharedLesson } from '@/lib/coachBridge';
import { rateCoachTipFeedback, submitPlayerLesson } from '@/app/hooks/useIslandCoach';
import CoachCharacterAvatar from './CoachCharacterAvatar';
import { MockDataTag } from '../MockDataTag';

interface PostGameLessonCardProps {
  userId?: string | null;
  userName?: string;
  gameSlug: string;
  gameTitle: string;
  score?: number;
  scoreDelta?: number | null;
  targetMood?: string;
  coach?: CoachPersonaSummary | null;
  availableCoaches?: CoachPersonaSummary[];
  deliveredTip?: CoachTipItem | null;
}

export default function PostGameLessonCard({
  userId,
  userName,
  gameSlug,
  gameTitle,
  score,
  scoreDelta,
  targetMood,
  coach,
  availableCoaches = [],
  deliveredTip,
}: PostGameLessonCardProps) {
  const [kind, setKind] = useState<'works' | 'avoid' | 'question'>('works');
  const [lessonText, setLessonText] = useState('');
  const [shareTo, setShareTo] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [savedLesson, setSavedLesson] = useState<UserSharedLesson | null>(null);
  const [tipRated, setTipRated] = useState<'helped' | 'skipped' | null>(null);

  const handleRateTip = async (helped: boolean) => {
    if (!deliveredTip) return;
    setTipRated(helped ? 'helped' : 'skipped');
    await rateCoachTipFeedback({
      tipText: deliveredTip.text,
      fromId: deliveredTip.fromId || coach?.id || 'island',
      gameSlug,
      helped,
      scoreDelta: scoreDelta ?? null,
    });
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonText.trim()) return;
    setIsSaving(true);
    try {
      const saved = await submitPlayerLesson({
        userId: userId || 'guest',
        userName: userName || 'Skillprint Player',
        gameSlug,
        gameTitle,
        kind,
        text: lessonText.trim(),
        score: typeof score === 'number' ? score : null,
        targetMood,
        shareTo,
      });
      if (saved) {
        setSavedLesson(saved);
        setLessonText('');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      aria-label="Coach feedback and lesson sharing"
      className="game-result__section separator-top layout-grid relative"
      style={{ gap: '16px' }}
    >
      <MockDataTag />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingRight: '80px' }}>
        <h3 className="portal-eyebrow game-result__section-title" style={{ margin: 0 }}>
          Coach & Shared Learnings
        </h3>
        <span className="font-xs text-muted">Attaches to your profile & LLM Island agents</span>
      </div>

      {/* 1. Rate the tip received from the AI coach during the session */}
      {deliveredTip && (
        <div
          className="radius-card padding-lg"
          style={{
            background: 'rgba(132, 115, 240, 0.1)',
            border: '1px solid rgba(132, 115, 240, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1 1 260px' }}>
            <CoachCharacterAvatar
              look={deliveredTip.fromLook || coach?.look}
              name={deliveredTip.fromName || coach?.name || 'Coach'}
              size={32}
            />
            <div>
              <span className="font-xs weight-semibold" style={{ color: '#c8c2f7', display: 'block' }}>
                Tip from {deliveredTip.fromName || coach?.name || 'AI Coach'} during this run:
              </span>
              <p className="margin-none font-sm" style={{ color: '#ffffff' }}>
                “{deliveredTip.text}”
              </p>
            </div>
          </div>

          {tipRated ? (
            <span className="font-xs weight-semibold" style={{ color: '#4ce7ae' }}>
              {tipRated === 'helped'
                ? '✔ Marked helpful — credited to coach playbook!'
                : 'Noted — coach will adjust next time.'}
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-xs text-muted">Did this help?</span>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => handleRateTip(true)}
              >
                👍 Yes
              </button>
              <button
                type="button"
                className="button button--tertiary button--sm"
                onClick={() => handleRateTip(false)}
              >
                Not really
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Share a lesson learned from this session */}
      <div
        className="radius-card padding-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'grid',
          gap: '12px',
        }}
      >
        <div>
          <strong className="font-md leading-lg weight-semibold" style={{ display: 'block' }}>
            Share a lesson from your {gameTitle} run
          </strong>
          <span className="font-sm text-muted">
            What worked, what trapped you, or what question should another human or AI agent test next?
          </span>
        </div>

        {savedLesson ? (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(9, 224, 143, 0.12)',
              border: '1px solid rgba(9, 224, 143, 0.4)',
              display: 'grid',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <strong style={{ color: '#4ce7ae', fontSize: '13.5px' }}>
                ✔ Lesson attached to your profile!
              </strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/profile#lessons" className="font-xs weight-semibold" style={{ color: '#5bfde1' }}>
                  View on Profile →
                </Link>
                <button
                  type="button"
                  onClick={() => setSavedLesson(null)}
                  className="button button--tertiary button--sm"
                  style={{ minHeight: '26px', padding: '2px 8px', fontSize: '11px' }}
                >
                  Add another
                </button>
              </div>
            </div>
            <p className="margin-none font-sm" style={{ color: '#f8f9fc' }}>
              “{savedLesson.text}”
            </p>
            {savedLesson.attributions && savedLesson.attributions.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span className="font-xs text-muted">Queued for AI agents:</span>
                {savedLesson.attributions.map((attr) => (
                  <span
                    key={attr.personaId}
                    className="ui-badge ui-badge--pill"
                    style={{
                      fontSize: '11px',
                      background: 'rgba(132, 115, 240, 0.22)',
                      borderColor: 'rgba(132, 115, 240, 0.5)',
                      color: '#dedcf9',
                    }}
                  >
                    🤖 {attr.personaName} ({attr.status})
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSaveLesson} style={{ display: 'grid', gap: '12px' }}>
            {/* Kind selector + Share target selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }} role="group" aria-label="Lesson type">
                {(
                  [
                    { id: 'works', label: '✔ What worked', color: '#4ce7ae' },
                    { id: 'avoid', label: '✘ Trap to avoid', color: '#ff518d' },
                    { id: 'question', label: '? Question to test', color: '#fdc65a' },
                  ] as const
                ).map((item) => {
                  const active = kind === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setKind(item.id)}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: active ? 'rgba(87, 62, 235, 0.35)' : 'rgba(255, 255, 255, 0.06)',
                        border: active
                          ? `1px solid ${item.color}`
                          : '1px solid rgba(255, 255, 255, 0.14)',
                        color: active ? '#ffffff' : '#d9dcea',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="lessonShareTarget" className="font-xs text-muted">
                  Share with:
                </label>
                <select
                  id="lessonShareTarget"
                  value={shareTo}
                  onChange={(e) => setShareTo(e.target.value)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'var(--panel-navy-900, #212549)',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                >
                  <option value="all">Everyone (Humans & AI Agents)</option>
                  {availableCoaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      AI Agent: {c.name} ({c.label})
                    </option>
                  ))}
                  <option value="humans">Other Human Players</option>
                  <option value="private">My Profile Only</option>
                </select>
              </div>
            </div>

            {/* Text input + Save button */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                maxLength={220}
                value={lessonText}
                onChange={(e) => setLessonText(e.target.value)}
                placeholder={
                  kind === 'works'
                    ? `e.g., Anchor high tiles in one corner on ${gameTitle} before merging…`
                    : kind === 'avoid'
                    ? `e.g., Avoid impulse-tapping before checking the next piece color…`
                    : `e.g., Does a slower pace in the first 30s improve combo streaks?`
                }
                style={{
                  flex: '1 1 260px',
                  minHeight: '40px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(4, 6, 22, 0.45)',
                  color: '#ffffff',
                  fontSize: '13px',
                }}
              />
              <button
                type="submit"
                disabled={isSaving || !lessonText.trim()}
                className="button button--primary button--md"
              >
                {isSaving ? 'Saving…' : 'Save & Share Lesson'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
