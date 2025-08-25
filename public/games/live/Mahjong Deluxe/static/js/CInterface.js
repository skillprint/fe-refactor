function CInterface(iScore) {
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosScore;
    var _pStartPosBonusTime;
    var _pStartPosFullscreen;
    var _pStartPosHint;
    var _pStartPosRestart;
    var _pStartPosShuffle;

    var _oBonusTimeText;
    var _oScoreText;
    var _oButExit;
    var _oButHint;
    var _oButRestart;
    var _oButShuffle;
    var _oAreYouSurePanel;
    var _oWinPanel;
    var _oGameOverPanel;

    var _oAudioToggle;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    this._init = function (iScore) {
        scoregame = iScore;
        _pStartPosScore = {
            x: 10,
            y: 5
        };
        _oScoreText = new createjs.Text(TEXT_SCORE + " " + iScore, "22px " + FONT_GAME, "#d7d5d2");
        _oScoreText.x = _pStartPosScore.x;
        _oScoreText.y = _pStartPosScore.y;
        _oScoreText.textAlign = "left";
        s_oStage.addChild(_oScoreText);

        _pStartPosBonusTime = {
            x: 200,
            y: 5
        };
        _oBonusTimeText = new createjs.Text(TEXT_BONUS_TIME + ":0", "22px " + FONT_GAME, "#d7d5d2");
        _oBonusTimeText.x = _pStartPosBonusTime.x;
        _oBonusTimeText.y = _pStartPosBonusTime.y;
        _oBonusTimeText.textAlign = "left";
        s_oStage.addChild(_oBonusTimeText);

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {
            x: CANVAS_WIDTH - (oSprite.width / 2) - 110, // GK: moving to make room for exit
            y: (oSprite.height / 2) + 8
        };
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _pStartPosAudio = {
                x: _pStartPosExit.x - oSprite.width,
                y: (oSprite.height / 2) + 8
            }
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);

            _pStartPosFullscreen = {
                x: _pStartPosAudio.x - oSprite.width / 2,
                y: _pStartPosAudio.y
            };
        } else {
            _pStartPosFullscreen = {
                x: _oButExit.getX() - oSprite.width,
                y: (oSprite.height / 2) + 8
            }
        }

        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (ENABLE_FULLSCREEN === false) {
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.isEnabled) {
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');


            _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSprite, s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }

        var oSprite = s_oSpriteLibrary.getSprite('but_shuffle');
        _pStartPosShuffle = {
            x: CANVAS_WIDTH - oSprite.width / 2 - 10,
            y: CANVAS_HEIGHT - oSprite.height / 2
        };
        _oButShuffle = new CGfxButton(_pStartPosShuffle.x, _pStartPosShuffle.y, oSprite, s_oStage);
        _oButShuffle.addEventListener(ON_MOUSE_UP, this._onShuffle, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_restart');
        _pStartPosRestart = {
            x: CANVAS_WIDTH - oSprite.width / 2 - 10,
            y: _pStartPosShuffle.y - oSprite.height
        };
        _oButRestart = new CGfxButton(_pStartPosRestart.x, _pStartPosRestart.y, oSprite, s_oStage);
        _oButRestart.addEventListener(ON_MOUSE_UP, this._onRestart, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_hint');
        _pStartPosHint = {
            x: CANVAS_WIDTH - oSprite.width / 2 - 10,
            y: _pStartPosRestart.y - oSprite.height
        };
        _oButHint = new CButHint(_pStartPosHint.x, _pStartPosHint.y, oSprite, "0", FONT_GAME, "#d7d5d2", 28, s_oStage);
        _oButHint.addEventListener(ON_MOUSE_UP, this._onHint, this);

        _oAreYouSurePanel = new CAreYouSurePanel(s_oStage);
        _oAreYouSurePanel.addEventListener(ON_RELEASE_NO, this._onReleaseNoMsgBox, this);
        _oAreYouSurePanel.addEventListener(ON_RELEASE_YES, this._onReleaseYesMsgBox, this);

        _oWinPanel = new CWinPanel();
        _oGameOverPanel = new CGameOverPanel();
    };

    this.unload = function () {
        _oButExit.unload();
        _oButExit = null;

        if (DISABLE_SOUND_MOBILE === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }

        if (_fRequestFullScreen && screenfull.isEnabled) {
            _oButFullscreen.unload();
        }

        _oWinPanel.unload();
        _oGameOverPanel.unload();
        _oAreYouSurePanel.unload();

        s_oInterface = null;
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oScoreText.x = _pStartPosScore.x + iNewX;
        _oScoreText.y = _pStartPosScore.y + iNewY;
        _oBonusTimeText.x = _pStartPosBonusTime.x + iNewX;
        _oBonusTimeText.y = _pStartPosBonusTime.y + iNewY;

        _oButHint.setPosition(_pStartPosHint.x - iNewX, _pStartPosHint.y - iNewY);
        _oButRestart.setPosition(_pStartPosRestart.x - iNewX, _pStartPosRestart.y - iNewY);
        _oButShuffle.setPosition(_pStartPosShuffle.x - iNewX, _pStartPosShuffle.y - iNewY);
        _oButExit.setPosition(_pStartPosExit.x - iNewX, _pStartPosExit.y + iNewY);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.isEnabled) {
            _oButFullscreen.setPosition(_pStartPosFullscreen.x - iNewX, _pStartPosFullscreen.y + iNewY);
        }
    };

    this.reset = function () {
        _oScoreText.text = TEXT_SCORE + " 0";
    };

    this.refreshTime = function (szTime) {
        _oBonusTimeText.text = TEXT_BONUS_TIME + " " + Math.round(szTime/1000); // GK
    };

    this.setScore = function (iScore) {
        _oScoreText.text = TEXT_SCORE + " " + iScore;
        scoregame = iScore;
        //console.log(iScore);
    };

    this.setHintNum = function (iNum) {
        _oButHint.setText(iNum);
    };

    this.showBonusScore = function (iX, iY, iBonus) {
        new CScoreText(iX, iY, iBonus);
    };

    this.gameOver = function (iScore) {
        _oGameOverPanel.show(iScore);
    };

    this.win = function (iScore, iBestScore) {
        _oWinPanel.show(iScore, iBestScore);
    };

    this.refreshScore = function (iScore) {
        _oScoreText.text = TEXT_SCORE + " " + iScore;
        scoregame = iScore;
    };

    this._onReleaseYesMsgBox = function (iTypeAlert) {
        switch (iTypeAlert) {
            case ALERT_FROM_EXIT: {
                GameEnd = 1;
                logEvent({event: "LEVEL_QUIT"});
                s_oGame.onExit();
                break;
            }
            case ALERT_FROM_RESTART: {
                _oAreYouSurePanel.hide();
                s_oGame.onRestartBoard();
                logEvent({event: "LEVEL_RESTART"});
                break;
            }
            case ALERT_FROM_SHUFFLE: {
                _oAreYouSurePanel.hide();
                s_oGame.onShuffleBoard();
                logEvent({event: "SHUFFLE"});
                break;
            }
        }
    };

    this._onReleaseNoMsgBox = function () {
        s_oGame.startUpdate();
    };

    this._onShuffle = function () {
        s_oGame.stopUpdate();
        _oAreYouSurePanel.show(TEXT_ALERT_SHUFFLE, ALERT_FROM_SHUFFLE);
    };

    this._onRestart = function () {
        s_oGame.stopUpdate();
        _oAreYouSurePanel.show(TEXT_ALERT_RESTART, ALERT_FROM_RESTART);
    };

    this._onHint = function () {
        s_oGame.onHintReleased();
    };

    this._onExit = function () {
        s_oGame.stopUpdate();
        _oAreYouSurePanel.show(TEXT_ALERT_EXIT, ALERT_FROM_EXIT);
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this.resetFullscreenBut = function () {
        if (_fRequestFullScreen && screenfull.isEnabled) {
            _oButFullscreen.setActive(s_bFullscreen);
        }
    };

    this._onFullscreenRelease = function () {
        if (s_bFullscreen) {
            _fCancelFullScreen.call(window.document);
        } else {
            _fRequestFullScreen.call(window.document.documentElement);
        }

        sizeHandler();
    };

    s_oInterface = this;

    this._init(iScore);

    return this;
}

var s_oInterface = null;