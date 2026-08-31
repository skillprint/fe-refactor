import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { PORTAL_SKILLS } from '../../app/config/skillsTaxonomy';
import { MockDataTag } from '../MockDataTag';

interface ProfileSkillsWheelProps {
  who?: string;
  scores: Record<string, number>;
}

const DIMENSIONS = [
  { key: 'mood', label: 'Mood' },
  { key: 'cognition', label: 'Cognition' },
  { key: 'personality', label: 'Personality' },
];

export default function ProfileSkillsWheel({
  who = 'Your skills',
  scores,
}: ProfileSkillsWheelProps) {
  const SIZE = 1000;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const VIEW_H = SIZE + 84;

  const R_HUB = 78;
  const R_IN = 88;
  const R_OUT = 268;
  const R_LABEL = 284;
  const LINE_MIN = 1;
  const LINE_MAX = 4.5;
  const GAP_DEG = 3;
  const KEY_GAP = 74;
  const START = 0;
  const OP_MIN = 0.12;

  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBoxStr, setViewBoxStr] = useState(`0 0 ${SIZE} ${VIEW_H}`);
  const [aspectRatioStr, setAspectRatioStr] = useState(`${SIZE} / ${VIEW_H}`);

  const fixed = (n: number) => Math.round(n * 1000) / 1000;

  const pt = (angle: number, r: number) => {
    const a = ((angle - 90) * Math.PI) / 180;
    return [fixed(CX + Math.cos(a) * r), fixed(CY + Math.sin(a) * r)];
  };

  const arcPath = (from: number, to: number, r: number) => {
    const [x1, y1] = pt(from, r);
    const [x2, y2] = pt(to, r);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };

  const byDimension = useMemo(() => {
    return DIMENSIONS.map((dim) => ({
      key: dim.key,
      label: dim.label,
      items: Object.keys(PORTAL_SKILLS)
        .filter((slug) => PORTAL_SKILLS[slug].pillar === dim.key)
        .map((slug) => ({
          slug,
          rec: PORTAL_SKILLS[slug],
          score: scores[slug],
        }))
        .sort((a, b) => {
          const aScore = typeof a.score === 'number' ? a.score : -1;
          const bScore = typeof b.score === 'number' ? b.score : -1;
          if (bScore !== aScore) return bScore - aScore;
          return a.rec.name.localeCompare(b.rec.name);
        }),
    }));
  }, [scores]);

  const total = byDimension.reduce((n, d) => n + d.items.length, 0);

  if (!total) return null;

  const gaps = DIMENSIONS.length * GAP_DEG;
  const perSkill = (360 - gaps) / total;

  let currentAngle = START;

  const spokes: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];
  const hits: React.ReactNode[] = [];

  byDimension.forEach((dim) => {
    const span = dim.items.length * perSkill;
    const startAngle = currentAngle;
    const endAngle = currentAngle + span;

    dim.items.forEach((item, i) => {
      const a = startAngle + (i + 0.5) * perSkill;
      const hasScore = typeof item.score === 'number';
      const value = hasScore ? Math.max(0, Math.min(100, item.score as number)) : 0;

      const [x1, y1] = pt(a, R_IN);
      const [x2, y2] = pt(a, R_OUT);

      const isHovered = hoveredSkill === item.slug;

      spokes.push(
        <g
          key={`spoke-${item.slug}`}
          className={`sw-spoke ${!hasScore ? 'is-unread' : ''} ${isHovered ? 'is-active' : ''}`}
          data-dimension={dim.key}
        >
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className="sw-spoke__line"
            strokeWidth={
              hasScore ? fixed(LINE_MIN + (LINE_MAX - LINE_MIN) * (value / 100)) : 1.5
            }
            strokeOpacity={
              hasScore ? fixed(OP_MIN + (1 - OP_MIN) * (value / 100)) : 0.5
            }
          />
        </g>
      );

      const [tx, ty] = pt(a, R_LABEL);
      const norm = ((a % 360) + 360) % 360;
      const rot = norm > 180 ? a + 90 : a - 90;
      const right = norm <= 180;

      labels.push(
        <text
          key={`label-${item.slug}`}
          x={tx}
          y={ty}
          className={`sw-label ${isHovered ? 'is-active' : ''}`}
          data-dimension={dim.key}
          textAnchor={norm > 180 ? 'end' : 'start'}
          dominantBaseline="middle"
          transform={`rotate(${fixed(rot)} ${fixed(tx)} ${fixed(ty)})`}
        >
          {hasScore && right ? (
            <>
              <tspan className="sw-label__score">{Math.round(value)}%</tspan>
              <tspan className="sw-label__name" dx="8">
                {item.rec.name}
              </tspan>
            </>
          ) : hasScore ? (
            <>
              <tspan className="sw-label__name">{item.rec.name}</tspan>
              <tspan className="sw-label__score" dx="8">
                {Math.round(value)}%
              </tspan>
            </>
          ) : (
            <tspan className="sw-label__name">{item.rec.name}</tspan>
          )}
        </text>
      );

      hits.push(
        <path
          key={`hit-${item.slug}`}
          d={`${arcPath(a - perSkill / 2, a + perSkill / 2, R_OUT + 34)} L ${pt(
            a + perSkill / 2,
            R_HUB
          ).join(' ')} A ${R_HUB} ${R_HUB} 0 0 0 ${pt(
            a - perSkill / 2,
            R_HUB
          ).join(' ')} Z`}
          className="sw-hit"
          tabIndex={0}
          role="button"
          onMouseEnter={() => setHoveredSkill(item.slug)}
          onMouseLeave={() => setHoveredSkill(null)}
          onFocus={() => setHoveredSkill(item.slug)}
          onBlur={() => setHoveredSkill(null)}
          aria-label={`${item.rec.name}. ${
            hasScore
              ? `${Math.round(value)}% for ${who}. ${dim.label} skill.`
              : `No score yet. ${dim.label} skill.`
          }`}
        />
      );
    });

    currentAngle = endAngle + GAP_DEG;
  });

  const refit = useCallback(() => {
    if (!svgRef.current) return;
    try {
      const box = svgRef.current.getBBox();
      if (!box || !box.width || !box.height) return;
      
      const PAD = 28;
      const x = box.x - PAD;
      const y = box.y - PAD;
      const w = box.width + PAD * 2;
      const h = box.height + PAD * 2;
      setViewBoxStr(`${fixed(x)} ${fixed(y)} ${fixed(w)} ${fixed(h)}`);
      setAspectRatioStr(`${fixed(w)} / ${fixed(h)}`);
    } catch (error) {
      // Ignore getBBox errors in environments where it fails or is unmounted
    }
  }, []);

  useEffect(() => {
    refit();
    
    // Add a resize observer to refit if it changes display state from none to block, etc.
    if (typeof ResizeObserver === 'function' && svgRef.current) {
      let done = svgRef.current.getBoundingClientRect().width > 0;
      const watch = new ResizeObserver(() => {
        if (!svgRef.current) return;
        if (done || svgRef.current.getBoundingClientRect().width <= 0) return;
        done = true;
        refit();
      });
      watch.observe(svgRef.current);
      return () => watch.disconnect();
    }
  }, [refit]);

  const RAMP_W = 260;
  const rampLeft = CX - RAMP_W / 2;
  const STEPS = 20;
  const KEY_Y = SIZE / 2 + R_LABEL + KEY_GAP;

  const rampLines = Array.from({ length: STEPS }).map((_, i) => {
    const f0 = i / STEPS;
    const f1 = (i + 1) / STEPS;
    return (
      <line
        key={`ramp-${i}`}
        x1={fixed(rampLeft + RAMP_W * f0)}
        y1={KEY_Y}
        x2={fixed(rampLeft + RAMP_W * f1 + 1)}
        y2={KEY_Y}
        className="sw-key__ramp"
        strokeWidth={fixed(LINE_MIN + (LINE_MAX - LINE_MIN) * f1)}
        strokeOpacity={fixed(OP_MIN + (1 - OP_MIN) * f1)}
      />
    );
  });

  const DIM_W = 250;
  const dimLeft = CX - (DIMENSIONS.length * DIM_W) / 2;

  const measuredCount = Object.values(scores).filter((val) => typeof val === 'number').length;

  return (
    <div className="pp-skills-wheel sp-panel" data-skills-who="You" style={{ position: 'relative' }}>
      <MockDataTag />
      <div className="pp-skills-wheel__body">
        <div className="min-width-0">
          <h2 className="pp-print__who" id="ppSkillsWheelTitle-first">Your skills</h2>
          <span className="pp-print__caption">
            {measuredCount === 0
              ? 'Nothing is scored yet. Each skill is a spoke that darkens and thickens as games measure it.'
              : `${measuredCount} of 28 measured so far \u00B7 thicker and darker is a higher score`}
          </span>
        </div>
      </div>
      <div className="pp-skills-wheel__body">
        <div className="pp-skills-wheel__figure" style={{ position: 'relative' }}>
          <svg
            ref={svgRef}
            className="pp-skills-wheel__svg"
            viewBox={viewBoxStr}
            style={{ aspectRatio: aspectRatioStr }}
            role="img"
            aria-label={`${who}'s 28 skills, grouped by dimension`}
          >
            <g className="sw-rings" aria-hidden="true">
              {[0.34, 0.67, 1].map((f) => (
                <circle
                  key={`ring-${f}`}
                  cx={CX}
                  cy={CY}
                  r={fixed(R_IN + (R_OUT - R_IN) * f)}
                  className={`sw-ring${f === 1 ? ' sw-ring--edge' : ''}`}
                />
              ))}
            </g>
            <g className="sw-spokes">{spokes}</g>
            <g className="sw-labels" aria-hidden="true">
              {labels}
            </g>
            <g className="sw-groups" aria-hidden="true"></g>
            <g className="sw-hits">{hits}</g>

            <g className="sw-key" aria-hidden="true">
              {rampLines}
              <text x={fixed(rampLeft - 14)} y={KEY_Y + 7} textAnchor="end" className="sw-key__label">
                0%
              </text>
              <text x={fixed(rampLeft + RAMP_W + 14)} y={KEY_Y + 7} className="sw-key__label">
                100%
              </text>
              <text x={CX} y={KEY_Y + 46} textAnchor="middle" className="sw-key__note">
                Thicker and more opaque, higher score
              </text>

              {byDimension.map((dim, i) => {
                const x = dimLeft + i * DIM_W + 20;
                return (
                  <g key={`dim-${dim.key}`} className="sw-key__item" data-dimension={dim.key}>
                    <line x1={fixed(x)} y1={KEY_Y + 78} x2={fixed(x + 30)} y2={KEY_Y + 78} className="sw-key__dash" />
                    <text x={fixed(x + 42)} y={KEY_Y + 85} className="sw-key__label">
                      {dim.label} · {dim.items.length}
                    </text>
                  </g>
                );
              })}
            </g>

            <g className="sw-centre" aria-hidden="true">
              <circle cx={CX} cy={CY} r={R_HUB - 8} className="sw-centre__disc" />
              <text x={CX} y={CY - 2} textAnchor="middle" className="sw-centre__title">
                {who}
              </text>
              <text x={CX} y={CY + 20} textAnchor="middle" className="sw-centre__copy">
                {total} skills
              </text>
            </g>
          </svg>
        </div>
        
        {hoveredSkill && (() => {
          const item = byDimension.flatMap(d => d.items).find(i => i.slug === hoveredSkill);
          const dim = byDimension.find(d => d.items.some(i => i.slug === hoveredSkill));
          if (!item || !dim) return null;
          const hasScore = typeof item.score === 'number';
          return (
            <p className="pp-skills-wheel__read" data-skills-wheel-read data-dimension={dim.key} aria-live="polite">
              <strong className="sw-read__name">{item.rec.name}</strong>
              <span className="sw-read__score">{hasScore ? `${Math.round(item.score as number)}%` : 'Needs play'}</span>
              <span className="sw-read__note">{dim.label} · {item.rec.blurb}</span>
            </p>
          );
        })()}
      </div>
    </div>
  );
}
