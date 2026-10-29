'use client';

import React from 'react';
import type { MealGroup, NutritionProfileSettings } from '@/app/hooks/useNutritionTracker';
import type { NutrientMap } from '@/lib/nutritionDatabase';

interface NutritionEnergyBannerProps {
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
  waterMl: number;
  onAddWater: (deltaMl: number) => void;
  onOpenAddFood: (meal?: MealGroup) => void;
  onOpenAddExercise: () => void;
}

function CircularGauge({
  value,
  max,
  label,
  sublabel,
  unit = 'kcal',
  accentColor = '#38bdf8',
  secondaryRingPct,
}: {
  value: number;
  max: number;
  label: string;
  sublabel: string;
  unit?: string;
  accentColor?: string;
  secondaryRingPct?: number;
}) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(1, Math.max(0, Math.abs(value) / max)) : 0;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: 112, height: 112 }}>
        <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="9"
            opacity={0.45}
          />
          {typeof secondaryRingPct === 'number' && secondaryRingPct > 0 && (
            <circle
              cx="56"
              cy="56"
              r={radius - 10}
              fill="none"
              stroke="#a855f7"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * (radius - 10)}
              strokeDashoffset={2 * Math.PI * (radius - 10) * (1 - Math.min(1, secondaryRingPct))}
              strokeLinecap="round"
              opacity={0.75}
            />
          )}
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
          <strong className="text-lg font-bold leading-tight">{Math.round(value).toLocaleString()}</strong>
          <span className="text-[11px] uppercase tracking-wider text-muted">{unit}</span>
        </div>
      </div>
      <span className="mt-1.5 text-sm font-semibold">{label}</span>
      <span className="text-xs text-muted">{sublabel}</span>
    </div>
  );
}

export function NutritionEnergyBanner({
  summary,
  profile,
  waterMl,
  onAddWater,
  onOpenAddFood,
  onOpenAddExercise,
}: NutritionEnergyBannerProps) {
  const {
    totals,
    targets,
    bmr,
    baselineActivityBurn,
    exerciseBurn,
    totalBurned,
    caloriesConsumed,
    caloriesRemaining,
    totalExertionLoad,
    totalExerciseMinutes,
    avgRpe,
    dayStrainScore,
    totalSweatLossMl,
  } = summary;

  const carbKey = profile.trackNetCarbs ? 'netCarbs' : 'carbs';
  const carbLabel = profile.trackNetCarbs ? 'Net Carbs' : 'Total Carbs';
  const carbsVal = totals[carbKey] || 0;
  const carbsTarget = targets[carbKey] || 215;

  const proteinVal = totals.protein || 0;
  const proteinTarget = targets.protein || 155;

  const fatVal = totals.fat || 0;
  const fatTarget = targets.fat || 75;

  const fiberVal = totals.fiber || 0;
  const fiberTarget = targets.fiber || 35;

  const totalHydrationMl = Math.round(totals.water || 0);
  const waterTargetMl = targets.water || 3000;

  // Macro calorie distribution
  const proteinKcal = proteinVal * 4;
  const carbKcal = carbsVal * 4;
  const fatKcal = fatVal * 9;
  const totalMacroKcal = Math.max(1, proteinKcal + carbKcal + fatKcal);
  const pPct = Math.round((proteinKcal / totalMacroKcal) * 100);
  const cPct = Math.round((carbKcal / totalMacroKcal) * 100);
  const fPct = Math.max(0, 100 - pPct - cPct);

  const macroRows = [
    {
      id: 'kcal',
      label: 'Energy',
      current: caloriesConsumed,
      target: targets.kcal || 2300,
      unit: 'kcal',
      color: '#38bdf8',
      badge: `${Math.round((caloriesConsumed / Math.max(1, targets.kcal || 2300)) * 100)}%`,
    },
    {
      id: 'protein',
      label: 'Protein',
      current: proteinVal,
      target: proteinTarget,
      unit: 'g',
      color: '#10b981',
      badge: `${pPct}% kcal`,
    },
    {
      id: carbKey,
      label: carbLabel,
      current: carbsVal,
      target: carbsTarget,
      unit: 'g',
      color: '#f59e0b',
      badge: `${cPct}% kcal`,
    },
    {
      id: 'fat',
      label: 'Lipids (Fat)',
      current: fatVal,
      target: fatTarget,
      unit: 'g',
      color: '#f43f5e',
      badge: `${fPct}% kcal`,
    },
    {
      id: 'fiber',
      label: 'Dietary Fiber',
      current: fiberVal,
      target: fiberTarget,
      unit: 'g',
      color: '#a855f7',
      badge: `${Math.round((fiberVal / Math.max(1, fiberTarget)) * 100)}%`,
    },
  ];

  const isOverBudget = caloriesRemaining < 0;

  return (
    <div className="layout-grid gap-xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      {/* Card 1: Cronometer Energy Summary (Consumed / Burned / Remaining) */}
      <div className="sp-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <span className="eyebrow eyebrow--compact">Cronometer Energy Summary</span>
            <h3 className="text-base font-semibold m-0">Calories &amp; Expenditure</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={() => onOpenAddFood('breakfast')}
            >
              + Food
            </button>
            <button
              type="button"
              className="button button--primary button--sm"
              onClick={onOpenAddExercise}
            >
              + Exercise
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 my-2 items-center">
          <CircularGauge
            value={caloriesConsumed}
            max={targets.kcal || 2300}
            label="Consumed"
            sublabel={`${pPct}P / ${cPct}C / ${fPct}F`}
            accentColor="#10b981"
          />
          <CircularGauge
            value={totalBurned}
            max={Math.max(totalBurned, targets.kcal || 2500)}
            label="Burned (TDEE)"
            sublabel={`+${exerciseBurn} kcal Exertion`}
            accentColor="#f97316"
            secondaryRingPct={exerciseBurn / Math.max(1, totalBurned)}
          />
          <CircularGauge
            value={Math.abs(caloriesRemaining)}
            max={targets.kcal || 2300}
            label={isOverBudget ? 'Over Target' : 'Remaining'}
            sublabel={`Target ${Math.round(targets.kcal).toLocaleString()} kcal`}
            accentColor={isOverBudget ? '#ef4444' : '#38bdf8'}
          />
        </div>

        {/* Burned Breakdown Stacked Bar */}
        <div className="mt-4 pt-3 separator-top">
          <div className="flex items-center justify-between text-xs text-muted mb-1.5">
            <span>Expenditure Breakdown</span>
            <span className="font-semibold text-foreground">{totalBurned.toLocaleString()} kcal burned</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-black/20">
            <div
              style={{
                width: `${(bmr / Math.max(1, totalBurned)) * 100}%`,
                backgroundColor: '#6366f1',
              }}
              title={`BMR: ${bmr} kcal`}
            />
            <div
              style={{
                width: `${(baselineActivityBurn / Math.max(1, totalBurned)) * 100}%`,
                backgroundColor: '#0ea5e9',
              }}
              title={`Baseline Activity: ${baselineActivityBurn} kcal`}
            />
            <div
              style={{
                width: `${(exerciseBurn / Math.max(1, totalBurned)) * 100}%`,
                backgroundColor: '#f97316',
              }}
              title={`Logged Exercise: ${exerciseBurn} kcal`}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#6366f1' }} />
              BMR: <strong>{bmr}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#0ea5e9' }} />
              Activity: <strong>{baselineActivityBurn}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#f97316' }} />
              Exercise: <strong>{exerciseBurn} kcal</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Macronutrient Targets & Hydration */}
      <div className="sp-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <span className="eyebrow eyebrow--compact">Macronutrient Targets</span>
              <h3 className="text-base font-semibold m-0">Primary Macros &amp; Fiber</h3>
            </div>
            <span className="ui-badge ui-badge--pill ui-badge--sm">
              {profile.trackNetCarbs ? 'Tracking Net Carbs' : 'Tracking Total Carbs'}
            </span>
          </div>

          <div className="space-y-3">
            {macroRows.map((row) => {
              const pct = Math.min(100, Math.round((row.current / Math.max(1, row.target)) * 100));
              const rawPct = Math.round((row.current / Math.max(1, row.target)) * 100);
              return (
                <div key={row.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold">
                      {row.label}{' '}
                      <span className="text-muted font-normal">({row.badge})</span>
                    </span>
                    <span>
                      <strong>{Number(row.current.toFixed(row.unit === 'kcal' ? 0 : 1))}</strong>
                      <span className="text-muted">
                        {' '}
                        / {row.target} {row.unit} ({rawPct}%)
                      </span>
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'rgba(148, 163, 184, 0.18)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hydration Quick Tracker */}
        <div className="mt-4 pt-3 separator-top">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold flex items-center gap-1.5">
              <span style={{ color: '#38bdf8' }}>●</span> Total Hydration (Water + Food Moisture)
            </span>
            <span>
              <strong>{totalHydrationMl}</strong> / {waterTargetMl} ml (
              {Math.round((totalHydrationMl / Math.max(1, waterTargetMl)) * 100)}%)
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden mb-2.5"
            style={{ backgroundColor: 'rgba(56, 189, 248, 0.16)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (totalHydrationMl / Math.max(1, waterTargetMl)) * 100)}%`,
                backgroundColor: '#38bdf8',
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-muted">
              Logged Water: <strong>{waterMl} ml</strong> ({Math.round(waterMl / 250)} cups)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="button button--tertiary button--sm"
                onClick={() => onAddWater(-250)}
                disabled={waterMl <= 0}
                title="Remove 250ml"
              >
                -250ml
              </button>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => onAddWater(250)}
              >
                +250ml Cup
              </button>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => onAddWater(500)}
              >
                +500ml Bottle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Physical Exertion & Biometric Strain Monitor */}
      <div className="sp-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <span className="eyebrow eyebrow--compact">Physical Exertion &amp; Strain</span>
              <h3 className="text-base font-semibold m-0">Daily Training Load</h3>
            </div>
            <span
              className="ui-badge ui-badge--pill ui-badge--sm"
              style={{
                backgroundColor:
                  dayStrainScore >= 14
                    ? 'rgba(249, 115, 22, 0.2)'
                    : dayStrainScore >= 8
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(56, 189, 248, 0.2)',
                color:
                  dayStrainScore >= 14
                    ? '#fb923c'
                    : dayStrainScore >= 8
                    ? '#34d399'
                    : '#38bdf8',
              }}
            >
              {dayStrainScore >= 14
                ? 'High Exertion'
                : dayStrainScore >= 8
                ? 'Optimal Training'
                : dayStrainScore > 0
                ? 'Light / Recovery'
                : 'Rest Day'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2">
            <div className="sp-panel p-3 rounded-xl">
              <span className="text-xs text-muted block">Day Strain (0–21)</span>
              <strong className="text-2xl font-bold" style={{ color: '#f97316' }}>
                {dayStrainScore}
              </strong>
              <span className="text-[11px] text-muted block mt-0.5">
                {totalExertionLoad} AU (sRPE Load)
              </span>
            </div>
            <div className="sp-panel p-3 rounded-xl">
              <span className="text-xs text-muted block">Active Duration</span>
              <strong className="text-2xl font-bold">{totalExerciseMinutes} min</strong>
              <span className="text-[11px] text-muted block mt-0.5">
                Avg RPE: <strong>{avgRpe || '—'} / 10</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(148,163,184,0.08)' }}>
              <span className="text-[11px] text-muted block">Exertion Burn</span>
              <strong className="text-sm font-semibold">{exerciseBurn} kcal</strong>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(148,163,184,0.08)' }}>
              <span className="text-[11px] text-muted block">Est. Sweat Loss</span>
              <strong className="text-sm font-semibold">{totalSweatLossMl} ml</strong>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(148,163,184,0.08)' }}>
              <span className="text-[11px] text-muted block">Glycogen Used</span>
              <strong className="text-sm font-semibold">{summary.totalGlycogenUsedG} g</strong>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 separator-top flex items-center justify-between gap-2">
          <div className="text-xs text-muted">
            {totalSweatLossMl > 400 ? (
              <span>
                Replenish <strong>+{summary.totalSodiumLossMg}mg Na</strong> &amp;{' '}
                <strong>+{totalSweatLossMl}ml H₂O</strong> for cognitive recovery.
              </span>
            ) : (
              <span>Log workouts with Borg RPE (1–10) &amp; HR zones to track strain.</span>
            )}
          </div>
          <button
            type="button"
            className="button button--secondary button--sm shrink-0"
            onClick={onOpenAddExercise}
          >
            Log Exertion
          </button>
        </div>
      </div>
    </div>
  );
}
