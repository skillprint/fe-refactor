import Background from './background/Background';
import Chips from './chips/Chips';
import Controller from './controller/Controller';
import Controls from './controls/Controls';
import IconMusic from './GUI/IconMusic';
import IconRules from './GUI/IconRules';
import IconSound from './GUI/IconSound';
import Stack from './stack/Stack';
import StackChip from './stack/StackChip';
import Bet from './text/Bet';
import Credits from './text/Credits';

export default class extends Phaser.Scene {
    constructor(name) {
        super(name);
    }

    create() {
        this.events.once('update', this.start, this);
    }

    start() {
        console.log('Game scene ready');

        // init layers
        this.createLayers();

        // create bg
        this.bg = new Background(this);

        // create chips buttons (bets)
        this.chips = new Chips(this);

        // add text fields
        this.credits = new Credits(this, 360, 1112);
        this.bet = new Bet(this, 360, 846);

        // add chip stack
        this.stack = new Stack(this, 0, 0);

        // add controls
        this.controls = new Controls(this);

        // add core controller
        this.controller = new Controller(this);

        // add gui
        this.rules = new IconRules(this, 660, 50);
        this.sound = new IconSound(this, 50, 50);
        this.music = new IconMusic(this, 120, 50);

        this.controller.startRound();
    }

    createLayers() {
        this.layers = {};
        let names = ['bg', 'stack', 'cards', 'gui', 'popup'];
        names.forEach((name) => {
            this.layers[name] = this.add.container(0, 0);
        });
    }
}
