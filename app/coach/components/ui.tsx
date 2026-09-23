'use client';

/**
 * Presentational pieces shared by the coach screens.
 *
 * The states here carry more weight than usual. This surface has four ways to
 * legitimately show nothing — no data yet, aggregates suppressed on a small
 * roster, a consent grant that stops short, and a plain error — and a coach who
 * cannot tell them apart will read all four as "the product is broken". Each
 * gets its own component and its own wording.
 */
import React from 'react';
import type { CoachApiError } from '@/lib/models/coach';

export function Panel({
  title,
  note,
  actions,
  children,
}: {
  title?: string;
  note?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="coach-panel">
      {(title || actions) && (
        <div className="coach-panel__head">
          <div>
            {title && <h2>{title}</h2>}
            {note && <p className="coach-panel__note">{note}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Tile({
  label,
  value,
  hint,
  warn = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  warn?: boolean;
}) {
  return (
    <div className="coach-tile">
      <p className="coach-tile__label">{label}</p>
      <p className={`coach-tile__value${warn ? ' coach-tile__value--warn' : ''}`}>{value}</p>
      {hint && <p className="coach-tile__hint">{hint}</p>}
    </div>
  );
}

export function Loading({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="coach-skeleton" style={{ marginBottom: 10, width: `${100 - i * 12}%` }} />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="coach-state">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

/**
 * Aggregates withheld on a small roster.
 *
 * Not an error and not an empty state: the data exists, and we are declining to
 * show it because an average over three people is three people's data. Saying
 * so plainly is the difference between a coach trusting the product and filing
 * a bug.
 */
export function Suppressed({ reason }: { reason: string }) {
  return (
    <div className="coach-state">
      <h3>Aggregates withheld on a small roster</h3>
      <p>{reason}</p>
    </div>
  );
}

/**
 * A 403 — the coach may open this player, but not at this level.
 *
 * Distinct from a 404, which means the player is not theirs at all and is
 * deliberately indistinguishable from a player who does not exist.
 */
export function ConsentGap({ what }: { what: string }) {
  return (
    <div className="coach-state coach-state--consent">
      <h3>Not covered by this player&rsquo;s consent</h3>
      <p>
        You can see this player&rsquo;s engagement, but their visibility grant does not cover {what}.
        Someone with the right permission has to raise it before it appears here.
      </p>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const status = (error as CoachApiError).status;
  return (
    <div className="coach-state coach-state--error">
      <h3>{status === 404 ? 'Not found' : 'Could not load this'}</h3>
      <p>
        {status === 404
          ? 'This is either not yours or does not exist — the API does not distinguish the two.'
          : error.message}
      </p>
      {onRetry && (
        <p style={{ marginTop: 10 }}>
          <button type="button" onClick={onRetry} className="coach-pill coach-pill--quiet" style={{ cursor: 'pointer' }}>
            Try again
          </button>
        </p>
      )}
    </div>
  );
}

/** Engagement recency, using the same thresholds as `coach/engagement.py`. */
export function ActivityPill({ lastPlayed }: { lastPlayed: string | null }) {
  if (!lastPlayed) return <span className="coach-pill coach-pill--never">Never played</span>;

  const days = Math.floor((Date.now() - new Date(lastPlayed).getTime()) / 86_400_000);
  if (days <= 7) return <span className="coach-pill coach-pill--active">Active · {days === 0 ? 'today' : `${days}d`}</span>;
  if (days >= 14) return <span className="coach-pill coach-pill--lapsed">Lapsed · {days}d</span>;
  // The gap between the two thresholds is intentional upstream, so it gets its
  // own label rather than being rounded into "active" or "lapsed".
  return <span className="coach-pill coach-pill--quiet">Quiet · {days}d</span>;
}

/** Dimension slugs are kebab-case on the wire; nothing sends a display name. */
export function dimensionLabel(slug: string): string {
  return slug.replace(/-/g, ' ');
}

/**
 * A minimal sparkline. No chart library: these are 20–90 points of one series
 * with no axes or interaction, and an SVG path is less code than configuring
 * one.
 */
export function Sparkline({ points }: { points: Array<{ value: number }> }) {
  if (points.length < 2) return <div className="coach-spark" aria-hidden="true" />;

  const width = 100;
  const height = 30;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((point.value - min) / span) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <svg className="coach-spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-hidden="true">
      <path className="coach-spark__fill" d={`M0,${height} L${coords.join(' L')} L${width},${height} Z`} />
      <path d={`M${coords.join(' L')}`} />
    </svg>
  );
}

/**
 * `YYYY-MM-DD` for an ISO timestamp, in the viewer's own time zone.
 *
 * Not `iso.slice(0, 10)`: the API serialises in UTC, so an assignment due at
 * the end of Friday in California is already Saturday in the string, and
 * slicing it shows the wrong day. Only called after data loads on the client,
 * so the server and browser never render it differently.
 */
export function localDay(iso: string): string {
  const moment = new Date(iso);
  if (Number.isNaN(moment.getTime())) return iso.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}`;
}
