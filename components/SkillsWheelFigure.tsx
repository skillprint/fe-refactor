import React from 'react';
import { WHEEL, wheelSpokes } from '@/lib/skillsWheel';

export interface SkillsWheelFigureProps {
  scores: Record<string, number | undefined>;
  /** The hub's line: whose wheel this is. */
  title?: string;
}

/**
 * The Skillprint wheel as a static figure (no hover), for the shared
 * snapshot page. It reuses the profile wheel's classes, so it is drawn in
 * the same style; `.snapshot-wheel` supplies the colours the profile's
 * panel normally provides.
 */
export default function SkillsWheelFigure({ scores, title = 'A Skillprint' }: SkillsWheelFigureProps) {
  const spokes = wheelSpokes(scores);
  if (spokes.length === 0) return null;
  const { CX, CY, R_HUB, R_IN, R_OUT, R_LABEL } = WHEEL;
  const measured = spokes.filter((s) => s.hasScore).length;
  // The longest label (Emotional Stability with its score) runs about 205
  // units past the label ring at this size; the key is left out.
  const pad = R_LABEL + 212;

  return (
    <figure className="snapshot-wheel margin-none">
      <svg
        className="pp-skills-wheel__svg"
        viewBox={`${CX - pad} ${CY - pad} ${pad * 2} ${pad * 2}`}
        role="img"
        aria-label={`Skillprint wheel: ${measured} of ${spokes.length} skills measured, ${spokes
          .filter((s) => s.hasScore)
          .map((s) => `${s.name} ${Math.round(s.value)}`)
          .join(', ')}`}
      >
        <g className="sw-rings" aria-hidden="true">
          {[0.34, 0.67, 1].map((f) => (
            <circle key={f} cx={CX} cy={CY} r={R_IN + (R_OUT - R_IN) * f} className={`sw-ring${f === 1 ? ' sw-ring--edge' : ''}`} />
          ))}
        </g>
        <g className="sw-spokes" aria-hidden="true">
          {spokes.map((s) => (
            <g key={s.slug} className={`sw-spoke${s.hasScore ? '' : ' is-unread'}`} data-dimension={s.pillar}>
              <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} className="sw-spoke__line" strokeWidth={s.strokeWidth} strokeOpacity={s.strokeOpacity} />
            </g>
          ))}
        </g>
        <g className="sw-labels" aria-hidden="true">
          {spokes.map((s) => {
            const score = s.hasScore ? `${Math.round(s.value)}%` : null;
            return (
              <text
                key={s.slug}
                x={s.label.x}
                y={s.label.y}
                className="sw-label"
                data-dimension={s.pillar}
                textAnchor={s.label.anchor}
                dominantBaseline="middle"
                transform={`rotate(${s.label.rotate} ${s.label.x} ${s.label.y})`}
              >
                {score && s.label.scoreFirst && <tspan className="sw-label__score">{score}</tspan>}
                <tspan className="sw-label__name" dx={score && s.label.scoreFirst ? 8 : 0}>{s.name}</tspan>
                {score && !s.label.scoreFirst && <tspan className="sw-label__score" dx="8">{score}</tspan>}
              </text>
            );
          })}
        </g>
        <g className="sw-centre" aria-hidden="true">
          <circle cx={CX} cy={CY} r={R_HUB - 8} className="sw-centre__disc" />
          <text x={CX} y={CY - 2} textAnchor="middle" className="sw-centre__title">{title}</text>
          <text x={CX} y={CY + 20} textAnchor="middle" className="sw-centre__copy">{measured} of {spokes.length}</text>
        </g>
      </svg>
      <figcaption className="snapshot-wheel__key">
        <span data-dimension="mood"><i></i>Mood</span>
        <span data-dimension="cognition"><i></i>Cognition</span>
        <span data-dimension="personality"><i></i>Personality</span>
        <span className="snapshot-wheel__hint">Thicker and brighter is a higher score</span>
      </figcaption>
    </figure>
  );
}
