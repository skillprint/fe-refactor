import * as THREE from 'three';
import { SkillprintConfig, ParameterDefinition, ParameterType, Mood, ThreeSkillprintAdapter } from './skillprint-sdk.js';

class ThreeJSGame {
    constructor() {
        this.rotationSpeed = 0.01;
        this.lightIntensity = 1.0;
        this.cameraDistance = 5;
        
        this.init();
    }

    init() {
        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x222222);
        document.body.appendChild(this.renderer.domElement);

        // Create game objects
        this.createGameObjects();
        
        // Initialize Skillprint
        this.initializeSkillprint();
        
        // Start render loop
        this.animate();
    }

    createGameObjects() {
        // Create a spinning cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        // Add lighting
        this.light = new THREE.DirectionalLight(0xffffff, this.lightIntensity);
        this.light.position.set(1, 1, 1);
        this.scene.add(this.light);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Position camera
        this.camera.position.z = this.cameraDistance;
    }

    initializeSkillprint() {
        // Create SDK configuration
        const config = new SkillprintConfig({
            gameName: 'my-threejs-game',
            targetEnvironment: 'production',
            productionPartnerApiKey: 'your-api-key-here',
            enableDebugLogging: true,
            gameParameters: [
                new ParameterDefinition({
                    parameterName: 'rotationSpeed',
                    description: 'Speed of cube rotation',
                    howSDKChangesIt: 'Adjusts rotation speed based on player engagement',
                    type: ParameterType.FLOAT,
                    minValue: 0.005,
                    maxValue: 0.05,
                    defaultValue: '0.01'
                }),
                new ParameterDefinition({
                    parameterName: 'lightIntensity',
                    description: 'Intensity of the directional light',
                    howSDKChangesIt: 'Adjusts lighting for visual comfort',
                    type: ParameterType.FLOAT,
                    minValue: 0.2,
                    maxValue: 2.0,
                    defaultValue: '1.0'
                }),
                new ParameterDefinition({
                    parameterName: 'cameraDistance',
                    description: 'Distance of camera from the object',
                    howSDKChangesIt: 'Adjusts viewing distance',
                    type: ParameterType.FLOAT,
                    minValue: 2.0,
                    maxValue: 10.0,
                    defaultValue: '5.0'
                })
            ]
        });

        // Create Three.js adapter
        this.skillprint = ThreeSkillprintAdapter.create(this.renderer, config);

        // Register parameter modifiers using the Three.js adapter helpers
        this.skillprint.registerParameter('rotationSpeed', (value) => {
            this.rotationSpeed = value;
            console.log(`Rotation speed adjusted to: ${value}`);
        }, 'number');

        this.skillprint.registerObjectProperty('lightIntensity', this.light, 'intensity');
        
        this.skillprint.registerParameter('cameraDistance', (value) => {
            this.cameraDistance = value;
            this.camera.position.z = value;
            console.log(`Camera distance adjusted to: ${value}`);
        }, 'number');

        // Start session
        this.skillprint.startSession(Mood.CREATIVITY, 'threejs-player');
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate cube at adjustable speed
        this.cube.rotation.x += this.rotationSpeed;
        this.cube.rotation.y += this.rotationSpeed;

        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        if (this.skillprint) {
            this.skillprint.stopSession();
        }
    }
}

// Start the game
const game = new ThreeJSGame();

// Handle window resize
window.addEventListener('resize', () => {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
});