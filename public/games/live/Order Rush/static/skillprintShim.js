// "adjustment": { "parameterName": "difficultyMultiplier", "parameterValue": 1.2 }
// customerSpawnIntervalMs 1500-6000, patienceSec 12-40, cookTimeMs 1500-6000,
// tableCount 2-8, difficultyMultiplier 0.5-1.5, sessionLengthSec 60-360.
window.adjustGame = function (obj) {
  if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
    const { parameterName, parameterValue } = obj;
    const c = window.__orderRushControls;
    if (!c) return;
    if (parameterName === 'customerSpawnIntervalMs') c.setCustomerSpawnIntervalMs(parameterValue);
    else if (parameterName === 'patienceSec') c.setPatienceSec(parameterValue);
    else if (parameterName === 'cookTimeMs') c.setCookTimeMs(parameterValue);
    else if (parameterName === 'tableCount') c.setTableCount(parameterValue);
    else if (parameterName === 'difficultyMultiplier') c.setDifficultyMultiplier(parameterValue);
    else if (parameterName === 'sessionLengthSec') c.setSessionLengthSec(parameterValue);
  }
};

window.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'ADJUST_GAME') window.adjustGame(event.data.data);
});

window.addEventListener('keydown', function (event) {
  if (/^[1-9]$/.test(event.key)) {
    window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
  }
}, true);
