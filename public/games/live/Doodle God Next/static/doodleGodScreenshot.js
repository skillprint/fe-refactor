const addToLocalStorage = (key, value) => {
    localStorage.setItem(key, value);
}

const getQueryParamValue = (key) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
}

const getScreenshotFrequency = () => {
    const frequency = getQueryParamValue('screenshotFrequency');
    return frequency ? parseInt(frequency) : 2500;
}

const shouldLogDataUrl = () => {
    return true;
}

const takeScreenshot = async () => {
    // Specifically grab the canvas with the ID 'canvas'
    const canvasElement = document.getElementById('canvas');
    if (!canvasElement) {
        console.warn("[Doodle God Next Screenshot] Canvas element with ID 'canvas' not found!");
        return;
    }

    const options = {
        allowTaint: true,
        useCORS: true,
        x: canvasElement.offsetLeft,
        y: canvasElement.offsetTop,
        width: canvasElement.clientWidth,
        height: canvasElement.clientHeight,
        windowWidth: canvasElement.clientWidth,
        windowHeight: canvasElement.clientHeight,
        removeContainer: true,
        scale: 1,
        logging: false,
    }

    try {
        html2canvas(canvasElement, options).then(canvas => {
            const dataUrl = canvas.toDataURL("image/jpeg");
            console.log("[Doodle God Next Screenshot] Screenshot taken:", dataUrl, options, canvasElement);
            if (shouldLogDataUrl()) {
                addToLocalStorage('screenshot', dataUrl);
            }
            window.parent.postMessage({ type: 'screenshot', dataUrl }, "*");
        }).catch(err => {
            console.error("[Doodle God Next Screenshot] html2canvas rendering failed:", err);
        });
    } catch (e) {
        console.error("[Doodle God Next Screenshot] Exception during html2canvas:", e);
    }
}

// Start screenshot generation when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const screenshotFrequency = getScreenshotFrequency();
    setInterval(() => {
        takeScreenshot();
    }, screenshotFrequency);
});

function logEvent(params) {
    params.messageType = 'gameEvent';
    const paramsAsJSON = JSON.stringify(params);
    if (globalThis.ReactNativeWebView && globalThis.ReactNativeWebView.postMessage) {
        // globalThis.ReactNativeWebView.postMessage(paramsAsJSON);
    } else {
        // window.parent.postMessage(paramsAsJSON, "*");
    }
}
globalThis.logEvent = logEvent;
