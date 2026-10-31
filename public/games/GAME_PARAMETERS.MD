# Skillprint Adaptive Game Parameters
This file documents all variables mapped per instrumented game to the `ADJUST_GAME` parent `postMessage` listener. Adjustments can be sent globally from the wrapper `GameAdjustmentTester` or the Skillprint adaptive engine.

## Supported Games

### Box Tower
Controls the side-to-side scrolling velocity of the active dropping block, as well as the alignment threshold for scoring a perfect placement.

**Parameters**
- `stackVelocity` (Number): Global scrolling speed modifier (pixels per frame). Default is 5.
- `perfectRange` (Number): Allowed padding around the previous underlying tower block to trigger a perfect drop. Default is 1.

**JSON Payload Example**
```json
{
  "parameterName": "stackVelocity",
  "parameterValue": 25
}
```

```json
{
  "parameterName": "perfectRange",
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ stackVelocity: 5 }` (Very Slow)
- `2`: `{ stackVelocity: 5 }` (Default)
- `3`: `{ stackVelocity: 35 }` (Fast)
- `4`: `{ perfectRange: 0.1 }` (Extremely hard perfects)
- `5`: `{ perfectRange: 1 }` (Default)
- `6`: `{ perfectRange: 10 }` (Easy perfects)
- `7`: `{ stackVelocity: 10, perfectRange: 5 }` (Slower, forgiving)
- `8`: `{ stackVelocity: 20, perfectRange: 2 }` (Faster, little more forgiving)
- `9`: `{ stackVelocity: 40, perfectRange: 0 }` (Extremely fast, no forgiving)

---

### Hextris
Controls the rate at which newly generated hexagonal blocks fall towards the center, as well as the leniency of chaining block break combinations.

**Parameters**
- `speedModifier` (Number): Controls the uniform falling rate of new pieces clamping inwards. Default is 1.
- `comboTime` (Number): Multiplier window duration padding. Default is ~200.

**JSON Payload Example**
```json
{
  "parameterName": "speedModifier",
  "parameterValue": 1.5
}
```

```json
{
  "parameterName": "comboTime",
  "parameterValue": 100
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ comboTime: 1000 }` (Very long combo time)
- `2`: `{ speedModifier: 0.5 }` (Slow shapes)
- `3`: `{ comboTime: 1000, speedModifier: 0.5 }` (Complete easy mode)
- `4`: `{ speedModifier: 1 }` (Default speed)
- `5`: `{ comboTime: 200 }` (Default combo)
- `6`: `{ speedModifier: 1.5, comboTime: 100 }` (Fast and challenging)
- `7`: `{ speedModifier: 2 }` (Very fast)
- `8`: `{ speedModifier: 3 }` (Ludicrous speed)
- `9`: `{ speedModifier: 4, comboTime: 50 }` (Impossible mode)

---

### 0h h1
Controls the hidden "quality" threshold at which random puzzle boards are generated. Higher quality means fewer visual hints/starting blocks are placed on the board, requiring more logical extrapolations.

**Parameters**
- `qualityThreshold` (Number): Sets the minimum difficulty threshold the procedural board generator loops against. Default is 60. Max practical limit is ~99.

**JSON Payload Example**
```json
{
  "parameterName": "qualityThreshold",
  "parameterValue": 90
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ qualityThreshold: 10 }` (Very easy)
- `2`: `{ qualityThreshold: 30 }`
- `3`: `{ qualityThreshold: 45 }`
- `4`: `{ qualityThreshold: 60 }` (Default)
- `5`: `{ qualityThreshold: 70 }`
- `6`: `{ qualityThreshold: 80 }`
- `7`: `{ qualityThreshold: 90 }`
- `8`: `{ qualityThreshold: 95 }` (Very hard)
- `9`: `{ qualityThreshold: 99 }` (Extreme)

---

### 2048
Controls how many tiles are initially placed on the board or added when restarting the level.

**Parameters**
- `startTiles` (Number): The number of default tiles to spawn on level start/restart. Default is 2.

**JSON Payload Example**
```json
{
  "parameterName": "startTiles",
  "parameterValue": 4
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ startTiles: 1 }` (Minimal)
- `2`: `{ startTiles: 2 }` (Default)
- `3`: `{ startTiles: 3 }`
- `4`: `{ startTiles: 4 }`
- `5`: `{ startTiles: 5 }`
- `6`: `{ startTiles: 6 }`
- `7`: `{ startTiles: 7 }`
- `8`: `{ startTiles: 8 }`
- `9`: `{ startTiles: 10 }` (Crowded)

---

### Brick Out
Controls the speed limits and maximum ball counts in the breakout clone.

**Parameters**
- `MAX_VELOCITY_LIMIT` (Number): The maximum speed the ball can travel. Default is 1.5.
- `MIN_VELOCITY_LIMIT` (Number): The minimum speed the ball can travel. Default is 0.5.
- `TIME_BOUNCE_BALL` (Number): Rate of velocity increase per bounce. Default is 0.01.
- `MAX_BALL_SPAWN` (Number): Maximum balls that can exist from multiball powerups. Default is 4.

**JSON Payload Example**
```json
{
  "parameterName": "MAX_VELOCITY_LIMIT",
  "parameterValue": 3.0
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ MAX_VELOCITY_LIMIT: 0.5, MIN_VELOCITY_LIMIT: 0.1 }` (Very Slow)
- `2`: `{ MAX_VELOCITY_LIMIT: 1.0, MIN_VELOCITY_LIMIT: 0.4 }` (Slower)
- `3`: `{ MAX_VELOCITY_LIMIT: 1.5, MIN_VELOCITY_LIMIT: 0.5 }` (Default limits)
- `4`: `{ MAX_VELOCITY_LIMIT: 2.5, MIN_VELOCITY_LIMIT: 1.0 }` (Fast limits)
- `5`: `{ MAX_VELOCITY_LIMIT: 4.0, MIN_VELOCITY_LIMIT: 2.0 }` (Extremely Fast limits)
- `6`: `{ MAX_BALL_SPAWN: 1 }` (No Multiball allowed)
- `7`: `{ MAX_BALL_SPAWN: 4 }` (Default Multiball cap)
- `8`: `{ MAX_BALL_SPAWN: 20 }` (Crazy Multiball cap)
- `9`: `{ MAX_VELOCITY_LIMIT: 5.0, MIN_VELOCITY_LIMIT: 3.0, TIME_BOUNCE_BALL: 0.1 }` (Impossible limits)

---

### Change Word
Controls the timer countdown for each stage/word length.

**Parameters**
- `timer` (Number): The starting timer amount in milliseconds. Default ranges from 30000 to 60000 depending on word length. Setting this overrides all difficulty stages to the same starting amount.

**JSON Payload Example**
```json
{
  "parameterName": "timer",
  "parameterValue": 10000
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ timer: 120000 }`
- `2`: `{ timer: 90000 }`
- `3`: `{ timer: 60000 }`
- `4`: `{ timer: 40000 }` (Approx. Default)
- `5`: `{ timer: 30000 }`
- `6`: `{ timer: 20000 }`
- `7`: `{ timer: 10000 }`
- `8`: `{ timer: 5000 }`
- `9`: `{ timer: 1000 }` (Impossible)

---

### Fruit Sorting
Controls the starting timer for the fruit sorting game.

**Parameters**
- `seconds_on_clock` (Number): The amount of time in seconds the player has to sort the fruits. Default is 30.

**JSON Payload Example**
```json
{
  "parameterName": "seconds_on_clock",
  "parameterValue": 60
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ seconds_on_clock: 120 }`
- `2`: `{ seconds_on_clock: 90 }`
- `3`: `{ seconds_on_clock: 60 }`
- `4`: `{ seconds_on_clock: 45 }`
- `5`: `{ seconds_on_clock: 30 }` (Default)
- `6`: `{ seconds_on_clock: 20 }`
- `7`: `{ seconds_on_clock: 15 }`
- `8`: `{ seconds_on_clock: 10 }`
- `9`: `{ seconds_on_clock: 5 }` (Impossible)

---

### Gems of Hanoi
Controls the number of unlocked levels/disks in the towers of Hanoi game.

**Parameters**
- `levels` (Number): The max level achievable, which correlates to the maximum number of disks starting at 3 disks (Level 1) to 11 disks (Level 9). Default is 8.

**JSON Payload Example**
```json
{
  "parameterName": "levels",
  "parameterValue": 3
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ levels: 1 }`
- `2`: `{ levels: 2 }`
- `3`: `{ levels: 3 }`
- `4`: `{ levels: 4 }`
- `5`: `{ levels: 5 }`
- `6`: `{ levels: 6 }`
- `7`: `{ levels: 7 }`
- `8`: `{ levels: 8 }` (Default)
- `9`: `{ levels: 9 }` (All disks)

---

### Gummy Blocks
Controls the number of rows/columns or the number of pieces to place.

**Parameters**
- `PIECE_TO_PLACE` (Number): The number of pieces the player can place on the board. Default is 3. Max is 5, min is 1.
- `NUM_ROWS` / `NUM_COLS` (Number): Number of rows or columns. Min 5, max 12. Default is 10.

**JSON Payload Example**
```json
{
  "parameterName": "PIECE_TO_PLACE",
  "parameterValue": 4
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ PIECE_TO_PLACE: 1 }`
- `2`: `{ PIECE_TO_PLACE: 2 }`
- `3`: `{ PIECE_TO_PLACE: 3 }`
- `4`: `{ PIECE_TO_PLACE: 4 }`
- `5`: `{ PIECE_TO_PLACE: 5 }`
- `6`: `{ NUM_ROWS: 6 }`
- `7`: `{ NUM_ROWS: 8 }`
- `8`: `{ NUM_ROWS: 10 }` (Default)
- `9`: `{ NUM_ROWS: 12 }`

---

### Katana Fruits
Controls puzzle piece drop speeds and fruit rotation in Katana Fruits.

**Parameters**
- `OCCURENCE_FRUIT` (Number): Fruit showing occurrence interval in milliseconds. Default 3000.
- `MAX_FRUIT_ROT_SPEED` (Number): Maximum speed at which fruits rotate and move. Default 2.
- `NUM_LIVES` (Number): Starting number of lives. Default 3.
- `STARTING_SIMULTANEOUS_FRUITS` (Number): Starting number of fruits spawned at once. Default 1.
- `MAX_SIMULTANEOUS_FRUITS` (Number): Max simultaneous fruits. Default 10.
- `FRUIT_TO_CUT_FOR_LEVEL_UP` (Number): Cuts needed to level up. Default 6.
- `TIME_FOR_COMBO` (Number): MS gap for combos. Default 500.

**JSON Payload Example**
```json
{
  "parameterName": "OCCURENCE_FRUIT",
  "parameterValue": 4000
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ OCCURENCE_FRUIT: 10000, MAX_FRUIT_ROT_SPEED: 0.5 }` (Slowest)
- `2`: `{ OCCURENCE_FRUIT: 6000, MAX_FRUIT_ROT_SPEED: 1 }`
- `3`: `{ OCCURENCE_FRUIT: 5000, MAX_FRUIT_ROT_SPEED: 1.5 }`
- `4`: `{ OCCURENCE_FRUIT: 4000, MAX_FRUIT_ROT_SPEED: 2 }`
- `5`: `{ OCCURENCE_FRUIT: 3000, MAX_FRUIT_ROT_SPEED: 2 }` (Default)
- `6`: `{ OCCURENCE_FRUIT: 2000, MAX_FRUIT_ROT_SPEED: 2.5 }`
- `7`: `{ OCCURENCE_FRUIT: 1500, MAX_FRUIT_ROT_SPEED: 3 }`
- `8`: `{ OCCURENCE_FRUIT: 1000, MAX_FRUIT_ROT_SPEED: 4 }` (Fast)
- `9`: `{ OCCURENCE_FRUIT: 500, MAX_FRUIT_ROT_SPEED: 5 }` (Hardest)

---

### Mahjong Deluxe
Controls bonus timer duration and hit penalties in Mahjong.

**Parameters**
- `BONUS_TIME` (Number): Set value (in milliseconds) for bonus time. The bonus time assigns the score for matching. If it is zero, no score is assigned. Default is 12000.
- `HINT_PENALTY` (Number): Points to decrease if a player uses a hint. Default is 10.

**JSON Payload Example**
```json
{
  "parameterName": "BONUS_TIME",
  "parameterValue": 30000
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ BONUS_TIME: 60000, HINT_PENALTY: 0 }` (Easiest)
- `2`: `{ BONUS_TIME: 45000, HINT_PENALTY: 2 }`
- `3`: `{ BONUS_TIME: 30000, HINT_PENALTY: 5 }`
- `4`: `{ BONUS_TIME: 20000, HINT_PENALTY: 8 }`
- `5`: `{ BONUS_TIME: 12000, HINT_PENALTY: 10 }` (Default)
- `6`: `{ BONUS_TIME: 8000, HINT_PENALTY: 15 }`
- `7`: `{ BONUS_TIME: 5000, HINT_PENALTY: 20 }`
- `8`: `{ BONUS_TIME: 2000, HINT_PENALTY: 50 }`
- `9`: `{ BONUS_TIME: 1000, HINT_PENALTY: 100 }` (Hardest)

---

### Match Doodle
Controls the number of matching pairs to find via `oCONFIG.levels[].pairs`.

**Parameters**
- `pairs` (Number): Number of matching pairs to place on the board. Default for Level 1 is 5. Max in original config is 40.

**JSON Payload Example**
```json
{
  "parameterName": "pairs",
  "parameterValue": 10
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ pairs: 2 }`
- `2`: `{ pairs: 3 }`
- `3`: `{ pairs: 4 }`
- `4`: `{ pairs: 5 }` (Default Level 1)
- `5`: `{ pairs: 6 }`
- `6`: `{ pairs: 8 }`
- `7`: `{ pairs: 10 }`
- `8`: `{ pairs: 15 }`
- `9`: `{ pairs: 20 }`

---

### Photo Hunt
Controls the starting timer value and the number of allowed misses in Photo Hunt via `oCONFIG`.

**Parameters**
- `seconds_on_clock` (Number): Number of seconds given for the level. Default is 30.
- `tilt_misses` (Number): Number of allowed misses. Default is 3.
- `tilt_seconds` (Number): Time penalty in seconds for a miss. Default is 1.

**JSON Payload Example**
```json
{
  "parameterName": "seconds_on_clock",
  "parameterValue": 45
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ seconds_on_clock: 120, tilt_misses: 10 }`
- `2`: `{ seconds_on_clock: 90, tilt_misses: 8 }`
- `3`: `{ seconds_on_clock: 60, tilt_misses: 5 }`
- `4`: `{ seconds_on_clock: 45, tilt_misses: 4 }`
- `5`: `{ seconds_on_clock: 30, tilt_misses: 3 }` (Default)
- `6`: `{ seconds_on_clock: 20, tilt_misses: 2 }`
- `7`: `{ seconds_on_clock: 15, tilt_misses: 1 }`
- `8`: `{ seconds_on_clock: 10, tilt_misses: 1 }`
- `9`: `{ seconds_on_clock: 5, tilt_misses: 1 }`

---

### Snake Attack
Controls the hero's movement and rotation speed.

**Parameters**
- `hero_speed` (Number): Maximum hero speed. Default is 10.
- `hero_rotation_speed` (Number): Rotation speed when moving right/left. Default is 10.
- `hero_speed_up` (Number): Max hero speed when pressing up. Default is 15.
- `snakes_AI_speed` (Array): Speeds for AI snakes. Default is `[10, 10, 10, 10]`.

**JSON Payload Example**
```json
{
  "parameterName": "hero_speed",
  "parameterValue": 15
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ hero_speed: 2, hero_rotation_speed: 5 }` (Slowest)
- `2`: `{ hero_speed: 4, hero_rotation_speed: 6 }`
- `3`: `{ hero_speed: 6, hero_rotation_speed: 7 }`
- `4`: `{ hero_speed: 8, hero_rotation_speed: 8 }`
- `5`: `{ hero_speed: 10, hero_rotation_speed: 10 }` (Default)
- `6`: `{ hero_speed: 12, hero_rotation_speed: 12 }`
- `7`: `{ hero_speed: 15, hero_rotation_speed: 15 }`
- `8`: `{ hero_speed: 18, hero_rotation_speed: 18 }`
- `9`: `{ hero_speed: 22, hero_rotation_speed: 22 }` (Fastest)

---

### Space Adventure Pinball
Controls the number of balls and the flipper strength.

**Parameters**
- `NUM_BALL` (Number): Number of starting balls. Default is 3.
- `FLIPPER_STRENGTH` (Number): Strength of the flippers. Default is 18.

**JSON Payload Example**
```json
{
  "parameterName": "NUM_BALL",
  "parameterValue": 5
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ NUM_BALL: 10, FLIPPER_STRENGTH: 25 }` (Easiest)
- `2`: `{ NUM_BALL: 8, FLIPPER_STRENGTH: 22 }`
- `3`: `{ NUM_BALL: 6, FLIPPER_STRENGTH: 20 }`
- `4`: `{ NUM_BALL: 4, FLIPPER_STRENGTH: 19 }`
- `5`: `{ NUM_BALL: 3, FLIPPER_STRENGTH: 18 }` (Default)
- `6`: `{ NUM_BALL: 2, FLIPPER_STRENGTH: 16 }`
- `7`: `{ NUM_BALL: 1, FLIPPER_STRENGTH: 14 }`
- `8`: `{ NUM_BALL: 1, FLIPPER_STRENGTH: 12 }`
- `9`: `{ NUM_BALL: 1, FLIPPER_STRENGTH: 10 }` (Hardest)

---

### Sumagi
Controls the time limit array and rounds per difficulty level via `oCONFIG`.

**Parameters**
- `second_on_clock` (Array): Array of numbers representing seconds on clock for different difficulty stages. Default is `[30, 45, 60]`.
- `rounds_per_difficulty_level` (Number): Number of rounds required to advance difficulty. Default is 5.

**JSON Payload Example**
```json
{
  "parameterName": "second_on_clock",
  "parameterValue": [60, 90, 120]
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ second_on_clock: [120, 150, 180], rounds_per_difficulty_level: 2 }` (Easiest)
- `2`: `{ second_on_clock: [90, 120, 150], rounds_per_difficulty_level: 3 }`
- `3`: `{ second_on_clock: [60, 90, 120], rounds_per_difficulty_level: 4 }`
- `4`: `{ second_on_clock: [45, 60, 90], rounds_per_difficulty_level: 4 }`
- `5`: `{ second_on_clock: [30, 45, 60], rounds_per_difficulty_level: 5 }` (Default)
- `6`: `{ second_on_clock: [20, 30, 45], rounds_per_difficulty_level: 6 }`
- `7`: `{ second_on_clock: [15, 20, 30], rounds_per_difficulty_level: 7 }`
- `8`: `{ second_on_clock: [10, 15, 20], rounds_per_difficulty_level: 8 }`
- `9`: `{ second_on_clock: [5, 10, 15], rounds_per_difficulty_level: 10 }` (Hardest)

---

### Sweet Memory
Controls the number of card pairs and time limit (in seconds) for each level via `oCONFIG.levels`.

**Parameters**
- `pairs` (Number): Number of matching pairs on the board. Default varies by level (2 to 12).
- `time` (Number): Time limit in seconds. Default varies by level (30 to 180).

**JSON Payload Example**
```json
{
  "parameterName": "pairs",
  "parameterValue": 8
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ pairs: 2, time: 60 }`
- `2`: `{ pairs: 3, time: 60 }`
- `3`: `{ pairs: 4, time: 50 }`
- `4`: `{ pairs: 5, time: 45 }`
- `5`: `{ pairs: 6, time: 45 }` (Default Level 3)
- `6`: `{ pairs: 8, time: 45 }`
- `7`: `{ pairs: 10, time: 40 }`
- `8`: `{ pairs: 12, time: 40 }`
- `9`: `{ pairs: 15, time: 30 }`

---

### Ultimate Sudoku
Controls the maximum number of starting givens in Easy mode.

**Parameters**
- `MAX_GIVENS_EASY` (Number): Max number of starting givens in easy mode. Default is 38. (Lower is harder).

**JSON Payload Example**
```json
{
  "parameterName": "MAX_GIVENS_EASY",
  "parameterValue": 30
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ MAX_GIVENS_EASY: 70 }` (Easiest)
- `2`: `{ MAX_GIVENS_EASY: 60 }`
- `3`: `{ MAX_GIVENS_EASY: 50 }`
- `4`: `{ MAX_GIVENS_EASY: 44 }`
- `5`: `{ MAX_GIVENS_EASY: 38 }` (Default)
- `6`: `{ MAX_GIVENS_EASY: 34 }`
- `7`: `{ MAX_GIVENS_EASY: 30 }`
- `8`: `{ MAX_GIVENS_EASY: 26 }`
- `9`: `{ MAX_GIVENS_EASY: 20 }` (Hardest)

---

### Whack 'em All
Controls the starting spawn time and the time of the level.

**Parameters**
- `START_SPAWN_TIME` (Number): Starting time interval for spawning. Default is 1000.
- `TIME_LEVEL` (Number): Time in milliseconds for the level. Default is 60000.

**JSON Payload Example**
```json
{
  "parameterName": "START_SPAWN_TIME",
  "parameterValue": 800
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ START_SPAWN_TIME: 2000, TIME_LEVEL: 120000 }` (Easiest)
- `2`: `{ START_SPAWN_TIME: 1800, TIME_LEVEL: 100000 }`
- `3`: `{ START_SPAWN_TIME: 1500, TIME_LEVEL: 90000 }`
- `4`: `{ START_SPAWN_TIME: 1200, TIME_LEVEL: 75000 }`
- `5`: `{ START_SPAWN_TIME: 1000, TIME_LEVEL: 60000 }` (Default)
- `6`: `{ START_SPAWN_TIME: 800, TIME_LEVEL: 50000 }`
- `7`: `{ START_SPAWN_TIME: 600, TIME_LEVEL: 40000 }`
- `8`: `{ START_SPAWN_TIME: 400, TIME_LEVEL: 30000 }`
- `9`: `{ START_SPAWN_TIME: 200, TIME_LEVEL: 30000 }` (Hardest)

---

### Dungeon Runner
First-person 3D infinite runner through a dungeon (`live/Dungeon Runner` in the games repo). Every parameter is read live from `PARAMS` in `static/js/params.js`, which is the single source of truth for names, ranges, defaults, descriptions and the backend `adjustment_guide` text. `backend/game-scoring-config.json` (generated by `node backend/export-config.mjs`) is the matching `GameScoringConfig` payload for the Skillprint API.

**Tier 1 parameters (exposed to the adaptive backend)**
- `playerSpeed` (Number 6–20): Forward run speed in m/s. Default 10.
- `enemySpawnRate` (Number 0–8): Enemies per 100 m. Default 3.
- `enemySpeed` (Number 0.5–2): Enemy approach and projectile speed multiplier. Default 1.
- `enemyHealth` (Integer 1–5): Pistol shots to kill. Default 2.
- `enemyAggression` (Number 0–1): Archer fire rate and imp lane tracking. Default 0.5.
- `weaponType` (Integer 0–2): 0 pistol, 1 shotgun, 2 plasma. Ammo refilled on change. Default 0.
- `weaponDamage` (Number 0.5–3): Player damage multiplier. Default 1.
- `obstacleDensity` (Number 0–1): Obstacles per segment fraction. Default 0.4.
- `hazardTelegraphTime` (Number 0.3–2.5): Seconds ahead at which a hazard's warning ring and HUD marker light up (hazards themselves are visible from the far end of the corridor). Default 1.2.
- `lightLevel` (Number 0.2–1.5): Torch and ambient intensity (mood lever). Default 0.8.

**Tier 2 parameters (implemented, not yet in the backend config)**
`speedRampRate`, `fireRate`, `autoAim` (Boolean), `pickupFrequency`, `damageTaken`, `healthRegen`, `obstacleVariety` (Integer 0–3), `fogDensity`, `screenShake`, `scoreFeedback`, `musicIntensity`.

**JSON Payload Example**
```json
{
  "parameterName": "hazardTelegraphTime",
  "parameterValue": 0.6
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ playerSpeed: 7, enemySpawnRate: 1, enemyAggression: 0.1, obstacleDensity: 0.2, lightLevel: 1.2 }` (Chill stroll)
- `2`: `{ playerSpeed: 8 }` (Slow)
- `3`: `{ playerSpeed: 10, enemySpawnRate: 3 }` (Default pace)
- `4`: `{ playerSpeed: 14 }` (Fast)
- `5`: `{ enemySpawnRate: 6, enemySpeed: 1.4 }` (Horde)
- `6`: `{ weaponType: 1, weaponDamage: 1.5 }` (Shotgun)
- `7`: `{ weaponType: 2 }` (Plasma)
- `8`: `{ hazardTelegraphTime: 0.4, obstacleDensity: 0.8 }` (Twitch)
- `9`: `{ playerSpeed: 18, enemySpawnRate: 8, enemySpeed: 1.8, enemyAggression: 1, obstacleDensity: 1, lightLevel: 0.3 }` (Nightmare)

Standalone harness: open `https://games.staging.skillprint.co/live/Dungeon%20Runner/static/iframeTest.html` to see screenshots arrive and send adjustments without the portal.

---

### Simon Says
Controls the number of colors in play and a master difficulty multiplier that scales three
independent timing parameters for the color-sequence memory game. The game has a play button
overlaid on the tile grid, a checkmark + SVG countdown-arc showing the between-round pause,
and a 0.5x-1.5x difficulty slider controlling all timing.

**Parameters**
- `numTiles` (Number): How many colors are in play, 2-8. Default is 4. Changing this mid-round
  ends the round (to prevent desync from the running sequence).
- `difficultyMultiplier` (Number): 0.5-1.5. A master difficulty slider that scales three
  independent timings:
  - **Announcement duration** (how long each tile flashes): 1500ms (0.5x) → 500ms (1.5x)
  - **Gap between tiles**: 800ms (0.5x) → 300ms (1.5x)
  - **Gap between rounds** (checkmark → next level): 3000ms (0.5x) → 1000ms (1.5x)

**JSON Payload Example**
```json
{
  "parameterName": "numTiles",
  "parameterValue": 6
}
```
```json
{
  "parameterName": "difficultyMultiplier",
  "parameterValue": 1.3
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
Note: number keys also drive in-game tile presses once a round reaches the player's turn (1st..8th
tile on screen), so these presets are safest to trigger before Play is pressed or while the
sequence is playing back — the game's own key listener ignores them at those two moments.
- `1`: `{ numTiles: 2, difficultyMultiplier: 0.5 }` (Beginner)
- `2`: `{ numTiles: 3, difficultyMultiplier: 0.7 }` (Easy)
- `3`: `{ numTiles: 4, difficultyMultiplier: 1.0 }` (Default)
- `4`: `{ numTiles: 4, difficultyMultiplier: 1.15 }` (Moderate)
- `5`: `{ numTiles: 5, difficultyMultiplier: 1.2 }` (Challenging)
- `6`: `{ numTiles: 6, difficultyMultiplier: 1.3 }` (Hard)
- `7`: `{ numTiles: 6, difficultyMultiplier: 1.4 }` (Very hard)
- `8`: `{ numTiles: 8, difficultyMultiplier: 1.45 }` (Expert)
- `9`: `{ numTiles: 8, difficultyMultiplier: 1.5 }` (Extreme)

---

### Solitaire
Controls how many cards are dealt from the stock pile per click — the classic Klondike difficulty lever.

**Parameters**
- `drawCount` (Number): Cards moved from stock to waste per click. Default is 1 (Draw One / easy). Classic hard mode is 3 (Draw Three).

**JSON Payload Example**
```json
{
  "parameterName": "drawCount",
  "parameterValue": 3
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ drawCount: 1 }` (Draw One, easy)
- `2`: `{ drawCount: 2 }`
- `3`: `{ drawCount: 3 }` (Classic Draw Three, hard)

---

### Reaction Time
Measures reaction speed to visual stimuli with adjustable difficulty. Uses a difficulty multiplier to scale the random wait window (stimulus delay).

**Parameters**
- `difficultyMultiplier` (Number, 0.5–1.5): Master difficulty slider. Scales the delay window. 0.5 (easier) = longer waits; 1.5 (harder) = shorter waits.
  - At 0.5: minDelayMs = 1500ms, maxDelayMs = 3500ms (forgiving)
  - At 1.0: minDelayMs = 1000ms, maxDelayMs = 2000ms (balanced)
  - At 1.5: minDelayMs = 500ms, maxDelayMs = 1000ms (challenging)
- `attemptCount` (Number, 3–10): Number of rounds per session. Default is 5.

**JSON Payload Example**
```json
{
  "parameterName": "difficultyMultiplier",
  "parameterValue": 1.2
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ difficultyMultiplier: 0.5, attemptCount: 3 }` (Beginner)
- `2`: `{ difficultyMultiplier: 0.75, attemptCount: 4 }`
- `3`: `{ difficultyMultiplier: 1.0, attemptCount: 5 }` (Default)
- `4`: `{ difficultyMultiplier: 1.25, attemptCount: 6 }`
- `5`: `{ difficultyMultiplier: 1.5, attemptCount: 7 }` (Expert)
- `6`: `{ attemptCount: 10 }` (Extended session)
- `7`: `{ attemptCount: 3 }` (Quick session)

---

### Dual N-Back
Working-memory trainer: a lit square plus a spoken/shown letter each trial; the player flags position and sound matches N trials back.

**Parameters**
- `nLevel` (Integer, 1–5): how many trials back to match. Default 2.
- `stimulusIntervalMs` (Integer, 1000–5000): time per trial. Default 2500.
- `trialCount` (Integer, 5–60): trials per session. Default 20.

**JSON Payload Example**
```json
{
  "parameterName": "nLevel",
  "parameterValue": 3
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{'nLevel': 1, 'stimulusIntervalMs': 3000, 'trialCount': 15}`
- `2`: `{'nLevel': 2, 'stimulusIntervalMs': 2500, 'trialCount': 20}`
- `3`: `{'nLevel': 2, 'stimulusIntervalMs': 2000, 'trialCount': 25}`
- `4`: `{'nLevel': 3, 'stimulusIntervalMs': 2500, 'trialCount': 25}`
- `5`: `{'nLevel': 3, 'stimulusIntervalMs': 2000, 'trialCount': 30}`
- `6`: `{'nLevel': 4, 'stimulusIntervalMs': 2000, 'trialCount': 30}`
- `7`: `{'nLevel': 5, 'stimulusIntervalMs': 1800, 'trialCount': 35}`

---

### Stroop Test
Inhibitory-control test: pick the ink colour of a colour word under a response deadline.

**Parameters**
- `conflictRatio` (Float, 0–1): share of rounds where the word and ink disagree. Default 0.5.
- `responseWindowMs` (Integer, 500–5000): time allowed per round before it counts as a miss. Default 2000.
- `roundCount` (Integer, 5–60): rounds per session. Default 20.

**JSON Payload Example**
```json
{
  "parameterName": "conflictRatio",
  "parameterValue": 0.75
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{'conflictRatio': 0.2, 'responseWindowMs': 3000, 'roundCount': 15}`
- `2`: `{'conflictRatio': 0.4, 'responseWindowMs': 2500, 'roundCount': 20}`
- `3`: `{'conflictRatio': 0.5, 'responseWindowMs': 2000, 'roundCount': 20}`
- `4`: `{'conflictRatio': 0.6, 'responseWindowMs': 1500, 'roundCount': 25}`
- `5`: `{'conflictRatio': 0.75, 'responseWindowMs': 1200, 'roundCount': 30}`
- `6`: `{'conflictRatio': 0.9, 'responseWindowMs': 1000, 'roundCount': 30}`
- `7`: `{'conflictRatio': 1, 'responseWindowMs': 800, 'roundCount': 40}`

---

### Typing Speed
Timed typing test scored in WPM (correct characters ÷ 5 per minute) and word accuracy.

**Parameters**
- `wordDifficulty` (Integer, 1–3): 1 short common words, 2 medium, 3 long/rare words. Default 1.
- `timeLimitSec` (Integer, 15–180): test length; the timer starts on the first keystroke. Default 60.

**JSON Payload Example**
```json
{
  "parameterName": "wordDifficulty",
  "parameterValue": 2
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{'wordDifficulty': 1, 'timeLimitSec': 30}`
- `2`: `{'wordDifficulty': 1, 'timeLimitSec': 60}`
- `3`: `{'wordDifficulty': 2, 'timeLimitSec': 60}`
- `4`: `{'wordDifficulty': 2, 'timeLimitSec': 90}`
- `5`: `{'wordDifficulty': 3, 'timeLimitSec': 60}`
- `6`: `{'wordDifficulty': 3, 'timeLimitSec': 120}`

---

### Guided Breathing
Mood-only relaxation title: an expanding/contracting circle paces inhale, hold and exhale. No fail state.

**Parameters**
- `inhaleSec` (Integer, 2–10), `holdSec` (Integer, 0–10), `exhaleSec` (Integer, 2–12): phase lengths, applied from the next phase. Defaults 4 / 4 / 6.
- `sessionLengthMin` (Integer, 1–10): total session length. Default 2.

**JSON Payload Example**
```json
{
  "parameterName": "exhaleSec",
  "parameterValue": 8
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{'inhaleSec': 4, 'holdSec': 0, 'exhaleSec': 4, 'sessionLengthMin': 1}`
- `2`: `{'inhaleSec': 4, 'holdSec': 4, 'exhaleSec': 4, 'sessionLengthMin': 2}`
- `3`: `{'inhaleSec': 4, 'holdSec': 7, 'exhaleSec': 8, 'sessionLengthMin': 3}`
- `4`: `{'inhaleSec': 5, 'holdSec': 2, 'exhaleSec': 7, 'sessionLengthMin': 5}`
- `5`: `{'inhaleSec': 6, 'holdSec': 0, 'exhaleSec': 8, 'sessionLengthMin': 10}`

---

### Procedural Maze
Spatial navigation through a freshly generated (recursive-backtracker) maze; a new maze is dealt after every solve.

**Parameters**
- `mazeSize` (Integer, 5–31): cells per side; changing it regenerates the maze. Default 11.
- `fogRadius` (Integer, 0–8): 0 shows the whole maze; otherwise only cells within that distance of the player are drawn. Default 0.

**JSON Payload Example**
```json
{
  "parameterName": "fogRadius",
  "parameterValue": 3
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{'mazeSize': 7, 'fogRadius': 0}`
- `2`: `{'mazeSize': 11, 'fogRadius': 0}`
- `3`: `{'mazeSize': 15, 'fogRadius': 0}`
- `4`: `{'mazeSize': 15, 'fogRadius': 3}`
- `5`: `{'mazeSize': 21, 'fogRadius': 3}`
- `6`: `{'mazeSize': 25, 'fogRadius': 2}`
- `7`: `{'mazeSize': 31, 'fogRadius': 2}`

---

### Order Rush
Original diner-style time-management game (own art/branding, not affiliated with any existing title). Click a waiting guest then an empty table to seat them, click the table once they've decided to take their order, click the kitchen counter to grab the finished dish, then click the matching table to serve it, and click a dirty table to bus it. Guests storm out (costing a life) if their patience runs out before they're served.

**Parameters**
- `customerSpawnIntervalMs` (Integer, 1500–6000): base delay between new guests arriving; ramps down over the shift. Default 3500.
- `patienceSec` (Number, 12–40): base seconds a seated guest waits before leaving angry. Default 22.
- `cookTimeMs` (Integer, 1500–6000): base kitchen prep time per dish. Default 3000.
- `tableCount` (Integer, 2–8): number of open tables. Default 4.
- `difficultyMultiplier` (Number, 0.5–1.5): combined pace knob — scales spawn rate, patience decay and cook time together. Default 1.0.
- `sessionLengthSec` (Integer, 60–360): total shift length. Default 180.

**JSON Payload Example**
```json
{
  "parameterName": "difficultyMultiplier",
  "parameterValue": 1.2
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{'customerSpawnIntervalMs': 5500, 'patienceSec': 36, 'difficultyMultiplier': 0.6}` (Slow shift)
- `2`: `{'customerSpawnIntervalMs': 4500, 'patienceSec': 28, 'difficultyMultiplier': 0.8}`
- `3`: `{'customerSpawnIntervalMs': 3500, 'patienceSec': 22, 'difficultyMultiplier': 1.0}` (Default)
- `4`: `{'customerSpawnIntervalMs': 2800, 'patienceSec': 18, 'difficultyMultiplier': 1.15}`
- `5`: `{'customerSpawnIntervalMs': 2200, 'patienceSec': 15, 'difficultyMultiplier': 1.3}` (Dinner rush)
- `6`: `{'cookTimeMs': 1800}` (Faster kitchen)
- `7`: `{'tableCount': 8}` (Full dining room)
- `8`: `{'sessionLengthSec': 300}` (Longer shift)
- `9`: `{'customerSpawnIntervalMs': 1600, 'patienceSec': 12, 'difficultyMultiplier': 1.5}` (Impossible mode)

---

### Mountain Appreciator
Three.js spot-the-difference game on pairs of procedurally generated twin mountains (slug `mountain-appreciator`, folder `live/Mountain Appreciator`). The parameters are skillprint-js-sdk `ParameterDefinition`s in `static/src/params.js`; `backend/export-config.mjs` writes the manifest (`backend/game-scoring-config.json`) from them. Out-of-range values are clamped, integers rounded.

**Parameters**
- `daylightScale` (Number, 0.5–2.0): multiplies the pair's daylight (40 s + 22 s per difference). Applies at once; the time left stretches in proportion. Default 1.0.
- `missPenaltySec` (Number, 0–20): daylight lost per wrong click on the mountain. Default 7.
- `blinkSunRate` (Number, 1–8): how much faster the sun moves while Blink is held. Default 4.
- `hitTolerance` (Number, 0.6–1.6): scales how close a click must land to a difference. Default 1.0.
- `levelOffset` (Integer, −3–3): shifts the difficulty rung of the next pair (more, subtler and hidden differences). Applies when the next pair is built. Default 0.

The daylight parameters do nothing while the player has ticked "No sunset"; LEVEL_START events carry `noSunset`.

**JSON Payload Example**
```json
{
  "parameterName": "daylightScale",
  "parameterValue": 1.4
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ daylightScale: 1.6, missPenaltySec: 3, blinkSunRate: 2, hitTolerance: 1.35 }` (Relax)
- `2`: `{ daylightScale: 1.3, missPenaltySec: 5, hitTolerance: 1.15 }` (Gentle)
- `3`: `{ daylightScale: 1.0, missPenaltySec: 7, blinkSunRate: 4, hitTolerance: 1.0, levelOffset: 0 }` (Default)
- `4`: `{ daylightScale: 0.8, missPenaltySec: 10 }` (Brisk)
- `5`: `{ daylightScale: 0.65, missPenaltySec: 13, blinkSunRate: 7, hitTolerance: 0.8 }` (Grit)
- `6`: `{ levelOffset: -2 }` (Easier next pair)
- `7`: `{ levelOffset: 2 }` (Harder next pair)
- `8`: `{ hitTolerance: 0.6 }` (Precise clicks only)
- `9`: `{ daylightScale: 0.5, missPenaltySec: 20, blinkSunRate: 8, hitTolerance: 0.6, levelOffset: 3 }` (Extreme)

---

### Equilibrium
Three.js puzzle about balancing a hanging Calder-style mobile (slug `equilibrium`, folder `live/Equilibrium`): weight × distance must match on both sides of every beam, and a hanging beam weighs everything below it. Same skillprint-js-sdk setup as Mountain Appreciator: `static/src/params.js` holds the `ParameterDefinition`s and `backend/export-config.mjs` writes `backend/game-scoring-config.json`. Out-of-range values are clamped, integers rounded; `liveTilt` takes `true`/`false`, `"true"`/`"false"` or `1`/`0`.

**Parameters**
- `levelOffset` (Integer, −3–3): shifts the rung of the next mobile (more beams, longer reach, more loose weights). Applies when the next mobile is built. Default 0.
- `maxWeight` (Integer, 6–15): the largest number on a weight, so the size of the products and sums. Applies to the next mobile. Default 9.
- `hintLevel` (Integer, 0–2): 1 shows each hanging beam's total weight on its wire; 2 also shows weight × distance per arm. Applies at once. Default 0.
- `liveTilt` (Boolean): true lets beams swing as weights go on; false holds them level until the player presses Release, and a failed release costs 30 points. Applies at once. Default true.
- `candleScale` (Number, 0.5–2.5): the candle lasts (45 s + 25 s per loose weight) × this. Applies at once; the time left scales in proportion. Default 1.0.

**JSON Payload Example**
```json
{
  "parameterName": "liveTilt",
  "parameterValue": false
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ liveTilt: true, hintLevel: 2, candleScale: 2.2, maxWeight: 8 }` (Relax)
- `2`: `{ hintLevel: 1, candleScale: 1.6 }` (Gentle)
- `3`: `{ levelOffset: 0, maxWeight: 9, hintLevel: 0, liveTilt: true, candleScale: 1.0 }` (Default)
- `4`: `{ candleScale: 0.75 }` (Brisk)
- `5`: `{ liveTilt: false, hintLevel: 0, candleScale: 0.7, maxWeight: 12 }` (Grit)
- `6`: `{ levelOffset: -2 }` (Easier next mobile)
- `7`: `{ levelOffset: 2 }` (Harder next mobile)
- `8`: `{ maxWeight: 15 }` (Heavier weights)
- `9`: `{ liveTilt: false, hintLevel: 0, candleScale: 0.5, maxWeight: 15, levelOffset: 3 }` (Extreme)

---

### Firefly Gates
Three.js arithmetic runner (slug `firefly-gates`, folder `live/Firefly Gates`): a firefly swarm flies through rows of gates that add, subtract, multiply or divide its count, and must reach a beacon's number. Same skillprint-js-sdk setup as Mountain Appreciator (`static/src/params.js`, `backend/export-config.mjs` → `backend/game-scoring-config.json`). Out-of-range values are clamped, integers rounded.

**Parameters**
- `runSpeed` (Number, 0.6–1.8): forward speed; about 3.5 s between rows at 1.0. Applies at once. Default 1.0.
- `gateTrickiness` (Number, 0–1): how close a row's results are, and how often the gate with the bigger-looking number is the worse one (30% of rows at 0, 80% at 1). Applies from the next stage. Default 0.5.
- `numberScale` (Number, 0.5–3): scales the starting swarm and the band the count is kept in, so the operands grow with it. Applies from the next stage. Default 1.0.
- `beaconStrictness` (Number, 0.6–1.0): the beacon's number as a share of the best possible finish. Applies from the next stage. Default 0.9.
- `hazardDensity` (Number, 0–2): moths between the rows (about one per gap at 1.0); 0 clears those ahead. Applies to moths from now on. Default 1.0.
- `levelOffset` (Integer, −3–3): shifts the rung of the next stage (more rows, bigger operands, three gates per row from rung 5, two-step gates from rung 6). Default 0.

**JSON Payload Example**
```json
{
  "parameterName": "runSpeed",
  "parameterValue": 1.3
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ runSpeed: 0.7, gateTrickiness: 0.2, beaconStrictness: 0.7, hazardDensity: 0.3 }` (Relax)
- `2`: `{ runSpeed: 0.85, beaconStrictness: 0.8 }` (Gentle)
- `3`: `{ runSpeed: 1.0, gateTrickiness: 0.5, numberScale: 1.0, beaconStrictness: 0.9, hazardDensity: 1.0, levelOffset: 0 }` (Default)
- `4`: `{ runSpeed: 1.3 }` (Faster)
- `5`: `{ runSpeed: 1.4, gateTrickiness: 0.85, beaconStrictness: 0.97, hazardDensity: 1.5 }` (Grit)
- `6`: `{ levelOffset: -2 }` (Easier next stage)
- `7`: `{ levelOffset: 2 }` (Harder next stage)
- `8`: `{ numberScale: 2.5 }` (Bigger numbers)
- `9`: `{ runSpeed: 1.8, gateTrickiness: 1.0, numberScale: 3.0, beaconStrictness: 1.0, hazardDensity: 2.0, levelOffset: 3 }` (Extreme)

---

### Elixir
Three.js proportion game (slug `elixir`, folder `live/Elixir`): an alchemist's recipe gives each layer of a potion as a fraction, decimal, percent, ratio or count of drops in a flask of stated capacity, and the player pours each layer by eye into a flask marked only empty and full. Same skillprint-js-sdk setup as Mountain Appreciator (`static/src/params.js`, `backend/export-config.mjs` → `backend/game-scoring-config.json`). Out-of-range values are clamped, integers rounded.

**Parameters**
- `pourRate` (Number, 0.4–2.0): how fast the liquid rises while the tap is held; the empty flask fills in 6 s ÷ this. Applies at once, mid-pour too. Default 1.0.
- `tolerance` (Number, 0.5–2.0): scales the grade bands (Perfect within 1 %, Fine 3 %, Fair 6 % of the flask at 1.0). Applies from the next serve. Default 1.0.
- `gradations` (Integer, 0–10): faint ticks on the flask at every 1/n (0 none, 4 quarters, 10 tenths). Applies at once. Default 0.
- `brewTimeScale` (Number, 0.5–2.5): the hourglass lasts (15 s + 9 s per layer) × this; when it runs out the potion is served as it stands. Applies at once; the sand left scales in proportion. Default 1.0.
- `levelOffset` (Integer, −3–3): shifts the rung of the next recipe (one easy fraction → decimals and percents → two and three layers → capacities in drops → ratios → partial ratio fills). Default 0.

**JSON Payload Example**
```json
{
  "parameterName": "gradations",
  "parameterValue": 4
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ pourRate: 0.6, tolerance: 1.6, gradations: 4, brewTimeScale: 2.2 }` (Relax)
- `2`: `{ pourRate: 0.8, tolerance: 1.3, gradations: 2 }` (Gentle)
- `3`: `{ pourRate: 1.0, tolerance: 1.0, gradations: 0, brewTimeScale: 1.0, levelOffset: 0 }` (Default)
- `4`: `{ brewTimeScale: 0.7, pourRate: 1.3 }` (Brisk)
- `5`: `{ pourRate: 1.6, tolerance: 0.7, gradations: 0, brewTimeScale: 0.6 }` (Grit)
- `6`: `{ levelOffset: -2 }` (Easier next potion)
- `7`: `{ levelOffset: 2 }` (Harder next potion)
- `8`: `{ gradations: 10 }` (Tenths marked)
- `9`: `{ pourRate: 2.0, tolerance: 0.5, gradations: 0, brewTimeScale: 0.5, levelOffset: 3 }` (Extreme)

---

### Lumen
Three.js light-routing puzzle in a chapel at golden hour (slug `lumen`, folder `live/Lumen`): place mirrors, prisms, filters, splitters and combiners on a floor grid to route and mix sunlight and lantern light until every crystal glows its own colour, then seal the stained-glass window above. The parameters are skillprint-js-sdk `ParameterDefinition`s in `static/src/params.js`; `backend/export-config.mjs` writes the manifest (`backend/game-scoring-config.json`) from them. Out-of-range values are clamped, integers rounded (strings like "2.6" round to 3). The tutorial ignores every parameter; windows 1-3 are handcrafted and ignore `colourComplexity`.

**Parameters**
- `pieceBudget` (Integer, 0–4): spare pieces in the tray beyond the glazier's own solution; each spare left unused when the window is sealed scores Elegance. Applies at once (unplaced spares appear or leave the tray; pieces on the floor stay). Default 1.
- `colourComplexity` (Integer, 0–2): what the crystals want. 0 primaries (or white), no mixing; 1 secondaries too (yellow, cyan, magenta via filters and coloured lanterns); 2 mixed targets that need two beams to meet. From the next window. Default 1.
- `beamPreview` (Integer, 0–2): 0 no preview; 1 a dashed ghost beam for the held piece over the hovered cell; 2 the ghost also lights the crystals it would reach and previews a placed piece's next turn. Applies at once. Default 1.
- `windowTimer` (Integer, 0–240): seconds to light each window; 0 untimed, 1–29 count as 30. Switching it on mid-window starts a full timer; changing it scales the time left. When the sun sets the window is lost unless every crystal is lit. Default 0.
- `levelOffset` (Integer, −3–3): shifts the rung of the next window (bigger floors, new pieces, more crystals, fixed fittings). Never mid-window. Default 0.

**JSON Payload Example**
```json
{
  "parameterName": "pieceBudget",
  "parameterValue": 3
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ pieceBudget: 3, colourComplexity: 0, beamPreview: 2, windowTimer: 0 }` (Relax)
- `2`: `{ pieceBudget: 2, colourComplexity: 1, beamPreview: 2, windowTimer: 0 }` (Gentle)
- `3`: `{ pieceBudget: 1, colourComplexity: 1, beamPreview: 1, windowTimer: 0, levelOffset: 0 }` (Default)
- `4`: `{ pieceBudget: 1, beamPreview: 1, windowTimer: 150 }` (Brisk)
- `5`: `{ pieceBudget: 0, colourComplexity: 2, beamPreview: 0, windowTimer: 75 }` (Grit)
- `6`: `{ levelOffset: -2 }` (Easier next window)
- `7`: `{ levelOffset: 2 }` (Harder next window)
- `8`: `{ pieceBudget: 4 }` (Many spares: room to be creative)
- `9`: `{ pieceBudget: 0, colourComplexity: 2, beamPreview: 0, windowTimer: 45, levelOffset: 3 }` (Extreme)

---

### Flockwork
Three.js cooperative herding game (slug `flockwork`, folder `live/Flockwork`): the player leads two or three sheepdogs (Moss the outrunner, Bramble the driver black-faces respect, Pip the pup who holds gates), selecting a dog and whistling commands (fetch, send, hold the gate, come-bye, away, walk up, lie down) to pen the flock before sundown on a new painted hillside each field. Same skillprint-js-sdk setup as Elixir (`static/src/params.js`, `backend/export-config.mjs` → `backend/game-scoring-config.json`). Out-of-range values are clamped, integers rounded; the tutorial ignores every parameter.

**Parameters**
- `flightiness` (Number, 0.5–1.8): how easily the sheep take fright; flight zone 4.6 m × f^0.7, stress from pressing or running dogs × f, and the ram breaks every ~24 s ÷ f^0.9. Higher scatters more. Applies at once. Default 1.0.
- `dogAutonomy` (Number, 0–1): how much idle dogs do unbidden: take the gate (≥ 0.25), block a threatened wall gap (≥ 0.4), head off the ram (≥ 0.55), fetch loose groups (≥ 0.7), after 12 s idle at 0.05 down to 1.5 s at 1. Applies at once. Default 0.5.
- `flockSize` (Integer, 6–30): sheep per field (× 0.9 at rung 1 to × 1.2 from rung 7). Next field; raising it mid-field also sends the extra sheep (up to 8) over the far wall as strays and raises the number to pen. Default 12.
- `dayLength` (Number, 0.5–2.0): multiplies the time to sundown (75 s at rung 1 to 100 s from rung 6). Applies at once; daylight left scales in proportion. Default 1.0.
- `levelOffset` (Integer, −3–3): shifts the rung of the next field (2 lambs and a wall gap → 3 Bramble, black-faces, stream and bridge → 4 bog → 5 the ram → 6 dividing wall → 7+ more of everything). Default 0.

**JSON Payload Example**
```json
{
  "parameterName": "dogAutonomy",
  "parameterValue": 0.8
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ flightiness: 0.65, dogAutonomy: 0.85, flockSize: 9, dayLength: 1.8 }` (Relax)
- `2`: `{ flightiness: 0.8, dogAutonomy: 0.7, dayLength: 1.3 }` (Gentle)
- `3`: `{ flightiness: 1.0, dogAutonomy: 0.5, flockSize: 12, dayLength: 1.0, levelOffset: 0 }` (Default)
- `4`: `{ dayLength: 0.75, flockSize: 16 }` (Brisk)
- `5`: `{ flightiness: 1.5, dogAutonomy: 0.1, flockSize: 18, dayLength: 0.7 }` (Grit)
- `6`: `{ levelOffset: -2 }` (Easier next field)
- `7`: `{ levelOffset: 2 }` (Harder next field)
- `8`: `{ dogAutonomy: 1 }` (Dogs do it all)
- `9`: `{ flightiness: 1.8, dogAutonomy: 0, flockSize: 30, dayLength: 0.5, levelOffset: 3 }` (Extreme)

---

---

### Broadsheet
Three.js letterpress word game (slug `broadsheet`, folder `live/Broadsheet`): the player spells words from a tilted case of type (Boggle rules: touching blocks, diagonals too, each block once; drag, tap or type) to fill a client's order slip of three or four constrained lines (a theme word, N+ letters, a given letter, a plural, a rhyme, a chained first letter, a double letter) before the press run's clock or sheets run out; every word is printed onto the client's poster. Same skillprint-js-sdk setup as Elixir (`static/src/params.js`, `backend/export-config.mjs` → `backend/game-scoring-config.json`). Out-of-range values are clamped, integers rounded.

**Parameters**
- `pressTime` (Number, 0.5–2.0): multiplies the press-run clock, 45 s + 15 s per order line at 1.0. Applies at once; the time left scales in proportion. Default 1.0.
- `vowelShare` (Number, 0.28–0.5): the vowel share the type drawer aims for in new blocks. Applies to every block dealt from then on (every word set refills the case). Default 0.38.
- `minWordLength` (Integer, 3–5): the shortest word the press accepts. Applies from the next word set. Default 3.
- `hintLevel` (Integer, 0–2): after 8 s without a word, 0 nothing, 1 a gold glint on the first block of a good word, 2 the first two blocks glint and are written on the order slip. Applies at once (0 clears a glint). Default 1.
- `levelOffset` (Integer, −3–3): shifts the rung of the next commission (bigger case, four lines, rhymes, chained lines, rare and double letters). Default 0.

**JSON Payload Example**
```json
{
  "parameterName": "minWordLength",
  "parameterValue": 4
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ pressTime: 1.8, vowelShare: 0.44, minWordLength: 3, hintLevel: 2 }` (Relax)
- `2`: `{ pressTime: 1.3, vowelShare: 0.41, hintLevel: 1 }` (Gentle)
- `3`: `{ pressTime: 1.0, vowelShare: 0.38, minWordLength: 3, hintLevel: 1, levelOffset: 0 }` (Default)
- `4`: `{ pressTime: 0.75, minWordLength: 4 }` (Brisk)
- `5`: `{ pressTime: 0.65, vowelShare: 0.31, minWordLength: 4, hintLevel: 0 }` (Grit)
- `6`: `{ levelOffset: -2 }` (Easier next commission)
- `7`: `{ levelOffset: 2 }` (Harder next commission)
- `8`: `{ minWordLength: 5 }` (Five-letter press)
- `9`: `{ pressTime: 0.5, vowelShare: 0.28, minWordLength: 5, hintLevel: 0, levelOffset: 3 }` (Extreme)

---

### Wayfinder
Three.js geography game (slug `wayfinder`, folder `live/Wayfinder`): a clue card asks for a place (by name, description or riddle), the player spins a watercolour paper globe, drops a pin and confirms; a dotted line flies to the true spot and close answers earn passport stamps. Journeys of 5–7 places on a theme, each in its own look. Same skillprint-js-sdk setup as Elixir (`static/src/params.js`, `backend/export-config.mjs` → `backend/game-scoring-config.json`). Out-of-range values are clamped, integers rounded (the game parses them itself), `true`/`false` read as 1/0.

**Parameters**
- `labelDensity` (Integer, 0–3): 0 coasts and mountain hachures only, 1 dashed country borders, 2 + ~55 reference cities (none within 450 km of the answer), 3 + oceans, seas and continents. Applies at once. Default 1.
- `clueClarity` (Integer, 0–2): 0 riddle, 1 description, 2 the place's name. Applies at once (the open clue is reworded until confirmed). Default 1.
- `scoreRadiusKm` (Integer, 150–1500): full-credit radius, dotted round the pin; Pinpoint within a quarter of it, Visited stamp within twice it. Applies at once. Default 500.
- `clueTimer` (Integer, 0–90): seconds per clue, 0 untimed; at zero the pin stands where it is, or the clue is missed. Applies at once, keeping the share of time left. Default 0.
- `levelOffset` (Integer, −3–3): shifts the rung of the next journey (famous places → lesser-known → the well travelled, mixed subjects from rung 5). Default 0.

**JSON Payload Example**
```json
{
  "parameterName": "clueClarity",
  "parameterValue": 0
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ labelDensity: 3, clueClarity: 2, scoreRadiusKm: 1000, clueTimer: 0 }` (Relax)
- `2`: `{ labelDensity: 2, clueClarity: 1, scoreRadiusKm: 750 }` (Gentle)
- `3`: `{ labelDensity: 1, clueClarity: 1, scoreRadiusKm: 500, clueTimer: 0, levelOffset: 0 }` (Default)
- `4`: `{ clueTimer: 30, scoreRadiusKm: 400 }` (Brisk)
- `5`: `{ labelDensity: 0, clueClarity: 0, scoreRadiusKm: 250, clueTimer: 20 }` (Grit)
- `6`: `{ levelOffset: -2 }` (Easier next journey)
- `7`: `{ levelOffset: 2 }` (Harder next journey)
- `8`: `{ clueClarity: 0 }` (Riddles only)
- `9`: `{ labelDensity: 0, clueClarity: 0, scoreRadiusKm: 150, clueTimer: 12, levelOffset: 3 }` (Extreme)

---

---

### Hearthlight
Three.js memory-and-empathy game (slug `hearthlight`, folder `live/Hearthlight`): at dusk the windows of a felt-and-knit snowy village light up one by one, each showing a felted animal resident and how they feel (cold, sad, scared, lonely, tired, excited, unwell; door notes can swap the usual comfort); at night the curtains close and the player pulls the lamplighter's sled from house to house and brings each the right comfort from memory. Each night is another village from a shuffle bag. Same skillprint-js-sdk setup as Elixir (`static/src/params.js`, `backend/export-config.mjs` → `backend/game-scoring-config.json`). Out-of-range values are clamped, integers rounded. The tutorial ignores parameters.

**Parameters**
- `showTime` (Number, 1.0–4.0): seconds each window stays open at dusk. Applies at once (the open window rescales). Default 2.5.
- `feelingClarity` (Integer, 0–2): 0 face only, 1 face + posture and props, 2 plus a thought bubble with the feeling's icon. Applies at once. Default 1.
- `peeks` (Integer, 0–3): curtain peeks per night (a comfort after a peek scores half). Applies at once. Default 1.
- `nightTimer` (Integer, 0–15): seconds of night per house before the moon sets (houses × this + 4 s); 0 = untimed. Applies at once (rescales; 0 removes it). Default 0.
- `levelOffset` (Integer, −3–3): shifts the rung of the next night (3 → 8 houses, door notes, out-of-order windows, shared windows, houses calling in order, residents moving next door). Default 0.

**JSON Payload Example**
```json
{
  "parameterName": "showTime",
  "parameterValue": 3.5
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ showTime: 3.6, feelingClarity: 2, peeks: 3, nightTimer: 0 }` (Relax)
- `2`: `{ showTime: 3.0, feelingClarity: 2, peeks: 2 }` (Gentle)
- `3`: `{ showTime: 2.5, feelingClarity: 1, peeks: 1, nightTimer: 0, levelOffset: 0 }` (Default)
- `4`: `{ showTime: 1.8, nightTimer: 9 }` (Brisk)
- `5`: `{ showTime: 1.4, feelingClarity: 0, peeks: 0, nightTimer: 6 }` (Grit)
- `6`: `{ levelOffset: -2 }` (Easier next night)
- `7`: `{ levelOffset: 2 }` (Harder next night)
- `8`: `{ feelingClarity: 0 }` (Faces only)
- `9`: `{ showTime: 1.0, feelingClarity: 0, peeks: 0, nightTimer: 4, levelOffset: 3 }` (Extreme)

---

### Jelly Juggle
Three.js claymation action game: slide a trampoline round a toybox playroom and bounce wobbly jellies into the hoop with the matching shape, releasing the crouch as one lands for a Super Boing (slug `jelly-juggle`, folder `live/Jelly Juggle`). The parameters are skillprint-js-sdk `ParameterDefinition`s in `static/src/params.js`; `backend/export-config.mjs` writes the manifest (`backend/game-scoring-config.json`) from them. Out-of-range values are clamped, integers rounded. The tutorial plays with its own gentle settings and ignores them.

**Parameters**
- `gravity` (Number, 0.6–1.6): scales gravity on every jelly (10.5 units/s² × this × the rung's 1.00–1.10). Bounce heights are fixed, so a plain bounce stays up 1.71 s at 0.6, 1.32 s at 1.0 and 1.05 s at 1.6. Applies at once, mid-flight too. Default 1.0.
- `spawnRate` (Number, 6–40): jellies per minute launched from the toy pipes while there is room (× the rung's pace, ×0.85 at rung 1 to ×1.4 from rung 7); also moves the cap on jellies in the air by one per 10 above or below 16 (between 1 and 6). Applies at once; the next launch is re-timed. Default 16.
- `trampolineSize` (Number, 0.7–1.5): scales the trampoline (radius 0.95 units × this). Applies at once, eased over a third of a second. Default 1.0.
- `hoopSize` (Number, 0.7–1.5): scales the hoop, bowl and saucer openings (radius 0.72 × this; a jelly is 0.4). Applies at once, eased over half a second. Default 1.0.
- `superWindowMs` (Integer, 60–400): width of the Super Boing timing window centred on a landing (Perfect inside its middle half). Applies at once. Default 180.
- `levelOffset` (Integer, −3–3): shifts the rung of the next level (more jellies at once, more hoops, sliding hoops, wind, sticky and splitting jellies, the Jelly Mountain boss at rung 8). Applies when the next level is built, never mid-level. Default 0.

**JSON Payload Example**
```json
{
  "parameterName": "superWindowMs",
  "parameterValue": 240
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ gravity: 0.75, spawnRate: 10, trampolineSize: 1.3, hoopSize: 1.3, superWindowMs: 300 }` (Relax)
- `2`: `{ gravity: 0.88, spawnRate: 13, trampolineSize: 1.15, hoopSize: 1.15, superWindowMs: 240 }` (Gentle)
- `3`: `{ gravity: 1.0, spawnRate: 16, trampolineSize: 1.0, hoopSize: 1.0, superWindowMs: 180, levelOffset: 0 }` (Default)
- `4`: `{ gravity: 1.15, spawnRate: 22 }` (Brisk)
- `5`: `{ gravity: 1.35, spawnRate: 30, trampolineSize: 0.8, hoopSize: 0.8, superWindowMs: 110 }` (Grit)
- `6`: `{ levelOffset: -2 }` (Easier next level)
- `7`: `{ levelOffset: 2 }` (Harder next level)
- `8`: `{ trampolineSize: 1.5 }` (Giant trampoline)
- `9`: `{ gravity: 1.6, spawnRate: 40, trampolineSize: 0.7, hoopSize: 0.7, superWindowMs: 60, levelOffset: 3 }` (Extreme)

---

---

### Trails WebAR
Unity WebGL trail-making game (slug `trails-webar`, folder `live/Trails`). Numbered levels apply adjustments live; the endless "Mood Run" applies them at the start of the next wave. Full manifest: `live/Trails/backend/game-scoring-config.json`.

**Parameters**
- `totalNodesCount` (Integer, 5-25): Nodes in the trail (per wave in the endless mode). Default 10.
- `rotateNodesAroundUser` (Integer 0/1 or Boolean): Nodes slowly orbit the player. Default 0.
- `rotationSpeed` (Float, 1-20): Orbit speed in degrees per second when rotation is on. Default 5.
- `nodeDimension` (Integer 0-3, or String): 0 `numbers`, 1 `letters`, 2 `alternating` (1-A-2-B), 3 `emojis`. Default 0.
- `arrowHelpfulness` (Integer, 0-2): 0 none, 1 off-screen arrow, 2 arrow plus on-screen highlight. Default 2.

**JSON Payload Example**
```json
{
  "parameterName": "totalNodesCount",
  "parameterValue": 8
}
```

```json
{
  "parameterName": "nodeDimension",
  "parameterValue": 2
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ totalNodesCount: 5 }` (Fewer nodes)
- `2`: `{ totalNodesCount: 15 }` (More nodes)
- `3`: `{ rotateNodesAroundUser: 1, rotationSpeed: 8 }` (Orbiting nodes)
- `4`: `{ nodeDimension: "letters" }`
- `5`: `{ nodeDimension: "emojis" }`
- `6`: `{ nodeDimension: "alternating" }`
- `7`: `{ arrowHelpfulness: 1 }` (Arrow only)
- `8`: `{ arrowHelpfulness: 0 }` (No guidance)
- `9`: `{ totalNodesCount: 25, rotateNodesAroundUser: 1, rotationSpeed: 15, arrowHelpfulness: 0 }` (Extreme)
