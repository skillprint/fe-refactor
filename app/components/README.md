# Skillprint Components

This directory contains reusable React components for the Skillprint application.

## Components

### BottomTabs
Navigation component that provides bottom tab navigation throughout the app.

### FloatingExitButton
A floating exit button that can be positioned in different corners of the screen. Used in games to allow players to exit.

**Props:**
- `position`: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' (default: 'top-right')
- `color`: 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'gray' (default: 'red')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `customIcon`: Optional custom icon component
- `onClick`: Optional custom click handler (defaults to navigating to /games)

### GameResultsInterstitial
A modal component that displays post-game results including score, time, achievements, and other statistics.

**Props:**
- `gameSlug`: The slug/identifier of the game
- `results`: GameResults object containing:
  - `score`: Number (0-100)
  - `time`: Number (seconds)
  - `level`: Number
  - `achievements`: Array of achievement strings
  - `accuracy`: Number (percentage)
  - `mistakes`: Number
  - `bonus`: Number
- `onPlayAgain`: Callback function for playing again
- `onBackToGames`: Callback function for returning to games list
- `isEarlyExit`: Boolean indicating if the game was exited early (default: false)

**Early Exit Behavior:**
When a player exits a game early using the floating exit button, the results interstitial will show:
- Different header text ("Game Paused" vs "Game Complete!")
- Different icon (warning triangle vs checkmark)
- Different button text ("Continue Game" vs "Play Again")
- Progress made so far with encouraging achievements

## Game Integration

### Post-Game Results System

The Skillprint app includes a comprehensive post-game results system that games can integrate with. Here's how to use it:

#### Exit Button Behavior

The floating exit button now serves two purposes:

1. **During Gameplay**: Clicking the exit button will show the post-game results interstitial with current progress, allowing players to see what they've accomplished so far.

2. **After Completion**: If the game has already completed naturally, clicking the exit button will navigate directly back to the games list.

This provides a better user experience by:
- Allowing players to see their progress even when exiting early
- Encouraging them to continue playing to improve their score
- Providing closure and feedback for partial gameplay sessions

#### 1. Include the Communication Library

Add this script to your game's HTML:

```html
<script src="../../SkillprintLib/game-communication.js"></script>
```

#### 2. Initialize Communication

```javascript
const gameComm = window.SkillprintGameComm;
```

#### 3. Track Game Progress

```javascript
// Update score during gameplay
gameComm.updateScore(75);

// Track level progression
gameComm.updateLevel(3);

// Add achievements
gameComm.addAchievement('Speed Runner');
gameComm.addAchievement('Perfect Accuracy');

// Track mistakes
gameComm.addMistake();

// Add bonus points
gameComm.addBonus(15);

// Update accuracy
gameComm.updateAccuracy(92);
```

#### 4. Complete the Game

```javascript
gameComm.completeGame({
  score: 85,
  level: 3,
  accuracy: 92,
  mistakes: 2,
  bonus: 15
});
```

#### 5. Available Methods

- `updateScore(score)`: Update current score (0-100)
- `updateLevel(level)`: Update current level
- `addAchievement(achievement)`: Add an achievement
- `updateAccuracy(accuracy)`: Update accuracy percentage
- `addMistake()`: Increment mistake count
- `addBonus(bonus)`: Add bonus points
- `completeGame(finalData)`: Complete the game and show results
- `pauseGame()`: Pause the game
- `resumeGame()`: Resume the game
- `getGameData()`: Get current game data
- `resetGame()`: Reset game data

#### 6. Message Types

The system listens for these message types from games:

- `GAME_COMPLETE`: Game has finished, show results
- `GAME_PAUSE`: Game is paused
- `GAME_RESUME`: Game has resumed
- `GAME_SCORE_UPDATE`: Real-time score update

### Example Integration

See `public/games/demo-game/index.html` for a complete example of how to integrate with the post-game results system.

### Demo Game

A demo game is available at `/games/demo-game/` that demonstrates all the features of the post-game results system. You can:

1. Add points and progress through levels
2. Track mistakes and accuracy
3. Earn achievements and bonus points
4. Complete the game to see the results interstitial
5. Test the "Play Again" and navigation functionality

## Styling

All components use Tailwind CSS for styling and support both light and dark themes. The components automatically adapt to the current theme based on CSS classes.

## Accessibility

Components include proper ARIA labels and keyboard navigation support where applicable. 