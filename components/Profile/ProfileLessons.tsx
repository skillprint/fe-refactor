'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { CoachPersonaSummary, UserSharedLesson } from '@/lib/coachBridge';
import { fetchPlayerLessons, submitPlayerLesson } from '@/app/hooks/useIslandCoach';
import CoachCharacterAvatar from '../GameSession/CoachCharacterAvatar';
import { MockDataTag } from '../MockDataTag';

interface ProfileLessonsProps {
  userId?: string | null;
  userName?: string;
  uniqueGames?: Array<{ slug: string; name: string }>;
}

const KIND_META: Record<
  'works' | 'avoid' | 'question',
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  works: {
    label: 'What Worked',
    icon: '✔',
    color: '#09e08f',
    bg: 'rgba(9, 224, 143, 0.12)',
    border: 'rgba(9, 224, 143, 0.38)',
  },
  avoid: {
    label: 'Trap to Avoid',
    icon: '✘',
    color: '#ff518d',
    bg: 'rgba(255, 81, 141, 0.12)',
    border: 'rgba(255, 81, 141, 0.38)',
  },
  question: {
    label: 'Question to Test',
    icon: '?',
    color: '#ffb21b',
    bg: 'rgba(255, 178, 27, 0.12)',
    border: 'rgba(255, 178, 27, 0.38)',
  },
};

export default function ProfileLessons({
  userId,
  userName,
  uniqueGames = [],
}: ProfileLessonsProps) {
  const [lessons, setLessons] = useState<UserSharedLesson[]>([]);
  const [coaches, setCoaches] = useState<CoachPersonaSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'mine' | 'community'>('mine');
  const [showComposer, setShowComposer] = useState<boolean>(false);

  // Composer state
  const [selectedGame, setSelectedGame] = useState<string>(
    uniqueGames[0]?.slug || 'hextris'
  );
  const [kind, setKind] = useState<'works' | 'avoid' | 'question'>('works');
  const [text, setText] = useState<string>('');
  const [shareTo, setShareTo] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sharedStatus, setSharedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (uniqueGames.length > 0 && !selectedGame) {
      setSelectedGame(uniqueGames[0].slug);
    }
  }, [uniqueGames, selectedGame]);

  const loadLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchPlayerLessons(
        viewMode === 'mine' && userId ? { userId } : undefined
      );
      setLessons(res.lessons);
      if (res.coaches.length > 0) {
        setCoaches(res.coaches);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, viewMode]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSubmitting(true);
    setSharedStatus(null);
    try {
      const gameObj = uniqueGames.find((g) => g.slug === selectedGame);
      const created = await submitPlayerLesson({
        userId: userId || 'guest',
        userName: userName || 'Skillprint Player',
        gameSlug: selectedGame || 'hextris',
        gameTitle: gameObj?.name || selectedGame,
        kind,
        text: text.trim(),
        shareTo,
      });
      if (created) {
        setLessons((prev) => [created, ...prev.filter((l) => l.id !== created.id)]);
        setText('');
        setShowComposer(false);
        setSharedStatus(`Saved lesson for ${created.gameTitle} and shared with ${shareTo === 'all' ? 'all players & AI agents' : shareTo}!`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBroadcastExisting = async (lesson: UserSharedLesson, targetCoachId: string) => {
    const updated = await submitPlayerLesson({
      userId: userId || lesson.userId || 'guest',
      userName: userName || lesson.userName,
      gameSlug: lesson.gameSlug,
      gameTitle: lesson.gameTitle,
      kind: lesson.kind,
      text: lesson.text,
      score: lesson.score,
      shareTo: targetCoachId,
    });
    if (updated) {
      setLessons((prev) => prev.map((l) => (l.id === lesson.id ? updated : l)));
      const targetName =
        targetCoachId === 'all'
          ? 'all AI agents & players'
          : coaches.find((c) => c.id === targetCoachId)?.name || targetCoachId;
      setSharedStatus(`Sent "${lesson.text.slice(0, 48)}…" to ${targetName}!`);
    }
  };

  const gameOptions =
    uniqueGames.length > 0
      ? uniqueGames
      : [
          { slug: 'hextris', name: 'Hextris' },
          { slug: '2048', name: '2048' },
          { slug: 'stroop-test', name: 'Stroop Test' },
          { slug: 'box-tower', name: 'Box Tower' },
          { slug: 'gummy-blocks', name: 'Gummy Blocks' },
          { slug: 'mage-duel', name: 'Mage Duel' },
        ];

  return (
    <section className="pp-section relative" id="lessons">
      <MockDataTag />
      <div className="section-head pp-head layout-flex wrap items-end justify-between gap-2xl">
        <div className="section-head-copy">
          <h2>Lessons learned &amp; AI coach playbook</h2>
          <p className="margin-none text-muted">
            Tactics and reflections you have recorded while playing, attached to your profile and shared with other human players and LLM Island AI agents.
          </p>
        </div>
        <div className="cluster gap-md">
          <div className="button-group" role="group" aria-label="Lessons filter">
            <button
              type="button"
              className={`button-group__item ${viewMode === 'mine' ? 'is-current' : ''}`}
              aria-pressed={viewMode === 'mine'}
              onClick={() => setViewMode('mine')}
            >
              My Lessons
            </button>
            <button
              type="button"
              className={`button-group__item ${viewMode === 'community' ? 'is-current' : ''}`}
              aria-pressed={viewMode === 'community'}
              onClick={() => setViewMode('community')}
            >
              All Shared Lessons
            </button>
          </div>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={() => setShowComposer((prev) => !prev)}
          >
            {showComposer ? 'Cancel' : '+ Share a Lesson'}
          </button>
        </div>
      </div>

      {sharedStatus && (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(9, 224, 143, 0.14)',
            border: '1px solid rgba(9, 224, 143, 0.4)',
            color: '#09e08f',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>✔ {sharedStatus}</span>
          <button
            type="button"
            onClick={() => setSharedStatus(null)}
            style={{ background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Composer panel */}
      {showComposer && (
        <form
          onSubmit={handleCreateLesson}
          className="sp-panel"
          style={{
            padding: '20px 24px',
            marginBottom: '20px',
            display: 'grid',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <strong className="font-md weight-semibold">Attach a new lesson to your profile</strong>
            <span className="font-xs text-muted">
              Shared lessons are injected into AI agents’ pre-game briefings &amp; surfaced to players.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span className="text-muted">Game:</span>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--surface-border-hover)',
                  background: 'var(--surface-box)',
                  color: 'var(--surface-text)',
                  fontSize: '13px',
                }}
              >
                {gameOptions.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['works', 'avoid', 'question'] as const).map((k) => {
                const meta = KIND_META[k];
                const active = kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setKind(k)}
                    className={`ui-tag ${active ? 'is-selected' : ''}`}
                    style={{ minHeight: '30px' }}
                  >
                    {meta.icon} {meta.label}
                  </button>
                );
              })}
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginLeft: 'auto' }}>
              <span className="text-muted">Share with:</span>
              <select
                value={shareTo}
                onChange={(e) => setShareTo(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--surface-border-hover)',
                  background: 'var(--surface-box)',
                  color: 'var(--surface-text)',
                  fontSize: '13px',
                }}
              >
                <option value="all">Everyone (Humans &amp; AI Agents)</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    AI Agent: {c.name} ({c.label})
                  </option>
                ))}
                <option value="humans">Other Human Players</option>
                <option value="private">My Profile Only</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              maxLength={220}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write one clear, actionable sentence about what you learned while playing…"
              style={{
                flex: '1 1 300px',
                minHeight: '42px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--surface-border-hover)',
                background: 'var(--surface-box)',
                color: 'var(--surface-text)',
                fontSize: '14px',
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="button button--primary button--md"
            >
              {isSubmitting ? 'Saving…' : 'Save to Profile'}
            </button>
          </div>
        </form>
      )}

      <div className="pp-sessions sp-panel">
        <div className="pp-sessions__head separator-bottom layout-flex wrap items-end justify-between gap-lg">
          <div className="min-width-0">
            <h3>{viewMode === 'mine' ? 'Your recorded lessons' : 'Community & AI shared lessons'}</h3>
            <p className="margin-none text-muted font-sm">
              {lessons.length === 0
                ? 'No lessons recorded yet. Share what you learned after any game session or click "+ Share a Lesson" above.'
                : 'Lessons shared from gameplay sessions, with live AI agent adoption tracking.'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {coaches.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="font-xs text-muted">Active AI Agents:</span>
                {coaches.map((c) => (
                  <span
                    key={c.id}
                    title={`${c.name} (${c.label})`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11.5px',
                      padding: '2px 8px 2px 4px',
                      borderRadius: '9999px',
                      background: 'var(--surface-box)',
                      border: '1px solid var(--surface-border)',
                    }}
                  >
                    <CoachCharacterAvatar look={c.look} name={c.name} size={18} />
                    <span>{c.name}</span>
                  </span>
                ))}
              </div>
            )}
            <span className="pp-played radius-full layout-inline-flex items-center gap-sm font-xs weight-semibold no-grow">
              Lessons <strong>{lessons.length}</strong>
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-muted font-sm">Loading lessons…</p>
          </div>
        ) : lessons.length > 0 ? (
          <ul className="pp-session-list layout-grid gap-md margin-none">
            {lessons.map((lesson) => {
              const meta = KIND_META[lesson.kind] || KIND_META.works;
              return (
                <li
                  key={lesson.id}
                  className="surface-box border-subtle"
                  style={{
                    padding: '16px 18px',
                    borderRadius: '14px',
                    display: 'grid',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 9px',
                          borderRadius: '9999px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          background: meta.bg,
                          border: `1px solid ${meta.border}`,
                          color: meta.color,
                        }}
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                      </span>

                      <Link
                        href={`/game_detail?game=${encodeURIComponent(lesson.gameSlug)}`}
                        className="weight-semibold font-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        {lesson.gameTitle || lesson.gameSlug}
                      </Link>

                      {typeof lesson.score === 'number' && lesson.score > 0 && (
                        <span className="font-xs text-muted">
                          · Scored <strong className="font-mono">{lesson.score.toLocaleString()}</strong>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-xs text-muted">
                        by {lesson.userName} &middot;{' '}
                        {new Date(lesson.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <Link
                        href={`/game/${encodeURIComponent(lesson.gameSlug)}`}
                        className="button button--tertiary button--sm"
                        style={{ minHeight: '28px', padding: '2px 10px', fontSize: '11.5px' }}
                      >
                        Play
                      </Link>
                    </div>
                  </div>

                  <p className="margin-none font-md" style={{ lineHeight: '22px' }}>
                    “{lesson.text}”
                  </p>

                  {/* Attribution & Share row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      flexWrap: 'wrap',
                      paddingTop: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {lesson.attributions && lesson.attributions.length > 0 ? (
                        lesson.attributions.map((attr) => (
                          <span
                            key={attr.personaId}
                            className="ui-badge ui-badge--pill"
                            style={{
                              fontSize: '11px',
                              background:
                                attr.status === 'validated' || attr.status === 'adopted'
                                  ? 'rgba(9, 224, 143, 0.16)'
                                  : 'rgba(132, 115, 240, 0.16)',
                              borderColor:
                                attr.status === 'validated' || attr.status === 'adopted'
                                  ? 'rgba(9, 224, 143, 0.45)'
                                  : 'rgba(132, 115, 240, 0.4)',
                            }}
                          >
                            🤖 {attr.personaName}: {attr.status}
                            {typeof attr.scoreDelta === 'number'
                              ? ` (${attr.scoreDelta >= 0 ? '+' : ''}${attr.scoreDelta})`
                              : ''}
                            {attr.evidence ? ` · ${attr.evidence}` : ''}
                          </span>
                        ))
                      ) : (
                        <span className="font-xs text-muted">Attached to profile</span>
                      )}
                    </div>

                    {coaches.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="font-xs text-muted">Share to agent:</span>
                        {coaches.slice(0, 3).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleBroadcastExisting(lesson, c.id)}
                            className="button button--tertiary button--sm"
                            style={{
                              minHeight: '26px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title={`Send this lesson to ${c.name}'s coaching inbox`}
                          >
                            <CoachCharacterAvatar look={c.look} name={c.name} size={14} />
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="portal-blank">
            <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
              <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24">
                <use href="#ti-gamepad"></use>
              </svg>
            </span>
            <p className="portal-blank__title">No lessons recorded yet</p>
            <p className="portal-blank__note">
              After you finish a game session (or using the &ldquo;+ Share a Lesson&rdquo; button above), jot down what worked or what trap to avoid. Your lessons attach here and help coach other players and AI agents.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
