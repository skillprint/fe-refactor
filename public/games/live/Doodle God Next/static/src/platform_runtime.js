(function () {
    if (window.DGPlatform) return;

    const state = {
        beforeMainTasks: [],
        readyStarted: false,
        readyPromise: null,
        pauseDepth: 0,
        loadingReadySent: false,
        gameplayStarted: false,
    };

    const cfg = () => window.DGConfig || {};
    const debug = () => !!(cfg().debug || cfg().gamePush?.debug);
    const log = (action, details, level) => {
        window.DGGamePush?.log?.('platform', action, details, level);
        if (!window.DGGamePush && debug()) console.log('[DGPlatform]', action, details || '');
    };

    const gp = () => window.DGGamePush?.getGp?.() || null;

    const callModuleFn = (name) => {
        const fn = window.Module && window.Module[name];
        if (typeof fn !== 'function') return false;
        try {
            fn();
            return true;
        } catch (error) {
            console.warn(`[DGPlatform] ${name} failed`, error);
            return false;
        }
    };

    const callGp = (methodName, reason) => {
        const instance = gp();
        const fn = instance && instance[methodName];
        if (typeof fn !== 'function') return false;
        try {
            fn.call(instance);
            log(methodName, reason || '');
            return true;
        } catch (error) {
            log(methodName + '-failed', error && error.message ? error.message : String(error), 'warn');
            return false;
        }
    };

    const addReadyTask = (name, task) => {
        if (state.readyStarted) {
            console.warn('[DGPlatform] ready task added after start:', name);
        }
        state.beforeMainTasks.push({ name, task });
    };

    const readyBeforeMain = () => {
        if (state.readyPromise) return state.readyPromise;

        state.readyStarted = true;
        state.readyPromise = (async () => {
            await window.DGGamePush?.whenReady?.();

            for (const item of state.beforeMainTasks) {
                if (typeof item.task !== 'function') continue;
                try {
                    log('ready-task-start', item.name);
                    await item.task();
                    log('ready-task-done', item.name);
                } catch (error) {
                    console.warn('[DGPlatform] ready task failed:', item.name, error);
                    log('ready-task-failed', item.name, 'warn');
                }
            }
        })();

        return state.readyPromise;
    };

    const gameplayStart = () => {
        if (state.pauseDepth > 0) return;
        if (state.gameplayStarted) return;
        state.gameplayStarted = true;
        callGp('gameplayStart');
    };

    const gameplayStop = () => {
        if (!state.gameplayStarted && state.pauseDepth === 0) return;
        state.gameplayStarted = false;
        callGp('gameplayStop');
    };

    const loadingReady = () => {
        if (state.loadingReadySent) return;
        state.loadingReadySent = true;
        callGp('gameStart');
    };

    const applyCurrentPause = (reason = 'sync') => {
        if (state.pauseDepth <= 0) return false;

        log('apply-pause', { reason, depth: state.pauseDepth });
        try {
            window.DGMedia?.pauseAll?.(reason);
        } catch (error) {
            console.warn('[DGPlatform] media pause failed', error);
        }

        callModuleFn('_ems_game_pause');
        gameplayStop();
        return true;
    };

    const pauseForExternal = (reason = 'external') => {
        state.pauseDepth += 1;
        log('pause', { reason, depth: state.pauseDepth });

        try {
            window.DGMedia?.pauseAll?.(reason);
        } catch (error) {
            console.warn('[DGPlatform] media pause failed', error);
        }

        callModuleFn('_ems_game_pause');
        callGp('pause', reason);
        gameplayStop();

        try {
            window.DGStorage?.flushAll?.(true);
        } catch (_) {
            // fire-and-forget
        }
    };

    const resumeFromExternal = (reason = 'external') => {
        if (state.pauseDepth > 0) state.pauseDepth -= 1;
        log('resume', { reason, depth: state.pauseDepth });
        if (state.pauseDepth > 0) return;

        try {
            window.DGMedia?.resumeAll?.(reason);
        } catch (error) {
            console.warn('[DGPlatform] media resume failed', error);
        }

        callModuleFn('_ems_game_resume');
        callGp('resume', reason);
        gameplayStart();
    };

    const toggleFullscreen = () => {
        const fullscreen = gp()?.fullscreen;
        if (fullscreen && typeof fullscreen.toggle === 'function') {
            try {
                fullscreen.toggle();
                log('fullscreen-toggle', 'gamepush');
                return true;
            } catch (error) {
                log('fullscreen-toggle-failed', error && error.message ? error.message : String(error), 'warn');
            }
        }

        const el = document.documentElement;
        if (!document.fullscreenElement && el.requestFullscreen) {
            el.requestFullscreen();
            return true;
        }
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen();
            return true;
        }
        return false;
    };

    const requestReview = () => {
        const app = gp()?.app;
        if (!app || typeof app.requestReview !== 'function' || app.canRequestReview === false) return false;
        try {
            app.requestReview();
            log('request-review');
            return true;
        } catch (error) {
            log('request-review-failed', error && error.message ? error.message : String(error), 'warn');
            return false;
        }
    };

    window.DGPlatform = {
        addReadyTask,
        readyBeforeMain,
        loadingReady,
        gameplayStart,
        gameplayStop,
        applyCurrentPause,
        pauseForExternal,
        resumeFromExternal,
        toggleFullscreen,
        requestReview,
        getState: () => ({ ...state }),
    };
})();
