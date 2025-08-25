import 'phaser/plugins/spine/dist/SpinePlugin';

export default {
    type: Phaser.AUTO,
    width: 720,
    height: 1280,
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    plugins: {
        scene: [{ key: 'SpinePlugin', plugin: window.SpinePlugin, mapping: 'spine' }],
    },
    prefix: 'p33_',
    soundMaxVolume: 1,
    musicMaxVolume: 0.5,
    responsive: false,
    lockOrientation: 'portrait', // false, portrait, landscape
};
