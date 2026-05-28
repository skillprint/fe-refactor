(function (global) {
    'use strict';

    const config = global.DGConfig?.analytics?.gameAnalytics || {};
    const state = {
        ready: false,
        scriptLoaded: false,
        providerId: 'gameanalytics',
        noOpReason: '',
        lastError: '',
        sdkUrl: '',
        sent: 0,
        queuedBeforeSdk: 0,
        lastEventId: '',
    };

    function debugEnabled() {
        return !!(global.DGConfig?.debug || config.debug);
    }

    function log(action, details, level) {
        if (global.DGGamePush?.log) {
            global.DGGamePush.log('gameanalytics', action, details, level);
        }

        if (!debugEnabled() || !global.console) return;
        const method = level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log';
        global.console[method]('[GameAnalytics]', action, details || '');
    }

    function registerNoop(reason) {
        state.ready = true;
        state.noOpReason = reason;

        const provider = {
            isReady: function () {
                return true;
            },
            sendEvent: function (event) {
                log('noop-design-event', {
                    reason,
                    type: event.type,
                    name: event.name,
                    value: event.rawValue,
                });
            },
        };

        global.DGWebAnalytics?.registerProvider?.('gameanalytics-noop', provider);
        log('noop-provider', reason, 'warn');
    }

    function scriptUrl() {
        return config.sdkUrl || 'https://cdn.jsdelivr.net/npm/gameanalytics@4.4.7/dist/GameAnalytics.min.js';
    }

    function ensureCommandQueue() {
        if (typeof global.GameAnalytics === 'function') return;

        global.GameAnalytics = function () {
            (global.GameAnalytics.q = global.GameAnalytics.q || []).push(arguments);
            state.queuedBeforeSdk += 1;
        };
        global.GameAnalytics.q = global.GameAnalytics.q || [];
    }

    function callGameAnalytics() {
        if (typeof global.GameAnalytics !== 'function') {
            throw new Error('GameAnalytics command queue is not available');
        }
        global.GameAnalytics.apply(global, arguments);
    }

    function loadSdk() {
        return new Promise(function (resolve, reject) {
            if (!global.document) {
                reject(new Error('document is not available'));
                return;
            }

            const url = scriptUrl();
            state.sdkUrl = url;

            const existing = global.document.querySelector('script[data-dg-gameanalytics-sdk="1"]');
            if (existing) {
                resolve();
                return;
            }

            const script = global.document.createElement('script');
            script.src = url;
            script.async = true;
            script.defer = true;
            script.dataset.dgGameanalyticsSdk = '1';
            script.onload = function () {
                state.scriptLoaded = true;
                log('sdk-loaded', url);
                resolve();
            };
            script.onerror = function () {
                const error = new Error('failed to load ' + url);
                state.lastError = error.message;
                log('sdk-load-failed', error.message, 'warn');
                reject(error);
            };
            global.document.head.appendChild(script);
        });
    }

    function currentBuild() {
        const configured = String(config.build || '').trim();
        if (configured) return configured;

        const globalVersion = String(global.dg_version || '').trim();
        if (globalVersion) return globalVersion;

        const versionNode = global.document?.getElementById?.('version');
        const domVersion = String(versionNode?.textContent || '').trim();
        return domVersion || 'web';
    }

    function userId() {
        if (!config.configureUserId) return '';
        if (config.userId) return String(config.userId);

        try {
            const key = 'dg_gameanalytics_user_id';
            let value = global.localStorage?.getItem(key) || '';
            if (!value) {
                value = 'web_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
                global.localStorage?.setItem(key, value);
            }
            return value;
        } catch (_) {
            return '';
        }
    }

    function sanitizeSegment(value) {
        const normalized = String(value == null ? '' : value)
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^A-Za-z0-9_.-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');

        return (normalized || 'empty').slice(0, 32);
    }

    function rawValueText(event) {
        if (event.rawValue != null && String(event.rawValue).trim()) {
            return String(event.rawValue).trim();
        }

        if (event.value == null) return '';
        if (typeof event.value === 'string') return event.value;

        try {
            return JSON.stringify(event.value);
        } catch (_) {
            return String(event.value);
        }
    }

    function compactSegments(segments) {
        const flat = segments.map(sanitizeSegment).filter(Boolean);

        const result = flat.length ? flat : ['JoyBits', 'Events', 'empty'];
        if (result.length <= 5) return result;

        const head = result.slice(0, 4);
        head.push(sanitizeSegment(result.slice(4).join('_')));
        return head;
    }

    function designEventId(event) {
        const value = rawValueText(event);
        const nameSegments = String(event.name || 'empty').split(':');
        const segments = value
            ? ['JoyBits'].concat(nameSegments, [value])
            : ['JoyBits', 'Events'].concat(nameSegments);

        return compactSegments(segments).join(':');
    }

    function sendDesignEvent(event) {
        const eventId = designEventId(event);
        state.lastEventId = eventId;
        state.sent += 1;

        callGameAnalytics('addDesignEvent', eventId);
        log('design-event', {
            type: event.type,
            providerId: event.providerId,
            eventId,
        });
    }

    function registerProvider() {
        const provider = {
            isReady: function () {
                return state.ready;
            },
            sendEvent: sendDesignEvent,
        };

        global.DGWebAnalytics?.registerProvider?.(state.providerId, provider);
        log('provider-ready', {
            build: currentBuild(),
            sdkUrl: state.sdkUrl,
        });
    }

    async function init() {
        if (!global.DGWebAnalytics) {
            global.console?.warn?.('[GameAnalytics] DGWebAnalytics is not available');
            return;
        }

        if (config.enabled === false) {
            registerNoop('disabled');
            return;
        }

        if (!config.gameKey || !config.secretKey) {
            registerNoop('missing gameKey/secretKey');
            return;
        }

        try {
            ensureCommandQueue();
            state.sdkUrl = scriptUrl();

            if (debugEnabled()) {
                callGameAnalytics('setEnabledInfoLog', true);
                callGameAnalytics('setEnabledVerboseLog', true);
            }

            const id = userId();
            if (id) callGameAnalytics('configureUserId', id);

            callGameAnalytics('configureBuild', currentBuild());
            callGameAnalytics('initialize', String(config.gameKey), String(config.secretKey));

            state.ready = true;
            registerProvider();

            loadSdk().catch(function (error) {
                state.lastError = error && error.message ? error.message : String(error);
            });
        } catch (error) {
            state.lastError = error && error.message ? error.message : String(error);
            registerNoop(state.lastError);
        }
    }

    global.DGGameAnalytics = {
        state,
        init,
        buildDesignEventId: designEventId,
    };

    init();
})(window);
