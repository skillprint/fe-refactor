# Elixir

A Three.js game about measuring by eye. An alchemist's recipes come in
fractions, decimals, percents, ratios and drops; the flask is a straight glass
cylinder marked only at empty and full. Work out where each layer should end,
then hold to pour and let go on the line nobody drew.

## How it plays

- **Hold** anywhere on the stage (or Space) to pour the tap's ingredient; release
  to stop. Quick taps nudge. There is no draining: an overshoot stands.
- **Enter** (or the button) moves to the next ingredient, then serves.
- On serving, each layer is graded against its exact line, which appears in gold
  round the glass with the signed error: **Perfect** within 1 % of the flask,
  **Fine** 3 %, **Fair** 6 %, else **Spoiled** (all scaled by `tolerance`).
- An **hourglass** runs per potion, 15 s plus 9 s per layer. When it empties the
  potion is served as it stands; layers not begun are Spoiled.
- Served potions are corked, carried up to the moonlit sill and kept there
  between visits (the last 15, in `localStorage`).

Scoring per layer: Perfect 100, Fine 60, Fair 25, Spoiled 0, plus up to 40 for
closeness (so 0.4 % beats 0.9 %). Sand left adds up to 30 %. Consecutive potions
with every layer Fine or better build a streak worth up to ×1.5.

## The math

A layer is judged against what the flask really held when it began, so a
recipe means what it says:

| Wording | Mode | The line is… |
| --- | --- | --- |
| "fill to ⅜ of the flask", "up to 65%", "up to 180 drops" | `to` | that level |
| "another ¼ of the flask", "90 drops", "another 25%" | `add` | where this layer began, plus that much |
| "3 parts to Emberwine’s 2" | `ratio` | where it began, plus 3/2 of what Emberwine actually took |
| "2 : 3, ¾ of the flask in all" | parts `add`, last `to` | each part of the total; the last up to the total |

Rungs (potions served + 1 + `levelOffset`, at least 1):

1. one layer: halves, thirds, quarters
2. one layer: fifths to tenths, a decimal or a percent
3. two layers: up to a second mark, or another so much
4. a flask holding 120–480 drops, measures in drops
5. two ingredients in a ratio: a stated total, or matched to the first pour
6. three layers, each written a different way (decimal, percent, fraction)
7. ratios of two or three over part of the flask; flasks in drops or millilitres
8–9. litres and millilitres together; ratios matched to a middle pour

`static/src/recipes.js` builds them with exact fractions and never imports three.js.
Every target lies between 5 % and 95 % of the flask and each layer sits at least
8 % above the last. A throwaway node check parsed 36,000 generated recipes (every
rung) back from their plain text with an independent reader and matched every target
exactly; rerun one like it after changing the generator.

## In the Skillprint portal

The portal plays it at `/game/elixir`. Locally, open `static/index.html` or the
harness `static/iframeTest.html` under the portal dev server, e.g.
`http://localhost:3000/games/live/Elixir/static/iframeTest.html`.
Three.js 0.170.0 (plus its `RenderPass` addon) and skillprint-js-sdk 1.1.0-beta.9
are vendored in `static/vendor`, copied from Mountain Appreciator.

`static/src/skillprint.js` connects the game to Skillprint through skillprint-js-sdk:

- **Embedded** (the portal, the harness): the page around the game owns the
  session. The game posts `screenshot` (every 2 s: the 3D view with a stamp of
  potion, rung, score, the recipe text, the current layer's level and the
  hourglass; the numeric target is never stamped before serving), `gameEvent`
  (SDK `GameEvent` names), `gameState` (`score`, `isGameOver`, potion, layer,
  level) and `GAME_COMPLETE` when the player presses Finish after a potion. It
  takes `ADJUST_GAME`, `GAME_PAUSE` (sand stops, the tap shuts) and `GAME_RESUME`,
  and forwards keys 1-9 to the adjustment tester.
- **Standalone** with `?skillprintKey=<partner key>` (optional
  `skillprintEnv=production`, `mood`, `playerId`, `skillprintDebug`): the game
  runs its own session with the SDK's `SkillprintManager`, logs the same events
  and applies the backend's adjustments through registered modifiers.
- Otherwise it reports nothing.

Events: `GAME_START`, `LEVEL_START` (potion, rung, title, intro, layers with text,
mode and exact target, capacity, hourglassSec), `POUR_START` / `POUR_STOP` (one per
pour gesture, taps under 250 ms apart merged; level, amount poured, ms), `MATCH`
per layer graded Perfect or Fine and `UNMATCH` per layer Fair or Spoiled (target,
level, errorPct, grade, layerMs, msToServe), `LEVEL_COMPLETE` on serving or
`LEVEL_FAILED` when the sand ran out (grades, points, streak, score),
`GAME_PAUSE` / `GAME_RESUME`, `GAME_END`.

### Tuning

`static/src/params.js` lists what Skillprint can adjust, as SDK `ParameterDefinition`s.
Values out of range are clamped, integers rounded.

| Parameter | Type | Range | Default | Effect | Applies |
| --- | --- | --- | --- | --- | --- |
| `pourRate` | Float | 0.4–2.0 | 1.0 | the flask fills in 6 s ÷ this | at once, mid-pour too |
| `tolerance` | Float | 0.5–2.0 | 1.0 | scales the Perfect / Fine / Fair bands (1 / 3 / 6 %) | next serve |
| `gradations` | Integer | 0–10 | 0 | faint ticks at every 1/n (0 none) | at once |
| `brewTimeScale` | Float | 0.5–2.5 | 1.0 | multiplies the hourglass (15 s + 9 s per layer) | at once, sand left in proportion |
| `levelOffset` | Integer | −3–3 | 0 | shifts the next recipe's rung | next potion |

`backend/export-config.mjs` writes `backend/game-scoring-config.json` (the
backend's parameter definitions, mood and skill adjustment instructions, and the
manifest the portal sends on session start) from that list:

    node "public/games/live/Elixir/backend/export-config.mjs"

Keys 1-9 (harness and portal tester): 1 Relax `{pourRate 0.6, tolerance 1.6,
gradations 4, brewTimeScale 2.2}` · 2 Gentle `{0.8, 1.3, gradations 2}` · 3 Default ·
4 Brisk `{brewTimeScale 0.7, pourRate 1.3}` · 5 Grit `{1.6, 0.7, 0, 0.6}` ·
6 `levelOffset −2` · 7 `levelOffset +2` · 8 `gradations 10` · 9 Extreme
`{2, 0.5, 0, 0.5, levelOffset 3}`.

### Testing hooks

`window.__elixirControls` drives the game without hands or real time:
`start()`, `state()`, `step(ms)`, `render(frames)` (advance and draw by hand, for
a tab whose frames are throttled), `pour(ms)`, `pourTo(level)`, `target()` (the
current layer's exact line), `next()`, `serve()`, `nextPotion()`, `finish()`,
`newPotion(rung)` and `solve(error)`. `window.__elixirState` and
`window.__elixirTuning` hold the last reported state and the parameters in force.

## Files

- `static/src/main.js` — rules, flow, HUD, input, the Skillprint reporting
- `static/src/recipes.js` — recipe generator, exact targets, grading (no three.js)
- `static/src/world.js` — the alcove: renderer and bloom, window and sky, candles, shelves, camera fit
- `static/src/flask.js` — flask, layered liquid, tap, pour, bubbles, marks, gold lines, bottling
- `static/src/card.js` — the parchment recipe card, with stacked fractions
- `static/src/textures.js` — stone, wood, parchment and label textures, painted at load
- `static/src/sound.js` — the pour (its pitch rises as the flask fills), glass, bells; synthesised
- `static/src/look.js` — liquid and grade colours
- `static/src/params.js`, `static/src/skillprint.js` — tuning and the SDK link
