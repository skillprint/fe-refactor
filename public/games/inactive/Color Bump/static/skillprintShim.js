window.__skillprint_speed = 1;

const originalPerfNow = performance.now;
let perfOffset = originalPerfNow.call(performance);
let lastRealTime = perfOffset;

performance.now = function () {
    const realTime = originalPerfNow.call(performance);
    const delta = realTime - lastRealTime;
    perfOffset += delta * window.__skillprint_speed;
    lastRealTime = realTime;
    return perfOffset;
};

const originalDateNow = Date.now;
let dateOffset = originalDateNow.call(Date);
let lastDateRealTime = dateOffset;

Date.now = function () {
    const realTime = originalDateNow.call(Date);
    const delta = realTime - lastDateRealTime;
    dateOffset += delta * window.__skillprint_speed;
    lastDateRealTime = realTime;
    return Math.floor(dateOffset);
};

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        if (parameterName === "speedModifier") {
            window.__skillprint_speed = parameterValue;
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
        console.log('[skillprintShim] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true);
