'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

export interface GamePillProps {
  slug: string;
  name: string;
  description?: string;
  image?: string;
}

export function GamePill({ slug, name, description, image }: GamePillProps) {
  const [isHovered, setIsHovered] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isHovered) {
      // Small delay to prevent flickering on quick pass-over
      timeoutId = setTimeout(() => {
        if (triggerRef.current) {
          setRect(triggerRef.current.getBoundingClientRect());
        }
      }, 200);
    } else {
      setRect(null);
    }

    return () => clearTimeout(timeoutId);
  }, [isHovered]);

  return (
    <>
      <Link 
        ref={triggerRef}
        className={`skill-game ${rect ? 'is-peeking' : ''}`} 
        href={`/game_detail/?game=${slug}`} 
        data-game-peek={name}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        {name}
      </Link>

      {rect && typeof document !== 'undefined' && createPortal(
        <div 
          className="game-peek is-visible" 
          role="dialog" 
          style={{
            position: 'absolute',
            top: window.scrollY + rect.bottom + 12,
            left: window.scrollX + rect.left + (rect.width / 2) - 140, // Centered (assuming width 280px)
            zIndex: 1000
          }}
          data-side="below"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="game-peek__head">
            <span className="game-peek__art">
              <img alt="" src={image || '/skillprint-portal-redesign/assets/images/games/game-space-trip.svg'} />
            </span>
            <span className="min-width-0"><strong className="game-peek__title">{name}</strong></span>
          </div>
          {description && <p className="game-peek__summary">{description}</p>}
          <div className="game-peek__foot">
            <span className="game-peek__meta">
              <span className="game-peek__time">5–10 min</span>
              <span className="game-peek__genre">Puzzle</span>
            </span>
            <Link className="game-peek__cue" href={`/game_session/?game=${slug}`} tabIndex={-1}>
              <span className="game-peek__cue-label">Play</span>
              <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
            </Link>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
