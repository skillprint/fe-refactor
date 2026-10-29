'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HEVY_EXERCISE_LIBRARY,
  calculateOneRepMax,
  type BodyMeasurementLog,
  type GymExercise,
  type PRType,
  type WorkoutRoutine,
  type WorkoutSession,
  type WorkoutSet,
} from '@/lib/gym/exercises';
import {
  DEFAULT_GYM_ROUTINES,
  createSeedMeasurements,
  createSeedWorkouts,
} from '@/lib/gym/presets';

const STORAGE_GYM_ENABLED = 'skillprint_gym_tracker_enabled';
const EVENT_GYM_ENABLED_CHANGED = 'skillprint-gym-tracker-change';

const STORAGE_WORKOUTS = 'skillprint_gym_workouts_v1';
const STORAGE_ROUTINES = 'skillprint_gym_routines_v1';
const STORAGE_CUSTOM_EXERCISES = 'skillprint_gym_custom_exercises_v1';
const STORAGE_MEASUREMENTS = 'skillprint_gym_measurements_v1';
const STORAGE_UNITS = 'skillprint_gym_units_v1';

export function readGymTrackerEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_GYM_ENABLED) === 'true';
  } catch {
    return false;
  }
}

export function useGymTrackerFeatureFlag() {
  // Defaulted to OFF (false) until toggled on in Settings
  const [gymTrackerEnabled, setGymTrackerEnabledState] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setGymTrackerEnabledState(readGymTrackerEnabled());

    const handleSync = () => {
      setGymTrackerEnabledState(readGymTrackerEnabled());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener(EVENT_GYM_ENABLED_CHANGED, handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener(EVENT_GYM_ENABLED_CHANGED, handleSync);
    };
  }, []);

  const setGymTrackerEnabled = useCallback((enabled: boolean) => {
    setGymTrackerEnabledState(enabled);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_GYM_ENABLED, String(enabled));
        window.dispatchEvent(new CustomEvent(EVENT_GYM_ENABLED_CHANGED, { detail: enabled }));
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  return { gymTrackerEnabled, setGymTrackerEnabled };
}

function readJson<T>(key: string, fallback: () => T): T {
  if (typeof window === 'undefined') return fallback();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = fallback();
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback();
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export interface ExercisePersonalRecords {
  heaviestWeight: number;
  best1RM: number;
  bestSetVolume: number;
  bestSetLabel: string;
  totalSessions: number;
}

export function useGymTrackerData() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [customExercises, setCustomExercises] = useState<GymExercise[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurementLog[]>([]);
  const [unitSystem, setUnitSystemState] = useState<'lbs' | 'kg'>('lbs');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Hydrate from localStorage first, then merge with /api/gym
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const localWorkouts = readJson<WorkoutSession[]>(STORAGE_WORKOUTS, createSeedWorkouts);
    const localRoutines = readJson<WorkoutRoutine[]>(STORAGE_ROUTINES, () => DEFAULT_GYM_ROUTINES);
    const localCustom = readJson<GymExercise[]>(STORAGE_CUSTOM_EXERCISES, () => []);
    const localMeasurements = readJson<BodyMeasurementLog[]>(
      STORAGE_MEASUREMENTS,
      createSeedMeasurements
    );
    const savedUnits = localStorage.getItem(STORAGE_UNITS);
    if (savedUnits === 'kg' || savedUnits === 'lbs') {
      setUnitSystemState(savedUnits);
    }

    setWorkouts(localWorkouts);
    setRoutines(localRoutines);
    setCustomExercises(localCustom);
    setMeasurements(localMeasurements);
    setIsLoaded(true);

    // Sync with Next.js API route
    fetch('/api/gym')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data.workouts) && localWorkouts.length === 0) {
          setWorkouts(data.workouts);
          writeJson(STORAGE_WORKOUTS, data.workouts);
        }
        if (Array.isArray(data.routines) && localRoutines.length === 0) {
          setRoutines(data.routines);
          writeJson(STORAGE_ROUTINES, data.routines);
        }
      })
      .catch(() => {
        // Offline / localStorage fallback is already active
      });
  }, []);

  const allExercises = useMemo<GymExercise[]>(() => {
    const customIds = new Set(customExercises.map((e) => e.id));
    return [
      ...customExercises,
      ...HEVY_EXERCISE_LIBRARY.filter((e) => !customIds.has(e.id)),
    ];
  }, [customExercises]);

  const exerciseMap = useMemo<Map<string, GymExercise>>(() => {
    const map = new Map<string, GymExercise>();
    for (const ex of allExercises) {
      map.set(ex.id, ex);
    }
    return map;
  }, [allExercises]);

  const setUnitSystem = useCallback((next: 'lbs' | 'kg') => {
    setUnitSystemState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_UNITS, next);
    }
  }, []);

  /**
   * Look up the previous workout's set performance for a given exercise & set index (Hevy "PREVIOUS" column)
   */
  const getPreviousSetForExercise = useCallback(
    (exerciseId: string, setIndex: number): { weight: number; reps: number; rpe: number | null } | null => {
      for (const workout of workouts) {
        const match = workout.exercises.find((e) => e.exerciseId === exerciseId);
        if (match && match.sets.length > 0) {
          const completedSets = match.sets.filter((s) => s.completed);
          const target = completedSets[setIndex] || completedSets[completedSets.length - 1];
          if (target) {
            return {
              weight: target.weight,
              reps: target.reps,
              rpe: target.rpe,
            };
          }
        }
      }
      return null;
    },
    [workouts]
  );

  /**
   * Compute personal records for a given exercise across all historical workouts
   */
  const getExerciseRecords = useCallback(
    (exerciseId: string): ExercisePersonalRecords => {
      let heaviestWeight = 0;
      let best1RM = 0;
      let bestSetVolume = 0;
      let bestSetLabel = '—';
      let totalSessions = 0;

      for (const workout of workouts) {
        let seenInSession = false;
        for (const entry of workout.exercises) {
          if (entry.exerciseId !== exerciseId) continue;
          seenInSession = true;
          for (const set of entry.sets) {
            if (!set.completed || set.setType === 'warmup') continue;
            const w = Number(set.weight) || 0;
            const r = Number(set.reps) || 0;
            const vol = w * r;
            const est1rm = calculateOneRepMax(w, r);
            if (w > heaviestWeight) heaviestWeight = w;
            if (est1rm > best1RM) best1RM = est1rm;
            if (vol > bestSetVolume) {
              bestSetVolume = vol;
              bestSetLabel = `${w} lbs × ${r}`;
            }
          }
        }
        if (seenInSession) totalSessions += 1;
      }

      return {
        heaviestWeight,
        best1RM,
        bestSetVolume,
        bestSetLabel,
        totalSessions,
      };
    },
    [workouts]
  );

  /**
   * Evaluate whether a newly completed set breaks any historical PRs
   */
  const evaluateSetPRs = useCallback(
    (exerciseId: string, set: WorkoutSet): PRType[] => {
      if (set.setType === 'warmup' || (set.weight <= 0 && set.reps <= 0)) return [];
      const records = getExerciseRecords(exerciseId);
      const prs: PRType[] = [];
      const w = Number(set.weight) || 0;
      const r = Number(set.reps) || 0;
      const est1rm = calculateOneRepMax(w, r);
      const vol = w * r;

      if (w > 0 && w > records.heaviestWeight) prs.push('heaviest_weight');
      if (est1rm > 0 && est1rm > records.best1RM) prs.push('best_1rm');
      if (vol > 0 && vol > records.bestSetVolume) prs.push('best_set_volume');
      return prs;
    },
    [getExerciseRecords]
  );

  const saveWorkout = useCallback(
    async (workout: WorkoutSession) => {
      setWorkouts((prev) => {
        const next = [workout, ...prev.filter((w) => w.id !== workout.id)];
        writeJson(STORAGE_WORKOUTS, next);
        return next;
      });
      if (workout.routineId) {
        setRoutines((prev) => {
          const next = prev.map((r) =>
            r.id === workout.routineId ? { ...r, lastPerformedAt: workout.endedAt } : r
          );
          writeJson(STORAGE_ROUTINES, next);
          return next;
        });
      }
      try {
        await fetch('/api/gym', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save_workout', workout }),
        });
      } catch {
        // Persisted in localStorage
      }
    },
    []
  );

  const deleteWorkout = useCallback(async (workoutId: string) => {
    setWorkouts((prev) => {
      const next = prev.filter((w) => w.id !== workoutId);
      writeJson(STORAGE_WORKOUTS, next);
      return next;
    });
    try {
      await fetch(`/api/gym?kind=workout&id=${encodeURIComponent(workoutId)}`, {
        method: 'DELETE',
      });
    } catch {
      // Persisted in localStorage
    }
  }, []);

  const saveRoutine = useCallback(async (routine: WorkoutRoutine) => {
    setRoutines((prev) => {
      const exists = prev.some((r) => r.id === routine.id);
      const next = exists
        ? prev.map((r) => (r.id === routine.id ? routine : r))
        : [routine, ...prev];
      writeJson(STORAGE_ROUTINES, next);
      return next;
    });
    try {
      await fetch('/api/gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_routine', routine }),
      });
    } catch {
      // Persisted in localStorage
    }
  }, []);

  const deleteRoutine = useCallback(async (routineId: string) => {
    setRoutines((prev) => {
      const next = prev.filter((r) => r.id !== routineId);
      writeJson(STORAGE_ROUTINES, next);
      return next;
    });
    try {
      await fetch(`/api/gym?kind=routine&id=${encodeURIComponent(routineId)}`, {
        method: 'DELETE',
      });
    } catch {
      // Persisted in localStorage
    }
  }, []);

  const addCustomExercise = useCallback(async (exercise: GymExercise) => {
    const tagged: GymExercise = { ...exercise, isCustom: true };
    setCustomExercises((prev) => {
      const next = [tagged, ...prev.filter((e) => e.id !== tagged.id)];
      writeJson(STORAGE_CUSTOM_EXERCISES, next);
      return next;
    });
    try {
      await fetch('/api/gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_custom_exercise', exercise: tagged }),
      });
    } catch {
      // Persisted in localStorage
    }
    return tagged;
  }, []);

  const saveMeasurement = useCallback(async (measurement: BodyMeasurementLog) => {
    setMeasurements((prev) => {
      const next = [...prev.filter((m) => m.id !== measurement.id), measurement].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      writeJson(STORAGE_MEASUREMENTS, next);
      return next;
    });
    try {
      await fetch('/api/gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_measurement', measurement }),
      });
    } catch {
      // Persisted in localStorage
    }
  }, []);

  return {
    isLoaded,
    workouts,
    routines,
    allExercises,
    customExercises,
    exerciseMap,
    measurements,
    unitSystem,
    setUnitSystem,
    getPreviousSetForExercise,
    getExerciseRecords,
    evaluateSetPRs,
    saveWorkout,
    deleteWorkout,
    saveRoutine,
    deleteRoutine,
    addCustomExercise,
    saveMeasurement,
  };
}
