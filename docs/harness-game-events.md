# Gameplay events: the harness games

The nine games on the shared harness (`public/games/live/<Game>/static`) post discrete gameplay events to the shell as `{type: 'gameEvent', data: {event, at, ...fields}}`, the message `GameClient.tsx` records and uploads with the next screenshot (as Hextris's `skillprint.js` does). `at` is when it happened, in epoch ms. Each game defines a small `emitEvent(event, data)` in its own script; it posts only inside an iframe, to the same origin, and never throws.

Names in the SDK's universal vocabulary (`GameEvent` in skillprint-js-sdk): `GAME_START`, `LEVEL_START`, `LEVEL_COMPLETE`, `LEVEL_FAILED`, `MATCH`. The rest are game-specific. Times are in ms unless the field says `Sec`.

| Game | Event | When | Fields |
|---|---|---|---|
| Stroop Test | `LEVEL_START` | Play | `rounds`, `conflictRatio`, `responseWindowMs` |
| | `TRIAL_END` | Each round answered or timed out | `round`, `word`, `ink`, `congruent`, `response` (null on timeout), `correct`, `timedOut`, `rt` (null on timeout) |
| | `LEVEL_COMPLETE` | Last round | `rounds`, `correct`, `accuracy` (%), `meanRtMs`, `congruentMeanRtMs`, `incongruentMeanRtMs`, `stroopEffectMs` (correct trials) |
| Dual N-Back | `LEVEL_START` | Play | `n`, `trials`, `stimulusIntervalMs` |
| | `TRIAL_END` | Each stimulus, when the next one starts | `trial`, `n`, `scored` (false for the first n trials), `position`, `letter`, `positionMatch`, `letterMatch`, `positionPressed`, `letterPressed`, `positionCorrect`, `letterCorrect`, `positionRt`, `letterRt` (from stimulus onset; null if not pressed) |
| | `LEVEL_COMPLETE` | Last trial | `trials`, `n`, `accuracy`, `hits`, `misses`, `falseAlarms` |
| Reaction Time | `LEVEL_START` | Play | `attempts`, `difficultyMultiplier` |
| | `FALSE_START` | Click before green (uses up the attempt) | `attempt`, `msBeforeGo`, `delayMs` |
| | `TRIAL_END` | Click on green | `attempt`, `rt`, `delayMs` (the random wait before green) |
| | `LEVEL_COMPLETE` | Last attempt | `attempts` (valid ones), `meanRtMs`, `bestRtMs`, `times` |
| Typing Speed | `LEVEL_START` | First keystroke (starts the clock) | `wordDifficulty`, `timeLimitSec` |
| | `WORD_TYPED` | Each word committed with a space | `index`, `target`, `typed`, `correct`, `ms` (since the previous word, or the first keystroke) |
| | `LEVEL_COMPLETE` | Time up | `wpm`, `accuracy`, `typedWords`, `correctWords`, `timeLimitSec` |
| Guided Breathing | `LEVEL_START` | Play | `inhaleSec`, `holdSec`, `exhaleSec`, `sessionLengthMin` |
| | `BREATH_CYCLE` | Each full breath | `cycle`, `inhaleSec`, `holdSec`, `exhaleSec` |
| | `LEVEL_COMPLETE` | Session length reached | `cycles`, `elapsedSec`, `sessionLengthMin` |
| Procedural Maze | `LEVEL_START` | Each maze | `mazeSize`, `fogRadius` |
| | `WALL_BUMP` | A move into a wall | `x`, `y`, `dx`, `dy` |
| | `LEVEL_COMPLETE` | Exit reached | `mazeSize`, `fogRadius`, `seconds`, `moves`, `wallBumps`, `optimalMoves` (shortest path) |
| Simon Says | `GAME_START` | Play | `numTiles`, `difficultyMultiplier` |
| | `LEVEL_START` | Each new sequence | `level`, `length`, `numTiles` |
| | `TILE_PRESS` | Each tile the player taps | `level`, `step`, `color`, `expected`, `correct`, `rt` (since the previous tap, or the player's turn starting) |
| | `LEVEL_COMPLETE` | Sequence repeated | `level`, `length`, `responseMs` (whole turn) |
| | `LEVEL_FAILED` | Wrong tile (game over) | `level`, `step`, `length` |
| Order Rush | `LEVEL_START` | Shift starts | the shift's parameters (`customerSpawnIntervalMs`, `patienceSec`, `cookTimeMs`, `tableCount`, `difficultyMultiplier`, `sessionLengthSec`) |
| | `CUSTOMER_SEATED` | A guest reaches a table | `tableId`, `customerType`, `patience` (0-1 left) |
| | `ORDER_TAKEN` | Order taken | `tableId`, `food` |
| | `ORDER_SERVED` | Dish delivered | `tableId`, `food`, `customerType`, `patience`, `tip`, `combo` |
| | `TABLE_BUSSED` | Dirty table cleared | `tableId` |
| | `CUSTOMER_LEFT` | A guest gives up | `where` (`queue`: no life lost; `table`: a life lost), `tableId` or `customerType`, `lives` |
| | `UPGRADE_CHOSEN` | Upgrade picked | `upgrade`, `offered` |
| | `LEVEL_COMPLETE` / `LEVEL_FAILED` | Time up / last life lost | `score`, `tips`, `served`, `comboBest`, `lives`, `elapsedSec` |
| Solitaire | `LEVEL_START` | Each deal | `drawCount` |
| | `MATCH` | A card onto a foundation | `from`, `to`, `card`, `count`, `revealed` (a face-down card turned up), `moves`, `foundationCards` |
| | `CARD_MOVED` | Any other move | same as `MATCH` |
| | `STOCK_DRAW` | Stock clicked | `recycled` (waste turned back into the stock), `stockLeft` |
| | `LEVEL_COMPLETE` | All 52 up | `seconds`, `moves`, `drawCount` |
