(() => {
    const edgeFill = document.getElementById('edge-fill');
    const leftCanvas = document.getElementById('edge-fill-left');
    const rightCanvas = document.getElementById('edge-fill-right');
    const gameCanvas = document.getElementById('canvas');
    const gameLayout = gameCanvas?.parentElement || null;
    const splash = document.getElementById('splash');
    const splashImage =
        splash?.querySelector('.splash__image_0') ||
        splash?.querySelector('.splash__image') ||
        null;

    if (!edgeFill || !leftCanvas || !rightCanvas || !gameLayout) {
        return;
    }

    const leftCtx = leftCanvas.getContext('2d', { alpha: false });
    const rightCtx = rightCanvas.getContext('2d', { alpha: false });
    if (!leftCtx || !rightCtx) {
        return;
    }

    const TRANSITION_MS = 450;
    const MAX_RETRIES = 32;
    const RETRY_DELAY_MS = 250;
    const EDGE_OVERLAP_CSS = 3;

    const state = {
        currentTexture: null,
        previousTexture: null,
        transitionStartMs: 0,
        transitionMs: TRANSITION_MS,
        transitioning: false,
        requestToken: 0,
        lastPath: '',
        lastLayout: '',
        retries: new Map(),
        cache: new Map(),
        rafId: 0,
        needsRender: true,
        lastLeftWidthCss: -1,
        lastRightWidthCss: -1,
        lastTopCss: -1,
        lastHeightCss: -1,
        activeWidthCss: 1,
        activeHeightCss: 1,
        lastDpr: -1,
    };

    const nowMs = () => (
        typeof performance !== 'undefined' && typeof performance.now === 'function'
            ? performance.now()
            : Date.now()
    );

    const unique = (arr) => [...new Set(arr.filter(Boolean))];

    const normalizePath = (rawPath) => {
        if (!rawPath) return '';
        let path = String(rawPath).trim().replace(/\\/g, '/');

        const queryPos = path.indexOf('?');
        if (queryPos >= 0) path = path.slice(0, queryPos);
        const hashPos = path.indexOf('#');
        if (hashPos >= 0) path = path.slice(0, hashPos);

        const schemePos = path.indexOf('://');
        if (schemePos >= 0) {
            const slashPos = path.indexOf('/', schemePos + 3);
            path = slashPos >= 0 ? path.slice(slashPos) : '';
        }

        if (!path) return '';
        if (path.startsWith('./')) path = path.slice(2);
        if (!path.startsWith('/')) path = `/${path}`;

        const dataPos = path.indexOf('/data/');
        if (dataPos >= 0) {
            path = path.slice(dataPos);
        }

        return path;
    };

    const buildFsCandidates = (normalizedPath) => {
        if (!normalizedPath) return [];

        const raw = normalizedPath.replace(/\/{2,}/g, '/');
        const trimmed = raw.replace(/^\/+/, '');
        const withoutDataPrefix = trimmed.startsWith('data/') ? trimmed.slice(5) : trimmed;

        return unique([
            raw,
            `/${trimmed}`,
            `/${withoutDataPrefix}`,
            `/data/${withoutDataPrefix}`,
            `/documents/${trimmed}`,
            `/documents/data/${withoutDataPrefix}`,
            trimmed,
            withoutDataPrefix,
            `data/${withoutDataPrefix}`,
            `documents/${trimmed}`,
            `documents/data/${withoutDataPrefix}`,
        ]);
    };

    const getFSRef = () => (
        (typeof globalThis !== 'undefined' && globalThis.FS) ||
        (typeof FS !== 'undefined' && FS) ||
        (typeof Module !== 'undefined' && Module?.FS) ||
        null
    );

    const readFsBinary = (path) => {
        const FSref = getFSRef();
        if (!FSref || typeof FSref.readFile !== 'function') return null;

        try {
            if (typeof FSref.analyzePath === 'function') {
                const analysis = FSref.analyzePath(path);
                if (!analysis?.exists) return null;
            }

            const bytes = FSref.readFile(path, { encoding: 'binary' });
            if (!bytes) return null;
            if (bytes instanceof Uint8Array) return bytes;
            if (bytes instanceof ArrayBuffer) return new Uint8Array(bytes);
            if (ArrayBuffer.isView(bytes)) return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
            return null;
        } catch (_) {
            return null;
        }
    };

    const mimeFromPath = (path) => {
        const p = String(path || '').toLowerCase();
        if (p.endsWith('.png')) return 'image/png';
        if (p.endsWith('.webp')) return 'image/webp';
        if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg';
        if (p.endsWith('.bmp')) return 'image/bmp';
        return 'application/octet-stream';
    };

    const decodeBlob = async (blob) => {
        if (typeof createImageBitmap === 'function') {
            return createImageBitmap(blob);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
        });
    };

    const decodeBytes = async (bytes, pathHint) => {
        const blob = new Blob([bytes], { type: mimeFromPath(pathHint) });
        return decodeBlob(blob);
    };

    const assetUrls = (path) => {
        if (window.DGHost?.urls) return window.DGHost.urls(path);
        return [String(path || '').replace(/^\/+/, '')];
    };

    const loadImageFromNetwork = async (normalizedPath) => {
        const trimmed = normalizedPath.replace(/^\/+/, '');
        const noData = trimmed.startsWith('data/') ? trimmed.slice(5) : trimmed;
        const candidates = unique([
            normalizedPath,
            `/${trimmed}`,
            `/data/${noData}`,
            ...assetUrls(normalizedPath),
            ...assetUrls(`/data/${noData}`),
        ]);

        for (const url of candidates) {
            try {
                const response = await fetch(url, { cache: 'force-cache' });
                if (!response.ok) {
                    window.DGHost?.markFailed?.(url);
                    continue;
                }
                const blob = await response.blob();
                const image = await decodeBlob(blob);
                return { image, resolvedPath: url };
            } catch (_) {
                window.DGHost?.markFailed?.(url);
                // try next candidate
            }
        }

        return null;
    };

    const createTexture = (normalizedPath, resolvedPath, image) => {
        const width = image?.width | 0;
        const height = image?.height | 0;
        if (width < 2 || height < 2) return null;

        return {
            path: normalizedPath,
            resolvedPath,
            image,
            width,
            height,
        };
    };

    const loadTexture = async (normalizedPath) => {
        if (!normalizedPath) return null;
        if (state.cache.has(normalizedPath)) return state.cache.get(normalizedPath);

        const fsCandidates = buildFsCandidates(normalizedPath);
        for (const fsPath of fsCandidates) {
            const bytes = readFsBinary(fsPath);
            if (!bytes) continue;
            try {
                const image = await decodeBytes(bytes, fsPath);
                const texture = createTexture(normalizedPath, fsPath, image);
                if (texture) {
                    state.cache.set(normalizedPath, texture);
                    return texture;
                }
            } catch (_) {
                // try next source
            }
        }

        const fromNetwork = await loadImageFromNetwork(normalizedPath);
        if (fromNetwork) {
            const texture = createTexture(normalizedPath, fromNetwork.resolvedPath, fromNetwork.image);
            if (texture) {
                state.cache.set(normalizedPath, texture);
                return texture;
            }
        }

        return null;
    };

    const requestRender = () => {
        if (state.rafId) return;
        state.rafId = requestAnimationFrame(renderFrame);
    };

    const invalidateRender = () => {
        state.needsRender = true;
        requestRender();
    };

    const setCanvasSize = (canvas, widthCss, topCss, heightCss, dpr) => {
        const safeWidthCss = Math.max(0, Math.floor(widthCss));
        const safeTopCss = Math.max(0, Math.floor(topCss));
        const safeHeightCss = Math.max(1, Math.floor(heightCss));

        canvas.style.width = `${safeWidthCss}px`;
        canvas.style.top = `${safeTopCss}px`;
        canvas.style.height = `${safeHeightCss}px`;

        const widthPx = Math.max(1, Math.floor(safeWidthCss * dpr));
        const heightPx = Math.max(1, Math.floor(safeHeightCss * dpr));

        if (canvas.width !== widthPx) canvas.width = widthPx;
        if (canvas.height !== heightPx) canvas.height = heightPx;
    };

    const markGeometryDirty = () => {
        state.lastLeftWidthCss = -1;
        state.lastRightWidthCss = -1;
        state.lastTopCss = -1;
        state.lastHeightCss = -1;
        state.lastDpr = -1;
        invalidateRender();
    };

    const isSplashVisible = () => {
        if (!splash) return false;
        if (splash.style.display === 'none') return false;

        const style = window.getComputedStyle(splash);
        if (style.display === 'none' || style.visibility === 'hidden') return false;

        return Number.parseFloat(style.opacity || '1') > 0.01;
    };

    const getActiveRect = () => {
        const holder = isSplashVisible() ? splash : gameLayout;
        return holder.getBoundingClientRect();
    };

    const updateSideGeometry = (activeRect, dpr) => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const leftGapCss = Math.max(0, activeRect.left);
        const rightGapCss = Math.max(0, viewportWidth - activeRect.right);
        const leftWidthCss = leftGapCss > 0 ? (Math.ceil(leftGapCss) + EDGE_OVERLAP_CSS) : 0;
        const rightWidthCss = rightGapCss > 0 ? (Math.ceil(rightGapCss) + EDGE_OVERLAP_CSS) : 0;
        const topCss = Math.max(0, Math.floor(activeRect.top));
        const bottomCss = Math.max(0, Math.min(viewportHeight, Math.ceil(activeRect.bottom)));
        const heightCss = Math.max(1, bottomCss - topCss);
        const contentWidthCss = Math.max(1, Math.floor(activeRect.width));

        if (
            leftWidthCss === state.lastLeftWidthCss &&
            rightWidthCss === state.lastRightWidthCss &&
            topCss === state.lastTopCss &&
            heightCss === state.lastHeightCss &&
            dpr === state.lastDpr
        ) {
            return false;
        }

        state.lastLeftWidthCss = leftWidthCss;
        state.lastRightWidthCss = rightWidthCss;
        state.lastTopCss = topCss;
        state.lastHeightCss = heightCss;
        state.activeWidthCss = contentWidthCss;
        state.activeHeightCss = heightCss;
        state.lastDpr = dpr;

        edgeFill.style.display = (leftWidthCss > 0 || rightWidthCss > 0) ? 'block' : 'none';

        setCanvasSize(leftCanvas, leftWidthCss, topCss, heightCss, dpr);
        setCanvasSize(rightCanvas, rightWidthCss, topCss, heightCss, dpr);
        return true;
    };

    const clearSides = () => {
        if (leftCanvas.width > 1 && leftCanvas.height > 1) {
            leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
        }

        if (rightCanvas.width > 1 && rightCanvas.height > 1) {
            rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
        }
    };

    const drawTexture = (texture, alpha) => {
        if (!texture || alpha <= 0) return;

        const source = texture.image;
        const sourceWidth = texture.width;
        const sourceHeight = texture.height;
        if (!source || sourceWidth < 2 || sourceHeight < 2) return;

        const targetWidth = Math.max(1, state.activeWidthCss);
        const targetHeight = Math.max(1, state.activeHeightCss);

        const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
        const srcWidth = Math.max(1, targetWidth / scale);
        const srcHeight = Math.max(1, targetHeight / scale);
        const srcX = Math.max(0, Math.min(sourceWidth - srcWidth, (sourceWidth - srcWidth) * 0.5));
        const srcY = Math.max(0, Math.min(sourceHeight - srcHeight, (sourceHeight - srcHeight) * 0.5));

        const leftSrcX = Math.max(0, Math.min(sourceWidth - 1, Math.floor(srcX)));
        const rightSrcX = Math.max(0, Math.min(sourceWidth - 1, Math.floor(srcX + srcWidth - 1)));
        const safeSrcY = Math.max(0, Math.min(sourceHeight - 1, Math.floor(srcY)));
        const safeSrcH = Math.max(1, Math.min(sourceHeight - safeSrcY, Math.floor(srcHeight)));

        if (leftCanvas.width > 1 && leftCanvas.height > 1) {
            leftCtx.save();
            leftCtx.globalAlpha = alpha;
            leftCtx.drawImage(source, leftSrcX, safeSrcY, 1, safeSrcH, 0, 0, leftCanvas.width, leftCanvas.height);
            leftCtx.restore();
        }

        if (rightCanvas.width > 1 && rightCanvas.height > 1) {
            rightCtx.save();
            rightCtx.globalAlpha = alpha;
            rightCtx.drawImage(source, rightSrcX, safeSrcY, 1, safeSrcH, 0, 0, rightCanvas.width, rightCanvas.height);
            rightCtx.restore();
        }
    };

    const drawSplashFallback = () => {
        if (!isSplashVisible()) return false;
        if (!splashImage || !splashImage.complete || !splashImage.naturalWidth || !splashImage.naturalHeight) {
            return false;
        }

        const drawWidth = Math.max(1, splashImage.clientWidth);
        const drawHeight = Math.max(1, splashImage.clientHeight);
        const srcNaturalW = splashImage.naturalWidth;
        const srcNaturalH = splashImage.naturalHeight;

        const scale = Math.max(drawWidth / srcNaturalW, drawHeight / srcNaturalH);
        const cropX = Math.max(0, (srcNaturalW * scale - drawWidth) * 0.5) / scale;
        const cropY = Math.max(0, (srcNaturalH * scale - drawHeight) * 0.5) / scale;
        const cropH = Math.max(1, Math.floor(drawHeight / scale));

        const leftX = Math.max(0, Math.min(srcNaturalW - 1, Math.floor(cropX)));
        const rightX = Math.max(0, Math.min(srcNaturalW - 1, Math.floor(cropX + drawWidth / scale - 1)));

        if (leftCanvas.width > 1 && leftCanvas.height > 1) {
            leftCtx.drawImage(splashImage, leftX, cropY, 1, cropH, 0, 0, leftCanvas.width, leftCanvas.height);
        }
        if (rightCanvas.width > 1 && rightCanvas.height > 1) {
            rightCtx.drawImage(splashImage, rightX, cropY, 1, cropH, 0, 0, rightCanvas.width, rightCanvas.height);
        }

        return true;
    };

    const applyTexture = (texture) => {
        if (texture && state.currentTexture?.path === texture.path) {
            return;
        }

        state.previousTexture = state.currentTexture;
        state.currentTexture = texture || null;
        state.transitionStartMs = nowMs();
        state.transitioning = !!state.previousTexture && !!state.currentTexture;

        if (!state.transitioning) {
            state.previousTexture = null;
        }

        invalidateRender();
    };

    const scheduleRetry = (path, layout, token) => {
        const retryCount = state.retries.get(path) || 0;
        if (retryCount >= MAX_RETRIES) return;

        state.retries.set(path, retryCount + 1);
        window.setTimeout(() => {
            if (token !== state.requestToken) return;
            setBackgroundFromCpp(path, layout, 1);
        }, RETRY_DELAY_MS);
    };

    const setBackgroundFromCpp = async (path, layout, force = 0) => {
        const normalizedPath = normalizePath(path);
        const layoutName = String(layout || '');
        const isForced = Number(force) !== 0;

        if (!isForced && normalizedPath === state.lastPath && layoutName === state.lastLayout) {
            return;
        }

        state.lastPath = normalizedPath;
        state.lastLayout = layoutName;

        const token = ++state.requestToken;

        if (!normalizedPath) {
            applyTexture(null);
            return;
        }

        const texture = await loadTexture(normalizedPath);
        if (token !== state.requestToken) return;

        if (!texture) {
            scheduleRetry(normalizedPath, layoutName, token);
            return;
        }

        state.retries.delete(normalizedPath);
        applyTexture(texture);
    };

    const renderFrame = (now) => {
        state.rafId = 0;
        if (document.hidden) return;

        const dpr = window.devicePixelRatio || 1;
        const geometryChanged = updateSideGeometry(getActiveRect(), dpr);
        if (!geometryChanged && !state.needsRender && !state.transitioning) return;
        state.needsRender = false;

        clearSides();
        if (edgeFill.style.display === 'none') return;

        if (state.currentTexture) {
            if (state.transitioning) {
                const t = Math.max(0, Math.min(1, (now - state.transitionStartMs) / state.transitionMs));
                drawTexture(state.previousTexture, 1.0 - t);
                drawTexture(state.currentTexture, t);

                if (t >= 1) {
                    state.transitioning = false;
                    state.previousTexture = null;
                }
                else {
                    requestRender();
                }
            }
            else {
                drawTexture(state.currentTexture, 1);
            }
            return;
        }

        drawSplashFallback();
    };

    window.EdgeFill = window.EdgeFill || {};
    window.EdgeFill.setBackgroundFromCpp = setBackgroundFromCpp;
    window.setEdgeFillBackgroundFromCpp = setBackgroundFromCpp;

    if (window.__edgeFillPendingFromCpp) {
        const pending = window.__edgeFillPendingFromCpp;
        delete window.__edgeFillPendingFromCpp;
        setBackgroundFromCpp(pending.path, pending.layout, pending.force);
    }

    if (splashImage) {
        splashImage.addEventListener('load', markGeometryDirty, { passive: true });
    }

    if (splash) {
        const observer = new MutationObserver(markGeometryDirty);
        observer.observe(splash, {
            attributes: true,
            attributeFilter: ['class', 'style'],
        });
    }

    window.addEventListener('resize', markGeometryDirty, { passive: true });
    invalidateRender();
})();
