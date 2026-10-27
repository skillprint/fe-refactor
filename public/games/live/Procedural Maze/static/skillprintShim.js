// "adjustment": { "parameterName": "mazeSize", "parameterValue": 15 }
// mazeSize: 5-31 cells per side (regenerates the maze). fogRadius: 0 = whole maze visible,
// 1-8 = only cells within that distance of the player are drawn.
window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const c = window.__mazeControls;
        if (!c) return;
        if (parameterName === "mazeSize") c.setMazeSize(parameterValue);
        else if (parameterName === "fogRadius") c.setFogRadius(parameterValue);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') window.adjustGame(event.data.data);
});

window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true);

// Score for the Skillprint shell: mazes solved this visit. The run is
// endless (a solved maze starts the next), so it is never over.
window.SKILLPRINT_STATE = function () {
    return { score: window.__mazeState.solved, isGameOver: false };
};
