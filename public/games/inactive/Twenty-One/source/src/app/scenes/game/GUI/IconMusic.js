export default class IconMusic extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'atlas', 'music');
        this.scene.layers.gui.add(this);

        this.update();

        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', this.onClick, this);
    }

    onClick() {
        this.scene.game.audio.flipVolume('music');
        this.scene.game.audio.play('sound', 'click');
        this.update();
    }

    update() {
        let alpha = this.scene.game.audio.getVolume('music') === 0 ? 0.4 : 1;
        this.setAlpha(alpha);
    }
}
