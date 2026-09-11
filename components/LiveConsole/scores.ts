/**
 * Score helpers shared by the Live Session Console panels.
 *
 * The scoring API returns skill scores, trends and confidences as fractions
 * (0 to 1) on most builds and as percentages on a few older ones. Every
 * readout goes through toPercent so both read the same on screen.
 */

export const toPercent = (value: number | string | undefined | null): number => {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (!Number.isFinite(n)) return 0;
  const scaled = n <= 1 && n >= -1 ? n * 100 : n;
  return Math.max(0, Math.min(100, scaled));
};

/** A signed delta in the same units as the score it belongs to. */
export const toPercentDelta = (value: number | string | undefined | null, scoreRaw: number | string | undefined | null): number => {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (!Number.isFinite(n)) return 0;
  const s = typeof scoreRaw === 'string' ? parseFloat(scoreRaw) : Number(scoreRaw);
  const fraction = Number.isFinite(s) ? Math.abs(s) <= 1 : Math.abs(n) <= 1;
  return fraction ? n * 100 : n;
};

export type FlowBand = { key: string; label: string; tone: string; below: number };

export const FLOW_BANDS: FlowBand[] = [
  { below: 20, key: 'very-low', label: 'Very low', tone: 'error' },
  { below: 40, key: 'low', label: 'Low', tone: 'warning' },
  { below: 60, key: 'medium', label: 'Medium', tone: 'mood' },
  { below: 80, key: 'high', label: 'High', tone: 'success' },
  { below: Infinity, key: 'very-high', label: 'Very high', tone: 'cognition' },
];

export const flowBand = (percent: number): FlowBand =>
  FLOW_BANDS.find(entry => percent < entry.below) || FLOW_BANDS[FLOW_BANDS.length - 1];

export type TrendKey = 'up' | 'down' | 'flat';

export const trendKey = (delta: number): TrendKey => (delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'flat');

export const TREND_GLYPH: Record<TrendKey, string> = { up: 'arrow-up', down: 'arrow-down', flat: 'equal' };

export const TREND_WORD: Record<TrendKey, string> = { up: 'Rising', down: 'Falling', flat: 'Steady' };

export const formatSkillName = (key: string, names: Record<string, string> = {}): string => {
  if (names[key]) return names[key];
  const words = key.replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const formatClock = (date: Date | number | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const formatDuration = (ms: number): string => {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};
