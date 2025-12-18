import { SkillprintConfig, ParameterDefinition, ParameterType, Mood, PhaserSkillprintAdapter } from './skillprint-sdk.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.enemySpawnRate = 2.0;
        this.playerSpeed = 200;
        this.difficultyMultiplier = 1.0;
    }

    preload() {
        // Load your game assets
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy.png');
    }

    create() {
        // Initialize Skillprint SDK
        this.initializeSkillprint();
        
        // Create game objects
        this.player = this.add.sprite(400, 300, 'player');
        this.enemies = this.add.group();
        
        // Setup game mechanics
        this.setupPlayerControls();
        this.startEnemySpawning();
    }

    initializeSkillprint() {
        // Create SDK configuration
        const config = new SkillprintConfig({
            gameName: 'my-awesome-phaser-game',
            targetEnvironment: 'production', // or 'staging'
            productionPartnerApiKey: 'your-api-key-here',
            productionApiBaseUrl: 'https://api.skillprint.com/v1',
            enableDebugLogging: true,
            screenshotIntervalSeconds: 2.0,
            screenshotPostIntervalSeconds: 5.0,
            pollResultsIntervalSeconds: 5.0,
            gameParameters: [
                new ParameterDefinition({
                    parameterName: 'enemySpawnRate',
                    description: 'Rate at which enemies spawn per second',
                    howSDKChangesIt: 'Increases for more challenge, decreases for easier gameplay',
                    type: ParameterType.FLOAT,
                    minValue: 0.5,
                    maxValue: 5.0,
                    defaultValue: '2.0'
                }),
                new ParameterDefinition({
                    parameterName: 'playerSpeed',
                    description: 'Player movement speed in pixels per second',
                    howSDKChangesIt: 'Adjusts based on player skill level',
                    type: ParameterType.INTEGER,
                    minValue: 100,
                    maxValue: 400,
                    defaultValue: '200'
                }),
                new ParameterDefinition({
                    parameterName: 'difficultyMultiplier',
                    description: 'General difficulty scaling factor',
                    howSDKChangesIt: 'Overall difficulty adjustment',
                    type: ParameterType.FLOAT,
                    minValue: 0.5,
                    maxValue: 2.0,
                    defaultValue: '1.0'
                })
            ]
        });

        // Create Phaser adapter
        this.skillprint = PhaserSkillprintAdapter.create(this, config);

        // Register parameter modifiers
        this.skillprint.registerParameter('enemySpawnRate', (value) => {
            this.enemySpawnRate = value;
            console.log(`Enemy spawn rate adjusted to: ${value}`);
        }, 'number');

        this.skillprint.registerParameter('playerSpeed', (value) => {
            this.playerSpeed = value;
            console.log(`Player speed adjusted to: ${value}`);
        }, 'integer');

        this.skillprint.registerParameter('difficultyMultiplier', (value) => {
            this.difficultyMultiplier = value;
            console.log(`Difficulty multiplier adjusted to: ${value}`);
        }, 'number');

        // Start session (can use URL parameters for WebGL builds)
        this.skillprint.startSession(Mood.FOCUS, 'player123');
        
        // Alternative: Start from URL parameters (for WebGL)
        // this.skillprint.manager.startGameSessionFromUrl('focus', 'defaultPlayer');
    }

    setupPlayerControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    startEnemySpawning() {
        this.enemySpawnTimer = this.time.addEvent({
            delay: () => 1000 / this.enemySpawnRate, // Convert rate to milliseconds
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    spawnEnemy() {
        const enemy = this.add.sprite(
            Phaser.Math.Between(0, this.game.config.width),
            0,
            'enemy'
        );
        this.enemies.add(enemy);
        
        // Move enemy down with difficulty adjustment
        this.tweens.add({
            targets: enemy,
            y: this.game.config.height + 50,
            duration: 3000 / this.difficultyMultiplier,
            onComplete: () => enemy.destroy()
        });
    }

    update() {
        // Player movement with adjustable speed
        if (this.cursors.left.isDown) {
            this.player.x -= this.playerSpeed * (this.game.loop.delta / 1000);
        } else if (this.cursors.right.isDown) {
            this.player.x += this.playerSpeed * (this.game.loop.delta / 1000);
        }

        if (this.cursors.up.isDown) {
            this.player.y -= this.playerSpeed * (this.game.loop.delta / 1000);
        } else if (this.cursors.down.isDown) {
            this.player.y += this.playerSpeed * (this.game.loop.delta / 1000);
        }
    }

    shutdown() {
        // Clean up when scene is destroyed
        if (this.skillprint) {
            this.skillprint.stopSession();
        }
    }
}

// Game configuration
const phaserConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2c3e50',
    scene: GameScene,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    }
};

const game = new Phaser.Game(phaserConfig);