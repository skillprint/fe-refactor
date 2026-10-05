import React from 'react';

interface TraitProgressProps {
  traitName: string;
  score: number;
  iconId: string;
}

export default function TraitProgress({ traitName, score, iconId }: TraitProgressProps) {
  // Ensure score is between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <li className="embed-trait layout-grid gap-sm" data-score={normalizedScore}>
      <div className="layout-flex items-center justify-between gap-md">
        <span className="embed-trait__name layout-inline-flex items-center gap-sm font-xs weight-semibold">
          <svg className="sp-icon sp-icon--xs sp-icon--cognition" aria-hidden="true" viewBox="0 0 24 24">
            <use href={`#${iconId}`}></use>
          </svg>
          {traitName}
        </span>
        <span className="embed-trait__value font-mono font-xs weight-semibold">{normalizedScore}</span>
      </div>
      <div
        aria-label={`${traitName}: ${normalizedScore} of 100`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedScore}
        className="sp-progress"
        role="progressbar"
      >
        <span className="sp-progress__track">
          <span className="sp-progress__fill" style={{ width: `${normalizedScore}%` }}></span>
        </span>
      </div>
    </li>
  );
}
