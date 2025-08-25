import Button from './Button';

export default class Controls extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene.layers.gui.add(this);

        this.setup();
    }

    setup() {
        // betting
        this.clearBet = new Button(this.scene, 190, 1220, 'CLEAR BET');
        this.add(this.clearBet);

        this.startGame = new Button(this.scene, 530, 1220, 'START GAME');
        this.add(this.startGame);

        // gameplay
        this.stop = new Button(this.scene, 190, 1220, 'STOP');
        this.add(this.stop);

        this.hit = new Button(this.scene, 530, 1220, 'HIT');
        this.add(this.hit);

        this.clearBet.on('click', () => this.scene.events.emit('clear_bet'));
        this.startGame.on('click', () => this.scene.events.emit('start_game'));
        this.stop.on('click', () => this.scene.events.emit('stop'));
        this.hit.on('click', () => this.scene.events.emit('hit'));

        this.scene.events.on('show_betting_controls', this.onShowBettingControls, this);
        this.scene.events.on('show_gameplay_controls', this.onShowGameplayControls, this);
        this.scene.events.on('enable_gameplay_controls', this.onEnableGameplayControls, this);
        this.scene.events.on('disable_gameplay_controls', this.onDisableGameplayControls, this);
        this.scene.events.on('update_bet', this.onBetUpdated, this);

        this.onShowBettingControls();
    }

    onShowBettingControls() {
        this.clearBet.setVisible(true);
        this.startGame.setVisible(true);
        this.clearBet.disable();
        this.startGame.disable();

        this.stop.setVisible(false);
        this.hit.setVisible(false);
    }

    onShowGameplayControls() {
        this.clearBet.setVisible(false);
        this.startGame.setVisible(false);

        this.stop.setVisible(true);
        this.stop.disable();
        this.hit.setVisible(true);
        this.hit.disable();
    }

    onEnableGameplayControls() {
        this.stop.enable();
        this.hit.enable();
    }

    onDisableGameplayControls() {
        this.stop.disable();
        this.hit.disable();
    }

    onBetUpdated(bet) {
        if (bet === 0) {
            this.clearBet.disable();
            this.startGame.disable();
        } else {
            this.clearBet.enable();
            this.startGame.enable();
        }
    }

    destroy() {
        this.scene.events.off('show_betting_controls', this.onShowBettingControls, this);
        this.scene.events.off('show_gameplay_controls', this.onShowGameplayControls, this);
        this.scene.events.off('enable_gameplay_controls', this.onEnableGameplayControls, this);
        this.scene.events.off('disable_gameplay_controls', this.onDisableGameplayControls, this);
        this.scene.events.off('bet_updated', this.onBetUpdated, this);
        super.destroy();
    }
}
