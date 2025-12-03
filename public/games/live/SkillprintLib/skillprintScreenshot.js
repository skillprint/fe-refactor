// let skillprintScreenshotSlement;

const addToLocalStorage = (key, value) => {
    localStorage.setItem(key, value);
}

const getQueryParamValue = (key) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
}

const getScreenshotFrequency = () => {
    const frequency = getQueryParamValue('screenshotFrequency');
    return frequency ? parseInt(frequency) : 500;
}

const shouldLogDataUrl = () => {
    return true;
    const logDataUrl = getQueryParamValue('logDataUrl');
    return logDataUrl === 'true' || true;
}

const getElementForScreenshot = () => {
    const urlPath = window.location.pathname;
    // console.log(urlPath);
    const canvasPathNames = [
        '/public/games/live/Garden%20Match/static/index.html', 
        '/public/games/live/Box%20Tower/static/index.html',
        '/public/games/live/Change%20Word/static/index.html',
        '/public/games/live/Flapcat%20Steampunk/static/index.html',
        // '/public/games/live/Fruit%20Boom/static/index.html',
        '/public/games/live/Fruit%20Sorting/static/index.html',
        '/public/games/live/Gummy%20Blocks/static/index.html',
        '/public/games/live/Impossible%2010/static/index.html',
        '/public/games/live/Mahjong%20Deluxe/static/index.html',
        '/public/games/live/Space%20Trip/static/index.html',

    ];
    const bodyPathNames = ['/games/live/SkillprintLib/skillprint.html', '/games/live/SkillprintLib/skillprint.html'];

    if (canvasPathNames.includes(urlPath)) {
        // console.log("using canvas");
        return document.getElementsByTagName('canvas')[0];
    } else if (bodyPathNames.includes(urlPath)) {
        // console.log("using body");
        return document.body;
    }

    return document.body;
}


const takeScreenshot = async () => {
    const skillprintScreenshotSlement = getElementForScreenshot();
    // console.log(skillprintScreenshotSlement);

    const options = {
        allowTaint: true,
        useCORS : true,
        // foreignObjectRendering: true,
        x: skillprintScreenshotSlement.offsetLeft,
        y: skillprintScreenshotSlement.offsetTop,
        width: skillprintScreenshotSlement.clientWidth,
        height: skillprintScreenshotSlement.clientHeight,
        windowWidth: skillprintScreenshotSlement.clientWidth,
        windowHeight: skillprintScreenshotSlement.clientHeight,
        removeContainer: true,
        scale: 1,
        // logging: true,
    }

    html2canvas(skillprintScreenshotSlement, options).then(canvas => {
        const dataUrl = canvas.toDataURL("image/jpeg");
        // console.log("Transmitting screenshot to parent");
        
        if (shouldLogDataUrl()) {
            // console.log("" + dataUrl);
            // log dataUrl to localstorage
            addToLocalStorage('screenshot', dataUrl);
        }

        window.parent.postMessage({ type: 'screenshot', dataUrl }, "*");
    })
}

// when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const screenshotFrequency = getScreenshotFrequency();
    // skillprintScreenshotSlement = document.body;

    setInterval(() => {
        takeScreenshot();
    }, 2500);
})

function logEvent(params) {
    params.messageType = 'gameEvent';
    const paramsAsJSON = JSON.stringify(params);
    if (globalThis.ReactNativeWebView && globalThis.ReactNativeWebView.postMessage) {
    //   globalThis.ReactNativeWebView.postMessage(paramsAsJSON);
    } else {
    //   window.parent.postMessage(paramsAsJSON, "{% TARGET_ORIGIN %}");
    }
  }
  globalThis.logEvent = logEvent;
  