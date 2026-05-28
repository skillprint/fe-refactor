# Cut The Rope Skillprint Integration

This game has been integrated with the Skillprint SDK.

## Game Adjustments testing

The game parameters can be actively adjusted and tested using the keys `1` through `9`. When pressing a key, the `GameAdjustmentTester` will cycle sequentially through the parameters defined in `parameters.json`.

Since Cut The Rope has 4 adjustable parameters, pressing a key will trigger them as follows based on their sequential order in `parameters.json`:

1. `gravity`
2. `ropeElasticity`
3. `scoreMultiplier`
4. `timeLimitSeconds`

Pressing the same key multiple times will cycle through increasing parameter values based on the min/max ranges. The adjustment is applied via the `skillprintShim.js` script inside the iframe and displayed on the client using the `GameAdjustmentBanner`.

## Key mappings for testing

- **Key 1**: Set gravity scale to 0.5 (low gravity - floaty - easy).
- **Key 2**: Set gravity scale to 1.0 (default).
- **Key 3**: Set gravity scale to 2.0 (high gravity - heavy - hard).
- **Key 4**: Set rope elasticity to 0.5 (stiff ropes).
- **Key 5**: Set rope elasticity to 1.0 (default).
- **Key 6**: Set rope elasticity to 1.8 (very elastic / bouncy).
- **Key 7**: Set score multiplier to 1, time limit to 90 seconds (relaxed).
- **Key 8**: Set score multiplier to 2, time limit to 45 seconds (default).
- **Key 9**: Set score multiplier to 5, time limit to 15 seconds (intense / high grit / arousal).

## Parameters

* **gravity**: Physics gravity coefficient.
* **ropeElasticity**: Elastic tension of Cut The Rope's physics ropes.
* **scoreMultiplier**: Points gained per collected star.
* **timeLimitSeconds**: Allowed time to solve level.
