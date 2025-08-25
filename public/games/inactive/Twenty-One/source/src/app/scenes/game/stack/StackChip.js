export default class StackChip extends Phaser.GameObjects.Container {
    constructor(scene, x, y, value) {
        super(scene, x, y);

        this.value = value;

        this.setup();
    }

    setup() {
        this.sprite = this.scene.add.image(0, 0, 'atlas', `chip_${this.value}`);
        this.add(this.sprite);
    }

    drop(y) {
        let duration = 200;
        let ease = Phaser.Math.Easing.Linear;

        this.scene.tweens.add({
            targets: this,
            y,
            duration,
            ease,
        });
    }
}
