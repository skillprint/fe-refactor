// Mage Duel parameter shim.
//
// Example adjustment format expected:
// {
// "parameterName": "enemyAttackRateMs",
// "parameterValue": 7000
// }
//
// game.js is a classic script loaded before this one, so its state is global:
// window.GAME_CONFIG (heroDamage, enemyDamage, enemyAttackRateMs, healAmount;
// read each time a spell lands, the enemy strikes or a heal lands), the
// top-level lets showHelper and useSentences (read by nextWord()), heroHP,
// enemyHP and startGame() (called by a region click and "Repeat Mission";
// it starts the enemy's attack timer). adjustGame is defined here at load,
// so it works on the world map and during a duel.
//
// - heroDamage (2-25, default 4): damage per correct spell; the warlord has
//   100 HP, so 4 = 25 spells to win, 10 = 10, 25 = 4. Next spell that lands.
// - enemyDamage (2-40, default 15): damage per enemy strike (hero has 100 HP:
//   15 = 7 strikes to lose). Next strike.
// - enemyAttackRateMs (1500-15000, default 5000): time between enemy strikes.
//   In a duel the timer restarts with the new period at once.
// - healAmount (0-50, default 20): HP restored by a "heal" word. Next heal.
// - showHelper (0 or 1, default 1): 1 shows the translation to type under the
//   prompt; 0 hides it, so the player must recall it. Applies to the word on
//   screen at once.
// - useSentences (0 or 1, default 0): 1 asks for whole sentences instead of
//   single words (longer to type). From the next word.
//
// The world-map checkboxes "Show Translation Helper" and "Enable Full
// Sentences" set the same two variables when a duel starts. Once the portal
// has set either, the shim ticks the checkbox to match and re-applies the
// value as each duel starts, so the knob holds across duels.

const PARAMS = {
    heroDamage: { min: 2, max: 25, integer: true },
    enemyDamage: { min: 2, max: 40, integer: true },
    enemyAttackRateMs: { min: 1500, max: 15000, integer: true },
    healAmount: { min: 0, max: 50, integer: true },
    showHelper: { min: 0, max: 1, integer: true },
    useSentences: { min: 0, max: 1, integer: true },
};

const toggles = {}; // showHelper / useSentences values the portal has set

function inDuel() {
    const scene = document.getElementById('scene');
    return !!scene && scene.style.display !== 'none' && heroHP > 0 && enemyHP > 0;
}

// Mirrors nextWord()'s helper line, for the word already on screen.
function showHelperLine() {
    const el = document.getElementById('target-meaning');
    if (!el || !currentTargetTranslation || !inDuel()) return;
    if (showHelper) {
        el.textContent = `Type to Translate: "${currentTargetTranslation}"`;
        el.style.opacity = 1;
    } else {
        el.textContent = 'Type to Translate (Hidden)';
        el.style.opacity = 0;
    }
}

function applyToggles() {
    if ('showHelper' in toggles) {
        showHelper = toggles.showHelper === 1;
        const box = document.getElementById('toggle-helper');
        if (box) box.checked = showHelper;
    }
    if ('useSentences' in toggles) {
        useSentences = toggles.useSentences === 1;
        const box = document.getElementById('toggle-sentences');
        if (box) box.checked = useSentences;
    }
}

function apply(parameterName, value) {
    if (parameterName === 'showHelper' || parameterName === 'useSentences') {
        toggles[parameterName] = value;
        applyToggles();
        if (parameterName === 'showHelper') showHelperLine();
        return;
    }
    window.GAME_CONFIG[parameterName] = value;
    if (parameterName === 'enemyAttackRateMs' && inDuel()) startEnemyAttacks();
}

window.adjustGame = function (obj) {
    try {
        if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
            const { parameterName, parameterValue } = obj;
            const range = PARAMS[parameterName];
            let value = Number(parameterValue);
            if (!range || !Number.isFinite(value)) {
                console.warn('[skillprintShim] Mage Duel: unknown parameter or value', parameterName, parameterValue);
                return;
            }
            value = Math.min(range.max, Math.max(range.min, value));
            if (range.integer) value = Math.round(value);
            apply(parameterName, value);
            console.log(`[skillprintShim] Mage Duel adjusted ${parameterName} to ${value}`);
        }
    } catch (e) {
        console.warn('[skillprintShim] Mage Duel: adjustment failed', e);
    }
};

// A region click reads the checkboxes into showHelper/useSentences and then
// calls startGame(); re-apply the portal's values just before the duel starts.
if (typeof window.startGame === 'function') {
    const startGame = window.startGame;
    window.startGame = function () {
        try { applyToggles(); } catch (e) { /* never block the duel */ }
        return startGame.apply(this, arguments);
    };
}

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

// Forward keydown events to the parent window for the GameAdjustmentTester.
// No answer contains a digit, so a digit pressed in the spell box is kept out
// of it (it would count as a typo).
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim - Mage Duel] Key intercepted in iframe:', event.key);
        if (event.target && event.target.id === 'input-word') event.preventDefault();
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game sees the key
