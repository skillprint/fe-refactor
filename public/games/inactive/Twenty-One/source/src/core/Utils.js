export default class {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Rolls a random float between min and max
     *
     * @param {Number} min
     * @param {Number} max
     *
     * @returns {Number}
     */
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Waits for a given amount of time
     *
     * @param {Phaser.Scene} scene
     * @param {integer} delay msec
     */
    wait(delay) {
        return new Promise((resolve) => {
            this.activeScene.time.addEvent({
                delay,
                callback: () => resolve(),
            });
        });
    }

    get activeScene() {
        return this.scene.scene.manager.getScenes(true)[0];
    }
}
