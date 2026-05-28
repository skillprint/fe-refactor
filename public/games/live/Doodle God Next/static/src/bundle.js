console.log('________Runtime initialized_0______');
const HasRelease = window['HasRelease'] !== false;
const HasRealDPR = window['HasRealDPR'] !== false;
const MTelegram = window.Telegram.Telegram || null;

if (window['RENDER_DEBUG_GUI'] && window['DG_IMPORT_CONFIG'] === true) {
    if (localStorage.getItem('importedSaves') != window.dg_version) {
        localStorage.setItem('importedSaves', window.dg_version);
        window.importSaves()
    }
}


// // iPhone XR, X, 11
// const isIPhoneX = /iPhone/gi.test(navigator.userAgent) && [812, 844, 896].includes(window.screen.height);
const _updateSafeArea = () => {
    if (MTelegram?.IsAvailable()) {
        const safeArea = MTelegram.GetSafeArea();
        const size = MTelegram.GetSize();

        // const top_safe_area = isIPhoneX ? safeArea.top * 2 : safeArea.top;
        const top_safe_area = safeArea.top * 2;
        document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${Math.max(top_safe_area, 20)}px`);

        const dpr = HasRealDPR ? window.devicePixelRatio || 1 : 1;

        window['safe_y'] = (top_safe_area || 0) * dpr
        window['safe_x'] = (safeArea.left || 0) * dpr
        window['safe_width'] = size.width * dpr - window.safe_x - (safeArea.right || 0) * dpr
        window['safe_height'] = (window.awailHeight || size.height) * dpr - window.safe_y - (safeArea.bottom || 0) * dpr
    } else {
        window['safe_y'] = 0;
        window['safe_x'] = 0;
        window['safe_width'] = 0;
        window['safe_height'] = 0;
    }

}

const _notifyResizeListeners = () => {
    const setCanvasSize = Module?.['setCanvasSize'];
    const canvas = Module?.['canvas'] || document.getElementById('canvas');

    if (typeof setCanvasSize === 'function' && canvas) {
        setCanvasSize(canvas.width, canvas.height);
        return true;
    }

    if (typeof Browser !== 'undefined' && Browser?.updateResizeListeners) {
        Browser.updateResizeListeners();
        return true;
    }

    return false;
}

const _resize = (crang = false) => {
    // console.log('Resize event');
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    window['awailWidth'] = rect.width;
    window['awailHeight'] = rect.height;

    _updateSafeArea();


    if (crang) {
        if (typeof Module?.['setCanvasSize'] === 'function' || Module?.ctx) {
            canvas.width = window.awailWidth - 10;
            canvas.height = window.awailHeight - 10;
            _notifyResizeListeners();
        }
    }

    // const aspect = 2.5 / 4;//w/h

    let w = window.awailWidth;
    let h = window.awailHeight;
    // let isPortrait = h > w;

    let targetWidth, targetHeight;
    // if (isPortrait) {
    targetWidth = w;
    targetHeight = h;
    // } else {
    //     targetHeight = h;
    //     targetWidth = Math.min(w, h * aspect);
    // }

    targetWidth = Math.floor(targetWidth);
    targetHeight = Math.floor(targetHeight);

    // console.log(targetWidth, targetHeight)

    if (crang && (typeof Module?.['setCanvasSize'] === 'function' || Module?.ctx)) {
        canvas.width = targetWidth - 10;
        canvas.height = targetHeight - 10;
        _notifyResizeListeners();
    }

    const dpr = HasRealDPR ? window.devicePixelRatio || 1 : 1;

    canvas.style.width = '100%';
    canvas.style.height = '100%';

    canvas.width = Math.floor(targetWidth * dpr);
    canvas.height = Math.floor(targetHeight * dpr);

    Module.devicePixelRatio = dpr;

    if (typeof Module?.['setCanvasSize'] === 'function' || Module?.ctx) {
        _notifyResizeListeners();

    }
}

const configureEmscriptenModule = () => {
    const module = window.Module = window.Module || {};
    let mainStarted = false;

    module.noInitialRun = true;
    module.onRuntimeInitialized = () => {
        const startMain = async () => {
            if (mainStarted) {
                console.warn('[EMS] _main already started, skip');
                return;
            }

            console.log('Runtime initialized - restoring FS');

            if (typeof window.DGPlatform?.readyBeforeMain === 'function') {
                await window.DGPlatform.readyBeforeMain();
            }

            if (typeof window.restoreFSFromCache === 'function') {
                await window.restoreFSFromCache();
            }

            try {
                await module['applyStartupAutoInstall']?.();
            } catch (e) {
                console.warn('[packs] startup auto-install failed', e);
            }

            if (typeof module._main !== 'function') {
                throw new Error('[EMS] Module._main is not exported');
            }

            mainStarted = true;
            module._main();
            window.DGPlatform?.applyCurrentPause?.('after-main');
        };

        startMain().catch((err) => console.error('startMain failed', err));
    };

    module.locateFile = (file, path) => {
        const version = window.dg_version;
        if (file === 'main.data') return `./main.data?v=${version}`;
        if (file === 'main.wasm') return `./main.wasm?v=${version}`;
        return path ? `${path}${file}` : file;
    };
};

configureEmscriptenModule();

// var canvas = document.getElementById('canvas');
// Module["canvas"] = canvas;
window.addEventListener('resize', _resize);
window.dispatchEvent(new Event('resize'));
// setTimeout(() => {
//     debugger
//     window.dispatchEvent(new Event('resize'));}, 1000);

window.addEventListener('popstate', (event) => {
    console.log('Back button was pressed.');
    if (confirm('Внимание! Вы уходите со страницы. Вы уверены?')) {
        // Если пользователь подтвердил, можно выполнить дополнительные действия
        // Например, сохранить состояние или выполнить другую логику
    } else {
        // Если пользователь отменил, предотвратить переход
        history.pushState(null, null, location.href);
    }
});

//_________________________Load js_________________________

const loadScript = (url, callback) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
        console.log(`Script ${url} loaded successfully.`);
        callback();
    };
    script.onerror = () => {
        console.error(`Failed to load script ${url}.`);
    };
    document.head.appendChild(script);
};




const defaultBuild = 'gles';
const selectedBuild = defaultBuild;

const loadMainJs = () => {
    // const scriptUrl = `${selectedBuild}/main.js?v=${version}`;
    const version = window.dg_version
    const scriptUrl = `main.js?v=${version}`;
    if ('caches' in window) {
        caches.match(scriptUrl).then((response) => {
            if (response) {
                console.log(`Script ${scriptUrl} found in cache.`);
                loadScript(scriptUrl, () => { console.log(`Executing cached script ${scriptUrl}.`); });
            } else {
                console.log(`Script ${scriptUrl} not found in cache. Loading from network.`);
                loadScript(scriptUrl, () => { console.log(`Executing cached script ${scriptUrl}.`); });
            }
        }).catch(error => {
            console.error('Cache match failed:', error);
            loadScript(scriptUrl, () => { console.log(`Executing cached script ${scriptUrl}.`); });
        });
    } else {
        console.log('Caches API not supported. Loading script from network.');
        loadScript(scriptUrl, () => { console.log(`Executing cached script ${scriptUrl}.`); });
    }
};




//############

let previousLoaded = 0;
let previousTime = Date.now();
let smoothedSpeed = 0;

// Resume media after first user interaction to avoid autoplay errors
const resumeMediaOnce = () => {
    if (typeof Module !== 'undefined' && Module.playMedia) {
        try {
            Module.playMedia(''); // noop to trigger init
        } catch (e) {
            // ignore
        }
    }
    if (typeof Module !== 'undefined' && Module.Media && Module.Media.resumeAll) {
        try {
            Module.Media.resumeAll();
        } catch (e) { }
    }
    window.removeEventListener('pointerdown', resumeMediaOnce);
    window.removeEventListener('keydown', resumeMediaOnce);
};
window.addEventListener('pointerdown', resumeMediaOnce, { once: true });
window.addEventListener('keydown', resumeMediaOnce, { once: true });

checkLoadingStatus = () => {
    try {
        if (!Module['dataFileDownloads']) return;
        const fileName = Module.locateFile('main.data');
        const download = Module['dataFileDownloads'][fileName];
        if (!download) return;
        const totalLoaded = download.loaded;
        const totalSize = download.total;
        setProgressBarFromCpp(totalLoaded, totalSize);

        if (totalLoaded >= totalSize) {
            clearInterval(progressInterval);
        }
    } catch (ex) {
        console.log('Error:', ex);
    }
}

var setProgressBarFromCpp = (loaded, total, step = 0) => {

    if (!total || total <= 0) {
        total = Math.max(loaded, 1);
    }

    if (loaded < 0) {
        setTimeout(() => {
            const splash = document.getElementById('splash')
            splash.classList.add('hidden');
            MTelegram?.FullScreen();
            setTimeout(() => {
                splash.style.display = 'none';
                window.DGPlatform?.loadingReady?.();
                window.DGPlatform?.gameplayStart?.();
                Promise.resolve(Module.loadAllExtraPacks?.()).catch((e) => {
                    console.warn('[packs] loadAllExtraPacks failed', e);
                });
            }, 1000);
            window.dispatchEvent(new Event('resize'));
        }, 3000);
        return;
    }

    var percentage = (loaded / total) * 100;
    if (step == 0) {
        percentage = (loaded / total) * 70;
    }

    if (step == 2) {
        percentage = 70 + (loaded / total) * 20;
    }


    const progressBarContainer = document.getElementById('progress-bar');
    progressBarContainer.style.width = percentage + '%';
    document.getElementById("progress-text-status").innerText = `${percentage.toFixed(0)}%`;
}

// if (!HasRelease) {
if (false) {
    setProgressBarFromCpp = (loaded, total, step = 0) => {
        // console.log('setProgressBarFromCpp', loaded, total, step);
        // var isShow = document.getElementById('progress-bar-container').classList.contains("show");
        // if (loaded >= 0) {
        //     if (isShow == false) {
        //         document.getElementById('progress-bar-container').classList.add("show");
        //     }
        // }
        let prg_text_1 = document.getElementById("progress-text_1"); prg_text_1.style.display = 'none';
        let prg_text_2 = document.getElementById("progress-text_2"); prg_text_2.style.display = 'none';
        if (loaded < 0) {
            document.getElementById('progress-bar-container').style.display = 'none';
            // Promise.resolve(Module.loadAllExtraPacks?.()).catch((e) => {
            //     console.warn('[packs] loadAllExtraPacks failed', e);
            // });
            window.dispatchEvent(new Event('resize'));

            // Module.ccall('setRenderParams', null, ['number', 'number'], [123, 456]);
            return;
        } else {
            // debugger
            // document.getElementById('progress-bar-container').style.display = 'block';
        }
        const progressBarContainer = document.getElementById('progress-bar');
        progressBarContainer.classList.remove("step_1", "step_2");


        //--------------------------------------------------------
        const percentage = (loaded / total) * 100;
        progressBarContainer.style.width = percentage + '%';

        const now = Date.now();
        const dt = (now - previousTime) / 1000;
        const delta = loaded - previousLoaded;
        const rawSpeed = delta / dt;
        smoothedSpeed = smoothedSpeed === 0 ? rawSpeed : smoothedSpeed * 0.9 + rawSpeed * 0.1;

        previousLoaded = loaded;
        previousTime = now;

        const remainingTime = (total - loaded) / smoothedSpeed;

        const formatBytes = (bytes) => {
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        };

        const formatTime = (s) => `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`;

        // prg_text_1.innerHTML = `Грузим код и ресурсы с сервера ${percentage}%<br>(${formattedLoaded} / ${formattedTotal}<br> ${formattedSpeed}<br> осталось ${formattedRemainingTime})`;
        // prg_text_2.innerHTML = `Грузим ресурсы в коде игры in cpp ${percentage}%`;
        prg_text_1.innerHTML = `Грузим код и ресурсы с сервера ${percentage.toFixed(1)}%<br>(${formatBytes(loaded)} / ${formatBytes(total)}<br> ${formatBytes(smoothedSpeed)}/s<br> осталось ${formatTime(remainingTime)})`;
        prg_text_2.innerHTML = `Грузим ресурсы в коде игры in cpp ${percentage.toFixed(1)}%`;
        //--------------------------------------------------------
        switch (step) {
            case 0: case 1:
                progressBarContainer.classList.add("step_1");
                prg_text_1.style.display = 'block';
                break;
            case 2:
                progressBarContainer.classList.add("step_2");
                prg_text_2.style.display = 'block';
                break;
        }
        // console.log(progressBarContainer.style.width)
    }
}


const progressInterval = setInterval(checkLoadingStatus, 100);
// Module['dataFileDownloads']['main.data'] = {loaded, total};
// Module['setStatus']?.(`Downloading data... (${totalLoaded}/${totalSize})`);


(async () => {
    await MTelegram?.Init();
    if (MTelegram?.IsAvailable()) {
        _updateSafeArea();
    }
})()



//--------------------------------------------------
if (window.RENDER_DEBUG_GUI) {
    var script = document.createElement('script');
    script.onload = function () {

        var stats = new Stats();
        stats.dom.classList.add('stats-js');
        stats.dom.style.width = 'fit-content';
        stats.dom.style.height = 'fit-content';
        document.body.appendChild(stats.dom);

        requestAnimationFrame(function loop() {
            stats.update();
            requestAnimationFrame(loop)
        });
        stats.dom.setLongPressClick(() => {
            window.clearCookiesAndCache();
            window.location.reload();

        })
    };
    script.src = 'https://mrdoob.github.io/stats.js/build/stats.min.js';
    document.head.appendChild(script);
}


window['setProgressBarFromCpp'] = setProgressBarFromCpp;
window['LoadingOverlay'] = {
    show(text) {
        const el = document.getElementById('loading-overlay');
        if (!el) return;
        if (text) {
            const t = el.querySelector('.loading-text');
            if (t) t.textContent = text;
        }
        el.classList.remove('hidden');
    },

    hide() {
        const el = document.getElementById('loading-overlay');
        if (!el) return;
        el.classList.add('hidden');
    }
};

loadMainJs();
