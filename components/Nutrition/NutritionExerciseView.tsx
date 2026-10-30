'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  type DiaryExerciseEntry,
  type FatigueStatus,
  type NutritionProfileSettings,
} from '@/app/hooks/useNutritionTracker';
import {
  RPE_SCALE_DESCRIPTIONS,
  calculateExerciseExpenditure,
  type ExerciseItem,
  type ExerciseCategory,
  type ExerciseIntensity,
  type NutrientMap,
} from '@/lib/nutritionDatabase';

interface NutritionExerciseViewProps {
  allExercises: ExerciseItem[];
  todayExercises: DiaryExerciseEntry[];
  profile: NutritionProfileSettings;
  dayTotals: NutrientMap;
  onAddExerciseToDiary: (params: {
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
  }) => void;
  onRemoveExerciseEntry: (entryId: string) => void;
  onSaveCustomExercise: (exercise: ExerciseItem) => void;
}

const EXERCISE_CATEGORIES: ('All' | ExerciseCategory)[] = [
  'All',
  'Cardio & Endurance',
  'Strength & Resistance',
  'HIIT & Conditioning',
  'Sports & Athletics',
  'Mobility & Mind-Body',
  'Custom Exercise',
];

const INTENSITY_LEVELS: { value: ExerciseIntensity; label: string }[] = [
  { value: 'light', label: 'Light Effort' },
  { value: 'moderate', label: 'Moderate / Steady' },
  { value: 'vigorous', label: 'Vigorous / Hard' },
  { value: 'max', label: 'Maximal / Peak' },
];

export function NutritionExerciseView({
  allExercises,
  todayExercises,
  profile,
  dayTotals,
  onAddExerciseToDiary,
  onRemoveExerciseEntry,
  onSaveCustomExercise,
}: NutritionExerciseViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ExerciseCategory>('All');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    allExercises[0]?.id || ''
  );

  // Workout Logger Form State
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [intensity, setIntensity] = useState<ExerciseIntensity>('vigorous');
  const [rpe, setRpe] = useState<number>(7);
  const [avgHeartRate, setAvgHeartRate] = useState<string>('148');
  const [sets, setSets] = useState<string>('15');
  const [reps, setReps] = useState<string>('10');
  const [loadKg, setLoadKg] = useState<string>('60');
  const [distanceKm, setDistanceKm] = useState<string>('6.5');
  const [fatigueStatus, setFatigueStatus] = useState<FatigueStatus>('normal');
  const [notes, setNotes] = useState<string>('');
  const [loggedAlert, setLoggedAlert] = useState<string | null>(null);

  // Custom Exercise Creator State
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customExName, setCustomExName] = useState('');
  const [customExCategory, setCustomExCategory] = useState<ExerciseCategory>('HIIT & Conditioning');
  const [customExMet, setCustomExMet] = useState('8.5');

  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allExercises.filter((ex) => {
      if (categoryFilter !== 'All' && ex.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.category.toLowerCase().includes(q) ||
        ex.muscleGroups.some((m) => m.toLowerCase().includes(q)) ||
        ex.energySystem.toLowerCase().includes(q)
      );
    });
  }, [allExercises, categoryFilter, searchQuery]);

  const selectedExercise = useMemo(
    () =>
      allExercises.find((e) => e.id === selectedExerciseId) ||
      filteredExercises[0] ||
      allExercises[0],
    [allExercises, filteredExercises, selectedExerciseId]
  );

  useEffect(() => {
    if (selectedExercise) {
      setIntensity(selectedExercise.defaultIntensity);
      setRpe(selectedExercise.defaultRpe);
    }
  }, [selectedExercise]);

  const liveCalculation = useMemo(() => {
    if (!selectedExercise) return null;
    const hrNum = parseInt(avgHeartRate, 10);
    return calculateExerciseExpenditure({
      exercise: selectedExercise,
      durationMinutes: Math.max(1, durationMinutes),
      intensity,
      rpe,
      weightKg: profile.weightKg,
      avgHeartRate: !isNaN(hrNum) && hrNum > 40 ? hrNum : undefined,
      sets: selectedExercise.supportsStrengthVolume ? parseInt(sets, 10) || 0 : undefined,
      reps: selectedExercise.supportsStrengthVolume ? parseInt(reps, 10) || 0 : undefined,
      loadKg: selectedExercise.supportsStrengthVolume ? parseFloat(loadKg) || 0 : undefined,
      distanceKm: selectedExercise.supportsDistance ? parseFloat(distanceKm) || 0 : undefined,
    });
  }, [
    avgHeartRate,
    distanceKm,
    durationMinutes,
    intensity,
    loadKg,
    profile.weightKg,
    reps,
    rpe,
    selectedExercise,
    sets,
  ]);

  const rpeMeta =
    RPE_SCALE_DESCRIPTIONS[Math.min(10, Math.max(1, Math.round(rpe)))] ||
    RPE_SCALE_DESCRIPTIONS[7];

  const handleLogWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;
    const hrNum = parseInt(avgHeartRate, 10);

    onAddExerciseToDiary({
      exercise: selectedExercise,
      durationMinutes: Math.max(1, durationMinutes),
      intensity,
      rpe,
      avgHeartRate: !isNaN(hrNum) && hrNum > 40 ? hrNum : undefined,
      sets: selectedExercise.supportsStrengthVolume ? parseInt(sets, 10) || undefined : undefined,
      reps: selectedExercise.supportsStrengthVolume ? parseInt(reps, 10) || undefined : undefined,
      loadKg: selectedExercise.supportsStrengthVolume ? parseFloat(loadKg) || undefined : undefined,
      distanceKm: selectedExercise.supportsDistance
        ? parseFloat(distanceKm) || undefined
        : undefined,
      fatigueStatus,
      notes: notes.trim() || undefined,
    });

    setLoggedAlert(
      `Logged ${selectedExercise.name} (${durationMinutes} min @ RPE ${rpe}/10 · -${liveCalculation?.caloriesBurned} kcal · ${liveCalculation?.exertionLoad} AU Load)`
    );
    setNotes('');
    setTimeout(() => setLoggedAlert(null), 4000);
  };

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExName.trim()) return;
    const baseMet = Math.max(1.5, parseFloat(customExMet) || 7.0);
    const newEx: ExerciseItem = {
      id: `custom-ex-${Date.now()}`,
      name: customExName.trim(),
      category: customExCategory,
      mets: {
        light: Number((baseMet * 0.72).toFixed(1)),
        moderate: Number(baseMet.toFixed(1)),
        vigorous: Number((baseMet * 1.25).toFixed(1)),
        max: Number((baseMet * 1.5).toFixed(1)),
      },
      defaultIntensity: 'moderate',
      defaultRpe: 7,
      energySystem: 'Mixed Metabolic',
      muscleGroups: ['Full Body'],
      supportsStrengthVolume: true,
      supportsDistance: true,
      isCustom: true,
    };
    onSaveCustomExercise(newEx);
    setSelectedExerciseId(newEx.id);
    setShowCustomCreator(false);
    setCustomExName('');
  };

  // Aggregate Today's Exertion & Replenishment Status
  const dayExertionTotals = useMemo(() => {
    const kcal = todayExercises.reduce((s, e) => s + e.caloriesBurned, 0);
    const load = todayExercises.reduce((s, e) => s + e.exertionLoad, 0);
    const mins = todayExercises.reduce((s, e) => s + e.durationMinutes, 0);
    const sweatMl = todayExercises.reduce((s, e) => s + e.sweatLossMl, 0);
    const sodiumLost = todayExercises.reduce((s, e) => s + e.sodiumLossMg, 0);
    const potassiumLost = todayExercises.reduce((s, e) => s + e.potassiumLossMg, 0);
    const glycogenUsed = todayExercises.reduce((s, e) => s + e.glycogenUsedG, 0);
    return { kcal, load, mins, sweatMl, sodiumLost, potassiumLost, glycogenUsed };
  }, [todayExercises]);

  return (
    <div className="space-y-6 mt-6">
      {/* Header & Custom Exercise Trigger */}
      <div className="sp-card p-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="eyebrow eyebrow--compact">Physical Exertion &amp; Exercise Biometrics</span>
          <h3 className="text-lg font-semibold m-0">
            Exercise Logger, Borg RPE (1–10) &amp; Metabolic Strain Calculator
          </h3>
        </div>
        <button
          type="button"
          className="button button--secondary button--sm"
          onClick={() => setShowCustomCreator(!showCustomCreator)}
        >
          + Create Custom Exercise
        </button>
      </div>

      {showCustomCreator && (
        <form onSubmit={handleCreateCustomExercise} className="sp-card p-4 space-y-3">
          <h4 className="text-sm font-semibold m-0">Create Custom Exercise Activity</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label>
              <span className="text-muted block mb-1">Exercise Name *</span>
              <input
                type="text"
                required
                placeholder="e.g., Sled Push & Farmer Carries"
                value={customExName}
                onChange={(e) => setCustomExName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
              />
            </label>
            <label>
              <span className="text-muted block mb-1">Category</span>
              <select
                value={customExCategory}
                onChange={(e) => setCustomExCategory(e.target.value as ExerciseCategory)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
              >
                {EXERCISE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c} className="bg-[#0f172a] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-muted block mb-1">Base Moderate MET Value</span>
              <input
                type="number"
                step="0.5"
                min="1.5"
                max="20"
                value={customExMet}
                onChange={(e) => setCustomExMet(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="button button--tertiary button--sm" onClick={() => setShowCustomCreator(false)}>
              Cancel
            </button>
            <button type="submit" className="button button--primary button--sm">
              Save Custom Exercise
            </button>
          </div>
        </form>
      )}

      {loggedAlert && (
        <div className="sp-alert" data-alert="" data-alert-tone="success">
          <svg className="sp-icon sp-alert__icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-success"></use>
          </svg>
          <div className="sp-alert__body">
            <span className="sp-alert__title">Workout &amp; Exertion Logged</span>
            <p className="sp-alert__text">{loggedAlert}</p>
          </div>
        </div>
      )}

      <div
        className="layout-grid gap-2xl items-start"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}
      >
        {/* Left: Exercise Library Picker */}
        <div className="sp-card p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="search"
              placeholder="Search running, powerlifting, HIIT, rowing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'All' | ExerciseCategory)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
            >
              {EXERCISE_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#0f172a] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredExercises.map((ex) => {
              const isSelected = selectedExercise?.id === ex.id;
              return (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--primary)] bg-white/10'
                      : 'border-transparent hover:border-[var(--border)] hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-sm font-semibold block">{ex.name}</strong>
                      <span className="text-xs text-muted">
                        {ex.category} · {ex.energySystem}
                      </span>
                    </div>
                    <span className="ui-badge ui-badge--sm shrink-0">
                      MET {ex.mets.light}–{ex.mets.max}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {ex.muscleGroups.map((m) => (
                      <span
                        key={m}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Physical Exertion & RPE Logger */}
        {selectedExercise && liveCalculation && (
          <form onSubmit={handleLogWorkout} className="sp-card p-5 space-y-4">
            <div className="pb-3 separator-bottom">
              <span className="eyebrow eyebrow--compact">
                {selectedExercise.category} · {selectedExercise.energySystem}
              </span>
              <h3 className="text-lg font-bold m-0 mt-0.5">{selectedExercise.name}</h3>
              <p className="text-xs text-muted m-0 mt-0.5">
                Calculated for body weight <strong>{profile.weightKg} kg</strong> · Primary muscles:{' '}
                {selectedExercise.muscleGroups.join(', ')}
              </p>
            </div>

            {/* Duration, Intensity, and Avg Heart Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label>
                <span className="text-muted block mb-1">Duration (Minutes) *</span>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground font-semibold"
                  required
                />
              </label>

              <label>
                <span className="text-muted block mb-1">Intensity Tier</span>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value as ExerciseIntensity)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                >
                  {INTENSITY_LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value} className="bg-[#0f172a] text-white">
                      {lvl.label} ({selectedExercise.mets[lvl.value]} METs)
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-muted block mb-1">Avg Heart Rate (bpm, optional)</span>
                <input
                  type="number"
                  min={45}
                  max={220}
                  placeholder="e.g. 148"
                  value={avgHeartRate}
                  onChange={(e) => setAvgHeartRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                />
              </label>
            </div>

            {/* Borg RPE 1-10 Interactive Selector */}
            <div className="sp-panel p-3.5 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold">
                  Rate of Perceived Exertion (Borg CR10 Scale)
                </span>
                <span
                  className="ui-badge ui-badge--pill ui-badge--sm"
                  style={{
                    backgroundColor: `${rpeMeta.color}25`,
                    color: rpeMeta.color,
                    border: `1px solid ${rpeMeta.color}66`,
                  }}
                >
                  RPE {rpe} / 10 · {rpeMeta.label} (Zone {liveCalculation.hrZone})
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={rpe}
                onChange={(e) => setRpe(parseFloat(e.target.value))}
                className="w-full accent-[var(--primary)] cursor-pointer"
                aria-label="Rate of Perceived Exertion"
              />

              <div className="grid grid-cols-10 gap-1 text-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const meta = RPE_SCALE_DESCRIPTIONS[num];
                  const active = Math.round(rpe) === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRpe(num)}
                      className={`py-1 rounded text-xs font-bold border transition-all cursor-pointer ${
                        active ? 'scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: active ? meta.color : 'transparent',
                        color: active ? '#0f172a' : meta.color,
                        borderColor: meta.color,
                      }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted m-0">{rpeMeta.description}</p>
            </div>

            {/* Strength Volume OR Distance Inputs */}
            {selectedExercise.supportsStrengthVolume && (
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <label>
                  <span className="text-muted block mb-1">Total Working Sets</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                  />
                </label>
                <label>
                  <span className="text-muted block mb-1">Avg Reps / Set</span>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                  />
                </label>
                <label>
                  <span className="text-muted block mb-1">Avg Load (kg)</span>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    max={500}
                    value={loadKg}
                    onChange={(e) => setLoadKg(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                  />
                </label>
              </div>
            )}

            {selectedExercise.supportsDistance && (
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <label>
                  <span className="text-muted block mb-1">Distance Covered (km)</span>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                  />
                </label>
                <div className="sp-panel p-2.5 rounded-lg flex flex-col justify-center">
                  <span className="text-[11px] text-muted">Average Pace</span>
                  <strong className="text-sm">
                    {parseFloat(distanceKm) > 0
                      ? `${(durationMinutes / parseFloat(distanceKm)).toFixed(2)} min/km`
                      : '—'}
                  </strong>
                </div>
              </div>
            )}

            {/* Post-Session Fatigue & Workout Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label>
                <span className="text-muted block mb-1">Post-Exercise Neuromuscular Feel</span>
                <select
                  value={fatigueStatus}
                  onChange={(e) => setFatigueStatus(e.target.value as FatigueStatus)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                >
                  <option value="fresh" className="bg-[#0f172a] text-white">
                    Fresh &amp; Energized (High CNS Readiness)
                  </option>
                  <option value="normal" className="bg-[#0f172a] text-white">
                    Normal Productive Training Fatigue
                  </option>
                  <option value="fatigued" className="bg-[#0f172a] text-white">
                    Heavy Muscular / Metabolic Fatigue
                  </option>
                  <option value="exhausted" className="bg-[#0f172a] text-white">
                    Exhausted / Needs Recovery Day
                  </option>
                </select>
              </label>
              <label>
                <span className="text-muted block mb-1">Session Notes</span>
                <input
                  type="text"
                  placeholder="e.g., 4x4m intervals, strong focus..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                />
              </label>
            </div>

            {/* Live Bioenergetic & Exertion Output Preview */}
            <div className="sp-panel p-3.5 rounded-xl">
              <span className="text-[11px] uppercase tracking-wider text-muted block mb-2">
                Live Bioenergetic &amp; Exertion Output Preview
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2 rounded-lg bg-black/20">
                  <span className="text-[11px] text-muted block">Energy Burned</span>
                  <strong className="text-base font-bold" style={{ color: '#f97316' }}>
                    {liveCalculation.caloriesBurned} kcal
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <span className="text-[11px] text-muted block">sRPE Training Load</span>
                  <strong className="text-base font-bold">
                    {liveCalculation.exertionLoad} AU
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <span className="text-[11px] text-muted block">Session Strain</span>
                  <strong className="text-base font-bold" style={{ color: '#38bdf8' }}>
                    {liveCalculation.strainScore} / 21
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <span className="text-[11px] text-muted block">Sweat &amp; Na+ Loss</span>
                  <strong className="text-sm font-bold">
                    {liveCalculation.sweatLossMl}ml / {liveCalculation.sodiumLossMg}mg
                  </strong>
                </div>
              </div>
            </div>

            <button type="submit" className="button button--primary button--md w-full">
              + Log Exercise &amp; Add {liveCalculation.caloriesBurned} kcal to Expenditure
            </button>
          </form>
        )}
      </div>

      {/* Today's Exertion Replenishment & Electrolyte Balance Card */}
      <div className="sp-card p-5">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div>
            <span className="eyebrow eyebrow--compact">Exertion-Adjusted Fueling &amp; Recovery</span>
            <h4 className="text-base font-semibold m-0">
              Today’s Logged Exertion ({todayExercises.length} Sessions · {dayExertionTotals.mins} mins · {dayExertionTotals.load} AU)
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="sp-panel p-3.5 rounded-xl">
            <span className="text-xs font-semibold block">Glycogen Depletion vs. Carbs Logged</span>
            <strong className="text-lg font-bold block mt-1">
              -{dayExertionTotals.glycogenUsed}g used · {Math.round(dayTotals.netCarbs || 0)}g Net Carbs eaten
            </strong>
            <p className="text-xs text-muted m-0 mt-1">
              Post-exertion glycogen synthesis peaks within 2 hours of high-RPE sessions.
            </p>
          </div>
          <div className="sp-panel p-3.5 rounded-xl">
            <span className="text-xs font-semibold block">Sweat Sodium &amp; Potassium Turnover</span>
            <strong className="text-lg font-bold block mt-1">
              -{dayExertionTotals.sodiumLost}mg Na · -{dayExertionTotals.potassiumLost}mg K
            </strong>
            <p className="text-xs text-muted m-0 mt-1">
              Today’s dietary intake: {Math.round(dayTotals.sodium || 0)}mg Na &amp;{' '}
              {Math.round(dayTotals.potassium || 0)}mg K.
            </p>
          </div>
          <div className="sp-panel p-3.5 rounded-xl">
            <span className="text-xs font-semibold block">Sweat Fluid Loss vs. Hydration</span>
            <strong className="text-lg font-bold block mt-1">
              -{dayExertionTotals.sweatMl} ml sweat · {Math.round(dayTotals.water || 0)} ml hydrated
            </strong>
            <p className="text-xs text-muted m-0 mt-1">
              Replace 125% of exercise sweat loss to maintain plasma volume and cognitive reaction speed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
