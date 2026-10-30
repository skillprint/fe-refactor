'use client';

import React from 'react';
import {
  ACTIVITY_LEVEL_MULTIPLIERS,
  WEIGHT_GOAL_ADJUSTMENTS,
  MACRO_PRESETS,
  calculateBMR,
  type NutritionProfileSettings,
  type ActivityLevelKey,
  type WeightGoalKey,
  type MacroPresetKey,
} from '@/app/hooks/useNutritionTracker';
import {
  NUTRIENT_DEFINITIONS,
  NUTRIENT_GROUP_LABELS,
  type NutrientGroup,
} from '@/lib/nutritionDatabase';

interface NutritionTargetsViewProps {
  profile: NutritionProfileSettings;
  dynamicTargets: Record<string, number>;
  onUpdateProfile: (patch: Partial<NutritionProfileSettings>) => void;
  onResetDemoData: () => void;
}

export function NutritionTargetsView({
  profile,
  dynamicTargets,
  onUpdateProfile,
  onResetDemoData,
}: NutritionTargetsViewProps) {
  const bmr = calculateBMR(profile);
  const activityMeta =
    ACTIVITY_LEVEL_MULTIPLIERS[profile.activityLevel] ||
    ACTIVITY_LEVEL_MULTIPLIERS.lightly_active;
  const baselineActivityBurn = Math.round(bmr * activityMeta.factor);
  const tdeeBeforeExercise = bmr + baselineActivityBurn;

  const handleCustomTargetChange = (nutrientId: string, valStr: string) => {
    const num = parseFloat(valStr);
    const nextCustom = { ...profile.customTargets };
    if (isNaN(num) || num < 0) {
      delete nextCustom[nutrientId];
    } else {
      nextCustom[nutrientId] = num;
    }
    onUpdateProfile({ customTargets: nextCustom });
  };

  return (
    <div className="space-y-6 mt-6">
      <div
        className="layout-grid gap-2xl items-start"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}
      >
        {/* Left: Biometric Profile & BMR / Energy Expenditure Settings */}
        <div className="sp-card p-5 space-y-4">
          <div className="pb-3 separator-bottom">
            <span className="eyebrow eyebrow--compact">Cronometer Metabolic Profile</span>
            <h3 className="text-lg font-semibold m-0">
              BMR, Baseline Activity &amp; Weight Goal
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <label>
              <span className="text-muted block mb-1">Biological Sex</span>
              <select
                value={profile.sex}
                onChange={(e) =>
                  onUpdateProfile({ sex: e.target.value as 'male' | 'female' })
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
              >
                <option value="male" className="bg-[#0f172a] text-white">
                  Male
                </option>
                <option value="female" className="bg-[#0f172a] text-white">
                  Female
                </option>
              </select>
            </label>

            <label>
              <span className="text-muted block mb-1">Age (Years)</span>
              <input
                type="number"
                min={14}
                max={110}
                value={profile.age}
                onChange={(e) =>
                  onUpdateProfile({ age: parseInt(e.target.value, 10) || 30 })
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm"
              />
            </label>

            <label>
              <span className="text-muted block mb-1">Height (cm)</span>
              <input
                type="number"
                min={100}
                max={240}
                value={profile.heightCm}
                onChange={(e) =>
                  onUpdateProfile({ heightCm: parseFloat(e.target.value) || 175 })
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm"
              />
            </label>

            <label>
              <span className="text-muted block mb-1">Current Weight (kg)</span>
              <input
                type="number"
                step="0.1"
                min={30}
                max={250}
                value={profile.weightKg}
                onChange={(e) =>
                  onUpdateProfile({ weightKg: parseFloat(e.target.value) || 70 })
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm"
              />
            </label>

            <label>
              <span className="text-muted block mb-1">Body Fat (%)</span>
              <input
                type="number"
                step="0.1"
                min={3}
                max={60}
                value={profile.bodyFatPct}
                onChange={(e) =>
                  onUpdateProfile({ bodyFatPct: parseFloat(e.target.value) || 15 })
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm"
              />
            </label>

            <div className="sp-panel p-2.5 rounded-xl flex flex-col justify-center">
              <span className="text-[11px] text-muted">Computed BMR</span>
              <strong className="text-base font-bold">{bmr} kcal/day</strong>
            </div>
          </div>

          <div className="space-y-3 text-xs pt-2 separator-top">
            <label className="block">
              <span className="text-muted block mb-1">
                Baseline Activity Level (Non-Exercise Activity / NEAT)
              </span>
              <select
                value={profile.activityLevel}
                onChange={(e) =>
                  onUpdateProfile({
                    activityLevel: e.target.value as ActivityLevelKey,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
              >
                {Object.entries(ACTIVITY_LEVEL_MULTIPLIERS).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#0f172a] text-white">
                    {v.label} (+{Math.round(bmr * v.factor)} kcal)
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-muted block mt-1">
                {activityMeta.description}
              </span>
            </label>

            <label className="block">
              <span className="text-muted block mb-1">Weight Goal / Energy Balance Target</span>
              <select
                value={profile.weightGoal}
                onChange={(e) =>
                  onUpdateProfile({ weightGoal: e.target.value as WeightGoalKey })
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
              >
                {Object.entries(WEIGHT_GOAL_ADJUSTMENTS).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#0f172a] text-white">
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="sp-panel p-3.5 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <strong className="text-xs font-semibold block">
                  Add Logged Exercise Burn to Daily Calorie Budget
                </strong>
                <span className="text-[11px] text-muted">
                  Automatically increases remaining kcal &amp; macro targets when you log workouts.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.includeExerciseInBudget}
                className="sp-toggle"
                onClick={() =>
                  onUpdateProfile({
                    includeExerciseInBudget: !profile.includeExerciseInBudget,
                  })
                }
              >
                <span className="sp-toggle__thumb" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 separator-top">
              <div>
                <strong className="text-xs font-semibold block">
                  Track Net Carbs Instead of Total Carbs
                </strong>
                <span className="text-[11px] text-muted">
                  Calculates Net Carbs = Total Carbohydrates − Dietary Fiber.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.trackNetCarbs}
                className="sp-toggle"
                onClick={() =>
                  onUpdateProfile({ trackNetCarbs: !profile.trackNetCarbs })
                }
              >
                <span className="sp-toggle__thumb" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 separator-top text-xs">
            <span className="text-muted">
              Baseline TDEE (before workouts): <strong>{tdeeBeforeExercise} kcal</strong>
            </span>
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={onResetDemoData}
            >
              Reset 14-Day Demo Logs
            </button>
          </div>
        </div>

        {/* Right: Macronutrient Preset & Custom Nutrient RDA Overrides */}
        <div className="sp-card p-5 space-y-4">
          <div className="pb-3 separator-bottom">
            <span className="eyebrow eyebrow--compact">Macronutrient &amp; Micronutrient Targets</span>
            <h3 className="text-lg font-semibold m-0">
              Macro Ratio Presets &amp; Custom Nutrient RDA
            </h3>
          </div>

          <label className="block text-xs">
            <span className="text-muted block mb-1">Macronutrient Ratio Preset</span>
            <select
              value={profile.macroPreset}
              onChange={(e) =>
                onUpdateProfile({ macroPreset: e.target.value as MacroPresetKey })
              }
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
            >
              {Object.entries(MACRO_PRESETS).map(([k, v]) => (
                <option key={k} value={k} className="bg-[#0f172a] text-white">
                  {v.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-muted block mt-1">
              {MACRO_PRESETS[profile.macroPreset]?.description}
            </span>
          </label>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="sp-panel p-3 rounded-xl">
              <span className="text-[11px] text-muted block">Protein Target</span>
              <strong className="text-base font-bold" style={{ color: '#10b981' }}>
                {dynamicTargets.protein} g
              </strong>
            </div>
            <div className="sp-panel p-3 rounded-xl">
              <span className="text-[11px] text-muted block">
                {profile.trackNetCarbs ? 'Net Carbs Target' : 'Carbs Target'}
              </span>
              <strong className="text-base font-bold" style={{ color: '#f59e0b' }}>
                {profile.trackNetCarbs ? dynamicTargets.netCarbs : dynamicTargets.carbs} g
              </strong>
            </div>
            <div className="sp-panel p-3 rounded-xl">
              <span className="text-[11px] text-muted block">Fat Target</span>
              <strong className="text-base font-bold" style={{ color: '#f43f5e' }}>
                {dynamicTargets.fat} g
              </strong>
            </div>
          </div>

          <div className="pt-2 separator-top">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted m-0">
                Customize Individual Nutrient Daily Targets
              </h4>
              {Object.keys(profile.customTargets).length > 0 && (
                <button
                  type="button"
                  className="button button--tertiary button--sm"
                  onClick={() => onUpdateProfile({ customTargets: {} })}
                >
                  Reset Overrides
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
              {(['vitamins', 'minerals', 'general'] as NutrientGroup[]).map((group) => (
                <div key={group} className="sp-panel p-3 rounded-xl">
                  <strong className="text-xs font-semibold block mb-2">
                    {NUTRIENT_GROUP_LABELS[group]}
                  </strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {NUTRIENT_DEFINITIONS.filter((d) => d.group === group).map((def) => {
                      const val =
                        profile.customTargets[def.id] ??
                        dynamicTargets[def.id] ??
                        def.defaultTarget;
                      return (
                        <label
                          key={def.id}
                          className="flex items-center justify-between gap-2 py-1"
                        >
                          <span className="truncate">{def.name}</span>
                          <span className="inline-flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              step="any"
                              value={val}
                              onChange={(e) =>
                                handleCustomTargetChange(def.id, e.target.value)
                              }
                              className="w-20 px-2 py-1 rounded border border-[var(--border)] bg-transparent text-right text-xs"
                            />
                            <span className="text-muted w-7">{def.unit}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
