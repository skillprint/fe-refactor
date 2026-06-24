# Box Tower Skillprint Integration

This game has been integrated with the Skillprint SDK.

## Game Adjustments Testing

The game parameters can be actively adjusted and tested using the keys `1` through `9`. When pressing a key, the `GameAdjustmentTester` triggers adjustments in `parameters.json` which are applied via the `skillprintShim.js` script inside the iframe and displayed on the client using the `GameAdjustmentBanner`.

## Key Mappings for Testing

We map 1-9 to combinations of block moving velocity and perfect drop tolerance:

*   **Key 1**: stackVelocity = 5, perfectRange = 1 (Very Slow Block Speed)
*   **Key 2**: stackVelocity = 15, perfectRange = 1 (Default Game Options)
*   **Key 3**: stackVelocity = 35, perfectRange = 1 (Fast Block Speed)
*   **Key 4**: stackVelocity = 15, perfectRange = 0.1 (Extremely Strict Alignment)
*   **Key 5**: stackVelocity = 15, perfectRange = 1 (Default Game Options)
*   **Key 6**: stackVelocity = 15, perfectRange = 10 (Extremely Forgiving Alignment)
*   **Key 7**: stackVelocity = 10, perfectRange = 5 (RELAX / EASY Mode)
*   **Key 8**: stackVelocity = 20, perfectRange = 2 (STANDARD / FOCUS Mode)
*   **Key 9**: stackVelocity = 40, perfectRange = 0 (GRIT / EXTREME Mode)

## Parameters

*   **stackVelocity**: (Integer, 2 - 40) Speed in pixels per frame of the moving stacking blocks. Lower speeds make timing easier. Default is 15.
*   **perfectRange**: (Integer, 0 - 10) Alignment tolerance in pixels. If alignment error falls within this threshold, no block parts are cut off. Default is 1.
