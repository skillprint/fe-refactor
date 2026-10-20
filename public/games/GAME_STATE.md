# Reporting game state

The portal sends a game's state to the backend with every screenshot (`game_state<n>` on `record-session`), and the backend stores it per frame in `GameChunkAnalysis.game_states`, next to the frame's time. Paired with the screenshots and the player's events, it is data for skill scoring and for training game-playing models. So report **everything a model would need to know about the game at that moment**, not just the score: level, lives, timers, the board, and the position and kind of every object in play.

The portal reads two fields itself:
- `score` (number): the session's score and the results dialog.
- `isGameOver` (boolean): tells a finished game from an early exit.

## How to report it

**With each screenshot (preferred).** Define a function that returns the current state:

```js
window.skillprintGameState = function () {
  return {
    score: score,
    isGameOver: gameOver,
    level: level,
    lives: lives,
    player: { x: player.x, y: player.y },
    enemies: enemies.map(function (e) { return { kind: e.kind, x: e.x, y: e.y }; }),
  };
};
```

The screenshot scripts (`SkillprintLib/skillprintScreenshot.js`, `_shared/skillprintScreenshot.js`, `_shared/skillprintC3.js`) call it at the moment they capture a frame and send the result with it, so the state is exactly that frame's. Nothing else is needed: no message, no timer. A shim can define it for a game it wraps.

**As messages.** A game can also post a full snapshot whenever it likes:

```js
window.parent.postMessage({ type: 'gameState', data: state }, '*');
```

The portal keeps the latest one and sends it with the next frames that carry no state of their own. A `gameState` snapshot replaces the last one (so objects that are gone don't linger). If it leaves out `score` or `isGameOver`, the last values are kept. `{ type: 'GAME_SCORE_UPDATE', data: { score, isGameOver } }` updates only those two fields.

Hextris does both: `skillprint.js` defines `window.skillprintGameState`, and `js/update.js` posts it every 500 ms.

## Rules
- **A JSON object, at most 128 KB.** State that isn't a JSON object or is too big is dropped (only its score is kept), with one console warning. Inside the frame, a state that can't survive JSON (functions, cycles) is left out of the screenshot message.
- **Plain, documented fields.** Use names and units a reader can follow without the code (`timeLeftMs`, `lives`, positions in game pixels or normalised 0-1), and list them in the game's `README.md`.
- **No personal data.** State is game data only.
- **`_skillprint` is reserved.** The portal adds it to each uploaded state: `{ source, offsetMs }`, where `source` is `'frame'` (taken with this screenshot) or `'latest'` (the last report before it), and `offsetMs` is when the state was taken, in ms from session start. Training code can use it to drop or down-weight frames whose state is stale.
