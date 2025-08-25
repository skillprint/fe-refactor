import Rules from '../popups/Rules';

export default class extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'atlas', 'icon_rules');
        this.scene.layers.gui.add(this);

        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', this.onClick, this);
    }

    onClick() {
        this.scene.game.audio.play('sound', 'click');
        let rules = new Rules(this.scene);
        rules.show();
    }

    destroy() {
        this.off('pointerdown', this.onClick, this);
        super.destroy();
    }
}
