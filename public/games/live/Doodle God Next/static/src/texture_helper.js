Module['requestHostTexture'] = (fileName) => {
    if (!fileName) return;
    const cached = hostTextureState.get(fileName);
    if (cached?.data) {
        const uploader = getHostTextureUploader();
        if (uploader) {
            uploader(fileName, cached.width, cached.height, cached.data);
        } else {
            hostTextureQueue.push({ name: fileName, width: cached.width, height: cached.height, data: cached.data });
        }
        return;
    }
    if (hostTextureState.has(fileName)) return;

    hostTextureState.set(fileName, 'loading');

    // Kick off real fetch in background and push placeholder with real size if known
    const pushPlaceholder = () => {
        const cleanName = normalizePath(fileName);
        const meta = getImageSize(cleanName) || getImageSize(fileName);
        const width = meta?.width || 1;
        const height = meta?.height || 1;
        const uploader = getHostTextureUploader();
        if (uploader) {
            const white = new Uint8Array(width * height * 4);
            white.fill(255);
            uploader(fileName, width, height, white);
        }
    };
    pushPlaceholder();

    const fetchPath = normalizePath(fileName);
    logHostFetch('fetch', fetchPath);
    (window.DGHost?.fetch ? window.DGHost.fetch(fetchPath).then((result) => result.response) : fetch(fetchPath))
        .then((resp) => {
            if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
            return resp.blob();
        })
        .then(decodeBitmap)
        .then((bitmap) => {
            const imageData = bitmapToImageData(bitmap);
            const payload = {
                name: fileName,
                width: imageData.width,
                height: imageData.height,
                data: new Uint8Array(imageData.data),
            };
            const uploader = getHostTextureUploader();
            if (uploader) {
                uploader(payload.name, payload.width, payload.height, payload.data);
            } else {
                hostTextureQueue.push(payload);
            }
            hostTextureState.set(fileName, { width: payload.width, height: payload.height, data: payload.data });
        })
        .catch((err) => {
            hostTextureState.delete(fileName);
        });
};



const hostTextureState = new Map();
const hostTextureQueue = [];
let fileMap = null;
Module['fsIndex'] = null;
let secondPackPromise = null;

const normalizePath = (p) => {
    if (!p) return '';
    let out = p;
    out = out.replace(/^https?:\/\/[^/]+\//, ''); // strip origin if accidentally passed
    if (out.startsWith('./')) out = out.slice(2);
    out = out.replace(/^\/*/, ''); // drop leading slashes
    // ensure data/ prefix
    if (!out.startsWith('data/')) {
        out = `data/${out}`;
    }
    return out;
};

const loadFileMap = () => {
    if (fileMap) return Promise.resolve(fileMap);
    const request = window.DGHost?.fetch
        ? window.DGHost.fetch('data/file-map.json').then((result) => result.response)
        : fetch('data/file-map.json');
    return request
        .then((r) => {
            if (!r.ok) throw new Error('file-map fetch failed');
            return r.json();
        })
        .then((json) => {
            fileMap = json;
            Module['fsIndex'] = fileMap;
            return fileMap;
        })
        .catch((err) => {
            console.warn('file-map unavailable', err);
            fileMap = { root: 'data', files: [] };
            Module['fsIndex'] = fileMap;
            return fileMap;
        });
};

const findNode = (relPath) => {
    if (!fileMap) return null;
    var parts = normalizePath(relPath).split('/').filter(Boolean);
    if (parts[0] == "data") {
        parts.splice(0, 1)
    }
    let level = fileMap.files;
    let node = null;
    for (const part of parts) {
        node = level?.find((n) => n.name === part);
        if (!node) {
            // console.log(`not finded - ${part}`)
            return null;
        }
        level = node.children;
    }
    return node;
};

const fileExistsInModuleFS = (relPath) => {

    // Prefer global FS; do not touch Module.FS if not exported.
    const FSref = (typeof globalThis !== 'undefined' && globalThis.FS) || (typeof FS !== 'undefined' && FS);
    if (!FSref) return false;
    try {
        const path = '/' + normalizePath(relPath);
        if (typeof FSref.analyzePath === 'function') {
            const analysis = FSref.analyzePath(path);
            return !!analysis?.exists;
        }
        if (typeof FSref.stat === 'function') {
            FSref.stat(path);
            return true;
        }
        return false;
    } catch (err) {
        return false;
    }
};

const listDir = (relPath) => {
    const node = findNode(relPath);
    if (!node || node.type !== 'dir' || !Array.isArray(node.children)) return [];

    return node.children.map((c) => ({
        filePath: relPath.endsWith('/') || relPath === '' ? `${relPath}${c.name}` : `${relPath}/${c.name}`,
        fileName: c.name,
        isDirectory: c.type === 'dir',
        image: c.image,
        size: c.size,
    }));
};

const fileExistsInHost = (relPath) => Boolean(findNode(relPath));

const getImageSize = (relPath) => {
    const node = findNode(relPath);
    if (node?.type === 'file' && node.image) return node.image;
    return null;
};

const logHostFetch = (msg, file) => {
    if (typeof console !== 'undefined') {
        console.log(`[host-texture] ${msg}: ${file}`);
    }
};

// loadFileMap();


const getHostTextureUploader = () => {
    const ready = Module?._of_host_texture_ready;

    return null;
    if (!ready || !Module._malloc || !Module._free || !Module.HEAPU8) return null;
    if (!Module._pushHostTexture) {
        Module._pushHostTexture = (name, width, height, data) => {
            debugger
            const safeData = data || new Uint8Array(0);


            const nameLen = _lengthBytesUTF8(name) + 1;
            const namePtr = Module._malloc(nameLen);

            _stringToUTF8(name, namePtr, nameLen);
            const dataPtr = safeData.length ? Module._malloc(safeData.length) : 0;
            if (safeData.length) {
                Module.HEAPU8.set(safeData, dataPtr);
            }
            ready(namePtr, width, height, dataPtr, safeData.length);
            Module._free(namePtr);
            if (dataPtr) Module._free(dataPtr);
            debugger
        };
    }
    return Module._pushHostTexture;
};

const flushHostTextureQueue = () => {
    const uploader = getHostTextureUploader();
    if (!uploader) return;
    while (hostTextureQueue.length) {
        const job = hostTextureQueue.shift();
        debugger
        uploader(job.name, job.width, job.height, job.data);
    }
};

const decodeBitmap = (blob) => {
    if (typeof createImageBitmap === 'function') {
        return createImageBitmap(blob);
    }
    return new Promise((resolve, reject) => {
        if (typeof Image === 'undefined') {
            reject(new Error('Image decoding is not available in this environment'));
            return;
        }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
    });
};

const bitmapToImageData = (bitmap) => {
    const canvas = typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(bitmap.width, bitmap.height)
        : (() => {
            if (typeof document === 'undefined') {
                throw new Error('No canvas available for texture decode');
            }
            const c = document.createElement('canvas');
            c.width = bitmap.width;
            c.height = bitmap.height;
            return c;
        })();

    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
};


Module['fileExistsInModuleFS'] = fileExistsInModuleFS;
Module['fileExistsInHost'] = fileExistsInHost;
Module['fsList'] = listDir;
Module['getImageSize'] = getImageSize;
