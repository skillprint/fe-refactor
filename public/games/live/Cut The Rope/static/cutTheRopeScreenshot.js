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
    // Specifically grab the canvas with the ID 'gfx' or ID 'canvas' or tag name 'canvas'
    const canvasElement = document.getElementById('gfx') || document.getElementById('canvas') || document.getElementsByTagName('canvas')[0];
    if (!canvasElement) {
        console.warn("[Cut The Rope Screenshot] Canvas element not found!");
        return;
    }

    try {
        // Since we patched HTMLCanvasElement to preserve the WebGL/2D drawing buffer,
        // we can now capture it directly and synchronously.
        const dataUrl = canvasElement.toDataURL("image/jpeg");
        console.log("[Cut The Rope Screenshot] Screenshot taken:", dataUrl, canvasElement);
        if (shouldLogDataUrl()) {
            addToLocalStorage('screenshot', dataUrl);
        }
        window.parent.postMessage({ type: 'screenshot', dataUrl }, "*");
    } catch (e) {
        console.error("[Cut The Rope Screenshot] Exception during toDataURL:", e);
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
