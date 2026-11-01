'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import { PortalSection } from '@/components/LayoutGrid';
import { useUserSession } from '../hooks/useUserSession';
import {
  CoverageReport, gameCoverageApi, GameCoverageApiError, Weights, WEIGHT_NAMES,
} from '../../lib/models/gameCoverage/gameCoverageApi';
import { ReviewerGate } from '../review/components';
import AssessmentDialog from './AssessmentDialog';
import { DimensionCoverage, Shortlist } from './Dimensions';
import RankingTable from './RankingTable';
import CoverageMatrix from './CoverageMatrix';
import WeightsPanel from './WeightsPanel';
import { POOLS, readOverrides, readPool, TARGET } from './coverageUtils';
import '../review/review.css';
import './coverage.css';

type View = 'ranking' | 'matrix';

function errorMessage(err: unknown): string {
  if (err instanceof GameCoverageApiError && err.status === 404) {
    return "This backend doesn't have game coverage yet (marketplace game_coverage app).";
  }
  return err instanceof Error ? err.message : String(err);
}

/**
 * /coverage: the coverage ranking sheet, live. Every game in a pool ranked by
 * how well it covers what Skillprint measures (rare dimensions count for more)
 * plus how ready it is, the per-dimension gaps, the smallest set of games that
 * covers everything, and an editor for each game's assessed strengths.
 * Pool, weights and view live in the URL, so a link reproduces the view.
 */
export default function CoverageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userToken } = useUserSession();

  const pool = readPool(searchParams.get('pool'));
  const view: View = searchParams.get('view') === 'matrix' ? 'matrix' : 'ranking';
  // Only the weight params, so other query changes don't refetch.
  const overridesKey = WEIGHT_NAMES.map((n) => `${n}=${encodeURIComponent(searchParams.get(n) ?? '')}`).join('&');
  const overrides = useMemo(() => readOverrides(new URLSearchParams(overridesKey)), [overridesKey]);

  const [report, setReport] = useState<CoverageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloads, setReloads] = useState(0);
  const [weightsOpen, setWeightsOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!userToken) return;
    let live = true;
    setLoading(true);
    gameCoverageApi.report(userToken, pool, overrides).then(
      (data) => {
        if (!live) return;
        setReport(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        if (!live) return;
        if (err instanceof GameCoverageApiError && err.isForbidden) setDenied(true);
        else setError(errorMessage(err));
        setLoading(false);
      },
    );
    return () => {
      live = false;
    };
  }, [userToken, pool, overrides, reloads]);

  const replaceParams = (change: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    change(params);
    const query = params.toString();
    router.replace(query ? `/coverage/?${query}` : '/coverage/', { scroll: false });
  };

  const applyWeights = (next: Partial<Weights>) =>
    replaceParams((params) => {
      for (const name of WEIGHT_NAMES) {
        if (next[name] === undefined) params.delete(name);
        else params.set(name, String(next[name]));
      }
    });

  const closeEditor = useCallback(() => setEditing(null), []);
  const editingGame = report?.games.find((g) => g.slug === editing) ?? null;

  const customWeights = Object.keys(overrides).length;
  const gaps = report ? report.dimensions.filter((d) => d.primaryCount === 0) : [];

  return (
    <PortalLayout
      pageClass="page--portal-coverage"
      header={
        <PortalHead
          eyebrow="Skillprint staff"
          title="Game coverage"
          description="Which games cover the breadth of what Skillprint measures (14 cognition skills, 9 moods, 5 personality traits) and how ready each is to ship. Dimensions few games cover count for more."
        />
      }
    >
      {denied ? (
        <ReviewerGate purpose="Game coverage is" />
      ) : (
        <div className="gr-stack">
          <PortalSection ariaLabelledBy="cv-pool">
            <div className="gr-tabs">
              <div className="button-group" role="tablist" aria-label="Which games to rank" id="cv-pool">
                {POOLS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={pool === key}
                    aria-pressed={pool === key}
                    title={report?.pools.find((p) => p.key === key)?.label}
                    className={`button-group__item ${pool === key ? 'is-current' : ''}`}
                    onClick={() => replaceParams((params) => (key === 'playable' ? params.delete('pool') : params.set('pool', key)))}
                  >
                    {label}
                    {pool === key && report && <span className="gr-count">{report.games.length}</span>}
                  </button>
                ))}
              </div>
              <div className="cv-toolbar-end">
                {loading && report && <span className="font-xs gr-muted" role="status">Updating…</span>}
                <button
                  type="button"
                  className={`button button--sm ${weightsOpen ? "button--primary" : "button--secondary"}`}
                  aria-expanded={weightsOpen}
                  aria-controls="cv-weights"
                  onClick={() => setWeightsOpen((open) => !open)}
                >
                  <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-adjust"></use></svg>
                  Weights{customWeights > 0 && <span className="gr-count">{customWeights} changed</span>}
                </button>
              </div>
            </div>
          </PortalSection>

          {weightsOpen && report && (
            <WeightsPanel
              weights={report.weights}
              defaults={report.defaultWeights}
              onApply={applyWeights}
              onClose={() => setWeightsOpen(false)}
            />
          )}

          {loading && !report && <p className="font-sm gr-muted">Loading the coverage report…</p>}
          {error && <div className="gr-alert" role="alert">{error}</div>}

          {report && (
            <>
              <p className="font-sm gr-muted margin-none" data-coverage-summary>
                {report.games.length} games ·{' '}
                {report.games.filter((g) => g.source === 'assessed').length} assessed by staff ·{' '}
                {report.games.filter((g) => g.source === 'tags').length} ranked on backend tags only ·{' '}
                {gaps.length === 0
                  ? 'every dimension has a primary game'
                  : `${gaps.length} dimension${gaps.length === 1 ? '' : 's'} with no game rating it ${TARGET}`}
              </p>
              <DimensionCoverage report={report} />
              <Shortlist report={report} onOpen={setEditing} />

              <PortalSection ariaLabelledBy="cv-games-heading" className="cv-games">
                <div className="gr-tabs">
                  <h2 id="cv-games-heading" className="margin-none">Games</h2>
                  <div className="button-group" role="tablist" aria-label="Games view">
                    {(['ranking', 'matrix'] as View[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        role="tab"
                        aria-selected={view === v}
                        aria-pressed={view === v}
                        className={`button-group__item ${view === v ? 'is-current' : ''}`}
                        onClick={() => replaceParams((params) => (v === 'ranking' ? params.delete('view') : params.set('view', v)))}
                      >
                        {v === 'ranking' ? 'Ranking' : 'Matrix'}
                      </button>
                    ))}
                  </div>
                </div>
                {view === 'ranking' ? (
                  <RankingTable report={report} onEdit={setEditing} />
                ) : (
                  <CoverageMatrix report={report} onOpen={setEditing} />
                )}
              </PortalSection>
            </>
          )}

          {report && editingGame && userToken && (
            <AssessmentDialog
              key={`${editingGame.slug}-${editingGame.assessment?.updatedAt ?? 'tags'}`}
              report={report}
              game={editingGame}
              token={userToken}
              onCancel={closeEditor}
              onSaved={() => {
                setEditing(null);
                setReloads((n) => n + 1);
              }}
            />
          )}
        </div>
      )}
    </PortalLayout>
  );
}
