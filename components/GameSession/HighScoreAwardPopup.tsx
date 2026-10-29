'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import ShareSheet from '../ShareSheet';
import { gameSharePayload } from '../../lib/share';
import { siteUrl } from '../../lib/siteUrl';
import { baseSlug } from '../../lib/gameSlug';
import { getGameDetails } from '../../app/config/gameConfig';
import { formatHighScore, type HighScoreAchievement } from '../../lib/highScores';

const AWARD_SECONDS = 10;

export interface HighScoreAwardPopupProps {
  achievement: HighScoreAchievement;
  gameTitle: string;
  gameSlug?: string;
  hidePortalLinks?: boolean;
  onContinue: () => void;
}

export default function HighScoreAwardPopup({
  achievement,
  gameTitle,
  gameSlug,
  hidePortalLinks = false,
  onContinue,
}: HighScoreAwardPopupProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(AWARD_SECONDS);
  const [holds, setHolds] = useState<string[]>([]);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>('');
  const handedOverRef = useRef<boolean>(false);
  const panelRef = useRef<HTMLElement | null>(null);

  const shareSlug = baseSlug(gameSlug || '');
  const gameDetails = shareSlug ? getGameDetails(shareSlug) : undefined;
  const gameImage = gameDetails?.image;
  const shareable = Boolean(shareSlug) && !hidePortalLinks;

  const handleContinue = useCallback(() => {
    if (handedOverRef.current) return;
    handedOverRef.current = true;
    onContinue();
  }, [onContinue]);

  const addHold = useCallback((reason: string) => {
    setHolds((prev) => {
      if (prev.includes(reason)) return prev;
      if (prev.length === 0) {
        setStatusAnnouncement('Countdown paused. Your results will wait until you choose View results.');
      }
      return [...prev, reason];
    });
  }, []);

  const removeHold = useCallback((reason: string) => {
    setHolds((prev) => {
      if (!prev.includes(reason)) return prev;
      const next = prev.filter((r) => r !== reason);
      if (next.length === 0) {
        setStatusAnnouncement('Countdown resumed.');
      }
      return next;
    });
  }, []);

  // Detect reduced motion, focus the panel, and fire celebratory confetti
  useEffect(() => {
    const mq = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    const isReduced = Boolean(mq?.matches);
    setReducedMotion(isReduced);

    setStatusAnnouncement(
      `${achievement.eyebrow}: ${achievement.headline} ${formatHighScore(achievement.score)} points in ${gameTitle}. ${achievement.summary}`,
    );

    const focusTimer = setTimeout(() => {
      panelRef.current?.focus({ preventScroll: true });
    }, 30);

    if (!isReduced) {
      try {
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { x: 0.3, y: 0.55 },
          zIndex: 400,
        });
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { x: 0.7, y: 0.55 },
          zIndex: 400,
        });
      } catch {
        // Ignore canvas errors in headless/test environments
      }
    }

    return () => {
      clearTimeout(focusTimer);
    };
  }, [achievement, gameTitle]);

  // Countdown timer
  useEffect(() => {
    if (reducedMotion || holds.length > 0 || shareOpen) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [reducedMotion, holds.length, shareOpen]);

  useEffect(() => {
    if (!reducedMotion && secondsLeft <= 0) {
      handleContinue();
    }
  }, [secondsLeft, reducedMotion, handleContinue]);

  // Escape key advances when ShareSheet isn't open
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (shareOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        handleContinue();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shareOpen, handleContinue]);

  const handlePointerEnter = () => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches) {
      addHold('hover');
    }
  };

  const handlePointerLeave = () => {
    removeHold('hover');
  };

  const handleFocusIn = (e: React.FocusEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;
    if (target && target !== panelRef.current && target.closest('a, button, input, select, textarea')) {
      addHold('focus');
    }
  };

  const isHeld = holds.length > 0 || shareOpen;
  const countState = reducedMotion ? 'held' : isHeld ? 'paused' : 'running';
  const noteText = reducedMotion
    ? 'Your results are ready when you are.'
    : isHeld
      ? 'Paused while you read.'
      : 'Your results open automatically.';

  const sharePayload = () => {
    const origin = siteUrl();
    const payload = gameSharePayload(
      origin,
      { baseSlug: shareSlug, name: gameTitle },
      gameImage ? new URL(gameImage, `${origin}/`).toString() : null,
    );
    payload.text = achievement.shareText;
    return payload;
  };

  return (
    <div
      className="session-veil session-veil--award"
      data-step="badge"
      data-high-score-popup=""
      style={{ display: 'grid' }}
    >
      <article
        ref={panelRef}
        aria-labelledby="awardTitle"
        aria-modal="true"
        className="award-panel high-score-award layout-grid"
        data-award-panel=""
        id="highScoreAward"
        role="dialog"
        tabIndex={-1}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocusIn}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') addHold('key');
        }}
      >
        <span
          className="ui-label award-panel__eyebrow layout-inline-flex items-center gap-md"
          data-high-score-eyebrow=""
        >
          <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-trophy"></use>
          </svg>
          {achievement.eyebrow}
        </span>

        <div className="award-panel__badge" data-award-badge="">
          <figure className="sp-badge sp-badge--lg margin-none" data-earned="true">
            <div
              className="sp-badge__art high-score-award__emblem layout-grid place-center"
              aria-hidden="true"
            >
              <svg className="high-score-award__trophy" viewBox="0 0 24 24">
                <use href="#ti-trophy"></use>
              </svg>
            </div>

            <figcaption className="sp-badge__copy layout-grid gap-sm">
              <h2 id="awardTitle" className="sp-badge__name high-score-award__title margin-none">
                {achievement.headline}
              </h2>

              <div
                className="layout-flex items-center justify-center gap-sm wrap"
                data-high-score-milestones=""
              >
                {achievement.milestones.map((m) => (
                  <span
                    key={m.id}
                    className="game-result__best ui-badge ui-badge--pill ui-badge--leading"
                    data-milestone={m.id}
                  >
                    <i className="ui-badge__dot"></i>
                    {m.label}
                  </span>
                ))}
              </div>

              <strong
                className="game-result__score-value high-score-award__score layout-block"
                data-high-score-value=""
              >
                {formatHighScore(achievement.score)}
              </strong>

              <p className="sp-badge__reason margin-none" data-high-score-summary="">
                {achievement.summary}
              </p>

              <span className="sp-badge__foot justify-center">
                {gameImage && (
                  <img
                    className="sp-badge__glyph"
                    src={gameImage}
                    alt=""
                    width="18"
                    height="18"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="sp-badge__game-name">{gameTitle}</span>
                <span className="sp-badge__dot" aria-hidden="true">·</span>
                <span className="sp-badge__when">
                  {achievement.isAllTime && achievement.isWeekly
                    ? 'All time & this week'
                    : achievement.isAllTime
                      ? 'All-time record'
                      : 'Weekly record'}
                </span>
              </span>
            </figcaption>
          </figure>
        </div>

        <div className="award-panel__actions layout-grid gap-lg">
          <div className="high-score-award__buttons layout-flex items-center justify-center gap-md wrap">
            {shareable && (
              <button
                className="button button--secondary button--lg"
                type="button"
                onClick={() => {
                  addHold('share');
                  setShareOpen(true);
                }}
                aria-label={`Share new high score in ${gameTitle}`}
                data-award-share=""
              >
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <use href="#ti-share"></use>
                </svg>
                Share score
              </button>
            )}
            <button
              className="button button--primary button--lg"
              data-award-go=""
              type="button"
              onClick={handleContinue}
            >
              View results
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                <use href="#ti-arrow-right"></use>
              </svg>
            </button>
          </div>

          <p
            className="award-count layout-flex items-center justify-center gap-md margin-none"
            data-award-count=""
            data-state={countState}
          >
            <span
              aria-hidden="true"
              className="sp-progress-ring award-count__ring no-grow"
              data-award-ring=""
              style={
                {
                  '--progress-count': Math.max(0, secondsLeft),
                  '--progress-total': AWARD_SECONDS,
                } as React.CSSProperties
              }
            >
              <svg className="sp-progress-ring__svg" aria-hidden="true" viewBox="0 0 40 40">
                <circle className="sp-progress-ring__track" cx="20" cy="20" r="15.9155"></circle>
                <circle className="sp-progress-ring__value" cx="20" cy="20" r="15.9155"></circle>
              </svg>
              <span className="sp-progress-ring__copy">
                <strong className="award-count__seconds" data-award-seconds="">
                  {Math.max(0, secondsLeft)}
                </strong>
              </span>
            </span>
            <span className="award-count__note font-sm leading-sm" data-award-note="">
              {noteText}
            </span>
          </p>
        </div>
      </article>

      <p className="sr-only" data-award-status="" role="status">
        {statusAnnouncement}
      </p>

      {shareable && shareOpen && (
        <ShareSheet
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          heading={`Share ${gameTitle} high score`}
          payload={sharePayload()}
        />
      )}
    </div>
  );
}
