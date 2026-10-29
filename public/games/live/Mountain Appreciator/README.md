# Mountain Appreciator

Built in game-builder (`games/mountain-appreciator`, a6ff5b4) and adapted here for Skillprint.

A Three.js game about telling twin mountains apart. Each pair is one
procedurally generated, droplet-eroded mountain, copied twice, with a few
differences applied to one copy or the other. Both panels share one camera,
so the twins always line up as you orbit.

Differences are drawn from kinds of natural scenery, one of each kind before
any repeats, and the HUD shows the kinds still to find:

| Kind | Differences |
| --- | --- |
| Trees & plants | a forest, golden larches, a lone pine, alpine flowers |
| Water | a tarn, a frozen tarn, a waterfall, a stream |
| Sky & stars | the aurora, a constellation, a shooting star, a planet, a comet, a ring round the moon; by day, the moon |
| Wildlife | an ibex, a marmot, red deer, a bear, an eagle, geese in a V, fireflies |
| Rock & ice | a second summit, a col, a glacier, a snowfield, a rockfall, an erratic, a fumarole, a hoodoo |
| Weather | a lenticular cloud, a rainbow, a passing shower |
| Traces of people | a refuge hut, a summit cross or cairn (an occasional guest) |

By day the sun sets while you look. Night pairs (the third pair, then about
one in three) run from moonlight to sunrise, under a Milky Way, and lean on
the sky and night creatures. Wrong guesses and the blink comparator (hold
Space) spend the remaining light. Every pair ends at sunset or sunrise, and
you keep one twin. It joins the range on your horizon in later pairs.

## In the Skillprint portal

The portal plays it at `/game/mountain-appreciator` (slug in `lib/localGames.ts`,
details and parameter manifest in `app/config/gameConfig.ts`). Locally, open
`static/index.html` or the harness `static/iframeTest.html` under the portal dev
server, e.g. `http://localhost:3000/games/live/Mountain%20Appreciator/static/iframeTest.html`.
Three.js 0.170.0 and skillprint-js-sdk 1.1.0-beta.9 are vendored in `static/vendor`.

`static/src/skillprint.js` connects the game to Skillprint through skillprint-js-sdk:

- **Embedded** (the portal, the harness): the page around the game owns the
  session. The game posts `screenshot` (every 2 s, the 3D view with its ink marks
  and a stamp of pair, score, found and time left), `gameEvent` (SDK `GameEvent`
  names), `gameState` (`score`, `isGameOver`) and `GAME_COMPLETE` when the player
  presses Finish. It takes `ADJUST_GAME`, `GAME_PAUSE` and `GAME_RESUME`, and
  forwards keys 1-9 to the adjustment tester.
- **Standalone** with `?skillprintKey=<partner key>` (optional `skillprintEnv=production`,
  `mood`, `playerId`, `skillprintDebug`): the game runs its own session with the
  SDK's `SkillprintManager` from Begin to Finish, logs the same events with
  `logEvent`, and applies the backend's adjustments through registered modifiers.
- Otherwise it reports nothing.

Events: `GAME_START`, `LEVEL_START` (pair, rung, differences, hidden, kinds, night,
noSunset), `MATCH` (feature, kind, tier, hidden, daylightLeft), `UNMATCH` (a wrong
click and its penalty), `LEVEL_COMPLETE` / `LEVEL_FAILED` / `LEVEL_QUIT` (found,
differences, points, score), `GAME_PAUSE` / `GAME_RESUME`, `GAME_END`, and the
game's own `SKY_CLICK`, `BLINK` (ms held) and `KEEP_TWIN`.

### Tuning

`static/src/params.js` lists what Skillprint can adjust, as SDK `ParameterDefinition`s.
Values out of range are clamped.

| Parameter | Range | Default | Effect |
| --- | --- | --- | --- |
| `daylightScale` | 0.5–2.0 | 1.0 | Multiplies the pair's daylight (40 s + 22 s per difference); the time left stretches in proportion |
| `missPenaltySec` | 0–20 | 7 | Daylight lost per wrong click |
| `blinkSunRate` | 1–8 | 4 | How much faster the sun moves while Blink is held |
| `hitTolerance` | 0.6–1.6 | 1.0 | How close a click must land to a difference |
| `levelOffset` | −3–3 | 0 | Shifts the next pair's difficulty rung: more, subtler and hidden differences |

After changing `params.js` or the instructions, regenerate the backend manifest:

```bash
node "public/games/live/Mountain Appreciator/backend/export-config.mjs"
```

Staging's record (`mountain-appreciator`) and its scoring config hold the same
values; PATCH `/scoring/api/games/mountain-appreciator/scoring-config/` with
`parameter_definitions`, `adjustment_instructions` and `skill_adjustment_instructions`
from the manifest to update them.

`cover.jpg` is a frame of the game (a moonlit pair, one ring round the moon circled
in the game's ink), used for the portal tile and the backend thumbnail.

## Layout

| File | What it does |
| --- | --- |
| `static/src/terrain.js` | Archetype shapes (horn, stratovolcano, massif, spires, butte), droplet erosion, height and line-of-sight queries |
| `static/src/features.js` | The catalogue of differences by kind: where each can sit (on the slopes or out in the sky), what it changes, what the field note says |
| `static/src/round.js` | Builds a pair: one eroded field, cloned, differences applied per twin, trees, meshes |
| `static/src/world.js` | Renderer, sky, cloud sea, far range, split-panel rendering and grading |
| `static/src/gfx.js` | Shared atmosphere, terrain shader, water, tree and rock geometry |
| `static/src/look.js` | Biome palettes and the day and night lighting keyframes |
| `static/src/view.js` | The shared orbit camera, zoom toward the cursor, touch |
| `static/src/ui.js` | Ink rings, field notes, sun dial, end card |
| `static/src/sound.js` | Synthesised wind, drone and bells |
| `static/src/main.js` | Game loop and state |
| `static/src/params.js` | The parameters Skillprint can tune |
| `static/src/skillprint.js` | Frames, events, state and adjustments, through skillprint-js-sdk |

Progress (rank, kept mountains) lives in `localStorage` under `mountain-appreciator/v1`.

## Reusing the published artifact

The game is published as an artifact at
https://claude.ai/artifact/9yoVfDrr3CDX2R4RBsodHE. Besides the page, it
publishes every module at its source path (`src/main.js`, `src/terrain.js`,
and so on) and this README at `README.md`, so another project can build on it
without this repository.

- **Read it.** In another conversation, give Claude the link and ask it to
  read the artifact, or to read one file by its path, such as `src/features.js`.
- **Copy files into a new artifact.** A new artifact can copy published files
  server side by mapping a path to `{ artifact: "<link above>", path: "src/terrain.js" }`
  in its `files`. Copy the modules it needs and keep their relative imports intact.
- **Import the modules.** They are plain ES modules. The page needs an import map
  for `three` and `three/addons/` (Three.js 0.170.0, as in `index.html`).

Useful entry points:

| Module | Export | Use |
| --- | --- | --- |
| `src/terrain.js` | `generate(seed, archId)`, `ARCH`, `Field` | An eroded heightfield for one of five archetypes, with height, ray and line-of-sight queries |
| `src/round.js` | `buildRound({ level, seed, archId, night })` | A complete pair: two Three.js groups, their heightfields, and the list of differences |
| `src/features.js` | `FEATURES`, `KINDS`, `chooseDifferences(ctx, level)` | The catalogue of natural differences, grouped by kind |
| `src/world.js` | `World` | The split-panel renderer with sky, cloud sea and day and night lighting |

The artifact is private to its owner. A project that belongs to someone else
can only read or copy it after the owner shares it from the page's Share menu.
