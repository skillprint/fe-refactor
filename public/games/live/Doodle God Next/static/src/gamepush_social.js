(function (global) {
    'use strict';

    if (global.DGPlatformSocial) return;

    const state = {
        lastError: '',
        lastAction: '',
        connected: false,
    };

    function log(action, details, level) {
        state.lastAction = action;
        global.DGGamePush?.log?.('social', action, details, level);
    }

    function getGp() {
        return global.DGGamePush?.getGp?.() || null;
    }

    function fire(action, fn) {
        Promise.resolve()
            .then(fn)
            .then(function () {
                log(action + '-done');
            })
            .catch(function (error) {
                state.lastError = error && error.message ? error.message : String(error);
                log(action + '-failed', state.lastError, 'warn');
            });
    }

    function canCallbackCpp() {
        return !!(global.Module && typeof global.Module.ccall === 'function');
    }

    function finishConnectCpp(opaque, result) {
        if (!opaque || !canCallbackCpp()) return;
        try {
            global.Module.ccall(
                'ems_gsn_connect_finished',
                null,
                ['number', 'number'],
                [Number(opaque || 0), result ? 1 : 0]
            );
        } catch (error) {
            state.lastError = error && error.message ? error.message : String(error);
            log('connect-callback-failed', state.lastError, 'warn');
        }
    }

    function connectToGameCenter(opaque) {
        fire('connect', async function () {
            const gp = getGp();
            try {
                if (gp?.player?.ready) {
                    await gp.player.ready;
                }
                state.connected = true;
                finishConnectCpp(opaque, true);
            } catch (error) {
                state.connected = false;
                finishConnectCpp(opaque, false);
                throw error;
            }
        });
        return true;
    }

    function reportAchievement(name, percentComplete) {
        const gp = getGp();
        const achievements = gp?.achievements;
        if (!achievements) {
            log('achievement-fallback', { name, percentComplete });
            return false;
        }

        fire('achievement', async function () {
            if (percentComplete >= 100 && typeof achievements.unlock === 'function') {
                await achievements.unlock({ tag: name });
            } else if (typeof achievements.setProgress === 'function') {
                await achievements.setProgress({ tag: name, progress: percentComplete });
            }
        });
        return true;
    }

    function reportScore(score, key) {
        const gp = getGp();
        const leaderboard = gp?.leaderboard;
        const player = gp?.player;

        fire('score', async function () {
            if (leaderboard && typeof leaderboard.publishRecord === 'function') {
                await leaderboard.publishRecord({ tag: key || undefined, score });
                return;
            }
            if (player && typeof player.set === 'function') {
                player.set(key || 'score', score);
                if (typeof player.sync === 'function') await player.sync();
            }
        });
        return !!(leaderboard || player);
    }

    function showAchievements() {
        const achievements = getGp()?.achievements;
        if (!achievements || typeof achievements.open !== 'function') return false;
        fire('achievements-open', function () {
            return achievements.open();
        });
        return true;
    }

    function showLeaderboard(key) {
        const leaderboard = getGp()?.leaderboard;
        if (!leaderboard) return false;

        fire('leaderboard-open', function () {
            if (key && typeof leaderboard.openScoped === 'function') {
                return leaderboard.openScoped({ tag: key });
            }
            if (typeof leaderboard.open === 'function') {
                return leaderboard.open();
            }
            return null;
        });
        return true;
    }

    function share(options) {
        const socials = getGp()?.socials;
        if (!socials || typeof socials.share !== 'function') return false;
        fire('share', function () {
            return socials.share(options || {});
        });
        return true;
    }

    global.DGPlatformSocial = {
        connectToGameCenter,
        reportAchievement,
        reportScore,
        showAchievements,
        showLeaderboard,
        share,
        isAchievementsAvailable: function () {
            return typeof getGp()?.achievements?.open === 'function';
        },
        isLeaderboardAvailable: function () {
            return typeof getGp()?.leaderboard?.open === 'function';
        },
        getState: function () {
            return { ...state };
        },
    };
})(window);
