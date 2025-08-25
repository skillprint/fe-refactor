/**
 * Skillprint Game Communication Library
 * 
 * This library provides utilities for games to communicate with the parent window
 * and trigger post-game results and other features.
 */

class SkillprintGameComm {
  constructor() {
    this.parentOrigin = window.location.origin;
    this.gameData = {
      score: 0,
      level: 1,
      achievements: [],
      accuracy: 100,
      mistakes: 0,
      bonus: 0
    };
  }

  /**
   * Send a message to the parent window
   */
  sendMessage(type, data = {}) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type,
        data: { ...this.gameData, ...data }
      }, this.parentOrigin);
    }
  }

  /**
   * Update the current game score
   */
  updateScore(score) {
    this.gameData.score = Math.max(0, Math.min(100, score));
    this.sendMessage('GAME_SCORE_UPDATE', { score: this.gameData.score });
  }

  /**
   * Update the current game level
   */
  updateLevel(level) {
    this.gameData.level = Math.max(1, level);
  }

  /**
   * Add an achievement
   */
  addAchievement(achievement) {
    if (!this.gameData.achievements.includes(achievement)) {
      this.gameData.achievements.push(achievement);
    }
  }

  /**
   * Update accuracy percentage
   */
  updateAccuracy(accuracy) {
    this.gameData.accuracy = Math.max(0, Math.min(100, accuracy));
  }

  /**
   * Increment mistake count
   */
  addMistake() {
    this.gameData.mistakes++;
  }

  /**
   * Add bonus points
   */
  addBonus(bonus) {
    this.gameData.bonus += bonus;
  }

  /**
   * Complete the game and show results
   */
  completeGame(finalData = {}) {
    const completionData = { ...this.gameData, ...finalData };
    this.sendMessage('GAME_COMPLETE', completionData);
  }

  /**
   * Pause the game
   */
  pauseGame() {
    this.sendMessage('GAME_PAUSE');
  }

  /**
   * Resume the game
   */
  resumeGame() {
    this.sendMessage('GAME_RESUME');
  }

  /**
   * Get current game data
   */
  getGameData() {
    return { ...this.gameData };
  }

  /**
   * Reset game data
   */
  resetGame() {
    this.gameData = {
      score: 0,
      level: 1,
      achievements: [],
      accuracy: 100,
      mistakes: 0,
      bonus: 0
    };
  }
}

// Create global instance
window.SkillprintGameComm = new SkillprintGameComm();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillprintGameComm;
}

// Example usage for games:
/*
// Initialize communication
const gameComm = window.SkillprintGameComm;

// Update score during gameplay
gameComm.updateScore(75);

// Add achievements
gameComm.addAchievement('First Level Complete');
gameComm.addAchievement('Speed Runner');

// Complete the game
gameComm.completeGame({
  score: 85,
  level: 3,
  accuracy: 92,
  mistakes: 2,
  bonus: 15
});
*/ 