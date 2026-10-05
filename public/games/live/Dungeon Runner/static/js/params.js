/**
 * Dungeon Runner — adjustable parameter registry.
 *
 * Single source of truth for every runtime-adjustable value:
 *   - the game reads live values from PARAMS every frame / at every spawn
 *   - the Skillprint bridge writes into it via setParam()
 *   - toBackendDefinitions() produces the GameScoringConfig.parameter_definitions JSON
 *   - PRESETS map the 1–9 test keys used by the portal's GameAdjustmentTester
 *
 * This module has no DOM / three.js dependency so it can also be imported from node
 * (see ../../backend/export-config.mjs).
 */

export const PARAM_DEFS = [
  // ── Tier 1: exposed to the adaptive backend in v1 ─────────────────────────
  {
    name: 'playerSpeed', type: 'number', min: 6, max: 20, default: 10, tier: 1,
    description: 'Forward running speed in metres per second. The master pace lever: everything arrives faster when it is higher.',
    adjustment_guide: 'Raise in small steps while the player is not taking hits. Lower immediately after two or more hits in a chunk, or when the target is relax or awe.',
  },
  {
    name: 'enemySpawnRate', type: 'number', min: 0, max: 8, default: 3, tier: 1,
    description: 'Enemies spawned per 100 metres of corridor. 0 removes combat entirely.',
    adjustment_guide: 'Higher for grit, joy (with low enemyHealth) and attention training. Near 0 for relax and awe. Lower when accuracy drops under 50%.',
  },
  {
    name: 'enemySpeed', type: 'number', min: 0.5, max: 2, default: 1, tier: 1,
    description: 'Multiplier on enemy approach speed and enemy projectile speed.',
    adjustment_guide: 'Raise for timing and perceptual speed training when the player is landing shots. Lower when the player is hit by enemies twice in a chunk.',
  },
  {
    name: 'enemyHealth', type: 'integer', min: 1, max: 5, default: 2, tier: 1,
    description: 'Pistol shots needed to kill a standard enemy.',
    adjustment_guide: '1 for joy (many fast kills). Raise for action skill so more shots per kill are required. Keep low when accuracy is poor.',
  },
  {
    name: 'enemyAggression', type: 'number', min: 0, max: 1, default: 0.5, tier: 1,
    description: 'How dangerous enemies are: archer fire rate and imp lunge/lane-tracking chance. 0 makes enemies almost decorative.',
    adjustment_guide: 'Near 0 for relax. High for grit. Lower it before lowering enemySpawnRate when the player is overwhelmed.',
  },
  {
    name: 'weaponType', type: 'integer', min: 0, max: 2, default: 0, tier: 1,
    description: 'Forces the current weapon: 0 pistol (precise, slow), 1 shotgun (spread, high damage, short range), 2 plasma (fast projectile, splash). Ammo is refilled on change.',
    adjustment_guide: 'Pistol for focus (precision). Shotgun for grit and action. Plasma for relax and joy (forgiving). Rotate between values for curiosity and task switching.',
  },
  {
    name: 'weaponDamage', type: 'number', min: 0.5, max: 3, default: 1, tier: 1,
    description: 'Damage multiplier applied to all player weapons.',
    adjustment_guide: 'Raise to make combat easier without changing pace. Lower for grit when the player dominates.',
  },
  {
    name: 'obstacleDensity', type: 'number', min: 0, max: 1, default: 0.4, tier: 1,
    description: 'Obstacles per corridor segment as a fraction of the maximum. 0 gives clear halls.',
    adjustment_guide: 'Main timing/spatial lever. Raise while the player dodges cleanly; lower after collisions or pit falls.',
  },
  {
    name: 'hazardTelegraphTime', type: 'number', min: 0.3, max: 2.5, default: 1.2, tier: 1,
    description: 'Seconds of warning before a hazard or enemy becomes a threat: hazards are visible in the distance from the moment they spawn, and this far ahead in time their warning ring and HUD lane marker light up (imps start charging, archers start shooting).',
    adjustment_guide: 'Direct perceptual speed lever. Lower toward 0.4 only when accuracy is above 70% and no hit was taken in the last chunk. Raise for relax and after repeated hits.',
  },
  {
    name: 'lightLevel', type: 'number', min: 0.2, max: 1.5, default: 0.8, tier: 1,
    description: 'Torch and ambient light intensity. A mood lever, not a difficulty lever. Low values feel oppressive, high values feel safe.',
    adjustment_guide: 'High for relax and joy. Very low for awe. Slightly dim for focus to narrow attention.',
  },

  // ── Tier 2: implemented, exposed once Tier 1 is tuned ─────────────────────
  {
    name: 'speedRampRate', type: 'number', min: 0, max: 0.5, default: 0.15, tier: 2,
    description: 'Fractional increase of playerSpeed per minute of running.',
    adjustment_guide: 'Raise for grit. 0 for relax.',
  },
  {
    name: 'fireRate', type: 'number', min: 0.5, max: 2, default: 1, tier: 2,
    description: 'Multiplier on shots per second for all weapons.',
    adjustment_guide: 'Raise for action and joy. Lower to make ammo matter for planning.',
  },
  {
    name: 'autoAim', type: 'boolean', min: 0, max: 1, default: false, tier: 2,
    description: 'When true, shots are pulled toward the nearest enemy inside the aim cone.',
    adjustment_guide: 'Enable for relax or when accuracy stays under 35% for two chunks.',
  },
  {
    name: 'pickupFrequency', type: 'number', min: 0, max: 1, default: 0.4, tier: 2,
    description: 'Health, ammo and gold pickups per segment as a fraction of the maximum.',
    adjustment_guide: 'Raise for joy and relax. Pickups also act as distractors for attention training.',
  },
  {
    name: 'damageTaken', type: 'number', min: 0.25, max: 2, default: 1, tier: 2,
    description: 'Multiplier on all damage the player receives.',
    adjustment_guide: 'Lower for relax. Raise for grit when the player rarely dies.',
  },
  {
    name: 'healthRegen', type: 'number', min: 0, max: 5, default: 0, tier: 2,
    description: 'Health regenerated per second while not taking damage.',
    adjustment_guide: 'Give 2 to 5 for relax and joy. 0 for grit.',
  },
  {
    name: 'obstacleVariety', type: 'integer', min: 0, max: 3, default: 2, tier: 2,
    description: 'Which obstacle classes are unlocked: 0 barrels only, 1 adds low beams (slide), 2 adds pits (jump) and gates (lane choice), 3 adds moving blades.',
    adjustment_guide: 'Raise for spatial, visualization and task switching. Keep at 0 or 1 for relax.',
  },
  {
    name: 'fogDensity', type: 'number', min: 0.01, max: 0.08, default: 0.022, tier: 2,
    description: 'Exponential fog density. Higher means shorter sight lines.',
    adjustment_guide: 'Raise for awe and focus. Lower for relax. Interacts with hazardTelegraphTime.',
  },
  {
    name: 'screenShake', type: 'number', min: 0, max: 1, default: 0.5, tier: 2,
    description: 'Camera shake and impact feedback intensity.',
    adjustment_guide: 'Low for relax and focus. High for grit and joy.',
  },
  {
    name: 'scoreFeedback', type: 'number', min: 0, max: 1, default: 0.6, tier: 2,
    description: 'Intensity of combo popups, kill streak text and celebration effects.',
    adjustment_guide: 'Max for joy. Low for focus to reduce clutter.',
  },
  {
    name: 'musicIntensity', type: 'number', min: 0, max: 1, default: 0.5, tier: 2,
    description: 'Tempo and drive of the procedural soundtrack.',
    adjustment_guide: 'Low for relax and awe. High for grit.',
  },
];

const DEF_BY_NAME = new Map(PARAM_DEFS.map((d) => [d.name, d]));

/** Live parameter values. Systems read these every frame or at spawn time. */
export const PARAMS = {};

/** Where the current value came from: 'default' | 'preset' | 'backend' | 'debug'. */
export const PARAM_SOURCE = {};

const listeners = new Set();

export function resetParams() {
  for (const d of PARAM_DEFS) {
    PARAMS[d.name] = d.default;
    PARAM_SOURCE[d.name] = 'default';
  }
}
resetParams();

export function getParamDef(name) {
  return DEF_BY_NAME.get(name) || null;
}

/** Subscribe to changes: fn({ name, value, previous, def, source }). Returns an unsubscribe fn. */
export function onParamChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function coerce(def, raw) {
  if (def.type === 'boolean') {
    if (typeof raw === 'string') return ['true', '1', 'yes', 'on'].includes(raw.toLowerCase());
    return Boolean(Number(raw));
  }
  let v = typeof raw === 'number' ? raw : parseFloat(raw);
  if (!Number.isFinite(v)) return null;
  v = Math.max(def.min, Math.min(def.max, v));
  if (def.type === 'integer') v = Math.round(v);
  return v;
}

/**
 * Set a parameter. Unknown names and unparsable values are rejected (never reset to default).
 * Returns { ok, name, value, previous, reason? }.
 */
export function setParam(name, rawValue, source = 'backend') {
  const def = DEF_BY_NAME.get(name);
  if (!def) return { ok: false, name, reason: 'unknown parameter' };
  const value = coerce(def, rawValue);
  if (value === null) return { ok: false, name, reason: `invalid value ${rawValue}` };
  const previous = PARAMS[name];
  PARAMS[name] = value;
  PARAM_SOURCE[name] = source;
  const evt = { name, value, previous, def, source };
  for (const fn of listeners) {
    try { fn(evt); } catch (e) { console.error('[DungeonRunner] param listener failed', e); }
  }
  return { ok: true, name, value, previous };
}

/** GameScoringConfig.parameter_definitions shape expected by the Skillprint backend. */
export function toBackendDefinitions(tier = 1) {
  const out = {};
  for (const d of PARAM_DEFS) {
    if (d.tier > tier) continue;
    out[d.name] = {
      type: d.type,
      min: d.min,
      max: d.max,
      default: d.default,
      description: d.description,
      adjustment_guide: d.adjustment_guide,
    };
  }
  return out;
}

/** Shape sent as `game_parameters` on session create (SDK ParameterInfo style). */
export function toSdkParameterInfos(tier = 1) {
  return PARAM_DEFS.filter((d) => d.tier <= tier).map((d) => ({
    name: d.name,
    type: d.type === 'number' ? 'Float' : d.type === 'integer' ? 'Integer' : 'Boolean',
    description: d.description,
    min_value: String(d.min),
    max_value: String(d.max),
    adjustment_guide: d.adjustment_guide,
  }));
}

/**
 * Keyboard test presets (keys 1–9). Mirrors the `dungeon-runner` case in the portal's
 * GameAdjustmentTester and the entry in public/games/GAME_PARAMETERS.MD.
 */
export const PRESETS = {
  1: { label: 'Chill stroll', values: { playerSpeed: 7, enemySpawnRate: 1, enemyAggression: 0.1, obstacleDensity: 0.2, lightLevel: 1.2 } },
  2: { label: 'Slow', values: { playerSpeed: 8 } },
  3: { label: 'Default pace', values: { playerSpeed: 10, enemySpawnRate: 3 } },
  4: { label: 'Fast', values: { playerSpeed: 14 } },
  5: { label: 'Horde', values: { enemySpawnRate: 6, enemySpeed: 1.4 } },
  6: { label: 'Shotgun', values: { weaponType: 1, weaponDamage: 1.5 } },
  7: { label: 'Plasma', values: { weaponType: 2 } },
  8: { label: 'Twitch', values: { hazardTelegraphTime: 0.4, obstacleDensity: 0.8 } },
  9: { label: 'Nightmare', values: { playerSpeed: 18, enemySpawnRate: 8, enemySpeed: 1.8, enemyAggression: 1, obstacleDensity: 1, lightLevel: 0.3 } },
};

export function applyPreset(key, source = 'preset') {
  const p = PRESETS[key];
  if (!p) return null;
  const results = Object.entries(p.values).map(([n, v]) => setParam(n, v, source));
  return { label: p.label, results };
}
