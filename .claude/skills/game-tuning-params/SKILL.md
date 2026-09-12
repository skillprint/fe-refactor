---
name: game-tuning-params
description: Generates the two artifacts a Skillprint game needs to plug into the LLM-based mood/difficulty adjustment system — a natural-language mood-adjustment prompt (relax/focus/grit guidance for an LLM) and a JSON parameter schema (min/max/type/default/description per tunable parameter). Use this whenever the user asks to write, generate, or update tuning instructions, adjustment prompts, or parameter definitions for a game under public/games/live/, or mentions "mood adjustment", "difficulty tuning", "ADJUST_GAME", "skillprintShim", or a specific game by name (e.g. Dungeon Runner, Stroop Test, Simon Says, Typing Speed) in the context of difficulty or parameters. Always grounds parameters in the real game code — never invents them.
---

# Game Tuning Params

Produces two artifacts for a game so it can plug into Skillprint's LLM-driven mood/difficulty
adjustment system: a prose instruction prompt for the adjustment LLM, and a JSON parameter
schema. Both follow a fixed house style shown below — match it exactly rather than improvising
a new format.

## Why grounding matters

The adjustment LLM only ever sees the parameter names and ranges you write here — it has no
access to the game's source. If a parameter name, range, or mechanical description is wrong or
invented, every future tuning decision for that game will be silently wrong in production. So
the one rule that matters more than anything else in this skill: **every parameter, range, and
default must come from code you actually read**, not from what seems plausible.

## Step 1: Find the real exposed parameters

For a game at `public/games/live/<GameName>/`, look for:

- `static/skillprintShim.js` (or similar) — the `ADJUST_GAME` postMessage listener is the
  actual contract with the adjustment system. Whatever parameter names it reads off the message
  (e.g. `parameterName`/`parameterValue`, or a batch payload) are the ones that matter, not
  internal variable names that never leave the shim.
- The controls object the shim calls into, e.g. `window.__<game>Controls.setX(...)` — read the
  setter to see what it actually mutates and any clamping/rounding it does.
- `public/games/GAME_PARAMETERS.MD` — often already documents the exposed params, their
  ranges, and sometimes a difficulty preset ladder (a numbered list of `{param: value, ...}`
  presets from easy to hard) for the game's manual tester.
- Any difficulty/config module the game's main loop reads from, if the shim delegates to it
  rather than setting values directly.

If the game's code is spread across several files or the shim isn't obvious from a quick look,
delegate the investigation to the `Explore` agent rather than guessing — ask it specifically for
the ADJUST_GAME listener, the controls object it calls, and any GAME_PARAMETERS.MD entry for
this game, with exact file:line references.

Capture, per parameter: the wire name, type (`integer` or `number`), min, max, default, and what
it mechanically controls. Also note any mechanical caveats surfaced in the code — e.g. changing
a parameter mid-round forcibly ends the round, a value only takes effect on the next spawn/tile/
level, or two parameters are coupled (one derives from the other).

If you cannot find where a candidate parameter is actually wired to gameplay, don't include it —
tell the user what's missing instead of filling in a plausible-looking range.

## Step 2: Derive the relax / focus / grit mapping

- If the code or GAME_PARAMETERS.MD already has a preset ladder (a graded list of parameter
  combos from easy to hard), anchor relax/focus/grit to specific rungs on that ladder rather than
  inventing new numbers — pick a low rung for relax, a middle rung for focus, and a high rung for
  grit.
- Otherwise, spread each parameter across roughly the lower-third / middle / upper-third of its
  min–max range, oriented by which direction the code says is harder (a parameter can be "higher
  = easier", like combo time, or "higher = harder", like spawn rate — get this from the
  parameter's actual mechanical effect, not from its name).
- When one parameter derives several downstream timings (like a single difficulty multiplier
  scaling multiple internal delays), describe the downstream effects in the prose so the
  adjustment LLM understands what moving that one knob actually changes.

## Step 3: Write the prose instructions

Follow this exact shape (adapt the bullet list to however many parameters the game actually has):

```
You are adjusting parameters for <Game>, a <one-clause genre/mechanic description>.
The player <what the player actually does, one or two sentences>.

<If there are only one or two parameters, describe them in prose first with their
names/ranges/mechanical effects. If there are three or more, a short bulleted list works too.>

Given the player's current flow state, skill metrics, and target mood,
output parameter values that guide the player toward the target mood:
- For 'relax': <param ~value>, <param ~value>, ... — <what this feels like to play>
- For 'focus': <param ~value>, <param ~value>, ...
- For 'grit': <param ~value>, <param ~value>, ... — <what this feels like to play>

Consider the player's current performance: if flow score is low and cognitive
load is high, the game is likely too hard — ease off <(name which parameter to move first if
there's an obvious order, e.g. easiest/least-disruptive to change)>. If arousal is low and
attention is dropping, the player may be bored — increase challenge <(same ordering note)>.

Always adjust gradually from the current parameter values to avoid jarring transitions.
<Any mechanical caveat from Step 1, e.g. "Note that changing X ends the current round
immediately, so prefer adjusting it between rounds.">
```

## Step 4: Write the JSON schema

Exact shape, one key per exposed parameter, in the same order as the prose:

```json
{"paramName": {"max": <num>, "min": <num>, "type": "integer" | "number", "default": <num>, "description": "<what it controls>. <Direction and effect on difficulty>."}}
```

- `type` is `"integer"` for whole-number params (counts, tile numbers), `"number"` for floats
  (speeds, multipliers, seconds if fractional).
- The `description` should read the same way as the Hextris/Simon Says examples below: state
  what the parameter controls, then the direction that increases difficulty.

## Step 5: Deliver both

Output the prose block and the JSON block together as your final answer, ready to hand directly
to the mood-adjustment LLM system — this skill's job ends at producing the two artifacts, not at
wiring them into any config file, unless the user separately asks you to save them somewhere.

## Step 6 (optional): Publish to the marketplace API

If the user asks you to actually push these values into the `marketplace` backend (rather than
just hand them the two artifacts), the `GameScoringConfig` model already has fields for exactly
this, and there's an admin API endpoint for setting them:

```
GET/PUT/PATCH https://<marketplace-host>/scoring/api/games/<game-slug>/scoring-config/
```

- Auth: Knox admin token, header `Authorization: Token <admin_knox_token>` (an admin/staff
  `AccountUser`'s Knox token — same auth style as the existing `POST /games/api/games/` create
  endpoint). This skill cannot mint that token itself; ask the user for one if it's not already
  available in the environment.
- The prose mood-adjustment instructions map to the `adjustment_instructions` field (there's also
  `skill_adjustment_instructions` for the SKILL-optimization-target variant, if the game defines
  one).
- The JSON parameter schema maps to the `parameter_definitions` field, verbatim — same shape as
  Step 4's output (keys are the wire-format parameter names, values are
  `{type, min, max, default, description}`).
- `PUT` replaces the whole config; `PATCH` updates only the fields you send (e.g. just
  `adjustment_instructions` without touching an existing `parameter_definitions`). A config is
  auto-created on first request, so either verb works whether or not the game already has one.
- **Parameter names round-trip verbatim.** The endpoint deliberately exempts
  `parameter_definitions` (and `skill_schema_override`/`flow_schema_override`) from the
  marketplace's usual camelCase request/response conversion, so send the exact wire names from
  Step 1 (e.g. `hexagonSpeed`) — don't snake_case them, and don't expect them back snake_cased.

Example `PATCH` body to publish the Hextris artifacts from this skill's worked example:

```bash
curl -X PATCH "https://<marketplace-host>/scoring/api/games/hextris/scoring-config/" \
  -H "Authorization: Token <admin_knox_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "adjustment_instructions": "You are adjusting parameters for Hextris, ...",
    "parameter_definitions": {
      "comboTime": {"max": 60, "min": 10, "type": "integer", "default": 30, "description": "Seconds allowed to achieve a combo. Higher values are more lenient/easier."},
      "hexagonSpeed": {"max": 1.0, "min": 0.1, "type": "number", "default": 0.5, "description": "Hexagon rotation speed. Higher values mean faster rotation and increased difficulty."},
      "creationSpeedModifier": {"max": 1.0, "min": 0.3, "type": "number", "default": 0.73, "description": "Block spawn rate multiplier. Higher values mean faster spawns and increased difficulty."}
    }
  }'
```

`GET` the same URL to confirm what's currently stored before overwriting it, especially with
`PUT` (which replaces the full config).

## Worked examples (style reference only — don't reuse these values for a different game)

**Hextris** (falling-block hex puzzle; player rotates a hexagon to catch blocks):

```
You are adjusting parameters for Hextris, a falling-block hexagonal puzzle game.
The player rotates a hexagon and catches colored blocks to form lines.

Given the player's current flow state, skill metrics, and target mood,
output parameter values that guide the player toward the target mood:
- For 'relax': slow spawns (~0.40), generous combo time (~45s), slow rotation (~0.2)
- For 'focus': moderate pace (~0.70), standard combo (~30s), moderate rotation (~0.5)
- For 'grit': fast spawns (~0.90), strict combos (~20s), fast rotation (~0.75)

Consider the player's current performance: if flow score is low and cognitive
load is high, the game is likely too hard — ease off. If arousal is low and
attention is dropping, the player may be bored — increase challenge.

Always adjust gradually from the current parameter values to avoid jarring transitions.
```

```json
{"comboTime": {"max": 60, "min": 10, "type": "integer", "default": 30, "description": "Seconds allowed to achieve a combo. Higher values are more lenient/easier."}, "hexagonSpeed": {"max": 1.0, "min": 0.1, "type": "number", "default": 0.5, "description": "Hexagon rotation speed. Higher values mean faster rotation and increased difficulty."}, "creationSpeedModifier": {"max": 1.0, "min": 0.3, "type": "number", "default": 0.73, "description": "Block spawn rate multiplier. Higher values mean faster spawns and increased difficulty."}}
```

**Simon Says** (sequence-memory game; player repeats a growing flashing-tile sequence):

```
You are adjusting parameters for Simon Says, a sequence-memory game.
The player watches a growing sequence of flashing colored tiles, then repeats it back in order.

Two parameters are exposed:
- numTiles (integer, 2–8): how many distinct colors/positions are in play. More tiles means more to remember and more chances to mis-hit.
- difficultyMultiplier (float, 0.5–1.5): a single master slider that scales three internal timings together — announcement flash duration, gap between tiles in a sequence, and pause between rounds. Higher values shrink all three (faster flashes, tighter gaps, shorter breathing room between rounds); lower values stretch them out.

Given the player's current flow state, skill metrics, and target mood,
output parameter values that guide the player toward the target mood:
- For 'relax': fewer tiles (~3), slow pace (difficultyMultiplier ~0.6–0.7) — long flashes, generous gaps, relaxed round pauses
- For 'focus': standard tiles (~4), moderate pace (difficultyMultiplier ~1.0)
- For 'grit': many tiles (~6–8), fast pace (difficultyMultiplier ~1.35–1.5) — short flashes, tight gaps, minimal round pauses

Consider the player's current performance: if flow score is low and cognitive
load is high, the game is likely too hard — ease off (reduce numTiles first, then lower difficultyMultiplier). If arousal is low and attention is dropping, the player may be bored — increase challenge (raise difficultyMultiplier, then numTiles).

Always adjust gradually from the current parameter values to avoid jarring transitions. Note that changing numTiles mid-round ends the current round immediately, so prefer adjusting it between rounds rather than mid-sequence.
```

```json
{"numTiles": {"max": 8, "min": 2, "type": "integer", "default": 4, "description": "Number of distinct colored tiles in play. Higher values mean more positions to remember and increased difficulty."}, "difficultyMultiplier": {"max": 1.5, "min": 0.5, "type": "number", "default": 1.0, "description": "Master pace multiplier scaling tile announcement duration, gap between tiles, and pause between rounds. Higher values mean faster flashes, tighter gaps, shorter round pauses, and increased difficulty."}}
```
