# Game Adjustability Context

To make the generated game useful in our platform, it MUST support dynamic adjustment of key game parameters and include an interface for us to test these adjustments.

## 1. Discoverable Parameters
The game MUST define a set of adjustable parameters, typically as a global configuration object or properties on the window object. Think about parameters that control difficulty, speed, spawn rates, colors, etc. Examples: `hero_speed`, `enemy_spawn_rate`, `gravity`, etc.

## 2. Adjustment Interface
The game MUST implement a global `window.adjustGame` function exactly like this:

```javascript
window.adjustGame = function(obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        // Map the parameterName to your game's internal variable here
        // e.g. if (parameterName === 'hero_speed') { window.HERO_SPEED = parameterValue; }
        console.log(`Adjusted ${parameterName} to ${parameterValue}`);
    }
}
```

## 3. Announce Adjustments
Use the globally injected `window.Skillprint` library to register adjustments when the game loads. This automatically handles the keyboard testing keys (1-9) for you and reports adjustments to the parent window.

```javascript
window.Skillprint.registerAdjustments({
    '1': { parameterName: 'hero_speed', description: 'Decrease Hero Speed', value: 10 },
    '2': { parameterName: 'hero_speed', description: 'Increase Hero Speed', value: 20 }
    // ... add the rest of your bindings mapped to keys 1 to 9
});
```
Make sure you include this `registerAdjustments` call globally so that it executes immediately when the game loads!