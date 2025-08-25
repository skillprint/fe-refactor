export default class Chip extends Phaser.GameObjects.Container {
    constructor(scene, x, y, value) {
        super(scene, x, y);

        this.value = value;

        this.setup();
    }

    setup() {
        this.sprite = this.scene.add.image(0, 0, 'atlas', `chip_${this.value}`);
        this.add(this.sprite);

        this.shadow = this.scene.add.bitmapText(0, 2, 'roboto', this.value, 50, 1);
        this.shadow.setOrigin(0.5);
        this.shadow.setTint(0x000000);
        this.shadow.setAlpha(0.8);
        this.add(this.shadow);

        this.label = this.scene.add.bitmapText(-2, 0, 'roboto', this.value, 50, 1);
        this.label.setOrigin(0.5);
        this.add(this.label);

        this.sprite.setInteractive({ useHandCursor: true });
        this.sprite.on('pointerdown', this.onClick, this);
    }

    onClick() {
        this.scene.events.emit('add_bet', this);
    }

    showError() {
        this.scene.game.audio.play('sound', 'error');
    }

    enable() {
        this.sprite.setInteractive();
        this.setAlpha(1);
    }

    disable() {
        this.sprite.disableInteractive();
        this.setAlpha(0.5);
    }
}
