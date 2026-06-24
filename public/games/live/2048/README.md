# 2048 Skillprint Integration

This game has been integrated with the Skillprint SDK.

## Game Adjustments Testing

The game parameters can be actively adjusted and tested using the keys `1` through `9`. When pressing a key, the `GameAdjustmentTester` triggers adjustments in `parameters.json` which are applied via the `skillprintShim.js` script inside the iframe and displayed on the client using the `GameAdjustmentBanner`.

## Key Mappings for Testing

We map 1-9 to combinations of starting tile count, 4-spawn probability, and target win scores:

*   **Key 1**: startTiles = 1, fourProbability = 0 (0% chance of 4s), targetValue = 256 (EASY / RELAX / FAST WIN)
*   **Key 2**: startTiles = 2, fourProbability = 5, targetValue = 512
*   **Key 3**: startTiles = 2, fourProbability = 10, targetValue = 1024
*   **Key 4**: startTiles = 2, fourProbability = 10, targetValue = 2048 (STANDARD / FOCUS / DEFAULT)
*   **Key 5**: startTiles = 3, fourProbability = 15, targetValue = 2048
*   **Key 6**: startTiles = 4, fourProbability = 20, targetValue = 2048
*   **Key 7**: startTiles = 4, fourProbability = 30, targetValue = 2048 (HARD / GRIT)
*   **Key 8**: startTiles = 5, fourProbability = 40, targetValue = 4096
*   **Key 9**: startTiles = 6, fourProbability = 50, targetValue = 4096 (EXTREME GRIT)

## Parameters

*   **startTiles**: (Integer, 1 - 8) The number of tiles generated on game startup. Default is 2.
*   **fourProbability**: (Integer, 0 - 80) Percentage chance that a generated tile will be a '4' instead of a '2'. Range 0 (only 2s) to 80 (mostly 4s). Default is 10.
*   **targetValue**: (Integer, 256 - 4096) The target number required on a single tile to win the level. Default is 2048.
