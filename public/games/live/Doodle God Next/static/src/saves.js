
const clearCookiesAndCache = () => {
    // Clear cookies
    document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });

    // Clear cache
    if ('caches' in window) {
        caches.keys().then(names => {
            for (let name of names) {
                caches.delete(name);
            }
        });
    }

    // Clear localStorage
    // localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    console.log('Cookies, cache, localStorage, and sessionStorage cleared.');
};
window.clearCookiesAndCache = clearCookiesAndCache;

const SAVE_VERSION_KEY = 'dg_save_version';
const SAVE_RESOURCES_KEY = 'dg_resources_version';

const {
    SAVE_VERSION,
    SAVE_RESOURCES,
} = window.DGConfig.saves;
const version = String(window.dg_version || '');

const isExternalSaveRuntime = () => !!(
    window.DGStorage?.isCloudRuntime?.()
    || (window.DGConfig?.gamePush?.enabled && window.DGConfig?.gamePush?.projectId && window.DGConfig?.gamePush?.publicToken)
);

const storedVersion = localStorage.getItem(SAVE_VERSION_KEY);
if (storedVersion !== SAVE_VERSION && !isExternalSaveRuntime()) {
    localStorage.clear();
}
localStorage.setItem(SAVE_VERSION_KEY, SAVE_VERSION);


const storedResourcesVersion = localStorage.getItem(SAVE_RESOURCES_KEY);
if (storedResourcesVersion !== SAVE_RESOURCES) {
    try {
        indexedDB.deleteDatabase('ems-fs-cache');
    } catch (_) { /* ignore */ }
}
localStorage.setItem(SAVE_RESOURCES_KEY, SAVE_RESOURCES);


// const selectedBuild = localStorage.getItem('typeBuild') || defaultBuild;
console.log("Curr Version = ", version);

const previousVersion = document.cookie.split('; ').find(row => row.startsWith('bundleVersion='));
if (previousVersion && previousVersion.split('=')[1] === version) {
    console.log("Version already loaded:", version);
} else {
    console.log("New version detected. Clearing cookies and cache.");
    window.clearCookiesAndCache();
    document.cookie = `bundleVersion=${version};path=/`;
}


function saveConfig(name, text) {
    if (window.DGStorage?.saveConfig) {
        window.DGStorage.saveConfig(name, text);
        return;
    }

    try {
        // console.log(`Configuration "${name}" saved successfully. [${text}]`);
        localStorage.setItem(name, text);

        // кодируем, чтобы JS eval не ломался
        // const encoded = btoa(unescape(encodeURIComponent(text)));
        // localStorage.setItem(name, encoded);

    } catch (e) {
        console.error("Error saving configuration:", e);
    }
}

function readConfig(name) {
    if (window.DGStorage?.readConfig) {
        return window.DGStorage.readConfig(name);
    }

    try {
        const value = localStorage.getItem(name);
        if (!value) return "";
        // console.log(`Configuration "${name}" read successfully:`, value);
        return value || "";
        // return decodeURIComponent(escape(atob(value)));
    } catch (e) {
        // console.error("Error reading configuration:", e);
        return "";
    }
}

const TEMP_IMPORT_DEFAULT_FILES = [
    'profile.json',
    'default/achievements_save.xml',
    'default/artifacts_save.xml',
    'default/auto_action.xml',
    'default/bejoined_save.xml',
    'default/config.txt',
    'default/episode1_save.xml',
    'default/fullscreen_promo_playlist.xml',
    'default/infinite_craft_save.xml',
    'default/matchtrix_save.xml',
    'default/mission_save.xml',
    'default/notifications_save.xml',
    'default/opened_elements_save.xml',
    'default/planet_save.xml',
    'default/puzzle_christmas_decor_save.xml',
    'default/puzzle_firecracker_save.xml',
    'default/puzzle_flower_save.xml',
    'default/puzzle_ice_cream_save.xml',
    'default/puzzle_locomotive_save.xml',
    'default/puzzle_lovebow_save.xml',
    'default/puzzle_skyscraper_save.xml',
    'default/puzzle_snow_save.xml',
    'default/puzzle_tavern_save.xml',
    'default/puzzle_xmastree_save.xml',
    'default/quest_20th_save.xml',
    'default/quest_devil_save.xml',
    'default/quest_egypt_save.xml',
    'default/quest_lost_save.xml',
    'default/quest_opened_elements_save.xml',
    'default/quest_princess_save.xml',
    'default/quest_qad_save.xml',
    'default/quest_santa_save.xml',
    'default/statistics.xml',
    'default/total_progress.xml',
    'default/tutorials_save.xml',
];

function clearImportedTempNamespace() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.indexOf('temp/') === 0) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
}

async function fetchTextIfExists(url) {
    try {
        const result = window.DGHost?.fetch
            ? await window.DGHost.fetch(url, { cache: 'no-store' })
            : { response: await fetch(url, { cache: 'no-store' }) };
        const response = result.response;
        if (!response.ok) {
            return null;
        }
        return await response.text();
    } catch (error) {
        console.warn('[importSaves] fetch failed:', url, error);
        return null;
    }
}

function normalizeRelativePath(path) {
    return path.replace(/^\/+/, '').replace(/\/+/g, '/');
}

function looksLikeHtml(text) {
    if (!text) return false;
    const start = text.trim().slice(0, 64).toLowerCase();
    return start.startsWith('<!doctype html') || start.startsWith('<html');
}

async function gatherImportableTempFiles() {
    const collected = new Map();
    const registerFile = (url, storageKey) => {
        const normalizedKey = normalizeRelativePath(storageKey);
        if (!normalizedKey) {
            return;
        }
        collected.set(normalizedKey, {
            url,
            storageKey: normalizedKey,
        });
    };

    const profileText = await fetchTextIfExists('temp/profile.json');
    if (!profileText || looksLikeHtml(profileText)) {
        return [];
    }

    registerFile('temp/profile.json', 'temp/profile.json');

    try {
        const profile = JSON.parse(profileText);
        const users = Array.isArray(profile.users) ? profile.users : [];

        for (const user of users) {
            if (!user) continue;
            TEMP_IMPORT_DEFAULT_FILES.forEach((relativePath) => {
                if (relativePath === 'profile.json') {
                    return;
                }
                const pathWithoutDefault = relativePath.replace(/^default\//, '');
                registerFile(
                    `temp/${user}/${pathWithoutDefault}`,
                    `temp/${user}/${pathWithoutDefault}`
                );
            });
        }
    } catch (error) {
        console.warn('[importSaves] profile.json parse failed, only profile.json will be imported', error);
    }

    return Array.from(collected.values());
}

async function importSaves() {
    console.log('[importSaves] requested');

    const files = await gatherImportableTempFiles();
    if (!files.length) {
        console.log('[importSaves] no saves found in /temp/');
        return false;
    }

    clearImportedTempNamespace();

    let importedCount = 0;
    const importedKeys = [];
    for (const file of files) {
        const content = await fetchTextIfExists(file.url);
        if (content == null || looksLikeHtml(content)) {
            continue;
        }
        saveConfig(file.storageKey, content);
        importedCount += 1;
        importedKeys.push(file.storageKey);
    }

    if (!importedCount) {
        console.log('[importSaves] no saves imported');
        return false;
    }

    console.log('[importSaves] imported keys:', importedKeys);
    console.log(`[importSaves] imported ${importedCount} files. Restarting build...`);
    window.location.reload();
    return true;
}

window.importSaves = importSaves;

// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         //--------------------------------------------------
//         navigator.serviceWorker.register(`./service-worker.js?v=${version}`)
//             .then(registration => {
//                 console.log('ServiceWorker registration successful with scope: ', registration.scope);
//                 registration.update();
//             }).catch(err => {
//                 console.log('ServiceWorker registration failed: ', err);
//             });
//     });
// }
