# Alchemy Skillprint Integration

This game has been integrated with the Skillprint SDK.

## Game Adjustments Testing

The game parameters can be actively adjusted and tested using the keys `1` through `9`. When pressing a key, the `GameAdjustmentTester` triggers adjustments in `parameters.json` which are applied via the `skillprintShim.js` script inside the iframe and displayed on the client using the `GameAdjustmentBanner`.

## Key Mappings for Testing

We map 1-9 to combinations of combine distance thresholds and animation durations:

*   **Key 1**: combineDistance = 80, combineDuration = 100 (EASY / RELAX / SNAPPY)
*   **Key 2**: combineDistance = 60, combineDuration = 200
*   **Key 3**: combineDistance = 40, combineDuration = 300
*   **Key 4**: combineDistance = 40, combineDuration = 400 (STANDARD / FOCUS / DEFAULT)
*   **Key 5**: combineDistance = 35, combineDuration = 600
*   **Key 6**: combineDistance = 30, combineDuration = 800
*   **Key 7**: combineDistance = 25, combineDuration = 1000 (HARD / MEDITATIVE / DELIBERATE)
*   **Key 8**: combineDistance = 20, combineDuration = 1500
*   **Key 9**: combineDistance = 15, combineDuration = 2000 (EXTREME GRIT)

## Parameters

*   **combineDistance**: (Integer, 20 - 100) Proximity distance threshold in pixels. Items dropped closer than this distance will attempt to combine. Higher values make merging more lenient/forgiving. Default is 40.
*   **combineDuration**: (Integer, 100 - 2000) Duration of the merge tween animation in milliseconds. Higher values slow down combinations for a more meditative feedback style. Default is 400.
