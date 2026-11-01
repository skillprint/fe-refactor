'use client';

import { useState } from 'react';
import type { Weights, WeightName } from '../../lib/models/gameCoverage/gameCoverageApi';
import { WEIGHT_GROUPS, WEIGHT_NAMES } from '../../lib/models/gameCoverage/gameCoverageApi';

/**
 * Every tunable number, to try out: applying puts the ones that differ from
 * the defaults in the URL, and the backend re-ranks with them. Nothing is saved.
 */
export default function WeightsPanel({
  weights, defaults, onApply, onClose,
}: {
  weights: Weights;
  defaults: Weights;
  onApply: (overrides: Partial<Weights>) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Record<WeightName, string>>(
    () => Object.fromEntries(WEIGHT_NAMES.map((n) => [n, String(weights[n])])) as Record<WeightName, string>,
  );

  const apply = () => {
    const overrides: Partial<Weights> = {};
    for (const name of WEIGHT_NAMES) {
      const value = Number(draft[name]);
      if (draft[name].trim() !== '' && Number.isFinite(value) && value !== defaults[name]) overrides[name] = value;
    }
    onApply(overrides);
  };

  return (
    <section id="cv-weights" className="sp-card gr-panel" aria-labelledby="cv-weights-heading">
      <div className="cv-panel-head">
        <h2 id="cv-weights-heading">Weights</h2>
        <p className="font-xs gr-muted margin-none">
          Try other weights; the ranking, scarcity and shortlist recompute. Changed values ride in the page&apos;s link.
        </p>
      </div>
      <form
        className="cv-weights"
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        {WEIGHT_GROUPS.map((group) => (
          <fieldset key={group.title} className="gr-fieldset">
            <legend>{group.title}</legend>
            {group.fields.map((field) => {
              const changed = Number(draft[field.name]) !== defaults[field.name];
              return (
                <label key={field.name} className="cv-weight" data-changed={changed || undefined}>
                  <span className="font-sm">{field.label}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={field.name === 'scarcityCap' ? 1 : 0}
                    max={field.max}
                    step={field.step}
                    value={draft[field.name]}
                    onChange={(e) => setDraft((d) => ({ ...d, [field.name]: e.target.value }))}
                  />
                  <span className="font-xs gr-muted">
                    {field.hint}
                    {changed && ` (default ${defaults[field.name]})`}
                  </span>
                </label>
              );
            })}
          </fieldset>
        ))}
        <div className="cv-editor__actions">
          <button type="submit" className="button button--primary button--sm">Apply</button>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={() => {
              setDraft(Object.fromEntries(WEIGHT_NAMES.map((n) => [n, String(defaults[n])])) as Record<WeightName, string>);
              onApply({});
            }}
          >
            Reset to defaults
          </button>
          <button type="button" className="button button--tertiary button--sm" onClick={onClose}>Close</button>
        </div>
      </form>
    </section>
  );
}
