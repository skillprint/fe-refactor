(function (global) {
    'use strict';

    const config = global.DGConfig || {};
    const QUEUE_LIMIT = 300;
    const analyticsConfig = {
        technicalProviderId: 'ems',
        ...(config.analytics || {}),
    };

    const state = {
        providerId: '',
        provider: null,
        providerReady: false,
        queue: [],
        recent: [],
        stats: {
            received: 0,
            queued: 0,
            sent: 0,
            failed: 0,
            dropped: 0,
        },
        lastError: '',
    };

    let panel = null;
    let debugPanelForced = false;

    function isDebugEnabled() {
        return !!config.debug;
    }

    function log() {
        if (!isDebugEnabled()) return;
        console.log.apply(console, ['[DGWebAnalytics]'].concat(Array.prototype.slice.call(arguments)));
    }

    function warn() {
        if (!isDebugEnabled()) return;
        console.warn.apply(console, ['[DGWebAnalytics]'].concat(Array.prototype.slice.call(arguments)));
    }

    function normalizeName(name) {
        return String(name || '').trim();
    }

    function normalizeValue(value) {
        if (value == null) return undefined;
        if (typeof value !== 'string') return value;

        const trimmed = value.trim();
        if (!trimmed.length) return undefined;

        const first = trimmed[0];
        const last = trimmed[trimmed.length - 1];
        if ((first === '{' && last === '}') || (first === '[' && last === ']')) {
            try {
                return JSON.parse(trimmed);
            } catch (e) {
                return value;
            }
        }

        return value;
    }

    function pushRecent(record, result) {
        state.recent.unshift({
            time: new Date().toLocaleTimeString(),
            type: record.type,
            providerId: record.providerId,
            name: record.name,
            result: result,
        });
        if (state.recent.length > 8) state.recent.pop();
        updatePanel();
    }

    function isProviderReady() {
        if (!state.provider) return false;
        if (typeof state.provider.isReady !== 'function') return true;
        try {
            return !!state.provider.isReady();
        } catch (e) {
            state.lastError = e && e.message ? e.message : String(e);
            return false;
        }
    }

    function enqueue(record) {
        if (state.queue.length >= QUEUE_LIMIT) {
            state.queue.shift();
            state.stats.dropped += 1;
        }
        state.queue.push(record);
        state.stats.queued += 1;
        pushRecent(record, 'queued');
        log('queued', record);
    }

    function dispatch(record) {
        state.stats.received += 1;

        if (!record.name) {
            state.stats.dropped += 1;
            pushRecent(record, 'empty_name');
            warn('drop empty event name', record);
            return false;
        }

        if (!isProviderReady()) {
            enqueue(record);
            return false;
        }

        try {
            state.provider.sendEvent(record);
            state.stats.sent += 1;
            state.providerReady = true;
            pushRecent(record, 'sent');
            log('sent', record);
            return true;
        } catch (e) {
            state.stats.failed += 1;
            state.lastError = e && e.message ? e.message : String(e);
            pushRecent(record, 'failed');
            warn('send failed', state.lastError, record);
            return false;
        }
    }

    function flush() {
        if (!isProviderReady()) {
            updatePanel();
            return;
        }

        state.providerReady = true;
        const pending = state.queue.splice(0, state.queue.length);
        pending.forEach(function (record) {
            dispatch(record);
        });
        updatePanel();
    }

    function makeRecord(type, providerId, name, value) {
        return {
            type: type,
            providerId: providerId == null ? '' : String(providerId),
            name: normalizeName(name),
            rawValue: value == null ? '' : String(value),
            value: normalizeValue(value),
            createdAt: Date.now(),
        };
    }

    function maybeShiftArgs(args) {
        if (args.length === 2) {
            return ['', args[0], args[1]];
        }
        return [args[0], args[1], args[2]];
    }

    function registerProvider(providerId, provider) {
        state.providerId = providerId || 'default';
        state.provider = provider || null;
        state.providerReady = isProviderReady();
        log('provider registered', state.providerId, 'ready=', state.providerReady);
        flush();
    }

    function createPanel() {
        if (panel || !(isDebugEnabled() || debugPanelForced) || !global.document) return;

        panel = global.document.createElement('div');
        panel.id = 'dg-analytics-debug';
        panel.style.cssText = [
            'position:fixed',
            'right:8px',
            'top:8px',
            'z-index:2147483647',
            'width:260px',
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

    function bar(label, value, max, color) {
        const width = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
        return '<div style="margin-top:4px">' +
            '<div>' + label + ': ' + value + '</div>' +
            '<div style="height:4px;background:rgba(255,255,255,.15)">' +
            '<div style="height:4px;width:' + width + '%;background:' + color + '"></div>' +
            '</div>' +
            '</div>';
    }

    function updatePanel() {
        if (!panel) return;

        const max = Math.max(1, state.stats.received, state.stats.sent, state.queue.length, state.stats.failed);
        const recent = state.recent.map(function (item) {
            return '<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
                item.time + ' ' + item.result + ' ' + item.type + ' ' + item.name +
                '</div>';
        }).join('');

        panel.innerHTML =
            '<strong>DG Analytics</strong>' +
            '<div>provider: ' + (state.providerId || '-') + '</div>' +
            '<div>ready: ' + (isProviderReady() ? 'yes' : 'no') + '</div>' +
            bar('received', state.stats.received, max, '#70d6ff') +
            bar('sent', state.stats.sent, max, '#7ee787') +
            bar('queued', state.queue.length, max, '#f2cc60') +
            bar('failed', state.stats.failed, max, '#ff7b72') +
            '<div style="margin-top:6px">dropped: ' + state.stats.dropped + '</div>' +
            (state.lastError ? '<div style="color:#ffb4aa">error: ' + state.lastError + '</div>' : '') +
            '<div style="margin-top:6px">' + recent + '</div>';
    }

    const api = {
        registerProvider: registerProvider,
        isReady: function () {
            return true;
        },
        analyticsEvent: function () {
            const a = maybeShiftArgs(arguments);
            return dispatch(makeRecord('analytics', a[0], a[1], a[2]));
        },
        analyticsVideoCountEvent: function () {
            const a = maybeShiftArgs(arguments);
            return dispatch(makeRecord('video_count', a[0], a[1], a[2]));
        },
        tutorialProgress: function () {
            const providerId = arguments.length > 1 ? arguments[0] : '';
            const progress = arguments.length > 1 ? arguments[1] : arguments[0];
            return dispatch(makeRecord('tutorial', providerId, 'tutorial_progress', progress));
        },
        extendEvent: function (name, value) {
            return dispatch(makeRecord('extend', analyticsConfig.technicalProviderId, name, value));
        },
        flush: flush,
        showDebugPanel: function () {
            debugPanelForced = true;
            createPanel();
        },
        getState: function () {
            return {
                providerId: state.providerId,
                providerReady: isProviderReady(),
                queueLength: state.queue.length,
                stats: { ...state.stats },
                recent: state.recent.slice(),
                lastError: state.lastError,
            };
        },
    };

    global.DGWebAnalytics = api;

    if (global.document && global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', createPanel);
    } else {
        createPanel();
    }

    log('initialized');
})(window);
