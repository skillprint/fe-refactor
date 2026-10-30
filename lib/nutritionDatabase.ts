export type NutrientGroup =
  | 'general'
  | 'carbohydrates'
  | 'lipids'
  | 'protein'
  | 'vitamins'
  | 'minerals';

export type FoodDatabaseSource = 'NCCDB' | 'USDA' | 'CRDB' | 'Custom';

export type FoodCategory =
  | 'Protein & Meats'
  | 'Seafood'
  | 'Dairy & Eggs'
  | 'Vegetables'
  | 'Fruits'
  | 'Grains & Starches'
  | 'Legumes & Nuts'
  | 'Fats & Oils'
  | 'Beverages & Hydration'
  | 'Supplements & Sports'
  | 'Custom & Recipes';

export type ExerciseCategory =
  | 'Cardio & Endurance'
  | 'Strength & Resistance'
  | 'HIIT & Conditioning'
  | 'Sports & Athletics'
  | 'Mobility & Mind-Body'
  | 'Daily & Occupational'
  | 'Custom Exercise';

export type ExerciseIntensity = 'light' | 'moderate' | 'vigorous' | 'max';

export type HeartRateZone = 1 | 2 | 3 | 4 | 5;

export interface NutrientDefinition {
  id: string;
  name: string;
  shortName?: string;
  unit: 'kcal' | 'g' | 'mg' | 'µg' | 'IU' | 'ml';
  group: NutrientGroup;
  defaultTarget: number;
  upperLimit?: number;
  decimals: number;
  isSubNutrient?: boolean;
  parentNutrientId?: string;
  description: string;
}

export interface ServingOption {
  label: string;
  grams: number;
}

export type NutrientMap = Record<string, number>;

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  source: FoodDatabaseSource;
  sourceCode: string;
  category: FoodCategory;
  servings: ServingOption[];
  defaultServing: string;
  /** Nutrients per 100g of edible portion */
  nutrientsPer100g: NutrientMap;
  isCustom?: boolean;
  isRecipe?: boolean;
  recipeIngredients?: {
    foodId: string;
    foodName: string;
    servingLabel: string;
    quantity: number;
    grams: number;
  }[];
  notes?: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: ExerciseCategory;
  /** MET values for [light, moderate, vigorous, max] */
  mets: Record<ExerciseIntensity, number>;
  defaultIntensity: ExerciseIntensity;
  defaultRpe: number;
  energySystem: 'Aerobic' | 'Anaerobic' | 'Phosphagen / Strength' | 'Mixed Metabolic';
  muscleGroups: string[];
  supportsStrengthVolume?: boolean;
  supportsDistance?: boolean;
  isCustom?: boolean;
}

export const NUTRIENT_GROUP_LABELS: Record<NutrientGroup, string> = {
  general: 'General & Energy',
  carbohydrates: 'Carbohydrates',
  lipids: 'Lipids (Fats)',
  protein: 'Protein & Amino Acids',
  vitamins: 'Vitamins',
  minerals: 'Minerals & Electrolytes',
};

export const NUTRIENT_DEFINITIONS: NutrientDefinition[] = [
  // General
  { id: 'kcal', name: 'Energy', unit: 'kcal', group: 'general', defaultTarget: 2300, decimals: 0, description: 'Total metabolizable dietary energy.' },
  { id: 'water', name: 'Water', unit: 'g', group: 'general', defaultTarget: 3000, decimals: 0, description: 'Total hydration from beverages and food moisture (1g = 1ml).' },
  { id: 'caffeine', name: 'Caffeine', unit: 'mg', group: 'general', defaultTarget: 200, upperLimit: 400, decimals: 0, description: 'Central nervous system stimulant; upper safe limit ~400mg/day.' },
  { id: 'alcohol', name: 'Alcohol', unit: 'g', group: 'general', defaultTarget: 0, upperLimit: 14, decimals: 1, description: 'Ethanol content (7 kcal/g).' },

  // Carbohydrates
  { id: 'carbs', name: 'Total Carbs', unit: 'g', group: 'carbohydrates', defaultTarget: 250, decimals: 1, description: 'Total carbohydrates including fiber, starch, and sugars.' },
  { id: 'netCarbs', name: 'Net Carbs', unit: 'g', group: 'carbohydrates', defaultTarget: 215, decimals: 1, isSubNutrient: true, parentNutrientId: 'carbs', description: 'Digestible carbohydrates (Total Carbs minus Fiber).' },
  { id: 'fiber', name: 'Fiber', unit: 'g', group: 'carbohydrates', defaultTarget: 35, decimals: 1, isSubNutrient: true, parentNutrientId: 'carbs', description: 'Non-digestible dietary fiber supporting gut microbiome and glycemic control.' },
  { id: 'starch', name: 'Starch', unit: 'g', group: 'carbohydrates', defaultTarget: 140, decimals: 1, isSubNutrient: true, parentNutrientId: 'carbs', description: 'Complex polysaccharide carbohydrates for sustained glycogen replenishment.' },
  { id: 'sugars', name: 'Sugars', unit: 'g', group: 'carbohydrates', defaultTarget: 50, upperLimit: 75, decimals: 1, isSubNutrient: true, parentNutrientId: 'carbs', description: 'Total mono- and disaccharides (natural + added).' },
  { id: 'addedSugars', name: 'Added Sugars', unit: 'g', group: 'carbohydrates', defaultTarget: 0, upperLimit: 36, decimals: 1, isSubNutrient: true, parentNutrientId: 'sugars', description: 'Sugars added during processing or preparation.' },

  // Lipids
  { id: 'fat', name: 'Total Fat', unit: 'g', group: 'lipids', defaultTarget: 75, decimals: 1, description: 'Total dietary lipids (9 kcal/g).' },
  { id: 'saturatedFat', name: 'Saturated', unit: 'g', group: 'lipids', defaultTarget: 20, upperLimit: 24, decimals: 1, isSubNutrient: true, parentNutrientId: 'fat', description: 'Saturated fatty acids; recommended <10% of total calories.' },
  { id: 'monounsaturatedFat', name: 'Monounsaturated', unit: 'g', group: 'lipids', defaultTarget: 30, decimals: 1, isSubNutrient: true, parentNutrientId: 'fat', description: 'Heart-healthy MUFA (e.g., oleic acid in olive oil, avocado).' },
  { id: 'polyunsaturatedFat', name: 'Polyunsaturated', unit: 'g', group: 'lipids', defaultTarget: 18, decimals: 1, isSubNutrient: true, parentNutrientId: 'fat', description: 'Essential PUFA including Omega-3 and Omega-6 fatty acids.' },
  { id: 'omega3', name: 'Omega-3', unit: 'g', group: 'lipids', defaultTarget: 2.2, decimals: 2, isSubNutrient: true, parentNutrientId: 'polyunsaturatedFat', description: 'Anti-inflammatory essential fatty acids (ALA, EPA, DHA).' },
  { id: 'omega6', name: 'Omega-6', unit: 'g', group: 'lipids', defaultTarget: 12.0, decimals: 1, isSubNutrient: true, parentNutrientId: 'polyunsaturatedFat', description: 'Essential linoleic and arachidonic fatty acids.' },
  { id: 'transFat', name: 'Trans-Fats', unit: 'g', group: 'lipids', defaultTarget: 0, upperLimit: 2.0, decimals: 2, isSubNutrient: true, parentNutrientId: 'fat', description: 'Unsaturated fats with trans-isomer bonds; minimize intake.' },
  { id: 'cholesterol', name: 'Cholesterol', unit: 'mg', group: 'lipids', defaultTarget: 300, upperLimit: 400, decimals: 0, description: 'Dietary sterol precursor for steroid hormones and bile acids.' },

  // Protein & Amino Acids
  { id: 'protein', name: 'Protein', unit: 'g', group: 'protein', defaultTarget: 155, decimals: 1, description: 'Total dietary protein (4 kcal/g) for muscle repair and enzyme synthesis.' },
  { id: 'histidine', name: 'Histidine', unit: 'g', group: 'protein', defaultTarget: 1.4, decimals: 2, isSubNutrient: true, parentNutrientId: 'protein', description: 'Essential amino acid precursor to histamine and carnosine.' },
  { id: 'isoleucine', name: 'Isoleucine', unit: 'g', group: 'protein', defaultTarget: 1.9, decimals: 2, isSubNutrient: true, parentNutrientId: 'protein', description: 'Branched-chain amino acid (BCAA) supporting muscle glucose uptake.' },
  { id: 'leucine', name: 'Leucine', unit: 'g', group: 'protein', defaultTarget: 4.2, decimals: 2, isSubNutrient: true, parentNutrientId: 'protein', description: 'Primary BCAA trigger for mTOR muscle protein synthesis.' },
  { id: 'lysine', name: 'Lysine', unit: 'g', group: 'protein', defaultTarget: 3.8, decimals: 2, isSubNutrient: true, parentNutrientId: 'protein', description: 'Essential amino acid required for collagen and carnitine synthesis.' },
  { id: 'methionine', name: 'Methionine', unit: 'g', group: 'protein', defaultTarget: 1.5, decimals: 2, isSubNutrient: true, parentNutrientId: 'protein', description: 'Sulfur-containing essential amino acid involved in methylation.' },
  { id: 'phenylalanine', name: 'Phenylalanine', unit: 'g', group: 'protein', defaultTarget: 2.5, decimals: 2, isSubNutrient: true, parentNutrientId: 'protein', description: 'Precursor to tyrosine, dopamine, norepinephrine, and epinephrine.' },
  { id: 'threonine', name: 'Threonine', unit: 'g', group: 'protein', defaultTarget: 2.0, decimals: 2, isSubNutrient: true, parentNutrientId: 'protein', description: 'Essential amino acid important for mucin and immune proteins.' },
  { id: 'tryptophan', name: 'Tryptophan', unit: 'g', group: 'protein', defaultTarget: 0.5, decimals: 2, isSubNutrient: true, parentNutrientId: 'protein', description: 'Precursor to serotonin and melatonin for mood and sleep regulation.' },
  { id: 'valine', name: 'Valine', unit: 'g', group: 'protein', defaultTarget: 2.4, decimals: 2, isSubNutrient: true, parentNutrientId: 'protein', description: 'Branched-chain amino acid (BCAA) supporting tissue repair and energy.' },

  // Vitamins
  { id: 'vitA', name: 'Vitamin A', shortName: 'Vit A', unit: 'µg', group: 'vitamins', defaultTarget: 900, upperLimit: 3000, decimals: 0, description: 'Retinol Activity Equivalents (RAE) for vision, immunity, and gene expression.' },
  { id: 'vitB1', name: 'B1 (Thiamine)', shortName: 'Vit B1', unit: 'mg', group: 'vitamins', defaultTarget: 1.2, decimals: 2, description: 'Coenzyme in carbohydrate metabolism and nerve conduction.' },
  { id: 'vitB2', name: 'B2 (Riboflavin)', shortName: 'Vit B2', unit: 'mg', group: 'vitamins', defaultTarget: 1.3, decimals: 2, description: 'Precursor to FAD and FMN coenzymes in cellular respiration.' },
  { id: 'vitB3', name: 'B3 (Niacin)', shortName: 'Vit B3', unit: 'mg', group: 'vitamins', defaultTarget: 16, upperLimit: 35, decimals: 1, description: 'Precursor to NAD+ and NADP+ for cellular energy transfer.' },
  { id: 'vitB5', name: 'B5 (Pantothenic Acid)', shortName: 'Vit B5', unit: 'mg', group: 'vitamins', defaultTarget: 5.0, decimals: 2, description: 'Essential component of Coenzyme A (CoA) in fatty acid metabolism.' },
  { id: 'vitB6', name: 'B6 (Pyridoxine)', shortName: 'Vit B6', unit: 'mg', group: 'vitamins', defaultTarget: 1.7, upperLimit: 100, decimals: 2, description: 'Cofactor in amino acid metabolism and neurotransmitter synthesis.' },
  { id: 'vitB12', name: 'B12 (Cobalamin)', shortName: 'Vit B12', unit: 'µg', group: 'vitamins', defaultTarget: 2.4, decimals: 2, description: 'Essential for red blood cell formation, neurological function, and DNA synthesis.' },
  { id: 'folate', name: 'Folate (B9)', shortName: 'Folate', unit: 'µg', group: 'vitamins', defaultTarget: 400, upperLimit: 1000, decimals: 0, description: 'Dietary Folate Equivalents for DNA methylation and cell division.' },
  { id: 'choline', name: 'Choline', shortName: 'Choline', unit: 'mg', group: 'vitamins', defaultTarget: 550, upperLimit: 3500, decimals: 0, description: 'Precursor to acetylcholine neurotransmitter and cell membrane phospholipids.' },
  { id: 'vitC', name: 'Vitamin C', shortName: 'Vit C', unit: 'mg', group: 'vitamins', defaultTarget: 90, upperLimit: 2000, decimals: 0, description: 'Water-soluble antioxidant required for collagen synthesis and iron absorption.' },
  { id: 'vitD', name: 'Vitamin D', shortName: 'Vit D', unit: 'IU', group: 'vitamins', defaultTarget: 1000, upperLimit: 4000, decimals: 0, description: 'Calciferol supporting calcium homeostasis, bone density, and immune modulation.' },
  { id: 'vitE', name: 'Vitamin E', shortName: 'Vit E', unit: 'mg', group: 'vitamins', defaultTarget: 15, upperLimit: 1000, decimals: 1, description: 'Alpha-tocopherol lipid-soluble antioxidant protecting cell membranes.' },
  { id: 'vitK', name: 'Vitamin K', shortName: 'Vit K', unit: 'µg', group: 'vitamins', defaultTarget: 120, decimals: 0, description: 'Phylloquinone and menaquinones for blood coagulation and bone matrix proteins.' },

  // Minerals
  { id: 'calcium', name: 'Calcium', shortName: 'Calcium', unit: 'mg', group: 'minerals', defaultTarget: 1000, upperLimit: 2500, decimals: 0, description: 'Primary structural mineral of bone and key signaling ion for muscle contraction.' },
  { id: 'copper', name: 'Copper', shortName: 'Copper', unit: 'mg', group: 'minerals', defaultTarget: 0.9, upperLimit: 10, decimals: 2, description: 'Trace mineral cofactor for cytochrome c oxidase and iron transport.' },
  { id: 'iron', name: 'Iron', shortName: 'Iron', unit: 'mg', group: 'minerals', defaultTarget: 14, upperLimit: 45, decimals: 1, description: 'Core component of hemoglobin and myoglobin for oxygen transport.' },
  { id: 'magnesium', name: 'Magnesium', shortName: 'Magnesium', unit: 'mg', group: 'minerals', defaultTarget: 420, decimals: 0, description: 'Cofactor in >300 enzymatic reactions including ATP synthesis and neuromuscular relaxation.' },
  { id: 'manganese', name: 'Manganese', shortName: 'Manganese', unit: 'mg', group: 'minerals', defaultTarget: 2.3, upperLimit: 11, decimals: 2, description: 'Cofactor for mitochondrial superoxide dismutase (MnSOD) antioxidant defense.' },
  { id: 'phosphorus', name: 'Phosphorus', shortName: 'Phosphorus', unit: 'mg', group: 'minerals', defaultTarget: 700, upperLimit: 4000, decimals: 0, description: 'Structural component of ATP, DNA/RNA, phospholipids, and bone hydroxyapatite.' },
  { id: 'potassium', name: 'Potassium', shortName: 'Potassium', unit: 'mg', group: 'minerals', defaultTarget: 3400, decimals: 0, description: 'Primary intracellular electrolyte regulating membrane potential and blood pressure.' },
  { id: 'selenium', name: 'Selenium', shortName: 'Selenium', unit: 'µg', group: 'minerals', defaultTarget: 55, upperLimit: 400, decimals: 0, description: 'Essential component of glutathione peroxidases and thyroid hormone deiodinases.' },
  { id: 'sodium', name: 'Sodium', shortName: 'Sodium', unit: 'mg', group: 'minerals', defaultTarget: 1500, upperLimit: 2300, decimals: 0, description: 'Primary extracellular electrolyte critical for fluid balance and sweat replacement.' },
  { id: 'zinc', name: 'Zinc', shortName: 'Zinc', unit: 'mg', group: 'minerals', defaultTarget: 11, upperLimit: 40, decimals: 1, description: 'Catalytic and structural trace element for immunity, DNA repair, and testosterone.' },
];

export const HIGHLIGHTED_NUTRIENT_IDS = [
  'iron',
  'calcium',
  'vitA',
  'vitC',
  'vitB12',
  'folate',
  'potassium',
  'magnesium',
] as const;

export interface NutrientBalanceDefinition {
  id: string;
  name: string;
  numeratorId: string;
  denominatorId: string;
  idealMin: number;
  idealMax: number;
  unitLabel: string;
  description: string;
}

export const NUTRIENT_BALANCES: NutrientBalanceDefinition[] = [
  {
    id: 'potassium_sodium',
    name: 'Potassium : Sodium',
    numeratorId: 'potassium',
    denominatorId: 'sodium',
    idealMin: 1.5,
    idealMax: 3.0,
    unitLabel: 'K : Na',
    description: 'Cronometer target > 1.5:1 for optimal cardiovascular & hydration balance.',
  },
  {
    id: 'omega6_omega3',
    name: 'Omega-6 : Omega-3',
    numeratorId: 'omega6',
    denominatorId: 'omega3',
    idealMin: 1.0,
    idealMax: 4.0,
    unitLabel: 'ω6 : ω3',
    description: 'Lower ratio (1:1 to 4:1) supports healthy inflammatory resolution.',
  },
  {
    id: 'zinc_copper',
    name: 'Zinc : Copper',
    numeratorId: 'zinc',
    denominatorId: 'copper',
    idealMin: 8.0,
    idealMax: 15.0,
    unitLabel: 'Zn : Cu',
    description: 'Balanced 8:1–15:1 ratio prevents competitive intestinal absorption block.',
  },
  {
    id: 'calcium_magnesium',
    name: 'Calcium : Magnesium',
    numeratorId: 'calcium',
    denominatorId: 'magnesium',
    idealMin: 1.5,
    idealMax: 2.5,
    unitLabel: 'Ca : Mg',
    description: 'Ideal ~2:1 ratio balances neuromuscular excitation and relaxation.',
  },
];

/**
 * Helper to synthesize realistic amino acid distribution from total protein
 * when not explicitly overridden on a food item.
 */
function withCompleteNutrients(raw: NutrientMap, isPlant = false): NutrientMap {
  const p = raw.protein || 0;
  const carbs = raw.carbs || 0;
  const fiber = raw.fiber || 0;
  const netCarbs = Math.max(0, Number((carbs - fiber).toFixed(1)));

  const lysineFactor = isPlant ? 0.052 : 0.085;
  const leucineFactor = isPlant ? 0.072 : 0.082;

  return {
    kcal: 0,
    water: 0,
    caffeine: 0,
    alcohol: 0,
    carbs: 0,
    fiber: 0,
    starch: 0,
    sugars: 0,
    addedSugars: 0,
    fat: 0,
    saturatedFat: 0,
    monounsaturatedFat: 0,
    polyunsaturatedFat: 0,
    omega3: 0,
    omega6: 0,
    transFat: 0,
    cholesterol: 0,
    protein: 0,
    histidine: Number((p * 0.027).toFixed(2)),
    isoleucine: Number((p * 0.046).toFixed(2)),
    leucine: Number((p * leucineFactor).toFixed(2)),
    lysine: Number((p * lysineFactor).toFixed(2)),
    methionine: Number((p * (isPlant ? 0.015 : 0.026)).toFixed(2)),
    phenylalanine: Number((p * 0.042).toFixed(2)),
    threonine: Number((p * 0.041).toFixed(2)),
    tryptophan: Number((p * 0.012).toFixed(2)),
    valine: Number((p * 0.051).toFixed(2)),
    vitA: 0,
    vitB1: 0,
    vitB2: 0,
    vitB3: 0,
    vitB5: 0,
    vitB6: 0,
    vitB12: 0,
    folate: 0,
    choline: 0,
    vitC: 0,
    vitD: 0,
    vitE: 0,
    vitK: 0,
    calcium: 0,
    copper: 0,
    iron: 0,
    magnesium: 0,
    manganese: 0,
    phosphorus: 0,
    potassium: 0,
    selenium: 0,
    sodium: 0,
    zinc: 0,
    ...raw,
    netCarbs,
  };
}

export const CRONOMETER_FOOD_DB: FoodItem[] = [
  // ==================== PROTEIN & MEATS ====================
  {
    id: 'nccdb-chicken-breast',
    name: 'Chicken Breast, Skinless, Cooked, Roasted',
    source: 'NCCDB',
    sourceCode: 'NCCDB #14092',
    category: 'Protein & Meats',
    defaultServing: '1 breast (172g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 oz (28.3g)', grams: 28.35 },
      { label: '1 breast (172g)', grams: 172 },
      { label: '1 cup, chopped (140g)', grams: 140 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 165, water: 65.3, protein: 31.0, fat: 3.6, saturatedFat: 1.0, monounsaturatedFat: 1.2, polyunsaturatedFat: 0.8,
      omega3: 0.07, omega6: 0.65, cholesterol: 85,
      vitB1: 0.07, vitB2: 0.11, vitB3: 13.7, vitB5: 0.96, vitB6: 0.6, vitB12: 0.34, folate: 4, choline: 85, vitE: 0.27,
      calcium: 15, copper: 0.05, iron: 1.0, magnesium: 29, manganese: 0.02, phosphorus: 228, potassium: 256, selenium: 27.6, sodium: 74, zinc: 1.0,
    }),
  },
  {
    id: 'nccdb-beef-sirloin',
    name: 'Beef, Top Sirloin Steak, Grass-Fed, Cooked, Broiled',
    source: 'NCCDB',
    sourceCode: 'NCCDB #23145',
    category: 'Protein & Meats',
    defaultServing: '1 steak, 6 oz (170g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 oz (28.3g)', grams: 28.35 },
      { label: '1 steak, 6 oz (170g)', grams: 170 },
      { label: '1 steak, 8 oz (227g)', grams: 227 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 212, water: 61.5, protein: 29.8, fat: 9.4, saturatedFat: 3.8, monounsaturatedFat: 4.1, polyunsaturatedFat: 0.45,
      omega3: 0.12, omega6: 0.31, cholesterol: 82,
      vitB1: 0.09, vitB2: 0.19, vitB3: 7.4, vitB5: 0.68, vitB6: 0.65, vitB12: 2.85, folate: 9, choline: 108, vitE: 0.45, vitK: 1.6,
      calcium: 18, copper: 0.09, iron: 2.7, magnesium: 25, manganese: 0.01, phosphorus: 219, potassium: 342, selenium: 33.2, sodium: 62, zinc: 5.8,
    }),
  },
  {
    id: 'usda-ground-turkey-93',
    name: 'Turkey, Ground, 93% Lean, 7% Fat, Pan-Broiled',
    source: 'USDA',
    sourceCode: 'USDA #05666',
    category: 'Protein & Meats',
    defaultServing: '4 oz cooked (113g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '4 oz cooked (113g)', grams: 113 },
      { label: '1 patty (85g)', grams: 85 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 209, water: 62.1, protein: 27.1, fat: 10.4, saturatedFat: 2.7, monounsaturatedFat: 3.8, polyunsaturatedFat: 2.6,
      omega3: 0.11, omega6: 2.3, cholesterol: 93,
      vitB1: 0.06, vitB2: 0.25, vitB3: 6.9, vitB5: 1.15, vitB6: 0.48, vitB12: 1.52, folate: 8, choline: 79,
      calcium: 26, copper: 0.11, iron: 1.6, magnesium: 25, phosphorus: 214, potassium: 284, selenium: 31.0, sodium: 96, zinc: 3.3,
    }),
  },
  {
    id: 'nccdb-pork-tenderloin',
    name: 'Pork, Tenderloin, Lean Only, Cooked, Roasted',
    source: 'NCCDB',
    sourceCode: 'NCCDB #10061',
    category: 'Protein & Meats',
    defaultServing: '4 oz (113g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '4 oz (113g)', grams: 113 },
      { label: '6 oz (170g)', grams: 170 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 143, water: 69.8, protein: 26.2, fat: 3.5, saturatedFat: 1.2, monounsaturatedFat: 1.4, polyunsaturatedFat: 0.4,
      omega3: 0.03, omega6: 0.35, cholesterol: 73,
      vitB1: 0.95, vitB2: 0.39, vitB3: 6.6, vitB5: 1.05, vitB6: 0.74, vitB12: 0.58, folate: 1, choline: 88,
      calcium: 6, copper: 0.08, iron: 1.1, magnesium: 29, phosphorus: 260, potassium: 421, selenium: 47.7, sodium: 57, zinc: 2.5,
    }),
  },

  // ==================== SEAFOOD ====================
  {
    id: 'nccdb-wild-salmon',
    name: 'Salmon, Wild Atlantic/Sockeye, Cooked, Dry Heat',
    source: 'NCCDB',
    sourceCode: 'NCCDB #15077',
    category: 'Seafood',
    defaultServing: '1 fillet (154g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 oz (28.3g)', grams: 28.35 },
      { label: '1 fillet (154g)', grams: 154 },
      { label: '6 oz fillet (170g)', grams: 170 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 182, water: 64.9, protein: 25.4, fat: 8.1, saturatedFat: 1.3, monounsaturatedFat: 2.7, polyunsaturatedFat: 3.3,
      omega3: 2.26, omega6: 0.24, cholesterol: 71,
      vitA: 59, vitB1: 0.28, vitB2: 0.49, vitB3: 10.1, vitB5: 1.9, vitB6: 0.82, vitB12: 3.18, folate: 29, choline: 91, vitD: 526, vitE: 1.1,
      calcium: 15, copper: 0.1, iron: 1.0, magnesium: 37, manganese: 0.02, phosphorus: 256, potassium: 628, selenium: 46.8, sodium: 56, zinc: 0.8,
    }),
  },
  {
    id: 'nccdb-tuna-yellowfin',
    name: 'Tuna, Yellowfin (Ahi), Cooked, Seared',
    source: 'NCCDB',
    sourceCode: 'NCCDB #15219',
    category: 'Seafood',
    defaultServing: '4 oz (113g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '4 oz (113g)', grams: 113 },
      { label: '1 can drained (142g)', grams: 142 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 130, water: 68.1, protein: 29.2, fat: 0.6, saturatedFat: 0.2, monounsaturatedFat: 0.1, polyunsaturatedFat: 0.2,
      omega3: 0.18, omega6: 0.02, cholesterol: 47,
      vitA: 21, vitB1: 0.5, vitB2: 0.06, vitB3: 22.1, vitB5: 0.36, vitB6: 1.04, vitB12: 2.35, folate: 2, choline: 65, vitD: 82,
      calcium: 4, copper: 0.05, iron: 0.9, magnesium: 42, phosphorus: 326, potassium: 527, selenium: 108.2, sodium: 51, zinc: 0.5,
    }),
  },
  {
    id: 'usda-sardines-canned',
    name: 'Sardines, Atlantic, Canned in Olive Oil, Drained with Bone',
    source: 'USDA',
    sourceCode: 'USDA #15088',
    category: 'Seafood',
    defaultServing: '1 can (92g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 can (92g)', grams: 92 },
      { label: '1 sardine (12g)', grams: 12 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 208, water: 59.6, protein: 24.6, fat: 11.5, saturatedFat: 1.5, monounsaturatedFat: 3.9, polyunsaturatedFat: 5.1,
      omega3: 1.48, omega6: 0.35, cholesterol: 142,
      vitA: 32, vitB1: 0.08, vitB2: 0.23, vitB3: 5.2, vitB5: 0.64, vitB6: 0.17, vitB12: 8.94, folate: 10, choline: 75, vitD: 193, vitE: 2.0, vitK: 2.6,
      calcium: 382, copper: 0.19, iron: 2.9, magnesium: 39, phosphorus: 490, potassium: 397, selenium: 52.7, sodium: 307, zinc: 1.3,
    }),
  },
  {
    id: 'nccdb-shrimp-cooked',
    name: 'Shrimp, Cooked, Steamed or Boiled',
    source: 'NCCDB',
    sourceCode: 'NCCDB #15151',
    category: 'Seafood',
    defaultServing: '4 oz (113g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '4 oz (113g)', grams: 113 },
      { label: '6 large shrimp (42g)', grams: 42 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 99, water: 77.3, protein: 24.0, fat: 0.3, saturatedFat: 0.06, monounsaturatedFat: 0.04, polyunsaturatedFat: 0.11,
      omega3: 0.09, omega6: 0.01, cholesterol: 189,
      vitB12: 1.66, choline: 135, vitE: 2.2,
      calcium: 70, copper: 0.38, iron: 0.5, magnesium: 39, phosphorus: 237, potassium: 259, selenium: 49.5, sodium: 111, zinc: 1.6,
    }),
  },

  // ==================== DAIRY & EGGS ====================
  {
    id: 'nccdb-eggs-whole',
    name: 'Egg, Whole, Pasture-Raised, Cooked, Hard-Boiled or Scrambled',
    source: 'NCCDB',
    sourceCode: 'NCCDB #01129',
    category: 'Dairy & Eggs',
    defaultServing: '2 large eggs (100g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 large egg (50g)', grams: 50 },
      { label: '2 large eggs (100g)', grams: 100 },
      { label: '3 large eggs (150g)', grams: 150 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 155, water: 74.6, carbs: 1.1, sugars: 1.1, protein: 12.6, fat: 10.6, saturatedFat: 3.3, monounsaturatedFat: 4.1, polyunsaturatedFat: 1.4,
      omega3: 0.22, omega6: 1.15, cholesterol: 373,
      vitA: 149, vitB1: 0.07, vitB2: 0.51, vitB3: 0.06, vitB5: 1.4, vitB6: 0.12, vitB12: 1.11, folate: 44, choline: 294, vitD: 87, vitE: 1.03, vitK: 0.3,
      calcium: 50, copper: 0.07, iron: 1.2, magnesium: 10, manganese: 0.03, phosphorus: 172, potassium: 126, selenium: 30.8, sodium: 124, zinc: 1.1,
    }),
  },
  {
    id: 'nccdb-greek-yogurt-0',
    name: 'Yogurt, Greek, Plain, Nonfat (0% Fat)',
    source: 'NCCDB',
    sourceCode: 'NCCDB #01256',
    category: 'Dairy & Eggs',
    defaultServing: '1 cup (227g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 container (170g)', grams: 170 },
      { label: '1 cup (227g)', grams: 227 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 59, water: 85.1, carbs: 3.6, sugars: 3.2, protein: 10.2, fat: 0.4, saturatedFat: 0.1, cholesterol: 5,
      vitA: 1, vitB1: 0.02, vitB2: 0.28, vitB3: 0.21, vitB5: 0.33, vitB6: 0.06, vitB12: 0.75, folate: 7, choline: 15,
      calcium: 110, copper: 0.01, iron: 0.1, magnesium: 11, phosphorus: 135, potassium: 141, selenium: 9.7, sodium: 36, zinc: 0.5,
    }),
  },
  {
    id: 'usda-cottage-cheese-2',
    name: 'Cheese, Cottage, Lowfat, 2% Milkfat',
    source: 'USDA',
    sourceCode: 'USDA #01015',
    category: 'Dairy & Eggs',
    defaultServing: '1 cup (226g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1/2 cup (113g)', grams: 113 },
      { label: '1 cup (226g)', grams: 226 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 81, water: 80.7, carbs: 4.3, sugars: 4.0, protein: 11.1, fat: 2.3, saturatedFat: 1.2, monounsaturatedFat: 0.5, polyunsaturatedFat: 0.1,
      omega3: 0.02, omega6: 0.06, cholesterol: 12,
      vitA: 42, vitB1: 0.02, vitB2: 0.25, vitB5: 0.24, vitB6: 0.06, vitB12: 0.47, folate: 8, choline: 18,
      calcium: 103, iron: 0.1, magnesium: 9, phosphorus: 150, potassium: 120, selenium: 11.9, sodium: 306, zinc: 0.6,
    }),
  },
  {
    id: 'nccdb-cheddar-cheese',
    name: 'Cheese, Cheddar, Sharp, Aged',
    source: 'NCCDB',
    sourceCode: 'NCCDB #01009',
    category: 'Dairy & Eggs',
    defaultServing: '1 oz (28g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 oz (28g)', grams: 28 },
      { label: '1 slice (21g)', grams: 21 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 403, water: 36.8, carbs: 1.3, sugars: 0.5, protein: 24.9, fat: 33.1, saturatedFat: 21.1, monounsaturatedFat: 9.4, polyunsaturatedFat: 0.9,
      omega3: 0.35, omega6: 0.58, cholesterol: 105,
      vitA: 265, vitB1: 0.03, vitB2: 0.43, vitB5: 0.41, vitB6: 0.07, vitB12: 0.83, folate: 18, choline: 16, vitD: 24, vitE: 0.78, vitK: 2.8,
      calcium: 721, iron: 0.7, magnesium: 28, phosphorus: 512, potassium: 98, selenium: 13.9, sodium: 621, zinc: 3.1,
    }),
  },
  {
    id: 'usda-milk-whole',
    name: 'Milk, Whole, 3.25% Milkfat, with Added Vitamin D',
    source: 'USDA',
    sourceCode: 'USDA #01077',
    category: 'Dairy & Eggs',
    defaultServing: '1 cup (244g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 cup (244g)', grams: 244 },
      { label: '1/2 cup (122g)', grams: 122 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 61, water: 88.1, carbs: 4.8, sugars: 5.0, protein: 3.2, fat: 3.3, saturatedFat: 1.9, monounsaturatedFat: 0.8, polyunsaturatedFat: 0.2,
      omega3: 0.07, omega6: 0.12, cholesterol: 10,
      vitA: 46, vitB1: 0.05, vitB2: 0.17, vitB5: 0.37, vitB6: 0.04, vitB12: 0.45, folate: 5, choline: 14, vitD: 51,
      calcium: 113, magnesium: 10, phosphorus: 84, potassium: 132, selenium: 3.7, sodium: 43, zinc: 0.4,
    }),
  },

  // ==================== VEGETABLES ====================
  {
    id: 'nccdb-spinach-cooked',
    name: 'Spinach, Cooked, Boiled or Steamed, Drained',
    source: 'NCCDB',
    sourceCode: 'NCCDB #11458',
    category: 'Vegetables',
    defaultServing: '1 cup cooked (180g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 cup raw (30g)', grams: 30 },
      { label: '1 cup cooked (180g)', grams: 180 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 23, water: 91.2, carbs: 3.8, fiber: 2.4, sugars: 0.4, protein: 3.0, fat: 0.3, omega3: 0.09, omega6: 0.02,
      vitA: 524, vitB1: 0.1, vitB2: 0.24, vitB3: 0.49, vitB5: 0.14, vitB6: 0.24, folate: 146, choline: 20, vitC: 9.8, vitE: 2.1, vitK: 494,
      calcium: 136, copper: 0.17, iron: 3.6, magnesium: 87, manganese: 0.94, phosphorus: 56, potassium: 466, selenium: 1.5, sodium: 70, zinc: 0.8,
    }, true),
  },
  {
    id: 'nccdb-broccoli-steamed',
    name: 'Broccoli, Florets, Cooked, Steamed',
    source: 'NCCDB',
    sourceCode: 'NCCDB #11091',
    category: 'Vegetables',
    defaultServing: '1 cup chopped (156g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 cup chopped (156g)', grams: 156 },
      { label: '1 spear (37g)', grams: 37 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 35, water: 89.3, carbs: 7.2, fiber: 3.3, sugars: 1.4, protein: 2.4, fat: 0.4, omega3: 0.13, omega6: 0.04,
      vitA: 77, vitB1: 0.06, vitB2: 0.12, vitB3: 0.55, vitB5: 0.62, vitB6: 0.2, folate: 108, choline: 40, vitC: 64.9, vitE: 1.45, vitK: 141,
      calcium: 40, copper: 0.06, iron: 0.7, magnesium: 21, manganese: 0.19, phosphorus: 67, potassium: 293, selenium: 1.6, sodium: 41, zinc: 0.5,
    }, true),
  },
  {
    id: 'nccdb-sweet-potato',
    name: 'Sweet Potato, Cooked, Baked in Skin, without Salt',
    source: 'NCCDB',
    sourceCode: 'NCCDB #11508',
    category: 'Vegetables',
    defaultServing: '1 medium (150g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 medium (150g)', grams: 150 },
      { label: '1 large (200g)', grams: 200 },
      { label: '1 cup mashed (200g)', grams: 200 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 90, water: 75.8, carbs: 20.7, fiber: 3.3, starch: 7.1, sugars: 6.5, protein: 2.0, fat: 0.15, omega3: 0.01, omega6: 0.09,
      vitA: 961, vitB1: 0.11, vitB2: 0.11, vitB3: 1.49, vitB5: 0.88, vitB6: 0.29, folate: 6, choline: 13, vitC: 19.6, vitE: 0.71, vitK: 2.3,
      calcium: 38, copper: 0.16, iron: 0.7, magnesium: 27, manganese: 0.5, phosphorus: 54, potassium: 475, selenium: 0.2, sodium: 36, zinc: 0.3,
    }, true),
  },
  {
    id: 'nccdb-kale-raw',
    name: 'Kale, Raw, Chopped',
    source: 'NCCDB',
    sourceCode: 'NCCDB #11233',
    category: 'Vegetables',
    defaultServing: '2 cups chopped (134g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 cup chopped (67g)', grams: 67 },
      { label: '2 cups chopped (134g)', grams: 134 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 35, water: 89.6, carbs: 4.4, fiber: 4.1, sugars: 0.8, protein: 2.9, fat: 1.5, omega3: 0.18, omega6: 0.14,
      vitA: 241, vitB1: 0.11, vitB2: 0.35, vitB3: 1.18, vitB5: 0.37, vitB6: 0.15, folate: 62, choline: 0.8, vitC: 93.4, vitE: 0.66, vitK: 390,
      calcium: 254, copper: 0.05, iron: 1.6, magnesium: 33, manganese: 0.92, phosphorus: 55, potassium: 348, selenium: 0.9, sodium: 53, zinc: 0.4,
    }, true),
  },
  {
    id: 'usda-bell-pepper-red',
    name: 'Peppers, Sweet, Red, Raw',
    source: 'USDA',
    sourceCode: 'USDA #11821',
    category: 'Vegetables',
    defaultServing: '1 medium pepper (119g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 medium pepper (119g)', grams: 119 },
      { label: '1 cup chopped (149g)', grams: 149 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 31, water: 92.2, carbs: 6.0, fiber: 2.1, sugars: 4.2, protein: 1.0, fat: 0.3, omega3: 0.03, omega6: 0.05,
      vitA: 157, vitB1: 0.05, vitB2: 0.09, vitB3: 0.98, vitB5: 0.32, vitB6: 0.29, folate: 46, choline: 5.6, vitC: 127.7, vitE: 1.58, vitK: 4.9,
      calcium: 7, copper: 0.02, iron: 0.4, magnesium: 12, manganese: 0.11, phosphorus: 26, potassium: 211, sodium: 4, zinc: 0.3,
    }, true),
  },
  {
    id: 'nccdb-mushrooms-crimini',
    name: 'Mushrooms, Crimini (Baby Bella), UV-Exposed, Cooked',
    source: 'NCCDB',
    sourceCode: 'NCCDB #11266',
    category: 'Vegetables',
    defaultServing: '1 cup sliced (108g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 cup sliced (108g)', grams: 108 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 28, water: 91.1, carbs: 4.3, fiber: 1.8, sugars: 1.7, protein: 3.1, fat: 0.4,
      vitB1: 0.09, vitB2: 0.49, vitB3: 3.8, vitB5: 1.5, vitB6: 0.11, folate: 25, choline: 22, vitD: 420,
      calcium: 6, copper: 0.5, iron: 0.5, magnesium: 12, manganese: 0.11, phosphorus: 120, potassium: 448, selenium: 26.0, sodium: 6, zinc: 1.1,
    }, true),
  },

  // ==================== FRUITS ====================
  {
    id: 'nccdb-avocado',
    name: 'Avocado, Hass, Raw',
    source: 'NCCDB',
    sourceCode: 'NCCDB #09038',
    category: 'Fruits',
    defaultServing: '1/2 medium avocado (68g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1/2 medium avocado (68g)', grams: 68 },
      { label: '1 whole avocado (136g)', grams: 136 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 160, water: 73.2, carbs: 8.5, fiber: 6.7, sugars: 0.7, protein: 2.0, fat: 14.7, saturatedFat: 2.1, monounsaturatedFat: 9.8, polyunsaturatedFat: 1.8,
      omega3: 0.11, omega6: 1.69,
      vitA: 7, vitB1: 0.07, vitB2: 0.13, vitB3: 1.74, vitB5: 1.39, vitB6: 0.26, folate: 81, choline: 14.2, vitC: 10.0, vitE: 2.07, vitK: 21.0,
      calcium: 12, copper: 0.19, iron: 0.6, magnesium: 29, manganese: 0.14, phosphorus: 52, potassium: 485, selenium: 0.4, sodium: 7, zinc: 0.6,
    }, true),
  },
  {
    id: 'nccdb-banana',
    name: 'Banana, Fresh, Ripe',
    source: 'NCCDB',
    sourceCode: 'NCCDB #09040',
    category: 'Fruits',
    defaultServing: '1 medium banana (118g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 small (101g)', grams: 101 },
      { label: '1 medium banana (118g)', grams: 118 },
      { label: '1 large (136g)', grams: 136 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 89, water: 74.9, carbs: 22.8, fiber: 2.6, starch: 5.4, sugars: 12.2, protein: 1.1, fat: 0.3, omega3: 0.03, omega6: 0.05,
      vitA: 3, vitB1: 0.03, vitB2: 0.07, vitB3: 0.67, vitB5: 0.33, vitB6: 0.37, folate: 20, choline: 9.8, vitC: 8.7, vitE: 0.1, vitK: 0.5,
      calcium: 5, copper: 0.08, iron: 0.3, magnesium: 27, manganese: 0.27, phosphorus: 22, potassium: 358, selenium: 1.0, sodium: 1, zinc: 0.2,
    }, true),
  },
  {
    id: 'nccdb-blueberries',
    name: 'Blueberries, Wild or Cultivated, Fresh',
    source: 'NCCDB',
    sourceCode: 'NCCDB #09050',
    category: 'Fruits',
    defaultServing: '1 cup (148g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1/2 cup (74g)', grams: 74 },
      { label: '1 cup (148g)', grams: 148 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 57, water: 84.2, carbs: 14.5, fiber: 2.4, sugars: 10.0, protein: 0.7, fat: 0.3, omega3: 0.06, omega6: 0.09,
      vitA: 3, vitB1: 0.04, vitB2: 0.04, vitB3: 0.42, vitB5: 0.12, vitB6: 0.05, folate: 6, choline: 6.0, vitC: 9.7, vitE: 0.57, vitK: 19.3,
      calcium: 6, copper: 0.06, iron: 0.3, magnesium: 6, manganese: 0.34, phosphorus: 12, potassium: 77, sodium: 1, zinc: 0.2,
    }, true),
  },
  {
    id: 'usda-kiwi-green',
    name: 'Kiwifruit, Green, Fresh',
    source: 'USDA',
    sourceCode: 'USDA #09148',
    category: 'Fruits',
    defaultServing: '2 medium kiwis (148g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 medium kiwi (74g)', grams: 74 },
      { label: '2 medium kiwis (148g)', grams: 148 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 61, water: 83.1, carbs: 14.7, fiber: 3.0, sugars: 9.0, protein: 1.1, fat: 0.5, omega3: 0.04, omega6: 0.25,
      vitA: 4, vitB1: 0.03, vitB2: 0.03, vitB3: 0.34, vitB5: 0.18, vitB6: 0.06, folate: 25, choline: 7.8, vitC: 92.7, vitE: 1.46, vitK: 40.3,
      calcium: 34, copper: 0.13, iron: 0.3, magnesium: 17, manganese: 0.1, phosphorus: 34, potassium: 312, selenium: 0.2, sodium: 3, zinc: 0.1,
    }, true),
  },
  {
    id: 'nccdb-apple-honeycrisp',
    name: 'Apple, Fresh, with Skin',
    source: 'NCCDB',
    sourceCode: 'NCCDB #09003',
    category: 'Fruits',
    defaultServing: '1 medium apple (182g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 medium apple (182g)', grams: 182 },
      { label: '1 large apple (223g)', grams: 223 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 52, water: 85.6, carbs: 13.8, fiber: 2.4, sugars: 10.4, protein: 0.3, fat: 0.2,
      vitA: 3, vitB1: 0.02, vitB2: 0.03, vitB6: 0.04, folate: 3, vitC: 4.6, vitE: 0.18, vitK: 2.2,
      calcium: 6, copper: 0.03, iron: 0.1, magnesium: 5, manganese: 0.04, phosphorus: 11, potassium: 107, sodium: 1, zinc: 0.04,
    }, true),
  },

  // ==================== GRAINS & STARCHES ====================
  {
    id: 'nccdb-oats-rolled',
    name: 'Oats, Rolled, Old Fashioned, Dry',
    source: 'NCCDB',
    sourceCode: 'NCCDB #08120',
    category: 'Grains & Starches',
    defaultServing: '1/2 cup dry (40g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1/2 cup dry (40g)', grams: 40 },
      { label: '1 cup dry (80g)', grams: 80 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 379, water: 10.8, carbs: 67.7, fiber: 10.1, starch: 56.5, sugars: 1.0, protein: 13.2, fat: 6.5, saturatedFat: 1.1, monounsaturatedFat: 2.0, polyunsaturatedFat: 2.3,
      omega3: 0.11, omega6: 2.2,
      vitB1: 0.46, vitB2: 0.15, vitB3: 1.12, vitB5: 1.12, vitB6: 0.1, folate: 32, choline: 30, vitE: 0.42, vitK: 2.0,
      calcium: 52, copper: 0.39, iron: 4.3, magnesium: 138, manganese: 3.63, phosphorus: 410, potassium: 362, selenium: 28.9, sodium: 6, zinc: 3.6,
    }, true),
  },
  {
    id: 'nccdb-quinoa-cooked',
    name: 'Quinoa, Cooked',
    source: 'NCCDB',
    sourceCode: 'NCCDB #20137',
    category: 'Grains & Starches',
    defaultServing: '1 cup cooked (185g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1/2 cup cooked (93g)', grams: 93 },
      { label: '1 cup cooked (185g)', grams: 185 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 120, water: 71.6, carbs: 21.3, fiber: 2.8, starch: 17.6, sugars: 0.9, protein: 4.4, fat: 1.9, saturatedFat: 0.2, monounsaturatedFat: 0.5, polyunsaturatedFat: 1.1,
      omega3: 0.1, omega6: 0.97,
      vitB1: 0.11, vitB2: 0.11, vitB3: 0.41, vitB5: 0.39, vitB6: 0.12, folate: 42, choline: 23, vitE: 0.63,
      calcium: 17, copper: 0.19, iron: 1.5, magnesium: 64, manganese: 0.63, phosphorus: 152, potassium: 172, selenium: 2.8, sodium: 7, zinc: 1.1,
    }, true),
  },
  {
    id: 'nccdb-brown-rice-cooked',
    name: 'Rice, Brown, Long-Grain, Cooked',
    source: 'NCCDB',
    sourceCode: 'NCCDB #20037',
    category: 'Grains & Starches',
    defaultServing: '1 cup cooked (195g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1/2 cup cooked (98g)', grams: 98 },
      { label: '1 cup cooked (195g)', grams: 195 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 123, water: 70.3, carbs: 25.6, fiber: 1.6, starch: 23.5, sugars: 0.2, protein: 2.7, fat: 1.0, saturatedFat: 0.2, monounsaturatedFat: 0.35, polyunsaturatedFat: 0.35,
      omega3: 0.01, omega6: 0.33,
      vitB1: 0.18, vitB2: 0.07, vitB3: 2.56, vitB5: 0.38, vitB6: 0.15, folate: 9, choline: 9.2, vitE: 0.17, vitK: 0.6,
      calcium: 3, copper: 0.11, iron: 0.6, magnesium: 39, manganese: 0.97, phosphorus: 103, potassium: 86, selenium: 9.8, sodium: 4, zinc: 0.7,
    }, true),
  },
  {
    id: 'usda-jasmine-rice',
    name: 'Rice, White, Jasmine, Cooked',
    source: 'USDA',
    sourceCode: 'USDA #20045',
    category: 'Grains & Starches',
    defaultServing: '1 cup cooked (158g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 cup cooked (158g)', grams: 158 },
      { label: '1.5 cups cooked (237g)', grams: 237 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 130, water: 68.4, carbs: 28.2, fiber: 0.4, starch: 27.6, sugars: 0.1, protein: 2.7, fat: 0.3,
      vitB1: 0.16, vitB3: 1.48, vitB5: 0.39, vitB6: 0.09, folate: 58,
      calcium: 10, copper: 0.07, iron: 1.2, magnesium: 12, manganese: 0.47, phosphorus: 43, potassium: 35, selenium: 7.5, sodium: 1, zinc: 0.5,
    }, true),
  },
  {
    id: 'crdb-ezekiel-bread',
    name: 'Bread, Sprouted Whole Grain (Ezekiel 4:9)',
    brand: 'Food For Life',
    source: 'CRDB',
    sourceCode: 'CRDB #88104',
    category: 'Grains & Starches',
    defaultServing: '2 slices (68g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 slice (34g)', grams: 34 },
      { label: '2 slices (68g)', grams: 68 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 235, water: 44.0, carbs: 44.1, fiber: 8.8, starch: 34.0, sugars: 0.0, protein: 14.7, fat: 1.5, omega3: 0.08, omega6: 0.65,
      vitB1: 0.29, vitB2: 0.18, vitB3: 3.5, vitB5: 0.65, vitB6: 0.24, folate: 44, vitE: 0.8,
      calcium: 26, copper: 0.28, iron: 2.9, magnesium: 76, manganese: 1.4, phosphorus: 220, potassium: 235, selenium: 24.0, sodium: 221, zinc: 2.6,
    }, true),
  },

  // ==================== LEGUMES & NUTS ====================
  {
    id: 'nccdb-lentils-cooked',
    name: 'Lentils, Mature Seeds, Cooked, Boiled',
    source: 'NCCDB',
    sourceCode: 'NCCDB #16070',
    category: 'Legumes & Nuts',
    defaultServing: '1 cup cooked (198g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1/2 cup cooked (99g)', grams: 99 },
      { label: '1 cup cooked (198g)', grams: 198 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 116, water: 69.6, carbs: 20.1, fiber: 7.9, starch: 10.4, sugars: 1.8, protein: 9.0, fat: 0.4, omega3: 0.04, omega6: 0.14,
      vitB1: 0.17, vitB2: 0.07, vitB3: 1.06, vitB5: 0.64, vitB6: 0.18, folate: 181, choline: 32.7, vitC: 1.5, vitK: 1.7,
      calcium: 19, copper: 0.25, iron: 3.3, magnesium: 36, manganese: 0.49, phosphorus: 180, potassium: 369, selenium: 2.8, sodium: 2, zinc: 1.3,
    }, true),
  },
  {
    id: 'nccdb-black-beans',
    name: 'Black Beans, Cooked, Boiled',
    source: 'NCCDB',
    sourceCode: 'NCCDB #16015',
    category: 'Legumes & Nuts',
    defaultServing: '1 cup cooked (172g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1/2 cup cooked (86g)', grams: 86 },
      { label: '1 cup cooked (172g)', grams: 172 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 132, water: 65.7, carbs: 23.7, fiber: 8.7, starch: 14.3, sugars: 0.3, protein: 8.9, fat: 0.5, omega3: 0.1, omega6: 0.12,
      vitB1: 0.24, vitB2: 0.06, vitB3: 0.5, vitB5: 0.24, vitB6: 0.07, folate: 149, choline: 32.6, vitK: 3.3,
      calcium: 27, copper: 0.21, iron: 2.1, magnesium: 70, manganese: 0.44, phosphorus: 140, potassium: 355, selenium: 1.2, sodium: 1, zinc: 1.1,
    }, true),
  },
  {
    id: 'nccdb-almonds-raw',
    name: 'Almonds, Whole, Raw or Dry Roasted, Unsalted',
    source: 'NCCDB',
    sourceCode: 'NCCDB #12061',
    category: 'Legumes & Nuts',
    defaultServing: '1 oz / ~23 almonds (28.3g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 oz / ~23 almonds (28.3g)', grams: 28.35 },
      { label: '1/4 cup (36g)', grams: 36 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 579, water: 4.4, carbs: 21.6, fiber: 12.5, starch: 0.7, sugars: 4.4, protein: 21.2, fat: 49.9, saturatedFat: 3.8, monounsaturatedFat: 31.6, polyunsaturatedFat: 12.3,
      omega3: 0.01, omega6: 12.3,
      vitB1: 0.21, vitB2: 1.14, vitB3: 3.62, vitB5: 0.47, vitB6: 0.14, folate: 44, choline: 52.1, vitE: 25.6,
      calcium: 269, copper: 1.03, iron: 3.7, magnesium: 270, manganese: 2.18, phosphorus: 481, potassium: 733, selenium: 4.1, sodium: 1, zinc: 3.1,
    }, true),
  },
  {
    id: 'nccdb-walnuts',
    name: 'Walnuts, English, Halves',
    source: 'NCCDB',
    sourceCode: 'NCCDB #12155',
    category: 'Legumes & Nuts',
    defaultServing: '1 oz / 14 halves (28.3g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 oz / 14 halves (28.3g)', grams: 28.35 },
      { label: '1/4 cup chopped (30g)', grams: 30 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 654, water: 4.1, carbs: 13.7, fiber: 6.7, sugars: 2.6, protein: 15.2, fat: 65.2, saturatedFat: 6.1, monounsaturatedFat: 8.9, polyunsaturatedFat: 47.2,
      omega3: 9.08, omega6: 38.1,
      vitB1: 0.34, vitB2: 0.15, vitB3: 1.13, vitB5: 0.57, vitB6: 0.54, folate: 98, choline: 39.2, vitE: 0.7, vitK: 2.7,
      calcium: 98, copper: 1.59, iron: 2.9, magnesium: 158, manganese: 3.41, phosphorus: 346, potassium: 441, selenium: 4.9, sodium: 2, zinc: 3.1,
    }, true),
  },
  {
    id: 'nccdb-chia-seeds',
    name: 'Chia Seeds, Dried',
    source: 'NCCDB',
    sourceCode: 'NCCDB #12006',
    category: 'Legumes & Nuts',
    defaultServing: '2 tbsp (24g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 tbsp (12g)', grams: 12 },
      { label: '2 tbsp (24g)', grams: 24 },
      { label: '1 oz (28.3g)', grams: 28.35 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 486, water: 5.8, carbs: 42.1, fiber: 34.4, protein: 16.5, fat: 30.7, saturatedFat: 3.3, monounsaturatedFat: 2.3, polyunsaturatedFat: 23.7,
      omega3: 17.83, omega6: 5.84,
      vitA: 2, vitB1: 0.62, vitB2: 0.17, vitB3: 8.83, folate: 49, vitC: 1.6, vitE: 0.5,
      calcium: 631, copper: 0.92, iron: 7.7, magnesium: 335, manganese: 2.72, phosphorus: 860, potassium: 407, selenium: 55.2, sodium: 16, zinc: 4.6,
    }, true),
  },
  {
    id: 'nccdb-pumpkin-seeds',
    name: 'Pumpkin & Squash Seed Kernels, Pepitas, Roasted',
    source: 'NCCDB',
    sourceCode: 'NCCDB #12014',
    category: 'Legumes & Nuts',
    defaultServing: '1 oz (28.3g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 oz (28.3g)', grams: 28.35 },
      { label: '2 tbsp (18g)', grams: 18 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 559, water: 5.2, carbs: 10.7, fiber: 6.0, sugars: 1.4, protein: 30.2, fat: 49.1, saturatedFat: 8.7, monounsaturatedFat: 16.2, polyunsaturatedFat: 20.9,
      omega3: 0.12, omega6: 20.7,
      vitB1: 0.27, vitB2: 0.15, vitB3: 4.99, vitB5: 0.75, vitB6: 0.14, folate: 58, choline: 63.0, vitE: 2.18, vitK: 7.3,
      calcium: 46, copper: 1.34, iron: 8.8, magnesium: 592, manganese: 4.54, phosphorus: 1233, potassium: 809, selenium: 9.4, sodium: 7, zinc: 7.8,
    }, true),
  },
  {
    id: 'usda-peanut-butter',
    name: 'Peanut Butter, Natural, Smooth, with Salt',
    source: 'USDA',
    sourceCode: 'USDA #16098',
    category: 'Legumes & Nuts',
    defaultServing: '2 tbsp (32g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 tbsp (16g)', grams: 16 },
      { label: '2 tbsp (32g)', grams: 32 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 588, water: 1.8, carbs: 20.0, fiber: 6.0, sugars: 9.2, protein: 25.1, fat: 50.4, saturatedFat: 10.3, monounsaturatedFat: 23.7, polyunsaturatedFat: 13.9,
      omega3: 0.08, omega6: 13.8,
      vitB1: 0.15, vitB2: 0.19, vitB3: 13.1, vitB5: 1.14, vitB6: 0.44, folate: 87, choline: 63.0, vitE: 9.1,
      calcium: 49, copper: 0.42, iron: 1.7, magnesium: 168, manganese: 1.68, phosphorus: 335, potassium: 558, selenium: 4.1, sodium: 426, zinc: 2.5,
    }, true),
  },
  {
    id: 'nccdb-tofu-firm',
    name: 'Tofu, Extra Firm, Prepared with Calcium Sulfate',
    source: 'NCCDB',
    sourceCode: 'NCCDB #16426',
    category: 'Legumes & Nuts',
    defaultServing: '1/2 block (170g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '3 oz (85g)', grams: 85 },
      { label: '1/2 block (170g)', grams: 170 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 144, water: 69.8, carbs: 2.8, fiber: 2.3, sugars: 0.6, protein: 17.3, fat: 8.7, saturatedFat: 1.3, monounsaturatedFat: 1.9, polyunsaturatedFat: 4.9,
      omega3: 0.58, omega6: 4.3,
      vitB1: 0.16, vitB2: 0.1, vitB3: 0.38, vitB5: 0.13, vitB6: 0.09, folate: 29, choline: 28.8,
      calcium: 683, copper: 0.38, iron: 2.7, magnesium: 58, manganese: 1.18, phosphorus: 190, potassium: 237, selenium: 17.4, sodium: 14, zinc: 1.6,
    }, true),
  },

  // ==================== FATS & OILS ====================
  {
    id: 'nccdb-olive-oil',
    name: 'Olive Oil, Extra Virgin',
    source: 'NCCDB',
    sourceCode: 'NCCDB #04053',
    category: 'Fats & Oils',
    defaultServing: '1 tbsp (13.5g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 tsp (4.5g)', grams: 4.5 },
      { label: '1 tbsp (13.5g)', grams: 13.5 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 884, fat: 100.0, saturatedFat: 13.8, monounsaturatedFat: 73.0, polyunsaturatedFat: 10.5,
      omega3: 0.76, omega6: 9.76,
      vitE: 14.35, vitK: 60.2, iron: 0.56,
    }, true),
  },

  // ==================== BEVERAGES & HYDRATION ====================
  {
    id: 'nccdb-coffee-brewed',
    name: 'Coffee, Brewed from Grounds, Black',
    source: 'NCCDB',
    sourceCode: 'NCCDB #14209',
    category: 'Beverages & Hydration',
    defaultServing: '1 mug, 12 fl oz (355g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 cup, 8 fl oz (237g)', grams: 237 },
      { label: '1 mug, 12 fl oz (355g)', grams: 355 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 1, water: 99.4, caffeine: 40, protein: 0.1,
      vitB2: 0.08, vitB3: 0.19, vitB5: 0.25, choline: 2.6,
      magnesium: 3, manganese: 0.02, potassium: 49, sodium: 2,
    }, true),
  },
  {
    id: 'crdb-electrolyte-mix',
    name: 'Electrolyte Hydration Mix (Sodium, Potassium, Magnesium)',
    brand: 'LMNT / Endurance Formula',
    source: 'CRDB',
    sourceCode: 'CRDB #94011',
    category: 'Beverages & Hydration',
    defaultServing: '1 packet in 500ml water (506g)',
    servings: [
      { label: '1 packet dry (6g)', grams: 6 },
      { label: '1 packet in 500ml water (506g)', grams: 506 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 2, water: 98.8, carbs: 0.4,
      magnesium: 12, potassium: 40, sodium: 198,
    }, true),
  },
  {
    id: 'nccdb-coconut-water',
    name: 'Coconut Water, Unsweetened',
    source: 'NCCDB',
    sourceCode: 'NCCDB #12119',
    category: 'Beverages & Hydration',
    defaultServing: '1 cup (240g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 cup (240g)', grams: 240 },
      { label: '1 carton, 11 fl oz (330g)', grams: 330 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 19, water: 95.0, carbs: 3.7, fiber: 1.1, sugars: 2.6, protein: 0.7, fat: 0.2,
      vitB1: 0.03, vitB2: 0.06, vitB6: 0.03, vitC: 2.4,
      calcium: 24, copper: 0.04, iron: 0.3, magnesium: 25, manganese: 0.14, phosphorus: 20, potassium: 250, sodium: 105, zinc: 0.1,
    }, true),
  },

  // ==================== SUPPLEMENTS & SPORTS ====================
  {
    id: 'crdb-whey-isolate',
    name: 'Whey Protein Isolate, Unflavored / Vanilla',
    brand: 'Optimum / Cronometer Gold DB',
    source: 'CRDB',
    sourceCode: 'CRDB #77102',
    category: 'Supplements & Sports',
    defaultServing: '1 scoop (31g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 scoop (31g)', grams: 31 },
      { label: '2 scoops (62g)', grams: 62 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 371, water: 3.2, carbs: 4.5, sugars: 2.2, protein: 83.9, fat: 1.6, saturatedFat: 0.8, cholesterol: 16,
      leucine: 9.2, isoleucine: 5.4, valine: 5.1, lysine: 8.1,
      vitB2: 0.4, vitB12: 1.8,
      calcium: 380, iron: 0.8, magnesium: 65, phosphorus: 290, potassium: 480, sodium: 320, zinc: 1.2,
    }),
  },
  {
    id: 'crdb-dark-chocolate-85',
    name: 'Dark Chocolate, 85% Cacao Solids',
    source: 'NCCDB',
    sourceCode: 'NCCDB #19904',
    category: 'Supplements & Sports',
    defaultServing: '3 squares (30g)',
    servings: [
      { label: '100g', grams: 100 },
      { label: '1 square (10g)', grams: 10 },
      { label: '3 squares (30g)', grams: 30 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 598, water: 1.4, caffeine: 80, carbs: 45.9, fiber: 10.9, starch: 11.0, sugars: 14.0, addedSugars: 13.0, protein: 7.8, fat: 42.6, saturatedFat: 24.5, monounsaturatedFat: 12.8, polyunsaturatedFat: 1.3,
      omega3: 0.03, omega6: 1.22, cholesterol: 3,
      vitA: 2, vitB1: 0.03, vitB2: 0.08, vitB3: 1.05, vitB5: 0.42, vitB6: 0.04, vitE: 0.59, vitK: 7.3,
      calcium: 73, copper: 1.77, iron: 11.9, magnesium: 228, manganese: 1.95, phosphorus: 308, potassium: 715, selenium: 6.8, sodium: 20, zinc: 3.3,
    }, true),
  },
  {
    id: 'crdb-fish-oil-softgel',
    name: 'Omega-3 Fish Oil Concentrate (EPA / DHA)',
    brand: 'Nordic Naturals / USP Verified',
    source: 'CRDB',
    sourceCode: 'CRDB #99018',
    category: 'Supplements & Sports',
    defaultServing: '2 softgels (2.4g)',
    servings: [
      { label: '1 softgel (1.2g)', grams: 1.2 },
      { label: '2 softgels (2.4g)', grams: 2.4 },
    ],
    nutrientsPer100g: withCompleteNutrients({
      kcal: 900, fat: 100.0, polyunsaturatedFat: 75.0, omega3: 62.5, vitD: 41667, vitE: 208.0,
    }),
  },
];

export const CRONOMETER_EXERCISE_DB: ExerciseItem[] = [
  // Cardio & Endurance
  {
    id: 'ex-running-road',
    name: 'Running, Outdoor or Treadmill',
    category: 'Cardio & Endurance',
    mets: { light: 7.0, moderate: 9.8, vigorous: 11.8, max: 14.5 },
    defaultIntensity: 'moderate',
    defaultRpe: 7,
    energySystem: 'Aerobic',
    muscleGroups: ['Quadriceps', 'Hamstrings', 'Calves', 'Glutes', 'Core'],
    supportsDistance: true,
  },
  {
    id: 'ex-cycling-outdoor',
    name: 'Cycling, Road or Stationary Bike',
    category: 'Cardio & Endurance',
    mets: { light: 5.5, moderate: 8.0, vigorous: 10.5, max: 14.0 },
    defaultIntensity: 'moderate',
    defaultRpe: 6,
    energySystem: 'Aerobic',
    muscleGroups: ['Quadriceps', 'Glutes', 'Calves', 'Hip Flexors'],
    supportsDistance: true,
  },
  {
    id: 'ex-rowing-erg',
    name: 'Rowing, Concept2 Ergometer or Water',
    category: 'Cardio & Endurance',
    mets: { light: 4.8, moderate: 7.0, vigorous: 9.5, max: 12.5 },
    defaultIntensity: 'vigorous',
    defaultRpe: 8,
    energySystem: 'Mixed Metabolic',
    muscleGroups: ['Lats', 'Quadriceps', 'Posterior Chain', 'Biceps', 'Core'],
    supportsDistance: true,
  },
  {
    id: 'ex-swimming-laps',
    name: 'Swimming Laps, Freestyle / Mixed Stroke',
    category: 'Cardio & Endurance',
    mets: { light: 5.8, moderate: 8.3, vigorous: 10.0, max: 13.0 },
    defaultIntensity: 'moderate',
    defaultRpe: 7,
    energySystem: 'Aerobic',
    muscleGroups: ['Shoulders', 'Lats', 'Core', 'Full Body'],
    supportsDistance: true,
  },
  {
    id: 'ex-hiking-trail',
    name: 'Hiking, Cross-Country / Elevation Gain',
    category: 'Cardio & Endurance',
    mets: { light: 5.3, moderate: 6.8, vigorous: 8.5, max: 10.5 },
    defaultIntensity: 'moderate',
    defaultRpe: 5,
    energySystem: 'Aerobic',
    muscleGroups: ['Glutes', 'Calves', 'Quadriceps', 'Core'],
    supportsDistance: true,
  },
  {
    id: 'ex-walking-brisk',
    name: 'Walking, Brisk Pace / Incline Treadmill',
    category: 'Cardio & Endurance',
    mets: { light: 3.0, moderate: 4.3, vigorous: 5.8, max: 7.2 },
    defaultIntensity: 'moderate',
    defaultRpe: 3,
    energySystem: 'Aerobic',
    muscleGroups: ['Calves', 'Hamstrings', 'Glutes'],
    supportsDistance: true,
  },
  {
    id: 'ex-jump-rope',
    name: 'Jump Rope / Skipping',
    category: 'Cardio & Endurance',
    mets: { light: 8.8, moderate: 11.0, vigorous: 12.3, max: 14.0 },
    defaultIntensity: 'vigorous',
    defaultRpe: 8,
    energySystem: 'Mixed Metabolic',
    muscleGroups: ['Calves', 'Shoulders', 'Forearms', 'Core'],
  },

  // Strength & Resistance
  {
    id: 'ex-strength-hypertrophy',
    name: 'Weightlifting, Hypertrophy / Resistance Training',
    category: 'Strength & Resistance',
    mets: { light: 3.5, moderate: 5.0, vigorous: 6.5, max: 8.0 },
    defaultIntensity: 'vigorous',
    defaultRpe: 8,
    energySystem: 'Phosphagen / Strength',
    muscleGroups: ['Full Body', 'Chest', 'Back', 'Legs', 'Shoulders'],
    supportsStrengthVolume: true,
  },
  {
    id: 'ex-powerlifting-compound',
    name: 'Powerlifting (Squat, Bench Press, Deadlift)',
    category: 'Strength & Resistance',
    mets: { light: 4.0, moderate: 6.0, vigorous: 7.5, max: 9.0 },
    defaultIntensity: 'vigorous',
    defaultRpe: 9,
    energySystem: 'Phosphagen / Strength',
    muscleGroups: ['Posterior Chain', 'Quadriceps', 'Chest', 'Core'],
    supportsStrengthVolume: true,
  },
  {
    id: 'ex-calisthenics',
    name: 'Calisthenics (Pull-ups, Push-ups, Dips)',
    category: 'Strength & Resistance',
    mets: { light: 3.8, moderate: 5.5, vigorous: 8.0, max: 9.5 },
    defaultIntensity: 'moderate',
    defaultRpe: 7,
    energySystem: 'Phosphagen / Strength',
    muscleGroups: ['Upper Body', 'Core', 'Lats', 'Triceps'],
    supportsStrengthVolume: true,
  },
  {
    id: 'ex-kettlebell-conditioning',
    name: 'Kettlebell Swings, Snatches & Complexes',
    category: 'Strength & Resistance',
    mets: { light: 5.5, moderate: 8.0, vigorous: 9.8, max: 12.0 },
    defaultIntensity: 'vigorous',
    defaultRpe: 8,
    energySystem: 'Mixed Metabolic',
    muscleGroups: ['Glutes', 'Hamstrings', 'Lower Back', 'Grip', 'Shoulders'],
    supportsStrengthVolume: true,
  },

  // HIIT & Conditioning
  {
    id: 'ex-hiit-circuit',
    name: 'HIIT (High-Intensity Interval Training) / Metcon',
    category: 'HIIT & Conditioning',
    mets: { light: 6.5, moderate: 8.8, vigorous: 11.2, max: 14.0 },
    defaultIntensity: 'vigorous',
    defaultRpe: 9,
    energySystem: 'Anaerobic',
    muscleGroups: ['Full Body', 'Cardiovascular', 'Core'],
  },
  {
    id: 'ex-boxing-bag',
    name: 'Boxing, Heavy Bag & Footwork Drills',
    category: 'HIIT & Conditioning',
    mets: { light: 5.5, moderate: 7.8, vigorous: 10.5, max: 12.8 },
    defaultIntensity: 'vigorous',
    defaultRpe: 8,
    energySystem: 'Anaerobic',
    muscleGroups: ['Shoulders', 'Core', 'Calves', 'Upper Back'],
  },
  {
    id: 'ex-stair-climber',
    name: 'StairMaster / VersaClimber',
    category: 'HIIT & Conditioning',
    mets: { light: 6.0, moderate: 8.5, vigorous: 10.8, max: 13.5 },
    defaultIntensity: 'vigorous',
    defaultRpe: 8,
    energySystem: 'Mixed Metabolic',
    muscleGroups: ['Glutes', 'Quadriceps', 'Calves'],
  },

  // Sports & Athletics
  {
    id: 'ex-basketball',
    name: 'Basketball, Full-Court Game or Scrimmage',
    category: 'Sports & Athletics',
    mets: { light: 5.0, moderate: 6.5, vigorous: 8.5, max: 10.5 },
    defaultIntensity: 'vigorous',
    defaultRpe: 8,
    energySystem: 'Mixed Metabolic',
    muscleGroups: ['Legs', 'Core', 'Shoulders'],
  },
  {
    id: 'ex-tennis-pickleball',
    name: 'Tennis / Pickleball, Singles or Competitive Doubles',
    category: 'Sports & Athletics',
    mets: { light: 4.5, moderate: 6.8, vigorous: 8.5, max: 10.0 },
    defaultIntensity: 'moderate',
    defaultRpe: 6,
    energySystem: 'Mixed Metabolic',
    muscleGroups: ['Legs', 'Shoulders', 'Forearms', 'Core'],
  },
  {
    id: 'ex-soccer',
    name: 'Soccer, Competitive Match or Training',
    category: 'Sports & Athletics',
    mets: { light: 6.0, moderate: 7.8, vigorous: 10.0, max: 12.0 },
    defaultIntensity: 'vigorous',
    defaultRpe: 8,
    energySystem: 'Mixed Metabolic',
    muscleGroups: ['Quadriceps', 'Hamstrings', 'Calves', 'Core'],
  },
  {
    id: 'ex-rock-climbing',
    name: 'Rock Climbing / Bouldering',
    category: 'Sports & Athletics',
    mets: { light: 5.0, moderate: 6.5, vigorous: 8.0, max: 10.0 },
    defaultIntensity: 'moderate',
    defaultRpe: 7,
    energySystem: 'Phosphagen / Strength',
    muscleGroups: ['Forearms', 'Lats', 'Biceps', 'Core'],
  },

  // Mobility & Mind-Body
  {
    id: 'ex-yoga-vinyasa',
    name: 'Yoga, Vinyasa / Power Flow',
    category: 'Mobility & Mind-Body',
    mets: { light: 2.5, moderate: 3.8, vigorous: 5.0, max: 6.0 },
    defaultIntensity: 'moderate',
    defaultRpe: 4,
    energySystem: 'Aerobic',
    muscleGroups: ['Core', 'Shoulders', 'Hips', 'Stabilizers'],
  },
  {
    id: 'ex-pilates-reformer',
    name: 'Pilates, Mat or Reformer',
    category: 'Mobility & Mind-Body',
    mets: { light: 2.8, moderate: 3.8, vigorous: 5.2, max: 6.2 },
    defaultIntensity: 'moderate',
    defaultRpe: 5,
    energySystem: 'Aerobic',
    muscleGroups: ['Core', 'Glutes', 'Pelvic Floor', 'Postural'],
  },
  {
    id: 'ex-mobility-recovery',
    name: 'Active Mobility, Foam Rolling & Stretching',
    category: 'Mobility & Mind-Body',
    mets: { light: 2.0, moderate: 2.5, vigorous: 3.2, max: 3.8 },
    defaultIntensity: 'light',
    defaultRpe: 2,
    energySystem: 'Aerobic',
    muscleGroups: ['Full Body', 'Joints & Fascia'],
  },
];

export const RPE_SCALE_DESCRIPTIONS: Record<number, { label: string; description: string; zone: HeartRateZone; color: string }> = {
  1: { label: 'Very Light', description: 'Minimal effort, resting breathing', zone: 1, color: '#38bdf8' },
  2: { label: 'Light & Easy', description: 'Comfortable recovery pace, easy full conversation', zone: 1, color: '#38bdf8' },
  3: { label: 'Light Aerobic', description: 'Warm-up or easy endurance, nasal breathing comfortable', zone: 2, color: '#34d399' },
  4: { label: 'Moderate', description: 'Steady Zone 2 aerobic base, can speak in full sentences', zone: 2, color: '#34d399' },
  5: { label: 'Somewhat Hard', description: 'Brisk tempo effort, deeper rhythmic breathing', zone: 3, color: '#a3e635' },
  6: { label: 'Challenging Tempo', description: 'Sustained aerobic-anaerobic transition, short phrases only', zone: 3, color: '#facc15' },
  7: { label: 'Vigorous / Hard', description: 'High exertion, requires strong mental focus, 2–3 reps in reserve', zone: 4, color: '#fb923c' },
  8: { label: 'Very Hard (Threshold)', description: 'Lactate threshold / heavy working sets, 1–2 words at a time', zone: 4, color: '#f97316' },
  9: { label: 'Near Maximal', description: 'VO2 Max interval or 1 rep in reserve, sustainable briefly', zone: 5, color: '#ef4444' },
  10: { label: 'Max All-Out Effort', description: 'Absolute peak physical exertion / 1RM / max sprint', zone: 5, color: '#dc2626' },
};

export function calculateFoodNutrients(
  food: FoodItem,
  servingLabel: string,
  quantity: number
): { grams: number; nutrients: NutrientMap } {
  const serving =
    food.servings.find((s) => s.label === servingLabel) ||
    food.servings[0] || { label: '100g', grams: 100 };
  const totalGrams = serving.grams * quantity;
  const multiplier = totalGrams / 100;

  const nutrients: NutrientMap = {};
  for (const def of NUTRIENT_DEFINITIONS) {
    const val = (food.nutrientsPer100g[def.id] || 0) * multiplier;
    nutrients[def.id] = Number(val.toFixed(def.decimals + 1));
  }
  return { grams: Number(totalGrams.toFixed(1)), nutrients };
}

export interface ExerciseCalculationInput {
  exercise: ExerciseItem;
  durationMinutes: number;
  intensity: ExerciseIntensity;
  rpe: number;
  weightKg: number;
  avgHeartRate?: number;
  sets?: number;
  reps?: number;
  loadKg?: number;
  distanceKm?: number;
}

export interface ExerciseCalculationOutput {
  caloriesBurned: number;
  exertionLoad: number; // sRPE = duration * RPE (Arbitrary Units)
  strainScore: number; // 0-21 scale
  hrZone: HeartRateZone;
  sweatLossMl: number;
  glycogenUsedG: number;
  sodiumLossMg: number;
  potassiumLossMg: number;
  magnesiumLossMg: number;
  tonnageKg: number;
}

export function calculateExerciseExpenditure(
  input: ExerciseCalculationInput
): ExerciseCalculationOutput {
  const {
    exercise,
    durationMinutes,
    intensity,
    rpe,
    weightKg,
    avgHeartRate,
    sets = 0,
    reps = 0,
    loadKg = 0,
  } = input;

  const baseMet = exercise.mets[intensity] || exercise.mets.moderate || 6.0;
  // Adjust MET subtly by how far RPE deviates from the exercise's default RPE
  const rpeModifier = 1 + (rpe - exercise.defaultRpe) * 0.045;
  const effectiveMet = Math.max(1.5, baseMet * rpeModifier);

  // Standard ACSM / Compendium formula: kcal/min = (MET * 3.5 * weightKg) / 200
  let caloriesBurned = Math.round(((effectiveMet * 3.5 * weightKg) / 200) * durationMinutes);

  // Add mechanical work bonus if high strength tonnage is logged
  const tonnageKg = sets > 0 && reps > 0 && loadKg > 0 ? sets * reps * loadKg : 0;
  if (tonnageKg > 0) {
    caloriesBurned += Math.round(tonnageKg * 0.008);
  }

  // Foster Session RPE Training Load (AU)
  const exertionLoad = Math.round(durationMinutes * rpe);

  // Strain score on 0–21 logarithmic scale (similar to cardiovascular strain)
  const rawStrain = 21 * (1 - Math.exp(-exertionLoad / 320));
  const strainScore = Number(Math.min(21, Math.max(0.5, rawStrain)).toFixed(1));

  // Determine HR Zone from avgHeartRate if provided, else from RPE
  let hrZone: HeartRateZone = RPE_SCALE_DESCRIPTIONS[Math.min(10, Math.max(1, Math.round(rpe)))]?.zone || 3;
  if (avgHeartRate && avgHeartRate > 60) {
    if (avgHeartRate < 115) hrZone = 1;
    else if (avgHeartRate < 138) hrZone = 2;
    else if (avgHeartRate < 156) hrZone = 3;
    else if (avgHeartRate < 172) hrZone = 4;
    else hrZone = 5;
  }

  // Estimate sweat & electrolyte loss and muscle glycogen utilization
  const sweatRateMlPerMin = 6 + rpe * 1.6;
  const sweatLossMl = Math.round(durationMinutes * sweatRateMlPerMin);
  const carbFraction = rpe >= 8 ? 0.78 : rpe >= 6 ? 0.62 : rpe >= 4 ? 0.45 : 0.3;
  const glycogenUsedG = Math.round((caloriesBurned * carbFraction) / 4);
  const sodiumLossMg = Math.round((sweatLossMl / 1000) * 850);
  const potassiumLossMg = Math.round((sweatLossMl / 1000) * 210);
  const magnesiumLossMg = Math.round((sweatLossMl / 1000) * 24);

  return {
    caloriesBurned,
    exertionLoad,
    strainScore,
    hrZone,
    sweatLossMl,
    glycogenUsedG,
    sodiumLossMg,
    potassiumLossMg,
    magnesiumLossMg,
    tonnageKg,
  };
}

/**
 * Cronometer "Nutrient Oracle / Suggest Foods" algorithm:
 * Finds foods from the database that best fill the user's top micronutrient gaps
 * while staying within their remaining calorie budget.
 */
export function suggestFoodsForGaps(
  currentTotals: NutrientMap,
  targets: Record<string, number>,
  foods: FoodItem[] = CRONOMETER_FOOD_DB,
  limit = 5
): { food: FoodItem; topContributions: { nutrientName: string; pctOfGap: number }[]; score: number }[] {
  const focusNutrients = [
    'iron', 'calcium', 'magnesium', 'potassium', 'zinc', 'selenium',
    'vitA', 'vitC', 'vitD', 'vitE', 'vitK', 'vitB12', 'folate', 'choline',
    'omega3', 'fiber', 'protein',
  ];

  const gaps: { id: string; name: string; deficitRatio: number; missingAmount: number }[] = [];
  for (const id of focusNutrients) {
    const target = targets[id] || 0;
    if (target <= 0) continue;
    const current = currentTotals[id] || 0;
    if (current < target * 0.9) {
      const def = NUTRIENT_DEFINITIONS.find((d) => d.id === id);
      gaps.push({
        id,
        name: def?.shortName || def?.name || id,
        deficitRatio: (target - current) / target,
        missingAmount: target - current,
      });
    }
  }

  if (gaps.length === 0) return [];

  const scored = foods.map((food) => {
    const { nutrients } = calculateFoodNutrients(food, food.defaultServing, 1);
    let score = 0;
    const contributions: { nutrientName: string; pctOfGap: number }[] = [];

    for (const gap of gaps) {
      const amount = nutrients[gap.id] || 0;
      if (amount > 0 && gap.missingAmount > 0) {
        const pctFilled = Math.min(1.2, amount / gap.missingAmount);
        if (pctFilled >= 0.15) {
          score += pctFilled * gap.deficitRatio * 100;
          contributions.push({
            nutrientName: gap.name,
            pctOfGap: Math.round(Math.min(100, pctFilled * 100)),
          });
        }
      }
    }

    contributions.sort((a, b) => b.pctOfGap - a.pctOfGap);
    return {
      food,
      topContributions: contributions.slice(0, 3),
      score: Math.round(score),
    };
  });

  return scored
    .filter((item) => item.score > 10 && item.topContributions.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
