// Om Nom Run Skillprint shim.
//
// Gameplay events: the game (PlayCanvas, obfuscated __game-scripts.js) reports
// its progress through the Famobi API, famobi_analytics.trackEvent(type,
// params). Famobi's local SDK interface (sdk_interface.js) replaces that
// function with SDK_INTERFACE_OVERRIDES.famobi_analytics.trackEvent, which calls
// window.skillprintTrackEvent. This script (loaded before the API snippet)
// defines it to post each event to the portal as
// {type: 'gameEvent', data: {event, at, ...params}}: the message
// GameClient records. `at` is when it happened, in epoch ms. Famobi's names map
// to the SDK's universal ones where they match; EVENT_LIVESCORE (the running
// score) is sent at most once a second, and any score still held back is sent
// before the next other event.
//
// The game takes no ADJUST_GAME parameters yet; keys 1-9 are forwarded for the
// GameAdjustmentTester.
(function () {
    const NAMES = {
        EVENT_LEVELSTART: 'LEVEL_START',
        EVENT_LEVELRESTART: 'LEVEL_RESTART',
        EVENT_LEVELSUCCESS: 'LEVEL_COMPLETE',
        EVENT_LEVELFAIL: 'LEVEL_FAILED',
        EVENT_PAUSE: 'GAME_PAUSE',
        EVENT_RESUME: 'GAME_RESUME',
        EVENT_LEVELSCORE: 'LEVEL_SCORE',
        EVENT_TOTALSCORE: 'TOTAL_SCORE',
        EVENT_LIVESCORE: 'LIVE_SCORE',
        EVENT_TUTORIALCOMPLETED: 'TUTORIAL_COMPLETED',
        EVENT_TUTORIALSKIPPED: 'TUTORIAL_SKIPPED',
        EVENT_CUSTOM: 'CUSTOM',
    };
    const LIVE_SCORE_MS = 1000;
    let lastLiveScoreAt = -Infinity, pendingLiveScore = null, liveScoreTimer = null;

    function post(event, params) {
        try {
            if (window.parent === window) return;
            const data = Object.assign({}, params, { event, at: performance.timeOrigin + performance.now() });
            window.parent.postMessage({ type: 'gameEvent', data }, window.location.origin);
        } catch (e) { /* telemetry must never break the game */ }
    }

    function sendLiveScore() {
        liveScoreTimer = null;
        lastLiveScoreAt = performance.now();
        post('LIVE_SCORE', pendingLiveScore);
    }

    function onTrackEvent(type, params) {
        const event = NAMES[type];
        if (!event) return; // EVENT_VOLUMECHANGE and anything unknown
        const fields = params && typeof params === 'object' ? params : {};
        if (event === 'LIVE_SCORE') {
            pendingLiveScore = fields;
            if (liveScoreTimer === null) {
                liveScoreTimer = setTimeout(sendLiveScore, Math.max(0, LIVE_SCORE_MS - (performance.now() - lastLiveScoreAt)));
            }
            return;
        }
        // A score still waiting on the throttle belongs before this event.
        if (liveScoreTimer !== null) {
            clearTimeout(liveScoreTimer);
            sendLiveScore();
        }
        post(event, fields);
    }

    window.skillprintTrackEvent = onTrackEvent;

    // Forward keydown events to the parent window for the GameAdjustmentTester
    window.addEventListener('keydown', function (event) {
        if (/^[1-9]$/.test(event.key)) {
            window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
        }
    }, true); // Use capture phase to intercept before the game calls preventDefault()
})();
