var loadingProgress = 0.0;
var simulatedProgressRange = 0.65; // 0.65 ~ 65%
var simulationSteps = 100;
var simulationTime = 15; //seconds

var displayProgress = function(value) {
    var bar = document.getElementById('loaderBar');
    var loadingText = document.getElementById('loadingText');

    if(bar) bar.style.width = value * 100 + '%';
    if(loadingText) loadingText.innerHTML = Math.round(value * 100) + '%';
    if(typeof famobi !== 'undefined') famobi.setPreloadProgress(Math.floor(value * 99));
};

var stopPreloaderSimulation = function () {
    clearInterval(simulatingInterval);
};

var simulatingInterval = setInterval(() => {
    if(loadingProgress >= simulatedProgressRange) {
        return stopPreloaderSimulation();
    }
    loadingProgress += simulatedProgressRange / simulationSteps * Math.random();
    displayProgress(loadingProgress);
}, simulationTime / simulationSteps * 1000);


/** handling free-run mode request even before app has loaded */

window.fetchPlaycanvasAppInstance = window.fetchPlaycanvasAppInstance || (() => new Promise((resolve, reject) => {
    if (pc && pc.AppBase) {
        resolve(pc.AppBase.getApplication());
    } else {
        const checkingInterval = setInterval(() => {
            if (pc && pc.AppBase) {
                clearInterval(checkingInterval);
                resolve(pc.AppBase.getApplication());
            }
        }, 100);
    }
}));


window.startGameEvent = window.startGameEvent || (async () => {
    const app = await window.fetchPlaycanvasAppInstance();    

    if(app.__hasCompleteLoading) {
        window.gotoLevel(-1); //launch free-run mode
    } else {
        app._forceFreeRunMode = true; //wait until loaded, then request free-run mode
    }
});