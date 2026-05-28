(function (global) {
    'use strict';

    if (global.DGHost) return;

    const cleanHost = (value) => String(value || '').trim().replace(/\/+$/, '');
    const unique = (items) => {
        const seen = new Set();
        return items.filter((item) => {
            if (!item || item === 'off' || seen.has(item)) return false;
            seen.add(item);
            return true;
        });
    };
    const debug = () => !!global.DGConfig?.debug;
    const hostList = () => {
        const configured = global.DGConfig?.host;
        const rawHosts = Array.isArray(configured) ? configured : [configured || '.'];
        return unique(rawHosts.map(cleanHost));
    };
    const failedHosts = new Set();

    const resolveFromHost = (host, path) => {
        const normalizedPath = String(path || '').replace(/^\/+/, '');
        if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;
        if (!host || host === '.') return normalizedPath;
        return `${host}/${normalizedPath}`;
    };

    const orderedHosts = () => {
        const hosts = hostList();
        return hosts.filter((host) => !failedHosts.has(host)).concat(hosts.filter((host) => failedHosts.has(host)));
    };

    const candidates = (path) => {
        if (/^https?:\/\//i.test(String(path || ''))) {
            return [{ host: '', url: String(path) }];
        }

        return orderedHosts().map((host) => ({
            host,
            url: resolveFromHost(host, path),
        }));
    };

    const logFailed = (hostOrUrl) => {
        if (debug() && global.console) {
            global.console.warn('[DGHost] fallback host failed:', hostOrUrl);
        }
    };

    const markFailed = (hostOrUrl) => {
        const value = cleanHost(hostOrUrl);
        if (!value) return;

        if (!/^https?:\/\//i.test(value) && hostList().indexOf('.') !== -1) {
            failedHosts.add('.');
            logFailed(hostOrUrl);
            return;
        }

        for (const host of hostList()) {
            if (value === host || value.indexOf(host + '/') === 0) {
                failedHosts.add(host);
                logFailed(hostOrUrl);
                return;
            }
        }
    };

    const fetchWithFallback = async (path, options) => {
        let lastError = null;

        for (const item of candidates(path)) {
            try {
                const response = await global.fetch(item.url, options);
                if (!response.ok) {
                    markFailed(item.host || item.url);
                    lastError = new Error(`HTTP ${response.status}`);
                    continue;
                }
                return { response, url: item.url, host: item.host };
            } catch (error) {
                markFailed(item.host || item.url);
                lastError = error;
            }
        }

        throw lastError || new Error(`No host candidates for ${path}`);
    };

    const loadElement = (element, path) => {
        const urls = candidates(path);
        let index = 0;
        const next = () => {
            const item = urls[index++];
            if (!item) return;
            element.onerror = () => {
                markFailed(item.host || item.url);
                next();
            };
            element.onload = () => {
                element.onerror = null;
            };
            element.setAttribute('src', item.url);
        };
        next();
    };

    global.DGHost = {
        hosts: hostList,
        candidates,
        urls: (path) => candidates(path).map((item) => item.url),
        resolve: (path) => (candidates(path)[0]?.url || String(path || '')),
        markFailed,
        fetch: fetchWithFallback,
        loadElement,
        state: {
            failedHosts,
        },
    };
})(window);
