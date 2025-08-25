const isMobile = require('is-mobile');
import config from '../startup/config';

export default class {
    constructor() {
        this.lock = config.lockOrientation;

        if (!this.lock || !isMobile({ tablet: true })) return;

        this.init();
    }

    init() {
        let image = `url(assets/images/web/play_${this.lock}.png)`;

        let div = document.getElementById('turn');
        div.style.backgroundImage = image;

        if (!this.isCorrect) {
            div.style.display = 'block';
            window.onresize = () => {
                if (this.isCorrect) window.location.reload();
            };
        } else {
            window.onresize = () => {
                let display = this.isCorrect ? 'none' : 'block';
                div.style.display = display;
            };
        }
    }

    get isCorrect() {
        if (window.innerWidth > window.innerHeight) {
            return this.lock === 'landscape';
        } else {
            return this.lock === 'portrait';
        }
    }
}
