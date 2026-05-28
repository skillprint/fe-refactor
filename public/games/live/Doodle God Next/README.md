# Doodle God Next Skillprint Integration

This game has been integrated with the Skillprint SDK.

## Game Adjustments testing

The game parameters can be actively adjusted and tested using the keys `1` through `9`. When pressing a key, the `GameAdjustmentTester` will cycle sequentially through the parameters defined in `parameters.json`.

Since Doodle God Next has 4 adjustable parameters, pressing a key will trigger them as follows based on their sequential order in `parameters.json`:

1. `hintCooldownTime`
2. `startingHints`
3. `adsFrequencyMinutes`
4. `debugMode`

Pressing the same key multiple times will cycle through increasing parameter values based on the min/max ranges. The adjustment is applied via the `skillprintShim.js` script inside the iframe and displayed on the client using the `GameAdjustmentBanner`.

## Key mappings for testing

- **Key 1**: Set hint cooldown to 60.0 seconds (hard/slow hints).
- **Key 2**: Set hint cooldown to 15.0 seconds (default).
- **Key 3**: Set hint cooldown to 5.0 seconds (easy/fast hints).
- **Key 4**: Set starting hints to 1 (hard).
- **Key 5**: Set starting hints to 5 (default).
- **Key 6**: Set starting hints to 15 (easy).
- **Key 7**: Set ads interval to 10.0 minutes, disable debug mode (relaxed).
- **Key 8**: Set ads interval to 5.0 minutes, disable debug mode (default).
- **Key 9**: Set ads interval to 1.0 minute, enable debug mode (high frequency/arousal, show stats panel).

## Parameters

* **hintCooldownTime**: Time in seconds before hint recharges.
* **startingHints**: Initial hints given to the player.
* **adsFrequencyMinutes**: Frequency of ad interruptions.
* **debugMode**: Toggles debug overlay / Stats panel.
