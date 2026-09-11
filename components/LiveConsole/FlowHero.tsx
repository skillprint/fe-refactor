import React, { CSSProperties } from 'react';
import { flowBand, toPercent } from './scores';

interface FlowHeroProps {
  flowScore?: number | string;
  confidence?: number | string;
  targetLabel: string;
  hasReading: boolean;
}

/** The flow ring as the hero of the live scores panel. */
export function FlowHero({ flowScore, confidence, targetLabel, hasReading }: FlowHeroProps) {
  const percent = hasReading ? Math.round(toPercent(flowScore)) : 0;
  const band = flowBand(percent);
  const sure = hasReading ? Math.round(toPercent(confidence)) : 0;
  const ringStyle = { '--progress-count': percent } as CSSProperties;

  return (
    <div className="aa-flow-hero" data-flow-band={band.key}>
      <span
        className="sp-progress-ring aa-flow__ring"
        role="img"
        aria-label={`Flow score ${percent} out of 100, ${band.label.toLowerCase()}`}
        style={ringStyle}
      >
        <svg className="sp-progress-ring__svg" aria-hidden="true" viewBox="0 0 40 40">
          <circle className="sp-progress-ring__track" cx="20" cy="20" r="15.9155" />
          <circle className="sp-progress-ring__value" cx="20" cy="20" r="15.9155" />
        </svg>
        <span className="sp-progress-ring__copy">
          <strong className="aa-flow__value">{percent}</strong>
          <span className="aa-flow__total">/100</span>
        </span>
      </span>
      <div className="aa-flow-hero__copy">
        <span className="aa-flow-hero__label">
          <span className="aa-flow-hero__name">Flow score</span>
          <span className="ui-badge ui-badge--pill" data-badge-tone={band.tone}>{band.label}</span>
        </span>
        <span className="aa-flow-hero__mood">
          How well the play matches the target, <strong>{targetLabel}</strong>.
        </span>
        <span className="aa-flow-hero__meta">
          {hasReading ? `The API is ${sure}% sure of this reading.` : 'No reading yet.'}
        </span>
      </div>
    </div>
  );
}
