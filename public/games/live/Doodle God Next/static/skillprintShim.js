// Intercept Canvas WebGL context creation to force preserveDrawingBuffer: true.
// This is required to capture screenshots of the WebGL canvas asynchronously.
(function () {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attributes) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
            attributes = attributes || {};
            if (attributes.preserveDrawingBuffer === undefined) {
                attributes.preserveDrawingBuffer = true;
            }
        }
        return originalGetContext.call(this, type, attributes);
    };
})();

// Doodle God Next has no difficulty knobs. The game logic is compiled into
// main.wasm, and the JS around it (main.js, src/*.js) exposes nothing about
// hints or progression: the hint recharge time and the starting hints are in
// the game's own data (e.g. commodity_hint1_reload_time_freeorblitz), read
// only inside the wasm. The one global the wasm reads back, window.AdsTimeout,
// times ads, which is not a difficulty lever. So every adjustment is
// reported and ignored. (The shim used to accept hintCooldownTime,
// startingHints, adsFrequencyMinutes and debugMode; the first two set
// variables nothing read, and debugMode loaded stats.js from a third-party
// site.)
window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
        console.warn('[skillprintShim] Doodle God Next has no adjustable parameters; ignored', obj.parameterName, obj.parameterValue);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim - Doodle God Next] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()

// Gameplay events. The game (main.wasm) reports its own analytics through
// window.DGWebAnalytics (src/web_analytics.js): analyticsEvent(provider, name,
// param), extendEvent(name, param), tutorialProgress(provider, progress) and
// analyticsVideoCountEvent(provider, name, param). Each call is also posted to
// the portal as {type: 'gameEvent', data: {event, at, ...}}: `event` is the
// game's name in UPPER_SNAKE_CASE, `param` its raw parameter, `value` that
// parameter as a number when it is one, and `params` the parameter parsed when
// it is a JSON object. The game's Dev2Dev extended events (D2D_EXTENDED_EVENT)
// carry their real name in params.eventId (e.g. new_collection_progress_reward),
// which becomes the event name. The game's own analytics are untouched.
(function forwardAnalytics() {
    const api = window.DGWebAnalytics;
    if (!api || typeof api.analyticsEvent !== 'function') {
        setTimeout(forwardAnalytics, 200);
        return;
    }
    if (api.__skillprintForwarded) return;
    api.__skillprintForwarded = true;

    const eventName = (name) => String(name || 'EVENT').trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase() || 'EVENT';
    const post = (event, fields) => {
        try {
            if (window.parent === window) return;
            const data = Object.assign({}, fields, { event, at: performance.timeOrigin + performance.now() });
            window.parent.postMessage({ type: 'gameEvent', data }, window.location.origin);
        } catch (e) { /* telemetry must never break the game */ }
    };
    const withParam = (provider, param) => {
        const fields = { provider: provider == null ? '' : String(provider), param: param == null ? '' : String(param) };
        if (fields.param !== '' && Number.isFinite(Number(fields.param))) fields.value = Number(fields.param);
        if (fields.param.trim().startsWith('{')) {
            try { const parsed = JSON.parse(fields.param); if (parsed && typeof parsed === 'object') fields.params = parsed; } catch (e) { /* not JSON */ }
        }
        return fields;
    };
    const named = (name, fields) => {
        const id = fields.params && typeof fields.params.eventId === 'string' ? fields.params.eventId : '';
        return [eventName(id || name), fields];
    };
    const wrap = (method, toEvent) => {
        const original = api[method];
        if (typeof original !== 'function') return;
        api[method] = function () {
            try { const [event, fields] = toEvent(arguments); post(event, fields); } catch (e) { /* ignore */ }
            return original.apply(this, arguments);
        };
    };
    // analyticsEvent and analyticsVideoCountEvent also accept (name, param) without a provider.
    const shift = (a) => a.length === 2 ? ['', a[0], a[1]] : [a[0], a[1], a[2]];
    wrap('analyticsEvent', (a) => { const [p, n, v] = shift(a); return named(n, withParam(p, v)); });
    wrap('analyticsVideoCountEvent', (a) => { const [p, n, v] = shift(a); return ['AD_VIDEO', Object.assign(withParam(p, v), { name: String(n || '') })]; });
    wrap('extendEvent', (a) => named(a[0], withParam('', a[1])));
    wrap('tutorialProgress', (a) => ['TUTORIAL_PROGRESS', withParam(a[0], a[1])]);
})();
