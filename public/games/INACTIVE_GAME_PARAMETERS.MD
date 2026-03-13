# Inactive Game Parameters & Keyboard Shortcuts

This document outlines the parameters available for dynamic adjustment during gameplay for the inactive games. It also details the keyboard shortcuts implemented to test these adjustments.

## Global Keyboard Shortcuts

Across all instrumented games, the following keyboard shortcuts have been implemented within the game iframes:

*   **Keys `1` through `9`:** Pressing any of these number keys will send a `skillprint_keydown` message to the parent window (e.g., the GameAdjustmentTester). The parent window can then intercept these messages to apply different configurations or generic parameters (like `speedModifier`) to the game.

## Game-Specific Parameters

The following games have been instrumented to accept `ADJUST_GAME` messages from the parent window.

### Airport Rush
*   **Parameters:**
    *   `planeMoveSpeed`: Modifies the speed of planes moving on the ground.
    *   `actionTimer`: Adjusts the base duration for various game actions.
    *   `landingTimer`: Modifies the time it takes for a plane to land.
    *   `terminalStopTimer`: Changes how long a plane remains stopped at a terminal.

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ planeMoveSpeed: 0.2 }` (Very Slow)
- `2`: `{ planeMoveSpeed: 0.5 }`
- `3`: `{ planeMoveSpeed: 0.8 }`
- `4`: `{ planeMoveSpeed: 1 }` (Default)
- `5`: `{ planeMoveSpeed: 1.2 }`
- `6`: `{ planeMoveSpeed: 1.5 }`
- `7`: `{ planeMoveSpeed: 2 }`
- `8`: `{ planeMoveSpeed: 3 }`
- `9`: `{ planeMoveSpeed: 5 }` (Very Fast)

---

### Circle Word
*   **Parameters:**
    *   `timer`: Adjusts the time limit given for each word sequence in the level.
    *   `angleSpeed`: Modifies the rotation speed of the letters in the circle (in both directions).

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ angleSpeed: 60 }` (Easy / Slow)
- `2`: `{ angleSpeed: 50 }`
- `3`: `{ angleSpeed: 40 }`
- `4`: `{ angleSpeed: 30 }` (Default)
- `5`: `{ angleSpeed: 25 }`
- `6`: `{ angleSpeed: 20 }`
- `7`: `{ angleSpeed: 15 }`
- `8`: `{ angleSpeed: 10 }`
- `9`: `{ angleSpeed: 5 }` (Very Fast)

---

### Generic Speed Scaling Games

The follow games use a generic time-scaling method (`speedModifier`) implemented by overriding `performance.now()` and `Date.now()`. This multiplier uniformly scales the speed of animations, timers, and physics.

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ speedModifier: 0.2 }` (Very Slow)
- `2`: `{ speedModifier: 0.5 }`
- `3`: `{ speedModifier: 0.8 }`
- `4`: `{ speedModifier: 1 }` (Default)
- `5`: `{ speedModifier: 1.2 }`
- `6`: `{ speedModifier: 1.5 }`
- `7`: `{ speedModifier: 2 }`
- `8`: `{ speedModifier: 3 }`
- `9`: `{ speedModifier: 5 }` (Very Fast)

This mapping applies to the following games:

#### Color Bump
*   **Parameters:**
    *   `speedModifier`

#### Crossy Chicken
*   **Parameters:**
    *   `speedModifier`

#### Jigsaw Puzzle
*   **Parameters:**
    *   `speedModifier`

#### Jumper Frog
*   **Parameters:**
    *   `speedModifier`

#### Miner Block
*   **Parameters:**
    *   `speedModifier`

#### Pipe Flow
*   **Parameters:**
    *   `speedModifier`

#### Slide
*   **Parameters:**
    *   `speedModifier`

#### Sweet Candy Saga
*   **Parameters:**
    *   `speedModifier`

#### Twenty-One
*   **Parameters:**
    *   `speedModifier`

#### Unlock Blox
*   **Parameters:**
    *   `speedModifier`

#### Word Search
*   **Parameters:**
    *   `speedModifier`

#### Zig Zag Switch
*   **Parameters:**
    *   `speedModifier`
