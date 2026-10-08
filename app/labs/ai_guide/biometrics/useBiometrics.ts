'use client';

import { useEffect, useRef, useState } from 'react';
import type { BiometricEngine, ReadingListener, Snapshot } from './engine/BiometricEngine';

/**
 * Runs the webcam biometrics engine while `enabled` is true. The engine (and
 * MediaPipe, ONNX Runtime and the ME-rPPG weights behind it) loads only when
 * the feature is switched on, and the camera is released when it's switched off.
 *
 * `source` overrides the camera with a same-origin video URL, stepped frame by
 * frame (?bio_src= on the page), for repeatable runs.
 */
export function useBiometrics(enabled: boolean, onReading?: ReadingListener, source?: string | null) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [engine, setEngine] = useState<BiometricEngine | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const readingRef = useRef(onReading);
  useEffect(() => {
    readingRef.current = onReading;
  }, [onReading]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let instance: BiometricEngine | null = null;
    setLoadError(null);
    (async () => {
      try {
        const { BiometricEngine } = await import('./engine/BiometricEngine');
        if (cancelled) return;
        instance = new BiometricEngine(setSnapshot, (data, at) => readingRef.current?.(data, at));
        setEngine(instance);
        await instance.init();
        if (cancelled) return;
        if (source) await instance.startFile(source);
        else await instance.startCamera();
      } catch (e) {
        if (!cancelled) setLoadError(String((e as Error).message ?? e));
      }
    })();
    return () => {
      cancelled = true;
      instance?.dispose();
      setEngine(null);
      setSnapshot(null);
    };
  }, [enabled, source]);

  return { snapshot, engine, loadError };
}
