(function (global) {
    'use strict';

    const params = new URLSearchParams(global.location ? global.location.search : '');
    const location = global.location || {};
    const hostname = location.hostname || '';
    const pathname = location.pathname || '';
    const readFlag = (name, fallback = false) => {
        if (!params.has(name)) return fallback;
        const value = String(params.get(name)).toLowerCase();
        return value !== '0' && value !== 'false' && value !== 'off';
    };

    const debugHostnames = new Set([
        // 'z4m.online',
        // 'www.z4m.online',
        // '127.0.0.1',
        // 'localhost',

        // 'www.joybits.games',
        // 'joybits.games'
    ]);
    const debugPathnames = [
        /(^|\/)test(\/|$)/,
    ];
    const debug = readFlag('debug', debugHostnames.has(hostname));
    const importConfig = readFlag('import_config', false);
    const releaseMode = !(hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '');


    const getConfigScriptVersion = () => {
        const scriptUrl = document.currentScript?.src || '';
        const versionMatch = scriptUrl.match(/v=([\d.]+)/);
        if (versionMatch) {
            return versionMatch[1];
        }
        return null;
    };
    const version = getConfigScriptVersion() || '';

    const resolveAntialias = (value) => {
        if (value === 0 || value === false) return 0;
        if (value === 1 || value === true) return 1;

        const memory = global.navigator?.deviceMemory || 0;
        const cores = global.navigator?.hardwareConcurrency || 0;
        const dpr = global.devicePixelRatio || 1;

        if ((memory && memory <= 2) || (cores && cores <= 4)) return 0;
        if (dpr >= 3 && ((memory && memory <= 4) || (cores && cores <= 6))) return 0;

        return 1;
    };

    const detectLocales = () => {
        const toUpper = (value) => String(value || '').trim().replace(/_/g, '-').toUpperCase();
        const result = [];
        const seen = new Set();
        const pushUnique = (value) => {
            if (!value || seen.has(value)) return;
            seen.add(value);
            result.push(value);
        };

        const languages = Array.isArray(global.navigator?.languages) && global.navigator.languages.length
            ? global.navigator.languages
            : [global.navigator?.language || 'en'];

        for (const raw of languages) {
            const locale = toUpper(raw);
            const primary = locale.split('-')[0];
            if (!locale || !primary) continue;

            if (primary === 'ZH') pushUnique('ZH-HANS');
            if (primary === 'PT') pushUnique('PT');

            pushUnique(primary);
            pushUnique(locale);
        }

        return (result.length ? result : ['EN']).reverse();
    };


    global.dg_version = version;
    global.HasRelease = releaseMode;
    global.HasRealDPR = true;
    global.AdsTimeout = 0;
    global.LogLevel = 100000;
    global.antialias = resolveAntialias('auto');
    global.RENDER_DEBUG_GUI = debug;
    global.DG_IMPORT_CONFIG = importConfig;
    global.dg_system_locales = detectLocales();
    global.dg_system_locales_csv = global.dg_system_locales.join(',');

    global.DGConfig = {
        debug, // Общий ручной debug-флаг из ?debug=1: включает JS-логи и debug UI.
        host: [
            '.',
            'https://joybits.games/html5/doodle-god-next/',
        ], // Единый список host для splash/assets/sounds/packs/temp. Первый: текущий домен, потом внешний fallback.
        saves: {
            SAVE_VERSION: '2.8', // Менять при несовместимости формата сохранений; local saves будут очищены.
            SAVE_RESOURCES: '3.3' + global.dg_version, // Менять при несовместимости browser resource cache; IndexedDB cache будет очищен.
        },
        platform: {
            provider: 'gamepush', // gamepush | local. Определяет основной web platform facade.
            market: 'gamepush', // gamepush | local. Управляет store/market-логикой без прямого SDK в C++.
            gameId: 'DoodleGod', // DEVICE()->getGameID().
            shortGameId: 'dg', // DEVICE()->getShortGameID().
            gameVariant: '', // DEVICE()->getGameVariant(); например Pixel.
            shortGameVariant: '', // DEVICE()->getShortGameVariant(); например x.
            virtualGameID: '', // Резерв для внешних платформ/статистики, если нужен отдельный id.
            store: 'GAMEPUSH', // DEVICE()->getStore().
            platform: 'EMS', // DEVICE()->getPlatform().
            region: 'auto', // auto берёт страну/локаль из JS/GamePush; можно задать RU/US вручную.
            deviceDesc: 'WEB', // DEVICE()->getDeviceDesc().
            localTimeZone: 'auto', // auto берёт browser timezone offset в часах.
            deviceType: 'auto', // auto | pc | phone | tablet.
            reviewDeviceType: 'auto', // Резерв под review/store rules.
        },
        analytics: {
            technicalProviderId: 'ems', // Provider id, который видит C++ AnalyticsManager.
            gameAnalytics: {
                enabled: true, // Без ключей включается noop provider, но очередь DGWebAnalytics продолжает работать.
                debug: readFlag('gameanalytics_debug', debug), // ?gameanalytics_debug=1 включает SDK info/verbose logs.
                sdkUrl: 'https://cdn.jsdelivr.net/npm/gameanalytics@4.4.7/dist/GameAnalytics.min.js',
                gameKey: 'd3052a4ed16360c59d2858db457f9f4c', // Заполнить вручную из GameAnalytics.
                secretKey: 'c0b69e3d42dc79dbd1d06612293a0c304e41afc1', // Заполнить вручную из GameAnalytics.
            },
        },
        gamePush: {
            enabled: true, // Включает GamePush SDK; без projectId/publicToken уходит в noop/local fallback.
            debug: readFlag('gamepush_debug', debug), // Ручные GamePush-логи: ?gamepush_debug=1 или общий ?debug=1.
            sdkUrl: 'https://gamepush.com/sdk/game-score.js', // Hosted SDK: chunks грузятся совместимой версией с GamePush CDN.
            projectId: '28081', // GamePush project id, заполняется перед реальной интеграцией.
            publicToken: 'TgNE5XCQFq2SbAanlSGBJw0t3EWZhbIP', // GamePush public token, заполняется вместе с projectId.
            ads: {
                debugFallback: debug && !releaseMode, // Локально разрешает FakeAdsWidget, если GamePush ads недоступны.
                releaseFallback: false, // В release fake-реклама запрещена: fail callback без reward.
                unavailableMessage: 'Реклама сейчас недоступна, попробуйте позже.',
                debugRewardMessage: 'Debug ad: reward granted.',
                debugInterstitialMessage: 'Debug ad: interstitial skipped.',
            },
            storage: {
                flushDelayMs: 1000, // Debounce записи gp.player.sync() после saveConfig().
                flushOnSave: false, // true пишет в gp.player сразу на каждый saveConfig().
                maxPayloadBytes: 1024 * 1024, // GamePush player profile limit; warning threshold for packed saves.
                key: 'dg_storage_zip_v1', // Один player field для всех doc/config/save файлов, включая statistics.xml.
                zipFile: 'storage.json', // Имя json-файла внутри zip payload.
            },
            payments: {
                logPriceList: debug, // Browser logs для прайса/покупок GamePush: вручную через ?debug=1 или ?gamepush_debug=1.
                unavailableMessage: 'Покупки сейчас недоступны, попробуйте позже.',
            },
        },
    };

})(window);
