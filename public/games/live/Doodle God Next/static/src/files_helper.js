(() => {
    const H = window['DGPackHelpers'];
    const log = window['HasRelease'] ? console.log : () => { };
    if (!H) {
        console.error('[packs] DGPackHelpers is not loaded');
        return;
    }
    if (!window['PackPlatformPolicy']) {
        console.error('[packs] PackPlatformPolicy is not loaded');
        return;
    }
    if (typeof window['PackPlatformPolicy']['detect'] !== 'function') {
        console.error('[packs] PackPlatformPolicy.detect is required');
        return;
    }

    if (typeof window.idbPut !== 'function'
        || typeof window.idbDelete !== 'function'
        || typeof window.idbWritePackManifest !== 'function'
        || typeof window.idbReadPackManifest !== 'function'
        || typeof window.idbDeletePackManifest !== 'function'
        || typeof window.idbRestorePackStageToFS !== 'function') {
        console.error('[packs] IndexedDB helpers for pack manifests are required');
        return;
    }
    if (typeof window.idbPackHas !== 'function' || typeof window.idbPackMarkInstalled !== 'function') {
        console.error('[packs] Pack cache flags helpers are required');
        return;
    }
    if (typeof window.markPackVersion !== 'function') {
        console.error('[packs] markPackVersion helper is required');
        return;
    }

    const installedState = { 2: false, 3: false };
    const publishedState = { 2: false, 3: false };
    const downloaded = { 2: false, 3: false };

    window.hasDownloaded_second = false;
    window.hasDownloaded_third = false;

    const DOWNLOAD_RETRY_DELAY_MS = 2000;
    const MAX_DOWNLOAD_ERRORS = 50;
    const DOWNLOADED_STAGE_PREFIX = 'dg_pack_zip_downloaded_stage_';

    const platformInfo = window['PackPlatformPolicy']['detect']();
    const PLATFORM_TYPE = platformInfo.platformType || platformInfo.policyId || 'desktop';
    const runtimeEnv = platformInfo.env || {};
    const isMobile = !!runtimeEnv.isMobile;
    const isMobileChrome = !!runtimeEnv.isMobileChrome;
    const isMobileSafari = !!runtimeEnv.isMobileSafari;
    const HIDE_STARTUP_INSTALL_UI = !window['HasRelease'];
    const IDB_BULK_WRITE_CHUNK_SIZE = isMobile ? 48 : 128;

    window['DG_PACK_POLICY_INFO'] = platformInfo;

    log('[packs] platform detected', PLATFORM_TYPE, platformInfo.env || {});
    log('[packs] runtime browser flags', { isMobile, isMobileChrome, isMobileSafari });

    const downloadBar = H.createBar({
        id: 'pack-download-bar',
        top: '0px',
        zIndex: 10060,
        baseStart: '#1c62d6',
        baseEnd: '#3a86ff',
    });

    const installBar = H.createBar({
        id: 'pack-install-bar',
        top: '0px',
        zIndex: 10059,
        baseStart: '#0f8f2f',
        baseEnd: '#12b53a',
    });

    const pendingInstallStages = [];
    const downloadPromises = new Map();
    const installPromises = new Map();
    const activeDownloadStages = new Set();
    const downloadErrors = [];
    const downloadStartedAt = new Map();
    const installStartedAt = new Map();

    let installPendingPromise = null;
    let downloadStateReadyPromise = null;
    let gameBootCompleted = false;
    let installProgressActive = false;
    let startupInstallInProgress = false;
    let criticalPackErrorMessage = '';

    const ensureFsDir = (FSref, dirPath) => {
        if (!FSref || !dirPath || dirPath === '/') return;

        const normalized = String(dirPath).replace(/\\/g, '/').replace(/\/+/g, '/');
        const createPath = (typeof globalThis !== 'undefined' && typeof globalThis.FS_createPath === 'function')
            ? globalThis.FS_createPath.bind(globalThis)
            : (typeof Module?.FS_createPath === 'function' ? Module.FS_createPath.bind(Module) : null);

        if (typeof FSref.mkdirTree === 'function') {
            FSref.mkdirTree(normalized);
            return;
        }

        const parts = normalized.split('/').filter(Boolean);
        let current = '/';

        for (const part of parts) {
            const next = current === '/' ? `/${part}` : `${current}/${part}`;
            try {
                if (typeof FSref.stat === 'function') {
                    FSref.stat(next);
                    current = next;
                    continue;
                }
            } catch (_) {
                // create next segment below
            }

            if (createPath) createPath(current, part, true, true);
            else if (typeof FSref.mkdir === 'function') FSref.mkdir(next);
            else throw new Error(`FS mkdir is not available for ${next}`);

            current = next;
        }
    };

    const getPackContext = () => ({
        platformType: PLATFORM_TYPE,
        isMobile,
        isMobileChrome,
        isMobileSafari,
        downloaded: { ...downloaded },
        installed: { ...installedState },
        published: { ...publishedState },
        hasDownloaded: (stage) => !!downloaded[stage],
    });

    const asModeFn = (rule, fallback = 'tap') => (...args) => {
        const value = typeof rule === 'function' ? rule(...args) : rule;
        if (value === 'auto' || value === 'tap') return value;
        return fallback;
    };

    const createPackStage = ({
        stage,
        label,
        dependsOn = [],
        startup = {},
        ingame = {},
        tapInstallPrompt,
        tapPublishPrompt,
    }) => {
        const startupInstallMode = asModeFn(startup.install, 'tap');
        const startupApplyMode = asModeFn(startup.apply, 'tap');
        const ingameInstallMode = asModeFn(ingame.install, 'tap');
        const ingameApplyMode = asModeFn(ingame.apply, 'tap');

        return {
            stage,
            label,
            dependsOn,
            tapInstallPrompt,
            tapPublishPrompt,

            // Сценарий B: запуск игры, архив уже в кэше.
            isStartupAutoInstall(ctx, downloadedMap) { return startupInstallMode(ctx, downloadedMap) === 'auto'; },
            isStartupAutoApply(ctx) { return startupApplyMode(ctx) === 'auto'; },

            // Сценарий A: игра уже запущена, архив скачали/нашли по запросу.
            isAutoInstall(ctx) { return ingameInstallMode(ctx) === 'auto'; },
            isAutoApply(ctx) { return ingameApplyMode(ctx) === 'auto'; },

            // Для UI клика.
            isApplyByTap(ctx) { return !this.isAutoApply(ctx); },
        };
    };

    const _pack_2 = createPackStage({
        stage: 2,
        label: 'пак 2',
        dependsOn: [],
        startup: {
            // install: (ctx) => ('tap'),
            // apply: (ctx) => ('tap'),
            install: (ctx) => ('auto'),
            apply: (ctx) => ('auto'),
            // install: (ctx) => (ctx.platformType === 'desktop' ? 'auto' : 'tap'),
            // apply: (ctx) => (ctx.platformType === 'desktop' ? 'auto' : 'tap'),
        },
        ingame: {
            // install: (ctx) => ('tap'),
            // apply: (ctx) => ('tap'),
            install: (ctx) => ('auto'),
            apply: (ctx) => ('auto'),
            // install: (ctx) => (ctx.platformType === 'desktop' ? 'auto' : 'tap'),
            // apply: (ctx) => (ctx.platformType === 'desktop' ? 'auto' : 'tap'),
        },
        tapInstallPrompt: 'Ресурсы готовы: нажмите, чтобы установить и применить пак 2',
        tapPublishPrompt: 'Ресурсы готовы: нажмите, чтобы применить пак 2',
    });

    const _pack_3 = createPackStage({
        stage: 3,
        label: 'пак 3',
        dependsOn: [2],
        startup: {
            // install: (ctx) => ('tap'),
            // apply: (ctx) => ('tap'),
            install: (ctx) => ('auto'),
            apply: (ctx) => ('auto'),
            // install: (ctx) => (ctx.platformType === 'desktop' ? 'auto' : 'tap'),
            // apply: (ctx) => (ctx.platformType === 'desktop' ? 'auto' : 'tap'),
        },
        ingame: {
            // install: (ctx) => ('tap'),
            // apply: (ctx) => ('tap'),
            install: (ctx) => ('auto'),
            apply: (ctx) => ('auto'),
            // install: (ctx) => (ctx.platformType === 'desktop' ? 'auto' : 'tap'),
            // apply: (ctx) => (ctx.platformType === 'desktop' ? 'auto' : 'tap'),
        },
        tapInstallPrompt: 'Ресурсы готовы: нажмите, чтобы установить и применить пак 3',
        tapPublishPrompt: 'Ресурсы готовы: нажмите, чтобы применить пак 3',
    });

    const PACKS = { 2: _pack_2, 3: _pack_3 };
    const PACK_ORDER = [2, 3];
    const getPack = (stage) => PACKS[stage];
    const stageLabel = (stage) => getPack(stage)?.label || `пак ${stage}`;

    const downloadedStageKey = (stage) => H.downloadedStageKey(stage, DOWNLOADED_STAGE_PREFIX);
    const hasPreloadedFullContent = () => window['DG_PRELOADED_FULL_CONTENT'] === true;

    const syncInstalledToWindow = () => {
        window.hasInstalled_second = !!installedState[2];
        window.hasInstalled_third = !!installedState[3];
    };

    const syncPublishedToWindow = () => {
        window.hasLoaded_second = !!publishedState[2];
        window.hasLoaded_third = !!publishedState[3];
    };

    const setPublishedState = (hasSecond, hasThird) => {
        publishedState[2] = !!hasSecond;
        publishedState[3] = !!publishedState[2] && !!hasThird;
        syncPublishedToWindow();
    };

    const setInstalledState = (hasSecond, hasThird) => {
        installedState[2] = !!hasSecond;
        installedState[3] = !!installedState[2] && !!hasThird;
        syncInstalledToWindow();

        if (!installedState[2]) {
            setPublishedState(false, false);
            return;
        }
        if (!installedState[3] && publishedState[3]) {
            setPublishedState(publishedState[2], false);
        }
    };

    const setStageInstalled = (stage, loaded = true) => {
        if (stage === 2) {
            setInstalledState(!!loaded, installedState[3]);
            if (!installedState[2]) setInstalledState(false, false);
            return;
        }
        if (stage === 3) {
            setInstalledState(installedState[2], !!loaded);
        }
    };

    const markPreloadedFullContent = (reason = 'preloaded-full-content') => {
        downloaded[2] = true;
        downloaded[3] = true;
        window.hasDownloaded_second = true;
        window.hasDownloaded_third = true;
        setInstalledState(true, true);
        setPublishedState(true, true);
        clearCriticalPackError();
        downloadBar.hide();
        installBar.hide();
        log('[packs] full content preloaded', { reason });
        return true;
    };

    const syncPersistentCacheState = (reason = 'sync') => {
        if (hasPreloadedFullContent()) {
            return {
                hasSecond: markPreloadedFullContent(reason),
                hasThird: true,
            };
        }

        let hasSecond = false;
        let hasThird = false;

        try {
            hasSecond = !!window.idbPackHas(2);
            hasThird = hasSecond && !!window.idbPackHas(3);
        } catch (_) {
            hasSecond = false;
            hasThird = false;
        }

        markDownloadedStage(2, hasSecond);
        markDownloadedStage(3, hasThird);

        log('[packs] persistent cache sync', {
            reason,
            cached: { stage2: hasSecond, stage3: hasThird },
            installed: { stage2: installedState[2], stage3: installedState[3] },
        });

        return {
            hasSecond,
            hasThird,
        };
    };

    const normalizeStates = () => {
        const installedSecond = !!installedState[2];
        const installedThird = installedSecond && !!installedState[3];
        setInstalledState(installedSecond, installedThird);

        const publishedSecond = installedSecond && !!publishedState[2];
        const publishedThird = installedThird && publishedSecond && !!publishedState[3];
        setPublishedState(publishedSecond, publishedThird);

        return {
            installedSecond: installedState[2],
            installedThird: installedState[3],
            publishedSecond: publishedState[2],
            publishedThird: publishedState[3],
        };
    };

    const markPackInstalledKey = (stage, installed = true) => window.idbPackMarkInstalled(stage, installed);
    const canRenderInstallBar = () => gameBootCompleted || (startupInstallInProgress && !HIDE_STARTUP_INSTALL_UI);

    const clearCriticalPackError = () => {
        criticalPackErrorMessage = '';
    };

    const showCriticalPackError = (message, err = null) => {
        criticalPackErrorMessage = String(message || 'Критическая ошибка подготовки ресурсов');
        installProgressActive = false;
        downloadBar.hide();
        console.error('[packs] critical error', {
            message: criticalPackErrorMessage,
            error: err?.message || String(err || ''),
        });
        installBar.showError(criticalPackErrorMessage);
    };

    const markDownloadedStage = (stage, value = true) => {
        downloaded[stage] = !!value;
        try {
            if (value) localStorage.setItem(downloadedStageKey(stage), '1');
            else localStorage.removeItem(downloadedStageKey(stage));
        } catch (_) {
            // ignore
        }

        if (!downloaded[2]) {
            downloaded[3] = false;
            try {
                localStorage.removeItem(downloadedStageKey(3));
            } catch (_) {
                // ignore
            }
        }

        window.hasDownloaded_second = !!downloaded[2];
        window.hasDownloaded_third = !!downloaded[2] && !!downloaded[3];
    };

    const readDownloadedMarkers = () => {
        let has2 = false;
        let has3 = false;
        try {
            has2 = localStorage.getItem(downloadedStageKey(2)) === '1';
            has3 = has2 && localStorage.getItem(downloadedStageKey(3)) === '1';
            if (!has2) localStorage.removeItem(downloadedStageKey(3));
        } catch (_) {
            // ignore
        }

        downloaded[2] = has2;
        downloaded[3] = has3;
        window.hasDownloaded_second = has2;
        window.hasDownloaded_third = has2 && has3;
    };

    const addDownloadError = (stage, attempt, err) => {
        const item = {
            stage,
            attempt,
            time: new Date().toISOString(),
            message: String(err?.message || err || 'unknown error'),
        };
        downloadErrors.push(item);
        if (downloadErrors.length > MAX_DOWNLOAD_ERRORS) downloadErrors.shift();
        console.warn(`[packs] download error stage=${stage} attempt=${attempt}`, err);
    };

    const fetchPackFromCandidates = async (stage) => {
        const candidates = typeof H.packCandidates === 'function'
            ? H.packCandidates(stage)
            : (typeof H.packUrls === 'function' ? H.packUrls(stage) : [H.packUrl(stage)]).map((url) => ({ url, host: '' }));
        let lastError = null;

        for (const candidate of candidates) {
            const url = candidate.url || candidate;
            try {
                log(`[packs] download try ${stageLabel(stage)}`, { stage, url });
                const resp = await fetch(url);
                if (!resp.ok) {
                    window.DGHost?.markFailed?.(candidate.host || url);
                    throw new Error(`HTTP ${resp.status}`);
                }
                return { resp, url };
            } catch (err) {
                window.DGHost?.markFailed?.(candidate.host || url);
                lastError = err;
                console.warn(`[packs] download candidate failed ${stageLabel(stage)}`, {
                    stage,
                    url,
                    error: err?.message || String(err || ''),
                });
            }
        }

        throw lastError || new Error(`No pack URL candidates for ${stageLabel(stage)}`);
    };

    const tryAutoPublishInstalled = (reason = 'auto') => {
        normalizeStates();
        const ctx = getPackContext();
        const isStartupReason = String(reason).startsWith('startup');

        let publishSecond = !!publishedState[2];
        let publishThird = !!publishedState[3];

        const canAutoApplySecond = isStartupReason ? _pack_2.isStartupAutoApply(ctx) : _pack_2.isAutoApply(ctx);
        const canAutoApplyThird = isStartupReason ? _pack_3.isStartupAutoApply(ctx) : _pack_3.isAutoApply(ctx);

        if (canAutoApplySecond && installedState[2]) {
            publishSecond = true;
        }

        if (!publishSecond) {
            publishThird = false;
        } else if (canAutoApplyThird && installedState[3]) {
            publishThird = true;
        }

        const changed = publishSecond !== publishedState[2] || publishThird !== publishedState[3];
        if (!changed) return false;

        setPublishedState(publishSecond, publishThird);
        log('[packs] auto publish', {
            reason,
            platform: PLATFORM_TYPE,
            browser: { isMobileChrome, isMobileSafari },
            installed: { stage2: !!installedState[2], stage3: !!installedState[3] },
            published: { stage2: !!publishedState[2], stage3: !!publishedState[3] },
        });
        return true;
    };

    const publishInstalledStage = (stage, reason = 'tap') => {
        normalizeStates();
        const pack = getPack(stage);
        if (!pack) return false;

        for (const depStage of pack.dependsOn) {
            if (!installedState[depStage]) return false;
        }
        if (!installedState[stage]) return false;

        if (stage === 2) {
            setPublishedState(true, false);
        } else {
            setPublishedState(true, true);
        }

        log(`[packs] publish stage ${stage}`, { reason });
        return true;
    };

    const updatePendingFromState = () => {
        normalizeStates();
        pendingInstallStages.length = 0;

        for (const stage of PACK_ORDER) {
            const pack = getPack(stage);
            if (!pack) continue;
            if (!downloaded[stage] || installedState[stage]) continue;

            for (const depStage of pack.dependsOn) {
                if (!installedState[depStage] && !pendingInstallStages.includes(depStage)) {
                    pendingInstallStages.push(depStage);
                }
            }

            if (!pendingInstallStages.includes(stage)) {
                pendingInstallStages.push(stage);
            }
        }
    };

    const getPendingPublishStages = () => {
        normalizeStates();
        return PACK_ORDER.filter((stage) => installedState[stage] && !publishedState[stage]);
    };

    const getPendingInstallMessage = () => {
        const has2 = pendingInstallStages.includes(2);
        const has3 = pendingInstallStages.includes(3);
        if (has2 && has3) return 'Подготовка ресурсов: устанавливаем паки 2 и 3';
        if (has2) return 'Подготовка ресурсов: устанавливаем пак 2';
        return 'Подготовка ресурсов: устанавливаем пак 3';
    };

    const showInstallProgress = (label, loaded, total) => {
        if (startupInstallInProgress && HIDE_STARTUP_INSTALL_UI) return;
        if (!canRenderInstallBar()) return;
        installProgressActive = true;
        installBar.showProgress(label, loaded, total);
    };

    const clearInstallProgress = () => {
        installProgressActive = false;
        if (startupInstallInProgress && HIDE_STARTUP_INSTALL_UI) {
            installBar.hide();
            return;
        }
        if (!canRenderInstallBar()) {
            installBar.hide();
            return;
        }
        updateInstallBarState();
    };

    const updateInstallBarState = () => {
        if (criticalPackErrorMessage) {
            installBar.showError(criticalPackErrorMessage);
            return;
        }
        if (startupInstallInProgress && HIDE_STARTUP_INSTALL_UI) return installBar.hide();
        if (installProgressActive) return;
        if (!canRenderInstallBar()) return installBar.hide();
        if (activeDownloadStages.size > 0) return installBar.hide();

        updatePendingFromState();
        const ctx = getPackContext();

        if (pendingInstallStages.length > 0) {
            const stage = pendingInstallStages[0];
            const pack = getPack(stage);
            if (!pack) return installBar.hide();

            if (pack.isAutoInstall(ctx)) {
                if (!installPendingPromise) {
                    Promise.resolve(installPendingExtraPacks()).catch((err) => {
                        console.warn('[packs] auto install pending failed', err);
                    });
                }
                installBar.showMessage(getPendingInstallMessage(), { clickable: false });
                return;
            }

            installBar.showMessage(pack.tapInstallPrompt, { clickable: true });
            if (gameBootCompleted) installBar.pulseOnce(`install:${stage}`);
            return;
        }

        tryAutoPublishInstalled('bar-update');

        const pendingPublishStages = getPendingPublishStages();
        if (pendingPublishStages.length === 0) {
            installBar.hide();
            return;
        }

        const stage = pendingPublishStages[0];
        const pack = getPack(stage);
        if (!pack) return installBar.hide();

        if (!pack.isAutoApply(ctx)) {
            installBar.showMessage(pack.tapPublishPrompt, { clickable: true });
            if (gameBootCompleted) installBar.pulseOnce(`publish:${pendingPublishStages.join(',')}`);
            return;
        }

        installBar.hide();
    };

    installBar.setOnClick(() => {
        Promise.resolve().then(async () => {
            const ctx = getPackContext();
            updatePendingFromState();

            if (pendingInstallStages.length > 0) {
                const stageToInstall = pendingInstallStages[0];
                const pack = getPack(stageToInstall);
                if (pack && !pack.isAutoInstall(ctx)) {
                    const requested = await requestDownloadByCpp(stageToInstall, true);
                    if (!requested || !installedState[stageToInstall]) {
                        updateInstallBarState();
                        return;
                    }

                    if (!pack.isAutoApply(ctx)) {
                        publishInstalledStage(stageToInstall, 'tap-install');
                    } else if (pack.isAutoApply(ctx)) {
                        tryAutoPublishInstalled('tap-install-auto-apply');
                    }

                    try {
                        Module['hasFullLoadedContent'](0);
                    } catch (err) {
                        console.warn('[packs] click publish flags failed', err);
                    }

                    installProgressActive = false;
                    updateInstallBarState();
                    return;
                }
            }

            const pendingPublishStages = getPendingPublishStages();
            if (pendingPublishStages.length === 0) {
                installBar.hide();
                return;
            }

            const stageToPublish = pendingPublishStages[0];
            const published = publishInstalledStage(stageToPublish, 'tap');
            if (!published) {
                updateInstallBarState();
                return;
            }

            log('[packs] install click', {
                pending: pendingInstallStages.slice(),
                downloaded: { stage2: !!downloaded[2], stage3: !!downloaded[3] },
                installed: { stage2: !!installedState[2], stage3: !!installedState[3] },
                published: { stage2: !!publishedState[2], stage3: !!publishedState[3] },
                stageToPublish,
                remainingPublishStages: getPendingPublishStages(),
            });

            try {
                Module['hasFullLoadedContent'](0);
            } catch (err) {
                console.warn('[packs] click publish flags failed', err);
            }

            installProgressActive = false;
            updateInstallBarState();
        });
    });

    const clearDownloadedStage = (stage) => {
        markDownloadedStage(stage, false);
    };

    const clearCachedStageFlags = (stage) => {
        markPackInstalledKey(stage, false);
        clearDownloadedStage(stage);
    };

    const readResponseWithProgress = async (resp, label, stage) => {
        const headerTotal = Number(resp.headers.get('Content-Length') || 0);
        const hintedTotal = H.getPackSizeHint(stage);
        const total = headerTotal > 0 ? headerTotal : hintedTotal;
        const hasTotal = total > 0;
        const startedAt = H.nowMs();
        const reader = resp.body?.getReader ? resp.body.getReader() : null;

        const renderDownloadProgress = (loaded) => {
            if (!hasTotal) {
                downloadBar.showMessage(`${label}: ${H.formatBytes(loaded)}`, { clickable: false });
                return;
            }

            const safeLoaded = Math.max(0, Math.min(loaded, total));
            const remaining = Math.max(0, total - safeLoaded);
            const elapsedSec = Math.max((H.nowMs() - startedAt) / 1000, 0.001);
            const speed = safeLoaded / elapsedSec;
            const etaSec = speed > 0 ? remaining / speed : Infinity;
            const msg = `${label} • осталось ${H.formatBytes(remaining)} • ${H.formatEta(etaSec)}`;
            downloadBar.showProgress(msg, safeLoaded, total);
        };

        if (!reader) {
            const buf = await resp.arrayBuffer();
            renderDownloadProgress(buf.byteLength || 0);
            return buf;
        }

        const chunks = [];
        let loaded = 0;
        renderDownloadProgress(0);

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!value) continue;
            chunks.push(value);
            loaded += value.byteLength;
            renderDownloadProgress(loaded);
        }

        const size = chunks.reduce((sum, part) => sum + part.byteLength, 0);
        const merged = new Uint8Array(size);
        let offset = 0;
        for (const part of chunks) {
            merged.set(part, offset);
            offset += part.byteLength;
        }

        renderDownloadProgress(size);
        return merged.buffer;
    };

    const startStageDownload = (stage) => {
        if (downloadPromises.has(stage)) return downloadPromises.get(stage);

        const promise = (async () => {
            let attempt = 0;
            const pack = getPack(stage);
            if (!pack) {
                console.warn('[packs] unknown stage download request', { stage });
                return false;
            }
            clearCriticalPackError();
            activeDownloadStages.add(stage);
            updateInstallBarState();
            downloadStartedAt.set(stage, H.nowMs());
            log(`[packs] download start ${stageLabel(stage)}`, { stage, urls: H.packUrls ? H.packUrls(stage) : [H.packUrl(stage)] });

            while (true) {
                attempt += 1;
                try {
                    const { resp, url } = await fetchPackFromCandidates(stage);

                    const label = `Загрузка ${stageLabel(stage)}`;
                    const buffer = await readResponseWithProgress(resp, label, stage);

                    const elapsedMs = Math.round(H.nowMs() - (downloadStartedAt.get(stage) || H.nowMs()));
                    const bytes = buffer?.byteLength || 0;
                    log(`[packs] download done ${stageLabel(stage)}`, { stage, url, bytes, elapsedMs });

                    downloadBar.hide();

                    const cached = await cacheStageFromZip(stage, buffer, 'download-cache');
                    if (!cached) {
                        console.warn(`[packs] cache unavailable for ${stageLabel(stage)}, fallback to direct install`, { stage });
                        const installedDirectly = await installStageFromZipBuffer(stage, buffer, 'download-fallback');
                        if (!installedDirectly) {
                            throw makeNonRetryableError(`Ошибка обработки ${stageLabel(stage)}`);
                        }
                    }

                    updateInstallBarState();
                    return true;
                } catch (err) {
                    if (err?.nonRetryable) {
                        showCriticalPackError(err.userMessage || `Ошибка загрузки ${stageLabel(stage)}`, err);
                        return false;
                    }
                    addDownloadError(stage, attempt, err);
                    downloadBar.showError(`Ошибка сети (${stageLabel(stage)}), повтор через 2с (попытка ${attempt})`);
                    await H.sleep(DOWNLOAD_RETRY_DELAY_MS);
                }
            }
        })().finally(() => {
            activeDownloadStages.delete(stage);
            downloadPromises.delete(stage);
            downloadStartedAt.delete(stage);
            updateInstallBarState();
        });

        downloadPromises.set(stage, promise);
        return promise;
    };

    const ensureStageDownloaded = async (stage) => {
        let hasPersistentCache = false;
        try {
            hasPersistentCache = !!window.idbPackHas(stage);
        } catch (_) {
            hasPersistentCache = false;
        }

        if (!hasPersistentCache) {
            clearDownloadedStage(stage);
            return false;
        }

        const manifest = await window.idbReadPackManifest(stage);
        if (Array.isArray(manifest) && manifest.length > 0) {
            markDownloadedStage(stage, true);
            return true;
        }

        clearCachedStageFlags(stage);
        return false;
    };

    const ensureDownloadStateReady = () => {
        if (hasPreloadedFullContent()) {
            markPreloadedFullContent('ensure-download-state');
            return Promise.resolve(true);
        }

        if (downloadStateReadyPromise) return downloadStateReadyPromise;

        downloadStateReadyPromise = (async () => {
            readDownloadedMarkers();
            syncPersistentCacheState('ensure-download-state');

            const hasSecond = await ensureStageDownloaded(2);
            if (!hasSecond) {
                clearCachedStageFlags(3);
                updateInstallBarState();
                return false;
            }

            await ensureStageDownloaded(3);
            updateInstallBarState();
            return !!downloaded[2];
        })().catch((err) => {
            console.warn('[packs] ensureDownloadStateReady failed', err);
            return false;
        }).finally(() => {
            downloadStateReadyPromise = null;
        });

        return downloadStateReadyPromise;
    };

    const requestDownloadByCpp = async (stage, forceInstall = false) => {
        if (hasPreloadedFullContent()) {
            markPreloadedFullContent(`cpp-request-${stage}`);
            return true;
        }

        const pack = getPack(stage);
        if (!pack) {
            console.warn('[packs] cpp requested unknown stage', { stage });
            return false;
        }
        log(`[packs] cpp request download ${stageLabel(stage)}`);

        await ensureDownloadStateReady();

        for (const depStage of pack.dependsOn) {
            const hasDep = await ensureStageDownloaded(depStage);
            if (!hasDep) {
                const depDownloaded = await startStageDownload(depStage);
                if (!depDownloaded && !installedState[depStage]) {
                    updateInstallBarState();
                    return false;
                }
            }
        }

        const ready = await ensureStageDownloaded(stage);
        if (!ready) {
            log(`[packs] ${stageLabel(stage)} missing extracted resources, start download`);
            const stageDownloaded = await startStageDownload(stage);
            if (!stageDownloaded && !installedState[stage]) {
                updateInstallBarState();
                return false;
            }
        } else {
            log(`[packs] ${stageLabel(stage)} already cached`, {
                installed: !!installedState[stage],
                downloaded: !!downloaded[stage],
            });
        }

        const ctx = getPackContext();
        const shouldInstall = forceInstall || pack.isAutoInstall(ctx);
        if (shouldInstall && !installedState[stage]) {
            const installed = await installStageFromCache(stage, forceInstall ? 'cpp-request-force-install' : 'cpp-request-auto-install');
            if (!installed) {
                updateInstallBarState();
                return false;
            }
        }

        tryAutoPublishInstalled(`cpp-request-${stage}`);
        updateInstallBarState();
        return true;
    };

    const cleanupInstalledPaths = async (paths = []) => {
        if (!Array.isArray(paths) || paths.length === 0) return;

        const FSref = (typeof globalThis !== 'undefined' && globalThis.FS) || (typeof FS !== 'undefined' && FS) || Module.FS;
        for (const path of paths) {
            try {
                await window.idbDelete(path);
            } catch (_) {
                // ignore
            }

            if (!FSref) continue;
            try {
                FSref.unlink(path);
            } catch (_) {
                // ignore
            }
        }
    };

    const cacheStageFromZip = async (stage, sourceBytes, reason = 'cache') => {
        const bytes = H.toUint8Array(sourceBytes);
        if (!bytes) {
            clearCachedStageFlags(stage);
            await window.idbDeletePackManifest(stage);
            return false;
        }
        let unzipStats = null;

        try {
            showInstallProgress(`Подготовка ${stageLabel(stage)}`, 0, 1);
            unzipStats = await unzipToFS(
                bytes,
                'data',
                (done, total) => {
                    showInstallProgress(`Подготовка ${stageLabel(stage)}`, done, total);
                },
                {
                    persistExtractedFiles: true,
                    writeToFs: false,
                    progressEvery: 24,
                },
            );
            showInstallProgress(`Подготовка ${stageLabel(stage)}`, 1, 1);

            const writeErrors = Number(unzipStats?.writeErrors || 0);
            const totalFiles = Number(unzipStats?.totalFiles || 0);
            const writtenFiles = Number(unzipStats?.writtenFiles || 0);
            const manifestPaths = Array.isArray(unzipStats?.writtenPaths) ? unzipStats.writtenPaths : [];
            const cacheOk = writeErrors === 0 && totalFiles > 0 && writtenFiles === totalFiles && manifestPaths.length === writtenFiles;

            if (!cacheOk) {
                await cleanupInstalledPaths(manifestPaths);
                await window.idbDeletePackManifest(stage);
                clearCachedStageFlags(stage);
                if (stage === 2) {
                    clearCachedStageFlags(3);
                    await window.idbDeletePackManifest(3);
                }

                console.error(`[packs] cache ${stageLabel(stage)} incomplete`, {
                    stage,
                    reason,
                    totalFiles,
                    writtenFiles,
                    writeErrors,
                    failedPaths: unzipStats?.failedPaths || [],
                });
                return false;
            }

            await window.idbWritePackManifest(stage, manifestPaths);
            markPackInstalledKey(stage, true);
            markDownloadedStage(stage, true);
            window.idbExtractedDataFiles = Number(window.idbExtractedDataFiles || 0) + writtenFiles;
            window.idbHasExtractedDataCache = true;
            window.markPackVersion();

            log(`[packs] cache done ${stageLabel(stage)}`, {
                stage,
                reason,
                files: writtenFiles,
                totalFiles,
            });
            return true;
        } catch (err) {
            const manifestPaths = Array.isArray(unzipStats?.writtenPaths) ? unzipStats.writtenPaths : [];
            await cleanupInstalledPaths(manifestPaths);
            await window.idbDeletePackManifest(stage);
            clearCachedStageFlags(stage);
            if (stage === 2) {
                clearCachedStageFlags(3);
                await window.idbDeletePackManifest(3);
            }
            console.warn(`[packs] cache ${stageLabel(stage)} failed`, err);
            return false;
        } finally {
            clearInstallProgress();
        }
    };

    const unzipToFS = async (arrayBuffer, targetPrefix, progressFn, opts = {}) => {
        if (typeof fflate === 'undefined') throw new Error('fflate not loaded');

        const persistExtractedFiles = !!opts.persistExtractedFiles;
        const writeToFs = opts.writeToFs !== false;
        const progressEvery = Math.max(1, Number(opts.progressEvery || 24));
        const bytes = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);
        const files = fflate.unzipSync(bytes);
        const names = Object.keys(files || {}).filter((name) => name && !name.endsWith('/'));
        const total = names.length || 0;
        const totalProgressUnits = total * (persistExtractedFiles ? 2 : 1);

        const FSref = (typeof globalThis !== 'undefined' && globalThis.FS) || (typeof FS !== 'undefined' && FS) || Module.FS;
        if (!FSref) throw new Error('FS is not available');

        const knownDirs = new Set();
        let done = 0;
        let writtenFiles = 0;
        let writeErrors = 0;
        const failedPaths = [];
        const writtenPaths = [];
        const pendingPersistEntries = [];

        for (const name of names) {
            const data = files[name];
            let clean = name.replace(/\\/g, '/');
            clean = clean.replace(/^(second|third)\//, '');

            const emsPath = `/${targetPrefix}/${clean}`;
            const dir = emsPath.substring(0, emsPath.lastIndexOf('/'));

            if (writeToFs && dir && !knownDirs.has(dir)) {
                try {
                    ensureFsDir(FSref, dir);
                } catch (_) {
                    // ignore
                }
                knownDirs.add(dir);
            }

            try {
                if (writeToFs) {
                    FSref.writeFile(emsPath, data, { canOwn: true });
                }
                if (persistExtractedFiles) {
                    pendingPersistEntries.push([emsPath, data]);
                }
                writtenFiles += 1;
                writtenPaths.push(emsPath);
            } catch (e) {
                console.warn('[zip] write fail', emsPath, e);
                writeErrors += 1;
                failedPaths.push(emsPath);
            }

            done += 1;
            if (done === total || done === 1 || (done % progressEvery) === 0) {
                progressFn?.(done, totalProgressUnits);
            }
        }

        if (persistExtractedFiles && pendingPersistEntries.length > 0) {
            const persistTotal = pendingPersistEntries.length;
            try {
                if (typeof window.idbPutMany === 'function') {
                    await window.idbPutMany(pendingPersistEntries, {
                        chunkSize: IDB_BULK_WRITE_CHUNK_SIZE,
                        onProgress: (persisted) => {
                            progressFn?.(total + persisted, totalProgressUnits);
                        },
                    });
                } else {
                    let persisted = 0;
                    for (const [emsPath, data] of pendingPersistEntries) {
                        await window.idbPut(emsPath, data);
                        persisted += 1;
                        if (persisted === persistTotal || persisted === 1 || (persisted % progressEvery) === 0) {
                            progressFn?.(total + persisted, totalProgressUnits);
                        }
                    }
                }
            } catch (e) {
                console.warn('[zip] bulk persist fail', e);
                writeErrors += persistTotal;
                failedPaths.push(...pendingPersistEntries.map(([emsPath]) => emsPath));
            }
        }

        return {
            totalFiles: total,
            writtenFiles,
            processedFiles: done,
            writeErrors,
            failedPaths,
            writtenPaths,
        };
    };

    const makeNonRetryableError = (message, err = null) => {
        const nextErr = err instanceof Error ? err : new Error(message);
        nextErr.nonRetryable = true;
        nextErr.userMessage = message;
        return nextErr;
    };

    const installStageFromZipBuffer = async (stage, sourceBytes, reason = 'direct-install') => {
        const pack = getPack(stage);
        const bytes = H.toUint8Array(sourceBytes);
        if (!pack || !bytes) return false;

        normalizeStates();

        for (const depStage of pack.dependsOn) {
            if (!installedState[depStage]) {
                const depReady = await ensureStageDownloaded(depStage);
                if (!depReady) return false;

                const depInstalled = await installStageFromCache(depStage, `${reason}-dep`);
                if (!depInstalled) return false;
            }
        }

        installStartedAt.set(stage, H.nowMs());
        console.warn(`[packs] direct install start ${stageLabel(stage)}`, { stage, reason });

        let restoreStats = null;
        try {
            showInstallProgress(`Установка ${stageLabel(stage)}`, 0, 1);
            restoreStats = await unzipToFS(
                bytes,
                'data',
                (done, total) => {
                    showInstallProgress(`Установка ${stageLabel(stage)}`, done, total);
                },
                {
                    persistExtractedFiles: false,
                    writeToFs: true,
                    progressEvery: 24,
                },
            );
            showInstallProgress(`Установка ${stageLabel(stage)}`, 1, 1);

            const totalFiles = Number(restoreStats?.totalFiles || 0);
            const writtenFiles = Number(restoreStats?.writtenFiles || 0);
            const missingFiles = Number(restoreStats?.writeErrors || 0);
            const installOk = missingFiles === 0 && totalFiles > 0 && writtenFiles === totalFiles;

            if (!installOk) {
                await cleanupInstalledPaths(Array.isArray(restoreStats?.writtenPaths) ? restoreStats.writtenPaths : []);
                console.error(`[packs] direct install ${stageLabel(stage)} incomplete`, {
                    stage,
                    reason,
                    totalFiles,
                    writtenFiles,
                    missingFiles,
                });
                showCriticalPackError(`Ошибка установки ${stageLabel(stage)}`, `direct-install:${reason}`);
                return false;
            }

            clearCachedStageFlags(stage);
            if (stage === 2) {
                clearCachedStageFlags(3);
                await window.idbDeletePackManifest(3);
                setInstalledState(true, false);
            } else {
                setStageInstalled(3, true);
            }

            normalizeStates();
            tryAutoPublishInstalled(`direct-install-${stage}`);
            updateInstallBarState();

            const elapsedMs = Math.round(H.nowMs() - (installStartedAt.get(stage) || H.nowMs()));
            log(`[packs] direct install done ${stageLabel(stage)}`, {
                stage,
                reason,
                elapsedMs,
                files: writtenFiles,
                totalFiles,
            });
            return true;
        } catch (err) {
            console.warn(`[packs] direct install ${stageLabel(stage)} failed`, err);
            showCriticalPackError(`Ошибка установки ${stageLabel(stage)}`, err);
            return false;
        } finally {
            installStartedAt.delete(stage);
            clearInstallProgress();
        }
    };

    const installStageFromCache = (stage, reason = 'manual') => {
        if (installPromises.has(stage)) return installPromises.get(stage);

        const promise = (async () => {
            const pack = getPack(stage);
            if (!pack) return false;

            clearCriticalPackError();
            normalizeStates();

            if (installedState[stage]) {
                tryAutoPublishInstalled(`install-skip-${stage}`);
                log(`[packs] install skip ${stageLabel(stage)} (already loaded)`, { stage, reason });
                return true;
            }

            for (const depStage of pack.dependsOn) {
                if (!installedState[depStage]) {
                    const depReady = await ensureStageDownloaded(depStage);
                    if (!depReady) {
                        const okDep = await startStageDownload(depStage);
                        if (!okDep) return false;
                    }

                    const depInstalled = await installStageFromCache(depStage, `${reason}-dep`);
                    if (!depInstalled) return false;
                }
            }

            const manifest = await window.idbReadPackManifest(stage);
            if (!Array.isArray(manifest) || manifest.length === 0) {
                clearCachedStageFlags(stage);
                await window.idbDeletePackManifest(stage);
                clearDownloadedStage(stage);
                updateInstallBarState();
                console.warn(`[packs] install ${stageLabel(stage)}: extracted manifest missing`, { stage, reason });
                showCriticalPackError(`Кэш ${stageLabel(stage)} повреждён`, `manifest-missing:${reason}`);
                return false;
            }

            installStartedAt.set(stage, H.nowMs());
            log(`[packs] install start ${stageLabel(stage)}`, {
                stage,
                reason,
                files: manifest.length,
            });

            showInstallProgress(`Установка ${stageLabel(stage)}`, 0, 1);

            const restoreStats = await window.idbRestorePackStageToFS(stage);
            showInstallProgress(`Установка ${stageLabel(stage)}`, 1, 1);

            const totalFiles = Number(restoreStats?.totalFiles || 0);
            const writtenFiles = Number(restoreStats?.restoredFiles || 0);
            const missingFiles = Number(restoreStats?.missingFiles || 0);
            const installOk = missingFiles === 0 && totalFiles > 0 && writtenFiles === totalFiles;

            if (!installOk) {
                await cleanupInstalledPaths(Array.isArray(restoreStats?.paths) ? restoreStats.paths : []);
                await window.idbDeletePackManifest(stage);
                clearCachedStageFlags(stage);
                if (stage === 2) {
                    setInstalledState(false, false);
                } else {
                    setStageInstalled(3, false);
                }

                console.error(`[packs] install ${stageLabel(stage)} incomplete`, {
                    stage,
                    reason,
                    totalFiles,
                    writtenFiles,
                    missingFiles,
                });

                normalizeStates();
                updateInstallBarState();
                showCriticalPackError(`Ошибка установки ${stageLabel(stage)}`, `restore-incomplete:${reason}`);
                return false;
            }

            if (stage === 2) {
                setInstalledState(true, false);
                markPackInstalledKey(2, true);
            }

            if (stage === 3) {
                setStageInstalled(3, true);
            }

            normalizeStates();
            tryAutoPublishInstalled(`install-${stage}`);
            updateInstallBarState();

            const elapsedMs = Math.round(H.nowMs() - (installStartedAt.get(stage) || H.nowMs()));
            log(`[packs] install done ${stageLabel(stage)}`, {
                stage,
                reason,
                elapsedMs,
                files: writtenFiles,
                totalFiles,
                missingFiles,
            });

            return true;
        })().catch((err) => {
            console.warn(`[packs] install ${stageLabel(stage)} failed`, err);
            showCriticalPackError(`Ошибка установки ${stageLabel(stage)}`, err);
            return false;
        }).finally(() => {
            installStartedAt.delete(stage);
            installPromises.delete(stage);
            clearInstallProgress();
        });

        installPromises.set(stage, promise);
        return promise;
    };

    const installPendingExtraPacks = async () => {
        if (installPendingPromise) return installPendingPromise;

        installPendingPromise = (async () => {
            updatePendingFromState();

            while (pendingInstallStages.length > 0) {
                const stage = pendingInstallStages[0];
                const pack = getPack(stage);
                const ctx = getPackContext();
                if (!pack || !pack.isAutoInstall(ctx)) break;

                const ok = await installStageFromCache(stage, 'auto-install');
                if (!ok) break;
                updatePendingFromState();
            }

            return true;
        })().finally(() => {
            clearInstallProgress();
            installPendingPromise = null;
        });

        return installPendingPromise;
    };

    const autoInstallByPlatform = async (reason = 'auto') => {
        normalizeStates();
        syncPersistentCacheState(`auto-install-${reason}`);
        const isStartupReason = String(reason).startsWith('startup');
        if (isStartupReason) {
            startupInstallInProgress = true;
            if (HIDE_STARTUP_INSTALL_UI) installBar.hide();
        }

        const ctx = getPackContext();
        const autoStages = PACK_ORDER.filter((stage) => {
            if (!downloaded[stage] || installedState[stage]) return false;
            return isStartupReason
                ? getPack(stage).isStartupAutoInstall(ctx, downloaded)
                : getPack(stage).isAutoInstall(ctx);
        });

        log('[packs] auto-install plan', {
            reason,
            platform: PLATFORM_TYPE,
            downloaded: { stage2: downloaded[2], stage3: downloaded[3] },
            autoStages,
        });

        try {
            for (const stage of autoStages) {
                await installStageFromCache(stage, reason);
            }
        } finally {
            if (isStartupReason) {
                startupInstallInProgress = false;
                if (HIDE_STARTUP_INSTALL_UI) installBar.hide();
            }
        }
    };

    const loadSecondPack = async () => {
        log('[packs] Module.loadSecondPack called');
        await requestDownloadByCpp(2);
        return true;
    };

    const loadThirdPack = async () => {
        log('[packs] Module.loadThirdPack called');
        await requestDownloadByCpp(3);
        return true;
    };

    Module['hasFullLoadedContent'] = (lvl = 0) => {
        if (hasPreloadedFullContent()) {
            markPreloadedFullContent(`has-full-loaded-content-${lvl}`);
            return true;
        }

        normalizeStates();

        const hasSecond = !!installedState[2];
        const hasThird = !!installedState[3];

        if (lvl <= 0) return hasSecond && hasThird;
        if (lvl === 1) return hasSecond;
        if (lvl === 2) return hasSecond && hasThird;
        return hasSecond && hasThird;
    };

    Module['loadAllExtraPacks'] = async () => {
        if (hasPreloadedFullContent()) {
            return markPreloadedFullContent('load-all-extra-packs');
        }

        log('[packs] Module.loadAllExtraPacks called');
        gameBootCompleted = true;
        updateInstallBarState();

        await ensureDownloadStateReady();
        syncPersistentCacheState('load-all-extra-packs');

        if (!downloaded[2]) {
            const secondReady = await startStageDownload(2);
            if (!secondReady && !installedState[2]) {
                updateInstallBarState();
                return false;
            }
        }
        await ensureDownloadStateReady();
        await autoInstallByPlatform('stage2-ready');
        clearInstallProgress();
        updateInstallBarState();

        if (!downloaded[3]) {
            const thirdReady = await startStageDownload(3);
            if (!thirdReady && !installedState[3]) {
                updateInstallBarState();
                return false;
            }
        }

        await ensureDownloadStateReady();
        await autoInstallByPlatform('stage3-ready');

        clearInstallProgress();
        updateInstallBarState();
        normalizeStates();
        return !!publishedState[2] && !!publishedState[3];
    };

    Module['applyStartupAutoInstall'] = async () => {
        if (hasPreloadedFullContent()) {
            return markPreloadedFullContent('startup-auto-install');
        }

        await ensureDownloadStateReady();
        syncPersistentCacheState('startup-auto-install');
        await autoInstallByPlatform('startup-auto-install');
        normalizeStates();
        tryAutoPublishInstalled('startup-auto-install');
        downloadBar.hide();
        if (HIDE_STARTUP_INSTALL_UI) installBar.hide();
        else updateInstallBarState();
        return !!publishedState[2] && !!publishedState[3];
    };

    Module['onGameBootCompleted'] = () => {
        gameBootCompleted = true;
        updateInstallBarState();
    };

    Module['installPendingExtraPacks'] = installPendingExtraPacks;
    Module['loadSecondPack'] = loadSecondPack;
    Module['loadThirdPack'] = loadThirdPack;

    const validateDownloadedMarkers = async () => {
        await ensureDownloadStateReady();
    };

    if (hasPreloadedFullContent()) {
        markPreloadedFullContent('init');
    } else {
        normalizeStates();
        readDownloadedMarkers();
        syncPersistentCacheState('init');
        tryAutoPublishInstalled('init');
        syncPublishedToWindow();
        updateInstallBarState();

        validateDownloadedMarkers().catch((err) => {
            console.warn('[packs] validateDownloadedMarkers failed', err);
        });
    }
})();
