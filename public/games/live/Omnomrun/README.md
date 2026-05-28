# Omnomrun Skillprint Integration

This game has been integrated with the Skillprint SDK.

## Game Adjustments testing

The game parameters can be actively adjusted and tested using the keys `1` through `9`. When pressing a key, the `GameAdjustmentTester` will cycle sequentially through the parameters defined in `parameters.json`.

Since Omnomrun has 4 adjustable parameters, pressing a key will trigger them as follows based on their sequential order in `parameters.json`:

1. `speedScale`
2. `invincibilityDuration`
3. `magnetRadius`
4. `coinSpawnRate`

Pressing the same key multiple times will cycle through increasing parameter values based on the min/max ranges. The adjustment is applied via the `skillprintShim.js` script inside the iframe and displayed on the client using the `GameAdjustmentBanner`.

## Key mappings for testing

- **Key 1**: Set speedScale to 0.6 (slow runner - easy).
- **Key 2**: Set speedScale to 1.0 (default speed).
- **Key 3**: Set speedScale to 1.5 (fast runner - hard).
- **Key 4**: Set invincibilityDuration to 5 seconds (stiff/short invincibility).
- **Key 5**: Set invincibilityDuration to 10 seconds (default).
- **Key 6**: Set invincibilityDuration to 25 seconds (extended invincibility).
- **Key 7**: Set magnetRadius to 1, coinSpawnRate to 1 (scarce coins, narrow magnet).
- **Key 8**: Set magnetRadius to 3, coinSpawnRate to 2 (default).
- **Key 9**: Set magnetRadius to 8, coinSpawnRate to 4 (rich coins, wide magnet).

## Parameters

* **speedScale**: Scaling factor for player movement and obstacle speed.
* **invincibilityDuration**: Duration in seconds of player invincibility when acquiring the shield power-up.
* **magnetRadius**: Attraction radius for coins while the magnet power-up is active.
* **coinSpawnRate**: Frequency and density modifier for spawning coins in the lanes.
