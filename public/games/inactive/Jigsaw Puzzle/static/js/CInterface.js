function CInterface() {
    var _bPreview;
    var _bRotation;
    var _oAudioToggle;
    var _oButExit;
    var _oButPreview;
    var _oButRotation;
    var _oButRestart;
    var _oButFullscreen;
    var _oTimeText;
    var _oTimeNum;
    var _oAreYouSurePanel;
    var _oFadeWin;


    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosPreview;
    var _pStartPosRotation;
    var _pStartPosRestart;
    var _pStartPosFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    this._init = function () {
        _bPreview = false;
        _bRotation = true;

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {
            x: CANVAS_WIDTH - (oSprite.width / 2) - 10,
            y: (oSprite.height / 2) + 10
        };
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        oSprite = s_oSpriteLibrary.getSprite("but_restart");
        _pStartPosRestart = {
            x: _pStartPosExit.x - oSprite.width,
            y: _pStartPosExit.y
        };
        _oButRestart = new CGfxButton(_pStartPosRestart.x, _pStartPosRestart.y, oSprite, s_oStage);
        _oButRestart.addEventListener(ON_MOUSE_UP, this._onRestartRelease, this);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSpriteAudio = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {
                x: _pStartPosRestart.x - oSpriteAudio.width / 2,
                y: _pStartPosRestart.y
            }
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSpriteAudio, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }

        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (ENABLE_FULLSCREEN === false) {
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.enabled) {
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {
                x: oSprite.width / 4 + 10,
                y: (oSprite.height / 2) + 4
            };

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSprite, s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }

        var oSpritePreview = s_oSpriteLibrary.getSprite("but_preview");
        _pStartPosPreview = {
            x: CANVAS_WIDTH - (oSpritePreview.width / 4) - 10,
            y: CANVAS_HEIGHT - oSpritePreview.height / 2 - 10
        };
        _oButPreview = new CToggle(_pStartPosPreview.x, _pStartPosPreview.y, oSpritePreview, _bPreview, s_oStage);
        _oButPreview.addEventListener(ON_MOUSE_UP, this._onPreviewRelease, this);

        var oSpriteRotation = s_oSpriteLibrary.getSprite("toggle_rotation");
        _pStartPosRotation = {
            x: _pStartPosPreview.x - oSpriteRotation.width / 2 - 10,
            y: _pStartPosPreview.y
        };
        _oButRotation = new CToggle(_pStartPosRotation.x, _pStartPosRotation.y, oSpriteRotation, _bRotation, s_oStage);
        _oButRotation.addEventListener(ON_MOUSE_UP, this._onRotationRelease, this);

        _oTimeText = new createjs.Text(TEXT_TIME, "50px " + PRIMARY_FONT, "#008df0");
        _oTimeText.x = BOARD_X;
        _oTimeText.y = BOARD_Y - 12;
        _oTimeText.textAlign = "left";
        _oTimeText.textBaseline = "alphabetic";
        _oTimeText.lineWidth = 200;
        s_oStage.addChild(_oTimeText);

        _oTimeNum = new createjs.Text("00:00", "50px " + PRIMARY_FONT, "#ffffff");
        _oTimeNum.x = _oTimeText.x + _oTimeText.getBounds().width + 20;
        _oTimeNum.y = _oTimeText.y;
        _oTimeNum.textAlign = "left";
        _oTimeNum.textBaseline = "alphabetic";
        _oTimeNum.lineWidth = 200;
        s_oStage.addChild(_oTimeNum);

        _oFadeWin = new createjs.Shape();
        _oFadeWin.graphics.beginFill("white").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFadeWin.alpha = 0;
        s_oStage.addChild(_oFadeWin);

        _oAreYouSurePanel = new CAreYouSurePanel(s_oStage);

        this.enableGUI(false);

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.unload = function () {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }

        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.unload();
        }

        _oButRotation.unload();
        _oButPreview.unload();
        _oButExit.unload();
        _oButRestart.unload();

        s_oInterface = null;
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oButExit.setPosition(_pStartPosExit.x - iNewX, iNewY + _pStartPosExit.y);
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX, _pStartPosFullscreen.y + iNewY);
        }

        _oButRotation.setPosition(_pStartPosRotation.x - iNewX, _pStartPosRotation.y - iNewY);
        _oButPreview.setPosition(_pStartPosPreview.x - iNewX, _pStartPosPreview.y - iNewY);
        _oButRestart.setPosition(_pStartPosRestart.x - iNewX, _pStartPosRestart.y + iNewY);
    };

    this.enableGUI = function (bEnable) {
        if (bEnable) {
            _oButPreview.enable();
            _oButRotation.enable();
            _oButExit.enable();
        } else {
            _oButPreview.disable();
            _oButRotation.disable();
            _oButExit.disable();
        }

    };

    this.refreshTime = function (iValue) {
        _oTimeNum.text = iValue;
    };

    this.playWinEffect = function () {
        createjs.Tween.get(_oFadeWin).to({
            alpha: 1
        }, 200, createjs.Ease.cubicOut).call(function () {
            s_oGame.placePiecesInCorrectPosition();
            createjs.Tween.get(_oFadeWin).to({
                alpha: 0
            }, 200, createjs.Ease.cubicOut).call(function () {
                s_oGame.playFinalEffect();
            });
        });
    };

    this.resetFullscreenBut = function () {
        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.setActive(s_bFullscreen);
        }
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onExit = function () {
        s_oGame.pause(true);

        _oAreYouSurePanel.show(TEXT_ARE_YOU_SURE);
        _oAreYouSurePanel.addEventListener(ON_RELEASE_YES, this._onReleaseYes);
        _oAreYouSurePanel.addEventListener(ON_RELEASE_NO, this._onReleaseNo);
    };

    this._onReleaseYes = function () {
        $(s_oMain).trigger("end_session");
        $(s_oMain).trigger("show_interlevel_ad");
        GameEnd = 1;
        Skillprint.endGame({
            score: gamescore,
            time: timeelapsed
        })
        s_oGame.onExit();
    };

    this._onReleaseNo = function () {
        s_oGame.pause(false);
    };

    this._onPreviewRelease = function () {
        _bPreview = !_bPreview;
        s_oGame.showPreview(_bPreview);
    };

    this._onRotationRelease = function () {
        _bRotation = !_bRotation;
        s_oGame.toggleRotation(_bRotation);
    };

    this._onRestartRelease = function () {
        s_oGame.restart();
    };

    this._onFullscreenRelease = function () {
        if (s_bFullscreen) {
            _fCancelFullScreen.call(window.document);
        } else {
            _fRequestFullScreen.call(window.document.documentElement);
        }

        sizeHandler();
    };

    this.isPreviewVisible = function () {
        return _bPreview;
    };

    this.isRotationActive = function () {
        return _bRotation;
    };

    s_oInterface = this;

    this._init();

    return this;
}

var s_oInterface = null;