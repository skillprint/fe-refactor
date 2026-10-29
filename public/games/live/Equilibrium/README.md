# Equilibrium

A Three.js puzzle about balancing a hanging mobile, after Alexander Calder.
Each mobile is one to four black steel beams, each pivoting at its middle,
with hooks at whole-number distances either side. Some painted weights are
riveted in place; the loose ones wait on a shelf below. Hang every loose
weight so that every beam rests level, before the candle burns down.

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
for, mirror-image answers avoided. Then some weights come off to the shelf,
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

## Playing

Drag a weight from the shelf onto a hook (the free hooks light up), or tap a
weight and then a hook. Tap a hung weight, or drag it off, to take it back.
**C** clears the loose weights back to the shelf, **M** mutes, **Enter**
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
Three.js 0.170.0 (the build only) and skillprint-js-sdk 1.1.0-beta.9 are
vendored in `static/vendor`.

`static/src/skillprint.js` connects the game to Skillprint through skillprint-js-sdk:

- **Embedded** (the portal, the harness): the page around the game owns the
  session. The game posts `screenshot` (every 2 s: the 3D view, stamped with
  mobile, rung, score, the weights left on the shelf, the candle and how many
  beams are level), `gameEvent` (SDK `GameEvent` names), `gameState` (`score`,
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
reach, maxWeight, liveTilt, hintLevel, candleSec), `MATCH` (a beam has just
become level: beam, torque, mass), `UNMATCH` (a failed release: offBeams,
penalty), `LEVEL_COMPLETE` (ms, moves, releases, failedReleases, candleLeft,
points, score), `LEVEL_FAILED` (the candle went out: placed, trayLeft),
`LEVEL_QUIT`, `GAME_PAUSE` / `GAME_RESUME`, `GAME_END`, and the game's own
`HANG` (weight, beam, distance, side, torque, from, msSinceLast), `UNHANG`
(weight, beam, distance, msSinceLast) and `RELEASE` (balanced, offBeams).

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

`window.__equilibriumControls` in the game frame: `start()`, `state()`,
`hang(id, beam, d)`, `shelve(id)`, `solve()`, `release()`, `clear()`,
`next()`, `finish()`, `jump(rung)`, `adjust(name, value)` (the ADJUST_GAME
path), `step(ms)` (advances the simulation in 1/60 s steps and captures a
frame, for panes that throttle animation frames) and `screen()` (screen
positions of weights and free hooks, for driving the pointer).
`window.__equilibriumState` and `window.__equilibriumTuning` hold the last
reported state and the live tuning.
