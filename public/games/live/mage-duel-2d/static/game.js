// Dictionaries of magical translation words by target language
const coreWords = [
    { target: "FIRE", prompt: "Fire" },
    { target: "WATER", prompt: "Water" },
    { target: "EARTH", prompt: "Earth" },
    { target: "WIND", prompt: "Wind" },
    { target: "LIGHT", prompt: "Light" },
    { target: "SHADOW", prompt: "Shadow" },
    { target: "SWORD", prompt: "Sword" },
    { target: "SHIELD", prompt: "Shield" },
    { target: "HEAL", prompt: "Heal" },
    { target: "ICE", prompt: "Ice" },
    { target: "STORM", prompt: "Storm" }
];

const coreSentences = [
    { target: "S_FIRE", prompt: "I cast fire" },
    { target: "S_WATER", prompt: "The water flows" },
    { target: "S_WIND", prompt: "A strong wind" },
    { target: "S_HEAL", prompt: "Heal my wounds" },
    { target: "S_SHIELD", prompt: "Raise the shield" },
    { target: "S_ICE", prompt: "Freeze the earth" },
    { target: "S_SWORD", prompt: "Strike with the sword" }
];

const dictionaries = {
    es: { 
        "FIRE": "Fuego", "WATER": "Agua", "EARTH": "Tierra", "WIND": "Viento", "LIGHT": "Luz", "SHADOW": "Sombra", "SWORD": "Espada", "SHIELD": "Escudo", "HEAL": "Curar", "ICE": "Hielo", "STORM": "Tormenta",
        "S_FIRE": "Lanzo fuego", "S_WATER": "El agua fluye", "S_WIND": "Un viento fuerte", "S_HEAL": "Cura mis heridas", "S_SHIELD": "Levanta el escudo", "S_ICE": "Congela la tierra", "S_SWORD": "Golpea con la espada"
    },
    fr: { 
        "FIRE": "Feu", "WATER": "Eau", "EARTH": "Terre", "WIND": "Vent", "LIGHT": "Lumiere", "SHADOW": "Ombre", "SWORD": "Epee", "SHIELD": "Bouclier", "HEAL": "Guerir", "ICE": "Glace", "STORM": "Tempete",
        "S_FIRE": "Je lance du feu", "S_WATER": "L eau coule", "S_WIND": "Un vent fort", "S_HEAL": "Gueris mes blessures", "S_SHIELD": "Leve le bouclier", "S_ICE": "Gele la terre", "S_SWORD": "Frappe avec l'epee"
    },
    de: { 
        "FIRE": "Feuer", "WATER": "Wasser", "EARTH": "Erde", "WIND": "Wind", "LIGHT": "Licht", "SHADOW": "Schatten", "SWORD": "Schwert", "SHIELD": "Schild", "HEAL": "Heilen", "ICE": "Eis", "STORM": "Sturm",
        "S_FIRE": "Ich werfe Feuer", "S_WATER": "Das Wasser fliesst", "S_WIND": "Ein starker Wind", "S_HEAL": "Heile meine Wunden", "S_SHIELD": "Heben Sie den Schild", "S_ICE": "Friere die Erde ein", "S_SWORD": "Schlag mit dem Schwert"
    },
    it: { 
        "FIRE": "Fuoco", "WATER": "Acqua", "EARTH": "Terra", "WIND": "Vento", "LIGHT": "Luce", "SHADOW": "Ombra", "SWORD": "Spada", "SHIELD": "Scudo", "HEAL": "Guarire", "ICE": "Ghiaccio", "STORM": "Tempesta",
        "S_FIRE": "Lancio il fuoco", "S_WATER": "L acqua scorre", "S_WIND": "Un vento forte", "S_HEAL": "Guarisci le mie ferite", "S_SHIELD": "Alza lo scudo", "S_ICE": "Congela la terra", "S_SWORD": "Colpisci con la spada"
    }
};

// Game Configuration Parameters (Exposed via Skillprint)
window.GAME_CONFIG = {
    heroDamage: 20,
    enemyDamage: 15,
    enemyAttackRateMs: 5000,
    healAmount: 20
};

// State
let heroHP = 100;
let enemyHP = 100;
let maxHP = 100;
let currentWordObj = null;
let currentTargetTranslation = "";
let enemyInterval = null;
let currentLang = 'es'; // default
let useSentences = false;
let showHelper = true;

// DOM Elements
const mainMenuEl = document.getElementById('main-menu');
const mapContainerEl = document.getElementById('map-container');
const regionNodes = document.querySelectorAll('.region-node');
const toggleSentencesEl = document.getElementById('toggle-sentences');
const toggleHelperEl = document.getElementById('toggle-helper');

const backgroundEl = document.getElementById('background');
const heroEl = document.getElementById('hero');
const enemyEl = document.getElementById('enemy');
const heroHPFill = document.getElementById('hero-hp-fill');
const enemyHPFill = document.getElementById('enemy-hp-fill');
const targetWordEl = document.getElementById('target-word');
const targetMeaningEl = document.getElementById('target-meaning');
const inputWordEl = document.getElementById('input-word');
const notificationsEl = document.getElementById('notifications');
const sceneEl = document.getElementById('scene');

// Initialization
function initMenu() {
    mapContainerEl.style.backgroundImage = "url('assets/world_map.png')";

    regionNodes.forEach(node => {
        node.addEventListener('click', () => {
            currentLang = node.getAttribute('data-lang');
            useSentences = toggleSentencesEl.checked;
            showHelper = toggleHelperEl.checked;
            startGame();
        });
    });
}

function startGame() {
    mainMenuEl.style.display = 'none';
    sceneEl.style.display = 'block';

    // Set generated assets
    backgroundEl.style.backgroundImage = "url('assets/bg.png')";
    heroEl.style.backgroundImage = "url('assets/hero.png')";
    enemyEl.style.backgroundImage = "url('assets/enemy.png')";

    nextWord();
    
    // Add input listener
    inputWordEl.addEventListener('input', checkInput);
    inputWordEl.focus();
    
    // Start Enemy Attack Loop
    startEnemyAttacks();

    // Register Skillprint Adjustments if available
    setTimeout(() => {
        const adjustmentConfig = {
            '1': { parameterName: 'heroDamage', description: 'Decrease Hero Damage', value: 10 },
            '2': { parameterName: 'heroDamage', description: 'Increase Hero Damage', value: 40 },
            '3': { parameterName: 'enemyDamage', description: 'Decrease Enemy Damage', value: 5 },
            '4': { parameterName: 'enemyDamage', description: 'Increase Enemy Damage', value: 30 },
            '5': { parameterName: 'enemyAttackRateMs', description: 'Faster Enemy Attacks', value: 2000 },
            '6': { parameterName: 'enemyAttackRateMs', description: 'Slower Enemy Attacks', value: 8000 }
        };

        if (window.Skillprint && typeof window.Skillprint.registerAdjustments === 'function') {
            window.Skillprint.registerAdjustments(adjustmentConfig);
        } else {
            // Fallback for manual testing when Skillprint isn't attached
            window.addEventListener('keydown', (e) => {
                if (document.activeElement === inputWordEl) return; // Don't trigger when typing
                if (adjustmentConfig[e.key]) {
                    window.adjustGame(adjustmentConfig[e.key]);
                }
            });
        }
    }, 100);

    // Fallback global adjust command
    window.adjustGame = function(obj) {
        if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
            const { parameterName, parameterValue } = obj;
            if (window.GAME_CONFIG[parameterName] !== undefined) {
                window.GAME_CONFIG[parameterName] = parameterValue;
                console.log(`Adjusted ${parameterName} to ${parameterValue}`);
                
                // Restart timer if rate changes
                if (parameterName === 'enemyAttackRateMs') {
                    startEnemyAttacks();
                }
            }
        }
    }
}

function startEnemyAttacks() {
    if (enemyInterval) clearInterval(enemyInterval);
    enemyInterval = setInterval(() => {
        if (enemyHP > 0 && heroHP > 0) {
            enemyAttack();
        }
    }, window.GAME_CONFIG.enemyAttackRateMs);
}

function nextWord() {
    let next;
    const pool = useSentences ? coreSentences : coreWords;
    do {
        next = pool[Math.floor(Math.random() * pool.length)];
    } while (currentWordObj === next);
    
    currentWordObj = next;
    
    // Set up translation logic
    currentTargetTranslation = dictionaries[currentLang][currentWordObj.target].toUpperCase();
    
    // UI Updates
    targetWordEl.textContent = currentWordObj.prompt.toUpperCase();
    
    if (showHelper) {
        targetMeaningEl.textContent = `Type to Translate: "${currentTargetTranslation}"`;
        targetMeaningEl.style.opacity = 1;
    } else {
        targetMeaningEl.textContent = `Type to Translate (Hidden)`;
        targetMeaningEl.style.opacity = 0; // hide it mostly but maintain layout
    }

    inputWordEl.value = '';
    
    // Animate pop-in
    targetWordEl.style.transform = 'scale(0.8)';
    setTimeout(() => targetWordEl.style.transform = 'scale(1)', 50);
}

function checkInput(e) {
    const input = e.target.value.trim().toLowerCase();
    const target = currentTargetTranslation.toLowerCase();
    
    if (input === target) {
        // Success
        heroAttack(currentWordObj.target.includes("HEAL"));
    } else if (target.startsWith(input)) {
        // Still matching, do nothing
        inputWordEl.classList.remove('error-shake');
    } else {
        // Typing error, visual feedback
        inputWordEl.classList.add('error-shake');
        setTimeout(() => inputWordEl.classList.remove('error-shake'), 400); // remove after animation
    }
}

function showNotification(text, type='normal') {
    notificationsEl.textContent = text;
    notificationsEl.className = '';
    // force reflow
    void notificationsEl.offsetWidth;
    notificationsEl.classList.add('notify-show');
    if (type === 'damage') {
        notificationsEl.classList.add('notify-damage');
    }
}

function heroAttack(isHeal = false) {
    inputWordEl.value = '';
    inputWordEl.disabled = true; // disable until attack completes
    
    // Hero attack animation
    heroEl.classList.add('attacking');
    setTimeout(() => heroEl.classList.remove('attacking'), 600);
    
    showNotification(isHeal ? "HEAL!" : "PERFECT!");

    if (isHeal) {
        // Heal logic
        createMagicalEffect(heroEl, true);
        setTimeout(() => {
            heroHP = Math.min(maxHP, heroHP + window.GAME_CONFIG.healAmount);
            updateHPUI();
            inputWordEl.disabled = false;
            nextWord();
            inputWordEl.focus();
        }, 500);
        return;
    }
    
    // Shoot projectile
    const projectile = document.createElement('div');
    projectile.className = 'projectile hero-magic';
    sceneEl.appendChild(projectile);
    
    // Start pos
    projectile.style.left = '250px';
    projectile.style.top = '350px';
    
    // Animate to enemy
    requestAnimationFrame(() => {
        projectile.style.transition = 'all 0.5s ease-in';
        projectile.style.left = '700px';
        projectile.style.top = '400px';
    });
    
    // On hit
    setTimeout(() => {
        projectile.remove();
        
        enemyEl.classList.add('hit');
        setTimeout(() => enemyEl.classList.remove('hit'), 400);
        
        enemyHP = Math.max(0, enemyHP - window.GAME_CONFIG.heroDamage);
        updateHPUI();
        
        if (enemyHP <= 0) {
            enemyEl.style.filter = "brightness(0) blur(10px)";
            enemyEl.style.transition = "all 2s";
            enemyEl.style.opacity = 0;
            showNotification("VICTORY!");
            inputWordEl.disabled = true;
            clearInterval(enemyInterval);
        } else {
            inputWordEl.disabled = false;
            nextWord();
            inputWordEl.focus(); // keep focus
        }
    }, 500);
}

function enemyAttack() {
    enemyEl.classList.add('attacking-enemy');
    setTimeout(() => enemyEl.classList.remove('attacking-enemy'), 600);

    const projectile = document.createElement('div');
    projectile.className = 'projectile enemy-magic';
    sceneEl.appendChild(projectile);
    
    projectile.style.left = '700px';
    projectile.style.top = '350px';
    
    requestAnimationFrame(() => {
        projectile.style.transition = 'all 0.4s ease-in';
        projectile.style.left = '180px';
        projectile.style.top = '400px';
    });
    
    setTimeout(() => {
        projectile.remove();
        
        heroEl.classList.add('hit-hero');
        sceneEl.classList.add('damage-flash');
        
        setTimeout(() => {
            heroEl.classList.remove('hit-hero');
            sceneEl.classList.remove('damage-flash');
        }, 400);

        showNotification("DAMAGE!", "damage");
        
        heroHP = Math.max(0, heroHP - window.GAME_CONFIG.enemyDamage);
        updateHPUI();
        
        // Shake screen slightly
        sceneEl.style.transform = "translate(5px, 5px)";
        setTimeout(() => sceneEl.style.transform = "translate(-5px, -5px)", 50);
        setTimeout(() => sceneEl.style.transform = "translate(0, 0)", 100);

        if (heroHP <= 0) {
            heroEl.style.filter = "brightness(0) grayscale(1)";
            heroEl.style.transform = "rotate(-90deg) translate(-50px, 0)";
            heroEl.style.transition = "all 1s";
            showNotification("DEFEAT...");
            inputWordEl.disabled = true;
            clearInterval(enemyInterval);
        }
    }, 400);
}

function createMagicalEffect(target, isHeal) {
    const splash = document.createElement('div');
    splash.style.position = 'absolute';
    splash.style.left = isHeal ? '150px' : '750px';
    splash.style.top = '400px';
    splash.style.width = '100px';
    splash.style.height = '100px';
    splash.style.background = isHeal ? 'radial-gradient(#fff, #34c759)' : 'radial-gradient(#fff, #a29bfe)';
    splash.style.borderRadius = '50%';
    splash.style.mixBlendMode = 'screen';
    splash.style.pointerEvents = 'none';
    splash.style.zIndex = 20;
    splash.style.animation = 'attack 0.5s ease-out';
    splash.style.opacity = 0;
    sceneEl.appendChild(splash);
    setTimeout(() => splash.remove(), 500);
}

function updateHPUI() {
    heroHPFill.style.width = `${(heroHP / maxHP) * 100}%`;
    enemyHPFill.style.width = `${(enemyHP / maxHP) * 100}%`;
}

// Start game when loaded
window.addEventListener('load', initMenu);
