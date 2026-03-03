# Game Adjustability Context

To make the generated game useful in our platform, it MUST support dynamic adjustment of key game parameters and include an interface for us to test these adjustments.

## 1. Discoverable Parameters
The game MUST define a set of adjustable parameters, typically as a global configuration object or properties on the window object. Think about parameters that control difficulty, speed, spawn rates, colors, etc. Examples: \`hero_speed\`, \`enemy_spawn_rate\`, \`gravity\`, etc.

## 2. Adjustment Interface
The game MUST implement a global \`window.adjustGame\` function exactly like this:

\`\`\`javascript
window.adjustGame = function(obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        // Map the parameterName to your game's internal variable
        // e.g. if (parameterName === 'hero_speed') { window.HERO_SPEED = parameterValue; }
        console.log(\`Adjusted \${parameterName} to \${parameterValue}\`);
    }
}
\`\`\`
Make sure the game logic correctly utilizes these adjusted values.

## 3. Adjustment Testing via keys 1-9
To allow developers to easily test the game's adjustability, the game MUST include an event listener for the \`keydown\` event. When any of the number keys 1 through 9 are pressed, the game should invoke \`window.adjustGame\` with a predefined, meaningful test value for one of your adjustable parameters.

Example:
\`\`\`javascript
window.addEventListener('keydown', function(event) {
    if (event.key === '1') {
        window.adjustGame({ parameterName: 'hero_speed', parameterValue: 10 });
    } else if (event.key === '2') {
        window.adjustGame({ parameterName: 'hero_speed', parameterValue: 20 });
    }
    // ... add meaningful test bindings for keys 1-9 covering your parameters
});
\`\`\`

Ensure you include this testing code so that simply pressing 1-9 in the browser will alter the live game state.
    