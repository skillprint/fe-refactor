# Battle Drones build

`public/games/live/Battle Drones/static` is a build of
[Battle Drones](https://github.com/simonw/battledrones), Simon Willison's
mobile-friendly, Command & Conquer-style RTS
([blog post](https://simonwillison.net/2026/Oct/20/battledrones/)). It is
Apache-2.0 licensed, and its license is at
`public/games/live/Battle Drones/LICENSE`. This build adds a small Skillprint
layer, `skillprint.patch`, applied to upstream commit `ca4f13b`.

`build.sh` rebuilds it: fetch the pinned commit, apply the patch, `npm ci`,
type-check, then bundle with `vite.skillprint.config.mjs`. That config replaces
upstream's `vite.config.ts`, which isn't run. It computes the same build-time
constants (terrain revisions, sim/duel/FFA hashes), builds only the game page,
and drops the PWA service worker. A cache-first worker scoped to the game
folder would keep serving an old build inside the portal.

## What the patch changes

- **`src/skillprint/bridge.ts` (new):** the portal's iframe contract. It does
  nothing when the page isn't framed.
  - **Tuning:** `ADJUST_GAME` sets five knobs (`gameSpeed`, `aiReactionSec`,
    `aiAttackThreshold`, `aiExtraHarvesters`, `aiHarass`). The AI ones are
    written into the commander's `DIFFICULTY` table, which `tickAi` reads every
    tick, so `src/sim` is untouched. The sim hash, replays and online-duel
    pairing are all upstream's.
  - **Screenshots:** every 2.5 s, the WebGL view, its label layer and a status
    strip (the DOM HUD can't be drawn).
  - **Game state:** `gameState` posts the battle score and `isGameOver`.
  - **Events:** the universal `gameEvent`s, from `GAME_START` to `GAME_END`.
  - **Pause:** follows the portal's `GAME_PAUSE`/`GAME_RESUME`.
  - **Report:** the after-action report gets a Skillprint block, the battle
    score and a "See your Skillprint results" button that posts
    `GAME_COMPLETE`.
  - **Inputs:** pointer and 1–9 key forwarding for the AI Guide and the
    preset tester.
  - **Tuning across reloads:** the tuning survives the game's own reloads
    (Rematch, Menu), but not a fresh load of the frame.
- **`src/game/GameScene.ts`:** attaches the bridge to each match, calls it
  after every render, detaches it on destroy, and multiplies the game speed by
  the bridge's tempo (local matches only).
- **`src/main.ts`:** starts the bridge at boot.
- **`src/ui/fullscreen.ts`:** no full-screen request when framed. The portal
  owns the screen, and a request its permissions policy never answers would
  hold the menu's Play tap forever.

## Changing the patch

Apply it to a checkout of the pinned commit, edit, then regenerate it there
with `git add -N src/skillprint/bridge.ts && git diff > <this dir>/skillprint.patch`.
Rebase onto a newer upstream by bumping `COMMIT` in `build.sh` and
re-applying. Parameter definitions and mood instructions for the backend are
in `public/games/live/Battle Drones/backend/game-scoring-config.json`. Keep
them in step with `PARAMS` in the bridge.
