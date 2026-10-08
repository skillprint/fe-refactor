'use client';

import React, { useEffect, useRef } from 'react';
import type { BiometricEngine } from './engine/BiometricEngine';

/** The camera frame with the skin regions (green) and the ME-rPPG crop (blue) drawn on it, mirrored like a selfie view. */
export function BiometricsView({ engine, className, label }: { engine: BiometricEngine | null; className?: string; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!engine || !ref.current) return;
    return engine.attachView(ref.current);
  }, [engine]);
  return <canvas ref={ref} className={className ? `bio-view ${className}` : 'bio-view'} role="img" aria-label={label} />;
}
