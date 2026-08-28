import React from 'react';
import Link from 'next/link';
import { GameRail } from './GameRail';
import { GameTile, GameTileProps } from './GameTile';

export interface SkillFeatureCardProps {
  skillName: string;
  skillSlug: string;
  skillDescription: string;
  iconId: string;
  dimensionName: string;
  games: GameTileProps[];
}

export function SkillFeatureCard({
  skillName,
  skillSlug,
  skillDescription,
  iconId,
  dimensionName,
  games
}: SkillFeatureCardProps) {
  return (
    <article className="skill-feature sp-card">
      <div className="skill-feature__head">
        <div className="skill-feature__identity layout-flex items-center gap-lg">
          <span className="skill-feature__icon sp-icon-frame sp-icon-frame--lg" aria-hidden="true">
            <svg className="sp-icon sp-icon--md" viewBox="0 0 24 24">
              <use href={`#${iconId}`}></use>
            </svg>
          </span>
          <div className="min-width-0">
            <span className="portal-eyebrow skill-feature__eyebrow layout-block">Featured {dimensionName} skill</span>
            <h3 className="skill-feature__title margin-none">{skillName}</h3>
          </div>
        </div>
        <p className="skill-feature__copy margin-none text-muted">{skillDescription}</p>
        <div className="skill-feature__rule"></div>
      </div>
      <div className="skill-feature__bar layout-flex items-center justify-between gap-lg wrap">
        <h4 className="margin-none">Games to develop this skill</h4>
        <Link className="skill-feature__all layout-inline-flex items-center gap-xs font-sm weight-semibold" data-route={`/games?tab=skills&filter=${skillSlug}`} href={`/skills/${skillSlug}`}>
          View all <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
        </Link>
      </div>
      <GameRail isLibrary={false}>
        {games.map(game => (
          <GameTile key={game.id} {...game} />
        ))}
      </GameRail>
    </article>
  );
}
