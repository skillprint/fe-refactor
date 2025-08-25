export default class Rules extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene.layers.popup.add(this);

        this.setup();
    }

    setup() {
        this.back = this.scene.add
            .sprite(0, 0, 'atlas', 'blank')
            .setOrigin(0)
            .setDisplaySize(this.scene.cameras.main.width, this.scene.cameras.main.height);
        this.back.setInteractive();
        this.back.setTint(0x000000);
        this.back.setAlpha(0.01);
        this.add(this.back);

        let x = this.scene.cameras.main.centerX;
        let y = this.scene.cameras.main.centerY - 140;
        this.sprite = this.scene.add.sprite(x, y, 'atlas', 'rules');
        this.add(this.sprite);
        this.sprite.setScale(0);

        this.close = this.scene.add.image(x + 300, y - 122, 'atlas', 'close');
        this.close.setVisible(false);
        this.add(this.close);
    }

    async show() {
        await this.fadeOut();
        await this.bumpIn();

        this.close.setVisible(true);
        this.close.setInteractive({ useHandCursor: true });
        this.close.once('pointerdown', this.hide, this);
    }

    async hide() {
        this.scene.game.audio.play('sound', 'click');
        this.close.setVisible(false);

        await this.bumpOut();
        await this.fadeIn();

        this.destroy();
    }

    fadeOut() {
        return new Promise((resolve) => {
            this.scene.add.tween({
                targets: this.back,
                duration: 200,
                alpha: 0.75,
                onComplete: () => resolve(),
            });
        });
    }

    fadeIn() {
        return new Promise((resolve) => {
            this.scene.add.tween({
                targets: this.back,
                duration: 200,
                alpha: 0.01,
                onComplete: () => resolve(),
            });
        });
    }

    bumpIn() {
        return new Promise((resolve) => {
            this.scene.add.tween({
                targets: this.sprite,
                duration: 200,
                scaleX: 1,
                scaleY: 1,
                ease: Phaser.Math.Easing.Back.Out,
                onComplete: () => resolve(),
            });
        });
    }

    bumpOut() {
        return new Promise((resolve) => {
            this.scene.add.tween({
                targets: this.sprite,
                duration: 200,
                scaleX: 0,
                scaleY: 0,
                ease: Phaser.Math.Easing.Back.In,
                onComplete: () => resolve(),
            });
        });
    }
}
