(function (global) {
    'use strict';

    if (global.DGStorage) return;

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const config = () => global.DGConfig?.gamePush?.storage || {};

    const state = {
        active: false,
        backend: 'local',
        files: {},
        dirty: false,
        revision: 0,
        flushTimer: null,
        flushing: null,
        lastError: '',
        lastBytes: 0,
        savedCount: 0,
        readCount: 0,
        flushCount: 0,
    };

    function log(action, details, level) {
        global.DGGamePush?.log?.('storage', action, details, level);
    }

    function storageKey() {
        return config().key || 'dg_storage_zip_v1';
    }

    function switchToLocal(reason, details) {
        state.active = false;
        state.backend = 'local';
        clearTimeout(state.flushTimer);
        state.flushTimer = null;

        Object.keys(state.files || {}).forEach(function (name) {
            localSave(name, state.files[name]);
        });

        log('fallback-local', details || reason);
    }

    function switchToCloud(files, reason, details) {
        state.active = true;
        state.backend = 'gamepush-player';
        state.files = files && typeof files === 'object' ? files : {};
        log(reason || 'ready', details || { key: storageKey(), files: Object.keys(state.files).length });
    }

    function readPlayerStorage(player, key) {
        if (!player || typeof player.get !== 'function') return '';

        try {
            return player.get(key) || '';
        } catch (error) {
            state.lastError = error && error.message ? error.message : String(error);
            log('cloud-read-empty', { key, error: state.lastError }, 'warn');
            return '';
        }
    }

    function zipFileName() {
        return config().zipFile || 'storage.json';
    }

    function bytesToBase64(bytes) {
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binary);
    }

    function base64ToBytes(value) {
        if (!value) return null;
        const binary = atob(String(value));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    function packFiles() {
        if (typeof fflate === 'undefined') {
            throw new Error('fflate is not loaded');
        }

        const payload = JSON.stringify({
            version: 1,
            files: state.files || {},
        });
        const zipped = fflate.zipSync({
            [zipFileName()]: encoder.encode(payload),
        }, { level: 9 });
        return bytesToBase64(zipped);
    }

    function unpackFiles(packed) {
        if (!packed || typeof fflate === 'undefined') return {};
        const bytes = base64ToBytes(packed);
        if (!bytes) return {};

        const files = fflate.unzipSync(bytes);
        const entry = files[zipFileName()] || files[Object.keys(files)[0]];
        if (!entry) return {};

        const parsed = JSON.parse(decoder.decode(entry));
        return parsed && parsed.files && typeof parsed.files === 'object' ? parsed.files : {};
    }

    function localSave(name, text) {
        try {
            localStorage.setItem(name, text);
        } catch (error) {
            state.lastError = error && error.message ? error.message : String(error);
            log('local-save-failed', { name, error: state.lastError }, 'warn');
        }
    }

    function localRead(name) {
        try {
            return localStorage.getItem(name) || '';
        } catch (_) {
            return '';
        }
    }

    async function syncPlayer(player, force) {
        if (!player || typeof player.sync !== 'function') return true;
        await player.sync(force === true ? { force: true } : undefined);
        return true;
    }

    async function flush(force) {
        if (!state.active || (!state.dirty && !force)) return false;
        if (state.flushing) return state.flushing;

        state.flushing = (async function () {
            const player = global.DGGamePush?.getPlayer?.();
            const key = storageKey();
            if (!player || !key || typeof player.set !== 'function') {
                log('flush-skipped-player-unavailable', { key }, 'warn');
                return false;
            }

            const packedRevision = state.revision;
            const packed = packFiles();
            const storedBytes = encoder.encode(packed).length;
            state.lastBytes = storedBytes;

            const maxBytes = Number(config().maxPayloadBytes || 1024 * 1024);
            if (maxBytes > 0 && storedBytes > maxBytes) {
                log('payload-limit-warning', { bytes: storedBytes, maxBytes }, 'warn');
            }

            player.set(key, packed);
            await syncPlayer(player, force);

            state.flushCount += 1;
            state.dirty = state.revision !== packedRevision;
            log('flushed', { bytes: storedBytes, force: !!force, dirty: state.dirty });
            return true;
        })().catch(function (error) {
            state.lastError = error && error.message ? error.message : String(error);
            state.dirty = false;
            log('flush-failed', state.lastError, 'warn');
            return false;
        }).finally(function () {
            state.flushing = null;
            if (state.dirty) scheduleFlush();
        });

        return state.flushing;
    }

    function scheduleFlush() {
        if (!state.active) return;
        if (config().flushOnSave) {
            Promise.resolve(flush(false));
            return;
        }

        const delay = Math.max(0, Number(config().flushDelayMs || 1000));
        clearTimeout(state.flushTimer);
        state.flushTimer = setTimeout(function () {
            Promise.resolve(flush(false));
        }, delay);
    }

    function saveConfig(name, text) {
        state.savedCount += 1;

        if (!state.active) {
            localSave(name, text);
            log('local-save', { name, bytes: String(text || '').length });
            return;
        }

        state.files[name] = String(text || '');
        state.dirty = true;
        state.revision += 1;
        log('save', { name, bytes: String(text || '').length });
        scheduleFlush();
    }

    function readConfig(name) {
        state.readCount += 1;

        if (!state.active) {
            const value = localRead(name);
            log('local-read', { name, hit: !!value });
            return value;
        }

        const value = state.files[name] || '';
        log('read', { name, hit: !!value });
        return value;
    }

    async function init() {
        const gp = await global.DGGamePush?.whenReady?.();
        if (!gp) {
            switchToLocal('sdk-unavailable', 'sdk unavailable');
            return false;
        }

        const player = await global.DGGamePush?.whenPlayerReady?.();
        const key = storageKey();
        if (!player || typeof player.get !== 'function' || typeof player.set !== 'function') {
            switchToCloud({}, 'player-unavailable', { key });
            return true;
        }

        try {
            switchToCloud(unpackFiles(readPlayerStorage(player, key)), 'ready', { key });
            return true;
        } catch (error) {
            state.lastError = error && error.message ? error.message : String(error);
            switchToCloud({}, 'cloud-read-reset-empty', { key, error: state.lastError });
            return true;
        }
    }

    global.addEventListener('pagehide', function () {
        Promise.resolve(flush(true));
    });

    global.document.addEventListener('visibilitychange', function () {
        if (global.document.visibilityState === 'hidden') {
            Promise.resolve(flush(true));
        }
    });

    global.DGStorage = {
        init,
        saveConfig,
        readConfig,
        flushAll: flush,
        isActive: function () {
            return state.active;
        },
        isCloudRuntime: function () {
            return !!(global.DGConfig?.gamePush?.enabled && global.DGConfig?.gamePush?.projectId && global.DGConfig?.gamePush?.publicToken);
        },
        getState: function () {
            return { ...state, files: undefined };
        },
    };

    global.DGPlatform?.addReadyTask?.('gamepush-storage', init);
})(window);
