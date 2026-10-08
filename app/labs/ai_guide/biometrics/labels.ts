// UI-side names and colours for the biometrics engine. Kept apart from the
// engine so the page doesn't pull MediaPipe or ONNX Runtime into its bundle.

import type { MethodName, RoiName } from './engine/BiometricEngine';

export const METHOD_ORDER: MethodName[] = ['me-rppg', 'pos', 'chrom', 'green'];

export const METHOD_LABELS: Record<MethodName, string> = {
  'me-rppg': 'ME-rPPG',
  pos: 'POS',
  chrom: 'CHROM',
  green: 'GREEN',
};

export const METHOD_NOTES: Record<MethodName, string> = {
  'me-rppg': 'Neural state-space model (2025), in a worker',
  pos: 'Plane-orthogonal-to-skin projection (2017)',
  chrom: 'Chrominance difference (2013)',
  green: 'Green channel only; the baseline',
};

export const METHOD_COLOURS: Record<MethodName | 'strap', string> = {
  'me-rppg': 'var(--violet)',
  pos: 'var(--orange)',
  chrom: 'var(--skills-pink-500)',
  green: 'var(--mint)',
  strap: 'var(--ui-text)',
};

export const ROI_LABELS: Record<RoiName, string> = {
  forehead: 'Forehead',
  leftCheek: 'Left cheek',
  rightCheek: 'Right cheek',
};

export const fmt = (v: number | null | undefined, digits = 0) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(digits);
