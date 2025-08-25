const isMobile = require('is-mobile');

export default function (config) {
    if (isMobile({ tablet: true })) {
        let targetAspect = config.width / config.height;

        let deviceWidth = window.innerWidth * window.devicePixelRatio;
        let deviceHeight = window.innerHeight * window.devicePixelRatio;
        let deviceAspect = deviceWidth / deviceHeight;

        if (deviceAspect > targetAspect) {
            config.width = config.height * deviceAspect;
        } else {
            config.height = config.width / deviceAspect;
        }
    }
}
