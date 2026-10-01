// Crossy Chicken parameter shim. Expects ../../../live/_shared/skillprintC3.js,
// which owns the game clock, screenshots and input forwarding.
//
// Example adjustment format expected:
// {
// "parameterName": "speedModifier",
// "parameterValue": 1.2
// }
//
// speedModifier (0.6-1.6, default 1) scales game time: cars, trains, logs and
// the chicken's hop all run faster or slower. The export is minified, so its
// event-sheet globals (CamSpeed etc.) can't be reached by name.

const SPEED_MIN = 0.6;
const SPEED_MAX = 1.6;

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const value = Number(parameterValue);

        if (parameterName === "speedModifier" && Number.isFinite(value)) {
            window.SkillprintC3.setSpeed(Math.min(SPEED_MAX, Math.max(SPEED_MIN, value)));
        }
    }
}

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});
