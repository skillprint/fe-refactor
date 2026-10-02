'use client';

import React, { useEffect, useRef } from 'react';

export interface GameRailProps {
  children: React.ReactNode;
  isLibrary?: boolean;
  className?: string;
}

// Portal v2's railPeek (js/portal-v2.js): a rail with more cards than fit shows
// N whole cards plus a 48px sliver of the next, so it reads as scrollable. N is
// as many 264px cards as the rail's width holds. When every card fits they
// share the width instead. Phone width keeps the CSS's own full-width card.
const PEEK = 48;
const GAP = 16;
const MIN_CARD = 264;
const PHONE = 641;

function sizeRail(rail: HTMLElement) {
  const cards = Array.from(rail.children).filter((el) => (el as HTMLElement).offsetWidth > 0);
  const cs = window.getComputedStyle(rail);
  const width = rail.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
  if (window.innerWidth < PHONE || width < 2 * MIN_CARD || cards.length < 2) {
    rail.style.removeProperty('grid-auto-columns');
    return;
  }
  const gap = parseFloat(cs.columnGap) || GAP;
  let n = Math.max(1, Math.floor((width + gap) / (MIN_CARD + gap)));
  if (cards.length <= n) {
    rail.style.setProperty('grid-auto-columns', `calc((100% - ${(n - 1) * gap}px) / ${n})`);
    return;
  }
  while (n > 1 && (width - PEEK - n * gap) / n < MIN_CARD) n -= 1;
  rail.style.setProperty('grid-auto-columns', `calc((100% - ${n * gap + PEEK}px) / ${n})`);
}

export function GameRail({ children, isLibrary = false, className = '' }: GameRailProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = ref.current;
    if (!rail || typeof ResizeObserver === 'undefined') return;
    const resize = new ResizeObserver(() => sizeRail(rail));
    const mutate = new MutationObserver(() => sizeRail(rail));
    resize.observe(rail);
    mutate.observe(rail, { childList: true });
    sizeRail(rail);
    return () => {
      resize.disconnect();
      mutate.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`game-rail ${isLibrary ? 'game-rail--library' : ''} ${className}`.trim()}
      data-game-rail-scroll
      data-scroll-fade
    >
      {children}
    </div>
  );
}
