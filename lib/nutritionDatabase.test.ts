import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CRONOMETER_FOOD_DB,
  CRONOMETER_EXERCISE_DB,
  NUTRIENT_DEFINITIONS,
  HIGHLIGHTED_NUTRIENT_IDS,
  NUTRIENT_BALANCES,
  calculateFoodNutrients,
  calculateExerciseExpenditure,
  suggestFoodsForGaps,
} from './nutritionDatabase.ts';

test('CRONOMETER_FOOD_DB has foods across NCCDB, USDA, and CRDB with complete nutrient profiles', () => {
  assert.ok(CRONOMETER_FOOD_DB.length >= 25, 'Should contain a comprehensive list of foods');
  const sources = new Set(CRONOMETER_FOOD_DB.map((f) => f.source));
  assert.ok(sources.has('NCCDB'));
  assert.ok(sources.has('USDA'));
  assert.ok(sources.has('CRDB'));

  for (const food of CRONOMETER_FOOD_DB) {
    assert.ok(food.servings.length > 0, `${food.name} must have servings`);
    assert.ok(
      food.servings.some((s) => s.label === food.defaultServing),
      `${food.name} defaultServing must exist in servings`
    );
    assert.ok(typeof food.nutrientsPer100g.kcal === 'number');
    assert.ok(typeof food.nutrientsPer100g.netCarbs === 'number');
  }
});

test('calculateFoodNutrients scales macro and micronutrients accurately by serving grams and quantity', () => {
  const salmon = CRONOMETER_FOOD_DB.find((f) => f.id === 'nccdb-wild-salmon');
  assert.ok(salmon);
  const { grams, nutrients } = calculateFoodNutrients(salmon, '1 fillet (154g)', 1.5);
  assert.equal(grams, 231);
  // 182 kcal per 100g * 2.31 = 420.42 kcal
  assert.ok(nutrients.kcal > 419 && nutrients.kcal < 422);
  assert.ok(nutrients.omega3 > 5.0, 'Wild salmon should provide >5g Omega-3 for 231g');
  assert.ok(nutrients.vitB12 > 7.0, 'Wild salmon should provide rich Vitamin B12');
});

test('calculateExerciseExpenditure computes calories burned, sRPE training load, strain, HR zone, and sweat loss', () => {
  const hiit = CRONOMETER_EXERCISE_DB.find((e) => e.id === 'ex-hiit-circuit');
  assert.ok(hiit);

  const res = calculateExerciseExpenditure({
    exercise: hiit,
    durationMinutes: 40,
    intensity: 'vigorous',
    rpe: 9,
    weightKg: 75,
    avgHeartRate: 170,
  });

  assert.equal(res.exertionLoad, 360); // 40 min * RPE 9 = 360 AU
  assert.ok(res.caloriesBurned > 350, '40 min vigorous HIIT at 75kg should burn >350 kcal');
  assert.ok(res.strainScore > 10 && res.strainScore <= 21);
  assert.equal(res.hrZone, 4);
  assert.ok(res.sweatLossMl > 500);
  assert.ok(res.sodiumLossMg > 400);
  assert.ok(res.glycogenUsedG > 50);
});

test('suggestFoodsForGaps recommends nutrient-dense foods to fill micronutrient deficiencies', () => {
  const emptyTotals: Record<string, number> = {};
  const targets: Record<string, number> = {};
  for (const def of NUTRIENT_DEFINITIONS) {
    emptyTotals[def.id] = 0;
    targets[def.id] = def.defaultTarget;
  }

  const suggestions = suggestFoodsForGaps(emptyTotals, targets, CRONOMETER_FOOD_DB, 5);
  assert.equal(suggestions.length, 5);
  assert.ok(suggestions[0].score > 0);
  assert.ok(suggestions[0].topContributions.length > 0);
});

test('HIGHLIGHTED_NUTRIENT_IDS and NUTRIENT_BALANCES reference valid nutrient definitions', () => {
  const validIds = new Set(NUTRIENT_DEFINITIONS.map((d) => d.id));
  for (const id of HIGHLIGHTED_NUTRIENT_IDS) {
    assert.ok(validIds.has(id), `Highlighted nutrient ${id} must exist`);
  }
  for (const bal of NUTRIENT_BALANCES) {
    assert.ok(validIds.has(bal.numeratorId));
    assert.ok(validIds.has(bal.denominatorId));
  }
});
