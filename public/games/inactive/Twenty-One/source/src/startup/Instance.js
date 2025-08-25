import Phaser from 'phaser';
import config from './config';
import setResponsive from './setResponsive';

export default class extends Phaser.Game {
    constructor() {
        if (config.responsive) setResponsive(config);
        super(config);
        this.createScenes();
    }

    async createScenes() {
        const names = ['Boot', 'Preload', 'Game'];

        let scenes = {};

        // import scenes
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            scenes[name] = await import(`../app/scenes/${name.toLowerCase()}/${name}`);
        }

        // add scenes to the game
        for (let name in scenes) {
            this.scene.add(name, scenes[name].default);
        }

        // start game
        this.scene.start('Boot');
    }
}
