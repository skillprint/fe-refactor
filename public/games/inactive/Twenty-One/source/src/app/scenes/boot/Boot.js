import Storage from '../../../core/Storage';
import Orientation from '../../../core/Orientation';
import Audio from '../../../core/Audio';
import Utils from '../../../core/Utils';
import Pevents from '../../../core/Pevents';

export default class extends Phaser.Scene {
    constructor(name) {
        super(name);
    }

    preload() {
        this.load.image('preload_logo', 'assets/images/preload/logo.png');
        this.load.image('preload_bar', 'assets/images/preload/bar.png');
    }

    create() {
        if (this.game.scale.scaleMode === Phaser.Scale.ScaleModes.NONE) {
            this.scale.resize(this.cameras.main.width, this.cameras.main.height);
        } else {
            this.scale.setGameSize(this.cameras.main.width, this.cameras.main.height);
        }

        // init p33 modules
        this.game.storage = new Storage();
        this.game.orientation = new Orientation();
        this.game.audio = new Audio(this);
        this.game.utils = new Utils(this);
        this.game.pevents = new Pevents();

        this.scene.start('Preload');
    }
}
