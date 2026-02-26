# Skillprint Adaptive Game Parameters
This file documents all variables mapped per instrumented game to the `ADJUST_GAME` parent `postMessage` listener. Adjustments can be sent globally from the wrapper `GameAdjustmentTester` or the Skillprint adaptive engine.

## Supported Games

### Box Tower
Controls the side-to-side scrolling velocity of the active dropping block, as well as the alignment threshold for scoring a perfect placement.

**Parameters**
- `stackVelocity` (Number): Global scrolling speed modifier. Default is ~15.
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
- `2`: `{ stackVelocity: 15 }` (Default)
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
