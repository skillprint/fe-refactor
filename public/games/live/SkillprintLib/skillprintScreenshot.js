// let skillprintScreenshotSlement;

const addToLocalStorage = (key, value) => {
    localStorage.setItem(key, value);
}

const getQueryParamValue = (key) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
}

const getScreenshotFrequency = () => {
    const frequency = getQueryParamValue('screenshotFrequency');
    return frequency ? parseInt(frequency) : 500;
}

const shouldLogDataUrl = () => {
    return true;
    const logDataUrl = getQueryParamValue('logDataUrl');
    return logDataUrl === 'true' || true;
}

// The game's folder (live/<folder>/static/index.html), matched by name so the
// same check works on the portal's /games/live/ and on the games CDN.
const getGameFolder = () => {
    const segments = decodeURIComponent(window.location.pathname).split('/');
    const staticAt = segments.lastIndexOf('static');
    return staticAt > 0 ? segments[staticAt - 1] : null;
}

const getElementForScreenshot = () => {
    const urlPath = window.location.pathname;

    const canvasGameFolders = [
        'Garden Match',
        'Box Tower',
        'Change Word',
        'Flapcat Steampunk',
        // 'Fruit Boom',
        'Fruit Sorting',
        'Gummy Blocks',
        'Impossible 10',
        'Mahjong Deluxe',
        'Space Trip',
        'Brick Out',
    ];

    if (canvasGameFolders.includes(getGameFolder())) {
        // console.log("using canvas");
        return document.getElementsByTagName('canvas')[0];
    } else if (urlPath.endsWith('/SkillprintLib/skillprint.html')) {
        // console.log("using body");
        return document.body;
    }

    // A game whose canvas is positioned out of the flow leaves the body
    // shorter than the canvas, often 0px tall, and a capture of the body is
    // empty ("data:,"). Capture the canvas instead.
    const canvas = document.getElementsByTagName('canvas')[0];
    if (canvas && document.body.clientHeight < canvas.clientHeight) {
        return canvas;
    }

    return document.body;
}

// Player inputs since the last screenshot. The portal can't listen to a frame
// on the games CDN, so each screenshot carries the count (NEW-30). Capture
// phase sees every event before a game can stop it.
let skillprintInputCount = 0;
['keydown', 'pointerdown', 'pointermove', 'touchstart', 'wheel'].forEach((type) => {
    window.addEventListener(type, () => { skillprintInputCount += 1; }, { capture: true, passive: true });
});

const takeScreenshot = async () => {
    // When the frame was taken, in epoch ms (the parent page's clock reads the
    // same). Rasterising takes a while, so the parent can't time it on arrival.
    const capturedAt = typeof performance !== 'undefined' && performance.timeOrigin
        ? performance.timeOrigin + performance.now()
        : Date.now();
    const inputCount = skillprintInputCount;
    skillprintInputCount = 0;
    const skillprintScreenshotSlement = getElementForScreenshot();
    // console.log(skillprintScreenshotSlement);

    const options = {
        allowTaint: true,
        useCORS: true,
        // foreignObjectRendering: true,
        x: skillprintScreenshotSlement.offsetLeft,
        y: skillprintScreenshotSlement.offsetTop,
        width: skillprintScreenshotSlement.clientWidth,
        height: skillprintScreenshotSlement.clientHeight,
        windowWidth: skillprintScreenshotSlement.clientWidth,
        windowHeight: skillprintScreenshotSlement.clientHeight,
        removeContainer: true,
        scale: 1,
        logging: false,
    }

    html2canvas(skillprintScreenshotSlement, options).then(canvas => {
        const dataUrl = canvas.toDataURL("image/jpeg");
        // console.log("Transmitting screenshot to parent");

        if (shouldLogDataUrl()) {
            // console.log("" + dataUrl);
            // log dataUrl to localstorage
            addToLocalStorage('screenshot', dataUrl);
        }

        window.parent.postMessage({ type: 'screenshot', dataUrl, capturedAt, inputCount }, "*");
    })
}

// when document is ready
document.addEventListener('DOMContentLoaded', function () {
    const screenshotFrequency = getScreenshotFrequency();
    // skillprintScreenshotSlement = document.body;

    setInterval(() => {
        takeScreenshot();
    }, 2500);
});

// Legacy telemetry bridge (fe-refactor#45). Games from before the portal call
// a global logEvent({event, ...fields}); their index.html defines a stub that
// queues those calls until this script loads. This turns each one into the
// message GameClient.tsx's 'gameEvent' case reads, the same one Hextris's
// Skillprint.send posts: {type: 'gameEvent', data: {event, at, ...fields}},
// with `at` when it happened in epoch ms (performance.timeOrigin +
// performance.now(), the clock the portal reads too).
//
// Only the page that framed the game gets it, and it never throws into the game.
(function () {
    // That page's origin: the portal's, which differs from the game's when the
    // game is on the games CDN. ancestorOrigins has it where the browser
    // supports it; the referrer carries it otherwise.
    var parentOrigin = function () {
        try {
            if (location.ancestorOrigins && location.ancestorOrigins.length) return location.ancestorOrigins[0];
            if (document.referrer) return new URL(document.referrer).origin;
        } catch (e) {}
        return window.location.origin;
    };

    // Legacy names for universal events (the SDK's GameEvent). The original
    // name is kept in `legacyEvent`.
    var UNIVERSAL_NAMES = {
        HINT_USED: 'HINT',
        LEVEL_PASSED: 'LEVEL_COMPLETE',
        LEVEL_WON: 'LEVEL_COMPLETE',
    };
    // Set by the old transport, or stamped by the portal itself.
    var TRANSPORT_FIELDS = ['messageType', 'timestamp', 'at'];

    var now = function () {
        return typeof performance !== 'undefined' && performance.timeOrigin
            ? performance.timeOrigin + performance.now()
            : Date.now();
    };

    // `json` is the event as JSON, which is what the old transport sent:
    // functions and undefined fields drop out, and it can always be cloned.
    var toGameEventMessage = function (json, at) {
        var data = JSON.parse(json);
        if (!data || typeof data !== 'object' || typeof data.event !== 'string' || !data.event) return null;
        for (var i = 0; i < TRANSPORT_FIELDS.length; i++) delete data[TRANSPORT_FIELDS[i]];
        if (Object.prototype.hasOwnProperty.call(UNIVERSAL_NAMES, data.event)) {
            data.legacyEvent = data.event;
            data.event = UNIVERSAL_NAMES[data.event];
        }
        data.at = typeof at === 'number' && isFinite(at) ? at : now();
        return { type: 'gameEvent', data: data };
    };

    var post = function (json, at) {
        try {
            if (!window.parent || window.parent === window) return;
            var message = toGameEventMessage(json, at);
            if (message) window.parent.postMessage(message, parentOrigin());
        } catch (e) {
            // Telemetry must never break the game.
        }
    };

    var logEvent = function (params) {
        var at = now();
        var json;
        try {
            json = JSON.stringify(params);
        } catch (e) {
            return;
        }
        if (typeof json === 'string') post(json, at);
    };

    // Calls made before this script loaded, queued by the index.html stub.
    var pending = globalThis.__skillprintPendingEvents;
    globalThis.__skillprintPendingEvents = undefined;
    if (Array.isArray(pending)) {
        for (var i = 0; i < pending.length; i++) {
            if (pending[i]) post(pending[i].json, pending[i].at);
        }
    }

    globalThis.logEvent = logEvent;
})();
