# Elixir

A Three.js game about measuring by eye. An alchemist's recipes come in
fractions, decimals, percents, ratios and drops; the vessel is straight glass
marked only at empty and full. Work out where each layer should end, then hold
to pour and let go on the line nobody drew. Every potion is brewed in another
workshop, with its own room, vessel, tap, ingredients and recipe card.

## How it plays

- **Hold** anywhere on the stage (or Space) to pour the tap's ingredient; release
  to stop. Quick taps nudge. There is no draining: an overshoot stands.
- **Enter** (or the button) moves to the next ingredient, then serves.
- On serving, each layer is graded against its exact line, which appears in gold
  round the glass with the signed error: **Perfect** within 1 % of the flask,
  **Fine** 3 %, **Fair** 6 %, else **Spoiled** (all scaled by `tolerance`).
- An **hourglass** runs per potion, 15 s plus 9 s per layer. When it empties the
  potion is served as it stands; layers not begun are Spoiled.
- Served potions are corked, carried to the room's shelf in their own vessel's
  shape, and kept between visits (the last 15, in `localStorage`); each room's
  shelf shows as many as fit.
- The first play opens with a tutorial (below); after that the title offers
  **How to play** to run it again.

Scoring per layer: Perfect 100, Fine 60, Fair 25, Spoiled 0, plus up to 40 for
closeness (so 0.4 % beats 0.9 %). Sand left adds up to 30 %. Consecutive potions
with every layer Fine or better build a streak worth up to ×1.5.

## Workshops

The title and potion 1 are the candlelit alcove. After that a shuffle bag picks
the room: every workshop shows before any repeats, and never the same twice
running. `static/src/workshops.js` holds them as data; `rooms.js` builds each
room, seeded per potion so shelf contents and plant and crystal placement vary.

| Workshop | Vessel | Tap | Card | Particles | Ingredients |
| --- | --- | --- | --- | --- | --- |
| Candlelit alcove: stone, a round moon window, candles | tall flask | brass tap, glass reservoir, valve wheel | parchment on an easel | dust in the moonbeam | Moonwater, Emberwine, Nightshade, Verdigris, Sunmilk, Rose Dew |
| Tower observatory: an arched star window with a ringed planet, a brass telescope, an armillary sphere, globe lamps | test tube with a flat foot | glass pipette in a ring stand; the bulb squeezes | chalk on a framed slate | twinkling specks | Starlight, Nebula Ink, Comet Tail, Solar Wind, Meteor Red, Aurora |
| Greenhouse at dawn: glass walls on a sunrise, hanging and potted plants, light shafts | wide beaker | wooden spigot from an oak cask; its key turns | botanical card with ferns | pollen | Fern Dew, Marigold, Lavender, Rosehip, Bluebell, Elderflower |
| Crystal cavern: rock walls, glowing crystal clusters, a rock ledge | hexagonal column | a hanging crystal that glows as it pours | chalk on stone | sparkles | Quartz Milk, Amethyst, Malachite, Garnet, Sapphire, Amber Sap |
| Winter cottage: board walls, a frosted window on falling snow, a fireplace, drying herbs | square apothecary bottle with a neck | copper pot still; a gauge needle climbs | botanical card with holly | embers from the hearth | Frostmint, Mulled Wine, Hearth Honey, Snowberry, Pine Resin, Sugarplum |
| Caravan tent: striped canvas, pierced lanterns, a kilim, dunes at dusk through the flap | triangular prism | long-spouted brass ewer on a gimbal; it tips | scroll on rollers | drifting sand | Saffron, Pomegranate, Desert Mint, Indigo, Damask Rose, Oasis Blue |

Every vessel is a right prism or cylinder with a flat bottom and straight walls
from its base line to above `MAX_LEVEL` (1.12), so the level stays linear in
volume. Full is the etched ring inside the straight part; ticks (`gradations`) sit
on the face turned to the camera. Phone portrait frames only the vessel and the
spout's tip, which gives 2.1–2.8 px per 1 % of the flask at 390×760 (the square
bottle lowest, for its neck) and 3.3–4.5 px on a 1440×900 desktop.

One light rig (hemisphere, key, three points) is re-aimed per room, so the light
count, and with it every compiled shader, stays the same; a room swap happens in a
short fade while the next vessel grows on the stand. Only the vessel is
transmissive.

## Tutorial

The first play runs it after Begin; **How to play** on the title replays it.
Four steps in the alcove, each advancing when the player does the thing:

1. **Pour** to a dotted ghost line at ½; it moves on once a pour stops within 3 %.
   Over that, the coach shows by how much and pours a fresh flask: no penalty.
2. **By eye**: Emberwine up to ¾, then Check. The gold line appears with the error
   and the grades are explained.
3. **Recipes come in many forms**: a flask that holds 200 drops; pour 50 (¼).
4. **Serve**: the last layer, the hourglass explained, Serve; then potion 1.

A coach card (right on wide screens, above the stage's foot on narrow ones, never
over the vessel, tap or recipe) carries each instruction and its button, and a ring
marks what it talks about (projected from the 3D target every frame). **Skip
tutorial** and Esc skip it. No hourglass, score or rung progress during it; it pours
at a fixed slow rate and grades at tolerance 1 whatever `ADJUST_GAME` says, and
hides ticks. Frames are stamped `Tutorial · step n of 4`. Events: `TUTORIAL_START`,
`TUTORIAL_STEP` {step, name, ms}, `TUTORIAL_COMPLETE` {ms, mistakes} or
`TUTORIAL_SKIP` {step}; potion 1's `LEVEL_START` follows. Finishing or skipping
sets the flag in `localStorage`.

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

`static/src/recipes.js` builds them with exact fractions and never imports three.js;
each workshop's six ingredient names are passed in, and the measures don't depend
on them. Every target lies between 5 % and 95 % of the flask and each layer sits at
least 8 % above the last. A throwaway node check parsed 18,000 generated recipes
per workshop (every rung) back from their plain text with an independent reader and
matched every target exactly, and confirmed the original names give byte-identical
recipes to the generator before workshops; rerun one like it after changing it.

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

Events: `GAME_START`, `LEVEL_START` (potion, rung, workshop, vessel, title, intro,
layers with text, mode and exact target, capacity, hourglassSec), `POUR_START` / `POUR_STOP` (one per
pour gesture, taps under 250 ms apart merged; level, amount poured, ms), `MATCH`
per layer graded Perfect or Fine and `UNMATCH` per layer Fair or Spoiled (target,
level, errorPct, grade, layerMs, msToServe), `LEVEL_COMPLETE` on serving or
`LEVEL_FAILED` when the sand ran out (grades, points, streak, score),
`GAME_PAUSE` / `GAME_RESUME`, `GAME_END`, and the tutorial's four (above).

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
`newPotion(rung)`, `solve(error)`, `workshop(id, rung, vessel?)` (move to a
workshop at once, optionally with another vessel), `frame()` (camera framing and
pixels per 1 %), `tutorial()`, `tutorialStep()`, `tutorialWait()` (finish a
feedback beat in simulated time) and `tutorialSkip()`. `window.__elixirState` and
`window.__elixirTuning` hold the last reported state and the parameters in force.

## Files

- `static/src/main.js` — rules, flow, HUD, input, the Skillprint reporting
- `static/src/recipes.js` — recipe generator, exact targets, grading (no three.js)
- `static/src/workshops.js` — the six workshops and six vessels, as data
- `static/src/rooms.js` — each workshop's room, its skies and props, and the card stands
- `static/src/world.js` — renderer and bloom, the light rig, room swaps and fades, the shelf of served potions, camera fit
- `static/src/vessels.js` — prism geometry: glass, liquid, surface, rings, ticks, cork, stand
- `static/src/taps.js` — the six spouts
- `static/src/flask.js` — the apparatus: vessel, layered liquid, pour, bubbles, marks, gold lines, bottling
- `static/src/materials.js` — liquid and flame shaders, GPU-animated particles
- `static/src/card.js` — the recipe card in four stocks, with stacked fractions
- `static/src/tutorial.js` — the tutorial's practice recipes and words
- `static/src/textures.js` — stone, wood, rock, boards, canvas, rug, slate, card and label textures, painted at load
- `static/src/sound.js` — the pour (its pitch rises as the flask fills), glass, bells; synthesised
- `static/src/look.js` — liquid and grade colours
- `static/src/params.js`, `static/src/skillprint.js` — tuning and the SDK link
