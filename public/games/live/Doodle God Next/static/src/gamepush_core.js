(function (global) {
    'use strict';

    if (global.DGGamePush) return;

    const config = global.DGConfig || {};
    const CALLBACK_NAME = 'onDGGamePushInit';
    const DEFAULT_SDK_URL = 'https://gamepush.com/sdk/game-score.js';
    const gpConfig = {
        enabled: true,
        debug: false,
        sdkUrl: DEFAULT_SDK_URL,
        projectId: '',
        publicToken: '',
        ...(config.gamePush || {}),
    };

    const state = {
        gp: null,
        ready: false,
        playerReady: false,
        loading: false,
        error: '',
        noOpReason: '',
        sdkUrl: '',
        events: [],
        platform: {},
    };

    let readyResolve;
    let playerReadyResolve;
    const readyPromise = new Promise((resolve) => {
        readyResolve = resolve;
    });
    const playerReadyPromise = new Promise((resolve) => {
        playerReadyResolve = resolve;
    });

    let panel = null;

    function normalizeLanguage(value) {
        return String(value || '').trim().replace(/_/g, '-').toLowerCase();
    }

    function languageFromPayload(payload, gp) {
        if (typeof payload === 'string') return payload;
        if (payload && typeof payload === 'object') {
            const value = payload.language || payload.locale || payload.lang || payload.value || '';
            if (value) return value;
        }
        return (gp && (gp.language || gp.locale)) || '';
    }

    function gamePushLanguage(value) {
        return normalizeLanguage(value).split('-')[0];
    }

    function languageLocales(value) {
        const normalized = normalizeLanguage(value);
        if (!normalized) return [];

        const primary = normalized.split('-')[0];
        const locales = [];
        const push = (locale) => {
            const value = String(locale || '').trim().replace(/_/g, '-').toUpperCase();
            if (value && locales.indexOf(value) === -1) locales.push(value);
        };

        if (primary === 'zh') push('ZH-HANS');
        push(normalized);
        push(primary);
        return locales;
    }

    function notifyCppLanguage(locales) {
        const locale = Array.isArray(locales) && locales.length ? locales[0] : '';
        if (!locale || !global.Module || typeof global.Module.ccall !== 'function' || !global.Module._ems_set_language_from_platform) {
            return false;
        }

        try {
            return !!global.Module.ccall('ems_set_language_from_platform', 'number', ['string'], [locale]);
        } catch (error) {
            record('language', 'cpp-apply-failed', error && error.message ? error.message : String(error), 'warn');
            return false;
        }
    }

    function applyGamePushLanguage(language, source, notifyCpp) {
        const locales = languageLocales(language);
        if (!locales.length) return false;

        global.dg_system_locales = locales;
        global.dg_system_locales_csv = locales.join(',');
        if (global.document?.documentElement) {
            global.document.documentElement.lang = normalizeLanguage(language);
        }
        state.platform.language = normalizeLanguage(language);
        record('language', source || 'set', { language: normalizeLanguage(language), locales });
        if (notifyCpp !== false) {
            notifyCppLanguage(locales);
        }
        return true;
    }

    function setLanguageFromGame(language) {
        const normalized = normalizeLanguage(language);
        if (!normalized) return false;

        if (normalized === 'auto') {
            return applyGamePushLanguage(languageFromPayload(null, state.gp), 'game-auto', false);
        }

        applyGamePushLanguage(normalized, 'game', false);

        const gp = state.gp;
        if (!gp || typeof gp.changeLanguage !== 'function') {
            record('language', 'gamepush-change-unavailable', normalized, 'warn');
            return false;
        }

        const target = gamePushLanguage(normalized);
        if (!target || target === 'auto') {
            return true;
        }

        if (gamePushLanguage(gp.language || gp.locale) === target) {
            return true;
        }

        Promise.resolve(gp.changeLanguage(target)).catch(function (error) {
            record('language', 'gamepush-change-failed', error && error.message ? error.message : String(error), 'warn');
        });
        return true;
    }

    function debugEnabled() {
        const params = new URLSearchParams(global.location ? global.location.search : '');
        return !!(config.debug || gpConfig.debug || params.has('_gp_logs'));
    }

    function updatePanel() {
        if (!panel) return;

        const rows = state.events.slice(0, 12).map((item) => (
            '<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
            item.time + ' ' + item.scope + ':' + item.action +
            '</div>'
        )).join('');

        panel.innerHTML =
            '<strong>GamePush</strong>' +
            '<div>sdk: ' + (state.ready ? 'ready' : state.noOpReason ? 'fallback' : state.loading ? 'loading' : 'idle') + '</div>' +
            '<div>player: ' + (state.playerReady ? 'ready' : '-') + '</div>' +
            '<div>platform: ' + (state.platform.tag || state.platform.type || '-') + '</div>' +
            (state.error ? '<div style="color:#ffb4aa">error: ' + state.error + '</div>' : '') +
            (state.noOpReason ? '<div>fallback: ' + state.noOpReason + '</div>' : '') +
            '<div style="margin-top:6px">' + rows + '</div>';
    }

    function createPanel() {
        if (panel || !debugEnabled() || !global.document || !global.document.body) return;

        panel = global.document.createElement('div');
        panel.id = 'dg-gamepush-debug';
        panel.style.cssText = [
            'position:fixed',
            'left:8px',
            'top:8px',
            'z-index:2147483647',
            'width:280px',
            'max-height:45vh',
            'overflow:auto',
            'box-sizing:border-box',
            'padding:8px',
            'background:rgba(8,12,18,0.88)',
            'color:#e8f0ff',
            'font:11px/1.35 monospace',
            'border:1px solid rgba(255,255,255,0.22)',
            'border-radius:4px',
            'pointer-events:none',
        ].join(';');
        global.document.body.appendChild(panel);
        updatePanel();
    }

    function record(scope, action, details, level) {
        const item = {
            time: new Date().toLocaleTimeString(),
            scope,
            action,
            details: details || null,
        };
        state.events.unshift(item);
        if (state.events.length > 80) state.events.pop();

        if (debugEnabled() && global.console) {
            const method = level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log';
            global.console[method]('[GamePush:' + scope + ']', action, details || '');
        }

        updatePanel();
    }

    function buildSdkUrl(baseUrl) {
        const sourceUrl = String(baseUrl || DEFAULT_SDK_URL);
        const hashIndex = sourceUrl.indexOf('#');
        const hash = hashIndex === -1 ? '' : sourceUrl.slice(hashIndex);
        const withoutHash = hashIndex === -1 ? sourceUrl : sourceUrl.slice(0, hashIndex);
        const queryIndex = withoutHash.indexOf('?');
        const path = queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
        const query = queryIndex === -1 ? '' : withoutHash.slice(queryIndex + 1);
        const params = new URLSearchParams(query);
        params.set('projectId', gpConfig.projectId);
        params.set('publicToken', gpConfig.publicToken);
        params.set('callback', CALLBACK_NAME);
        return path + '?' + params.toString() + hash;
    }

    function loadScript(url) {
        return new Promise(function (resolve, reject) {
            const script = global.document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = resolve;
            script.onerror = function () {
                reject(new Error('failed to load ' + url));
            };
            global.document.head.appendChild(script);
        });
    }

    function readPlatform(gp) {
        const platform = gp && gp.platform ? gp.platform : {};
        state.platform = {
            type: platform.type || '',
            tag: platform.tag || '',
            saveFormat: platform.saveFormat || '',
            hasIntegratedAuth: !!platform.hasIntegratedAuth,
            isSupportsCloudSaves: !!platform.isSupportsCloudSaves,
            isBackendAllowed: !!platform.isBackendAllowed,
            isExternalLinksAllowed: !!platform.isExternalLinksAllowed,
            isAllowedOrigin: !!gp?.isAllowedOrigin,
            isDev: !!gp?.isDev,
            language: gp?.language || gp?.locale || '',
        };
        return state.platform;
    }

    function subscribeCoreEvents(gp) {
        if (!gp || typeof gp.on !== 'function') return;

        [
            'init',
            'gameStart',
            'gameplayStart',
            'gameplayStop',
            'pause',
            'resume',
            'change:language',
            'change:orientation',
            'change:serverDay',
            'change:platformDay',
            'overlay:ready',
        ].forEach(function (eventName) {
            try {
                gp.on(eventName, function (payload) {
                    record('core-event', eventName, payload);
                    if (eventName === 'change:language') {
                        applyGamePushLanguage(languageFromPayload(payload, gp), 'gamepush-event', true);
                    }
                });
            } catch (_) {
                // Optional SDK event.
            }
        });
    }

    async function waitForPlayer(gp) {
        try {
            if (gp && gp.player && gp.player.ready) {
                await gp.player.ready;
                state.playerReady = true;
                record('core', 'player-ready');
            }
        } catch (error) {
            state.error = error && error.message ? error.message : String(error);
            record('core', 'player-ready-failed', state.error, 'warn');
        } finally {
            playerReadyResolve(state.playerReady ? gp.player : null);
            updatePanel();
        }
    }

    function finishReady(gp) {
        state.gp = gp || null;
        state.ready = !!gp;
        state.loading = false;
        readPlatform(gp);
        subscribeCoreEvents(gp);
        applyGamePushLanguage(languageFromPayload(null, gp), 'gamepush-ready', false);
        record('core', gp ? 'sdk-ready' : 'sdk-empty');
        readyResolve(gp || null);
        waitForPlayer(gp || null);
    }

    function registerNoop(reason) {
        state.noOpReason = reason;
        state.ready = true;
        state.loading = false;
        record('core', 'fallback', reason, 'warn');
        readyResolve(null);
        playerReadyResolve(null);
    }

    async function init() {
        if (state.loading || state.ready || state.noOpReason) return readyPromise;

        if (!gpConfig.enabled) {
            registerNoop('disabled');
            return readyPromise;
        }

        if (!gpConfig.projectId || !gpConfig.publicToken) {
            registerNoop('missing projectId/publicToken');
            return readyPromise;
        }

        if (!global.document) {
            registerNoop('document is not available');
            return readyPromise;
        }

        state.loading = true;
        global[CALLBACK_NAME] = finishReady;
        const sdkUrl = buildSdkUrl(gpConfig.sdkUrl || DEFAULT_SDK_URL);
        state.sdkUrl = sdkUrl;

        try {
            record('core', 'load-sdk', sdkUrl);
            await loadScript(sdkUrl);
        } catch (error) {
            state.error = error && error.message ? error.message : String(error);
            registerNoop(state.error);
        }

        return readyPromise;
    }

    global.DGGamePush = {
        state,
        init,
        whenReady: function () {
            return readyPromise;
        },
        whenPlayerReady: function () {
            return playerReadyPromise;
        },
        getGp: function () {
            return state.gp;
        },
        getPlayer: function () {
            return state.gp && state.gp.player ? state.gp.player : null;
        },
        setLanguageFromGame,
        applyLanguageFromGamePush: function (language) {
            return applyGamePushLanguage(language, 'manual', true);
        },
        log: record,
        isDebugEnabled: debugEnabled,
        showDebugPanel: function () {
            createPanel();
        },
    };

    if (global.document && global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', createPanel);
    } else {
        createPanel();
    }

    init();
})(window);
