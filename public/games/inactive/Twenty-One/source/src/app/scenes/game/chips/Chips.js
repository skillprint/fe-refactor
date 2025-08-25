import Chip from './Chip';

export default class Chips extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene.layers.gui.add(this);

        this.chips = [];

        this.setup();
    }

    setup() {
        let offsetX = 90;
        let offsetY = 1000;
        let width = 135;
        let values = [1, 5, 10, 25, 100];

        values.forEach((value, index) => {
            let x = offsetX + index * width;
            let y = offsetY;

            let chip = new Chip(this.scene, x, y, value);
            this.add(chip);

            this.chips.push(chip);
        });

        this.scene.events.on('enable_betting', this.onEnableBetting, this);
        this.scene.events.on('disable_betting', this.onDisableBetting, this);
    }

    onEnableBetting() {
        this.chips.forEach((chip) => chip.enable());
    }

    onDisableBetting() {
        this.chips.forEach((chip) => chip.disable());
    }

    destroy() {
        this.scene.events.off('enable_betting', this.onEnableBetting, this);
        this.scene.events.off('disable_betting', this.onDisableBetting, this);
        super.destroy();
    }
}
