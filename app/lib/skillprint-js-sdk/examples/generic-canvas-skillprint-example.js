import { SkillprintConfig, ParameterDefinition, ParameterType, Mood, GenericCanvasSkillprintAdapter } from './skillprint-sdk.js';

class GenericCanvasGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game parameters
        this.ballSpeed = 2;
        this.ballSize = 20;
        this.backgroundColor = '#2c3e50';
        
        // Game state
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            vx: this.ballSpeed,
            vy: this.ballSpeed
        };

        this.init();
    }

    init() {
        this.initializeSkillprint();
        this.gameLoop();
    }

    initializeSkillprint() {
        const config = new SkillprintConfig({
            gameName: 'generic-canvas-ball-game',
            targetEnvironment: 'production',
            productionPartnerApiKey: 'your-api-key-here',
            enableDebugLogging: true,
            gameParameters: [
                new ParameterDefinition({
                    parameterName: 'ballSpeed',
                    description: 'Speed of the bouncing ball',
                    howSDKChangesIt: 'Adjusts speed for engagement level',
                    type: ParameterType.INTEGER,
                    minValue: 1,
                    maxValue: 10,
                    defaultValue: '2'
                }),
                new ParameterDefinition({
                    parameterName: 'ballSize',
                    description: 'Size of the ball in pixels',
                    howSDKChangesIt: 'Adjusts size for visual clarity',
                    type: ParameterType.INTEGER,
                    minValue: 10,
                    maxValue: 50,
                    defaultValue: '20'
                })
            ]
        });

        // Create generic canvas adapter
        this.skillprint = GenericCanvasSkillprintAdapter.create(this.canvas, config);

        // Register parameter modifiers
        this.skillprint.registerParameter('ballSpeed', (value) => {
            this.ballSpeed = value;
            // Update ball velocity maintaining direction
            const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
            const ratio = this.ballSpeed / speed;
            this.ball.vx *= ratio;
            this.ball.vy *= ratio;
            console.log(`Ball speed adjusted to: ${value}`);
        }, 'integer');

        this.skillprint.registerParameter('ballSize', (value) => {
            this.ballSize = value;
            console.log(`Ball size adjusted to: ${value}`);
        }, 'integer');

        // Start session
        this.skillprint.startSession(Mood.JOY);
    }

    update() {
        // Update ball position
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Bounce off walls
        if (this.ball.x <= this.ballSize/2 || this.ball.x >= this.canvas.width - this.ballSize/2) {
            this.ball.vx = -this.ball.vx;
        }
        if (this.ball.y <= this.ballSize/2 || this.ball.y >= this.canvas.height - this.ballSize/2) {
            this.ball.vy = -this.ball.vy;
        }

        // Keep ball in bounds
        this.ball.x = Math.max(this.ballSize/2, Math.min(this.canvas.width - this.ballSize/2, this.ball.x));
        this.ball.y = Math.max(this.ballSize/2, Math.min(this.canvas.height - this.ballSize/2, this.ball.y));
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ball
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballSize/2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    dispose() {
        if (this.skillprint) {
            this.skillprint.stopSession();
        }
    }
}