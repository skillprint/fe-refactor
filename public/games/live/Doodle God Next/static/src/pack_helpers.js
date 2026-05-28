(() => {
    if (window.DGPackHelpers) return;

    const createBar = (opts) => {
        if (!window.PackProgressBar) {
            throw new Error('[packs] PackProgressBar class is required');
        }
        return new window.PackProgressBar(opts);
    };

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const nowMs = () => (
        typeof performance !== 'undefined' && typeof performance.now === 'function'
            ? performance.now()
            : Date.now()
    );

    const currentVersion = () => String(window.dg_version || '');

    const downloadedStageKey = (stage, prefix = 'dg_pack_zip_downloaded_stage_') => (`${prefix}${stage}_${currentVersion()}`);

    const zipIdbKey = (stage, prefix = '__pack_zip_stage_') => (`${prefix}${stage}_${currentVersion()}`);

    const formatBytes = (bytes) => {
        const value = Math.max(0, Number(bytes || 0));
        if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
        if (value >= 1024) return `${Math.round(value / 1024)} KB`;
        return `${Math.round(value)} B`;
    };

    const formatEta = (seconds) => {
        if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
        const sec = Math.round(seconds);
        const mm = Math.floor(sec / 60);
        const ss = sec % 60;
        return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    };

    const toUint8Array = (raw) => {
        if (!raw) return null;
        if (raw instanceof Uint8Array) return raw;
        if (raw instanceof ArrayBuffer) return new Uint8Array(raw);
        if (ArrayBuffer.isView(raw)) return new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
        return null;
    };

    const unique = (items) => {
        const seen = new Set();
        return items.filter((item) => {
            if (!item || seen.has(item)) return false;
            seen.add(item);
            return true;
        });
    };

    const assetResolve = (path) => {
        if (window.DGHost?.resolve) return window.DGHost.resolve(path);
        return String(path || '').replace(/^\/+/, '');
    };

    const packPath = (stage) => `data/packs/${stage === 2 ? 'second' : 'third'}.zip?v=${window.dg_version || Date.now()}`;

    const packCandidates = (stage) => (
        window.DGHost?.candidates
            ? window.DGHost.candidates(packPath(stage))
            : [{ host: '', url: packPath(stage) }]
    );

    const packUrls = (stage) => {
        return unique(packCandidates(stage).map((item) => item.url || item));
    };

    const packUrl = (stage) => packUrls(stage)[0] || packPath(stage);

    const getPackSizeHint = (stage) => {
        const raw = window.DG_PACK_SIZES?.[stage];
        const value = Number(raw || 0);
        return Number.isFinite(value) && value > 0 ? value : 0;
    };

    window.DGPackHelpers = {
        createBar,
        sleep,
        nowMs,
        currentVersion,
        downloadedStageKey,
        zipIdbKey,
        formatBytes,
        formatEta,
        toUint8Array,
        assetResolve,
        packPath,
        packCandidates,
        packUrls,
        packUrl,
        getPackSizeHint,
    };
})();
