export default class Card extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        this.scene.layers.cards.add(this);

        this.config = config;

        this.setup();
    }

    setup() {
        let texture = `cards/${this.suit}_${this.rank}`;
        this.sprite = this.scene.add.image(0, 0, 'atlas', texture);
        this.add(this.sprite);
    }

    async move(x, y) {
        let duration = 250;
        let ease = Phaser.Math.Easing.Back.Out;
        this.scene.game.audio.play('sound', 'card');

        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                x,
                y,
                duration,
                ease,
                onComplete: () => resolve(),
            });
        });
    }

    get suit() {
        return this.config.suit;
    }

    get rank() {
        return this.config.rank;
    }

    get value() {
        return this.config.value;
    }
}
