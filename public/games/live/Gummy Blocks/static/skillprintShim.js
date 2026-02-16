// Gummy Blocks Parameter Adjustment Shim
// This function allows external control of game parameters via iframe communication
//
// Available parameters:
// 1. "boardRows" - Number of rows on the game board (default: 10)
//                  Lower values make the game harder (less space)
// 2. "boardCols" - Number of columns on the game board (default: 10)
//                  Lower values make the game harder (less space)
// 3. "piecesToPlace" - Number of pieces available before spawning new ones (default: 3)
//                      Lower values make the game harder (fewer options)
// 4. "scoreMultiplier" - Multiplier for scoring (default: 1.0)
//                        Lower values make it harder to achieve high scores
// 5. "gameSpeed" - FPS/game speed (default: 30)
//                  Higher values make the game faster/harder
//
// Example usage:
// adjustment: {
//   "parameterName": "piecesToPlace",
//   "parameterValue": 2
// }

window.adjustGame = function(obj) {
    if(typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        // Validate that the value is a number
        if (typeof parameterValue !== 'number' || isNaN(parameterValue)) {
            console.warn('Invalid parameter value for', parameterName, ':', parameterValue);
            return;
        }

        switch(parameterName) {
            case "boardRows":
                // Adjust number of rows (min 5, max 12)
                if (parameterValue >= 5 && parameterValue <= 12) {
                    window.NUM_ROWS = Math.floor(parameterValue);
                    console.log('Board rows set to:', window.NUM_ROWS);
                } else {
                    console.warn('boardRows must be between 5 and 12');
                }
                break;

            case "boardCols":
                // Adjust number of columns (min 5, max 12)
                if (parameterValue >= 5 && parameterValue <= 12) {
                    window.NUM_COLS = Math.floor(parameterValue);
                    console.log('Board cols set to:', window.NUM_COLS);
                } else {
                    console.warn('boardCols must be between 5 and 12');
                }
                break;

            case "piecesToPlace":
                // Adjust number of pieces available (min 1, max 5)
                if (parameterValue >= 1 && parameterValue <= 5) {
                    window.PIECE_TO_PLACE = Math.floor(parameterValue);
                    console.log('Pieces to place set to:', window.PIECE_TO_PLACE);
                } else {
                    console.warn('piecesToPlace must be between 1 and 5');
                }
                break;

            case "scoreMultiplier":
                // Add a global score multiplier (min 0.1, max 3.0)
                if (parameterValue >= 0.1 && parameterValue <= 3.0) {
                    window.SCORE_MULTIPLIER = parameterValue;
                    console.log('Score multiplier set to:', window.SCORE_MULTIPLIER);
                } else {
                    console.warn('scoreMultiplier must be between 0.1 and 3.0');
                }
                break;

            case "gameSpeed":
                // Adjust FPS (min 15, max 60)
                if (parameterValue >= 15 && parameterValue <= 60) {
                    window.FPS = Math.floor(parameterValue);
                    // Note: FPS change would need to restart the game ticker to take effect
                    console.log('Game speed (FPS) set to:', window.FPS);
                } else {
                    console.warn('gameSpeed must be between 15 and 60');
                }
                break;

            default:
                console.warn('Unknown parameter:', parameterName);
                break;
        }
    } else {
        console.warn('Invalid adjustment object. Expected object with parameterName and parameterValue properties.');
    }
}

// Initialize score multiplier if not set
if (typeof window.SCORE_MULTIPLIER === 'undefined') {
    window.SCORE_MULTIPLIER = 1.0;
}

