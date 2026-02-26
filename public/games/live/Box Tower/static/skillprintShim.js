// Example adjustment format expected:
// {
// "parameterName": "stackVelocity",
// "parameterValue": 25
// }

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        if (parameterName === "stackVelocity") {
            window.STACK_VELOCITY = parameterValue;
        } else if (parameterName === "perfectRange") {
            window.PERFECT_RANGE = parameterValue;
        }
    }
}

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});
