export default class Credits extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene.layers.gui.add(this);

        this.setup();
    }

    setup() {
        this.label = this.scene.add.bitmapText(0, 0, 'roboto', '', 40, 1);
        this.label.setOrigin(0.5);
        this.add(this.label);

        this.scene.events.on('update_credits', this.update, this);
    }

    update(credits) {
        this.label.setText(`$${credits}`);
    }

    destroy() {
        this.scene.events.off('update_credits', this.update, this);
        super.destroy();
    }
}
