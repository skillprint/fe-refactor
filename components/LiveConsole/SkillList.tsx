import React, { CSSProperties } from 'react';
import type { SkillMetric } from '@/app/lib/skillprintSdk';
import { ConsoleIcon } from './ConsoleIcon';
import { formatSkillName, toPercent, toPercentDelta, trendKey, TREND_GLYPH, TREND_WORD } from './scores';

interface SkillListProps {
  metrics?: Record<string, SkillMetric>;
  names?: Record<string, string>;
  flash?: boolean;
  emptyText?: string;
}

/** Every skill as a row, highest first: name, score bar, trend word. */
export function SkillList({ metrics, names = {}, flash = false, emptyText = 'Skill scores appear here after the first analysed batch.' }: SkillListProps) {
  const keys = Object.keys(metrics || {});
  if (!keys.length) {
    return (
      <div className="aa-skill-list" role="list" aria-label="Skill scores, highest first">
        <p className="aa-placeholder">{emptyText}</p>
      </div>
    );
  }
  const rows = keys
    .map(key => {
      const data = metrics![key];
      const value = Math.round(toPercent(data?.score));
      const delta = toPercentDelta(data?.trend, data?.score);
      return { key, value, trend: trendKey(delta) };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <div className="aa-skill-list" role="list" aria-label="Skill scores, highest first">
      {rows.map(row => (
        <div
          key={row.key}
          className={flash ? 'aa-skill-row is-updated' : 'aa-skill-row'}
          role="listitem"
          aria-label={`${formatSkillName(row.key, names)} ${row.value} out of 100, ${TREND_WORD[row.trend].toLowerCase()}`}
        >
          <span className="aa-skill-row__name">{formatSkillName(row.key, names)}</span>
          <span className="aa-skill-row__score">
            <span className="sp-progress" aria-hidden="true" style={{ '--progress': `${row.value}%` } as CSSProperties}>
              <span className="sp-progress__track"><span className="sp-progress__fill" /></span>
            </span>
            <span className="aa-skill-row__value">{row.value}%</span>
          </span>
          <span className="aa-trend" data-trend={row.trend}>
            <ConsoleIcon name={TREND_GLYPH[row.trend]} />
            <span>{TREND_WORD[row.trend]}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
