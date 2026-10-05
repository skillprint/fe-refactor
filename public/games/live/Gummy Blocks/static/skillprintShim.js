// Gummy Blocks Parameter Adjustment Shim
// This function allows external control of game parameters via iframe communication
//
// Available parameters:
// 1. "maxPieceCells" - Largest piece dealt, in cells (default: 9, every shape)
//                      3 deals only 1-3 cell pieces; 4 adds the 2x2 and 4-long
//                      bars; 5 adds the 5-long bars and big Ls (6-8 behave as 5);
//                      9 adds the 3x3 block. Lower values make the game easier.
//                      Takes effect on the next pieces dealt.
// 2. "piecesToPlace" - Pieces placed before the tray refills its empty slots (default: 3)
//                      1 refills after every placement, so there are always three
//                      to choose from; 3 means using up the whole tray first.
//                      Higher values make the game harder.
// 3. "scoreMultiplier" - Multiplier for scoring (default: 1.0)
//                        Lower values make it harder to achieve high scores
//
// "boardRows", "boardCols" and "gameSpeed" are accepted and ignored: the board
// arrays and artwork are built once for 10x10, so resizing mid-game breaks the
// board, and FPS has no effect on a puzzle with no timer.
//
// Example usage:
// adjustment: {
//   "parameterName": "piecesToPlace",
//   "parameterValue": 2
// }

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        // Validate that the value is a number
        if (typeof parameterValue !== 'number' || isNaN(parameterValue)) {
            console.warn('Invalid parameter value for', parameterName, ':', parameterValue);
            return;
        }

        switch (parameterName) {
            case "maxPieceCells":
                // 3-9; below 3 the pool is too small to be a game
                if (parameterValue >= 3 && parameterValue <= 9) {
                    window.MAX_PIECE_CELLS = Math.floor(parameterValue);
                    console.log('Max piece cells set to:', window.MAX_PIECE_CELLS);
                } else {
                    console.warn('maxPieceCells must be between 3 and 9');
                }
                break;

            case "piecesToPlace":
                // 1-3; the tray has three slots. Rejected rather than clamped: the
                // backend's legacy rules send 4-5 for relax, which would clamp to the
                // hardest setting.
                if (parameterValue >= 1 && parameterValue <= 3) {
                    window.PIECE_TO_PLACE = Math.floor(parameterValue);
                    console.log('Pieces to place set to:', window.PIECE_TO_PLACE);
                } else {
                    console.warn('piecesToPlace must be between 1 and 3');
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

            case "boardRows":
            case "boardCols":
            case "gameSpeed":
                console.warn('Ignoring', parameterName, '- it cannot change safely mid-game');
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

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

// The AI Guide opens its session on the player's first input
window.addEventListener('pointerdown', function () {
    window.parent.postMessage({ type: 'skillprint_mousedown' }, '*');
}, true);

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim - Gummy Blocks] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
