# Brick Out Skillprint Integration

This game has been integrated with the Skillprint SDK.

## Game Adjustments testing

The game parameters can be actively adjusted and tested using the keys `1` through `9`. When pressing a key, the `GameAdjustmentTester` will cycle sequentially through the parameters defined in `parameters.json`. 

Since Brick Out has 4 adjustable parameters, pressing a key will trigger them as follows based on their sequential order in the `parameter.json`:

1. `maxVelocityLimit`
2. `minVelocityLimit`
3. `timeBounceBall`
4. `maxBallSpawn`

Pressing the same key multiple times will cycle through increasing parameter values based on the min/max ranges. The adjustment is applied via the `skillprintShim.js` script inside the iframe and displayed on the client using the `GameAdjustmentBanner`.

## Parameters

* **maxVelocityLimit**: Maximum ball speed.
* **minVelocityLimit**: Minimum ball speed.
* **timeBounceBall**: Time delay for ball bounces.
* **maxBallSpawn**: Max number of balls spawned during a multi-ball power-up.
