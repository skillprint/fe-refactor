# Gameplay events: Dungeon Runner, Mage Duel, Cut The Rope, Doodle God Next

These portal games post discrete gameplay events to the shell as `{type: 'gameEvent', data: {event, at, ...fields}}`, the message `GameClient.tsx` records and uploads with the next screenshot. `at` is when it happened, in epoch ms. Names in the SDK's universal vocabulary (`LEVEL_START`, `LEVEL_COMPLETE`, `LEVEL_FAILED`, `GAME_PAUSE`, `GAME_RESUME`) are used where they fit; the rest are game-specific. The harness games are in `harness-game-events.md`.

## Dungeon Runner

`static/js/skillprint.js` gains `sendEvent(event, data)`; `static/js/main.js` calls it.

| Event | When | Fields |
|---|---|---|
| `LEVEL_START` | A run starts | `weaponType` |
| `PLAYER_HIT` | Damage taken | `cause` (what hit the player, e.g. `gate`), `amount`, `health`, `distance` |
| `ENEMY_KILLED` | An enemy dies | `enemyType`, `combo`, `distance` |
| `PICKUP` | A pickup collected | `kind`, `distance` |
| `GAME_PAUSE` / `GAME_RESUME` | Paused or resumed | `distance` |
| `LEVEL_FAILED` | Death (the run's end) | `score`, `distance`, `kills`, `accuracy` (%), `hitsTaken`, `seconds`, `deathCause` |

## Mage Duel

`static/game.js` defines `emitEvent`.

| Event | When | Fields |
|---|---|---|
| `LEVEL_START` | A duel starts | `language`, `sentences`, `helper`, and `GAME_CONFIG` (`heroDamage`, `enemyDamage`, `enemyAttackRateMs`, `healAmount`) |
| `SPELL_CAST` | A translation typed correctly | `prompt`, `answer`, `heal`, `typos` (for this word), `ms` (since the word appeared) |
| `TYPO` | Input stops matching the answer | `prompt`, `answer`, `typed` |
| `PLAYER_HIT` | The enemy's attack lands | `damage`, `heroHP`, `enemyHP` |
| `LEVEL_COMPLETE` / `LEVEL_FAILED` | Enemy / hero defeated | `accuracy`, `spellsCast`, `typos`, `seconds`, `heroHP`, `enemyHP` |

## Cut The Rope

`static/ctrr.js` (the Haxe export) calls the global `logEvent`, which `static/index.html` now defines as a portal poster (it was an old transport the portal ignored). `season`, `box` and `level` identify the level.

| Event | When | Fields |
|---|---|---|
| `LEVEL_START` | A level (or a restart) begins | `season`, `box`, `level` |
| `ROPE_CUT` | A swipe cuts ropes | `ropes`, `seconds` |
| `STAR_COLLECTED` | A star taken | `stars` (so far), `seconds` |
| `LEVEL_COMPLETE` | Candy eaten | `season`, `box`, `level`, `stars`, `score`, `seconds` |
| `LEVEL_FAILED` | Candy lost | `season`, `box`, `level`, `stars`, `seconds` |

## Doodle God Next

The game (`main.wasm`) reports its own analytics through `window.DGWebAnalytics`; `static/skillprintShim.js` forwards every call. `event` is the game's name in UPPER_SNAKE_CASE; for the Dev2Dev extended events it is the payload's `eventId`. Fields: `provider`, `param` (raw), `value` (when numeric), `params` (when JSON). Seen on first launch: `STAT_APPLICATION_LAUNCH`, `FIRST_LAUNCH`, `SCREEN_ENTER` (`params.s1` = screen), `NEW_COLLECTION_PROGRESS_REWARD` (`params.s1` = element, `params.s2` = action), `HINT_PURCHASED`. Tutorial progress arrives as `TUTORIAL_PROGRESS`, and element discoveries and the game's other events the same way as these.
