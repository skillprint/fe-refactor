'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  getRelativeDateKey,
  BIOMETRIC_DEFINITIONS,
  type NutritionDayLog,
  type NutritionProfileSettings,
  type BiometricType,
} from '@/app/hooks/useNutritionTracker';
import {
  NUTRIENT_DEFINITIONS,
  NUTRIENT_GROUP_LABELS,
  type NutrientGroup,
  type NutrientMap,
} from '@/lib/nutritionDatabase';

interface NutritionTrendsViewProps {
  logsByDate: Record<string, NutritionDayLog>;
  profile: NutritionProfileSettings;
  computeDaySummary: (dayLog: NutritionDayLog) => {
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
}

type TrendRange = '7D' | '14D' | '30D';
type SecondaryOverlayKey =
  | 'none'
  | 'exertionLoad'
  | 'avgRpe'
  | 'exerciseBurn'
  | 'weight'
  | 'restingHR'
  | 'sleepHours'
  | 'readinessScore';

const OVERLAY_OPTIONS: { value: SecondaryOverlayKey; label: string; unit: string; color: string }[] = [
  { value: 'exertionLoad', label: 'Exertion Training Load (sRPE)', unit: 'AU', color: '#f97316' },
  { value: 'avgRpe', label: 'Average Workout RPE (1–10)', unit: 'RPE', color: '#f43f5e' },
  { value: 'exerciseBurn', label: 'Exercise Calories Burned', unit: 'kcal', color: '#fb923c' },
  { value: 'readinessScore', label: 'Physical Readiness Score', unit: '/100', color: '#a855f7' },
  { value: 'weight', label: 'Body Weight', unit: 'kg', color: '#38bdf8' },
  { value: 'restingHR', label: 'Resting Heart Rate', unit: 'bpm', color: '#ef4444' },
  { value: 'sleepHours', label: 'Sleep Duration', unit: 'hrs', color: '#818cf8' },
  { value: 'none', label: 'None (Single Nutrient Only)', unit: '', color: '#94a3b8' },
];

export function NutritionTrendsView({
  logsByDate,
  profile,
  computeDaySummary,
}: NutritionTrendsViewProps) {
  const [range, setRange] = useState<TrendRange>('14D');
  const [completedOnly, setCompletedOnly] = useState<boolean>(false);
  const [selectedNutrientId, setSelectedNutrientId] = useState<string>('magnesium');
  const [secondaryOverlay, setSecondaryOverlay] = useState<SecondaryOverlayKey>('exertionLoad');

  const daysCount = range === '7D' ? 7 : range === '14D' ? 14 : 30;

  const seriesData = useMemo(() => {
    const rows: any[] = [];
    for (let offset = -(daysCount - 1); offset <= 0; offset++) {
      const dateKey = getRelativeDateKey(offset);
      const dayLog = logsByDate[dateKey];
      if (!dayLog) continue;
      if (completedOnly && !dayLog.isCompleted && offset !== 0) continue;

      const hasAnyData =
        dayLog.foods.length > 0 ||
        dayLog.exercises.length > 0 ||
        dayLog.biometrics.length > 0 ||
        dayLog.waterMl > 0;
      if (!hasAnyData) continue;

      const summary = computeDaySummary(dayLog);
      const [, m, d] = dateKey.split('-');
      const shortLabel = `${m}/${d}`;

      const bioMap: Partial<Record<BiometricType, number>> = {};
      for (const b of dayLog.biometrics) {
        bioMap[b.type] = b.value;
      }

      rows.push({
        dateKey,
        label: shortLabel,
        caloriesConsumed: summary.caloriesConsumed,
        totalBurned: summary.totalBurned,
        bmrAndActivity: summary.bmr + summary.baselineActivityBurn,
        exerciseBurn: summary.exerciseBurn,
        targetKcal: summary.targets.kcal || 2300,
        netBalance: summary.netCalorieBalance,
        exertionLoad: summary.totalExertionLoad,
        exerciseMinutes: summary.totalExerciseMinutes,
        avgRpe: summary.avgRpe,
        strainScore: summary.dayStrainScore,
        protein: Math.round(summary.totals.protein || 0),
        netCarbs: Math.round(summary.totals.netCarbs || 0),
        carbs: Math.round(summary.totals.carbs || 0),
        fat: Math.round(summary.totals.fat || 0),
        fiber: Math.round(summary.totals.fiber || 0),
        waterMl: Math.round(summary.totals.water || 0),
        weight: bioMap.weight ?? null,
        restingHR: bioMap.restingHR ?? null,
        sleepHours: bioMap.sleepHours ?? null,
        readinessScore: bioMap.readinessScore ?? null,
        nutrients: summary.totals,
        targets: summary.targets,
      });
    }
    return rows;
  }, [completedOnly, computeDaySummary, daysCount, logsByDate]);

  const selectedNutrientDef = useMemo(
    () => NUTRIENT_DEFINITIONS.find((d) => d.id === selectedNutrientId) || NUTRIENT_DEFINITIONS[0],
    [selectedNutrientId]
  );

  const overlayMeta = useMemo(
    () => OVERLAY_OPTIONS.find((o) => o.value === secondaryOverlay) || OVERLAY_OPTIONS[0],
    [secondaryOverlay]
  );

  const explorerData = useMemo(() => {
    return seriesData.map((row) => ({
      label: row.label,
      dateKey: row.dateKey,
      nutrientVal: Number(
        (row.nutrients[selectedNutrientId] || 0).toFixed(selectedNutrientDef.decimals)
      ),
      overlayVal:
        secondaryOverlay === 'none'
          ? null
          : row[secondaryOverlay] !== undefined
          ? row[secondaryOverlay]
          : null,
    }));
  }, [selectedNutrientDef.decimals, selectedNutrientId, secondaryOverlay, seriesData]);

  // Period Averages for KPI & Cronometer Multi-Day Nutrition Report
  const periodStats = useMemo(() => {
    const count = Math.max(1, seriesData.length);
    const avgConsumed = Math.round(
      seriesData.reduce((s, r) => s + r.caloriesConsumed, 0) / count
    );
    const avgBurned = Math.round(seriesData.reduce((s, r) => s + r.totalBurned, 0) / count);
    const avgProtein = Math.round(seriesData.reduce((s, r) => s + r.protein, 0) / count);
    const avgExertionLoad = Math.round(
      seriesData.reduce((s, r) => s + r.exertionLoad, 0) / count
    );
    const avgStrain = Number(
      (seriesData.reduce((s, r) => s + r.strainScore, 0) / count).toFixed(1)
    );
    const avgRpe = Number(
      (seriesData.reduce((s, r) => s + r.avgRpe, 0) / count).toFixed(1)
    );

    const avgNutrients: NutrientMap = {};
    const latestTargets: Record<string, number> =
      seriesData[seriesData.length - 1]?.targets || {};

    for (const def of NUTRIENT_DEFINITIONS) {
      const sum = seriesData.reduce((s, r) => s + (r.nutrients[def.id] || 0), 0);
      avgNutrients[def.id] = Number((sum / count).toFixed(def.decimals));
    }

    // Overall Micronutrient Completeness % (across vitamins & minerals)
    const microDefs = NUTRIENT_DEFINITIONS.filter(
      (d) => (d.group === 'vitamins' || d.group === 'minerals') && d.defaultTarget > 0
    );
    const microCompletionPct = Math.round(
      microDefs.reduce((acc, d) => {
        const target = latestTargets[d.id] || d.defaultTarget;
        const pct = Math.min(100, ((avgNutrients[d.id] || 0) / Math.max(0.01, target)) * 100);
        return acc + pct;
      }, 0) / Math.max(1, microDefs.length)
    );

    return {
      loggedDays: seriesData.length,
      avgConsumed,
      avgBurned,
      avgProtein,
      avgExertionLoad,
      avgStrain,
      avgRpe,
      avgNutrients,
      latestTargets,
      microCompletionPct,
    };
  }, [seriesData]);

  const targetNutrientValue =
    periodStats.latestTargets[selectedNutrientId] ?? selectedNutrientDef.defaultTarget;

  return (
    <div className="space-y-6 mt-6">
      {/* Top Controls Bar */}
      <div className="sp-card p-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="eyebrow eyebrow--compact">Longitudinal Nutrition &amp; Exertion Analytics</span>
          <h3 className="text-lg font-semibold m-0">
            Cronometer Trends &amp; Multi-Day Nutrition Report ({periodStats.loggedDays} Logged Days)
          </h3>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={completedOnly}
              onChange={(e) => setCompletedOnly(e.target.checked)}
            />
            <span>Completed days only</span>
          </label>
          <div className="button-group" role="group" aria-label="Trend time range">
            {(['7D', '14D', '30D'] as TrendRange[]).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={range === r}
                className={`button-group__item ${range === r ? 'is-active' : ''}`}
                onClick={() => setRange(r)}
              >
                {r === '7D' ? 'Last 7 Days' : r === '14D' ? 'Last 14 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Period KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="sp-card p-3.5">
          <span className="text-xs text-muted block">Avg Consumed</span>
          <strong className="text-xl font-bold block mt-0.5">
            {periodStats.avgConsumed.toLocaleString()} kcal
          </strong>
          <span className="text-[11px] text-muted">Daily intake mean</span>
        </div>
        <div className="sp-card p-3.5">
          <span className="text-xs text-muted block">Avg Burned (TDEE)</span>
          <strong className="text-xl font-bold block mt-0.5" style={{ color: '#f97316' }}>
            {periodStats.avgBurned.toLocaleString()} kcal
          </strong>
          <span className="text-[11px] text-muted">BMR + Activity + Exertion</span>
        </div>
        <div className="sp-card p-3.5">
          <span className="text-xs text-muted block">Avg Daily Protein</span>
          <strong className="text-xl font-bold block mt-0.5" style={{ color: '#10b981' }}>
            {periodStats.avgProtein} g
          </strong>
          <span className="text-[11px] text-muted">
            {(periodStats.avgProtein / Math.max(1, profile.weightKg)).toFixed(1)} g/kg body weight
          </span>
        </div>
        <div className="sp-card p-3.5">
          <span className="text-xs text-muted block">Avg Exertion Load</span>
          <strong className="text-xl font-bold block mt-0.5" style={{ color: '#fb923c' }}>
            {periodStats.avgExertionLoad} AU
          </strong>
          <span className="text-[11px] text-muted">sRPE (Duration × RPE)</span>
        </div>
        <div className="sp-card p-3.5">
          <span className="text-xs text-muted block">Avg Strain / RPE</span>
          <strong className="text-xl font-bold block mt-0.5">
            {periodStats.avgStrain} <span className="text-xs font-normal text-muted">/ 21</span>
          </strong>
          <span className="text-[11px] text-muted">Mean Borg RPE {periodStats.avgRpe}/10</span>
        </div>
        <div className="sp-card p-3.5">
          <span className="text-xs text-muted block">Micronutrient Score</span>
          <strong className="text-xl font-bold block mt-0.5" style={{ color: '#38bdf8' }}>
            {periodStats.microCompletionPct}%
          </strong>
          <span className="text-[11px] text-muted">Vitamins &amp; Minerals RDA</span>
        </div>
      </div>

      {/* Row 1 of Charts: Energy Balance + Physical Exertion Trend */}
      <div
        className="layout-grid gap-2xl"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}
      >
        {/* Chart 1: Consumed vs Burned Energy Trend */}
        <div className="sp-card p-5">
          <div className="mb-3">
            <span className="eyebrow eyebrow--compact">Energy Balance Over Time</span>
            <h4 className="text-base font-semibold m-0">
              Calories Consumed vs. Total Expenditure (BMR + Activity + Exertion)
            </h4>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={seriesData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.75rem',
                    color: 'var(--foreground)',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="caloriesConsumed"
                  name="Consumed (kcal)"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="totalBurned"
                  name="Total Burned (kcal)"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Line
                  type="monotone"
                  dataKey="targetKcal"
                  name="Energy Target"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Physical Exertion Load, Exercise Burn & Borg RPE Trend */}
        <div className="sp-card p-5">
          <div className="mb-3">
            <span className="eyebrow eyebrow--compact">Physical Exertion &amp; RPE Progression</span>
            <h4 className="text-base font-semibold m-0">
              Session Training Load (AU), Exercise Burn &amp; Perceived Exertion (RPE 1–10)
            </h4>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={seriesData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.75rem',
                    color: 'var(--foreground)',
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="exertionLoad"
                  name="Training Load (AU)"
                  fill="#fb923c"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Bar
                  yAxisId="left"
                  dataKey="exerciseBurn"
                  name="Exercise Burn (kcal)"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgRpe"
                  name="Avg Borg RPE (1–10)"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f43f5e' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Cronometer Single / Dual-Axis Nutrient & Biometric Explorer */}
      <div className="sp-card p-5">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
          <div>
            <span className="eyebrow eyebrow--compact">Cronometer Nutrient &amp; Biometric Correlator</span>
            <h4 className="text-base font-semibold m-0">
              {selectedNutrientDef.name} ({selectedNutrientDef.unit})
              {secondaryOverlay !== 'none' ? ` vs. ${overlayMeta.label}` : ''}
            </h4>
            <p className="text-xs text-muted m-0 mt-0.5">
              Compare any of the 45+ tracked nutrients against your daily RDA target, Upper Limit (UL), and physical exertion or biometrics.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs">
              <span className="text-muted block mb-1">Primary Nutrient</span>
              <select
                value={selectedNutrientId}
                onChange={(e) => setSelectedNutrientId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
              >
                {(Object.keys(NUTRIENT_GROUP_LABELS) as NutrientGroup[]).map((group) => (
                  <optgroup
                    key={group}
                    label={NUTRIENT_GROUP_LABELS[group]}
                    className="bg-[#0f172a] text-white"
                  >
                    {NUTRIENT_DEFINITIONS.filter((d) => d.group === group).map((def) => (
                      <option
                        key={def.id}
                        value={def.id}
                        className="bg-[#0f172a] text-white"
                      >
                        {def.name} ({def.unit})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="text-muted block mb-1">Secondary Metric Overlay</span>
              <select
                value={secondaryOverlay}
                onChange={(e) => setSecondaryOverlay(e.target.value as SecondaryOverlayKey)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
              >
                {OVERLAY_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-[#0f172a] text-white"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={explorerData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="nutrient"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              {secondaryOverlay !== 'none' && (
                <YAxis
                  yAxisId="overlay"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
              )}
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.75rem',
                  color: 'var(--foreground)',
                }}
              />
              <Legend />
              {targetNutrientValue > 0 && (
                <ReferenceLine
                  yAxisId="nutrient"
                  y={targetNutrientValue}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: `Daily Target (${targetNutrientValue} ${selectedNutrientDef.unit})`,
                    fill: '#10b981',
                    fontSize: 11,
                    position: 'insideTopLeft',
                  }}
                />
              )}
              {selectedNutrientDef.upperLimit && (
                <ReferenceLine
                  yAxisId="nutrient"
                  y={selectedNutrientDef.upperLimit}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{
                    value: `Upper Limit (${selectedNutrientDef.upperLimit} ${selectedNutrientDef.unit})`,
                    fill: '#ef4444',
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
              )}
              <Area
                yAxisId="nutrient"
                type="monotone"
                dataKey="nutrientVal"
                name={`${selectedNutrientDef.name} (${selectedNutrientDef.unit})`}
                stroke="#38bdf8"
                fill="rgba(56, 189, 248, 0.18)"
                strokeWidth={3}
                dot={{ r: 4, fill: '#38bdf8' }}
              />
              {secondaryOverlay !== 'none' && (
                <Line
                  yAxisId="overlay"
                  type="monotone"
                  dataKey="overlayVal"
                  name={`${overlayMeta.label} (${overlayMeta.unit})`}
                  stroke={overlayMeta.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: overlayMeta.color }}
                  connectNulls
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Macronutrient Composition Trend */}
      <div className="sp-card p-5">
        <div className="mb-3">
          <span className="eyebrow eyebrow--compact">Macronutrient Intake Trend</span>
          <h4 className="text-base font-semibold m-0">
            Daily Protein, Net Carbs, Fat &amp; Fiber (grams/day)
          </h4>
        </div>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seriesData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.75rem',
                  color: 'var(--foreground)',
                }}
              />
              <Legend />
              <Bar dataKey="protein" name="Protein (g)" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="netCarbs" name="Net Carbs (g)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="fat" name="Total Fat (g)" fill="#f43f5e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="fiber" name="Fiber (g)" fill="#a855f7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Day Cronometer Nutrition Report Table */}
      <div className="sp-card p-5">
        <div className="mb-4">
          <span className="eyebrow eyebrow--compact">Cronometer Multi-Day Nutrition Report</span>
          <h4 className="text-base font-semibold m-0">
            Daily Average Nutrient Intake Across Selected Range ({periodStats.loggedDays} Days)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['vitamins', 'minerals', 'protein'] as NutrientGroup[]).map((groupKey) => {
            const defs = NUTRIENT_DEFINITIONS.filter((d) => d.group === groupKey);
            return (
              <div key={groupKey} className="sp-panel p-3.5 rounded-xl">
                <h5 className="text-sm font-semibold m-0 pb-2 mb-2 separator-bottom">
                  {NUTRIENT_GROUP_LABELS[groupKey]} (Period Avg)
                </h5>
                <div className="space-y-2">
                  {defs.map((def) => {
                    const avgVal = periodStats.avgNutrients[def.id] || 0;
                    const target = periodStats.latestTargets[def.id] ?? def.defaultTarget;
                    const pct = target > 0 ? Math.round((avgVal / target) * 100) : 0;
                    const color =
                      pct >= 100 ? '#10b981' : pct >= 65 ? '#f59e0b' : '#38bdf8';
                    return (
                      <div key={def.id} className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span>{def.name}</span>
                          <span>
                            <strong>
                              {avgVal.toFixed(def.decimals)} {def.unit}
                            </strong>{' '}
                            <span style={{ color }}>({pct}%)</span>
                          </span>
                        </div>
                        <div
                          className="w-full h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'rgba(148,163,184,0.16)' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, pct)}%`,
                              backgroundColor: color,
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
