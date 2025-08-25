export default class Background extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene.layers.bg.add(this);

        this.setup();
    }

    setup() {
        this.bg = this.scene.add.image(0, 0, 'atlas', 'bg').setOrigin(0);
        this.add(this.bg);

        // setup chip shadows
        let offsetX = 90 + 2;
        let offsetY = 1000 + 2;
        let width = 135;

        for (let i = 0; i < 5; i++) {
            let x = offsetX + width * i;
            let y = offsetY;
            let shadow = this.scene.add.image(x, y, 'atlas', 'chip_shadow');
            shadow.setAlpha(0.6);
            this.add(shadow);
        }
    }
}
