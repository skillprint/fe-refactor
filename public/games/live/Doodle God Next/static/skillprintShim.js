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

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        console.log(`[skillprintShim - Doodle God Next] Adjusting parameter ${parameterName} to ${parameterValue}`);

        if (parameterName === "hintCooldownTime") {
            window.hintCooldownTime = parameterValue;
            if (window.DGConfig) {
                window.DGConfig.hintCooldownTime = parameterValue;
            }
        } else if (parameterName === "startingHints") {
            window.startingHints = parameterValue;
            if (window.DGConfig) {
                window.DGConfig.startingHints = parameterValue;
            }
        } else if (parameterName === "adsFrequencyMinutes") {
            window.adsFrequencyMinutes = parameterValue;
            // Set AdsTimeout in milliseconds (e.g. 5 minutes = 300,000 ms)
            window.AdsTimeout = parameterValue * 60 * 1000;
            if (window.DGConfig && window.DGConfig.gamePush && window.DGConfig.gamePush.ads) {
                window.DGConfig.gamePush.ads.timeout = parameterValue * 60;
            }
        } else if (parameterName === "debugMode") {
            const enabled = (parameterValue === 1);
            window.RENDER_DEBUG_GUI = enabled;
            if (window.DGConfig) {
                window.DGConfig.debug = enabled;
            }
            console.log(`[skillprintShim - Doodle God Next] Debug mode set to: ${enabled}`);
            
            // Proactively load Stats.js if debug mode is enabled and stats not present
            if (enabled && !document.querySelector('.stats-js')) {
                var script = document.createElement('script');
                script.onload = function () {
                    if (typeof Stats !== 'undefined') {
                        var stats = new Stats();
                        stats.dom.classList.add('stats-js');
                        stats.dom.style.width = 'fit-content';
                        stats.dom.style.height = 'fit-content';
                        stats.dom.style.position = 'fixed';
                        stats.dom.style.top = '10px';
                        stats.dom.style.left = '10px';
                        stats.dom.style.zIndex = '99999';
                        document.body.appendChild(stats.dom);
                        requestAnimationFrame(function loop() {
                            stats.update();
                            requestAnimationFrame(loop);
                        });
                    }
                };
                script.src = 'https://mrdoob.github.io/stats.js/build/stats.min.js';
                document.head.appendChild(script);
            } else if (!enabled) {
                const statsDom = document.querySelector('.stats-js');
                if (statsDom) {
                    statsDom.remove();
                }
            }
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
        console.log('[skillprintShim - Doodle God Next] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
