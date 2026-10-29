# Doodle God Next

Portal slug `doodle-god-next`. An Emscripten build: the game logic is in `static/main.wasm`, with `static/main.js` (Emscripten glue) and `static/src/*.js` (platform, ads, saves, analytics). Screenshots go to the portal through `static/doodleGodScreenshot.js`; gameplay events through `static/skillprintShim.js`, which forwards the game's own analytics calls (`window.DGWebAnalytics`) as `gameEvent` messages (see `docs/engine-game-events.md`).

## No difficulty knobs

`parameters.json` is empty and `window.adjustGame` only logs a `console.warn` for any parameter. Nothing in the JS reaches the game's difficulty:

- Hints: the recharge time and the hints a player starts with live in the game's own data, read only inside the wasm (e.g. the `commodity_hint1_reload_time_freeorblitz` setting named in `main.wasm`). `main.js` and `src/*.js` contain no hint, commodity or remote-config hook, so there is no global to set.
- The only global the wasm reads back is `window.AdsTimeout` (set to 0 in `src/game_config.js`), which times ads. Ad frequency is not a difficulty lever, so it is not offered.

Removed from the shim: `hintCooldownTime` and `startingHints` (they set `window.*` and `DGConfig` fields nothing reads), `adsFrequencyMinutes` (the half-wired `AdsTimeout` above) and `debugMode` (it loaded `stats.min.js` from mrdoob.github.io, a third-party script, into the game).

A difficulty lever would need a change in the C++ source and a rebuild of `main.wasm`, for example a JS-readable hint recharge time.

Tested in headless Chrome: posting `ADJUST_GAME` for each of the four old names logs a warning and changes nothing (`AdsTimeout` stays 0, `RENDER_DEBUG_GUI` and `DGConfig.debug` stay false, no stats.js script); the game still loads and its analytics are still forwarded.

## Keys 1-9 (GameAdjustmentTester)

The `doodle-god-next` case sends nothing for any key.
