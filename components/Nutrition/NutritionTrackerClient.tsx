'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import { MockDataTag } from '@/components/MockDataTag';
import {
  useNutritionTracker,
  useNutritionFeatureFlag,
  formatDateKey,
  type MealGroup,
} from '@/app/hooks/useNutritionTracker';
import type { FoodItem } from '@/lib/nutritionDatabase';
import { NutritionEnergyBanner } from './NutritionEnergyBanner';
import { NutritionDiaryView } from './NutritionDiaryView';
import { NutritionTrendsView } from './NutritionTrendsView';
import { NutritionDatabaseView } from './NutritionDatabaseView';
import { NutritionExerciseView } from './NutritionExerciseView';
import { NutritionTargetsView } from './NutritionTargetsView';

export type NutritionTab = 'diary' | 'trends' | 'exercises' | 'database' | 'targets';

const TABS: { id: NutritionTab; label: string; badge?: string }[] = [
  { id: 'diary', label: 'Daily Diary' },
  { id: 'trends', label: 'Trends & Charts' },
  { id: 'exercises', label: 'Exercises & Exertion' },
  { id: 'database', label: 'Nutrition DB List' },
  { id: 'targets', label: 'Targets & Profile' },
];

export default function NutritionTrackerClient() {
  const { nutritionFeatureEnabled, setNutritionFeatureEnabled } = useNutritionFeatureFlag();
  const {
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
  } = useNutritionTracker();

  const [activeTab, setActiveTab] = useState<NutritionTab>('diary');
  const [inspectedFood, setInspectedFood] = useState<FoodItem | null>(null);
  const [preferredMealGroup, setPreferredMealGroup] = useState<MealGroup>('breakfast');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync tab with URL hash if clicked from sidebar subnav
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '') as NutritionTab;
      if (TABS.some((t) => t.id === hash)) {
        setActiveTab(hash);
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleSelectTab = (tab: NutritionTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tab}`);
      window.dispatchEvent(new CustomEvent('skillprint-nutrition-tab-change', { detail: tab }));
    }
  };

  const shiftDate = (daysDelta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const nextDate = new Date(y, m - 1, d + daysDelta);
    setSelectedDate(formatDateKey(nextDate));
  };

  const isToday = selectedDate === formatDateKey(new Date());

  const handleOpenAddFoodForMeal = (meal: MealGroup = 'breakfast') => {
    setPreferredMealGroup(meal);
    handleSelectTab('database');
  };

  const handleInspectFoodInDb = (food: FoodItem) => {
    setInspectedFood(food);
    handleSelectTab('database');
  };

  const handleCopyPreviousDay = () => {
    const ok = copyPreviousDayToCurrent();
    setStatusMessage(
      ok
        ? 'Copied previous day food entries into current diary.'
        : 'No entries found on the previous day to copy.'
    );
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <PortalLayout pageClass="page--portal-nutrition">
      <div className="relative">
        <MockDataTag label="Cronometer DB & Local Storage" inline={false} />
        <PortalHead
          eyebrow="Biometrics, Micronutrients & Exertion"
          title="Nutrition & Physical Exertion Tracker"
          description="Cronometer-grade macro and 45-nutrient tracking, lab-verified food database (NCCDB, USDA, CRDB), Borg RPE physical exertion logging, and longitudinal trend analytics."
        />
      </div>

      <section className="pp-section" id="nutrition-tracker">
        {/* Banner if sidebar flag is currently OFF */}
        {!nutritionFeatureEnabled && (
          <div className="sp-card p-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <strong className="text-sm font-semibold block">
                Sidebar Navigation Item is Currently Hidden
              </strong>
              <p className="text-xs text-muted m-0 mt-0.5">
                The Nutrition Tracker sidebar link is defaulted to OFF in{' '}
                <Link href="/settings" className="underline">
                  Settings
                </Link>
                . You can enable it right here or in Settings.
              </p>
            </div>
            <button
              type="button"
              className="button button--primary button--sm"
              onClick={() => setNutritionFeatureEnabled(true)}
            >
              Show in Sidebar Navigation
            </button>
          </div>
        )}

        {/* Primary Navigation & Date Controls Bar */}
        <div className="sp-card p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
          {/* Mode Tabs */}
          <div className="button-group flex-wrap" role="tablist" aria-label="Nutrition Tracker Sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                aria-pressed={activeTab === t.id}
                className={`button-group__item ${activeTab === t.id ? 'is-active' : ''}`}
                onClick={() => handleSelectTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Date Navigator & Day Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1 sp-panel px-2 py-1 rounded-xl">
              <button
                type="button"
                className="icon-button button button--tertiary button--icon-only button--sm"
                onClick={() => shiftDate(-1)}
                aria-label="Previous day"
                title="Previous day"
              >
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <use href="#ti-chevron-left"></use>
                </svg>
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                aria-label="Selected diary date"
                className="bg-transparent border-0 text-sm font-semibold text-foreground px-1.5 py-0.5 cursor-pointer"
              />
              <button
                type="button"
                className="icon-button button button--tertiary button--icon-only button--sm"
                onClick={() => shiftDate(1)}
                aria-label="Next day"
                title="Next day"
              >
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <use href="#ti-chevron-right"></use>
                </svg>
              </button>
              {!isToday && (
                <button
                  type="button"
                  className="button button--tertiary button--sm"
                  onClick={() => setSelectedDate(formatDateKey(new Date()))}
                >
                  Today
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={toggleDayCompleted}
              className={`button button--sm ${
                currentDayLog.isCompleted ? 'button--primary' : 'button--secondary'
              }`}
              title="Mark day complete for completed-days trend filtering"
            >
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                <use href="#ti-check"></use>
              </svg>
              {currentDayLog.isCompleted ? 'Day Complete' : 'Mark Complete'}
            </button>

            <button
              type="button"
              onClick={handleCopyPreviousDay}
              className="button button--secondary button--sm"
              title="Copy food entries from previous day"
            >
              Copy Prev Day
            </button>

            <button
              type="button"
              onClick={clearCurrentDay}
              className="button button--tertiary button--sm"
              title="Clear all entries for selected date"
            >
              Clear Day
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="sp-alert mb-5" data-alert="" data-alert-tone="success">
            <svg className="sp-icon sp-alert__icon" aria-hidden="true" viewBox="0 0 24 24">
              <use href="#ti-success"></use>
            </svg>
            <div className="sp-alert__body">
              <p className="sp-alert__text">{statusMessage}</p>
            </div>
          </div>
        )}

        {/* Always show Cronometer Energy, Macro & Exertion Banner on Diary tab */}
        {activeTab === 'diary' && isLoaded && (
          <>
            <NutritionEnergyBanner
              summary={currentSummary}
              profile={profile}
              waterMl={currentDayLog.waterMl}
              onAddWater={addWaterMl}
              onOpenAddFood={(meal) => handleOpenAddFoodForMeal(meal || 'breakfast')}
              onOpenAddExercise={() => handleSelectTab('exercises')}
            />

            <NutritionDiaryView
              dayLog={currentDayLog}
              summary={currentSummary}
              profile={profile}
              allFoods={allFoods}
              onOpenAddFood={handleOpenAddFoodForMeal}
              onOpenAddExercise={() => handleSelectTab('exercises')}
              onInspectFood={handleInspectFoodInDb}
              onAddSuggestedFood={(food, meal) =>
                addFoodToDiary(food, meal, food.defaultServing, 1)
              }
              onUpdateFoodEntry={updateFoodEntry}
              onRemoveFoodEntry={removeFoodEntry}
              onRemoveExerciseEntry={removeExerciseEntry}
              onAddBiometric={addBiometricToDiary}
              onRemoveBiometric={removeBiometricEntry}
              onAddNote={addNoteToDiary}
              onRemoveNote={removeNoteEntry}
              getNutrientContributors={getNutrientContributors}
            />
          </>
        )}

        {activeTab === 'trends' && isLoaded && (
          <NutritionTrendsView
            logsByDate={logsByDate}
            profile={profile}
            computeDaySummary={computeDaySummary}
          />
        )}

        {activeTab === 'exercises' && isLoaded && (
          <NutritionExerciseView
            allExercises={allExercises}
            todayExercises={currentDayLog.exercises}
            profile={profile}
            dayTotals={currentSummary.totals}
            onAddExerciseToDiary={addExerciseToDiary}
            onRemoveExerciseEntry={removeExerciseEntry}
            onSaveCustomExercise={saveCustomExercise}
          />
        )}

        {activeTab === 'database' && isLoaded && (
          <NutritionDatabaseView
            allFoods={allFoods}
            targets={currentSummary.targets}
            initialSelectedFood={inspectedFood}
            initialMealGroup={preferredMealGroup}
            onAddFoodToDiary={addFoodToDiary}
            onSaveCustomFood={saveCustomFood}
          />
        )}

        {activeTab === 'targets' && isLoaded && (
          <NutritionTargetsView
            profile={profile}
            dynamicTargets={currentSummary.targets}
            onUpdateProfile={updateProfile}
            onResetDemoData={resetToDemoData}
          />
        )}
      </section>
    </PortalLayout>
  );
}
