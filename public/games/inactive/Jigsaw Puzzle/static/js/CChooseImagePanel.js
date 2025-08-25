function CChooseImagePanel() {
    var _iHeightToggle;
    var _iCurPage;
    var _aPointsX;
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _aContainerPage;
    var _aLevelButs;

    var _oArrowRight;
    var _oArrowLeft;
    var _oButExit;
    var _oContainer;
    var _oAudioToggle;
    var _oButFullscreen;

    this._init = function () {
        _iCurPage = 0;

        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);

        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        _oContainer.addChild(oBg);

        var oText = new CTLText(_oContainer,
            CANVAS_WIDTH / 2 - 500, 200, 1000, 160,
            80, "center", "#fff", PRIMARY_FONT, 1,
            0, 0,
            TEXT_CHOOSE_IMAGE,
            true, true, true,
            false);


        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {
            x: CANVAS_WIDTH - (oSprite.width / 2) - 10,
            y: (oSprite.height / 2) + 10
        };
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, _oContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        _iHeightToggle = oSprite.height;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _pStartPosAudio = {
                x: _oButExit.getX() - oSprite.width,
                y: (oSprite.height / 2) + 10
            }
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, s_oSpriteLibrary.getSprite('audio_icon'), s_bAudioActive, _oContainer);
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

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSprite, s_bFullscreen, _oContainer);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }

        this._checkBoundLimits();

        //FIND X COORDINATES FOR LEVEL BUTS
        _aPointsX = new Array();
        var iWidth = CANVAS_WIDTH - (EDGEBOARD_X * 2) - 160;
        var iOffsetX = Math.floor(iWidth / NUM_COLS_PAGE_LEVEL) / 2;
        var iXPos = 0;
        for (var i = 0; i < NUM_COLS_PAGE_LEVEL; i++) {
            _aPointsX.push(iXPos);
            iXPos += iOffsetX * 2;
        }

        _aContainerPage = new Array();

        this._createNewLevelPage(0, NUM_IMAGES);

        if (_aContainerPage.length > 1) {
            //MULTIPLE PAGES
            for (var k = 1; k < _aContainerPage.length; k++) {
                _aContainerPage[k].visible = false;
            }

            _oArrowRight = new CGfxButton(CANVAS_WIDTH / 2 + 670, CANVAS_HEIGHT / 2 + 30, s_oSpriteLibrary.getSprite('arrow_right'), _oContainer);
            _oArrowRight.addEventListener(ON_MOUSE_UP, this._onRight, this);

            _oArrowLeft = new CGfxButton(CANVAS_WIDTH / 2 - 670, CANVAS_HEIGHT / 2 + 30, s_oSpriteLibrary.getSprite('arrow_left'), _oContainer);
            _oArrowLeft.addEventListener(ON_MOUSE_UP, this._onLeft, this);
        }

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.unload = function () {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
        }

        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.unload();
        }

        _oButExit.unload();

        s_oStage.removeAllChildren();

        s_oChooseImagePanel = null;
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oButExit.setPosition(_pStartPosExit.x - iNewX, _pStartPosExit.y + iNewY);
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX, _pStartPosFullscreen.y + iNewY);
        }
    };

    this.resetFullscreenBut = function () {
        if (_fRequestFullScreen && screenfull.enabled) {
            _oButFullscreen.setActive(s_bFullscreen);
        }
    };

    this._checkBoundLimits = function () {
        var oSprite = s_oSpriteLibrary.getSprite('but_level');
        var iY = 0;

        var iHeightBound = CANVAS_HEIGHT - (EDGEBOARD_Y * 2) - (_iHeightToggle * 2);
        var iNumRows = 0;

        while (iY < iHeightBound) {
            iY += oSprite.height + 20;
            iNumRows++;
        }

        if (NUM_ROWS_PAGE_LEVEL > iNumRows) {
            NUM_ROWS_PAGE_LEVEL = iNumRows;
        }

        var iNumCols = 0;
        var iX = 0;
        var iWidthBounds = CANVAS_WIDTH - (EDGEBOARD_X * 2);
        var oSprite = s_oSpriteLibrary.getSprite('but_level');

        while (iX < iWidthBounds) {
            iX += (oSprite.width / 2) + 5;
            iNumCols++;
        }
        if (NUM_COLS_PAGE_LEVEL > iNumCols) {
            NUM_COLS_PAGE_LEVEL = iNumCols;
        }
    };

    this._createNewLevelPage = function (iStartLevel, iEndLevel) {
        var oContainerLevelBut = new createjs.Container();
        _oContainer.addChild(oContainerLevelBut);
        _aContainerPage.push(oContainerLevelBut);

        _aLevelButs = new Array();
        var iCont = 0;
        var iY = 0;
        var iNumRow = 1;
        var bNewPage = false;

        for (var i = iStartLevel; i < iEndLevel; i++) {
            var oSprite = s_oSpriteLibrary.getSprite('image_' + (i + 1));
            var oBut = new CButLevel(_aPointsX[iCont], iY, oSprite, 'image_' + (i + 1), oContainerLevelBut);
            oBut.addEventListenerWithParams(ON_MOUSE_UP, this._onButLevelRelease, this, 'image_' + (i + 1));
            _aLevelButs.push(oBut);

            iCont++;
            if (iCont === _aPointsX.length && i < iEndLevel - 1) {
                iCont = 0;
                iY += oSprite.height + 20;
                iNumRow++;
                if (iNumRow > NUM_ROWS_PAGE_LEVEL) {
                    bNewPage = true;
                    break;
                }
            }
        }

        oContainerLevelBut.x = CANVAS_WIDTH / 2;
        oContainerLevelBut.y = CANVAS_HEIGHT / 2 + 30;
        oContainerLevelBut.regX = oContainerLevelBut.getBounds().width / 2;
        oContainerLevelBut.regY = oContainerLevelBut.getBounds().height / 2;

        if (bNewPage) {
            //ADD A PAGE
            this._createNewLevelPage(i + 1, iEndLevel);
        }

    };

    this._onButLevelRelease = function (szImageName) {
        s_oChooseImagePanel.unload();
        s_szImageSelected = szImageName;
        image_name = (s_szImageSelected == "image_1" ? "LION" : s_szImageSelected == "image_2" ? "WOLF" : s_szImageSelected == "image_3" ? "EAGLE" : s_szImageSelected == "image_4" ? "ELEPHANT" : s_szImageSelected == "image_5" ? "PARROT" : "PENGUIN");
        //console.log(image_name);

        s_oMain.gotoChooseDifficulty();
    };

    this._onRight = function () {
        _aContainerPage[_iCurPage].visible = false;

        _iCurPage++;
        if (_iCurPage >= _aContainerPage.length) {
            _iCurPage = 0;
        }

        _aContainerPage[_iCurPage].visible = true;
    };

    this._onLeft = function () {
        _aContainerPage[_iCurPage].visible = false;

        _iCurPage--;
        if (_iCurPage < 0) {
            _iCurPage = _aContainerPage.length - 1;
        }

        _aContainerPage[_iCurPage].visible = true;
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onFullscreenRelease = function () {
        if (s_bFullscreen) {
            _fCancelFullScreen.call(window.document);
        } else {
            _fRequestFullScreen.call(window.document.documentElement);
        }

        sizeHandler();
    };

    this._onExit = function () {
        s_oChooseImagePanel.unload();
        s_oMain.gotoMenu();
    };

    s_oChooseImagePanel = this;
    this._init();
}

var s_oChooseImagePanel = null;