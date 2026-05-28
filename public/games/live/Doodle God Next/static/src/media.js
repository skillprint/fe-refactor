Module['media'] = {};
var oneMusic = null;

const missingMedia = new Set();
const normalizeMediaPath = (filename) => {
    let path = filename;
    if (path.match(/\.(mp3|wav|ogg)$/) && path.startsWith('data/sounds/')) {
        path = "/sounds/" + path.substring('data/sounds/'.length);
    }
    return path;
};

const mediaCandidates = (filename) => {
    const path = normalizeMediaPath(filename);
    if (/^https?:\/\//i.test(path)) return [{ host: '', url: path }];

    if (window.DGHost?.candidates) return window.DGHost.candidates(path);
    return [{ host: '', url: String(path).replace(/^\/+/, '') }];
};

Module['Media'] = function (filename, loop, continueOnFocus = false, hasMusic = false) {
    this.candidates = mediaCandidates(filename);
    this.candidateIndex = 0;
    this.currentCandidate = null;
    this.missing = false;
    this.wasPlaying = false;
    this.audio = null;
    this.loop = loop || false;
    this.continueOnFocus = continueOnFocus || false;
    this.hasMusic = hasMusic;

    // console.log(`play sound ${filename}`)
    this.loadNextCandidate(false);

    if (this.hasMusic) {
        if (oneMusic) oneMusic.pause();
        oneMusic = this;
    } 
};

var focuesd = true;
Module['Media'].isTouched = false; // Статическое поле для отслеживания состояния тача

Module['Media'].prototype.loadNextCandidate = function (autoPlay) {
    while (this.candidateIndex < this.candidates.length) {
        const candidate = this.candidates[this.candidateIndex++];
        const src = candidate.url || candidate;
        if (!src || missingMedia.has(src)) continue;

        try {
            const audio = new Audio(src);
            this.currentCandidate = candidate;
            audio.addEventListener('error', () => {
                missingMedia.add(src);
                window.DGHost?.markFailed?.(candidate.host || src);
                if (this.audio === audio) {
                    this.audio = null;
                    this.loadNextCandidate(this.wasPlaying || autoPlay);
                }
            }, { once: true });

            audio.loop = this.loop || false;
            this.audio = audio;
            this.missing = false;
            if (autoPlay) this.play();
            return true;
        } catch {
            missingMedia.add(src);
            window.DGHost?.markFailed?.(candidate.host || src);
        }
    }

    this.audio = null;
    this.missing = true;
    return false;
};

Module['Media'].prototype.play = function () {
    if (!this.audio && !this.loadNextCandidate(false)) return;
    if (this.missing || !this.audio) return;

    // if (focuesd /* && Module['Media'].isTouched */) {
        try {
            this.audio.loop = this.loop || false;
            this.audio.play();
        } catch (e) {
            // console.warn('Media.play failed', e);
        }
    // }
    this.wasPlaying = true;
    if (this.hasMusic) {
        if (oneMusic && oneMusic !== this) oneMusic.pause();
        oneMusic = this;
    }
};

Module['Media'].prototype.stop = function () {
    if (this.missing || !this.audio) return;
    try {
        this.audio.pause();
        this.audio.currentTime = 0;
    } catch (e) {
        // console.warn('Media.stop failed', e);
    }
    this.wasPlaying = false;
};

Module['Media'].prototype.pause = function () {
    if (this.missing || !this.audio) return;
    try {
        this.audio.pause();
    } catch (e) {
        // console.warn('Media.pause failed', e);
    }
    this.wasPlaying = false;
};

Module['Media'].prototype.setVolume = function (volume) {
    if (this.missing || !this.audio) return;
    try {
        this.audio.volume = volume;
    } catch (e) {
        // console.warn('Media.setVolume failed', e);
    }
};

Module['Media'].prototype.isPlaying = function () {
    if (this.missing || !this.audio) return false;
    return !this.audio.paused;
};

Module['Media'].prototype.getPosition = function () {
    if (this.missing || !this.audio) return 0;
    return this.audio.currentTime * 1000;
};

Module['Media'].prototype.seek = function (position) {
    if (this.missing || !this.audio) return;
    this.audio.currentTime = position / 1000;
};


//##############################################################################
//##############################################################################
//##############################################################################

Module['createMedia'] = function (filename, loop, continueOnFocus = false, hasMusic = false) {
    //DISABLE ALL MEDIA 
    Module['media'][filename] = new Module['Media'](filename, loop, continueOnFocus, hasMusic);
};

Module['playMedia'] = function (filename) {
    var media = Module['media'][filename];
    if (media) {
        media.play();
    }
};

Module['stopMedia'] = function (filename) {
    var media = Module['media'][filename];
    if (media) {
        media.stop();
    }
};

Module['pauseMedia'] = function (filename) {
    var media = Module['media'][filename];
    if (media) {
        media.pause();
    }
};

Module['setMediaVolume'] = function (filename, volume) {
    var media = Module['media'][filename];
    if (media) {
        media.setVolume(volume);
    }
};

Module['isMediaPlaying'] = function (filename) {
    var media = Module['media'][filename];
    return media ? media.isPlaying() : false;
};

Module['getMediaPosition'] = function (filename) {
    var media = Module['media'][filename];
    return media ? media.getPosition() : 0;
};

Module['seekMedia'] = function (filename, position) {
    var media = Module['media'][filename];
    if (media) {
        media.seek(position);
    }
};

const pauseAllMedia = () => {
    for (var key in Module['media']) {
        var media = Module['media'][key];

        if (!media || !media.isPlaying()) {
            media && (media.wasPlaying = false);
            continue;
        }

        if (media.hasMusic || media.continueOnFocus) {
            media.pause();
            media.wasPlaying = true;
        } else {
            media.wasPlaying = false; // SFX не трогаем
        }
    }
};

var interval_paused;
const startListenerPaused = () => {
    interval_paused = setInterval(pauseAllMedia, 100);
}

const resumeAllMedia = () => {
    for (var key in Module['media']) {

        var media = Module['media'][key];
        if (media && media.wasPlaying && media.continueOnFocus) {

            media.play();
            console.log('resume', key, media);
        }

    }
};

Module['Media'].pauseAll = pauseAllMedia;
Module['Media'].resumeAll = resumeAllMedia;
window.DGMedia = {
    pauseAll: pauseAllMedia,
    resumeAll: resumeAllMedia,
};

window.addEventListener('blur', function () {
    pauseAllMedia();
    focuesd = false;
});

window.addEventListener('focus', function () {
    focuesd = true;
    resumeAllMedia();
});

window.addEventListener('touchstart', function () {
    Module['Media'].isTouched = true;
});

window.addEventListener('touchend', function () {
    Module['Media'].isTouched = false;
});
