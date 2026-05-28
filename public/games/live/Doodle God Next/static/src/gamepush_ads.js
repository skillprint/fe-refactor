(function (global) {
    'use strict';

    const TYPE_REWARDED = 0;
    const TYPE_INTERSTITIAL = 1;

    const config = () => global.DGConfig || {};
    const adsConfig = () => config().gamePush?.ads || {};
    const debug = () => !!(config().debug || config().gamePush?.debug);

    function log() {
        global.DGGamePush?.log?.('ads', Array.prototype.slice.call(arguments)[0], Array.prototype.slice.call(arguments).slice(1));
        if (!debug()) return;
        console.log.apply(console, ['[GamePushAds]'].concat(Array.prototype.slice.call(arguments)));
    }

    function warn() {
        global.DGGamePush?.log?.('ads', Array.prototype.slice.call(arguments)[0], Array.prototype.slice.call(arguments).slice(1), 'warn');
        if (!debug()) return;
        console.warn.apply(console, ['[GamePushAds]'].concat(Array.prototype.slice.call(arguments)));
    }

    function getGp() {
        return global.DGGamePush?.state?.gp || null;
    }

    function getAds() {
        const gp = getGp();
        return gp && gp.ads ? gp.ads : null;
    }

    function isReady() {
        const ads = getAds();
        return !!(
            ads
            && typeof ads.showRewardedVideo === 'function'
            && typeof ads.showFullscreen === 'function'
        );
    }

    function isReleaseMode() {
        return global.HasRelease === true;
    }

    function allowFakeFallback() {
        return isReleaseMode() ? adsConfig().releaseFallback === true : adsConfig().debugFallback === true;
    }

    function getFallbackMessage(type, kind) {
        if (kind === 'debug') {
            return type === TYPE_INTERSTITIAL
                ? (adsConfig().debugInterstitialMessage || 'Debug ad: interstitial skipped.')
                : (adsConfig().debugRewardMessage || 'Debug ad: reward granted.');
        }
        return adsConfig().unavailableMessage || 'Реклама сейчас недоступна, попробуйте позже.';
    }

    function isAdAvailableFromCpp(type) {
        const ads = getAds();
        if (!isReady()) return false;

        if (type === TYPE_REWARDED) {
            return ads.isRewardedAvailable !== false;
        }

        if (type === TYPE_INTERSTITIAL) {
            return ads.isFullscreenAvailable !== false;
        }

        return false;
    }

    function notifyCpp(type, success, rewarded) {
        const fn = global.Module && global.Module._ems_ad_finished;
        if (typeof fn !== 'function') {
            console.warn('[GamePushAds] _ems_ad_finished is not exported');
            return;
        }
        fn(type, success ? 1 : 0, rewarded ? 1 : 0);
    }

    function callOptional(fn) {
        try {
            if (typeof fn === 'function') fn();
        } catch (error) {
            warn('optional callback failed', error);
        }
    }

    function subscribeOnce(emitter, eventName, handler) {
        if (!emitter || typeof emitter.on !== 'function') return function () {};

        let fired = false;
        const wrapped = function () {
            if (fired) return;
            fired = true;
            unsubscribe();
            handler.apply(null, arguments);
        };

        const unsubscribe = function () {
            fired = true;
            if (typeof emitter.off === 'function') {
                emitter.off(eventName, wrapped);
            }
        };

        emitter.on(eventName, wrapped);
        return unsubscribe;
    }

    async function showRewarded(type, customBonus, placement) {
        const ads = getAds();
        let rewarded = false;
        let success = false;

        const unsubscribeReward = subscribeOnce(ads, 'rewarded:reward', function () {
            rewarded = true;
            log('rewarded granted', placement, customBonus);
        });

        try {
            log('rewarded start', placement, customBonus);
            callOptional(global.DGPlatform?.pauseForExternal?.bind(global.DGPlatform, 'gamepush-rewarded'));
            success = !!(await ads.showRewardedVideo({ showRewardedFailedOverlay: true }));
        } catch (error) {
            warn('rewarded error', error);
            success = false;
        } finally {
            unsubscribeReward();
            callOptional(global.DGPlatform?.resumeFromExternal?.bind(global.DGPlatform, 'gamepush-rewarded'));
            notifyCpp(type, success && rewarded, rewarded);
        }
    }

    async function showInterstitial(type, placement) {
        const ads = getAds();
        let success = false;

        try {
            log('interstitial start', placement);
            callOptional(global.DGPlatform?.pauseForExternal?.bind(global.DGPlatform, 'gamepush-interstitial'));
            success = !!(await ads.showFullscreen());
        } catch (error) {
            warn('interstitial error', error);
            success = false;
        } finally {
            callOptional(global.DGPlatform?.resumeFromExternal?.bind(global.DGPlatform, 'gamepush-interstitial'));
            notifyCpp(type, success, false);
        }
    }

    function showAdFromCpp(type, customBonus, placement) {
        if (type === TYPE_REWARDED) {
            if (!isAdAvailableFromCpp(type)) return false;
            showRewarded(type, customBonus || '', placement || '');
            return true;
        }

        if (type === TYPE_INTERSTITIAL) {
            if (!isAdAvailableFromCpp(type)) return false;
            showInterstitial(type, placement || '');
            return true;
        }

        return false;
    }

    const api = {
        isReady,
        isAdAvailableFromCpp,
        allowFakeFallback,
        getFallbackMessage,
        showAdFromCpp,
    };

    global.DGPlatformAds = api;
})(window);
