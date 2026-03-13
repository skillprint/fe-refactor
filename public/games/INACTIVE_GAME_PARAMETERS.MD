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

### Circle Word
*   **Parameters:**
    *   `timer`: Adjusts the time limit given for each word sequence in the level.
    *   `angleSpeed`: Modifies the rotation speed of the letters in the circle (in both directions).

### Color Bump
*   **Parameters:**
    *   `speedModifier`: A generic speed multiplier applied by overriding `performance.now()` and `Date.now()`. This scales the game's internal timestep.

### Crossy Chicken
*   **Parameters:**
    *   `speedModifier`: Generic speed multiplier (overrides standard timing functions).

### Jigsaw Puzzle
*   **Parameters:**
    *   `speedModifier`: Generic speed multiplier (overrides standard timing functions).

### Jumper Frog
*   **Parameters:**
    *   `speedModifier`: Generic speed multiplier (overrides standard timing functions).

### Miner Block
*   **Parameters:**
    *   `speedModifier`: Generic speed multiplier (overrides standard timing functions).

### Pipe Flow
*   **Parameters:**
    *   `speedModifier`: Generic speed multiplier (overrides standard timing functions).

### Slide
*   **Parameters:**
    *   `speedModifier`: Generic speed multiplier (overrides standard timing functions).

### Sweet Candy Saga
*   **Parameters:**
    *   `speedModifier`: Generic speed multiplier (overrides standard timing functions).

### Twenty-One
*   **Parameters:**
    *   `speedModifier`: Generic speed multiplier (overrides standard timing functions).

### Unlock Blox
*   **Parameters:**
    *   `speedModifier`: Generic speed multiplier (overrides standard timing functions).

### Word Search
*   **Parameters:**
    *   `speedModifier`: Generic speed multiplier (overrides standard timing functions).

### Zig Zag Switch
*   **Parameters:**
    *   `speedModifier`: Generic speed multiplier (overrides standard timing functions).

---
*Note: The `speedModifier` is widely used for minified or densely constructed HTML5 games. It hooks into the browser's time-fetching functions (`performance.now()` and `Date.now()`) to linearly scale the passage of time observed by the game loop, making it universally applicable for adjusting game speed without needing access to obfuscated internal variables.*
