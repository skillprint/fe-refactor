'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  MEAL_GROUP_LABELS,
  type MealGroup,
} from '@/app/hooks/useNutritionTracker';
import {
  NUTRIENT_DEFINITIONS,
  NUTRIENT_GROUP_LABELS,
  calculateFoodNutrients,
  type FoodItem,
  type FoodDatabaseSource,
  type FoodCategory,
  type NutrientGroup,
  type NutrientMap,
} from '@/lib/nutritionDatabase';

interface NutritionDatabaseViewProps {
  allFoods: FoodItem[];
  targets: Record<string, number>;
  initialSelectedFood?: FoodItem | null;
  initialMealGroup?: MealGroup;
  onAddFoodToDiary: (food: FoodItem, mealGroup: MealGroup, servingLabel: string, quantity: number) => void;
  onSaveCustomFood: (food: FoodItem) => void;
}

const DB_SOURCES: ('All' | FoodDatabaseSource)[] = ['All', 'NCCDB', 'USDA', 'CRDB', 'Custom'];

const FOOD_CATEGORIES: ('All' | FoodCategory)[] = [
  'All',
  'Protein & Meats',
  'Seafood',
  'Dairy & Eggs',
  'Vegetables',
  'Fruits',
  'Grains & Starches',
  'Legumes & Nuts',
  'Fats & Oils',
  'Beverages & Hydration',
  'Supplements & Sports',
  'Custom & Recipes',
];

const ORACLE_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'default', label: 'Default (Category & Relevance)' },
  { value: 'protein', label: 'Highest Protein (per 100g)' },
  { value: 'fiber', label: 'Highest Fiber (per 100g)' },
  { value: 'iron', label: 'Highest Iron (per 100g)' },
  { value: 'magnesium', label: 'Highest Magnesium (per 100g)' },
  { value: 'potassium', label: 'Highest Potassium (per 100g)' },
  { value: 'calcium', label: 'Highest Calcium (per 100g)' },
  { value: 'omega3', label: 'Highest Omega-3 (per 100g)' },
  { value: 'vitC', label: 'Highest Vitamin C (per 100g)' },
  { value: 'vitD', label: 'Highest Vitamin D (per 100g)' },
  { value: 'vitB12', label: 'Highest Vitamin B12 (per 100g)' },
  { value: 'choline', label: 'Highest Choline (per 100g)' },
  { value: 'zinc', label: 'Highest Zinc (per 100g)' },
  { value: 'low_kcal', label: 'Lowest Calorie Density (per 100g)' },
];

export function NutritionDatabaseView({
  allFoods,
  targets,
  initialSelectedFood,
  initialMealGroup = 'lunch',
  onAddFoodToDiary,
  onSaveCustomFood,
}: NutritionDatabaseViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'All' | FoodDatabaseSource>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | FoodCategory>('All');
  const [oracleSort, setOracleSort] = useState<string>('default');

  const [selectedFoodId, setSelectedFoodId] = useState<string>(
    initialSelectedFood?.id || allFoods[0]?.id || ''
  );
  const [servingLabel, setServingLabel] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [targetMeal, setTargetMeal] = useState<MealGroup>(initialMealGroup);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Custom Food / Recipe Creator state
  const [creatorMode, setCreatorMode] = useState<'none' | 'food' | 'recipe'>('none');
  const [customName, setCustomName] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customServingLabel, setCustomServingLabel] = useState('1 serving (100g)');
  const [customServingGrams, setCustomServingGrams] = useState('100');
  const [customKcal, setCustomKcal] = useState('220');
  const [customProtein, setCustomProtein] = useState('22');
  const [customCarbs, setCustomCarbs] = useState('18');
  const [customFiber, setCustomFiber] = useState('4');
  const [customFat, setCustomFat] = useState('7');
  const [customSodium, setCustomSodium] = useState('180');
  const [customPotassium, setCustomPotassium] = useState('320');
  const [customMagnesium, setCustomMagnesium] = useState('45');
  const [customIron, setCustomIron] = useState('2.1');
  const [customCalcium, setCustomCalcium] = useState('80');

  // Recipe Builder state
  const [recipeName, setRecipeName] = useState('');
  const [recipeServingsCount, setRecipeServingsCount] = useState(2);
  const [recipeIngredientFoodId, setRecipeIngredientFoodId] = useState(allFoods[0]?.id || '');
  const [recipeIngredientQty, setRecipeIngredientQty] = useState(1);
  const [recipeIngredients, setRecipeIngredients] = useState<
    { foodId: string; foodName: string; servingLabel: string; quantity: number; grams: number; nutrients: NutrientMap }[]
  >([]);

  useEffect(() => {
    if (initialSelectedFood) {
      setSelectedFoodId(initialSelectedFood.id);
      setServingLabel(initialSelectedFood.defaultServing);
      setQuantity(1);
    }
  }, [initialSelectedFood]);

  useEffect(() => {
    if (initialMealGroup) {
      setTargetMeal(initialMealGroup);
    }
  }, [initialMealGroup]);

  const filteredFoods = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = allFoods.filter((food) => {
      if (sourceFilter !== 'All' && food.source !== sourceFilter) return false;
      if (categoryFilter !== 'All' && food.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        food.name.toLowerCase().includes(q) ||
        food.category.toLowerCase().includes(q) ||
        (food.brand && food.brand.toLowerCase().includes(q)) ||
        food.sourceCode.toLowerCase().includes(q)
      );
    });

    if (oracleSort === 'default') return list;
    if (oracleSort === 'low_kcal') {
      return [...list].sort(
        (a, b) => (a.nutrientsPer100g.kcal || 0) - (b.nutrientsPer100g.kcal || 0)
      );
    }
    return [...list].sort(
      (a, b) => (b.nutrientsPer100g[oracleSort] || 0) - (a.nutrientsPer100g[oracleSort] || 0)
    );
  }, [allFoods, categoryFilter, oracleSort, searchQuery, sourceFilter]);

  const selectedFood = useMemo(
    () =>
      allFoods.find((f) => f.id === selectedFoodId) ||
      filteredFoods[0] ||
      allFoods[0],
    [allFoods, filteredFoods, selectedFoodId]
  );

  useEffect(() => {
    if (selectedFood && (!servingLabel || !selectedFood.servings.some((s) => s.label === servingLabel))) {
      setServingLabel(selectedFood.defaultServing);
    }
  }, [selectedFood, servingLabel]);

  const inspectedCalculation = useMemo(() => {
    if (!selectedFood) return { grams: 100, nutrients: {} as NutrientMap };
    return calculateFoodNutrients(
      selectedFood,
      servingLabel || selectedFood.defaultServing,
      quantity || 1
    );
  }, [quantity, selectedFood, servingLabel]);

  const handleLogSelectedFood = () => {
    if (!selectedFood) return;
    onAddFoodToDiary(
      selectedFood,
      targetMeal,
      servingLabel || selectedFood.defaultServing,
      quantity || 1
    );
    setAddedToast(`Logged ${quantity} × ${servingLabel || selectedFood.defaultServing} of ${selectedFood.name} to ${MEAL_GROUP_LABELS[targetMeal]}`);
    setTimeout(() => setAddedToast(null), 3500);
  };

  const handleCreateCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const g = Math.max(1, parseFloat(customServingGrams) || 100);
    const scaleTo100 = 100 / g;
    const carbs = (parseFloat(customCarbs) || 0) * scaleTo100;
    const fiber = (parseFloat(customFiber) || 0) * scaleTo100;

    const newFood: FoodItem = {
      id: `custom-food-${Date.now()}`,
      name: customName.trim(),
      brand: customBrand.trim() || 'Custom Entry',
      source: 'Custom',
      sourceCode: `CUSTOM #${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Custom & Recipes',
      defaultServing: customServingLabel.trim() || `1 serving (${g}g)`,
      servings: [
        { label: customServingLabel.trim() || `1 serving (${g}g)`, grams: g },
        { label: '100g', grams: 100 },
      ],
      isCustom: true,
      nutrientsPer100g: {
        kcal: Number(((parseFloat(customKcal) || 0) * scaleTo100).toFixed(0)),
        protein: Number(((parseFloat(customProtein) || 0) * scaleTo100).toFixed(1)),
        carbs: Number(carbs.toFixed(1)),
        fiber: Number(fiber.toFixed(1)),
        netCarbs: Number(Math.max(0, carbs - fiber).toFixed(1)),
        fat: Number(((parseFloat(customFat) || 0) * scaleTo100).toFixed(1)),
        sodium: Number(((parseFloat(customSodium) || 0) * scaleTo100).toFixed(0)),
        potassium: Number(((parseFloat(customPotassium) || 0) * scaleTo100).toFixed(0)),
        magnesium: Number(((parseFloat(customMagnesium) || 0) * scaleTo100).toFixed(0)),
        iron: Number(((parseFloat(customIron) || 0) * scaleTo100).toFixed(1)),
        calcium: Number(((parseFloat(customCalcium) || 0) * scaleTo100).toFixed(0)),
      },
    };
    onSaveCustomFood(newFood);
    setSelectedFoodId(newFood.id);
    setCreatorMode('none');
    setCustomName('');
  };

  const handleAddIngredientToRecipe = () => {
    const ingFood = allFoods.find((f) => f.id === recipeIngredientFoodId);
    if (!ingFood) return;
    const calc = calculateFoodNutrients(ingFood, ingFood.defaultServing, recipeIngredientQty);
    setRecipeIngredients((prev) => [
      ...prev,
      {
        foodId: ingFood.id,
        foodName: ingFood.name,
        servingLabel: ingFood.defaultServing,
        quantity: recipeIngredientQty,
        grams: calc.grams,
        nutrients: calc.nutrients,
      },
    ]);
  };

  const handleSaveCustomRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim() || recipeIngredients.length === 0) return;

    const totalGrams = Math.max(
      1,
      recipeIngredients.reduce((s, i) => s + i.grams, 0)
    );
    const servingsCount = Math.max(1, recipeServingsCount);
    const gramsPerServing = Math.round(totalGrams / servingsCount);

    const nutrientsPer100g: NutrientMap = {};
    for (const def of NUTRIENT_DEFINITIONS) {
      const totalNutrient = recipeIngredients.reduce(
        (s, i) => s + (i.nutrients[def.id] || 0),
        0
      );
      nutrientsPer100g[def.id] = Number(
        ((totalNutrient / totalGrams) * 100).toFixed(def.decimals + 1)
      );
    }

    const recipeFood: FoodItem = {
      id: `custom-recipe-${Date.now()}`,
      name: `${recipeName.trim()} (Custom Recipe)`,
      brand: `Homemade · ${servingsCount} Servings`,
      source: 'Custom',
      sourceCode: `RECIPE #${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Custom & Recipes',
      defaultServing: `1 serving (${gramsPerServing}g)`,
      servings: [
        { label: `1 serving (${gramsPerServing}g)`, grams: gramsPerServing },
        { label: `Full batch (${Math.round(totalGrams)}g)`, grams: Math.round(totalGrams) },
        { label: '100g', grams: 100 },
      ],
      isCustom: true,
      isRecipe: true,
      recipeIngredients: recipeIngredients.map((i) => ({
        foodId: i.foodId,
        foodName: i.foodName,
        servingLabel: i.servingLabel,
        quantity: i.quantity,
        grams: i.grams,
      })),
      nutrientsPer100g,
    };

    onSaveCustomFood(recipeFood);
    setSelectedFoodId(recipeFood.id);
    setCreatorMode('none');
    setRecipeName('');
    setRecipeIngredients([]);
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Database Controls Header */}
      <div className="sp-card p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-3 separator-bottom">
          <div>
            <span className="eyebrow eyebrow--compact">Cronometer Verified Food Databases</span>
            <h3 className="text-lg font-semibold m-0">
              Nutrition DB List ({filteredFoods.length} Foods · NCCDB, USDA, CRDB &amp; Custom)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={() => setCreatorMode(creatorMode === 'food' ? 'none' : 'food')}
            >
              + Create Custom Food
            </button>
            <button
              type="button"
              className="button button--secondary button--sm"
              onClick={() => setCreatorMode(creatorMode === 'recipe' ? 'none' : 'recipe')}
            >
              + Create Custom Recipe
            </button>
          </div>
        </div>

        {/* Custom Food Creator Drawer */}
        {creatorMode === 'food' && (
          <form onSubmit={handleCreateCustomFood} className="sp-panel p-4 rounded-xl my-3 space-y-3">
            <h4 className="text-sm font-semibold m-0">Create Custom Food Item</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <label>
                <span className="text-muted block mb-1">Food Name *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grass-Fed Bone Broth"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                />
              </label>
              <label>
                <span className="text-muted block mb-1">Brand / Source Note</span>
                <input
                  type="text"
                  placeholder="e.g., Kettle & Fire"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                />
              </label>
              <label>
                <span className="text-muted block mb-1">Serving Label</span>
                <input
                  type="text"
                  value={customServingLabel}
                  onChange={(e) => setCustomServingLabel(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                />
              </label>
              <label>
                <span className="text-muted block mb-1">Serving Weight (grams)</span>
                <input
                  type="number"
                  value={customServingGrams}
                  onChange={(e) => setCustomServingGrams(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              <label>
                <span className="text-muted block mb-1">Calories (kcal)</span>
                <input type="number" step="1" value={customKcal} onChange={(e) => setCustomKcal(e.target.value)} className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              </label>
              <label>
                <span className="text-muted block mb-1">Protein (g)</span>
                <input type="number" step="0.1" value={customProtein} onChange={(e) => setCustomProtein(e.target.value)} className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              </label>
              <label>
                <span className="text-muted block mb-1">Total Carbs (g)</span>
                <input type="number" step="0.1" value={customCarbs} onChange={(e) => setCustomCarbs(e.target.value)} className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              </label>
              <label>
                <span className="text-muted block mb-1">Fiber (g)</span>
                <input type="number" step="0.1" value={customFiber} onChange={(e) => setCustomFiber(e.target.value)} className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              </label>
              <label>
                <span className="text-muted block mb-1">Total Fat (g)</span>
                <input type="number" step="0.1" value={customFat} onChange={(e) => setCustomFat(e.target.value)} className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              </label>
              <label>
                <span className="text-muted block mb-1">Sodium (mg)</span>
                <input type="number" step="1" value={customSodium} onChange={(e) => setCustomSodium(e.target.value)} className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              </label>
              <label>
                <span className="text-muted block mb-1">Potassium (mg)</span>
                <input type="number" step="1" value={customPotassium} onChange={(e) => setCustomPotassium(e.target.value)} className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              </label>
              <label>
                <span className="text-muted block mb-1">Magnesium (mg)</span>
                <input type="number" step="1" value={customMagnesium} onChange={(e) => setCustomMagnesium(e.target.value)} className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              </label>
              <label>
                <span className="text-muted block mb-1">Iron (mg)</span>
                <input type="number" step="0.1" value={customIron} onChange={(e) => setCustomIron(e.target.value)} className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              </label>
              <label>
                <span className="text-muted block mb-1">Calcium (mg)</span>
                <input type="number" step="1" value={customCalcium} onChange={(e) => setCustomCalcium(e.target.value)} className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent" />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="button button--tertiary button--sm" onClick={() => setCreatorMode('none')}>
                Cancel
              </button>
              <button type="submit" className="button button--primary button--sm">
                Save Custom Food to DB
              </button>
            </div>
          </form>
        )}

        {/* Custom Recipe Builder Drawer */}
        {creatorMode === 'recipe' && (
          <form onSubmit={handleSaveCustomRecipe} className="sp-panel p-4 rounded-xl my-3 space-y-3">
            <h4 className="text-sm font-semibold m-0">Cronometer Multi-Ingredient Recipe Builder</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="sm:col-span-2">
                <span className="text-muted block mb-1">Recipe Name *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g., Post-Workout Berry Protein Smoothie"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                />
              </label>
              <label>
                <span className="text-muted block mb-1">Total Servings Yield</span>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={recipeServingsCount}
                  onChange={(e) => setRecipeServingsCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                />
              </label>
            </div>

            <div className="flex items-end gap-2 flex-wrap text-xs">
              <label className="flex-1 min-w-[220px]">
                <span className="text-muted block mb-1">Select Ingredient from DB</span>
                <select
                  value={recipeIngredientFoodId}
                  onChange={(e) => setRecipeIngredientFoodId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                >
                  {allFoods.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#0f172a] text-white">
                      {f.name} ({f.defaultServing})
                    </option>
                  ))}
                </select>
              </label>
              <label className="w-24">
                <span className="text-muted block mb-1">Servings</span>
                <input
                  type="number"
                  step="0.25"
                  min="0.1"
                  value={recipeIngredientQty}
                  onChange={(e) => setRecipeIngredientQty(parseFloat(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm"
                />
              </label>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={handleAddIngredientToRecipe}
              >
                + Add Ingredient
              </button>
            </div>

            {recipeIngredients.length > 0 && (
              <ul className="divide-y divide-[var(--border)] text-xs m-0 p-0 list-none">
                {recipeIngredients.map((ing, i) => (
                  <li key={i} className="py-1.5 flex justify-between items-center">
                    <span>
                      <strong>{ing.foodName}</strong> ({ing.quantity} × {ing.servingLabel} = {ing.grams}g)
                    </span>
                    <span>
                      {Math.round(ing.nutrients.kcal || 0)} kcal · {Math.round(ing.nutrients.protein || 0)}g P
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" className="button button--tertiary button--sm" onClick={() => setCreatorMode('none')}>
                Cancel
              </button>
              <button
                type="submit"
                className="button button--primary button--sm"
                disabled={recipeIngredients.length === 0 || !recipeName.trim()}
              >
                Save Recipe ({recipeIngredients.length} ingredients)
              </button>
            </div>
          </form>
        )}

        {/* Search, Source Filter, Category Filter, and Nutrient Oracle Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div>
            <label className="text-xs text-muted block mb-1">Search Food Name, Brand or Code</label>
            <input
              type="search"
              placeholder="Search salmon, oats, chia, steak, NCCDB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Food Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'All' | FoodCategory)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
            >
              {FOOD_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#0f172a] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Cronometer Nutrient Oracle Sort</label>
            <select
              value={oracleSort}
              onChange={(e) => setOracleSort(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
            >
              {ORACLE_SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0f172a] text-white">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DB Source Filter Tabs */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-muted mr-1">Database Source:</span>
          {DB_SOURCES.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setSourceFilter(src)}
              className={`button button--sm ${
                sourceFilter === src ? 'button--primary' : 'button--secondary'
              }`}
            >
              {src === 'All'
                ? 'All Sources'
                : src === 'NCCDB'
                ? 'NCCDB (Lab 75+ Nutrients)'
                : src === 'USDA'
                ? 'USDA SR Legacy'
                : src === 'CRDB'
                ? 'CRDB (Branded)'
                : 'Custom Foods & Recipes'}
            </button>
          ))}
        </div>
      </div>

      {addedToast && (
        <div className="sp-alert" data-alert="" data-alert-tone="success">
          <svg className="sp-icon sp-alert__icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-success"></use>
          </svg>
          <div className="sp-alert__body">
            <span className="sp-alert__title">Added to Diary</span>
            <p className="sp-alert__text">{addedToast}</p>
          </div>
        </div>
      )}

      {/* Main Split View: Food DB Table (Left) + Complete 45-Nutrient Inspector (Right) */}
      <div
        className="layout-grid gap-2xl items-start"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}
      >
        {/* Left: Scrollable Food Database List */}
        <div className="sp-card p-4">
          <div className="flex items-center justify-between pb-2 mb-2 separator-bottom">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Database Results ({filteredFoods.length})
            </span>
            <span className="text-xs text-muted">Per 100g / Default Serving</span>
          </div>

          <div className="space-y-1.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredFoods.map((food) => {
              const isSelected = selectedFood?.id === food.id;
              const n100 = food.nutrientsPer100g;
              return (
                <div
                  key={food.id}
                  onClick={() => {
                    setSelectedFoodId(food.id);
                    setServingLabel(food.defaultServing);
                    setQuantity(1);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--primary)] bg-white/10'
                      : 'border-transparent hover:border-[var(--border)] hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-semibold">{food.name}</strong>
                        <span className="ui-badge ui-badge--sm">{food.source}</span>
                      </div>
                      <span className="text-xs text-muted block mt-0.5">
                        {food.category} · {food.sourceCode} · Default: {food.defaultServing}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <strong className="text-sm block">{Math.round(n100.kcal || 0)} kcal</strong>
                      <span className="text-[11px] text-muted">per 100g</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted flex-wrap">
                    <span>
                      P: <strong className="text-foreground">{n100.protein || 0}g</strong>
                    </span>
                    <span>
                      Net C: <strong className="text-foreground">{n100.netCarbs || 0}g</strong>
                    </span>
                    <span>
                      Fiber: <strong className="text-foreground">{n100.fiber || 0}g</strong>
                    </span>
                    <span>
                      F: <strong className="text-foreground">{n100.fat || 0}g</strong>
                    </span>
                    {oracleSort !== 'default' && oracleSort !== 'low_kcal' && (
                      <span className="ui-badge ui-badge--pill ui-badge--sm">
                        {oracleSort}: {n100[oracleSort] || 0}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cronometer Full Food Nutrient Inspector */}
        {selectedFood && (
          <div className="sp-card p-5 space-y-4">
            <div className="pb-3 separator-bottom">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="eyebrow eyebrow--compact">
                  {selectedFood.source} · {selectedFood.sourceCode}
                </span>
                <span className="ui-badge ui-badge--pill ui-badge--sm">
                  {selectedFood.category}
                </span>
              </div>
              <h3 className="text-lg font-bold m-0 mt-1">{selectedFood.name}</h3>
              {selectedFood.brand && (
                <p className="text-xs text-muted m-0 mt-0.5">{selectedFood.brand}</p>
              )}
            </div>

            {/* Serving Size, Quantity & Add to Diary Controls */}
            <div className="sp-panel p-3.5 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <label>
                  <span className="text-muted block mb-1">Serving Size</span>
                  <select
                    value={servingLabel}
                    onChange={(e) => setServingLabel(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                  >
                    {selectedFood.servings.map((s) => (
                      <option key={s.label} value={s.label} className="bg-[#0f172a] text-white">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-muted block mb-1">Quantity</span>
                  <input
                    type="number"
                    step="0.25"
                    min="0.1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                  />
                </label>

                <label>
                  <span className="text-muted block mb-1">Diary Meal Group</span>
                  <select
                    value={targetMeal}
                    onChange={(e) => setTargetMeal(e.target.value as MealGroup)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-sm text-foreground"
                  >
                    {(Object.keys(MEAL_GROUP_LABELS) as MealGroup[]).map((m) => (
                      <option key={m} value={m} className="bg-[#0f172a] text-white">
                        {MEAL_GROUP_LABELS[m]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 separator-top">
                <div className="text-xs">
                  <span className="text-muted">Selected Portion: </span>
                  <strong>{inspectedCalculation.grams}g</strong> ·{' '}
                  <strong style={{ color: '#10b981' }}>
                    {Math.round(inspectedCalculation.nutrients.kcal || 0)} kcal
                  </strong>
                </div>
                <button
                  type="button"
                  className="button button--primary button--sm"
                  onClick={handleLogSelectedFood}
                >
                  + Add to {MEAL_GROUP_LABELS[targetMeal]}
                </button>
              </div>
            </div>

            {/* Macro Summary Strip for Selected Serving */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="sp-panel p-2.5 rounded-xl">
                <span className="text-[11px] text-muted block">Energy</span>
                <strong className="text-base font-bold">
                  {Math.round(inspectedCalculation.nutrients.kcal || 0)} kcal
                </strong>
              </div>
              <div className="sp-panel p-2.5 rounded-xl">
                <span className="text-[11px] text-muted block">Protein</span>
                <strong className="text-base font-bold" style={{ color: '#10b981' }}>
                  {(inspectedCalculation.nutrients.protein || 0).toFixed(1)} g
                </strong>
              </div>
              <div className="sp-panel p-2.5 rounded-xl">
                <span className="text-[11px] text-muted block">Net Carbs</span>
                <strong className="text-base font-bold" style={{ color: '#f59e0b' }}>
                  {(inspectedCalculation.nutrients.netCarbs || 0).toFixed(1)} g
                </strong>
              </div>
              <div className="sp-panel p-2.5 rounded-xl">
                <span className="text-[11px] text-muted block">Total Fat</span>
                <strong className="text-base font-bold" style={{ color: '#f43f5e' }}>
                  {(inspectedCalculation.nutrients.fat || 0).toFixed(1)} g
                </strong>
              </div>
            </div>

            {/* Full 45+ Nutrient Profile for Selected Portion */}
            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
              {(Object.keys(NUTRIENT_GROUP_LABELS) as NutrientGroup[]).map((groupKey) => {
                const defs = NUTRIENT_DEFINITIONS.filter((d) => d.group === groupKey);
                return (
                  <div key={groupKey} className="sp-panel p-3 rounded-xl">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted m-0 pb-1.5 mb-2 separator-bottom">
                      {NUTRIENT_GROUP_LABELS[groupKey]}
                    </h4>
                    <div className="space-y-1.5">
                      {defs.map((def) => {
                        const val = inspectedCalculation.nutrients[def.id] || 0;
                        const target = targets[def.id] ?? def.defaultTarget;
                        const pct = target > 0 ? Math.round((val / target) * 100) : 0;
                        return (
                          <div
                            key={def.id}
                            className={`text-xs ${def.isSubNutrient ? 'pl-3 text-muted' : ''}`}
                          >
                            <div className="flex justify-between mb-0.5">
                              <span>{def.isSubNutrient ? `↳ ${def.name}` : def.name}</span>
                              <span className="tabular-nums">
                                <strong className="text-foreground">
                                  {val.toFixed(def.decimals)} {def.unit}
                                </strong>{' '}
                                {target > 0 && <span className="text-muted">({pct}% DV)</span>}
                              </span>
                            </div>
                            {target > 0 && val > 0 && (
                              <div
                                className="w-full h-1 rounded-full overflow-hidden"
                                style={{ backgroundColor: 'rgba(148,163,184,0.14)' }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, pct)}%`,
                                    backgroundColor: pct >= 25 ? '#10b981' : '#38bdf8',
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
