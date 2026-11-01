'use client';

import { useMemo, useState } from 'react';
import type { CoverageGame, CoverageReport, StrengthSource } from '../../lib/models/gameCoverage/gameCoverageApi';
import { dimensionMap, formatNumber, gameStatus, readinessSummary } from './coverageUtils';

const SOURCE_LABELS: Record<StrengthSource, string> = {
  assessed: 'Assessed',
  tags: 'From tags',
  none: 'No data',
};

const SOURCE_FILTERS: { key: 'all' | StrengthSource; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'assessed', label: 'Assessed' },
  { key: 'tags', label: 'Tags only' },
  { key: 'none', label: 'No data' },
];

const PRIMARY_SHOWN = 4;

/** Every game in the pool by total score, each row opening its assessment. */
export default function RankingTable({ report, onEdit }: { report: CoverageReport; onEdit: (slug: string) => void }) {
  const dims = dimensionMap(report);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'all' | StrengthSource>('all');

  const games = useMemo(() => {
    const q = query.trim().toLowerCase();
    return report.games.filter(
      (g) => (source === 'all' || g.source === source) && (!q || g.name.toLowerCase().includes(q) || g.slug.includes(q)),
    );
  }, [report.games, query, source]);

  return (
    <div className="gr-stack">
      <div className="cv-filters">
        <label className="cv-search">
          <span className="sr-only">Search games</span>
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-search"></use></svg>
          <input type="search" placeholder="Search games" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="button-group" role="group" aria-label="Where strengths come from">
          {SOURCE_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={source === key}
              className={`button-group__item ${source === key ? 'is-current' : ''}`}
              onClick={() => setSource(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="gr-table-wrap cv-table-wrap">
        <table className="gr-table cv-table" data-coverage-ranking>
          <thead>
            <tr>
              <th scope="col" className="cv-num">#</th>
              <th scope="col">Game</th>
              <th scope="col">Strengths</th>
              <th scope="col">Primary demands</th>
              <th scope="col" className="cv-num" title="Sum over dimensions of strength / 3 × weight">Coverage</th>
              <th scope="col" className="cv-num">Readiness</th>
              <th scope="col" className="cv-num">Total</th>
              <th scope="col" className="cv-num" title="Shortlist pick">Pick</th>
              <th scope="col"><span className="sr-only">Assess</span></th>
            </tr>
          </thead>
          <tbody>
            {games.length === 0 && (
              <tr><td colSpan={9} className="gr-muted">No games match.</td></tr>
            )}
            {games.map((game) => (
              <tr key={game.slug} data-coverage-game={game.slug}>
                <td className="cv-num">{game.rank}</td>
                <td><GameCell game={game} /></td>
                <td>
                  <span className="ui-badge ui-badge--sm cv-source" data-source={game.source}>{SOURCE_LABELS[game.source]}</span>
                </td>
                <td>
                  <span className="cv-primary">
                    {game.primaryDimensions.slice(0, PRIMARY_SHOWN).map((slug) => (
                      <span key={slug} className="ui-tag cv-tag" data-pillar={dims[slug]?.pillar}>{dims[slug]?.name ?? slug}</span>
                    ))}
                    {game.primaryDimensions.length > PRIMARY_SHOWN && (
                      <span className="font-xs gr-muted">+{game.primaryDimensions.length - PRIMARY_SHOWN}</span>
                    )}
                  </span>
                </td>
                <td className="cv-num">{formatNumber(game.coverage, 2)}</td>
                <td className="cv-num" title={readinessSummary(game)}>{formatNumber(game.readiness.total)}</td>
                <td className="cv-num"><strong>{formatNumber(game.total, 2)}</strong></td>
                <td className="cv-num">{game.greedyPick ?? '–'}</td>
                <td>
                  <button
                    type="button"
                    className="button button--secondary button--sm no-grow"
                    aria-haspopup="dialog"
                    onClick={() => onEdit(game.slug)}
                  >
                    {game.source === 'assessed' ? 'Edit' : 'Assess'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GameCell({ game }: { game: CoverageGame }) {
  const status = gameStatus(game);
  return (
    <div className="cv-game">
      <span className="cv-game__thumb">
        {game.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.thumbnail} alt="" loading="lazy" />
        ) : (
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg>
        )}
      </span>
      <span className="cv-game__text">
        <span className="cv-game__name">{game.name}</span>
        <span className="font-xs gr-muted cv-game__meta">
          <span className="ui-badge ui-badge--sm cv-status" data-tone={status.tone}>{status.label}</span>
          {game.slug}
        </span>
      </span>
    </div>
  );
}
