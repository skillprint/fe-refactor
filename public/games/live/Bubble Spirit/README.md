# Bubble Spirit Skillprint Integration

This game has been integrated with the Skillprint SDK.

## Game Adjustments Testing

The game parameters can be actively adjusted and tested using the keys `1` through `9`. When pressing a key, the `GameAdjustmentTester` triggers adjustments in `parameters.json` which are applied via the `skillprintShim.js` script inside the iframe and displayed on the client using the `GameAdjustmentBanner`.

## Key Mappings for Testing

We map 1-9 to combinations of bubble launching velocity, aiming guide visibility, and total shot limit multipliers:

*   **Key 1**: shootVelocity = 700, aimGuideEnabled = 1, bubbleLimitMultiplier = 1.5 (RELAX / EASY - slow shots, aim guide, more bubbles)
*   **Key 2**: shootVelocity = 900, aimGuideEnabled = 1, bubbleLimitMultiplier = 1.2 (Slightly more shots)
*   **Key 3**: shootVelocity = 1200, aimGuideEnabled = 1, bubbleLimitMultiplier = 1.0 (Standard shots limit, faster speed)
*   **Key 4**: shootVelocity = 900, aimGuideEnabled = 1, bubbleLimitMultiplier = 1.0 (STANDARD / FOCUS - default values)
*   **Key 5**: shootVelocity = 1100, aimGuideEnabled = 1, bubbleLimitMultiplier = 0.9 (Faster speed, fewer shots)
*   **Key 6**: shootVelocity = 1300, aimGuideEnabled = 1, bubbleLimitMultiplier = 0.8 (Tighter shots budget)
*   **Key 7**: shootVelocity = 1000, aimGuideEnabled = 0, bubbleLimitMultiplier = 0.8 (GRIT / HARD - no aim guide, fewer shots)
*   **Key 8**: shootVelocity = 1400, aimGuideEnabled = 0, bubbleLimitMultiplier = 0.7 (Fast shots, no aim guide, tight shots budget)
*   **Key 9**: shootVelocity = 1800, aimGuideEnabled = 0, bubbleLimitMultiplier = 0.5 (EXTREME GRIT - ultra-fast shots, no aim guide, half the standard shot limit)

## Parameters

*   **shootVelocity**: (Integer, 400 - 1800) The velocity of the flying bubble. Default is `900`.
*   **aimGuideEnabled**: (Integer, 0 or 1) Toggle aiming guide assistance line and bounce projections. 1: enabled, 0: disabled.
*   **bubbleLimitMultiplier**: (Float, 0.5 - 2.0) Multiply total shots allowed per level. Default is `1.0`.
