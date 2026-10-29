'use client';

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import GymAvatar3D from './GymAvatar3D';
import MockDataTag from './MockDataTag';
import {
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_META,
  RPE_SCALE_INFO,
  calculateMuscleRecoveryMap,
  calculateOneRepMax,
  calculatePlateBreakdown,
  calculateSessionExertionMetrics,
  type EquipmentType,
  type ExerciseTrackingType,
  type GymExercise,
  type MovementPattern,
  type MuscleGroupId,
  type SetType,
  type WorkoutExerciseEntry,
  type WorkoutRoutine,
  type WorkoutSession,
  type WorkoutSet,
} from '@/lib/gym/exercises';
import { useGymTrackerData } from '@/app/hooks/useGymTracker';

type GymTab = 'workout' | 'routines' | 'exercises' | 'exertion' | 'history';

const SUPERSET_COLORS: Record<string, string> = {
  A: '#38bdf8',
  B: '#a855f7',
  C: '#f59e0b',
  D: '#10b981',
};

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function GymTrackerDashboard() {
  const {
    isLoaded,
    workouts,
    routines,
    allExercises,
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
  } = useGymTrackerData();

  const [activeTab, setActiveTab] = useState<GymTab>('workout');

  // 3D Avatar inspected exercise / state
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('bench-press-barbell');
  const [avatarWeightLbs, setAvatarWeightLbs] = useState<number>(185);
  const [avatarRpe, setAvatarRpe] = useState<number>(8);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroupId | null>(null);

  // Active Workout State
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [workoutTitle, setWorkoutTitle] = useState<string>('Afternoon Strength Session');
  const [workoutRoutineId, setWorkoutRoutineId] = useState<string | null>(null);
  const [workoutStartedAt, setWorkoutStartedAt] = useState<number>(Date.now());
  const [workoutElapsedSec, setWorkoutElapsedSec] = useState<number>(0);
  const [workoutNotes, setWorkoutNotes] = useState<string>('');
  const [sessionRpe, setSessionRpe] = useState<number>(8);
  const [perceivedFatigue, setPerceivedFatigue] = useState<number>(7);
  const [preWorkoutReadiness, setPreWorkoutReadiness] = useState<number>(8);
  const [activeExercises, setActiveExercises] = useState<WorkoutExerciseEntry[]>([]);

  // Rest Timer State
  const [restTimerRemaining, setRestTimerRemaining] = useState<number>(0);
  const [restTimerTotal, setRestTimerTotal] = useState<number>(90);

  // Modals & Drawers
  const [showExercisePicker, setShowExercisePicker] = useState<boolean>(false);
  const [pickerTarget, setPickerTarget] = useState<'workout' | 'routine'>('workout');
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);
  const [plateCalcWeight, setPlateCalcWeight] = useState<number | null>(null);
  const [showCustomExerciseModal, setShowCustomExerciseModal] = useState<boolean>(false);
  const [showRoutineModal, setShowRoutineModal] = useState<boolean>(false);

  // Exercise Library Filters
  const [exerciseSearch, setExerciseSearch] = useState<string>('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroupId | 'all'>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentType | 'all'>('all');
  const [exerciseDetailSubtab, setExerciseDetailSubtab] = useState<'summary' | 'history' | 'progression'>('summary');

  // Routine Builder State
  const [newRoutineName, setNewRoutineName] = useState<string>('');
  const [newRoutineFolder, setNewRoutineFolder] = useState<string>('Push / Pull / Legs');
  const [newRoutineDescription, setNewRoutineDescription] = useState<string>('');
  const [newRoutineExercises, setNewRoutineExercises] = useState<WorkoutExerciseEntry[]>([]);

  // Custom Exercise Form State
  const [customExName, setCustomExName] = useState<string>('');
  const [customExEquipment, setCustomExEquipment] = useState<EquipmentType>('dumbbell');
  const [customExTracking, setCustomExTracking] = useState<ExerciseTrackingType>('weight_reps');
  const [customExPrimary, setCustomExPrimary] = useState<MuscleGroupId>('chest');
  const [customExSecondary, setCustomExSecondary] = useState<MuscleGroupId>('triceps');
  const [customExPattern, setCustomExPattern] = useState<MovementPattern>('bench_press');
  const [customExInstructions, setCustomExInstructions] = useState<string>('');

  // Body Measurement Form State
  const [measWeightLbs, setMeasWeightLbs] = useState<string>('176.5');
  const [measBodyFat, setMeasBodyFat] = useState<string>('13.8');
  const [measWaist, setMeasWaist] = useState<string>('31.2');
  const [measRestingHr, setMeasRestingHr] = useState<string>('55');

  // Elapsed workout timer
  useEffect(() => {
    if (!isWorkoutActive) return;
    const interval = setInterval(() => {
      setWorkoutElapsedSec(Math.floor((Date.now() - workoutStartedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorkoutActive, workoutStartedAt]);

  // Rest countdown timer
  useEffect(() => {
    if (restTimerRemaining <= 0) return;
    const interval = setInterval(() => {
      setRestTimerRemaining((prev) => {
        if (prev <= 1) {
          toast.success('Rest timer complete — ready for your next set!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimerRemaining]);

  const selectedExercise = useMemo<GymExercise | null>(() => {
    return exerciseMap.get(selectedExerciseId) || allExercises[0] || null;
  }, [exerciseMap, selectedExerciseId, allExercises]);

  const filteredExercises = useMemo<GymExercise[]>(() => {
    const q = exerciseSearch.trim().toLowerCase();
    return allExercises.filter((ex) => {
      if (muscleFilter !== 'all') {
        const hasMuscle =
          ex.primaryMuscles.includes(muscleFilter) || ex.secondaryMuscles.includes(muscleFilter);
        if (!hasMuscle) return false;
      }
      if (equipmentFilter !== 'all' && ex.equipment !== equipmentFilter) {
        return false;
      }
      if (q) {
        const matchesName = ex.name.toLowerCase().includes(q);
        const matchesMuscle = ex.primaryMuscles.some((m) =>
          MUSCLE_GROUP_META[m]?.label.toLowerCase().includes(q)
        );
        const matchesEquip = EQUIPMENT_LABELS[ex.equipment]?.toLowerCase().includes(q);
        return matchesName || matchesMuscle || matchesEquip;
      }
      return true;
    });
  }, [allExercises, exerciseSearch, muscleFilter, equipmentFilter]);

  const fatigueMap = useMemo(() => {
    return calculateMuscleRecoveryMap(workouts, exerciseMap);
  }, [workouts, exerciseMap]);

  const latestBodyweightLbs =
    measurements.length > 0 ? measurements[measurements.length - 1].weightLbs : 176.8;

  const liveWorkoutMetrics = useMemo(() => {
    return calculateSessionExertionMetrics({
      durationSeconds: Math.max(workoutElapsedSec, 600),
      sessionRpe,
      exercises: activeExercises,
      exerciseMap,
      bodyweightLbs: latestBodyweightLbs,
    });
  }, [workoutElapsedSec, sessionRpe, activeExercises, exerciseMap, latestBodyweightLbs]);

  const weightLabel = unitSystem === 'kg' ? 'kg' : 'lbs';
  const formatWeight = (lbs: number) =>
    unitSystem === 'kg' ? Math.round(lbs * 0.453592 * 10) / 10 : Math.round(lbs);

  // Start an empty workout
  const handleStartEmptyWorkout = () => {
    const now = Date.now();
    setWorkoutTitle('Custom Strength Session');
    setWorkoutRoutineId(null);
    setWorkoutStartedAt(now);
    setWorkoutElapsedSec(0);
    setWorkoutNotes('');
    setSessionRpe(8);
    setPerceivedFatigue(7);
    setActiveExercises([
      {
        id: `we-${now}-1`,
        exerciseId: 'bench-press-barbell',
        supersetId: null,
        notes: '',
        restTimerSeconds: 120,
        sets: [
          { id: `s-${now}-1`, setType: 'warmup', weight: 135, reps: 10, rpe: 6, rir: 4, completed: false },
          { id: `s-${now}-2`, setType: 'normal', weight: 185, reps: 8, rpe: 8, rir: 2, completed: false },
          { id: `s-${now}-3`, setType: 'normal', weight: 185, reps: 8, rpe: 8.5, rir: 1.5, completed: false },
        ],
      },
    ]);
    setSelectedExerciseId('bench-press-barbell');
    setAvatarWeightLbs(185);
    setAvatarRpe(8);
    setIsWorkoutActive(true);
    setActiveTab('workout');
    toast.success('Started empty workout');
  };

  // Start workout from a routine
  const handleStartRoutine = (routine: WorkoutRoutine) => {
    const now = Date.now();
    setWorkoutTitle(routine.name);
    setWorkoutRoutineId(routine.id);
    setWorkoutStartedAt(now);
    setWorkoutElapsedSec(0);
    setWorkoutNotes('');
    setSessionRpe(8);
    setPerceivedFatigue(7);

    const entries: WorkoutExerciseEntry[] = routine.exercises.map((re, idx) => ({
      id: `we-${now}-${idx}`,
      exerciseId: re.exerciseId,
      supersetId: re.supersetId || null,
      notes: re.notes || '',
      restTimerSeconds: re.restTimerSeconds || 90,
      sets: re.sets.map((s, sIdx) => ({
        id: `ws-${now}-${idx}-${sIdx}`,
        setType: s.setType,
        weight: s.targetWeight,
        reps: s.targetReps,
        rpe: s.targetRpe ?? 8,
        rir: s.targetRpe ? Math.max(0, 10 - s.targetRpe) : 2,
        completed: false,
      })),
    }));

    setActiveExercises(entries);
    if (entries[0]) {
      setSelectedExerciseId(entries[0].exerciseId);
      const firstWorking = entries[0].sets.find((s) => s.setType !== 'warmup') || entries[0].sets[0];
      if (firstWorking) {
        setAvatarWeightLbs(firstWorking.weight || 135);
        setAvatarRpe(firstWorking.rpe || 8);
      }
    }
    setIsWorkoutActive(true);
    setActiveTab('workout');
    toast.success(`Started "${routine.name}"`);
  };

  // Repeat a past workout
  const handleRepeatWorkout = (past: WorkoutSession) => {
    const now = Date.now();
    setWorkoutTitle(past.title);
    setWorkoutRoutineId(past.routineId || null);
    setWorkoutStartedAt(now);
    setWorkoutElapsedSec(0);
    setWorkoutNotes(past.notes || '');
    setSessionRpe(past.sessionRpe || 8);
    setActiveExercises(
      past.exercises.map((e, idx) => ({
        id: `we-${now}-${idx}`,
        exerciseId: e.exerciseId,
        supersetId: e.supersetId || null,
        notes: e.notes || '',
        restTimerSeconds: e.restTimerSeconds || 90,
        sets: e.sets.map((s, sIdx) => ({
          id: `ws-${now}-${idx}-${sIdx}`,
          setType: s.setType,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe ?? 8,
          rir: s.rpe ? Math.max(0, 10 - s.rpe) : 2,
          completed: false,
        })),
      }))
    );
    setIsWorkoutActive(true);
    setActiveTab('workout');
    toast.success(`Loaded "${past.title}" into active logger`);
  };

  // Add exercise to active workout or routine builder
  const handlePickExercise = (exercise: GymExercise) => {
    const now = Date.now();
    const prev = getPreviousSetForExercise(exercise.id, 0);
    const defaultWeight =
      prev?.weight ?? (exercise.equipment === 'bodyweight' ? 0 : exercise.equipment === 'barbell' ? 135 : 35);
    const defaultReps = prev?.reps ?? 10;

    const newEntry: WorkoutExerciseEntry = {
      id: `we-${now}`,
      exerciseId: exercise.id,
      supersetId: null,
      notes: '',
      restTimerSeconds: 90,
      sets: [
        {
          id: `s-${now}-1`,
          setType: 'normal',
          weight: defaultWeight,
          reps: defaultReps,
          rpe: 8,
          rir: 2,
          completed: false,
        },
        {
          id: `s-${now}-2`,
          setType: 'normal',
          weight: defaultWeight,
          reps: defaultReps,
          rpe: 8.5,
          rir: 1.5,
          completed: false,
        },
        {
          id: `s-${now}-3`,
          setType: 'normal',
          weight: defaultWeight,
          reps: defaultReps,
          rpe: 9,
          rir: 1,
          completed: false,
        },
      ],
    };

    if (pickerTarget === 'routine') {
      setNewRoutineExercises((prevList) => [...prevList, newEntry]);
    } else {
      setActiveExercises((prevList) => [...prevList, newEntry]);
      setSelectedExerciseId(exercise.id);
      setAvatarWeightLbs(defaultWeight);
    }
    setShowExercisePicker(false);
    toast.success(`Added ${exercise.name}`);
  };

  // Cycle set type: normal -> warmup -> failure -> dropset -> normal
  const handleCycleSetType = (entryId: string, setId: string) => {
    const order: SetType[] = ['normal', 'warmup', 'failure', 'dropset'];
    setActiveExercises((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        return {
          ...entry,
          sets: entry.sets.map((s) => {
            if (s.id !== setId) return s;
            const nextType = order[(order.indexOf(s.setType) + 1) % order.length];
            return { ...s, setType: nextType };
          }),
        };
      })
    );
  };

  // Update set field (weight, reps, rpe)
  const handleUpdateSet = (
    entryId: string,
    setId: string,
    field: 'weight' | 'reps' | 'rpe',
    value: number
  ) => {
    setActiveExercises((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        return {
          ...entry,
          sets: entry.sets.map((s) => {
            if (s.id !== setId) return s;
            if (field === 'rpe') {
              return { ...s, rpe: value, rir: Math.max(0, +(10 - value).toFixed(1)) };
            }
            return { ...s, [field]: value };
          }),
        };
      })
    );
  };

  // Toggle set completed + start Rest Timer + check PRs + update 3D Avatar
  const handleToggleCompleteSet = (entry: WorkoutExerciseEntry, set: WorkoutSet) => {
    const nextCompleted = !set.completed;
    let prs: ('heaviest_weight' | 'best_1rm' | 'best_set_volume')[] = [];

    if (nextCompleted) {
      prs = evaluateSetPRs(entry.exerciseId, set);
      setSelectedExerciseId(entry.exerciseId);
      setAvatarWeightLbs(set.weight || 0);
      setAvatarRpe(set.rpe || 8);

      // Start Rest Timer automatically
      const restSec = entry.restTimerSeconds || 90;
      setRestTimerTotal(restSec);
      setRestTimerRemaining(restSec);

      if (prs.length > 0) {
        const exName = exerciseMap.get(entry.exerciseId)?.name || 'Exercise';
        toast.success(`New Personal Record on ${exName}!`);
      }
    }

    setActiveExercises((prev) =>
      prev.map((e) => {
        if (e.id !== entry.id) return e;
        return {
          ...e,
          sets: e.sets.map((s) => {
            if (s.id !== set.id) return s;
            return {
              ...s,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
              isPR: prs.length > 0,
              prTypes: prs,
            };
          }),
        };
      })
    );
  };

  const handleAddSet = (entryId: string) => {
    setActiveExercises((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        const lastSet = entry.sets[entry.sets.length - 1];
        const newSet: WorkoutSet = {
          id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          setType: 'normal',
          weight: lastSet ? lastSet.weight : 135,
          reps: lastSet ? lastSet.reps : 8,
          rpe: lastSet?.rpe ?? 8,
          rir: lastSet?.rir ?? 2,
          completed: false,
        };
        return { ...entry, sets: [...entry.sets, newSet] };
      })
    );
  };

  const handleRemoveSet = (entryId: string, setId: string) => {
    setActiveExercises((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        return { ...entry, sets: entry.sets.filter((s) => s.id !== setId) };
      })
    );
  };

  const handleRemoveExerciseFromWorkout = (entryId: string) => {
    setActiveExercises((prev) => prev.filter((e) => e.id !== entryId));
  };

  const handleMoveExercise = (index: number, direction: -1 | 1) => {
    setActiveExercises((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  // Finish and save workout
  const handleFinishWorkoutConfirm = async () => {
    const endedNow = new Date().toISOString();
    const durationSec = Math.max(300, workoutElapsedSec || 45 * 60);
    let prCount = 0;
    for (const e of activeExercises) {
      for (const s of e.sets) {
        if (s.completed && s.isPR) prCount += 1;
      }
    }

    const metrics = calculateSessionExertionMetrics({
      durationSeconds: durationSec,
      sessionRpe,
      exercises: activeExercises,
      exerciseMap,
      bodyweightLbs: latestBodyweightLbs,
    });

    const newSession: WorkoutSession = {
      id: `workout-${Date.now()}`,
      title: workoutTitle.trim() || 'Strength Workout',
      routineId: workoutRoutineId,
      startedAt: new Date(workoutStartedAt).toISOString(),
      endedAt: endedNow,
      durationSeconds: durationSec,
      notes: workoutNotes.trim(),
      sessionRpe,
      perceivedFatigue,
      preWorkoutReadiness,
      totalVolumeLbs: metrics.totalVolumeLbs,
      totalSets: metrics.completedSets,
      exertionLoadAU: metrics.exertionLoadAU,
      estimatedCalories: metrics.estimatedCalories,
      prCount,
      exercises: activeExercises,
    };

    await saveWorkout(newSession);
    setShowFinishModal(false);
    setIsWorkoutActive(false);
    setRestTimerRemaining(0);
    setActiveTab('history');
    toast.success(`Workout saved! Exertion Load: ${metrics.exertionLoadAU} AU`);
  };

  const handleSaveWorkoutAsRoutine = async (workout: WorkoutSession) => {
    const newRoutine: WorkoutRoutine = {
      id: `routine-${Date.now()}`,
      name: `${workout.title} (Template)`,
      folder: 'Custom Routines',
      description: workout.notes || 'Saved from completed workout history.',
      targetDurationMinutes: Math.max(20, Math.round(workout.durationSeconds / 60)),
      lastPerformedAt: workout.endedAt,
      exercises: workout.exercises.map((e, idx) => ({
        id: `re-${Date.now()}-${idx}`,
        exerciseId: e.exerciseId,
        supersetId: e.supersetId || null,
        notes: e.notes || '',
        restTimerSeconds: e.restTimerSeconds || 90,
        sets: e.sets.map((s, sIdx) => ({
          id: `rs-${Date.now()}-${idx}-${sIdx}`,
          setType: s.setType,
          targetWeight: s.weight,
          targetReps: s.reps,
          targetRpe: s.rpe,
        })),
      })),
    };
    await saveRoutine(newRoutine);
    toast.success(`Saved "${newRoutine.name}" to Routines`);
  };

  const handleCreateRoutineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName.trim() || newRoutineExercises.length === 0) {
      toast.error('Please enter a routine name and add at least one exercise.');
      return;
    }
    const created: WorkoutRoutine = {
      id: `routine-${Date.now()}`,
      name: newRoutineName.trim(),
      folder: newRoutineFolder.trim() || 'Custom Routines',
      description: newRoutineDescription.trim() || 'Custom workout routine.',
      targetDurationMinutes: Math.max(25, newRoutineExercises.length * 12),
      lastPerformedAt: null,
      exercises: newRoutineExercises.map((entry, idx) => ({
        id: `re-${Date.now()}-${idx}`,
        exerciseId: entry.exerciseId,
        supersetId: entry.supersetId || null,
        notes: entry.notes || '',
        restTimerSeconds: entry.restTimerSeconds || 90,
        sets: entry.sets.map((s, sIdx) => ({
          id: `rs-${Date.now()}-${idx}-${sIdx}`,
          setType: s.setType,
          targetWeight: s.weight,
          targetReps: s.reps,
          targetRpe: s.rpe,
        })),
      })),
    };
    await saveRoutine(created);
    setShowRoutineModal(false);
    setNewRoutineName('');
    setNewRoutineDescription('');
    setNewRoutineExercises([]);
    toast.success(`Created routine "${created.name}"`);
  };

  const handleCreateCustomExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExName.trim()) return;
    const slug = `custom-${customExName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const created: GymExercise = {
      id: slug,
      name: customExName.trim(),
      equipment: customExEquipment,
      trackingType: customExTracking,
      primaryMuscles: [customExPrimary],
      secondaryMuscles: customExSecondary !== customExPrimary ? [customExSecondary] : [],
      movementPattern: customExPattern,
      metValue: 5.5,
      instructions: customExInstructions
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      isCustom: true,
    };

    await addCustomExercise(created);
    setSelectedExerciseId(created.id);
    setShowCustomExerciseModal(false);
    setCustomExName('');
    setCustomExInstructions('');
    toast.success(`Created custom exercise "${created.name}"`);
  };

  const handleLogMeasurementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(measWeightLbs);
    if (!w || w <= 0) return;
    await saveMeasurement({
      id: `bm-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      weightLbs: w,
      bodyFatPct: parseFloat(measBodyFat) || undefined,
      waistIn: parseFloat(measWaist) || undefined,
      restingHr: parseInt(measRestingHr, 10) || undefined,
    });
    toast.success('Logged body measurements');
  };

  // Summary analytics across all workouts
  const analyticsSummary = useMemo(() => {
    const totalWorkouts = workouts.length;
    const totalVol = workouts.reduce((sum, w) => sum + (w.totalVolumeLbs || 0), 0);
    const totalExertion = workouts.reduce((sum, w) => sum + (w.exertionLoadAU || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.estimatedCalories || 0), 0);
    const avgRpe =
      totalWorkouts > 0
        ? Math.round((workouts.reduce((sum, w) => sum + (w.sessionRpe || 8), 0) / totalWorkouts) * 10) / 10
        : 0;
    return { totalWorkouts, totalVol, totalExertion, totalCalories, avgRpe };
  }, [workouts]);

  // Selected exercise records & progression history
  const selectedExerciseRecords = useMemo(
    () => getExerciseRecords(selectedExerciseId),
    [getExerciseRecords, selectedExerciseId]
  );

  const selectedExerciseSessions = useMemo(() => {
    const list: {
      workoutId: string;
      workoutTitle: string;
      date: string;
      sets: WorkoutSet[];
      best1RM: number;
      maxWeight: number;
      sessionVolume: number;
    }[] = [];

    for (const w of workouts) {
      const match = w.exercises.find((e) => e.exerciseId === selectedExerciseId);
      if (!match) continue;
      const completed = match.sets.filter((s) => s.completed);
      if (completed.length === 0) continue;

      let best1RM = 0;
      let maxWeight = 0;
      let sessionVolume = 0;
      for (const s of completed) {
        if (s.setType !== 'warmup') {
          const est = calculateOneRepMax(s.weight, s.reps);
          if (est > best1RM) best1RM = est;
          if (s.weight > maxWeight) maxWeight = s.weight;
          sessionVolume += (s.weight || 0) * (s.reps || 0);
        }
      }
      list.push({
        workoutId: w.id,
        workoutTitle: w.title,
        date: w.endedAt || w.startedAt,
        sets: completed,
        best1RM,
        maxWeight,
        sessionVolume,
      });
    }
    return list;
  }, [workouts, selectedExerciseId]);

  if (!isLoaded) {
    return (
      <div className="sp-card" style={{ padding: '2rem', textAlign: 'center' }}>
        Loading Gym &amp; Exertion Tracker...
      </div>
    );
  }

  return (
    <div className="layout-grid gap-lg">
      {/* Top Bar: Mode Tabs + Units Toggle + MockDataTag */}
      <div className="sp-card" style={{ padding: '0.85rem 1.15rem' }}>
        <div className="layout-flex items-center justify-between gap-md wrap">
          <div className="cluster gap-sm" role="tablist" aria-label="Gym Tracker sections">
            {(
              [
                { id: 'workout', label: isWorkoutActive ? 'Active Workout ●' : 'Workout Logger', icon: 'ti-dumbbell' },
                { id: 'routines', label: `Routines (${routines.length})`, icon: 'ti-layout-grid' },
                { id: 'exercises', label: `Exercises (${allExercises.length})`, icon: 'ti-search' },
                { id: 'exertion', label: 'Exertion & Recovery', icon: 'ti-flame' },
                { id: 'history', label: `History (${workouts.length})`, icon: 'ti-calendar' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`button button--sm ${
                  activeTab === tab.id ? 'button--primary' : 'button--secondary'
                }`}
              >
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <use href={`#${tab.icon}`} />
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="cluster gap-sm">
            <MockDataTag label="Hevy + Exertion Sync" />
            <div className="button-group" role="group" aria-label="Weight unit system">
              <button
                type="button"
                className="button-group__item"
                aria-pressed={unitSystem === 'lbs'}
                onClick={() => setUnitSystem('lbs')}
              >
                LBS
              </button>
              <button
                type="button"
                className="button-group__item"
                aria-pressed={unitSystem === 'kg'}
                onClick={() => setUnitSystem('kg')}
              >
                KG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Responsive Layout: Left Main Content + Right 3D Avatar & Exertion Rail */}
      <div className="portal-layout">
        <div className="portal-layout__main layout-grid gap-lg">
          {/* ==================== TAB 1: WORKOUT LOGGER ==================== */}
          {activeTab === 'workout' && (
            <>
              {!isWorkoutActive ? (
                <div className="layout-grid gap-lg">
                  {/* Quick Start Hero Card */}
                  <div className="sp-card" style={{ padding: '1.5rem' }}>
                    <div className="layout-flex items-center justify-between gap-md wrap">
                      <div>
                        <span className="portal-eyebrow">Quick Start</span>
                        <h2 style={{ margin: '0.25rem 0 0.4rem', fontSize: '1.35rem' }}>
                          Start an Empty Workout or Launch a Routine
                        </h2>
                        <p className="margin-none text-muted font-sm">
                          Log sets, weight, reps, Set Type (Warm-up, Normal, Failure, Drop), RPE (1–10) &amp; RIR, Supersets, and watch your 3D avatar demonstrate every lift in real time.
                        </p>
                      </div>
                      <div className="cluster gap-sm">
                        <button
                          type="button"
                          className="button button--primary button--lg"
                          onClick={handleStartEmptyWorkout}
                        >
                          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                            <use href="#ti-plus" />
                          </svg>
                          <span>Start Empty Workout</span>
                        </button>
                        <button
                          type="button"
                          className="button button--secondary button--lg"
                          onClick={() => {
                            setNewRoutineExercises([]);
                            setShowRoutineModal(true);
                          }}
                        >
                          <span>New Routine</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick-Start Routines Grid */}
                  <div className="layout-grid gap-md">
                    <div className="layout-flex items-center justify-between">
                      <h3 className="margin-none">My Routines ({routines.length})</h3>
                      <button
                        type="button"
                        className="button button--tertiary button--sm"
                        onClick={() => setActiveTab('routines')}
                      >
                        Manage All Routines
                      </button>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      {routines.map((routine) => (
                        <article
                          key={routine.id}
                          className="sp-card"
                          style={{
                            padding: '1.15rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.85rem',
                          }}
                        >
                          <div>
                            <div className="layout-flex items-center justify-between gap-xs">
                              <span className="ui-badge ui-badge--sm">{routine.folder}</span>
                              <span className="font-xs text-muted">~{routine.targetDurationMinutes} min</span>
                            </div>
                            <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.05rem' }}>{routine.name}</h4>
                            <p className="margin-none text-muted font-xs" style={{ lineHeight: 1.45 }}>
                              {routine.exercises
                                .map((re) => exerciseMap.get(re.exerciseId)?.name || re.exerciseId)
                                .join(' · ')}
                            </p>
                          </div>
                          <div className="layout-flex items-center justify-between gap-sm">
                            <button
                              type="button"
                              className="button button--primary button--sm full-width"
                              onClick={() => handleStartRoutine(routine)}
                            >
                              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-play" />
                              </svg>
                              <span>Start Routine</span>
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ACTIVE WORKOUT LOGGER */
                <div className="layout-grid gap-lg">
                  {/* Sticky Live Telemetry Header */}
                  <div
                    className="sp-card"
                    style={{
                      padding: '1.1rem 1.25rem',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.85))',
                    }}
                  >
                    <div className="layout-flex items-center justify-between gap-md wrap">
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <input
                          type="text"
                          value={workoutTitle}
                          onChange={(e) => setWorkoutTitle(e.target.value)}
                          aria-label="Workout session title"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px dashed rgba(148, 163, 184, 0.4)',
                            color: 'inherit',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            width: '100%',
                            padding: '2px 0',
                          }}
                        />
                        <div className="cluster gap-md font-xs text-muted" style={{ marginTop: '0.4rem' }}>
                          <span>
                            Duration: <strong className="text-strong">{formatDuration(workoutElapsedSec)}</strong>
                          </span>
                          <span>
                            Volume:{' '}
                            <strong className="text-strong">
                              {formatWeight(liveWorkoutMetrics.totalVolumeLbs).toLocaleString()} {weightLabel}
                            </strong>
                          </span>
                          <span>
                            Sets: <strong className="text-strong">{liveWorkoutMetrics.completedSets}</strong>
                          </span>
                          <span>
                            Exertion Load:{' '}
                            <strong style={{ color: liveWorkoutMetrics.exertionZone.color }}>
                              {liveWorkoutMetrics.exertionLoadAU} AU ({liveWorkoutMetrics.exertionZone.label})
                            </strong>
                          </span>
                          <span>
                            Est. Burn: <strong className="text-strong">{liveWorkoutMetrics.estimatedCalories} kcal</strong>
                          </span>
                        </div>
                      </div>

                      <div className="cluster gap-sm">
                        <button
                          type="button"
                          className="button button--danger button--sm"
                          onClick={() => {
                            setIsWorkoutActive(false);
                            setRestTimerRemaining(0);
                            toast('Workout discarded');
                          }}
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          className="button button--primary button--md"
                          onClick={() => setShowFinishModal(true)}
                        >
                          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                            <use href="#ti-check" />
                          </svg>
                          <span>Finish Workout</span>
                        </button>
                      </div>
                    </div>

                    {/* Built-in Hevy Rest Timer Bar */}
                    <div
                      style={{
                        marginTop: '0.9rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(148, 163, 184, 0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div className="layout-flex items-center gap-sm">
                        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                          <use href="#ti-clock" />
                        </svg>
                        <span className="font-sm weight-semibold">
                          Rest Timer:{' '}
                          <span style={{ color: restTimerRemaining > 0 ? '#38bdf8' : 'inherit' }}>
                            {restTimerRemaining > 0 ? formatDuration(restTimerRemaining) : 'Idle'}
                          </span>
                        </span>
                        {restTimerRemaining > 0 && (
                          <div
                            style={{
                              width: '120px',
                              height: '6px',
                              borderRadius: '999px',
                              background: 'rgba(148, 163, 184, 0.2)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, (restTimerRemaining / Math.max(1, restTimerTotal)) * 100)}%`,
                                height: '100%',
                                background: '#38bdf8',
                                transition: 'width 0.5s linear',
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="cluster gap-xs">
                        {[60, 90, 120, 180].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            className="button button--secondary button--sm"
                            onClick={() => {
                              setRestTimerTotal(sec);
                              setRestTimerRemaining(sec);
                            }}
                          >
                            {sec}s
                          </button>
                        ))}
                        {restTimerRemaining > 0 && (
                          <>
                            <button
                              type="button"
                              className="button button--tertiary button--sm"
                              onClick={() => setRestTimerRemaining((r) => Math.max(0, r - 15))}
                            >
                              -15s
                            </button>
                            <button
                              type="button"
                              className="button button--tertiary button--sm"
                              onClick={() => {
                                setRestTimerTotal((t) => t + 15);
                                setRestTimerRemaining((r) => r + 15);
                              }}
                            >
                              +15s
                            </button>
                            <button
                              type="button"
                              className="button button--danger button--sm"
                              onClick={() => setRestTimerRemaining(0)}
                            >
                              Skip
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Exercise Cards */}
                  {activeExercises.map((entry, entryIdx) => {
                    const ex = exerciseMap.get(entry.exerciseId);
                    if (!ex) return null;
                    const supersetColor = entry.supersetId ? SUPERSET_COLORS[entry.supersetId] : undefined;
                    const isFocusedIn3D = selectedExerciseId === ex.id;

                    return (
                      <article
                        key={entry.id}
                        className="sp-card"
                        style={{
                          padding: '1.15rem',
                          borderLeft: supersetColor
                            ? `4px solid ${supersetColor}`
                            : isFocusedIn3D
                              ? '4px solid #f43f5e'
                              : undefined,
                        }}
                      >
                        {/* Exercise Header */}
                        <div className="layout-flex items-center justify-between gap-sm wrap">
                          <div className="layout-flex items-center gap-sm wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedExerciseId(ex.id);
                                const firstSet = entry.sets[0];
                                if (firstSet) {
                                  setAvatarWeightLbs(firstSet.weight || 135);
                                  setAvatarRpe(firstSet.rpe || 8);
                                }
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#38bdf8',
                                fontWeight: 700,
                                fontSize: '1.08rem',
                                cursor: 'pointer',
                                padding: 0,
                                textAlign: 'left',
                              }}
                            >
                              {entryIdx + 1}. {ex.name}
                            </button>
                            <span className="ui-badge ui-badge--sm">{EQUIPMENT_LABELS[ex.equipment]}</span>
                            {entry.supersetId && (
                              <span
                                className="ui-badge ui-badge--sm"
                                style={{
                                  background: `${supersetColor}22`,
                                  color: supersetColor,
                                  border: `1px solid ${supersetColor}`,
                                }}
                              >
                                Superset {entry.supersetId}
                              </span>
                            )}
                            {isFocusedIn3D && (
                              <span
                                className="ui-badge ui-badge--sm"
                                style={{
                                  background: 'rgba(244, 63, 94, 0.16)',
                                  color: '#fda4af',
                                }}
                              >
                                Viewing in 3D Avatar
                              </span>
                            )}
                          </div>

                          {/* Exercise Actions: Superset, Rest Timer, Move, Remove */}
                          <div className="cluster gap-xs">
                            <select
                              aria-label="Superset group"
                              value={entry.supersetId || ''}
                              onChange={(e) => {
                                const val = e.target.value || null;
                                setActiveExercises((prev) =>
                                  prev.map((item) => (item.id === entry.id ? { ...item, supersetId: val } : item))
                                );
                              }}
                              style={{
                                background: 'rgba(15, 23, 42, 0.7)',
                                color: 'inherit',
                                border: '1px solid rgba(148, 163, 184, 0.28)',
                                borderRadius: '6px',
                                padding: '3px 6px',
                                fontSize: '0.75rem',
                              }}
                            >
                              <option value="">No Superset</option>
                              <option value="A">Superset A</option>
                              <option value="B">Superset B</option>
                              <option value="C">Superset C</option>
                              <option value="D">Superset D</option>
                            </select>

                            <select
                              aria-label="Exercise rest timer"
                              value={entry.restTimerSeconds}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setActiveExercises((prev) =>
                                  prev.map((item) =>
                                    item.id === entry.id ? { ...item, restTimerSeconds: val } : item
                                  )
                                );
                              }}
                              style={{
                                background: 'rgba(15, 23, 42, 0.7)',
                                color: 'inherit',
                                border: '1px solid rgba(148, 163, 184, 0.28)',
                                borderRadius: '6px',
                                padding: '3px 6px',
                                fontSize: '0.75rem',
                              }}
                            >
                              <option value={60}>Rest: 60s</option>
                              <option value={90}>Rest: 90s</option>
                              <option value={120}>Rest: 2m</option>
                              <option value={150}>Rest: 2m 30s</option>
                              <option value={180}>Rest: 3m</option>
                            </select>

                            <button
                              type="button"
                              className="button button--tertiary button--sm"
                              disabled={entryIdx === 0}
                              onClick={() => handleMoveExercise(entryIdx, -1)}
                              aria-label="Move exercise up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="button button--tertiary button--sm"
                              disabled={entryIdx === activeExercises.length - 1}
                              onClick={() => handleMoveExercise(entryIdx, 1)}
                              aria-label="Move exercise down"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="button button--tertiary button--sm"
                              onClick={() => handleRemoveExerciseFromWorkout(entry.id)}
                              aria-label="Remove exercise"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Pinned Exercise Notes */}
                        <div style={{ margin: '0.55rem 0 0.75rem' }}>
                          <input
                            type="text"
                            placeholder="Add exercise notes (e.g., seat setting, tempo, grip width)..."
                            value={entry.notes}
                            onChange={(e) => {
                              const val = e.target.value;
                              setActiveExercises((prev) =>
                                prev.map((item) => (item.id === entry.id ? { ...item, notes: val } : item))
                              );
                            }}
                            style={{
                              width: '100%',
                              background: 'rgba(15, 23, 42, 0.4)',
                              border: '1px solid rgba(148, 163, 184, 0.18)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: 'inherit',
                              fontSize: '0.8rem',
                            }}
                          />
                        </div>

                        {/* Hevy Set Table */}
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                              <tr
                                style={{
                                  textAlign: 'left',
                                  color: '#94a3b8',
                                  borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
                                }}
                              >
                                <th style={{ padding: '6px 8px', width: '54px' }}>SET</th>
                                <th style={{ padding: '6px 8px' }}>PREVIOUS</th>
                                <th style={{ padding: '6px 8px', width: '110px' }}>
                                  {weightLabel.toUpperCase()}
                                </th>
                                <th style={{ padding: '6px 8px', width: '90px' }}>
                                  {ex.trackingType === 'duration' ? 'SEC' : 'REPS'}
                                </th>
                                <th style={{ padding: '6px 8px', width: '130px' }}>RPE / EXERTION</th>
                                <th style={{ padding: '6px 8px', width: '80px' }}>EST 1RM</th>
                                <th style={{ padding: '6px 8px', textAlign: 'right', width: '74px' }}>✓</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.sets.map((set, setIdx) => {
                                const prevPerf = getPreviousSetForExercise(entry.exerciseId, setIdx);
                                const est1RM =
                                  set.setType === 'warmup' ? 0 : calculateOneRepMax(set.weight, set.reps);
                                const setBadgeColor =
                                  set.setType === 'warmup'
                                    ? '#f59e0b'
                                    : set.setType === 'failure'
                                      ? '#ef4444'
                                      : set.setType === 'dropset'
                                        ? '#a855f7'
                                        : '#e2e8f0';
                                const setBadgeLabel =
                                  set.setType === 'warmup'
                                    ? 'W'
                                    : set.setType === 'failure'
                                      ? 'F'
                                      : set.setType === 'dropset'
                                        ? 'D'
                                        : String(setIdx + 1);

                                return (
                                  <tr
                                    key={set.id}
                                    style={{
                                      background: set.completed
                                        ? 'rgba(16, 185, 129, 0.12)'
                                        : 'transparent',
                                      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                                    }}
                                  >
                                    {/* Set Type Badge */}
                                    <td style={{ padding: '6px 8px' }}>
                                      <button
                                        type="button"
                                        title="Click to cycle Set Type: Normal -> Warm-up (W) -> Failure (F) -> Drop Set (D)"
                                        onClick={() => handleCycleSetType(entry.id, set.id)}
                                        style={{
                                          width: '28px',
                                          height: '28px',
                                          borderRadius: '6px',
                                          border: `1px solid ${setBadgeColor}`,
                                          background: 'rgba(15, 23, 42, 0.8)',
                                          color: setBadgeColor,
                                          fontWeight: 700,
                                          fontSize: '0.78rem',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        {setBadgeLabel}
                                      </button>
                                    </td>

                                    {/* Previous Workout Reference */}
                                    <td style={{ padding: '6px 8px' }}>
                                      {prevPerf ? (
                                        <button
                                          type="button"
                                          title="Click to copy previous weight & reps"
                                          onClick={() => {
                                            handleUpdateSet(entry.id, set.id, 'weight', prevPerf.weight);
                                            handleUpdateSet(entry.id, set.id, 'reps', prevPerf.reps);
                                          }}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#94a3b8',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            padding: 0,
                                          }}
                                        >
                                          {formatWeight(prevPerf.weight)} {weightLabel} × {prevPerf.reps}
                                          {prevPerf.rpe ? ` @${prevPerf.rpe}` : ''}
                                        </button>
                                      ) : (
                                        <span className="text-muted font-xs">—</span>
                                      )}
                                    </td>

                                    {/* Weight Input + Plate Calculator Trigger */}
                                    <td style={{ padding: '6px 8px' }}>
                                      <div className="layout-flex items-center gap-xs">
                                        <input
                                          type="number"
                                          min={0}
                                          step={2.5}
                                          value={set.weight}
                                          onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            handleUpdateSet(entry.id, set.id, 'weight', val);
                                            setSelectedExerciseId(entry.exerciseId);
                                            setAvatarWeightLbs(val);
                                          }}
                                          style={{
                                            width: '68px',
                                            background: 'rgba(15, 23, 42, 0.75)',
                                            border: '1px solid rgba(148, 163, 184, 0.28)',
                                            borderRadius: '6px',
                                            padding: '4px 6px',
                                            color: 'inherit',
                                            fontWeight: 600,
                                          }}
                                        />
                                        {ex.equipment === 'barbell' && set.weight >= 45 && (
                                          <button
                                            type="button"
                                            title="Barbell Plate Calculator"
                                            onClick={() => setPlateCalcWeight(set.weight)}
                                            style={{
                                              background: 'rgba(56, 189, 248, 0.14)',
                                              border: '1px solid rgba(56, 189, 248, 0.3)',
                                              color: '#38bdf8',
                                              borderRadius: '4px',
                                              padding: '2px 5px',
                                              fontSize: '0.68rem',
                                              cursor: 'pointer',
                                            }}
                                          >
                                            Plates
                                          </button>
                                        )}
                                      </div>
                                    </td>

                                    {/* Reps Input */}
                                    <td style={{ padding: '6px 8px' }}>
                                      <input
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={set.reps}
                                        onChange={(e) =>
                                          handleUpdateSet(
                                            entry.id,
                                            set.id,
                                            'reps',
                                            parseInt(e.target.value, 10) || 0
                                          )
                                        }
                                        style={{
                                          width: '62px',
                                          background: 'rgba(15, 23, 42, 0.75)',
                                          border: '1px solid rgba(148, 163, 184, 0.28)',
                                          borderRadius: '6px',
                                          padding: '4px 6px',
                                          color: 'inherit',
                                          fontWeight: 600,
                                        }}
                                      />
                                    </td>

                                    {/* RPE / Exertion Selector */}
                                    <td style={{ padding: '6px 8px' }}>
                                      <select
                                        aria-label="Set RPE"
                                        value={set.rpe ?? 8}
                                        onChange={(e) => {
                                          const rpeVal = parseFloat(e.target.value);
                                          handleUpdateSet(entry.id, set.id, 'rpe', rpeVal);
                                          setSelectedExerciseId(entry.exerciseId);
                                          setAvatarRpe(rpeVal);
                                        }}
                                        style={{
                                          background: 'rgba(15, 23, 42, 0.8)',
                                          color:
                                            RPE_SCALE_INFO[set.rpe || 8]?.color || '#eab308',
                                          border: '1px solid rgba(148, 163, 184, 0.28)',
                                          borderRadius: '6px',
                                          padding: '4px 6px',
                                          fontWeight: 700,
                                          fontSize: '0.76rem',
                                        }}
                                      >
                                        {[6, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((rVal) => (
                                          <option key={rVal} value={rVal}>
                                            RPE {rVal} ({RPE_SCALE_INFO[rVal]?.rir})
                                          </option>
                                        ))}
                                      </select>
                                    </td>

                                    {/* Est 1RM + PR Badge */}
                                    <td style={{ padding: '6px 8px' }}>
                                      <div className="layout-flex items-center gap-xs">
                                        <span className="font-xs text-muted">
                                          {est1RM > 0 ? `${formatWeight(est1RM)} ${weightLabel}` : '—'}
                                        </span>
                                        {set.isPR && (
                                          <span
                                            title="Personal Record!"
                                            style={{
                                              background: 'rgba(234, 179, 8, 0.2)',
                                              color: '#facc15',
                                              padding: '1px 5px',
                                              borderRadius: '4px',
                                              fontSize: '0.68rem',
                                              fontWeight: 700,
                                            }}
                                          >
                                            🏆 PR
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Complete Set Checkmark + Remove Set */}
                                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                                      <div className="layout-flex items-center justify-end gap-xs">
                                        <button
                                          type="button"
                                          onClick={() => handleToggleCompleteSet(entry, set)}
                                          aria-label={set.completed ? 'Mark set incomplete' : 'Complete set'}
                                          style={{
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '8px',
                                            border: set.completed
                                              ? '1px solid #10b981'
                                              : '1px solid rgba(148, 163, 184, 0.35)',
                                            background: set.completed
                                              ? '#10b981'
                                              : 'rgba(15, 23, 42, 0.7)',
                                            color: set.completed ? '#090d16' : '#e2e8f0',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                          }}
                                        >
                                          ✓
                                        </button>
                                        {entry.sets.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveSet(entry.id, set.id)}
                                            aria-label="Remove set"
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              color: '#64748b',
                                              cursor: 'pointer',
                                              fontSize: '0.75rem',
                                            }}
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div style={{ marginTop: '0.65rem' }}>
                          <button
                            type="button"
                            className="button button--secondary button--sm full-width"
                            onClick={() => handleAddSet(entry.id)}
                          >
                            + Add Set
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  {/* Bottom Workout Action Bar */}
                  <div className="cluster gap-md">
                    <button
                      type="button"
                      className="button button--primary button--md"
                      onClick={() => {
                        setPickerTarget('workout');
                        setShowExercisePicker(true);
                      }}
                    >
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                        <use href="#ti-plus" />
                      </svg>
                      <span>Add Exercise</span>
                    </button>
                    <button
                      type="button"
                      className="button button--secondary button--md"
                      onClick={() => setShowFinishModal(true)}
                    >
                      Finish &amp; Log Exertion
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==================== TAB 2: ROUTINES ==================== */}
          {activeTab === 'routines' && (
            <div className="layout-grid gap-lg">
              <div className="sp-card" style={{ padding: '1.25rem' }}>
                <div className="layout-flex items-center justify-between gap-md wrap">
                  <div>
                    <span className="portal-eyebrow">Hevy Program &amp; Routine Builder</span>
                    <h2 style={{ margin: '0.2rem 0' }}>Workout Routines</h2>
                    <p className="margin-none text-muted font-sm">
                      Build reusable templates with target sets, weights, rep ranges, Supersets, and RPE targets.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button--primary button--md"
                    onClick={() => {
                      setNewRoutineExercises([]);
                      setShowRoutineModal(true);
                    }}
                  >
                    <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                      <use href="#ti-plus" />
                    </svg>
                    <span>Create New Routine</span>
                  </button>
                </div>
              </div>

              <div className="layout-grid gap-md">
                {routines.map((routine) => (
                  <article key={routine.id} className="sp-card" style={{ padding: '1.25rem' }}>
                    <div className="layout-flex items-center justify-between gap-md wrap">
                      <div>
                        <div className="cluster gap-xs">
                          <span className="ui-badge ui-badge--sm">{routine.folder}</span>
                          <span className="font-xs text-muted">
                            {routine.exercises.length} exercises · ~{routine.targetDurationMinutes} min
                          </span>
                          {routine.lastPerformedAt && (
                            <span className="font-xs text-muted">
                              · Last performed {formatDateShort(routine.lastPerformedAt)}
                            </span>
                          )}
                        </div>
                        <h3 style={{ margin: '0.4rem 0 0.25rem' }}>{routine.name}</h3>
                        <p className="margin-none text-muted font-sm">{routine.description}</p>
                      </div>
                      <div className="cluster gap-xs">
                        <button
                          type="button"
                          className="button button--primary button--sm"
                          onClick={() => handleStartRoutine(routine)}
                        >
                          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                            <use href="#ti-play" />
                          </svg>
                          <span>Start Routine</span>
                        </button>
                        <button
                          type="button"
                          className="button button--secondary button--sm"
                          onClick={() =>
                            saveRoutine({
                              ...routine,
                              id: `routine-${Date.now()}`,
                              name: `${routine.name} (Copy)`,
                            })
                          }
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          className="button button--tertiary button--sm"
                          onClick={() => deleteRoutine(routine.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Exercises breakdown inside routine */}
                    <div
                      style={{
                        marginTop: '0.9rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(148, 163, 184, 0.16)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                        gap: '0.6rem',
                      }}
                    >
                      {routine.exercises.map((re, idx) => {
                        const ex = exerciseMap.get(re.exerciseId);
                        return (
                          <button
                            key={re.id}
                            type="button"
                            onClick={() => {
                              setSelectedExerciseId(re.exerciseId);
                              const firstSet = re.sets[0];
                              if (firstSet) {
                                setAvatarWeightLbs(firstSet.targetWeight || 135);
                                setAvatarRpe(firstSet.targetRpe || 8);
                              }
                            }}
                            style={{
                              textAlign: 'left',
                              background: 'rgba(15, 23, 42, 0.5)',
                              border: '1px solid rgba(148, 163, 184, 0.18)',
                              borderRadius: '8px',
                              padding: '0.6rem 0.75rem',
                              color: 'inherit',
                              cursor: 'pointer',
                            }}
                          >
                            <div className="layout-flex items-center justify-between gap-xs">
                              <strong className="font-xs" style={{ color: '#38bdf8' }}>
                                {idx + 1}. {ex?.name || re.exerciseId}
                              </strong>
                              {re.supersetId && (
                                <span className="ui-badge ui-badge--sm">SS {re.supersetId}</span>
                              )}
                            </div>
                            <span className="font-xs text-muted" style={{ display: 'block', marginTop: '2px' }}>
                              {re.sets.length} sets · Target{' '}
                              {re.sets[re.sets.length - 1]?.targetWeight || 0} {weightLabel} ×{' '}
                              {re.sets[re.sets.length - 1]?.targetReps || 8} @ RPE{' '}
                              {re.sets[re.sets.length - 1]?.targetRpe || 8.5}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: FULL HEVY EXERCISE LIBRARY ==================== */}
          {activeTab === 'exercises' && (
            <div className="layout-grid gap-lg">
              {/* Search & Filter Controls */}
              <div className="sp-card" style={{ padding: '1.15rem' }}>
                <div className="layout-flex items-center justify-between gap-md wrap">
                  <div>
                    <span className="portal-eyebrow">Hevy Exercise Catalog + 3D Biomechanics</span>
                    <h2 style={{ margin: '0.2rem 0' }}>
                      Exercise Library ({filteredExercises.length} of {allExercises.length})
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="button button--primary button--sm"
                    onClick={() => setShowCustomExerciseModal(true)}
                  >
                    + Create Custom Exercise
                  </button>
                </div>

                <div
                  style={{
                    marginTop: '0.85rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.65rem',
                  }}
                >
                  <input
                    type="search"
                    placeholder="Search exercise name, muscle, or equipment..."
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'inherit',
                      fontSize: '0.85rem',
                    }}
                  />

                  <select
                    aria-label="Filter by muscle group"
                    value={muscleFilter}
                    onChange={(e) => setMuscleFilter(e.target.value as MuscleGroupId | 'all')}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'inherit',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="all">All Muscle Groups</option>
                    {(Object.keys(MUSCLE_GROUP_META) as MuscleGroupId[]).map((m) => (
                      <option key={m} value={m}>
                        {MUSCLE_GROUP_META[m].label}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter by equipment"
                    value={equipmentFilter}
                    onChange={(e) => setEquipmentFilter(e.target.value as EquipmentType | 'all')}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'inherit',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="all">All Equipment</option>
                    {(Object.keys(EQUIPMENT_LABELS) as EquipmentType[]).map((eq) => (
                      <option key={eq} value={eq}>
                        {EQUIPMENT_LABELS[eq]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Exercise Inspector Card */}
              {selectedExercise && (
                <article
                  className="sp-card"
                  style={{
                    padding: '1.25rem',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                  }}
                >
                  <div className="layout-flex items-center justify-between gap-md wrap">
                    <div>
                      <div className="cluster gap-xs">
                        <span className="ui-badge ui-badge--sm">
                          {EQUIPMENT_LABELS[selectedExercise.equipment]}
                        </span>
                        {selectedExercise.primaryMuscles.map((m) => (
                          <span
                            key={m}
                            className="ui-badge ui-badge--sm"
                            style={{
                              background: 'rgba(244, 63, 94, 0.16)',
                              color: '#fda4af',
                            }}
                          >
                            {MUSCLE_GROUP_META[m]?.label}
                          </span>
                        ))}
                        <span className="ui-badge ui-badge--sm">
                          MET {selectedExercise.metValue}
                        </span>
                      </div>
                      <h3 style={{ margin: '0.4rem 0 0.15rem', fontSize: '1.25rem' }}>
                        {selectedExercise.name}
                      </h3>
                    </div>

                    <div className="cluster gap-xs">
                      {(['summary', 'history', 'progression'] as const).map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          className={`button button--sm ${
                            exerciseDetailSubtab === sub ? 'button--primary' : 'button--secondary'
                          }`}
                          onClick={() => setExerciseDetailSubtab(sub)}
                        >
                          {sub === 'summary'
                            ? 'Form & Records'
                            : sub === 'history'
                              ? `History (${selectedExerciseSessions.length})`
                              : '1RM & Progression'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {exerciseDetailSubtab === 'summary' && (
                    <div className="layout-grid gap-md" style={{ marginTop: '0.9rem' }}>
                      {/* Personal Records Strip */}
                      <dl className="rail-stats">
                        <div className="rail-stat">
                          <dt>Heaviest Weight</dt>
                          <dd>
                            {selectedExerciseRecords.heaviestWeight > 0
                              ? `${formatWeight(selectedExerciseRecords.heaviestWeight)} ${weightLabel}`
                              : '—'}
                          </dd>
                        </div>
                        <div className="rail-stat">
                          <dt>Best Est. 1RM</dt>
                          <dd>
                            {selectedExerciseRecords.best1RM > 0
                              ? `${formatWeight(selectedExerciseRecords.best1RM)} ${weightLabel}`
                              : '—'}
                          </dd>
                        </div>
                        <div className="rail-stat">
                          <dt>Best Set</dt>
                          <dd style={{ fontSize: '0.9rem' }}>{selectedExerciseRecords.bestSetLabel}</dd>
                        </div>
                      </dl>

                      {/* Step-by-Step Biomechanical Instructions */}
                      <div>
                        <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.9rem' }}>
                          Execution &amp; Biomechanical Form Cues
                        </h4>
                        <ol
                          style={{
                            margin: 0,
                            paddingLeft: '1.2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                            fontSize: '0.84rem',
                            color: '#cbd5e1',
                          }}
                        >
                          {selectedExercise.instructions.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}

                  {exerciseDetailSubtab === 'history' && (
                    <div className="layout-grid gap-sm" style={{ marginTop: '0.9rem' }}>
                      {selectedExerciseSessions.length === 0 ? (
                        <p className="margin-none text-muted font-sm">
                          No logged sessions for {selectedExercise.name} yet.
                        </p>
                      ) : (
                        selectedExerciseSessions.map((sess) => (
                          <div
                            key={sess.workoutId}
                            style={{
                              background: 'rgba(15, 23, 42, 0.5)',
                              border: '1px solid rgba(148, 163, 184, 0.16)',
                              borderRadius: '8px',
                              padding: '0.75rem',
                            }}
                          >
                            <div className="layout-flex items-center justify-between gap-sm">
                              <strong className="font-sm">{sess.workoutTitle}</strong>
                              <span className="font-xs text-muted">{formatDateShort(sess.date)}</span>
                            </div>
                            <div className="cluster gap-sm" style={{ marginTop: '0.4rem' }}>
                              {sess.sets.map((s, idx) => (
                                <span key={s.id} className="ui-badge ui-badge--sm">
                                  Set {idx + 1}: {formatWeight(s.weight)} {weightLabel} × {s.reps}
                                  {s.rpe ? ` @RPE ${s.rpe}` : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {exerciseDetailSubtab === 'progression' && (
                    <div className="layout-grid gap-md" style={{ marginTop: '0.9rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>
                          Estimated 1RM &amp; Percentage Loading Table
                        </h4>
                        {selectedExerciseRecords.best1RM > 0 ? (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
                              gap: '0.5rem',
                            }}
                          >
                            {[
                              { pct: 100, reps: '1 RM' },
                              { pct: 95, reps: '~2 Reps' },
                              { pct: 90, reps: '~3–4 Reps' },
                              { pct: 85, reps: '~5–6 Reps' },
                              { pct: 80, reps: '~7–8 Reps' },
                              { pct: 75, reps: '~10 Reps' },
                              { pct: 70, reps: '~12 Reps' },
                              { pct: 65, reps: '~15 Reps' },
                            ].map((row) => (
                              <div
                                key={row.pct}
                                style={{
                                  background: 'rgba(15, 23, 42, 0.55)',
                                  border: '1px solid rgba(148, 163, 184, 0.16)',
                                  borderRadius: '8px',
                                  padding: '0.5rem',
                                  textAlign: 'center',
                                }}
                              >
                                <div className="font-xs text-muted">
                                  {row.pct}% ({row.reps})
                                </div>
                                <strong style={{ fontSize: '0.95rem', color: '#38bdf8' }}>
                                  {formatWeight(Math.round((selectedExerciseRecords.best1RM * row.pct) / 100))}{' '}
                                  {weightLabel}
                                </strong>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="margin-none text-muted font-sm">
                            Complete a working set of {selectedExercise.name} to unlock 1RM percentage targets.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              )}

              {/* Scrollable Exercise Catalog Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {filteredExercises.map((ex) => {
                  const isSelected = ex.id === selectedExerciseId;
                  const rec = getExerciseRecords(ex.id);
                  return (
                    <div
                      key={ex.id}
                      onClick={() => setSelectedExerciseId(ex.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedExerciseId(ex.id);
                      }}
                      className="sp-card"
                      style={{
                        padding: '0.9rem 1rem',
                        cursor: 'pointer',
                        border: isSelected
                          ? '1px solid #f43f5e'
                          : '1px solid rgba(148, 163, 184, 0.15)',
                        background: isSelected ? 'rgba(244, 63, 94, 0.08)' : undefined,
                      }}
                    >
                      <div className="layout-flex items-center justify-between gap-xs">
                        <span className="ui-badge ui-badge--sm">{EQUIPMENT_LABELS[ex.equipment]}</span>
                        {rec.best1RM > 0 && (
                          <span className="font-xs" style={{ color: '#38bdf8', fontWeight: 600 }}>
                            1RM: {formatWeight(rec.best1RM)} {weightLabel}
                          </span>
                        )}
                      </div>
                      <h4 style={{ margin: '0.45rem 0 0.25rem', fontSize: '0.96rem' }}>{ex.name}</h4>
                      <div className="cluster gap-xs">
                        {ex.primaryMuscles.map((m) => (
                          <span
                            key={m}
                            style={{
                              fontSize: '0.7rem',
                              color: '#fda4af',
                              background: 'rgba(244, 63, 94, 0.15)',
                              padding: '1px 7px',
                              borderRadius: '999px',
                            }}
                          >
                            {MUSCLE_GROUP_META[m]?.label}
                          </span>
                        ))}
                        {ex.secondaryMuscles.slice(0, 2).map((m) => (
                          <span
                            key={m}
                            style={{
                              fontSize: '0.68rem',
                              color: '#94a3b8',
                              background: 'rgba(148, 163, 184, 0.12)',
                              padding: '1px 6px',
                              borderRadius: '999px',
                            }}
                          >
                            {MUSCLE_GROUP_META[m]?.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== TAB 4: PHYSICAL EXERTION & RECOVERY ==================== */}
          {activeTab === 'exertion' && (
            <div className="layout-grid gap-lg">
              {/* Exertion Summary KPI Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                <div className="sp-card" style={{ padding: '1rem' }}>
                  <span className="font-xs text-muted">Total Exertion Load (sRPE)</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                    {analyticsSummary.totalExertion.toLocaleString()} AU
                  </div>
                  <span className="font-xs text-muted">Optimal Acute Strain Zone</span>
                </div>
                <div className="sp-card" style={{ padding: '1rem' }}>
                  <span className="font-xs text-muted">Average Session RPE</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                    RPE {analyticsSummary.avgRpe}
                  </div>
                  <span className="font-xs text-muted">~1.5–2 Reps in Reserve</span>
                </div>
                <div className="sp-card" style={{ padding: '1rem' }}>
                  <span className="font-xs text-muted">Cumulative Volume</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                    {formatWeight(analyticsSummary.totalVol).toLocaleString()} {weightLabel}
                  </div>
                  <span className="font-xs text-muted">Across {analyticsSummary.totalWorkouts} sessions</span>
                </div>
                <div className="sp-card" style={{ padding: '1rem' }}>
                  <span className="font-xs text-muted">Est. Metabolic Expenditure</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e', marginTop: '4px' }}>
                    {analyticsSummary.totalCalories.toLocaleString()} kcal
                  </div>
                  <span className="font-xs text-muted">MET × RPE Adjusted</span>
                </div>
              </div>

              {/* Muscle Recovery Breakdown Grid (Synchronized with 3D Recovery Avatar) */}
              <div className="sp-card" style={{ padding: '1.25rem' }}>
                <div className="layout-flex items-center justify-between gap-md wrap">
                  <div>
                    <span className="portal-eyebrow">72-Hour Rolling Muscle Recovery</span>
                    <h3 style={{ margin: '0.2rem 0' }}>Anatomical Fatigue &amp; Readiness</h3>
                    <p className="margin-none text-muted font-xs">
                      Click any muscle group to highlight it on the 3D Avatar and inspect weekly sets, volume, and recovery countdown.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '0.7rem',
                  }}
                >
                  {(Object.keys(MUSCLE_GROUP_META) as MuscleGroupId[]).map((m) => {
                    const st = fatigueMap[m];
                    const meta = MUSCLE_GROUP_META[m];
                    const barColor =
                      st.status === 'fatigued'
                        ? '#ef4444'
                        : st.status === 'recovering'
                          ? '#f59e0b'
                          : '#10b981';

                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMuscleGroup(m === selectedMuscleGroup ? null : m)}
                        style={{
                          textAlign: 'left',
                          background:
                            selectedMuscleGroup === m
                              ? 'rgba(56, 189, 248, 0.14)'
                              : 'rgba(15, 23, 42, 0.55)',
                          border:
                            selectedMuscleGroup === m
                              ? '1px solid #38bdf8'
                              : '1px solid rgba(148, 163, 184, 0.16)',
                          borderRadius: '10px',
                          padding: '0.75rem',
                          color: 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="layout-flex items-center justify-between gap-xs">
                          <strong className="font-sm">{meta.label}</strong>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: barColor,
                            }}
                          >
                            {st.recoveryPct}% Ready
                          </span>
                        </div>
                        <span className="font-xs text-muted" style={{ display: 'block', marginTop: '2px' }}>
                          {meta.anatomicalName}
                        </span>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            background: 'rgba(148, 163, 184, 0.18)',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            margin: '0.5rem 0',
                          }}
                        >
                          <div
                            style={{
                              width: `${st.recoveryPct}%`,
                              height: '100%',
                              background: barColor,
                            }}
                          />
                        </div>
                        <div className="layout-flex items-center justify-between font-xs text-muted">
                          <span>{st.weeklySets} sets / wk</span>
                          <span>
                            {st.hoursUntilFresh > 0 ? `~${st.hoursUntilFresh}h to fresh` : 'Fresh now'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Body Measurements & Biometrics Logger */}
              <div className="sp-card" style={{ padding: '1.25rem' }}>
                <span className="portal-eyebrow">Body Biometrics &amp; Recovery</span>
                <h3 style={{ margin: '0.2rem 0 0.75rem' }}>Bodyweight, Body Fat &amp; Resting HR</h3>
                <form
                  onSubmit={handleLogMeasurementSubmit}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.65rem',
                    alignItems: 'end',
                    marginBottom: '1rem',
                  }}
                >
                  <label className="font-xs">
                    Bodyweight (lbs)
                    <input
                      type="number"
                      step="0.1"
                      value={measWeightLbs}
                      onChange={(e) => setMeasWeightLbs(e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.28)',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        color: 'inherit',
                      }}
                    />
                  </label>
                  <label className="font-xs">
                    Body Fat (%)
                    <input
                      type="number"
                      step="0.1"
                      value={measBodyFat}
                      onChange={(e) => setMeasBodyFat(e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.28)',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        color: 'inherit',
                      }}
                    />
                  </label>
                  <label className="font-xs">
                    Waist (in)
                    <input
                      type="number"
                      step="0.1"
                      value={measWaist}
                      onChange={(e) => setMeasWaist(e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.28)',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        color: 'inherit',
                      }}
                    />
                  </label>
                  <label className="font-xs">
                    Resting HR (bpm)
                    <input
                      type="number"
                      step="1"
                      value={measRestingHr}
                      onChange={(e) => setMeasRestingHr(e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.28)',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        color: 'inherit',
                      }}
                    />
                  </label>
                  <button type="submit" className="button button--primary button--sm">
                    Log Entry
                  </button>
                </form>

                <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto' }}>
                  {measurements.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        minWidth: '155px',
                        background: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.16)',
                        borderRadius: '8px',
                        padding: '0.65rem',
                      }}
                    >
                      <span className="font-xs text-muted">{m.date}</span>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px' }}>
                        {formatWeight(m.weightLbs)} {weightLabel}
                      </div>
                      <span className="font-xs text-muted">
                        {m.bodyFatPct ? `${m.bodyFatPct}% BF` : ''}
                        {m.restingHr ? ` · ${m.restingHr} bpm` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 5: WORKOUT HISTORY FEED ==================== */}
          {activeTab === 'history' && (
            <div className="layout-grid gap-lg">
              {workouts.map((workout) => (
                <article key={workout.id} className="sp-card" style={{ padding: '1.25rem' }}>
                  <div className="layout-flex items-center justify-between gap-md wrap">
                    <div>
                      <div className="cluster gap-xs">
                        <span className="font-xs text-muted">{formatDateShort(workout.endedAt)}</span>
                        <span className="ui-badge ui-badge--sm">
                          Session RPE {workout.sessionRpe}
                        </span>
                        <span
                          className="ui-badge ui-badge--sm"
                          style={{
                            background: 'rgba(56, 189, 248, 0.15)',
                            color: '#38bdf8',
                          }}
                        >
                          Exertion: {workout.exertionLoadAU} AU
                        </span>
                        {workout.prCount > 0 && (
                          <span
                            className="ui-badge ui-badge--sm"
                            style={{
                              background: 'rgba(234, 179, 8, 0.2)',
                              color: '#facc15',
                            }}
                          >
                            🏆 {workout.prCount} PR{workout.prCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <h3 style={{ margin: '0.35rem 0 0.2rem' }}>{workout.title}</h3>
                      {workout.notes && (
                        <p className="margin-none text-muted font-sm">{workout.notes}</p>
                      )}
                    </div>

                    <div className="cluster gap-xs">
                      <button
                        type="button"
                        className="button button--primary button--sm"
                        onClick={() => handleRepeatWorkout(workout)}
                      >
                        Repeat Workout
                      </button>
                      <button
                        type="button"
                        className="button button--secondary button--sm"
                        onClick={() => handleSaveWorkoutAsRoutine(workout)}
                      >
                        Save as Routine
                      </button>
                      <button
                        type="button"
                        className="button button--tertiary button--sm"
                        onClick={() => deleteWorkout(workout.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Stats row */}
                  <dl className="rail-stats" style={{ marginTop: '0.85rem' }}>
                    <div className="rail-stat">
                      <dt>Duration</dt>
                      <dd>{Math.round(workout.durationSeconds / 60)} min</dd>
                    </div>
                    <div className="rail-stat">
                      <dt>Volume</dt>
                      <dd>
                        {formatWeight(workout.totalVolumeLbs).toLocaleString()} {weightLabel}
                      </dd>
                    </div>
                    <div className="rail-stat">
                      <dt>Calories</dt>
                      <dd>{workout.estimatedCalories} kcal</dd>
                    </div>
                  </dl>

                  {/* Exercise list inside workout card */}
                  <div
                    style={{
                      marginTop: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                    }}
                  >
                    {workout.exercises.map((entry) => {
                      const ex = exerciseMap.get(entry.exerciseId);
                      const completed = entry.sets.filter((s) => s.completed);
                      const bestSet = completed.reduce<WorkoutSet | null>((best, cur) => {
                        if (!best) return cur;
                        return cur.weight * cur.reps > best.weight * best.reps ? cur : best;
                      }, null);

                      return (
                        <div
                          key={entry.id}
                          onClick={() => {
                            setSelectedExerciseId(entry.exerciseId);
                            if (bestSet) {
                              setAvatarWeightLbs(bestSet.weight);
                              setAvatarRpe(bestSet.rpe || workout.sessionRpe);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setSelectedExerciseId(entry.exerciseId);
                          }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: 'rgba(15, 23, 42, 0.45)',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                          }}
                        >
                          <span>
                            <strong>{completed.length} × </strong>
                            <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                              {ex?.name || entry.exerciseId}
                            </span>
                          </span>
                          <span className="text-muted font-xs">
                            Best set:{' '}
                            {bestSet
                              ? `${formatWeight(bestSet.weight)} ${weightLabel} × ${bestSet.reps}${
                                  bestSet.rpe ? ` @RPE ${bestSet.rpe}` : ''
                                }`
                              : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ==================== RIGHT RAIL: 3D AVATAR & EXERTION INSPECTOR ==================== */}
        <aside className="portal-rail" aria-label="3D Exercise Avatar and Exertion">
          <div style={{ position: 'sticky', top: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <GymAvatar3D
              exercise={selectedExercise}
              activeWeightLbs={avatarWeightLbs}
              activeRpe={avatarRpe}
              mode={activeTab === 'exertion' ? 'recovery' : 'exercise'}
              fatigueMap={fatigueMap}
              selectedMuscle={selectedMuscleGroup}
              onSelectMuscle={(m) => {
                setSelectedMuscleGroup(m === selectedMuscleGroup ? null : m);
              }}
            />

            {/* Quick Exercise Switcher for the 3D Avatar */}
            <article className="sp-card" style={{ padding: '1rem' }}>
              <div className="layout-flex items-center justify-between gap-sm">
                <span className="font-xs weight-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>
                  Inspect Exercise in 3D
                </span>
                <span className="font-xs text-muted">
                  {selectedExercise?.movementPattern.replace(/_/g, ' ')}
                </span>
              </div>

              <select
                aria-label="Select exercise to visualize on 3D avatar"
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: 'inherit',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                {allExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({EQUIPMENT_LABELS[ex.equipment]})
                  </option>
                ))}
              </select>

              {/* Interactive Load & RPE Sliders for 3D Preview */}
              <div className="layout-grid gap-sm" style={{ marginTop: '0.75rem' }}>
                <div>
                  <div className="layout-flex items-center justify-between font-xs">
                    <span className="text-muted">Simulated Load</span>
                    <strong className="text-strong">
                      {formatWeight(avatarWeightLbs)} {weightLabel}
                    </strong>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={495}
                    step={5}
                    value={avatarWeightLbs}
                    onChange={(e) => setAvatarWeightLbs(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div className="layout-flex items-center justify-between font-xs">
                    <span className="text-muted">Perceived Exertion (RPE)</span>
                    <strong style={{ color: RPE_SCALE_INFO[avatarRpe]?.color || '#eab308' }}>
                      RPE {avatarRpe} ({RPE_SCALE_INFO[avatarRpe]?.rir || '2 RIR'})
                    </strong>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={10}
                    step={0.5}
                    value={avatarRpe}
                    onChange={(e) => setAvatarRpe(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <span className="font-xs text-muted" style={{ display: 'block', marginTop: '2px' }}>
                    {RPE_SCALE_INFO[avatarRpe]?.description}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </aside>
      </div>

      {/* ==================== MODAL 1: EXERCISE PICKER ==================== */}
      {showExercisePicker && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add Exercise"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="sp-card"
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
              gap: '0.85rem',
            }}
          >
            <div className="layout-flex items-center justify-between">
              <h3 className="margin-none">Select Exercise ({filteredExercises.length})</h3>
              <button
                type="button"
                className="button button--tertiary button--sm"
                onClick={() => setShowExercisePicker(false)}
              >
                Close
              </button>
            </div>

            <div className="layout-flex gap-sm wrap">
              <input
                type="search"
                placeholder="Search 85+ Hevy exercises..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'inherit',
                }}
              />
              <select
                value={muscleFilter}
                onChange={(e) => setMuscleFilter(e.target.value as MuscleGroupId | 'all')}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: 'inherit',
                }}
              >
                <option value="all">All Muscles</option>
                {(Object.keys(MUSCLE_GROUP_META) as MuscleGroupId[]).map((m) => (
                  <option key={m} value={m}>
                    {MUSCLE_GROUP_META[m].label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(148, 163, 184, 0.16)',
                  }}
                >
                  <div>
                    <strong className="font-sm">{ex.name}</strong>
                    <div className="font-xs text-muted">
                      {EQUIPMENT_LABELS[ex.equipment]} ·{' '}
                      {ex.primaryMuscles.map((m) => MUSCLE_GROUP_META[m]?.label).join(', ')}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button button--primary button--sm"
                    onClick={() => handlePickExercise(ex)}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: FINISH WORKOUT & EXERTION CHECK-IN ==================== */}
      {showFinishModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Finish Workout & Exertion Check-in"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.82)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="sp-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div>
              <span className="portal-eyebrow">Post-Workout Exertion Check-In</span>
              <h3 style={{ margin: '0.2rem 0' }}>Save Workout: {workoutTitle}</h3>
              <p className="margin-none text-muted font-xs">
                Rate your overall Session RPE and Perceived Fatigue to calculate your Acute Exertion Load (sRPE × Duration) and update your 3D Muscle Recovery Avatar.
              </p>
            </div>

            <dl className="rail-stats">
              <div className="rail-stat">
                <dt>Volume</dt>
                <dd>
                  {formatWeight(liveWorkoutMetrics.totalVolumeLbs).toLocaleString()} {weightLabel}
                </dd>
              </div>
              <div className="rail-stat">
                <dt>Exertion Load</dt>
                <dd>{liveWorkoutMetrics.exertionLoadAU} AU</dd>
              </div>
              <div className="rail-stat">
                <dt>Est. Burn</dt>
                <dd>{liveWorkoutMetrics.estimatedCalories} kcal</dd>
              </div>
            </dl>

            <div className="layout-grid gap-sm">
              <label className="font-sm weight-semibold">
                Session RPE (Overall Physical Exertion: {sessionRpe} / 10)
                <input
                  type="range"
                  min={5}
                  max={10}
                  step={0.5}
                  value={sessionRpe}
                  onChange={(e) => setSessionRpe(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: '6px' }}
                />
                <span className="font-xs text-muted" style={{ display: 'block', fontWeight: 400 }}>
                  {RPE_SCALE_INFO[sessionRpe]?.description || 'Moderate to hard session exertion'}
                </span>
              </label>

              <label className="font-sm weight-semibold">
                Post-Workout Muscular Fatigue ({perceivedFatigue} / 10)
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={perceivedFatigue}
                  onChange={(e) => setPerceivedFatigue(parseInt(e.target.value, 10))}
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </label>

              <label className="font-sm weight-semibold">
                Pre-Workout Readiness / Energy ({preWorkoutReadiness} / 10)
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={preWorkoutReadiness}
                  onChange={(e) => setPreWorkoutReadiness(parseInt(e.target.value, 10))}
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </label>

              <label className="font-sm weight-semibold">
                Session Notes
                <textarea
                  rows={3}
                  placeholder="How did the weights move? Any joint soreness or PR notes?"
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: 'inherit',
                  }}
                />
              </label>
            </div>

            <div className="layout-flex items-center justify-end gap-sm">
              <button
                type="button"
                className="button button--secondary button--md"
                onClick={() => setShowFinishModal(false)}
              >
                Keep Logging
              </button>
              <button
                type="button"
                className="button button--primary button--md"
                onClick={handleFinishWorkoutConfirm}
              >
                Save Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3: BARBELL PLATE CALCULATOR ==================== */}
      {plateCalcWeight !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Barbell Plate Calculator"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div className="sp-card" style={{ width: '100%', maxWidth: '420px', padding: '1.35rem' }}>
            <div className="layout-flex items-center justify-between">
              <h3 className="margin-none">Barbell Plate Calculator ({plateCalcWeight} lbs)</h3>
              <button
                type="button"
                className="button button--tertiary button--sm"
                onClick={() => setPlateCalcWeight(null)}
              >
                Close
              </button>
            </div>
            <p className="font-xs text-muted" style={{ margin: '0.4rem 0 0.85rem' }}>
              Standard 45 lb Olympic Barbell — Load the following plates on <strong>each side</strong>:
            </p>
            <div className="cluster gap-sm">
              {calculatePlateBreakdown(plateCalcWeight, 45).perSide.length === 0 ? (
                <span className="font-sm">Empty 45 lb Barbell</span>
              ) : (
                calculatePlateBreakdown(plateCalcWeight, 45).perSide.map((p) => (
                  <div
                    key={p.plate}
                    style={{
                      background: 'rgba(56, 189, 248, 0.16)',
                      border: '1px solid #38bdf8',
                      borderRadius: '10px',
                      padding: '0.6rem 0.9rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                      {p.count} × {p.plate} lb
                    </div>
                    <span className="font-xs text-muted">per side</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 4: CREATE CUSTOM EXERCISE ==================== */}
      {showCustomExerciseModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create Custom Exercise"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.82)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <form
            onSubmit={handleCreateCustomExerciseSubmit}
            className="sp-card"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '1.4rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div className="layout-flex items-center justify-between">
              <h3 className="margin-none">Create Custom Exercise</h3>
              <button
                type="button"
                className="button button--tertiary button--sm"
                onClick={() => setShowCustomExerciseModal(false)}
              >
                Close
              </button>
            </div>

            <label className="font-xs weight-semibold">
              Exercise Name
              <input
                type="text"
                required
                placeholder="e.g., Vikings Press, Jefferson Squat, Zercher Carry..."
                value={customExName}
                onChange={(e) => setCustomExName(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: 'inherit',
                }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <label className="font-xs weight-semibold">
                Equipment
                <select
                  value={customExEquipment}
                  onChange={(e) => setCustomExEquipment(e.target.value as EquipmentType)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'inherit',
                  }}
                >
                  {(Object.keys(EQUIPMENT_LABELS) as EquipmentType[]).map((eq) => (
                    <option key={eq} value={eq}>
                      {EQUIPMENT_LABELS[eq]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="font-xs weight-semibold">
                3D Avatar Movement Pattern
                <select
                  value={customExPattern}
                  onChange={(e) => setCustomExPattern(e.target.value as MovementPattern)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'inherit',
                  }}
                >
                  <option value="squat">Squat Pattern</option>
                  <option value="hinge">Deadlift / Hip Hinge</option>
                  <option value="bench_press">Horizontal Bench Press</option>
                  <option value="incline_press">Incline Press</option>
                  <option value="overhead_press">Overhead Vertical Press</option>
                  <option value="vertical_pull">Pull-Up / Lat Pulldown</option>
                  <option value="horizontal_row">Row Pattern</option>
                  <option value="bicep_curl">Arm Curl</option>
                  <option value="tricep_extension">Tricep Extension</option>
                  <option value="lateral_raise">Shoulder Raise</option>
                  <option value="lunge">Split Squat / Lunge</option>
                  <option value="hip_thrust">Hip Thrust</option>
                  <option value="kettlebell_swing">Kettlebell Swing</option>
                </select>
              </label>

              <label className="font-xs weight-semibold">
                Primary Muscle
                <select
                  value={customExPrimary}
                  onChange={(e) => setCustomExPrimary(e.target.value as MuscleGroupId)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'inherit',
                  }}
                >
                  {(Object.keys(MUSCLE_GROUP_META) as MuscleGroupId[]).map((m) => (
                    <option key={m} value={m}>
                      {MUSCLE_GROUP_META[m].label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="font-xs weight-semibold">
                Secondary Muscle
                <select
                  value={customExSecondary}
                  onChange={(e) => setCustomExSecondary(e.target.value as MuscleGroupId)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'inherit',
                  }}
                >
                  {(Object.keys(MUSCLE_GROUP_META) as MuscleGroupId[]).map((m) => (
                    <option key={m} value={m}>
                      {MUSCLE_GROUP_META[m].label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="font-xs weight-semibold">
              Form Cues (one per line)
              <textarea
                rows={3}
                placeholder="Keep core braced&#10;Control the eccentric for 2 seconds"
                value={customExInstructions}
                onChange={(e) => setCustomExInstructions(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: 'inherit',
                }}
              />
            </label>

            <div className="layout-flex justify-end gap-sm">
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => setShowCustomExerciseModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="button button--primary button--sm">
                Save Custom Exercise
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL 5: CREATE NEW ROUTINE ==================== */}
      {showRoutineModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create Routine"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.82)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <form
            onSubmit={handleCreateRoutineSubmit}
            className="sp-card"
            style={{
              width: '100%',
              maxWidth: '580px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '1.4rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div className="layout-flex items-center justify-between">
              <h3 className="margin-none">Create Workout Routine</h3>
              <button
                type="button"
                className="button button--tertiary button--sm"
                onClick={() => setShowRoutineModal(false)}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.65rem' }}>
              <label className="font-xs weight-semibold">
                Routine Name
                <input
                  type="text"
                  required
                  placeholder="e.g., Hypertrophy Upper A"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: 'inherit',
                  }}
                />
              </label>
              <label className="font-xs weight-semibold">
                Folder
                <input
                  type="text"
                  value={newRoutineFolder}
                  onChange={(e) => setNewRoutineFolder(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: 'inherit',
                  }}
                />
              </label>
            </div>

            <label className="font-xs weight-semibold">
              Description
              <input
                type="text"
                placeholder="Focus areas, target RPE, or progression notes..."
                value={newRoutineDescription}
                onChange={(e) => setNewRoutineDescription(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: 'inherit',
                }}
              />
            </label>

            <div>
              <div className="layout-flex items-center justify-between">
                <span className="font-xs weight-semibold">
                  Routine Exercises ({newRoutineExercises.length})
                </span>
                <button
                  type="button"
                  className="button button--secondary button--sm"
                  onClick={() => {
                    setPickerTarget('routine');
                    setShowExercisePicker(true);
                  }}
                >
                  + Add Exercise to Routine
                </button>
              </div>
              <div className="layout-grid gap-xs" style={{ marginTop: '0.5rem' }}>
                {newRoutineExercises.map((re, i) => {
                  const ex = exerciseMap.get(re.exerciseId);
                  return (
                    <div
                      key={re.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.5)',
                      }}
                    >
                      <span className="font-sm">
                        {i + 1}. <strong>{ex?.name || re.exerciseId}</strong> ({re.sets.length} sets)
                      </span>
                      <button
                        type="button"
                        className="button button--tertiary button--sm"
                        onClick={() =>
                          setNewRoutineExercises((prev) => prev.filter((item) => item.id !== re.id))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="layout-flex justify-end gap-sm">
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => setShowRoutineModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="button button--primary button--sm">
                Save Routine
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
