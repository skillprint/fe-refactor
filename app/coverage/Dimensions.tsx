'use client';

import { PortalSection } from '@/components/LayoutGrid';
import type { CoverageReport } from '../../lib/models/gameCoverage/gameCoverageApi';
import { PILLAR_LABELS, PILLARS, skillIconId } from '../../lib/skillIcons';
import { dimensionMap, formatNumber, TARGET } from './coverageUtils';

/** The 28 dimensions by pillar: how much of each the pool covers, and what scarcity makes it worth. */
export function DimensionCoverage({ report }: { report: CoverageReport }) {
  const most = Math.max(1, ...report.dimensions.map((d) => d.coverage));
  return (
    <PortalSection ariaLabelledBy="cv-dimensions-heading">
      <div className="sp-card gr-panel">
        <div className="cv-panel-head">
          <h2 id="cv-dimensions-heading">Dimension coverage</h2>
          <p className="font-xs gr-muted margin-none">
            Bar: the pool&apos;s summed strength. Primary: games rating it {TARGET}. Weight: scarcity × pillar weight,
            which is what a point of strength there is worth in a game&apos;s coverage score.
          </p>
        </div>
        <div className="cv-pillars">
          {PILLARS.map((pillar) => (
            <div key={pillar} className="cv-pillar" data-pillar={pillar}>
              <h3 className="font-sm">{PILLAR_LABELS[pillar]}</h3>
              <ul className="cv-dims">
                {report.dimensions.filter((d) => d.pillar === pillar).map((d) => (
                  <li key={d.slug} className="cv-dim" data-gap={d.primaryCount === 0 || undefined} data-dimension={d.slug}>
                    <span className="cv-dim__name" title={d.description || undefined}>
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href={`#${skillIconId(pillar, d.slug)}`}></use></svg>
                      {d.name}
                    </span>
                    <span className="cv-bar" aria-hidden="true"><span style={{ width: `${(d.coverage / most) * 100}%` }} /></span>
                    <span className="cv-dim__stat" title={`${formatNumber(d.coverage)} summed strength${d.taggedCount != null ? `; ${d.taggedCount} games carry the tag` : ''}`}>
                      {d.primaryCount === 0 ? <span className="cv-gap">no primary</span> : `${d.primaryCount} primary`}
                    </span>
                    <span className="cv-dim__stat" title={`Scarcity ${formatNumber(d.scarcity, 2)}`}>
                      ×{d.effectiveWeight.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PortalSection>
  );
}

/** The greedy pick order: the smallest set of games in the pool that brings every dimension to TARGET. */
export function Shortlist({ report, onOpen }: { report: CoverageReport; onOpen: (slug: string) => void }) {
  const dims = dimensionMap(report);
  const games = Object.fromEntries(report.games.map((g) => [g.slug, g]));
  const unreachable = report.dimensions.filter((d) => d.coverage < TARGET);
  return (
    <PortalSection ariaLabelledBy="cv-shortlist-heading">
      <div className="sp-card gr-panel">
        <div className="cv-panel-head">
          <h2 id="cv-shortlist-heading">Shortlist</h2>
          <p className="font-xs gr-muted margin-none">
            Each pick adds the most strength towards {TARGET} in every dimension (strengths add up), ignoring readiness.
            Use it to choose a minimal set; use the ranking for the full order.
          </p>
        </div>
        {report.greedy.length === 0 ? (
          <p className="font-sm gr-muted margin-none">No game in this pool has any strengths yet.</p>
        ) : (
          <ol className="cv-picks">
            {report.greedy.map((pick) => (
              <li key={pick.slug}>
                <span className="cv-pick__n">{pick.pick}</span>
                <button type="button" className="button button--link cv-pick__game" onClick={() => onOpen(pick.slug)}>
                  {games[pick.slug]?.name ?? pick.slug}
                </button>
                <span className="cv-pick__adds">
                  {pick.adds.length === 0 ? (
                    <span className="font-xs gr-muted">tops up dimensions with minor strengths</span>
                  ) : (
                    pick.adds.map((slug) => (
                      <span key={slug} className="ui-tag cv-tag" data-pillar={dims[slug]?.pillar}>{dims[slug]?.name ?? slug}</span>
                    ))
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
        {unreachable.length > 0 && (
          <p className="font-xs margin-none" data-coverage-unreachable>
            <strong>Can&apos;t reach {TARGET} with this pool:</strong>{' '}
            {unreachable.map((d) => d.name).join(', ')}. These need new or re-assessed games.
          </p>
        )}
      </div>
    </PortalSection>
  );
}
