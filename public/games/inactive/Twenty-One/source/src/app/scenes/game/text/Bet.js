export default class Bet extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene.layers.stack.add(this);

        this.setup();
    }

    setup() {
        this.label = this.scene.add.bitmapText(0, 0, 'roboto', 'YOUR BET', 40, 1);
        this.label.setOrigin(0.5);
        this.label.setTint(0xffcc00);
        this.add(this.label);

        this.scene.events.on('update_bet', this.update, this);
        this.scene.events.once('set_maxbet', this.onSetMaxbet, this);
    }

    onSetMaxbet(bet) {
        this.maxbet = this.scene.add.bitmapText(155, -48, 'roboto', `max: ${bet}`, 36, 2);
        this.maxbet.setOrigin(1, 0.5);
        this.maxbet.setTint(0x193f28);
        this.add(this.maxbet);
    }

    update(bet) {
        let text = bet === 0 ? 'YOUR BET' : `$${bet}`;
        this.label.setText(text);
    }

    destroy() {
        this.scene.events.off('update_bet', this.update, this);
        this.scene.events.off('set_maxbet', this.onSetMaxbet, this);
        super.destroy();
    }
}
