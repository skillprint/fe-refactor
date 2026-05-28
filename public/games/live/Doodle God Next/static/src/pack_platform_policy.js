(function () {
    const collectEnv = () => {
        const ua = navigator.userAgent || '';
        const uaDataPlatform = (navigator.userAgentData && navigator.userAgentData.platform) || '';
        const platform = navigator.platform || '';
        const maxTouchPoints = Number(navigator.maxTouchPoints || 0);

        const isAppleMobileDevice = /iPhone|iPad|iPod/i.test(ua);
        const isIPadLikeMac = platform === 'MacIntel' && maxTouchPoints > 1;
        const isIOSLike = isAppleMobileDevice || isIPadLikeMac;
        const isAndroid = /Android/i.test(ua);
        const isMobile = isAndroid || isIOSLike || /Mobile/i.test(ua);
        const isMacBrowser = !isIOSLike && (
            /macos/i.test(uaDataPlatform)
            || /Mac/i.test(platform)
            || /\bMacintosh\b/i.test(ua)
        );

        const isCriOS = /CriOS/i.test(ua);
        const isFxiOS = /FxiOS/i.test(ua);
        const isEdgiOS = /EdgiOS/i.test(ua);
        const isOPiOS = /OPiOS/i.test(ua);
        const hasSafariToken = /Safari/i.test(ua);
        const hasAppleWebKit = /AppleWebKit/i.test(ua);

        // iOS WebKit browsers (including in-app WKWebView) should follow "safari" policy.
        const isIOSWebKitNonChromeFamily = isIOSLike && hasAppleWebKit && !isCriOS && !isFxiOS && !isEdgiOS && !isOPiOS;
        const isDesktopSafari = hasSafariToken && !/Chrome|Chromium|Edg|OPR|SamsungBrowser/i.test(ua);
        const isSafari = isIOSWebKitNonChromeFamily || isDesktopSafari;

        const isChromeAndroid = isAndroid && /Chrome\//i.test(ua) && !/EdgA|OPR|SamsungBrowser/i.test(ua);
        const isMobileChrome = isMobile && (isCriOS || isChromeAndroid);
        const isMobileSafari = isIOSLike
            && hasAppleWebKit
            && hasSafariToken
            && !isCriOS
            && !isFxiOS
            && !isEdgiOS
            && !isOPiOS
            && !/YaBrowser|DuckDuckGo|GSA/i.test(ua);

        return {
            ua,
            uaDataPlatform,
            platform,
            maxTouchPoints,
            isIOSLike,
            isAndroid,
            isMobile,
            isMacBrowser,
            isSafariBrowser: isSafari,
            isMobileChrome,
            isMobileSafari,
        };
    };

    const detectPlatformType = (env = collectEnv()) => {
        if (!env.isMobile) return 'desktop';
        // if (env.isSafariBrowser) return 'safari';
        return 'mobile_other';
    };

    const detect = () => {
        const env = collectEnv();
        const platformType = detectPlatformType(env);
        return {
            policyId: platformType,
            platformType,
            env: {
                ua: env.ua,
                uaDataPlatform: env.uaDataPlatform,
                isMobile: env.isMobile,
                isIOSLike: env.isIOSLike,
                isMacBrowser: env.isMacBrowser,
                isSafari: platformType === 'safari',
                isSafariBrowser: env.isSafariBrowser,
                isMobileChrome: env.isMobileChrome,
                isMobileSafari: env.isMobileSafari,
                platform: env.platform,
                maxTouchPoints: env.maxTouchPoints,
            },
            config: {},
        };
    };

    window['PackPlatformPolicy'] = {
        detect,
        detectPlatformType,
    };
})();
