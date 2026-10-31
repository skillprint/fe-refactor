# Firefly Gates

A Three.js arithmetic runner, written for Skillprint's **math** skill (number
facility and mental arithmetic).

You lead a swarm of fireflies down a path through a dark wood. Rows of gates
stand across the path, each glowing with an operation: `+12`, `−8`, `×3`, `÷2`.
Fly through one and it does that sum to your swarm. At the end of the stage a
beacon has a number cut into it. Bring at least that many fireflies and it
wakes: the swarm pours into it, it lights, and an aurora comes up over the
trees. Bring fewer and it stays dark. Either way the next stage opens in a
flash of light, in another realm.

## Realms

`static/src/realms.js` is pure data: what each realm's sky, mist, light,
ground, trees, props, weather, fireflies, gates, beacon and hunters look like.
Stage 1 and the title are always Mossgate. After that a shuffle bag deals the
realms, so each shows before any repeats and none comes twice running.

| Realm | Trees, ground, air | Fireflies | Gates | Beacon | Hunters |
| --- | --- | --- | --- | --- | --- |
| Mossgate | dusk pines, glowing moss and mushrooms, a crescent moon | warm gold | mossy stone posts | stone lantern | moths |
| Autumn Birches | white birches in amber and red, a leaf-strewn path, falling leaves, a low harvest moon | lime | root arches | hollow tree | moths |
| Lantern Bamboo | bamboo in jade mist, paper lanterns along the path, drifting motes | moon gold | red torii | pagoda shrine | bats |
| Willow Marsh | weeping willows and reeds in still water that mirrors the trees, the swarm and the sky; lily pads, lotus, frogs' eyes | amber | mangrove-root arches | lighthouse on stilts | bats |
| Snowfall Night | bare winter trees and snowy pines on blue snow, falling snow, ice shards, an aurora | cyan | ice columns | ice obelisk | shadow wisps |
| Mushroom Hollow | giant glowing mushrooms in violet dark, rising spores, a pink moon | rose | mushroom stalks | giant mushroom | shadow wisps |

The gates' light keeps one colour code in every realm (× gold, + green, − red,
÷ violet). Realms that wash out pale figures (snow) put a dark backing behind
the operation and a dark halo behind the swarm's count. Within a stage the
seed varies tree counts, sizes and colours, prop placement, the mist and the
moon's place, and outside Mossgate the path bends gently: a sine that fades to
straight at both ends of the stage, so stages join without a seam and the
beacon always stands on the straight. Steering, lanes and moths work in the
path's own frame; only drawing follows the bend. Gate panels aren't reflected
in the marsh: upside down, a 2 reads as a 5.

Everything that repeats is instanced: trees, props, posts and crowns. Weather
is a single set of points that the GPU moves and wraps around the camera.
Realms are built while the screen is full of light between stages.

## Tutorial

The first time anyone plays (no `tutored` flag in localStorage), Begin opens a
scripted first flight through Mossgate; after that the title has a **How to
play** button that replays it. It runs slower than play and all but stops a
second and a half before each row of gates, until the player has picked a lane
(and let it settle for 0.7 s) or pressed Space. A coach card says one thing at
a time; a pointer marks the thing in the scene. **Skip tutorial** (or Esc)
leaves at any point. Finishing or skipping sets the flag.

1. **Steer**: move both ways.
2. **First row**, starting from 8: `+5` against `×2`, with both sums shown.
3. **Trap row**, built from whatever they now have: `÷2` against `−(n/2 + 2)`,
   so the gate with the bigger number loses by two (16: `÷2` makes 8, `−10`
   only 6). The sums are left for them to work out.
4. **A moth**, slow, in the swarm's lane.
5. **A beacon** cut with a number just below the swarm, which lights.

A wrong gate gets the arithmetic ("8 + 5 = 13, but 8 × 2 = 16"), never a
penalty. Nothing in the tutorial scores, fails, or counts towards the rung, and
it ignores the difficulty parameters. Frames are stamped "Tutorial · step n of
5". Events: `TUTORIAL_START`; `TUTORIAL_STEP` as each step is done (step,
name, ms, and correct / dodged where it applies); `TUTORIAL_COMPLETE` (ms,
mistakes) or `TUTORIAL_SKIP` (step). Stage 1's `LEVEL_START` follows.

## The math

Every operation keeps order (a bigger swarm in never gives a smaller swarm
out), so the best plan is always to take the gate that leaves the most at each
row. The game is in making that comparison honestly:

- A row's two best results are close (the gap shrinks with `gateTrickiness`),
  and they are always the same kind of choice: `+` against `×` when the swarm
  should grow, `−` against `÷` when it should shrink. `+5` against `+9`, or `+`
  against `−`, never appears.
- Often the gate with the bigger-looking number is the worse one: with 23
  fireflies, `×3` (69) beats `+40` (63); with 14, `÷2` (7) beats `−8` (6). That
  happens on 30% of rows at `gateTrickiness` 0 and 80% at 1.
- The count is steered to stay in a band, so the numbers stay worth doing in
  your head: up to 80 on rung 1, 150, 300, then 600 from rung 4 (times
  `numberScale`).

`static/src/stage.js` builds each stage up front along the best path, so the
beacon can ask for a share (`beaconStrictness`) of the best finish. It has no
three.js in it and runs in node.

| Rung | Rows | Gates per row | Operations |
| --- | --- | --- | --- |
| 1 | 6 | 2 | `+ − ×2 ×3 ÷2` |
| 2 | 7 | 2 | adds `÷3` |
| 3 | 8 | 2 | `×4 ÷4` |
| 4 | 9 | 2 | `×5 ÷5`, count band up to 600 |
| 5 | 10 | 3 | the third gate is a distractor, never the answer |
| 6+ | 11, then 12 | 3 | two-step gates such as `×2 −5` |

All four operations are there from rung 1. With only `+` and `×`, every
row would at least double the swarm.

The rung is beacons lit this session + 1 + `levelOffset`, so a dark beacon
replays the same rung.

Moths drift across the path between rows. One that touches the swarm eats
fireflies worth 3–8% of the stage's best possible finish (a bite sized against
the swarm in hand would compound through later `−` gates).

Score: 25 for each best gate; a lit beacon adds 100 + 25 × rung, up to 100
for light (your finish against the best possible) and 100 for a flawless run
(every best gate, no moths).

## In the Skillprint portal

Slug `firefly-gates`. Locally, open `static/index.html` or the harness
`static/iframeTest.html` under the portal dev server, e.g.
`http://localhost:3000/games/live/Firefly%20Gates/static/iframeTest.html`.
Three.js 0.170.0 and skillprint-js-sdk 1.1.0-beta.9 are vendored in
`static/vendor` (plus three's `RenderPass` from the same release).

`static/src/skillprint.js` connects the game to Skillprint through
skillprint-js-sdk, as Mountain Appreciator does:

- **Embedded** (the portal, the harness): the page around the game owns the
  session. The game posts `screenshot` (every 2 s: the WebGL frame, stamped top
  left with stage, rung, score, swarm, beacon and the next row's gates),
  `gameEvent` (SDK `GameEvent` names), `gameState` (`score`, `isGameOver`,
  `stage`, `rung`, `swarm`, `beacon`, `row`, `rows`, `lit`) and `GAME_COMPLETE`
  when the player presses Finish. It takes `ADJUST_GAME`, `GAME_PAUSE` and
  `GAME_RESUME`, and forwards keys 1–9 to the adjustment tester.
- **Standalone** with `?skillprintKey=<partner key>` (optional
  `skillprintEnv=production`, `mood`, `playerId`, `skillprintDebug`): the game
  runs its own session with the SDK's `SkillprintManager`.
- Otherwise it reports nothing.

Events: `GAME_START`; `LEVEL_START` (stage, rung, rows, gatesPerRow, start,
beacon, best, realm, and the tuning in force); `MATCH` / `UNMATCH` for the best gate or
a worse one (before, after, chosen, others, otherResults, best, lost, trap,
decisionMs, timeAvailableMs); `GENERIC_NEGATIVE` for a moth bite (before, lost,
after); `LEVEL_COMPLETE` / `LEVEL_FAILED` (reason `beacon` or `swarm-lost`) with
final, beacon, best, optimalGates, rows, mothHits, points and score;
`LEVEL_QUIT`; `GAME_PAUSE` / `GAME_RESUME`; `GAME_END`.

`trap` is judged at the swarm the player actually had: the gate with the
biggest printed number was not the best. `decisionMs` runs from the row coming
out of the mist (36 units off) to the swarm settling into the lane it took;
`timeAvailableMs` to the crossing.

### Tuning

`static/src/params.js` lists what Skillprint can adjust, as SDK
`ParameterDefinition`s. Out-of-range values are clamped and integers rounded.
`backend/export-config.mjs` writes `backend/game-scoring-config.json` from it.

| Parameter | Type | Range | Default | What it changes | Applies |
| --- | --- | --- | --- | --- | --- |
| `runSpeed` | number | 0.6–1.8 | 1.0 | forward speed, ~3.5 s between rows at 1.0 | at once |
| `gateTrickiness` | number | 0–1 | 0.5 | how close the results are; how often the bigger number lies | next stage |
| `numberScale` | number | 0.5–3 | 1.0 | starting swarm (10–20 at 1.0) and the count band | next stage |
| `beaconStrictness` | number | 0.6–1.0 | 0.9 | the beacon as a share of the best finish | next stage |
| `hazardDensity` | number | 0–2 | 1.0 | moths per gap; 0 clears those ahead | moths from now on |
| `levelOffset` | integer | −3–3 | 0 | the next stage's rung | next stage |

Keys 1–9 (GameAdjustmentTester and `static/iframeTest.html`):

1. Relax `{ runSpeed: 0.7, gateTrickiness: 0.2, beaconStrictness: 0.7, hazardDensity: 0.3 }`
2. Gentle `{ runSpeed: 0.85, beaconStrictness: 0.8 }`
3. Default `{ runSpeed: 1, gateTrickiness: 0.5, numberScale: 1, beaconStrictness: 0.9, hazardDensity: 1, levelOffset: 0 }`
4. Faster `{ runSpeed: 1.3 }`
5. Grit `{ runSpeed: 1.4, gateTrickiness: 0.85, beaconStrictness: 0.97, hazardDensity: 1.5 }`
6. Easier next stage `{ levelOffset: -2 }`
7. Harder next stage `{ levelOffset: 2 }`
8. Big numbers `{ numberScale: 2.5 }`
9. Extreme `{ runSpeed: 1.8, gateTrickiness: 1, numberScale: 3, beaconStrictness: 1, hazardDensity: 2, levelOffset: 3 }`

## Controls

Mouse or finger: the swarm follows the pointer across the path. `←` `→` (or
`A` `D`): a tap hops one lane, a hold glides. `Enter` or `Space` begins and
carries on after a beacon; in the tutorial, `Space` flies on and `Esc`
skips. `M` mutes. Digits are left to the portal.

## Test hooks

`window.__firefliesControls`: `start()`, `next()`, `finish()`, `state()`,
`stage()`, `steer(x)`, `lane(i)`, `autopilot('best' | 'worst' | 'random' | null)`,
`pause(on)`, `step(ms)` (fixed 1/60 s steps, so a throttled tab still runs in
game time), `until(pred, maxMs)`, `realm(id)` / `realms()` (hold later stages
in one realm), `tutorial()`, `tutorialStep()`, `go()` (the tutorial's Space),
`skipTutorial()` and `info()` (draw calls and triangles of the last frame).
`?realm=<id>` holds the title and every stage in one realm.
`window.__firefliesState` and `window.__firefliesTuning` mirror what the portal
sees.

## Files

`static/src/`: `main.js` (the loop, the stage flow, the tutorial, input),
`stage.js` (the generator), `realms.js` (the realms, and the bag that deals
them), `world.js` (sky, mist, ground or water, scenery, bloom), `flora.js`
(trees and props), `weather.js`, `space.js` (the path and its bend),
`swarm.js` (your fireflies, the count, embers), `gates.js`, `moths.js`,
`beacon.js`, `labels.js` (numbers drawn into textures), `sound.js` (all
synthesised), `ui.js`, `params.js`, `skillprint.js`, `rng.js`.
