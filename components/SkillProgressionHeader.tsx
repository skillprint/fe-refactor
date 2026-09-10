import React from 'react';
import Link from 'next/link';
import type { SkillCatalogEntry } from '@/lib/skillCatalog';
import { pillarLabel } from '@/lib/skillIcons';

interface SkillProgressionHeaderProps {
  skill: SkillCatalogEntry;
}

export function SkillProgressionHeader({ skill }: SkillProgressionHeaderProps) {
  return (
    <div className="portal-head">
      <Link className="stat-hero__back layout-inline-flex items-center gap-md font-sm weight-semibold no-grow" href="/skills">
        <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-left"></use></svg>Skills
      </Link>
      
      <div className="portal-head__row">
        <div className="layout-flex items-center gap-lg min-width-0">
          <span aria-hidden="true" className="stat-hero__glyph sp-icon-frame sp-icon-frame--md sp-icon-frame--round">
            <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href={`#${skill.iconId}`}></use></svg>
          </span>
          <h1>{skill.name}</h1>
          <span className="ui-badge ui-badge--pill progression-pillar">{pillarLabel(skill.pillar)}</span>
          {skill.category && <span className="ui-badge ui-badge--pill">{skill.category}</span>}
        </div>
        <a className="button button--primary button--md no-grow" href="#games">
          <span>Build this skill</span>
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-down"></use></svg>
        </a>
      </div>
      <p>{skill.description}</p>
    </div>
  );
}
