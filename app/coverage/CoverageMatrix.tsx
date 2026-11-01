'use client';

import type { CoverageReport } from '../../lib/models/gameCoverage/gameCoverageApi';
import { PILLAR_LABELS, PILLARS } from '../../lib/skillIcons';
import { formatNumber } from './coverageUtils';

/** The game × dimension strength grid (the sheet's Game Matrix tab), in ranking order. */
export default function CoverageMatrix({ report, onOpen }: { report: CoverageReport; onOpen: (slug: string) => void }) {
  const columns = PILLARS.flatMap((pillar) => report.dimensions.filter((d) => d.pillar === pillar));
  return (
    <div className="gr-table-wrap cv-table-wrap cv-matrix-wrap">
      <table className="cv-matrix" data-coverage-matrix>
        <thead>
          <tr>
            <th scope="col" rowSpan={2} className="cv-matrix__game">Game</th>
            {PILLARS.map((pillar) => (
              <th key={pillar} scope="colgroup" colSpan={columns.filter((d) => d.pillar === pillar).length} data-pillar={pillar} className="cv-matrix__pillar">
                {PILLAR_LABELS[pillar]}
              </th>
            ))}
          </tr>
          <tr>
            {columns.map((d) => (
              <th key={d.slug} scope="col" className="cv-matrix__dim" title={`${d.name}: weight ×${d.effectiveWeight.toFixed(2)}`}>
                <span>{d.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.games.map((game) => (
            <tr key={game.slug}>
              <th scope="row" className="cv-matrix__game">
                <button type="button" className="button button--link" onClick={() => onOpen(game.slug)}>
                  <span className="gr-muted">{game.rank}.</span> {game.name}
                </button>
                {game.source !== 'assessed' && <span className="font-xs gr-muted"> (tags)</span>}
              </th>
              {columns.map((d) => {
                const value = game.strengths[d.slug] ?? 0;
                return (
                  <td
                    key={d.slug}
                    data-pillar={d.pillar}
                    style={{ ['--cv-strength' as string]: `${Math.round((value / 3) * 100)}%` }}
                    title={`${game.name}: ${d.name} ${formatNumber(value, 2)}`}
                  >
                    {value > 0 ? formatNumber(value, d.pillar === 'personality' ? 1 : 0) : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
