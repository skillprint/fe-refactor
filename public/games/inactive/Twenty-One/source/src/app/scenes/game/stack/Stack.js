import StackChip from './StackChip';

export default class Stack extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene.layers.stack.add(this);

        this.chips = [];
        this.offsetY = 1;

        this.scene.events.on('add_chip', this.addChip, this);
        this.scene.events.on('clear_bet', this.onClearBet, this);
        this.scene.events.on('clear_stack', this.onClearBet, this);
    }

    addChip(value) {
        let x = 360;
        let y = -150;

        let toY = -1 * this.chips.length * this.offsetY + 495;

        let chip = new StackChip(this.scene, x, y, value);
        this.add(chip);
        this.chips.push(chip);

        chip.drop(toY);
    }

    onClearBet() {
        this.chips.forEach((chip) => chip.destroy());
        this.chips = [];
    }

    destroy() {
        this.scene.events.off('add_chip', this.addChip, this);
        this.scene.events.off('clear_bet', this.onClearBet, this);
        this.scene.events.off('clear_stack', this.onClearBet, this);
        super.destroy();
    }
}
