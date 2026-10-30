# Equilibrium

A Three.js puzzle about balancing a hanging mobile, after Alexander Calder.
Each mobile is one to four beams, each pivoting at its middle, with hooks at
whole-number distances either side. Some weights are riveted in place; the
loose ones wait on a plinth below. Hang every loose weight so that every beam
rests level, before the candle burns down. Each mobile hangs in an exhibit of
its own (see below).

## The math

A beam is level when the **weight × distance** on its left equals its right.
A beam hanging from another beam's hook weighs **everything below it**. So a
mobile is a chain of small equations: find where a 6 makes 18 against a
4 at 3 and a 2 at 3; settle a sub-mobile's total before its parent can
balance; split a set of loose weights between beams so every sum comes out.
The numbers above each beam are the distances; the number on each weight is
its mass.

Every mobile is generated balanced (`static/src/puzzle.js`, no three.js, so
node can test it): bottom-up, every weight but one at random, the last solved
for, mirror-image answers avoided. Then some weights come off to the plinth,
chosen so the opening hangs crooked. Any arrangement that balances with every
weight hung wins, not only the generated one.

The rung ladder (rung = mobiles balanced this session + 1 + `levelOffset`):

| Rung | Beams | Top beam reach | Loose weights |
| --- | --- | --- | --- |
| 1 | 1 | 3 | 1 |
| 2 | 1 | 4 | 2 |
| 3 | 2 | 4 | 2 |
| 4 | 2 | 4 | 3 |
| 5 | 3 | 5 | 3 |
| 6 | 3 | 5 | 4 |
| 7 | 4 | 5 | 5 |
| 8 | 4 | 5 | 6 |

A lost mobile (the candle went out) shows one answer and the next mobile
stays on the same rung.

## Exhibits

`static/src/exhibits.js` is pure data: each exhibit sets the wall (colour,
grain, page tint), its light (colour, side, elevation, so shadows fall
different ways), what the beams, hooks and wires are made of, the beams' ends,
the colour of the distance marks (chosen to read on that wall), how the
weights are finished, a palette in which every paint carries the ink its
number reads in, and a family of shapes. Mobile 1 and the title are always
Calder; after that a shuffle bag shows every exhibit before any repeats, never
the same one twice running. LEVEL_START carries `exhibit`.

| Exhibit | Wall | Beams | Weights |
| --- | --- | --- | --- |
| `calder` After Calder | warm plaster | black steel, curled ends | painted discs, drops, half-discs, triangles in red, cobalt, yellow, black |
| `constellation` Constellation | deep indigo, starlit | white enamel, balls | painted stars, bitten moons, discs in vermilion, lemon, sky, white |
| `copper` Copper Leaves | sage limewash, low amber light | bronze | copper, verdigris, bronze, brass and patina leaves and pebbles |
| `lanterns` Paper Lanterns | blush paper | bamboo with nodes, twine | glowing paper lanterns, petals, discs in fuchsia, coral, ochre, indigo, jade |
| `geometry` Primary Geometry | cool concrete, hard light from the right | charcoal | matte squares, diamonds, discs, triangles in mustard, teal, terracotta, charcoal |
| `seaglass` Sea Glass | pale aqua limewash | driftwood | frosted glass pebbles, fish and drops in bottle green, aqua, amber, cobalt |

Shapes (`OUTLINES` in `mobile.js`) are drawn in units of the weight's radius,
which grows with √weight, scaled to fit a common box, and hung from the point
on their top edge straight above their centroid. Leaves curl their tip one way
or the other, pebbles have their own outlines, moons take their bite from
either shoulder, fish swim either way: each weight's variant is seeded, so a
mobile isn't stamped from four cookie cutters.

Every paint has to stand out from its wall (`legiblePalette`: a luminance
ratio of 1.5, or ΔE 40 for colours far apart; frosted glass 1.8 or ΔE 45), and
its number from the paint (3:1, else the darker or lighter ink). Paints that
fail drop out of that exhibit's palette, which is why Sea Glass shows no frost
and Primary Geometry no off-white.

The wall stands a little behind the mobile (1.8 to 2.6 units, a touch further
for a big one), so shadows sit close to what casts them; the key light's slant
keeps them there, and its soft, light shadows (variance shadow map, radius 6,
intensity 0.6) read as shade, not as a second mobile. A balanced mobile turns
on its wire only as far as the wall allows: one way and back over about six
seconds, towards whichever side swings back less, to an angle of
asin((D − 0.35) / reach); a whole turn only when nothing could reach the wall.
The title's drift keeps to the same limit. Layout leaves room for every beam's
tilt, so a crooked mobile doesn't reach the plinth or (on a wide screen) its
own beams.

## Playing

The first time, Begin starts **How to play** (`static/src/tutorial.js`):
scripted mobiles in the Calder room, one idea each, learnt by doing:
weight × distance (hang the 6 against 4 × 3), adding to a side (a riveted 3
joins the left), a hanging beam weighs everything below it (the Σ), the held
mobile and Release (only when `liveTilt` is off), and taking a weight back. A
coach's card says what to do and why a move didn't work, with the arithmetic;
a ring points at the weight to touch. There's no candle, score or rung, and the
tutorial's mobiles keep their own tilt and hints whatever ADJUST_GAME says.
Skip it any time (Esc); afterwards the title offers **How to play** again.

Drag a weight from the plinth onto a hook (the free hooks light up), or tap a
weight and then a hook. Tap a hung weight, or drag it off, to take it back.
**C** clears the loose weights back to the plinth, **M** mutes, **Enter**
starts and moves on. With live tilt, beams swing as you hang; the mobile is
balanced the moment the last weight makes everything level. Held (`liveTilt`
false), brass collars keep every beam level until you press **Release**
(Space); a failed release flags each heavy end in red and costs 30 points.

Scoring per mobile: 100 per loose weight, 50 per beam beyond the first, up to
100 for candle left, minus 30 per failed release, never below 20.

## In the Skillprint portal

Slug `equilibrium`. Locally, open `static/index.html` or the harness
`static/iframeTest.html` under the portal dev server, e.g.
`http://localhost:3000/games/live/Equilibrium/static/iframeTest.html`.
Three.js 0.170.0 (the build and `RoomEnvironment`, for metal reflections) and
skillprint-js-sdk 1.1.0-beta.9 are vendored in `static/vendor`.

`static/src/skillprint.js` connects the game to Skillprint through skillprint-js-sdk:

- **Embedded** (the portal, the harness): the page around the game owns the
  session. The game posts `screenshot` (every 2 s: the 3D view, stamped with
  mobile, rung, score, the weights left on the plinth, the candle and how many
  beams are level; during How to play the first line reads `Tutorial · step n of m`), `gameEvent` (SDK `GameEvent` names), `gameState` (`score`,
  `isGameOver`, mobile, rung, beams, trayLeft, beamsLevel, liveTilt, hintLevel)
  and `GAME_COMPLETE` when the player presses Finish. It takes `ADJUST_GAME`,
  `GAME_PAUSE` (the candle waits, input stops) and `GAME_RESUME`, and forwards
  keys 1-9 to the adjustment tester.
- **Standalone** with `?skillprintKey=<partner key>` (optional `skillprintEnv=production`,
  `mood`, `playerId`, `skillprintDebug`): the game runs its own session with the
  SDK's `SkillprintManager`, logs the same events and applies the backend's
  adjustments through registered modifiers.
- Otherwise it reports nothing.

Events: `GAME_START`, `LEVEL_START` (mobile, rung, beams, trayWeights, weights,
reach, maxWeight, liveTilt, hintLevel, candleSec, exhibit), `MATCH` (a beam has just
become level: beam, torque, mass), `UNMATCH` (a failed release: offBeams,
penalty), `LEVEL_COMPLETE` (ms, moves, releases, failedReleases, candleLeft,
points, score), `LEVEL_FAILED` (the candle went out: placed, trayLeft),
`LEVEL_QUIT`, `GAME_PAUSE` / `GAME_RESUME`, `GAME_END`, and the game's own
`HANG` (weight, beam, distance, side, torque, from, msSinceLast), `UNHANG`
(weight, beam, distance, msSinceLast) and `RELEASE` (balanced, offBeams).
How to play sends only `TUTORIAL_START` (steps), `TUTORIAL_STEP` (step, name,
ms), and `TUTORIAL_COMPLETE` (ms, mistakes) or `TUTORIAL_SKIP` (step); mobile
1's `LEVEL_START` follows it.

### Tuning

`static/src/params.js` lists what Skillprint can adjust, as SDK `ParameterDefinition`s.
Numbers out of range are clamped and integers rounded; `liveTilt` takes
true/false, "true"/"false" or 1/0 and refuses anything else.

| Parameter | Type | Range | Default | Effect | Applies |
| --- | --- | --- | --- | --- | --- |
| `levelOffset` | Integer | −3–3 | 0 | Rung of the next mobile | next mobile |
| `maxWeight` | Integer | 6–15 | 9 | Largest weight in the next mobile | next mobile |
| `hintLevel` | Integer | 0–2 | 0 | 1: Σ total on each sub-mobile's wire; 2: also each arm's weight × distance | at once |
| `liveTilt` | Boolean | — | true | Beams tilt as you hang (true) or are held level until Release (false) | at once |
| `candleScale` | Float | 0.5–2.5 | 1 | Candle = (45 s + 25 s per loose weight) × this | at once, in proportion |

`backend/export-config.mjs` writes `backend/game-scoring-config.json` (the
manifest the portal sends on session start, plus the mood and skill
adjustment instructions) from that list:

```
node public/games/live/Equilibrium/backend/export-config.mjs
```

### Test hooks

`window.__equilibriumControls` in the game frame: `start({ tutorial })`,
`state()`, `hang(id, beam, d)`, `shelve(id)`, `solve()`, `release()`,
`clear()`, `next()`, `finish()`, `jump(rung)`, `adjust(name, value)` (the
ADJUST_GAME path), `step(ms)` (advances the simulation in 1/60 s steps and
captures a frame, for panes that throttle animation frames), `screen()`
(screen positions of weights and free hooks, for driving the pointer),
`exhibit(id)` (the room the next mobile hangs in) and `exhibits()`, `spin()`,
`clearance()` (the gap between the back of the mobile and the wall),
`plinthGap()`, `mobile()`, `cover()` (frames the mobile alone, for
`cover.jpg`), and for How to play `tutorial()`,
`tutorialStep()` and `skipTutorial()`.
`window.__equilibriumState` and `window.__equilibriumTuning` hold the last
reported state and the live tuning.
