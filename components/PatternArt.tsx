import React from 'react';
import { ART, ART_BY_NAME, PATTERNS } from '@/lib/gameArtMotion';
import { baseSlug } from '@/lib/gameSlug';

const ICON_LAYERS = '/assets/images/games/icon-layers/';

const compact = (value: string) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * The icon-layer file for a game, matched on its base slug first and its title
 * second (`sumagi-2` is titled "Sumagi"). Null for games the design has no art for.
 */
export function patternArtFile(slug: string, title: string): string | null {
  return ART_BY_NAME[compact(baseSlug(slug))] || ART_BY_NAME[compact(title)] || null;
}

/**
 * Portal v2's game-card media: a patterned background that holds its first
 * frame until the card is hovered or focused (app/pattern-motion.css), with the
 * game's drawing on a transparent canvas above it. Renders inside `.art-stack`.
 */
export function PatternArt({ file, alt }: { file: string; alt: string }) {
  const [pattern, tone] = ART[file];
  return (
    <>
      <svg
        className="art-layer pm-bg position-absolute layout-block"
        data-tone={tone}
        data-pattern={pattern}
        viewBox="0 0 380 210"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: PATTERNS[pattern] }}
      />
      <img alt={alt} className="art-layer art-static position-absolute layout-block opaque" src={ICON_LAYERS + file} />
    </>
  );
}
