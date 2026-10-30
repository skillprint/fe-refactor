// "adjustment": {
// "parameterName": "drawCount",
// "parameterValue": 3
// }
// drawCount controls how many cards are dealt from the stock per click.
// 1 = Draw One (easy/relaxed), 3 = classic Draw Three (hard).

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        if (parameterName === "drawCount") {
            window.__solitaireDrawCount = parameterValue;
        }
    }
}

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim - Solitaire] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()

// Score for the Skillprint shell: cards moved to the foundations (0–52), so
// a won game scores 52 and an abandoned one scores its progress. `piles` is
// the page's own top-level binding; the shell's poller tolerates it not
// existing yet.
window.SKILLPRINT_STATE = function () {
    const done = piles.foundations.reduce((n, f) => n + f.length, 0);
    return { score: done, isGameOver: done === 52 };
};
