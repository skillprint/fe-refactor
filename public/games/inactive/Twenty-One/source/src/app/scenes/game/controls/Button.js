export default class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text) {
        super(scene, x, y);

        this.setup(text);
    }

    setup(text) {
        this.sprite = this.scene.add.image(0, 0, 'atlas', 'button');
        this.add(this.sprite);

        this.label = this.scene.add.bitmapText(0, 0, 'roboto', text, 40);
        this.label.setOrigin(0.5);
        this.label.setTint(0x442207);
        this.add(this.label);

        this.sprite.setInteractive({ useHandCursor: true });
        this.sprite.on('pointerdown', this.onClick, this);
    }

    enable() {
        this.sprite.setFrame('button');
        this.sprite.setInteractive();
    }

    disable() {
        this.sprite.setFrame('button_disabled');
        this.sprite.disableInteractive();
    }

    onClick() {
        this.scene.game.audio.play('sound', 'click');
        this.emit('click');
    }
}
