# 0hh1 Skillprint Integration

This game has been integrated with the Skillprint SDK.

## Game Adjustments Testing

The game parameters can be actively adjusted and tested using the keys `1` through `9`. When pressing a key, the `GameAdjustmentTester` triggers adjustments in `parameters.json` which are applied via the `skillprintShim.js` script inside the iframe and displayed on the client using the `GameAdjustmentBanner`.

## Key Mappings for Testing

We map 1-9 to combinations of board generation quality, maximum grid size, and hint constraints:

*   **Key 1**: qualityThreshold = 20, maxGridSize = 4, hintsAllowed = 1 (EASY / RELAX)
*   **Key 2**: qualityThreshold = 20, maxGridSize = 6, hintsAllowed = 1
*   **Key 3**: qualityThreshold = 20, maxGridSize = 6, hintsAllowed = 0 (No Hints)
*   **Key 4**: qualityThreshold = 60, maxGridSize = 6, hintsAllowed = 1 (STANDARD / FOCUS)
*   **Key 5**: qualityThreshold = 60, maxGridSize = 8, hintsAllowed = 1
*   **Key 6**: qualityThreshold = 60, maxGridSize = 8, hintsAllowed = 0 (No Hints)
*   **Key 7**: qualityThreshold = 90, maxGridSize = 8, hintsAllowed = 1 (HARD / GRIT)
*   **Key 8**: qualityThreshold = 90, maxGridSize = 10, hintsAllowed = 1
*   **Key 9**: qualityThreshold = 95, maxGridSize = 10, hintsAllowed = 0 (EXTREME GRIT)

## Parameters

*   **qualityThreshold**: (Integer, 10 - 99) Percentage of empty cells in the generated level. Lower values make board generation easier (more cells are pre-populated), while higher values leave very few clues.
*   **maxGridSize**: (Integer, 4 - 10) Restricts the maximum grid size selectable by the user (4, 6, 8, or 10). Selection options above this cap are locked and faded out.
*   **hintsAllowed**: (Integer, 0 - 1) Controls whether hints are allowed. When set to `0`, clicking the help (eye) button shows a notice stating that hints are disabled.
