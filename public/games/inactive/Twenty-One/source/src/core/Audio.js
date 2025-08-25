import config from '../startup/config';

export default class {
    constructor(scene) {
        this.scene = scene;
        this.storage = scene.game.storage;

        this.tracks = null; // track names
        this.audio = {}; // audio instances
        this.volume = {}; // track volumes
    }

    /**
     * Sets volume for the supplied track
     *
     * @param {string} track
     * @param {Number} volume
     */
    setVolume(track, volume) {
        // console.log(track, volume);
        this.volume[track] = volume;
        this.audio[track].forEach((instance) => instance.setVolume(volume));
        this.storage.setItem(`volume_${track}`, volume);
    }

    /**
     * Returns volume for the supplied track
     *
     * @param {string} track
     * @returns {number}
     */
    getVolume(track) {
        return parseFloat(this.volume[track]);
    }

    /**
     * Mutes or enables volume for the supplied track
     * Volume is based on config props
     *
     * @param {*} track
     * @returns {number} new volume
     */
    flipVolume(track) {
        let currentVolume = this.getVolume(track);
        let maxVolume = config[`${track}MaxVolume`];

        let volume = currentVolume === 0 ? maxVolume : 0;
        this.setVolume(track, volume);

        return parseFloat(volume);
    }

    /**
     * Loads audiosprites for each requested track
     *
     * @param {Phaser.Scene} scene
     * @param {Array} tracks track names, e.g. ['sound', 'music']
     */
    load(scene, tracks) {
        this.scene = scene;
        this.tracks = tracks;

        let path = 'assets/audio';
        let formats = ['.ogg', '.m4a', '.mp3', '.ac3'];

        this.scene.load.setPath(path);

        tracks.forEach((track) => {
            this.audio[track] = [];

            let sources = formats.map((format) => `${track}${format}?${Date.now()}`);
            this.scene.load.audioSprite(track, `${track}.json`, sources);
        });

        this.scene.load.setPath('');

        this.tracks.forEach((track) => {
            let volume = this.storage.initItem(`volume_${track}`, config[`${track}MaxVolume`]);
            this.volume[track] = volume;
        });
    }

    /**
     * Plays the sound and returns sound instance
     *
     * @param {string} track eg 'sound' or 'music'
     * @param {string} name sound name
     * @param {Object} options
     * @returns {} instance
     */
    play(track, name, options = {}) {
        let instance = this.scene.sound.addAudioSprite(track);
        instance.track = track;
        this.audio[track].push(instance);

        instance.once('complete', () => this.remove(instance));

        options.volume = this.volume[track];

        instance.play(name, options);
        return instance;
    }

    /**
     * Removes the instance from the list and destroys it
     *
     * @param {*} instance
     */
    remove(instance) {
        let index = this.audio[instance.track].indexOf(instance);
        this.audio[instance.track].splice(index, 1);
        if (instance.isPlaying) instance.destroy();
    }
}
