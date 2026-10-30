'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CRONOMETER_FOOD_DB,
  CRONOMETER_EXERCISE_DB,
  NUTRIENT_DEFINITIONS,
  calculateFoodNutrients,
  calculateExerciseExpenditure,
  type FoodItem,
  type ExerciseItem,
  type ExerciseIntensity,
  type HeartRateZone,
  type NutrientMap,
} from '@/lib/nutritionDatabase';

export const STORAGE_NUTRITION_FEATURE_ENABLED = 'skillprint_nutrition_tracker_enabled';
export const EVENT_NUTRITION_FEATURE_CHANGED = 'skillprint-nutrition-feature-change';
const STORAGE_NUTRITION_LOGS = 'skillprint_cronometer_logs_v1';
const STORAGE_NUTRITION_PROFILE = 'skillprint_cronometer_profile_v1';
const STORAGE_CUSTOM_FOODS = 'skillprint_cronometer_custom_foods_v1';
const STORAGE_CUSTOM_EXERCISES = 'skillprint_cronometer_custom_exercises_v1';

export type MealGroup = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export const MEAL_GROUP_LABELS: Record<MealGroup, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks & Supplements',
};

export type FatigueStatus = 'fresh' | 'normal' | 'fatigued' | 'exhausted';

export type BiometricType =
  | 'weight'
  | 'bodyFat'
  | 'restingHR'
  | 'sleepHours'
  | 'readinessScore'
  | 'bloodGlucose'
  | 'systolicBP';

export const BIOMETRIC_DEFINITIONS: Record<
  BiometricType,
  { label: string; unit: string; defaultVal: number; min: number; max: number; step: number }
> = {
  weight: { label: 'Body Weight', unit: 'kg', defaultVal: 74.5, min: 30, max: 250, step: 0.1 },
  bodyFat: { label: 'Body Fat %', unit: '%', defaultVal: 14.8, min: 3, max: 60, step: 0.1 },
  restingHR: { label: 'Resting Heart Rate', unit: 'bpm', defaultVal: 54, min: 35, max: 120, step: 1 },
  sleepHours: { label: 'Sleep Duration', unit: 'hrs', defaultVal: 7.8, min: 1, max: 14, step: 0.1 },
  readinessScore: { label: 'Physical Readiness', unit: '/100', defaultVal: 84, min: 1, max: 100, step: 1 },
  bloodGlucose: { label: 'Fasting Glucose', unit: 'mg/dL', defaultVal: 86, min: 50, max: 250, step: 1 },
  systolicBP: { label: 'Systolic Blood Pressure', unit: 'mmHg', defaultVal: 116, min: 80, max: 200, step: 1 },
};

export interface DiaryFoodEntry {
  id: string;
  date: string;
  mealGroup: MealGroup;
  foodId: string;
  foodName: string;
  source: string;
  servingLabel: string;
  quantity: number;
  grams: number;
  nutrients: NutrientMap;
  timestamp: string;
}

export interface DiaryExerciseEntry {
  id: string;
  date: string;
  exerciseId: string;
  exerciseName: string;
  category: string;
  durationMinutes: number;
  intensity: ExerciseIntensity;
  rpe: number; // 1 - 10 Borg RPE
  hrZone: HeartRateZone;
  avgHeartRate?: number;
  sets?: number;
  reps?: number;
  loadKg?: number;
  distanceKm?: number;
  caloriesBurned: number;
  exertionLoad: number; // sRPE = duration * RPE (AU)
  strainScore: number; // 0 - 21 scale
  sweatLossMl: number;
  glycogenUsedG: number;
  sodiumLossMg: number;
  potassiumLossMg: number;
  magnesiumLossMg: number;
  tonnageKg: number;
  fatigueStatus: FatigueStatus;
  notes?: string;
  timestamp: string;
}

export interface DiaryBiometricEntry {
  id: string;
  date: string;
  type: BiometricType;
  label: string;
  value: number;
  unit: string;
  notes?: string;
  timestamp: string;
}

export interface DiaryNoteEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface NutritionDayLog {
  date: string; // YYYY-MM-DD
  foods: DiaryFoodEntry[];
  exercises: DiaryExerciseEntry[];
  biometrics: DiaryBiometricEntry[];
  notes: DiaryNoteEntry[];
  waterMl: number;
  isCompleted: boolean;
}

export type ActivityLevelKey =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'athlete';

export type WeightGoalKey =
  | 'lose_fast'
  | 'lose_moderate'
  | 'maintain'
  | 'gain_moderate'
  | 'gain_fast';

export type MacroPresetKey =
  | 'balanced'
  | 'athletic'
  | 'high_protein'
  | 'ketogenic'
  | 'endurance'
  | 'custom';

export interface NutritionProfileSettings {
  sex: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct: number;
  activityLevel: ActivityLevelKey;
  weightGoal: WeightGoalKey;
  includeExerciseInBudget: boolean;
  trackNetCarbs: boolean;
  macroPreset: MacroPresetKey;
  customTargets: Record<string, number>;
}

export const ACTIVITY_LEVEL_MULTIPLIERS: Record<
  ActivityLevelKey,
  { label: string; factor: number; description: string }
> = {
  sedentary: {
    label: 'Sedentary (Desk / Minimal Movement)',
    factor: 0.2,
    description: 'BMR × 0.2 baseline non-exercise activity thermogenesis (NEAT).',
  },
  lightly_active: {
    label: 'Lightly Active (Light Daily Walking)',
    factor: 0.375,
    description: 'BMR × 0.375 baseline daily movement (logged workouts added separately).',
  },
  moderately_active: {
    label: 'Moderately Active (Active Lifestyle)',
    factor: 0.5,
    description: 'BMR × 0.5 baseline daily movement.',
  },
  very_active: {
    label: 'Very Active (Physical Job / High NEAT)',
    factor: 0.725,
    description: 'BMR × 0.725 baseline daily movement.',
  },
  athlete: {
    label: 'Competitive Athlete (High Daily Turnover)',
    factor: 0.9,
    description: 'BMR × 0.9 baseline daily turnover.',
  },
};

export const WEIGHT_GOAL_ADJUSTMENTS: Record<
  WeightGoalKey,
  { label: string; kcalDelta: number }
> = {
  lose_fast: { label: 'Lose 0.5 kg / week (-500 kcal/day)', kcalDelta: -500 },
  lose_moderate: { label: 'Lose 0.25 kg / week (-250 kcal/day)', kcalDelta: -250 },
  maintain: { label: 'Maintain Weight (±0 kcal/day)', kcalDelta: 0 },
  gain_moderate: { label: 'Lean Gain +0.25 kg / week (+250 kcal/day)', kcalDelta: 250 },
  gain_fast: { label: 'Performance Bulk +0.5 kg / week (+500 kcal/day)', kcalDelta: 500 },
};

export const MACRO_PRESETS: Record<
  MacroPresetKey,
  { label: string; proteinPct: number; carbsPct: number; fatPct: number; description: string }
> = {
  balanced: {
    label: 'Cronometer Balanced (25P / 45C / 30F)',
    proteinPct: 25,
    carbsPct: 45,
    fatPct: 30,
    description: 'Standard evidence-based macronutrient distribution.',
  },
  athletic: {
    label: 'Athletic & Exertion Performance (30P / 45C / 25F)',
    proteinPct: 30,
    carbsPct: 45,
    fatPct: 25,
    description: 'Higher protein & glycogen support for regular resistance and cardio training.',
  },
  high_protein: {
    label: 'High Protein / Recomposition (35P / 35C / 30F)',
    proteinPct: 35,
    carbsPct: 35,
    fatPct: 30,
    description: 'Maximizes muscle protein synthesis and satiety.',
  },
  endurance: {
    label: 'Endurance / High Glycogen (20P / 55C / 25F)',
    proteinPct: 20,
    carbsPct: 55,
    fatPct: 25,
    description: 'Optimized for high-volume aerobic & glycolytic exertion.',
  },
  ketogenic: {
    label: 'Ketogenic / Low Carb (25P / 5C / 70F)',
    proteinPct: 25,
    carbsPct: 5,
    fatPct: 70,
    description: 'Very low net carbohydrate ketogenic metabolic profile.',
  },
  custom: {
    label: 'Custom Gram Targets',
    proteinPct: 30,
    carbsPct: 40,
    fatPct: 30,
    description: 'Manually configured daily gram targets.',
  },
};

export const DEFAULT_NUTRITION_PROFILE: NutritionProfileSettings = {
  sex: 'male',
  age: 31,
  heightCm: 178,
  weightKg: 74.5,
  bodyFatPct: 14.8,
  activityLevel: 'lightly_active',
  weightGoal: 'maintain',
  includeExerciseInBudget: true,
  trackNetCarbs: true,
  macroPreset: 'athletic',
  customTargets: {},
};

export function readNutritionFeatureEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_NUTRITION_FEATURE_ENABLED) === 'true';
  } catch {
    return false;
  }
}

export function useNutritionFeatureFlag() {
  // Defaulted to OFF (false) until enabled in Settings
  const [nutritionFeatureEnabled, setNutritionFeatureEnabledState] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setNutritionFeatureEnabledState(readNutritionFeatureEnabled());

    const handleSync = () => {
      setNutritionFeatureEnabledState(readNutritionFeatureEnabled());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener(EVENT_NUTRITION_FEATURE_CHANGED, handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener(EVENT_NUTRITION_FEATURE_CHANGED, handleSync);
    };
  }, []);

  const setNutritionFeatureEnabled = useCallback((enabled: boolean) => {
    setNutritionFeatureEnabledState(enabled);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_NUTRITION_FEATURE_ENABLED, String(enabled));
        window.dispatchEvent(new CustomEvent(EVENT_NUTRITION_FEATURE_CHANGED, { detail: enabled }));
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  return { nutritionFeatureEnabled, setNutritionFeatureEnabled };
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getRelativeDateKey(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return formatDateKey(d);
}

export function calculateBMR(profile: NutritionProfileSettings): number {
  // If bodyFatPct is available (> 0), blend Katch-McArdle (Lean Body Mass) & Mifflin-St Jeor
  const lbm = profile.weightKg * (1 - profile.bodyFatPct / 100);
  const katchBmr = 370 + 21.6 * lbm;
  const mifflinBmr =
    10 * profile.weightKg +
    6.25 * profile.heightCm -
    5 * profile.age +
    (profile.sex === 'male' ? 5 : -161);
  return Math.round((katchBmr + mifflinBmr) / 2);
}

/**
 * Generates 14 days of realistic Cronometer food, exercise exertion, hydration,
 * and biometric logs so that Trends and Today's Diary are rich immediately.
 */
function buildInitialSeedLogs(): Record<string, NutritionDayLog> {
  const logs: Record<string, NutritionDayLog> = {};
  const foodById = (id: string) =>
    CRONOMETER_FOOD_DB.find((f) => f.id === id) || CRONOMETER_FOOD_DB[0];
  const exById = (id: string) =>
    CRONOMETER_EXERCISE_DB.find((e) => e.id === id) || CRONOMETER_EXERCISE_DB[0];

  const makeFoodEntry = (
    date: string,
    mealGroup: MealGroup,
    foodId: string,
    servingLabel: string,
    quantity: number,
    idx: number
  ): DiaryFoodEntry => {
    const food = foodById(foodId);
    const { grams, nutrients } = calculateFoodNutrients(food, servingLabel, quantity);
    return {
      id: `seed-food-${date}-${idx}`,
      date,
      mealGroup,
      foodId: food.id,
      foodName: food.name,
      source: food.source,
      servingLabel,
      quantity,
      grams,
      nutrients,
      timestamp: `${date}T08:00:00.000Z`,
    };
  };

  const makeExerciseEntry = (
    date: string,
    exerciseId: string,
    durationMinutes: number,
    intensity: ExerciseIntensity,
    rpe: number,
    avgHeartRate: number,
    fatigueStatus: FatigueStatus,
    notes: string,
    extra?: { sets?: number; reps?: number; loadKg?: number; distanceKm?: number }
  ): DiaryExerciseEntry => {
    const exercise = exById(exerciseId);
    const calc = calculateExerciseExpenditure({
      exercise,
      durationMinutes,
      intensity,
      rpe,
      weightKg: 74.5,
      avgHeartRate,
      sets: extra?.sets,
      reps: extra?.reps,
      loadKg: extra?.loadKg,
      distanceKm: extra?.distanceKm,
    });
    return {
      id: `seed-ex-${date}-${exerciseId}`,
      date,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      durationMinutes,
      intensity,
      rpe,
      hrZone: calc.hrZone,
      avgHeartRate,
      sets: extra?.sets,
      reps: extra?.reps,
      loadKg: extra?.loadKg,
      distanceKm: extra?.distanceKm,
      caloriesBurned: calc.caloriesBurned,
      exertionLoad: calc.exertionLoad,
      strainScore: calc.strainScore,
      sweatLossMl: calc.sweatLossMl,
      glycogenUsedG: calc.glycogenUsedG,
      sodiumLossMg: calc.sodiumLossMg,
      potassiumLossMg: calc.potassiumLossMg,
      magnesiumLossMg: calc.magnesiumLossMg,
      tonnageKg: calc.tonnageKg,
      fatigueStatus,
      notes,
      timestamp: `${date}T17:30:00.000Z`,
    };
  };

  const workoutTemplates = [
    {
      exId: 'ex-strength-hypertrophy',
      dur: 55,
      int: 'vigorous' as ExerciseIntensity,
      rpe: 8,
      hr: 142,
      fatigue: 'normal' as FatigueStatus,
      notes: 'Upper body compound push/pull hypertrophy session. Strong mind-muscle connection.',
      extra: { sets: 18, reps: 10, loadKg: 65 },
    },
    {
      exId: 'ex-running-road',
      dur: 42,
      int: 'moderate' as ExerciseIntensity,
      rpe: 6,
      hr: 148,
      fatigue: 'fresh' as FatigueStatus,
      notes: 'Zone 2/3 aerobic tempo run outdoors. Nasal breathing first 25 mins.',
      extra: { distanceKm: 7.8 },
    },
    {
      exId: 'ex-hiit-circuit',
      dur: 35,
      int: 'vigorous' as ExerciseIntensity,
      rpe: 9,
      hr: 168,
      fatigue: 'fatigued' as FatigueStatus,
      notes: 'EMOM conditioning intervals + kettlebell complexes. High peak lactate effort.',
      extra: {},
    },
    {
      exId: 'ex-yoga-vinyasa',
      dur: 45,
      int: 'moderate' as ExerciseIntensity,
      rpe: 4,
      hr: 108,
      fatigue: 'fresh' as FatigueStatus,
      notes: 'Active recovery flow, thoracic mobility & hip opening.',
      extra: {},
    },
    {
      exId: 'ex-powerlifting-compound',
      dur: 65,
      int: 'vigorous' as ExerciseIntensity,
      rpe: 8.5,
      hr: 138,
      fatigue: 'fatigued' as FatigueStatus,
      notes: 'Lower body squat & Romanian deadlift working sets @ RPE 8.5.',
      extra: { sets: 16, reps: 6, loadKg: 110 },
    },
    {
      exId: 'ex-rowing-erg',
      dur: 38,
      int: 'vigorous' as ExerciseIntensity,
      rpe: 7.5,
      hr: 156,
      fatigue: 'normal' as FatigueStatus,
      notes: 'Concept2 4x2000m threshold intervals with 2m rest.',
      extra: { distanceKm: 8.0 },
    },
    {
      exId: 'ex-hiking-trail',
      dur: 70,
      int: 'moderate' as ExerciseIntensity,
      rpe: 5.5,
      hr: 132,
      fatigue: 'fresh' as FatigueStatus,
      notes: 'Trail endurance hike with 420m elevation gain.',
      extra: { distanceKm: 6.4 },
    },
  ];

  for (let offset = -13; offset <= 0; offset++) {
    const dateKey = getRelativeDateKey(offset);
    const dayIndex = Math.abs(offset);
    const isEven = dayIndex % 2 === 0;
    const isThird = dayIndex % 3 === 0;

    const foods: DiaryFoodEntry[] = [
      // Breakfast
      makeFoodEntry(dateKey, 'breakfast', 'nccdb-oats-rolled', '1/2 cup dry (40g)', isEven ? 1.5 : 1.25, 1),
      makeFoodEntry(dateKey, 'breakfast', 'nccdb-eggs-whole', '2 large eggs (100g)', isEven ? 1.5 : 1.0, 2),
      makeFoodEntry(dateKey, 'breakfast', 'nccdb-blueberries', '1 cup (148g)', 1, 3),
      makeFoodEntry(dateKey, 'breakfast', 'nccdb-coffee-brewed', '1 mug, 12 fl oz (355g)', 1, 4),

      // Lunch
      makeFoodEntry(
        dateKey,
        'lunch',
        isThird ? 'nccdb-beef-sirloin' : 'nccdb-chicken-breast',
        isThird ? '1 steak, 6 oz (170g)' : '1 breast (172g)',
        1,
        5
      ),
      makeFoodEntry(
        dateKey,
        'lunch',
        isEven ? 'nccdb-quinoa-cooked' : 'nccdb-brown-rice-cooked',
        isEven ? '1 cup cooked (185g)' : '1 cup cooked (195g)',
        1,
        6
      ),
      makeFoodEntry(dateKey, 'lunch', 'nccdb-spinach-cooked', '1 cup cooked (180g)', 1, 7),
      makeFoodEntry(dateKey, 'lunch', 'nccdb-avocado', '1/2 medium avocado (68g)', 1, 8),

      // Dinner
      makeFoodEntry(
        dateKey,
        'dinner',
        isEven ? 'nccdb-wild-salmon' : 'nccdb-chicken-breast',
        isEven ? '1 fillet (154g)' : '1 breast (172g)',
        1,
        9
      ),
      makeFoodEntry(dateKey, 'dinner', 'nccdb-sweet-potato', '1 medium (150g)', isEven ? 1.2 : 1.0, 10),
      makeFoodEntry(dateKey, 'dinner', 'nccdb-broccoli-steamed', '1 cup chopped (156g)', 1, 11),
      makeFoodEntry(dateKey, 'dinner', 'nccdb-olive-oil', '1 tbsp (13.5g)', 1, 12),

      // Snacks & Supplements
      makeFoodEntry(dateKey, 'snacks', 'nccdb-greek-yogurt-0', '1 cup (227g)', 1, 13),
      makeFoodEntry(
        dateKey,
        'snacks',
        isThird ? 'nccdb-pumpkin-seeds' : 'nccdb-almonds-raw',
        isThird ? '1 oz (28.3g)' : '1 oz / ~23 almonds (28.3g)',
        1,
        14
      ),
      makeFoodEntry(dateKey, 'snacks', 'crdb-whey-isolate', '1 scoop (31g)', 1, 15),
      makeFoodEntry(dateKey, 'snacks', 'crdb-electrolyte-mix', '1 packet in 500ml water (506g)', 1, 16),
    ];

    // Add kiwi or dark chocolate on alternating days
    if (isEven) {
      foods.push(makeFoodEntry(dateKey, 'snacks', 'usda-kiwi-green', '2 medium kiwis (148g)', 1, 17));
    } else {
      foods.push(makeFoodEntry(dateKey, 'snacks', 'crdb-dark-chocolate-85', '3 squares (30g)', 1, 17));
    }

    const wt = workoutTemplates[dayIndex % workoutTemplates.length];
    const exercises: DiaryExerciseEntry[] = [
      makeExerciseEntry(
        dateKey,
        wt.exId,
        wt.dur,
        wt.int,
        wt.rpe,
        wt.hr,
        wt.fatigue,
        wt.notes,
        wt.extra
      ),
    ];

    // On today (offset === 0), also add a morning mobility/walk session so multiple exertion entries are visible
    if (offset === 0) {
      exercises.push(
        makeExerciseEntry(
          dateKey,
          'ex-walking-brisk',
          25,
          'moderate',
          3,
          112,
          'fresh',
          'Morning sunlight walk before cognitive work.',
          { distanceKm: 2.4 }
        )
      );
    }

    const weightVal = Number((75.1 + offset * -0.05 + (isEven ? 0.1 : -0.1)).toFixed(1));
    const rhrVal = Math.round(54 + (wt.rpe >= 8 ? 2 : -1));
    const sleepVal = Number((7.6 + (isEven ? 0.4 : -0.2)).toFixed(1));
    const readinessVal = Math.min(96, Math.max(68, Math.round(86 - (wt.rpe - 6) * 3 + (isEven ? 3 : 0))));

    const biometrics: DiaryBiometricEntry[] = [
      {
        id: `seed-bio-weight-${dateKey}`,
        date: dateKey,
        type: 'weight',
        label: 'Body Weight',
        value: weightVal,
        unit: 'kg',
        timestamp: `${dateKey}T07:15:00.000Z`,
      },
      {
        id: `seed-bio-rhr-${dateKey}`,
        date: dateKey,
        type: 'restingHR',
        label: 'Resting Heart Rate',
        value: rhrVal,
        unit: 'bpm',
        timestamp: `${dateKey}T07:16:00.000Z`,
      },
      {
        id: `seed-bio-sleep-${dateKey}`,
        date: dateKey,
        type: 'sleepHours',
        label: 'Sleep Duration',
        value: sleepVal,
        unit: 'hrs',
        timestamp: `${dateKey}T07:17:00.000Z`,
      },
      {
        id: `seed-bio-readiness-${dateKey}`,
        date: dateKey,
        type: 'readinessScore',
        label: 'Physical Readiness',
        value: readinessVal,
        unit: '/100',
        timestamp: `${dateKey}T07:18:00.000Z`,
      },
    ];

    const notes: DiaryNoteEntry[] =
      offset === 0
        ? [
            {
              id: `seed-note-${dateKey}`,
              date: dateKey,
              title: 'Post-Training Cognitive & Electrolyte Check',
              content:
                'High mental clarity during afternoon focus sessions after replenishing 1000mg sodium + 500ml water post-lifting.',
              timestamp: `${dateKey}T14:20:00.000Z`,
            },
          ]
        : [];

    logs[dateKey] = {
      date: dateKey,
      foods,
      exercises,
      biometrics,
      notes,
      waterMl: isEven ? 1750 : 1500,
      isCompleted: offset < 0,
    };
  }

  return logs;
}

export function useNutritionTracker() {
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateKey(new Date()));
  const [logsByDate, setLogsByDate] = useState<Record<string, NutritionDayLog>>({});
  const [profile, setProfileState] = useState<NutritionProfileSettings>(DEFAULT_NUTRITION_PROFILE);
  const [customFoods, setCustomFoodsState] = useState<FoodItem[]>([]);
  const [customExercises, setCustomExercisesState] = useState<ExerciseItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load persisted data or initialize with 14-day seed logs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawLogs = localStorage.getItem(STORAGE_NUTRITION_LOGS);
      if (rawLogs) {
        const parsed = JSON.parse(rawLogs);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          setLogsByDate(parsed);
        } else {
          const seeded = buildInitialSeedLogs();
          setLogsByDate(seeded);
          localStorage.setItem(STORAGE_NUTRITION_LOGS, JSON.stringify(seeded));
        }
      } else {
        const seeded = buildInitialSeedLogs();
        setLogsByDate(seeded);
        localStorage.setItem(STORAGE_NUTRITION_LOGS, JSON.stringify(seeded));
      }

      const rawProfile = localStorage.getItem(STORAGE_NUTRITION_PROFILE);
      if (rawProfile) {
        setProfileState({ ...DEFAULT_NUTRITION_PROFILE, ...JSON.parse(rawProfile) });
      }

      const rawCustomFoods = localStorage.getItem(STORAGE_CUSTOM_FOODS);
      if (rawCustomFoods) {
        setCustomFoodsState(JSON.parse(rawCustomFoods));
      }

      const rawCustomExercises = localStorage.getItem(STORAGE_CUSTOM_EXERCISES);
      if (rawCustomExercises) {
        setCustomExercisesState(JSON.parse(rawCustomExercises));
      }
    } catch {
      const seeded = buildInitialSeedLogs();
      setLogsByDate(seeded);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const persistLogs = useCallback((next: Record<string, NutritionDayLog>) => {
    setLogsByDate(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_NUTRITION_LOGS, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
  }, []);

  const updateProfile = useCallback((patch: Partial<NutritionProfileSettings>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_NUTRITION_PROFILE, JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const allFoods = useMemo(() => [...customFoods, ...CRONOMETER_FOOD_DB], [customFoods]);
  const allExercises = useMemo(
    () => [...customExercises, ...CRONOMETER_EXERCISE_DB],
    [customExercises]
  );

  const currentDayLog: NutritionDayLog = useMemo(() => {
    return (
      logsByDate[selectedDate] || {
        date: selectedDate,
        foods: [],
        exercises: [],
        biometrics: [],
        notes: [],
        waterMl: 0,
        isCompleted: false,
      }
    );
  }, [logsByDate, selectedDate]);

  // Add Food Entry
  const addFoodToDiary = useCallback(
    (food: FoodItem, mealGroup: MealGroup, servingLabel: string, quantity: number) => {
      const { grams, nutrients } = calculateFoodNutrients(food, servingLabel, quantity);
      const entry: DiaryFoodEntry = {
        id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: selectedDate,
        mealGroup,
        foodId: food.id,
        foodName: food.name,
        source: food.source,
        servingLabel,
        quantity,
        grams,
        nutrients,
        timestamp: new Date().toISOString(),
      };
      const existing = logsByDate[selectedDate] || {
        date: selectedDate,
        foods: [],
        exercises: [],
        biometrics: [],
        notes: [],
        waterMl: 0,
        isCompleted: false,
      };
      persistLogs({
        ...logsByDate,
        [selectedDate]: {
          ...existing,
          foods: [...existing.foods, entry],
        },
      });
    },
    [logsByDate, persistLogs, selectedDate]
  );

  // Update Food Quantity / Serving in Diary
  const updateFoodEntry = useCallback(
    (entryId: string, servingLabel: string, quantity: number, mealGroup?: MealGroup) => {
      const existing = logsByDate[selectedDate];
      if (!existing) return;
      const updatedFoods = existing.foods.map((entry) => {
        if (entry.id !== entryId) return entry;
        const food = allFoods.find((f) => f.id === entry.foodId);
        if (!food) return entry;
        const { grams, nutrients } = calculateFoodNutrients(food, servingLabel, quantity);
        return {
          ...entry,
          servingLabel,
          quantity,
          grams,
          nutrients,
          mealGroup: mealGroup || entry.mealGroup,
        };
      });
      persistLogs({
        ...logsByDate,
        [selectedDate]: { ...existing, foods: updatedFoods },
      });
    },
    [allFoods, logsByDate, persistLogs, selectedDate]
  );

  const removeFoodEntry = useCallback(
    (entryId: string) => {
      const existing = logsByDate[selectedDate];
      if (!existing) return;
      persistLogs({
        ...logsByDate,
        [selectedDate]: {
          ...existing,
          foods: existing.foods.filter((f) => f.id !== entryId),
        },
      });
    },
    [logsByDate, persistLogs, selectedDate]
  );

  // Add Exercise & Physical Exertion Entry
  const addExerciseToDiary = useCallback(
    (params: {
      exercise: ExerciseItem;
      durationMinutes: number;
      intensity: ExerciseIntensity;
      rpe: number;
      avgHeartRate?: number;
      sets?: number;
      reps?: number;
      loadKg?: number;
      distanceKm?: number;
      fatigueStatus: FatigueStatus;
      notes?: string;
    }) => {
      const calc = calculateExerciseExpenditure({
        exercise: params.exercise,
        durationMinutes: params.durationMinutes,
        intensity: params.intensity,
        rpe: params.rpe,
        weightKg: profile.weightKg,
        avgHeartRate: params.avgHeartRate,
        sets: params.sets,
        reps: params.reps,
        loadKg: params.loadKg,
        distanceKm: params.distanceKm,
      });

      const entry: DiaryExerciseEntry = {
        id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: selectedDate,
        exerciseId: params.exercise.id,
        exerciseName: params.exercise.name,
        category: params.exercise.category,
        durationMinutes: params.durationMinutes,
        intensity: params.intensity,
        rpe: params.rpe,
        hrZone: calc.hrZone,
        avgHeartRate: params.avgHeartRate,
        sets: params.sets,
        reps: params.reps,
        loadKg: params.loadKg,
        distanceKm: params.distanceKm,
        caloriesBurned: calc.caloriesBurned,
        exertionLoad: calc.exertionLoad,
        strainScore: calc.strainScore,
        sweatLossMl: calc.sweatLossMl,
        glycogenUsedG: calc.glycogenUsedG,
        sodiumLossMg: calc.sodiumLossMg,
        potassiumLossMg: calc.potassiumLossMg,
        magnesiumLossMg: calc.magnesiumLossMg,
        tonnageKg: calc.tonnageKg,
        fatigueStatus: params.fatigueStatus,
        notes: params.notes,
        timestamp: new Date().toISOString(),
      };

      const existing = logsByDate[selectedDate] || {
        date: selectedDate,
        foods: [],
        exercises: [],
        biometrics: [],
        notes: [],
        waterMl: 0,
        isCompleted: false,
      };

      persistLogs({
        ...logsByDate,
        [selectedDate]: {
          ...existing,
          exercises: [...existing.exercises, entry],
        },
      });
    },
    [logsByDate, persistLogs, profile.weightKg, selectedDate]
  );

  const removeExerciseEntry = useCallback(
    (entryId: string) => {
      const existing = logsByDate[selectedDate];
      if (!existing) return;
      persistLogs({
        ...logsByDate,
        [selectedDate]: {
          ...existing,
          exercises: existing.exercises.filter((e) => e.id !== entryId),
        },
      });
    },
    [logsByDate, persistLogs, selectedDate]
  );

  // Add Biometric Entry
  const addBiometricToDiary = useCallback(
    (type: BiometricType, value: number, notes?: string) => {
      const def = BIOMETRIC_DEFINITIONS[type];
      const entry: DiaryBiometricEntry = {
        id: `bio-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: selectedDate,
        type,
        label: def.label,
        value,
        unit: def.unit,
        notes,
        timestamp: new Date().toISOString(),
      };
      const existing = logsByDate[selectedDate] || {
        date: selectedDate,
        foods: [],
        exercises: [],
        biometrics: [],
        notes: [],
        waterMl: 0,
        isCompleted: false,
      };
      // Replace existing biometric of same type on the same day or append
      const filtered = existing.biometrics.filter((b) => b.type !== type);
      persistLogs({
        ...logsByDate,
        [selectedDate]: {
          ...existing,
          biometrics: [...filtered, entry],
        },
      });
      if (type === 'weight') {
        updateProfile({ weightKg: value });
      } else if (type === 'bodyFat') {
        updateProfile({ bodyFatPct: value });
      }
    },
    [logsByDate, persistLogs, selectedDate, updateProfile]
  );

  const removeBiometricEntry = useCallback(
    (entryId: string) => {
      const existing = logsByDate[selectedDate];
      if (!existing) return;
      persistLogs({
        ...logsByDate,
        [selectedDate]: {
          ...existing,
          biometrics: existing.biometrics.filter((b) => b.id !== entryId),
        },
      });
    },
    [logsByDate, persistLogs, selectedDate]
  );

  // Add Note Entry
  const addNoteToDiary = useCallback(
    (title: string, content: string) => {
      const entry: DiaryNoteEntry = {
        id: `note-${Date.now()}`,
        date: selectedDate,
        title: title.trim() || 'Daily Note',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };
      const existing = logsByDate[selectedDate] || {
        date: selectedDate,
        foods: [],
        exercises: [],
        biometrics: [],
        notes: [],
        waterMl: 0,
        isCompleted: false,
      };
      persistLogs({
        ...logsByDate,
        [selectedDate]: {
          ...existing,
          notes: [...existing.notes, entry],
        },
      });
    },
    [logsByDate, persistLogs, selectedDate]
  );

  const removeNoteEntry = useCallback(
    (entryId: string) => {
      const existing = logsByDate[selectedDate];
      if (!existing) return;
      persistLogs({
        ...logsByDate,
        [selectedDate]: {
          ...existing,
          notes: existing.notes.filter((n) => n.id !== entryId),
        },
      });
    },
    [logsByDate, persistLogs, selectedDate]
  );

  // Hydration / Water
  const addWaterMl = useCallback(
    (deltaMl: number) => {
      const existing = logsByDate[selectedDate] || {
        date: selectedDate,
        foods: [],
        exercises: [],
        biometrics: [],
        notes: [],
        waterMl: 0,
        isCompleted: false,
      };
      const nextWater = Math.max(0, existing.waterMl + deltaMl);
      persistLogs({
        ...logsByDate,
        [selectedDate]: {
          ...existing,
          waterMl: nextWater,
        },
      });
    },
    [logsByDate, persistLogs, selectedDate]
  );

  // Toggle Day Completed
  const toggleDayCompleted = useCallback(() => {
    const existing = logsByDate[selectedDate] || {
      date: selectedDate,
      foods: [],
      exercises: [],
      biometrics: [],
      notes: [],
      waterMl: 0,
      isCompleted: false,
    };
    persistLogs({
      ...logsByDate,
      [selectedDate]: {
        ...existing,
        isCompleted: !existing.isCompleted,
      },
    });
  }, [logsByDate, persistLogs, selectedDate]);

  // Copy Previous Day
  const copyPreviousDayToCurrent = useCallback(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const prevDateObj = new Date(y, m - 1, d - 1);
    const prevKey = formatDateKey(prevDateObj);
    const prevLog = logsByDate[prevKey];
    if (!prevLog) return false;

    const copiedFoods: DiaryFoodEntry[] = prevLog.foods.map((f, i) => ({
      ...f,
      id: `food-copy-${Date.now()}-${i}`,
      date: selectedDate,
      timestamp: new Date().toISOString(),
    }));

    const existing = logsByDate[selectedDate] || {
      date: selectedDate,
      foods: [],
      exercises: [],
      biometrics: [],
      notes: [],
      waterMl: prevLog.waterMl || 0,
      isCompleted: false,
    };

    persistLogs({
      ...logsByDate,
      [selectedDate]: {
        ...existing,
        foods: [...existing.foods, ...copiedFoods],
        waterMl: existing.waterMl || prevLog.waterMl,
      },
    });
    return true;
  }, [logsByDate, persistLogs, selectedDate]);

  // Clear Current Day
  const clearCurrentDay = useCallback(() => {
    persistLogs({
      ...logsByDate,
      [selectedDate]: {
        date: selectedDate,
        foods: [],
        exercises: [],
        biometrics: [],
        notes: [],
        waterMl: 0,
        isCompleted: false,
      },
    });
  }, [logsByDate, persistLogs, selectedDate]);

  // Reset to 14-day Demo Seed Data
  const resetToDemoData = useCallback(() => {
    const seeded = buildInitialSeedLogs();
    persistLogs(seeded);
  }, [persistLogs]);

  // Add Custom Food or Recipe
  const saveCustomFood = useCallback((food: FoodItem) => {
    setCustomFoodsState((prev) => {
      const next = [food, ...prev.filter((f) => f.id !== food.id)];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_CUSTOM_FOODS, JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  // Add Custom Exercise
  const saveCustomExercise = useCallback((exercise: ExerciseItem) => {
    setCustomExercisesState((prev) => {
      const next = [exercise, ...prev.filter((e) => e.id !== exercise.id)];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_CUSTOM_EXERCISES, JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  // Calculate Daily Totals & Energy Summary for ANY day log
  const computeDaySummary = useCallback(
    (dayLog: NutritionDayLog) => {
      const totals: NutrientMap = {};
      for (const def of NUTRIENT_DEFINITIONS) {
        totals[def.id] = 0;
      }

      for (const entry of dayLog.foods) {
        for (const def of NUTRIENT_DEFINITIONS) {
          totals[def.id] = (totals[def.id] || 0) + (entry.nutrients[def.id] || 0);
        }
      }

      // Add logged waterMl to total water (1 ml = 1 g)
      totals.water = Math.round((totals.water || 0) + (dayLog.waterMl || 0));

      // Round totals cleanly
      for (const def of NUTRIENT_DEFINITIONS) {
        totals[def.id] = Number((totals[def.id] || 0).toFixed(def.decimals));
      }

      const bmr = calculateBMR(profile);
      const activityFactor = ACTIVITY_LEVEL_MULTIPLIERS[profile.activityLevel]?.factor ?? 0.375;
      const baselineActivityBurn = Math.round(bmr * activityFactor);

      const exerciseBurn = dayLog.exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
      const totalExertionLoad = dayLog.exercises.reduce((sum, e) => sum + e.exertionLoad, 0);
      const totalExerciseMinutes = dayLog.exercises.reduce((sum, e) => sum + e.durationMinutes, 0);
      const avgRpe =
        dayLog.exercises.length > 0
          ? Number(
              (
                dayLog.exercises.reduce((sum, e) => sum + e.rpe * e.durationMinutes, 0) /
                Math.max(1, totalExerciseMinutes)
              ).toFixed(1)
            )
          : 0;

      // Aggregate Daily Strain (0 - 21 scale)
      const dayStrainScore =
        totalExertionLoad > 0
          ? Number(Math.min(21, 21 * (1 - Math.exp(-totalExertionLoad / 320))).toFixed(1))
          : 0;

      const totalSweatLossMl = dayLog.exercises.reduce((sum, e) => sum + (e.sweatLossMl || 0), 0);
      const totalSodiumLossMg = dayLog.exercises.reduce((sum, e) => sum + (e.sodiumLossMg || 0), 0);
      const totalPotassiumLossMg = dayLog.exercises.reduce((sum, e) => sum + (e.potassiumLossMg || 0), 0);
      const totalGlycogenUsedG = dayLog.exercises.reduce((sum, e) => sum + (e.glycogenUsedG || 0), 0);

      const totalBurned = bmr + baselineActivityBurn + exerciseBurn;
      const goalDelta = WEIGHT_GOAL_ADJUSTMENTS[profile.weightGoal]?.kcalDelta ?? 0;
      const baseEnergyBudget = bmr + baselineActivityBurn + goalDelta;
      const targetEnergyBudget = profile.includeExerciseInBudget
        ? baseEnergyBudget + exerciseBurn
        : baseEnergyBudget;

      // Dynamic nutrient targets based on energy budget & macro preset
      const preset = MACRO_PRESETS[profile.macroPreset] || MACRO_PRESETS.athletic;
      const dynamicTargets: Record<string, number> = {};
      for (const def of NUTRIENT_DEFINITIONS) {
        dynamicTargets[def.id] = profile.customTargets[def.id] ?? def.defaultTarget;
      }

      dynamicTargets.kcal = profile.customTargets.kcal ?? Math.max(1200, targetEnergyBudget);
      if (profile.macroPreset !== 'custom') {
        dynamicTargets.protein = Math.round((dynamicTargets.kcal * (preset.proteinPct / 100)) / 4);
        const carbGrams = Math.round((dynamicTargets.kcal * (preset.carbsPct / 100)) / 4);
        dynamicTargets.carbs = carbGrams;
        dynamicTargets.netCarbs = Math.max(20, carbGrams - (dynamicTargets.fiber || 35));
        dynamicTargets.fat = Math.round((dynamicTargets.kcal * (preset.fatPct / 100)) / 9);
      }

      const caloriesConsumed = Math.round(totals.kcal || 0);
      const caloriesRemaining = Math.round(dynamicTargets.kcal - caloriesConsumed);
      const netCalorieBalance = caloriesConsumed - totalBurned;

      return {
        totals,
        targets: dynamicTargets,
        bmr,
        baselineActivityBurn,
        exerciseBurn,
        totalBurned,
        caloriesConsumed,
        caloriesRemaining,
        netCalorieBalance,
        totalExertionLoad,
        totalExerciseMinutes,
        avgRpe,
        dayStrainScore,
        totalSweatLossMl,
        totalSodiumLossMg,
        totalPotassiumLossMg,
        totalGlycogenUsedG,
      };
    },
    [profile]
  );

  const currentSummary = useMemo(
    () => computeDaySummary(currentDayLog),
    [computeDaySummary, currentDayLog]
  );

  // Contributor breakdown for any selected nutrient on the current day
  const getNutrientContributors = useCallback(
    (nutrientId: string) => {
      const total = currentSummary.totals[nutrientId] || 0;
      const items = currentDayLog.foods
        .map((entry) => {
          const amount = entry.nutrients[nutrientId] || 0;
          return {
            entryId: entry.id,
            foodName: entry.foodName,
            servingLabel: `${entry.quantity} × ${entry.servingLabel}`,
            mealGroup: entry.mealGroup,
            amount,
            pctOfTotal: total > 0 ? Math.round((amount / total) * 100) : 0,
          };
        })
        .filter((item) => item.amount > 0)
        .sort((a, b) => b.amount - a.amount);
      return items;
    },
    [currentDayLog.foods, currentSummary.totals]
  );

  return {
    isLoaded,
    selectedDate,
    setSelectedDate,
    logsByDate,
    currentDayLog,
    currentSummary,
    profile,
    updateProfile,
    allFoods,
    allExercises,
    customFoods,
    customExercises,
    addFoodToDiary,
    updateFoodEntry,
    removeFoodEntry,
    addExerciseToDiary,
    removeExerciseEntry,
    addBiometricToDiary,
    removeBiometricEntry,
    addNoteToDiary,
    removeNoteEntry,
    addWaterMl,
    toggleDayCompleted,
    copyPreviousDayToCurrent,
    clearCurrentDay,
    resetToDemoData,
    saveCustomFood,
    saveCustomExercise,
    computeDaySummary,
    getNutrientContributors,
  };
}
