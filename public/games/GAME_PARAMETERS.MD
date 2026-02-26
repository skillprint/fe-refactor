# Skillprint Adaptive Game Parameters
This file documents all variables mapped per instrumented game to the `ADJUST_GAME` parent `postMessage` listener. Adjustments can be sent globally from the wrapper `GameAdjustmentTester` or the Skillprint adaptive engine.

## Supported Games

### Box Tower
Controls the side-to-side scrolling velocity of the active dropping block, as well as the alignment threshold for scoring a perfect placement.

**Parameters**
- `stackVelocity` (Number): Global scrolling speed modifier. Default is ~15.
- `perfectRange` (Number): Allowed padding around the previous underlying tower block to trigger a perfect drop. Default is 1.

**JSON Payload Example**
```json
{
  "parameterName": "stackVelocity",
  "parameterValue": 25
}
```

```json
{
  "parameterName": "perfectRange",
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ stackVelocity: 5 }` (Very Slow)
- `2`: `{ stackVelocity: 15 }` (Default)
- `3`: `{ stackVelocity: 35 }` (Fast)
- `4`: `{ perfectRange: 0.1 }` (Extremely hard perfects)
- `5`: `{ perfectRange: 1 }` (Default)
- `6`: `{ perfectRange: 10 }` (Easy perfects)
- `7`: `{ stackVelocity: 10, perfectRange: 5 }` (Slower, forgiving)
- `8`: `{ stackVelocity: 20, perfectRange: 2 }` (Faster, little more forgiving)
- `9`: `{ stackVelocity: 40, perfectRange: 0 }` (Extremely fast, no forgiving)

---

### Hextris
Controls the rate at which newly generated hexagonal blocks fall towards the center, as well as the leniency of chaining block break combinations.

**Parameters**
- `speedModifier` (Number): Controls the uniform falling rate of new pieces clamping inwards. Default is 1.
- `comboTime` (Number): Multiplier window duration padding. Default is ~200.

**JSON Payload Example**
```json
{
  "parameterName": "speedModifier",
  "parameterValue": 1.5
}
```

```json
{
  "parameterName": "comboTime",
  "parameterValue": 100
}
```

**Keyboard Test Utility Mapping (`GameAdjustmentTester`)**
- `1`: `{ comboTime: 1000 }` (Very long combo time)
- `2`: `{ speedModifier: 0.5 }` (Slow shapes)
- `3`: `{ comboTime: 1000, speedModifier: 0.5 }` (Complete easy mode)
- `4`: `{ speedModifier: 1 }` (Default speed)
- `5`: `{ comboTime: 200 }` (Default combo)
- `6`: `{ speedModifier: 1.5, comboTime: 100 }` (Fast and challenging)
- `7`: `{ speedModifier: 2 }` (Very fast)
- `8`: `{ speedModifier: 3 }` (Ludicrous speed)
- `9`: `{ speedModifier: 4, comboTime: 50 }` (Impossible mode)
