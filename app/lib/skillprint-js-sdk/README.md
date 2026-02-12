# Skillprint JavaScript SDK

A comprehensive JavaScript SDK for integrating Skillprint's dynamic gameplay adjustment system into web-based games. This SDK is compatible with all major JavaScript game engines including Phaser, Three.js, PixiJS, Babylon.js, and generic Canvas applications.

## Features

- 📸 **Automatic Screenshot Capture** - Captures gameplay screenshots at configurable intervals
- 🔄 **Real-time Parameter Updates** - Receives and applies gameplay parameter adjustments from Skillprint's AI
- 🎮 **Multi-Engine Support** - Built-in adapters for popular game engines
- 🌐 **WebGL Ready** - Supports URL parameter extraction for web deployments
- ⚡ **Performance Optimized** - Efficient screenshot handling and API communication
- 🛠️ **TypeScript Ready** - Full TypeScript definitions available
- 📱 **Modern Web APIs** - Uses fetch, Canvas API, and modern JavaScript features

## Supported Game Engines

- **Phaser.js** (2.x and 3.x)
- **Three.js**
- **PixiJS** (6.x and 7.x)
- **Babylon.js**
- **PlayCanvas**
- **A-Frame**
- **Generic Canvas** (2D Context)
- **Any JavaScript game engine** with canvas support

## Installation

### NPM (Recommended)

```bash
npm install skillprint-js-sdk
```

### CDN

```html
<!-- ES Module -->
<script type="module">
  import { SkillprintManager, SkillprintConfig } from 'https://cdn.jsdelivr.net/npm/skillprint-js-sdk/dist/skillprint-sdk.esm.js';
</script>

<!-- UMD (Global) -->
<script src="https://cdn.jsdelivr.net/npm/skillprint-js-sdk/dist/skillprint-sdk.min.js"></script>
```

### Direct Download

Download the latest release from [GitHub Releases](https://github.com/skillprint/skillprint-js-sdk/releases)

## Quick Start

### 1. Basic Setup

```javascript
import { 
  SkillprintConfig, 
  SkillprintManager, 
  ParameterDefinition, 
  ParameterType, 
  Mood 
} from 'skillprint-js-sdk';

// Create configuration
const config = new SkillprintConfig({
  gameName: 'my-awesome-game',
  targetEnvironment: 'production',
  productionPartnerApiKey: 'your-api-key-here',
  productionApiBaseUrl: 'https://api.skillprint.com/v1',
  enableDebugLogging: true,
  gameParameters: [
    new ParameterDefinition({
      parameterName: 'difficulty',
      description: 'Game difficulty level',
      type: ParameterType.FLOAT,
      minValue: 0.5,
      maxValue: 2.0,
      defaultValue: '1.0'
    })
  ]
});

// Initialize SDK
const manager = new SkillprintManager(config, () => document.getElementById('gameCanvas'));

// Register parameter handlers
manager.registerParameterModifier('difficulty', (value) => {
  console.log(`Difficulty adjusted to: ${value}`);
  // Update your game's difficulty here
});

// Start session
manager.startGameSession(Mood.FOCUS, 'player123');
```

### 2. Phaser.js Integration

```javascript
import { PhaserSkillprintAdapter, SkillprintConfig, Mood } from 'skillprint-js-sdk';

class GameScene extends Phaser.Scene {
  create() {
    // Initialize Skillprint
    const config = new SkillprintConfig({
      gameName: 'my-phaser-game',
      productionPartnerApiKey: 'your-api-key',
      gameParameters: [/* your parameters */]
    });

    this.skillprint = PhaserSkillprintAdapter.create(this, config);
    
    // Register parameters
    this.skillprint.registerParameter('enemySpeed', (value) => {
      this.enemySpeed = value;
    });

    // Start session
    this.skillprint.startSession(Mood.FOCUS);
  }
}
```

### 3. Three.js Integration

```javascript
import { ThreeSkillprintAdapter, SkillprintConfig } from 'skillprint-js-sdk';

// After creating your Three.js renderer
const skillprint = ThreeSkillprintAdapter.create(renderer, config);

// Register object property updates
skillprint.registerObjectProperty('lightIntensity', directionalLight, 'intensity');

// Start session
skillprint.startSession(Mood.CREATIVITY);
```

## Configuration

### SkillprintConfig Options

```javascript
const config = new SkillprintConfig({
  // Required
  gameName: 'your-game-slug',                    // Game identifier in Skillprint
  productionPartnerApiKey: 'your-api-key',       // Your Skillprint API key
  
  // Optional
  targetEnvironment: 'production',                // 'production' or 'staging'
  productionApiBaseUrl: 'https://api.skillprint.com/v1',
  stagingPartnerApiKey: 'staging-key',            // Optional staging key
  stagingApiBaseUrl: 'https://staging-api.skillprint.com/v1',
  
  // Behavior
  screenshotIntervalSeconds: 2.0,                 // How often to capture screenshots
  screenshotPostIntervalSeconds: 5.0,             // How often to send screenshots
  pollResultsIntervalSeconds: 5.0,                // How often to check for updates
  enableDebugLogging: false,                      // Enable debug logs
  
  // Game Parameters
  gameParameters: [/* ParameterDefinition array */]
});
```

### Parameter Definition

```javascript
import { ParameterDefinition, ParameterType } from 'skillprint-js-sdk';

const parameter = new ParameterDefinition({
  parameterName: 'jumpHeight',              // Unique identifier
  description: 'Player jump height',        // Human-readable description
  howSDKChangesIt: 'Adjusts based on skill', // How Skillprint modifies it
  type: ParameterType.FLOAT,                // FLOAT, INTEGER, or BOOLEAN
  minValue: 50,                             // Minimum value (for numeric types)
  maxValue: 200,                            // Maximum value (for numeric types)
  defaultValue: '100'                       // Default value as string
});
```

## Mood Types

Skillprint supports different mood targets for gameplay optimization:

```javascript
import { Mood } from 'skillprint-js-sdk';

// Available moods:
Mood.RELAX      // Calming, stress-reducing gameplay
Mood.FOCUS      // Concentration and attention
Mood.CREATIVITY // Creative thinking and exploration
Mood.COLLABORATE // Social interaction and teamwork
Mood.GRIT       // Persistence and determination
Mood.JOY        // Fun and positive emotions
Mood.CURIOSITY  // Exploration and learning
Mood.EMPATHY    // Understanding and connection
Mood.AWE        // Wonder and inspiration
```

## Engine-Specific Adapters

### Phaser.js

```javascript
import { PhaserSkillprintAdapter } from 'skillprint-js-sdk';

const skillprint = PhaserSkillprintAdapter.create(scene, config);

// Helper methods
skillprint.registerSpriteProperty('playerScale', playerSprite, 'scale');
skillprint.registerParameter('customParam', updateFunction);
```

### Three.js

```javascript
import { ThreeSkillprintAdapter } from 'skillprint-js-sdk';

const skillprint = ThreeSkillprintAdapter.create(renderer, config);

// Helper methods
skillprint.registerObjectProperty('lightIntensity', light, 'intensity');
skillprint.registerObjectProperty('materialColor', material, 'color.r');
```

### PixiJS

```javascript
import { PixiSkillprintAdapter } from 'skillprint-js-sdk';

const skillprint = PixiSkillprintAdapter.create(app, config);

// Helper methods
skillprint.registerDisplayObjectProperty('spriteAlpha', sprite, 'alpha');
skillprint.registerParameter('customParam', updateFunction);
```

### Generic Canvas

```javascript
import { GenericCanvasSkillprintAdapter } from 'skillprint-js-sdk';

const canvas = document.getElementById('gameCanvas');
const skillprint = GenericCanvasSkillprintAdapter.create(canvas, config);
```

## URL Parameters (WebGL Builds)

For web games, the SDK can automatically extract session parameters from the URL:

```javascript
// URL: https://yourgame.com?mood=focus&playerId=user123

// Automatic URL parameter detection
manager.startGameSessionFromUrl('defaultMood', 'defaultPlayer');

// With overrides
manager.startGameSessionWithOverrides(
  'fallbackMood',     // Fallback if not in URL
  'fallbackPlayer',   // Fallback player ID
  'forcedMood',       // Override URL mood
  'forcedPlayer'      // Override URL player
);

// Get URL parameter info
console.log(manager.getUrlParametersInfo());
```

## Screenshot Handling

The SDK automatically handles screenshot capture with several options:

```javascript
// Custom screenshot options in ScreenshotUtility
const screenshot = await screenshotUtility.captureScreenshot(canvas, {
  format: 'image/jpeg',    // 'image/jpeg' or 'image/png'
  quality: 0.8,            // JPEG quality (0.0 - 1.0)
  maxWidth: 1920,          // Optional max width
  maxHeight: 1080          // Optional max height
});

// For WebGL contexts that don't preserve drawing buffer
const webglScreenshot = await screenshotUtility.captureScreenshotWebGL(gl, canvas);
```

## Error Handling

```javascript
try {
  await manager.startGameSession(Mood.FOCUS, 'player123');
} catch (error) {
  console.error('Failed to start Skillprint session:', error);
  // Handle error - game should continue to work without Skillprint
}

// The SDK is designed to fail gracefully
// If Skillprint is unavailable, your game continues normally
```

## Best Practices

### 1. Parameter Registration

```javascript
// Register all parameters before starting session
manager.registerParameterModifier('difficulty', (value) => {
  // Validate the value
  if (value >= 0.5 && value <= 2.0) {
    this.gameDifficulty = value;
    this.updateEnemyBehavior();
  }
});
```

### 2. Session Management

```javascript
// Start session after game is fully loaded
window.addEventListener('load', () => {
  manager.startGameSession(Mood.FOCUS);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  manager.stopGameSession();
});
```

### 3. Canvas Provider

```javascript
// Ensure canvas provider returns the correct canvas
const canvasProvider = () => {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.warn('Game canvas not found');
    return null;
  }
  return canvas;
};

const manager = new SkillprintManager(config, canvasProvider);
```

### 4. Environment Configuration

```javascript
// Use environment variables for API keys
const config = new SkillprintConfig({
  gameName: 'my-game',
  targetEnvironment: process.env.NODE_ENV === 'production' ? 'production' : 'staging',
  productionPartnerApiKey: process.env.SKILLPRINT_PROD_KEY,
  stagingPartnerApiKey: process.env.SKILLPRINT_STAGING_KEY,
  enableDebugLogging: process.env.NODE_ENV !== 'production'
});
```

## API Reference

### SkillprintManager

Main SDK class for managing Skillprint integration.

#### Methods

- `registerParameterModifier(name, action, type)` - Register parameter update handler
- `startGameSession(mood, playerId)` - Start Skillprint session
- `stopGameSession()` - Stop current session
- `getCurrentSessionId()` - Get current session ID
- `getConfig()` - Get configuration object
- `log(message, level)` - Log message with level

### SkillprintConfig

Configuration object for SDK initialization.

### ParameterDefinition

Defines a game parameter that Skillprint can modify.

### Engine Adapters

- `PhaserSkillprintAdapter` - Phaser.js integration
- `ThreeSkillprintAdapter` - Three.js integration  
- `PixiSkillprintAdapter` - PixiJS integration
- `GenericCanvasSkillprintAdapter` - Generic canvas integration

## Troubleshooting

### Common Issues

1. **Screenshots not capturing**
   - Ensure canvas is visible and has content
   - Check browser console for errors
   - Verify canvas provider returns correct element

2. **Parameter updates not working**
   - Confirm parameters are registered before starting session
   - Check parameter names match configuration
   - Verify parameter types and ranges

3. **Session fails to start**
   - Verify API key is correct
   - Check network connectivity
   - Ensure game name is registered in Skillprint

4. **CORS errors**
   - Skillprint API includes proper CORS headers
   - If using local development, API should work
   - Contact Skillprint support if issues persist

### Debug Mode

Enable debug logging to see detailed SDK operation:

```javascript
const config = new SkillprintConfig({
  enableDebugLogging: true,
  // ... other options
});
```

## Browser Compatibility

- **Chrome 80+**
- **Firefox 75+** 
- **Safari 13+**
- **Edge 80+**

### Required Features
- Fetch API
- Canvas API
- Promise/async-await
- ES6 Modules (for ES module builds)

## Performance Considerations

- Screenshots are captured asynchronously to avoid blocking the game loop
- Screenshot queue is limited to prevent memory issues
- Network requests are throttled to avoid overwhelming the API
- Failed API calls don't interrupt gameplay

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

See CONTRIBUTING.md for detailed guidelines.

---

**Made with ❤️ by Skillprint Inc.**