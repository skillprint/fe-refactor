// idb_fs_cache.js
const DB_NAME = 'ems-fs-cache';
const STORE = 'files';
const VERSION_KEY = 'dg_packs_version';
const PACK_STAGE_PREFIX = 'dg_pack_zip_stage_';
const PACK_MANIFEST_PREFIX = '__pack_manifest_stage_';
const DATA_PREFIX = '/data/';
const DOC_FONT_CACHE_PREFIX = 'temp/font_cache/';
const log = window['HasRelease'] ? console.log : () => { };
const currentVersion = () => String(window.dg_version || '');
const packStageKey = (stage, version = currentVersion()) => `${PACK_STAGE_PREFIX}${stage}_${version}`;
const packManifestKey = (stage, version = currentVersion()) => `${PACK_MANIFEST_PREFIX}${stage}_${version}`;

const markPackVersion = () => {
    try {
        localStorage.setItem(VERSION_KEY, currentVersion());
    } catch (_) { }
};

const getPackStageInstalled = (stage) => {
    try {
        return localStorage.getItem(packStageKey(stage)) === '1';
    } catch (_) {
        return false;
    }
};

const setPackStageInstalled = (stage, installed = true) => {
    try {
        const key = packStageKey(stage);
        if (installed) {
            localStorage.setItem(key, '1');
            markPackVersion();
        } else {
            localStorage.removeItem(key);
        }
    } catch (_) { }
};

const clearAllPackStageKeys = () => {
    try {
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (key && key.startsWith(PACK_STAGE_PREFIX)) {
                toRemove.push(key);
            }
        }
        for (const key of toRemove) {
            localStorage.removeItem(key);
        }
    } catch (_) { }
};

const readPackChainState = () => {
    const hasSecond = getPackStageInstalled(2);
    const hasThirdRaw = getPackStageInstalled(3);
    const hasThird = hasSecond && hasThirdRaw;
    const isValid = !hasThirdRaw || hasSecond;
    return { hasSecond, hasThird, hasThirdRaw, isValid };
};

const syncPackFlagsFromKeys = () => {
    const chain = readPackChainState();
    window.hasCached_second = !!chain.hasSecond;
    window.hasCached_third = !!chain.hasThird;
    return {
        hasSecond: !!window.hasCached_second,
        hasThird: !!window.hasCached_third,
    };
};

const toUint8Array = (raw) => {
    if (!raw) return null;
    if (raw instanceof Uint8Array) return raw;
    if (raw instanceof ArrayBuffer) return new Uint8Array(raw);
    if (ArrayBuffer.isView(raw)) return new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
    return null;
};

const isExtractedDataKey = (key) => typeof key === 'string' && key.startsWith(DATA_PREFIX);
const isFontCacheKey = (key) => typeof key === 'string' && key.startsWith(DOC_FONT_CACHE_PREFIX);
const normalizeManifestPaths = (raw) => (
    Array.isArray(raw)
        ? raw.filter((item) => typeof item === 'string' && item.length > 0)
        : []
);

const clearInstalledPackStageKeys = () => {
    try {
        setPackStageInstalled(2, false);
        setPackStageInstalled(3, false);
    } catch (_) { }
};

let openDBPromise = null;

const FS_MODE_MASK = 61440;
const FS_MODE_DIR = 16384;
const FS_MODE_FILE = 32768;

function getFsCreatePath() {
    if (typeof globalThis !== 'undefined' && typeof globalThis.FS_createPath === 'function') {
        return globalThis.FS_createPath.bind(globalThis);
    }
    if (typeof Module !== 'undefined' && typeof Module.FS_createPath === 'function') {
        return Module.FS_createPath.bind(Module);
    }
    return null;
}

function describeFsPath(FSref, path) {
    if (!path) {
        return {
            exists: false,
            type: 'missing',
        };
    }

    try {
        if (typeof FSref.analyzePath === 'function') {
            const analyzed = FSref.analyzePath(path);
            const object = analyzed?.object || null;
            const mode = object && typeof object.mode === 'number' ? object.mode : null;
            let type = 'missing';

            if (analyzed?.exists) {
                if (mode !== null && (mode & FS_MODE_MASK) === FS_MODE_DIR) type = 'dir';
                else if (mode !== null && (mode & FS_MODE_MASK) === FS_MODE_FILE) type = 'file';
                else type = 'other';
            }

            return {
                exists: !!analyzed?.exists,
                type,
            };
        }

        if (typeof FSref.stat === 'function') {
            const stat = FSref.stat(path);
            const mode = typeof stat?.mode === 'number' ? stat.mode : null;
            let type = 'other';

            if (mode !== null && (mode & FS_MODE_MASK) === FS_MODE_DIR) type = 'dir';
            else if (mode !== null && (mode & FS_MODE_MASK) === FS_MODE_FILE) type = 'file';

            return {
                exists: true,
                type,
            };
        }

        return {
            exists: false,
            type: 'unknown',
        };
    } catch (e) {
        return {
            exists: false,
            type: `error:${e?.message || e}`,
        };
    }
}

function ensureFsDir(FSref, dirPath) {
    if (!dirPath || dirPath === '/') return;

    const normalized = String(dirPath).replace(/\\/g, '/').replace(/\/+/g, '/');
    const createPath = getFsCreatePath();

    if (typeof FSref.mkdirTree === 'function') {
        FSref.mkdirTree(normalized);
        return;
    }

    const parts = normalized.split('/').filter(Boolean);
    let current = '/';

    for (const part of parts) {
        const next = current === '/' ? `/${part}` : `${current}/${part}`;
        if (describeFsPath(FSref, next).exists) {
            current = next;
            continue;
        }

        if (createPath) {
            createPath(current, part, true, true);
        } else if (typeof FSref.mkdir === 'function') {
            FSref.mkdir(next);
        } else {
            throw new Error(`FS mkdir is not available for ${next}`);
        }

        current = next;
    }
}

async function restorePathsToFS(paths, opts = {}) {
    const FSref = (typeof globalThis !== 'undefined' && globalThis.FS) || (typeof FS !== 'undefined' && FS) || (typeof Module !== 'undefined' ? Module.FS : null);
    if (!FSref) {
        console.warn('[EMS] FS restore skipped: FS is not available');
        return { restoredFiles: 0, totalFiles: 0, missingFiles: 0 };
    }

    const knownDirs = new Set();
    let restoredFiles = 0;
    let missingFiles = 0;
    const safePaths = Array.isArray(paths) ? paths : [];
    const label = typeof opts.label === 'string' && opts.label.length > 0 ? opts.label : 'generic';
    const values = await idbGetMany(safePaths);

    for (let i = 0; i < safePaths.length; i += 1) {
        const key = safePaths[i];
        const bytes = toUint8Array(values[i]);
        if (!bytes || bytes.byteLength <= 0) {
            missingFiles += 1;
            continue;
        }

        const dir = key.substring(0, key.lastIndexOf('/'));
        if (dir && !knownDirs.has(dir)) {
            const dirBefore = describeFsPath(FSref, dir);
            const parentDir = dir.substring(0, dir.lastIndexOf('/'));
            const parentBefore = describeFsPath(FSref, parentDir);
            log(`[FILETRACE][IDBRESTORE] mkdir label="${label}" dir="${dir}" exists=${dirBefore.exists ? 1 : 0} type="${dirBefore.type}" parent="${parentDir}" parentExists=${parentBefore.exists ? 1 : 0} parentType="${parentBefore.type}"`);
            try {
                ensureFsDir(FSref, dir);
            } catch (e) {
                console.warn(`[FILETRACE][IDBRESTORE] mkdir-fail label="${label}" dir="${dir}" err="${e?.message || e}"`);
            }
            const dirAfter = describeFsPath(FSref, dir);
            log(`[FILETRACE][IDBRESTORE] mkdir-done label="${label}" dir="${dir}" exists=${dirAfter.exists ? 1 : 0} type="${dirAfter.type}"`);
            knownDirs.add(dir);
        }

        const keyBefore = describeFsPath(FSref, key);
        if (keyBefore.exists) {
            log(`[FILETRACE][IDBRESTORE] overwrite label="${label}" path="${key}" type="${keyBefore.type}" bytes=${bytes.byteLength}`);
        }

        try {
            FSref.writeFile(key, bytes, { canOwn: true });
            restoredFiles += 1;
        } catch (e) {
            missingFiles += 1;
            console.warn('[EMS] restore file failed', key, e);
            const dirState = describeFsPath(FSref, dir);
            const keyAfter = describeFsPath(FSref, key);
            console.warn(`[FILETRACE][IDBRESTORE] write-fail label="${label}" path="${key}" dir="${dir}" dirExists=${dirState.exists ? 1 : 0} dirType="${dirState.type}" pathExistsBefore=${keyBefore.exists ? 1 : 0} pathTypeBefore="${keyBefore.type}" pathExistsAfter=${keyAfter.exists ? 1 : 0} pathTypeAfter="${keyAfter.type}" bytes=${bytes.byteLength} err="${e?.message || e}"`);
        }
    }

    return { restoredFiles, totalFiles: safePaths.length, missingFiles };
}

async function restoreStartupCachedFilesToFS() {
    const keys = await idbKeys();
    const fontCachePaths = keys.filter(isFontCacheKey);
    const restored = await restorePathsToFS(fontCachePaths, { label: 'startup-font-cache' });
    return {
        restoredFiles: restored.restoredFiles,
        cachedFiles: fontCachePaths.length,
        missingFiles: restored.missingFiles,
    };
}


function openDB() {
    if (openDBPromise) return openDBPromise;
    openDBPromise = new Promise((res, rej) => {
        const r = indexedDB.open(DB_NAME, 1);
        r.onupgradeneeded = () => {
            r.result.createObjectStore(STORE);
        };
        r.onsuccess = () => {
            const db = r.result;
            db.onclose = () => {
                if (openDBPromise) openDBPromise = null;
            };
            db.onversionchange = () => {
                try {
                    db.close();
                } catch (_) {
                    // ignore
                }
                openDBPromise = null;
            };
            res(db);
        };
        r.onerror = () => {
            openDBPromise = null;
            rej(r.error);
        };
        r.onblocked = () => {
            openDBPromise = null;
        };
    });
    return openDBPromise;
}

async function idbPut(path, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(data, path);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error || new Error(`IndexedDB put failed: ${path}`));
        tx.onabort = () => reject(tx.error || new DOMException(`IndexedDB put aborted: ${path}`, 'AbortError'));
    });
}

async function idbPutMany(entries, opts = {}) {
    const safeEntries = Array.isArray(entries)
        ? entries.filter((entry) => Array.isArray(entry) && typeof entry[0] === 'string' && entry[0].length > 0)
        : [];
    if (safeEntries.length === 0) return 0;

    const db = await openDB();
    const chunkSize = Math.max(1, Number(opts.chunkSize || 96));
    const onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;
    let written = 0;

    for (let i = 0; i < safeEntries.length; i += chunkSize) {
        const chunk = safeEntries.slice(i, i + chunkSize);
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            const store = tx.objectStore(STORE);
            for (const [path, data] of chunk) {
                store.put(data, path);
            }
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error || new Error('IndexedDB bulk put failed'));
            tx.onabort = () => reject(tx.error || new DOMException('IndexedDB bulk put aborted', 'AbortError'));
        });
        written += chunk.length;
        onProgress?.(written, safeEntries.length);
    }

    return written;
}

async function idbGet(path) {
    const db = await openDB();
    return new Promise(res => {
        const tx = db.transaction(STORE, 'readonly');
        const r = tx.objectStore(STORE).get(path);
        r.onsuccess = () => res(r.result || null);
        r.onerror = () => res(null);
        tx.onerror = () => res(null);
        tx.onabort = () => res(null);
    });
}

async function idbGetMany(paths, opts = {}) {
    const safePaths = Array.isArray(paths) ? paths.filter((path) => typeof path === 'string' && path.length > 0) : [];
    if (safePaths.length === 0) return [];

    const db = await openDB();
    const chunkSize = Math.max(1, Number(opts.chunkSize || 128));
    const onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;
    const results = new Map();
    let loaded = 0;

    for (let i = 0; i < safePaths.length; i += chunkSize) {
        const chunk = safePaths.slice(i, i + chunkSize);
        await new Promise((resolve) => {
            const tx = db.transaction(STORE, 'readonly');
            const store = tx.objectStore(STORE);
            let pending = chunk.length;

            if (pending === 0) {
                resolve();
                return;
            }

            const settle = () => {
                if (pending < 0) return;
                pending = -1;
                resolve();
            };

            for (const path of chunk) {
                const req = store.get(path);
                req.onsuccess = () => {
                    results.set(path, req.result || null);
                    if (pending > 0) {
                        pending -= 1;
                        if (pending === 0) settle();
                    }
                };
                req.onerror = () => {
                    results.set(path, null);
                    if (pending > 0) {
                        pending -= 1;
                        if (pending === 0) settle();
                    }
                };
            }

            tx.onerror = settle;
            tx.onabort = settle;
        });

        loaded += chunk.length;
        onProgress?.(loaded, safePaths.length);
    }

    return safePaths.map((path) => results.get(path) || null);
}

async function idbDelete(path) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(path);
        tx.oncomplete = resolve;
        tx.onerror = resolve;
        tx.onabort = resolve;
    });
}

async function idbWritePackManifest(stage, paths) {
    const manifest = normalizeManifestPaths(paths);
    await idbPut(packManifestKey(stage), manifest);
    return manifest.length;
}

async function idbReadPackManifest(stage) {
    const raw = await idbGet(packManifestKey(stage));
    return normalizeManifestPaths(raw);
}

async function idbDeletePackManifest(stage) {
    await idbDelete(packManifestKey(stage));
}

async function idbRestorePackStageToFS(stage) {
    const paths = await idbReadPackManifest(stage);
    log(`[FILETRACE][IDBRESTORE] stage-begin stage=${stage} files=${paths.length}`);
    const restored = await restorePathsToFS(paths, { label: `pack-stage-${stage}` });
    return {
        ...restored,
        paths,
    };
}

async function idbKeys() {
    const db = await openDB();
    return new Promise(res => {
        const tx = db.transaction(STORE, 'readonly');
        const r = tx.objectStore(STORE).getAllKeys();
        r.onsuccess = () => res(r.result);
        r.onerror = () => res([]);
        tx.onerror = () => res([]);
        tx.onabort = () => res([]);
    });
}


let restoreFSFromCachePromise = null;

async function clearIDBStore() {
    try {
        const db = await openDB();
        await new Promise((resolve) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).clear();
            tx.oncomplete = resolve;
            tx.onerror = resolve;
            tx.onabort = resolve;
        });
    } catch (_) { }
}

async function resetCacheAndPackState(reason = '') {
    if (reason) {
        log(`[EMS] reset cache: ${reason}`);
    }
    await clearIDBStore();
    clearAllPackStageKeys();
    try {
        localStorage.removeItem(VERSION_KEY);
    } catch (_) { }
    window.hasCached_second = false;
    window.hasCached_third = false;
    window.hasLoaded_second = false;
    window.hasLoaded_third = false;
    window.idbExtractedDataFiles = 0;
    window.idbHasExtractedDataCache = false;
}

async function restoreFSFromCache() {
    if (restoreFSFromCachePromise) return restoreFSFromCachePromise;

    restoreFSFromCachePromise = (async () => {
        let cachedVersion = '';
        try {
            cachedVersion = localStorage.getItem(VERSION_KEY);
        } catch (_) {
            cachedVersion = '';
        }
        const version = currentVersion();
        if (cachedVersion && cachedVersion !== version) {
            await resetCacheAndPackState('version mismatch');
            return 0;
        }

        const chainBeforeRestore = readPackChainState();
        if (!chainBeforeRestore.isValid) {
            await resetCacheAndPackState('broken pack chain (stage 3 without stage 2)');
            return 0;
        }

        const keys = await idbKeys();
        if (!keys || keys.length === 0) {
            if (chainBeforeRestore.hasSecond || chainBeforeRestore.hasThirdRaw) {
                await resetCacheAndPackState('pack keys exist but IndexedDB is empty');
                return 0;
            }
            syncPackFlagsFromKeys();
            log('[EMS] FS restore skipped: no cache');
            return 0;
        }

        const extractedKeys = keys.filter(isExtractedDataKey);
        if (extractedKeys.length === 0) {
            if (chainBeforeRestore.hasSecond || chainBeforeRestore.hasThirdRaw) {
                clearInstalledPackStageKeys();
                syncPackFlagsFromKeys();
                log('[EMS] extracted cache missing, cleared installed pack flags');
            } else {
                syncPackFlagsFromKeys();
            }
            window.idbExtractedDataFiles = 0;
            window.idbHasExtractedDataCache = false;
            log('[EMS] cache metadata ready from IndexedDB:', {
                files: keys.length,
                extractedFiles: 0,
                hasSecond: !!window.hasCached_second,
                hasThird: !!window.hasCached_third,
            });
            return 0;
        }

        const restored = await restoreStartupCachedFilesToFS();
        window.idbExtractedDataFiles = extractedKeys.length;
        window.idbHasExtractedDataCache = extractedKeys.length > 0;
        syncPackFlagsFromKeys();
        log('[EMS] cache metadata ready from IndexedDB:', {
            files: keys.length,
            extractedFiles: extractedKeys.length,
            restoredFiles: restored.restoredFiles,
            hasSecond: !!window.hasCached_second,
            hasThird: !!window.hasCached_third,
        });
        return restored.restoredFiles;
    })();
    return restoreFSFromCachePromise;
}

window.restoreFSFromCache = restoreFSFromCache;
window.idbPut = idbPut;
window.idbPutMany = idbPutMany;
window.idbGet = idbGet;
window.idbGetMany = idbGetMany;
window.idbDelete = idbDelete;
window.idbKeys = idbKeys;
window.idbWritePackManifest = idbWritePackManifest;
window.idbReadPackManifest = idbReadPackManifest;
window.idbDeletePackManifest = idbDeletePackManifest;
window.idbRestorePackStageToFS = idbRestorePackStageToFS;
window.IDB_VERSION_KEY = VERSION_KEY;
window.markPackVersion = markPackVersion;
window.idbPackHas = getPackStageInstalled;
window.idbPackMarkInstalled = setPackStageInstalled;
window.idbReadPackChainState = readPackChainState;
window.idbResetPackCache = resetCacheAndPackState;
window.syncPackFlagsFromKeys = syncPackFlagsFromKeys;
window.idbExtractedDataFiles = 0;
window.idbHasExtractedDataCache = false;
