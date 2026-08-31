import React from 'react';
import Link from 'next/link';

export function PlayBySkill() {
  return (
    <div className="skill-launch">
      <Link className="skill-launch__card skill-launch__card--all sp-card sp-card--interactive" href="/skills">
        <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
          <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-layout-grid"></use></svg>
        </span>
        <span className="skill-launch__name">All skills</span>
        <span className="skill-launch__meta">The full index</span>
      </Link>

      <Link className="skill-launch__card sp-card sp-card--interactive" href="/skills#mood" data-dimension="mood">
        <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
          <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-category-mood"></use></svg>
        </span>
        <span className="skill-launch__name">Mood</span>
        <span className="skill-launch__meta">9 skills · how a session feels</span>
      </Link>

      <Link className="skill-launch__card sp-card sp-card--interactive" href="/skills#cognition" data-dimension="cognition">
        <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
          <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-category-cognition"></use></svg>
        </span>
        <span className="skill-launch__name">Cognition</span>
        <span className="skill-launch__meta">14 skills · how you solve it</span>
      </Link>

      <Link className="skill-launch__card sp-card sp-card--interactive" href="/skills#personality" data-dimension="personality">
        <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
          <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-category-personality"></use></svg>
        </span>
        <span className="skill-launch__name">Personality</span>
        <span className="skill-launch__meta">5 traits · how you show up</span>
      </Link>
    </div>
  );
}
