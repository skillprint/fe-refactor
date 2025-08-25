// "adjustment": {
        // "parameterName": "creationSpeedModifier",
        // "parameterValue": 0.75
// }

window.adjustGame = function(obj) {
    if(typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        if(parameterName === "creationSpeedModifier" || parameterName === "speedModifier") {
            window.settings.speedModifier = parameterValue;
        } else if (parameterName === "comboTime") {
            window.settings.comboTime = parameterValue;
        }
    }
}