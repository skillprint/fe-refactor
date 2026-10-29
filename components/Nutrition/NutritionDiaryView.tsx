'use client';

import React, { useState, useMemo } from 'react';
import {
  MEAL_GROUP_LABELS,
  BIOMETRIC_DEFINITIONS,
  type MealGroup,
  type NutritionDayLog,
  type NutritionProfileSettings,
  type BiometricType,
} from '@/app/hooks/useNutritionTracker';
import {
  NUTRIENT_DEFINITIONS,
  NUTRIENT_GROUP_LABELS,
  HIGHLIGHTED_NUTRIENT_IDS,
  NUTRIENT_BALANCES,
  RPE_SCALE_DESCRIPTIONS,
  suggestFoodsForGaps,
  type FoodItem,
  type NutrientGroup,
  type NutrientMap,
} from '@/lib/nutritionDatabase';

interface NutritionDiaryViewProps {
  dayLog: NutritionDayLog;
  summary: {
    totals: NutrientMap;
    targets: Record<string, number>;
    bmr: number;
    baselineActivityBurn: number;
    exerciseBurn: number;
    totalBurned: number;
    caloriesConsumed: number;
    caloriesRemaining: number;
    netCalorieBalance: number;
    totalExertionLoad: number;
    totalExerciseMinutes: number;
    avgRpe: number;
    dayStrainScore: number;
    totalSweatLossMl: number;
    totalSodiumLossMg: number;
    totalPotassiumLossMg: number;
    totalGlycogenUsedG: number;
  };
  profile: NutritionProfileSettings;
  allFoods: FoodItem[];
  onOpenAddFood: (meal: MealGroup) => void;
  onOpenAddExercise: () => void;
  onInspectFood: (food: FoodItem, servingLabel?: string, quantity?: number) => void;
  onAddSuggestedFood: (food: FoodItem, meal: MealGroup) => void;
  onUpdateFoodEntry: (entryId: string, servingLabel: string, quantity: number, mealGroup?: MealGroup) => void;
  onRemoveFoodEntry: (entryId: string) => void;
  onRemoveExerciseEntry: (entryId: string) => void;
  onAddBiometric: (type: BiometricType, value: number, notes?: string) => void;
  onRemoveBiometric: (entryId: string) => void;
  onAddNote: (title: string, content: string) => void;
  onRemoveNote: (entryId: string) => void;
  getNutrientContributors: (nutrientId: string) => {
    entryId: string;
    foodName: string;
    servingLabel: string;
    mealGroup: MealGroup;
    amount: number;
    pctOfTotal: number;
  }[];
}

const MEAL_ORDER: MealGroup[] = ['breakfast', 'lunch', 'dinner', 'snacks'];
const NUTRIENT_GROUPS: NutrientGroup[] = [
  'general',
  'carbohydrates',
  'lipids',
  'protein',
  'vitamins',
  'minerals',
];

export function NutritionDiaryView({
  dayLog,
  summary,
  profile,
  allFoods,
  onOpenAddFood,
  onOpenAddExercise,
  onInspectFood,
  onAddSuggestedFood,
  onUpdateFoodEntry,
  onRemoveFoodEntry,
  onRemoveExerciseEntry,
  onAddBiometric,
  onRemoveBiometric,
  onAddNote,
  onRemoveNote,
  getNutrientContributors,
}: NutritionDiaryViewProps) {
  const [selectedNutrientId, setSelectedNutrientId] = useState<string>('magnesium');
  const [showBiometricForm, setShowBiometricForm] = useState(false);
  const [bioType, setBioType] = useState<BiometricType>('weight');
  const [bioVal, setBioVal] = useState<string>(String(profile.weightKg));
  const [bioNote, setBioNote] = useState<string>('');

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [showOracleSuggestions, setShowOracleSuggestions] = useState(true);

  const { totals, targets } = summary;

  const oracleSuggestions = useMemo(
    () => suggestFoodsForGaps(totals, targets, allFoods, 4),
    [allFoods, targets, totals]
  );

  const selectedNutrientDef = useMemo(
    () => NUTRIENT_DEFINITIONS.find((d) => d.id === selectedNutrientId) || NUTRIENT_DEFINITIONS[0],
    [selectedNutrientId]
  );

  const selectedContributors = useMemo(
    () => getNutrientContributors(selectedNutrientId),
    [getNutrientContributors, selectedNutrientId]
  );

  const handleSaveBiometric = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(bioVal);
    if (!isNaN(num) && num > 0) {
      onAddBiometric(bioType, num, bioNote.trim() || undefined);
      setShowBiometricForm(false);
      setBioNote('');
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() && !noteTitle.trim()) return;
    onAddNote(noteTitle, noteContent);
    setNoteTitle('');
    setNoteContent('');
    setShowNoteForm(false);
  };

  return (
    <div
      className="layout-grid gap-2xl items-start mt-6"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}
    >
      {/* ==================== LEFT COLUMN: DIARY LOG ==================== */}
      <div className="space-y-5">
        {/* Meal Groups */}
        {MEAL_ORDER.map((mealGroup) => {
          const entries = dayLog.foods.filter((f) => f.mealGroup === mealGroup);
          const mealKcal = Math.round(
            entries.reduce((sum, e) => sum + (e.nutrients.kcal || 0), 0)
          );
          const mealProtein = Math.round(
            entries.reduce((sum, e) => sum + (e.nutrients.protein || 0), 0)
          );
          const mealCarbs = Math.round(
            entries.reduce(
              (sum, e) =>
                sum + (e.nutrients[profile.trackNetCarbs ? 'netCarbs' : 'carbs'] || 0),
              0
            )
          );
          const mealFat = Math.round(
            entries.reduce((sum, e) => sum + (e.nutrients.fat || 0), 0)
          );

          return (
            <div key={mealGroup} className="sp-card p-4">
              <div className="flex items-center justify-between gap-3 pb-3 separator-bottom">
                <div>
                  <h3 className="text-base font-semibold m-0">{MEAL_GROUP_LABELS[mealGroup]}</h3>
                  <p className="text-xs text-muted m-0 mt-0.5">
                    <strong>{mealKcal} kcal</strong> · {mealProtein}g P · {mealCarbs}g{' '}
                    {profile.trackNetCarbs ? 'Net C' : 'C'} · {mealFat}g F
                  </p>
                </div>
                <button
                  type="button"
                  className="button button--secondary button--sm"
                  onClick={() => onOpenAddFood(mealGroup)}
                >
                  + Add Food
                </button>
              </div>

              {entries.length === 0 ? (
                <p className="text-xs text-muted py-4 text-center m-0">
                  No foods logged in {MEAL_GROUP_LABELS[mealGroup]} yet.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--border)] m-0 p-0 list-none">
                  {entries.map((entry) => {
                    const foodObj = allFoods.find((f) => f.id === entry.foodId);
                    return (
                      <li
                        key={entry.id}
                        className="py-2.5 flex items-center justify-between gap-3 flex-wrap"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              className="text-sm font-semibold text-left hover:underline bg-transparent border-0 p-0 cursor-pointer text-foreground"
                              onClick={() =>
                                foodObj &&
                                onInspectFood(foodObj, entry.servingLabel, entry.quantity)
                              }
                              title="Click to inspect full 45-nutrient profile"
                            >
                              {entry.foodName}
                            </button>
                            <span
                              className="ui-badge ui-badge--sm"
                              style={{ fontSize: '10px', padding: '1px 6px' }}
                            >
                              {entry.source}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted">
                            <label className="inline-flex items-center gap-1">
                              <span>Qty:</span>
                              <input
                                type="number"
                                step="0.25"
                                min="0.1"
                                max="50"
                                value={entry.quantity}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val) && val > 0) {
                                    onUpdateFoodEntry(entry.id, entry.servingLabel, val);
                                  }
                                }}
                                className="w-14 px-1.5 py-0.5 rounded border border-[var(--border)] bg-transparent text-xs text-foreground"
                              />
                            </label>
                            {foodObj && foodObj.servings.length > 1 ? (
                              <select
                                value={entry.servingLabel}
                                onChange={(e) =>
                                  onUpdateFoodEntry(entry.id, e.target.value, entry.quantity)
                                }
                                className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-transparent text-xs text-foreground"
                              >
                                {foodObj.servings.map((s) => (
                                  <option key={s.label} value={s.label} className="bg-[#0f172a] text-white">
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span>× {entry.servingLabel}</span>
                            )}
                            <span>({entry.grams}g)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <strong className="text-sm block">
                              {Math.round(entry.nutrients.kcal || 0)} kcal
                            </strong>
                            <span className="text-[11px] text-muted">
                              {Math.round(entry.nutrients.protein || 0)}P ·{' '}
                              {Math.round(
                                entry.nutrients[profile.trackNetCarbs ? 'netCarbs' : 'carbs'] || 0
                              )}
                              C · {Math.round(entry.nutrients.fat || 0)}F
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveFoodEntry(entry.id)}
                            className="icon-button button button--tertiary button--icon-only button--sm"
                            aria-label={`Remove ${entry.foodName}`}
                            title="Remove entry"
                          >
                            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                              <use href="#ti-trash"></use>
                            </svg>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {/* Exercises & Physical Exertion Section */}
        <div className="sp-card p-4">
          <div className="flex items-center justify-between gap-3 pb-3 separator-bottom">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold m-0">
                  Exercises &amp; Physical Exertion
                </h3>
                <span className="ui-badge ui-badge--pill ui-badge--sm">
                  Strain {summary.dayStrainScore} / 21
                </span>
              </div>
              <p className="text-xs text-muted m-0 mt-0.5">
                <strong>{summary.exerciseBurn} kcal burned</strong> ·{' '}
                {summary.totalExerciseMinutes} mins · {summary.totalExertionLoad} AU Training Load
              </p>
            </div>
            <button
              type="button"
              className="button button--primary button--sm"
              onClick={onOpenAddExercise}
            >
              + Log Exercise
            </button>
          </div>

          {dayLog.exercises.length === 0 ? (
            <div className="py-5 text-center">
              <p className="text-xs text-muted m-0 mb-2">
                No exercises or physical exertion logged for this day.
              </p>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={onOpenAddExercise}
              >
                Log Workout or Physical Exertion
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)] m-0 p-0 list-none">
              {dayLog.exercises.map((ex) => {
                const rpeMeta =
                  RPE_SCALE_DESCRIPTIONS[Math.min(10, Math.max(1, Math.round(ex.rpe)))] ||
                  RPE_SCALE_DESCRIPTIONS[6];
                return (
                  <li key={ex.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-sm font-semibold">{ex.exerciseName}</strong>
                          <span
                            className="ui-badge ui-badge--pill ui-badge--sm"
                            style={{
                              backgroundColor: `${rpeMeta.color}22`,
                              color: rpeMeta.color,
                              border: `1px solid ${rpeMeta.color}55`,
                            }}
                          >
                            RPE {ex.rpe}/10 ({rpeMeta.label})
                          </span>
                          <span className="ui-badge ui-badge--sm">
                            HR Zone {ex.hrZone}
                            {ex.avgHeartRate ? ` · ${ex.avgHeartRate} bpm` : ''}
                          </span>
                          <span className="ui-badge ui-badge--sm capitalize">
                            {ex.intensity}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-muted">
                          <span>
                            Duration: <strong>{ex.durationMinutes} min</strong>
                          </span>
                          <span>
                            Session Load: <strong>{ex.exertionLoad} AU</strong>
                          </span>
                          <span>
                            Strain: <strong>{ex.strainScore}</strong>
                          </span>
                          {ex.tonnageKg > 0 && (
                            <span>
                              Volume: <strong>{ex.sets}×{ex.reps} @ {ex.loadKg}kg</strong> ({ex.tonnageKg.toLocaleString()} kg tonnage)
                            </span>
                          )}
                          {ex.distanceKm && ex.distanceKm > 0 && (
                            <span>
                              Distance: <strong>{ex.distanceKm} km</strong>
                            </span>
                          )}
                          <span>
                            Sweat est: <strong>{ex.sweatLossMl} ml</strong> (-{ex.sodiumLossMg}mg Na)
                          </span>
                          <span className="capitalize">
                            Post-Session Feel: <strong>{ex.fatigueStatus}</strong>
                          </span>
                        </div>

                        {ex.notes && (
                          <p className="text-xs text-muted italic m-0 mt-1.5 bg-black/15 px-2.5 py-1.5 rounded-lg">
                            “{ex.notes}”
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <strong className="text-sm block" style={{ color: '#f97316' }}>
                            -{ex.caloriesBurned} kcal
                          </strong>
                          <span className="text-[11px] text-muted">
                            -{ex.glycogenUsedG}g glycogen
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveExerciseEntry(ex.id)}
                          className="icon-button button button--tertiary button--icon-only button--sm"
                          aria-label={`Remove ${ex.exerciseName}`}
                        >
                          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                            <use href="#ti-trash"></use>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Biometrics & Daily Notes Section */}
        <div className="sp-card p-4">
          <div className="flex items-center justify-between gap-3 pb-3 separator-bottom flex-wrap">
            <div>
              <h3 className="text-base font-semibold m-0">Biometrics &amp; Daily Notes</h3>
              <p className="text-xs text-muted m-0 mt-0.5">
                Track weight, resting heart rate, readiness, sleep, and training notes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => setShowBiometricForm(!showBiometricForm)}
              >
                + Biometric
              </button>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => setShowNoteForm(!showNoteForm)}
              >
                + Note
              </button>
            </div>
          </div>

          {showBiometricForm && (
            <form
              onSubmit={handleSaveBiometric}
              className="sp-panel p-3 rounded-xl mt-3 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="text-xs">
                  <span className="text-muted block mb-1">Biometric Metric</span>
                  <select
                    value={bioType}
                    onChange={(e) => {
                      const nextType = e.target.value as BiometricType;
                      setBioType(nextType);
                      setBioVal(String(BIOMETRIC_DEFINITIONS[nextType].defaultVal));
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                  >
                    {Object.entries(BIOMETRIC_DEFINITIONS).map(([k, def]) => (
                      <option key={k} value={k} className="bg-[#0f172a] text-white">
                        {def.label} ({def.unit})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs">
                  <span className="text-muted block mb-1">
                    Value ({BIOMETRIC_DEFINITIONS[bioType].unit})
                  </span>
                  <input
                    type="number"
                    step={BIOMETRIC_DEFINITIONS[bioType].step}
                    min={BIOMETRIC_DEFINITIONS[bioType].min}
                    max={BIOMETRIC_DEFINITIONS[bioType].max}
                    value={bioVal}
                    onChange={(e) => setBioVal(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                    required
                  />
                </label>
                <label className="text-xs">
                  <span className="text-muted block mb-1">Note (optional)</span>
                  <input
                    type="text"
                    placeholder="e.g. Morning fasted"
                    value={bioNote}
                    onChange={(e) => setBioNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="button button--tertiary button--sm"
                  onClick={() => setShowBiometricForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button--primary button--sm">
                  Save Biometric
                </button>
              </div>
            </form>
          )}

          {showNoteForm && (
            <form onSubmit={handleSaveNote} className="sp-panel p-3 rounded-xl mt-3 space-y-3">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Note Title (e.g., Post-Workout Energy & Focus)"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                />
                <textarea
                  rows={2}
                  placeholder="Record observations on digestion, exertion recovery, mood, or sleep..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="button button--tertiary button--sm"
                  onClick={() => setShowNoteForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button--primary button--sm">
                  Save Note
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
            {dayLog.biometrics.map((bio) => (
              <div
                key={bio.id}
                className="sp-panel p-2.5 rounded-xl flex items-start justify-between gap-1"
              >
                <div>
                  <span className="text-[11px] text-muted block">{bio.label}</span>
                  <strong className="text-base font-bold">
                    {bio.value} <span className="text-xs font-normal text-muted">{bio.unit}</span>
                  </strong>
                  {bio.notes && <span className="text-[10px] text-muted block">{bio.notes}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveBiometric(bio.id)}
                  className="text-muted hover:text-foreground bg-transparent border-0 p-0.5 cursor-pointer text-xs"
                  title="Remove biometric"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {dayLog.notes.length > 0 && (
            <div className="mt-3 space-y-2">
              {dayLog.notes.map((n) => (
                <div
                  key={n.id}
                  className="sp-panel p-3 rounded-xl flex items-start justify-between gap-2"
                >
                  <div>
                    <strong className="text-xs font-semibold block">{n.title}</strong>
                    <p className="text-xs text-muted m-0 mt-0.5">{n.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveNote(n.id)}
                    className="icon-button button button--tertiary button--icon-only button--sm"
                    title="Delete note"
                  >
                    <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                      <use href="#ti-trash"></use>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cronometer Nutrient Oracle / Suggest Foods */}
        {oracleSuggestions.length > 0 && (
          <div className="sp-card p-4">
            <div className="flex items-center justify-between gap-2 pb-2">
              <div>
                <span className="eyebrow eyebrow--compact">Cronometer Nutrient Oracle</span>
                <h3 className="text-base font-semibold m-0">
                  Suggested Foods to Hit 100% Micronutrients
                </h3>
              </div>
              <button
                type="button"
                className="button button--tertiary button--sm"
                onClick={() => setShowOracleSuggestions(!showOracleSuggestions)}
              >
                {showOracleSuggestions ? 'Hide' : 'Show'}
              </button>
            </div>
            {showOracleSuggestions && (
              <div className="space-y-2.5 mt-2">
                <p className="text-xs text-muted m-0">
                  Ranked by density of today’s remaining vitamin, mineral, and essential fatty acid gaps:
                </p>
                {oracleSuggestions.map(({ food, topContributions }) => (
                  <div
                    key={food.id}
                    className="sp-panel p-3 rounded-xl flex items-center justify-between gap-3 flex-wrap"
                  >
                    <div className="min-w-0 flex-1">
                      <strong className="text-sm font-semibold block truncate">
                        {food.name}
                      </strong>
                      <span className="text-xs text-muted block">
                        {food.defaultServing} ·{' '}
                        {topContributions
                          .map((c) => `+${c.pctOfGap}% ${c.nutrientName}`)
                          .join(' · ')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="button button--secondary button--sm shrink-0"
                      onClick={() => onAddSuggestedFood(food, 'snacks')}
                    >
                      + Log Serving
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== RIGHT COLUMN: CRONOMETER NUTRIENT TARGETS & BALANCES ==================== */}
      <div className="space-y-5">
        {/* Highlighted Nutrients (Cronometer's 8 Circular Gauges) */}
        <div className="sp-card p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <span className="eyebrow eyebrow--compact">Highlighted Micronutrients</span>
              <h3 className="text-base font-semibold m-0">Cronometer 8 Core Targets</h3>
            </div>
            <span className="text-xs text-muted">Click any gauge to see food contributors</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 text-center">
            {HIGHLIGHTED_NUTRIENT_IDS.map((id) => {
              const def = NUTRIENT_DEFINITIONS.find((d) => d.id === id);
              if (!def) return null;
              const current = totals[id] || 0;
              const target = targets[id] || def.defaultTarget;
              const pct = Math.round((current / Math.max(0.01, target)) * 100);
              const clampedPct = Math.min(100, pct);
              const isOverUL = def.upperLimit ? current > def.upperLimit : false;
              const color = isOverUL
                ? '#ef4444'
                : pct >= 100
                ? '#10b981'
                : pct >= 60
                ? '#f59e0b'
                : '#38bdf8';

              const r = 24;
              const c = 2 * Math.PI * r;
              const offset = c * (1 - clampedPct / 100);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedNutrientId(id)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer bg-transparent flex flex-col items-center ${
                    selectedNutrientId === id
                      ? 'border-[var(--primary)] bg-white/5'
                      : 'border-transparent hover:border-[var(--border)]'
                  }`}
                  title={`${def.name}: ${current.toFixed(def.decimals)} / ${target} ${def.unit}`}
                >
                  <div className="relative flex items-center justify-center" style={{ width: 58, height: 58 }}>
                    <svg width="58" height="58" viewBox="0 0 58 58" className="-rotate-90">
                      <circle
                        cx="29"
                        cy="29"
                        r={r}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="5"
                        opacity={0.4}
                      />
                      <circle
                        cx="29"
                        cy="29"
                        r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth="5"
                        strokeDasharray={c}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-xs font-bold text-foreground">{pct}%</span>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground mt-1 truncate w-full">
                    {def.shortName || def.name}
                  </span>
                  <span className="text-[10px] text-muted">
                    {current.toFixed(def.decimals)}
                    {def.unit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Nutrient Contributor Spotlight */}
        <div className="sp-card p-4">
          <div className="flex items-start justify-between gap-3 pb-2 separator-bottom">
            <div>
              <span className="eyebrow eyebrow--compact">Top Diary Contributors</span>
              <h3 className="text-base font-semibold m-0">
                {selectedNutrientDef.name} ({ (totals[selectedNutrientDef.id] || 0).toFixed(selectedNutrientDef.decimals) } /{' '}
                {targets[selectedNutrientDef.id] || selectedNutrientDef.defaultTarget}{' '}
                {selectedNutrientDef.unit})
              </h3>
              <p className="text-xs text-muted m-0 mt-0.5">{selectedNutrientDef.description}</p>
            </div>
            {selectedNutrientDef.upperLimit && (
              <span className="ui-badge ui-badge--sm shrink-0">
                UL: {selectedNutrientDef.upperLimit} {selectedNutrientDef.unit}
              </span>
            )}
          </div>

          {selectedContributors.length === 0 ? (
            <p className="text-xs text-muted m-0 pt-3">
              No logged foods today contain measurable {selectedNutrientDef.name}.
            </p>
          ) : (
            <ul className="space-y-2 mt-3 m-0 p-0 list-none">
              {selectedContributors.slice(0, 5).map((item) => (
                <li key={item.entryId} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate pr-2">
                      {item.foodName}{' '}
                      <span className="text-muted">({MEAL_GROUP_LABELS[item.mealGroup]})</span>
                    </span>
                    <span className="shrink-0">
                      <strong>
                        {item.amount.toFixed(selectedNutrientDef.decimals)}{' '}
                        {selectedNutrientDef.unit}
                      </strong>{' '}
                      <span className="text-muted">({item.pctOfTotal}% of today)</span>
                    </span>
                  </div>
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'rgba(148,163,184,0.16)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, item.pctOfTotal)}%`,
                        backgroundColor: '#10b981',
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cronometer Nutrient Balances (Ratios) */}
        <div className="sp-card p-4">
          <span className="eyebrow eyebrow--compact">Cronometer Nutrient Balances</span>
          <h3 className="text-base font-semibold m-0 mb-3">Electrolyte &amp; Essential Ratios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NUTRIENT_BALANCES.map((bal) => {
              const num = totals[bal.numeratorId] || 0;
              const den = totals[bal.denominatorId] || 0;
              const ratio = den > 0 ? Number((num / den).toFixed(2)) : 0;
              const isOptimal = ratio >= bal.idealMin && ratio <= bal.idealMax;
              return (
                <div key={bal.id} className="sp-panel p-3 rounded-xl">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold">{bal.name}</span>
                    <span
                      className="ui-badge ui-badge--pill ui-badge--sm"
                      style={{
                        backgroundColor: isOptimal
                          ? 'rgba(16, 185, 129, 0.18)'
                          : 'rgba(245, 158, 11, 0.18)',
                        color: isOptimal ? '#34d399' : '#fbbf24',
                      }}
                    >
                      {ratio} : 1
                    </span>
                  </div>
                  <p className="text-[11px] text-muted m-0 mt-1">
                    Ideal target: <strong>{bal.idealMin}–{bal.idealMax} : 1</strong> ({bal.unitLabel})
                  </p>
                  <p className="text-[11px] text-muted m-0 mt-0.5">{bal.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full 6-Group Cronometer Nutrient Breakdown Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {NUTRIENT_GROUPS.map((groupKey) => {
            const defs = NUTRIENT_DEFINITIONS.filter((d) => d.group === groupKey);
            return (
              <div key={groupKey} className="sp-card p-4">
                <div className="flex items-center justify-between pb-2 mb-2 separator-bottom">
                  <h4 className="text-sm font-semibold m-0">{NUTRIENT_GROUP_LABELS[groupKey]}</h4>
                  <span className="text-[11px] text-muted">% Target</span>
                </div>
                <div className="space-y-2">
                  {defs.map((def) => {
                    const current = totals[def.id] || 0;
                    const target = targets[def.id] ?? def.defaultTarget;
                    const hasTarget = target > 0;
                    const pct = hasTarget ? Math.round((current / target) * 100) : 0;
                    const isOverUL = def.upperLimit ? current > def.upperLimit : false;
                    const barColor = isOverUL
                      ? '#ef4444'
                      : pct >= 100
                      ? '#10b981'
                      : pct >= 55
                      ? '#f59e0b'
                      : '#38bdf8';

                    return (
                      <div
                        key={def.id}
                        onClick={() => setSelectedNutrientId(def.id)}
                        className={`cursor-pointer rounded-lg px-2 py-1 transition-colors ${
                          selectedNutrientId === def.id
                            ? 'bg-white/10'
                            : 'hover:bg-white/5'
                        } ${def.isSubNutrient ? 'pl-4' : ''}`}
                        title={`Click to view ${def.name} contributors`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={def.isSubNutrient ? 'text-muted' : 'font-medium'}>
                            {def.isSubNutrient ? `↳ ${def.name}` : def.name}
                          </span>
                          <span className="tabular-nums">
                            <strong>{current.toFixed(def.decimals)}</strong>
                            <span className="text-muted">
                              {hasTarget ? ` / ${target}` : ''} {def.unit}
                            </span>{' '}
                            {hasTarget && (
                              <span
                                className="ml-1 font-semibold"
                                style={{ color: barColor }}
                              >
                                ({pct}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <div
                          className="w-full h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'rgba(148,163,184,0.16)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${hasTarget ? Math.min(100, pct) : current > 0 ? 35 : 0}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
