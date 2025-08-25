function CLevelMenu() {
    var _iCurPage;
    var _iHeightToggle;
    var _aLevelButs;
    var _aPointsX;
    var _aContainerPage;
    var _pStartPosSelect;
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;

    var _oButExit;
    var _oAudioToggle;
    var _oArrowRight = null;
    var _oArrowLeft = null;
    var _oTextLevel;
    var _oTextLevelOutline;
    var _oContainer;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    this._init = function () {
        _iCurPage = 0;

        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);

        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu_level'));
        _oContainer.addChild(oBg);

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
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, s_oSpriteLibrary.getSprite('audio_icon'), s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
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
            _pStartPosFullscreen = {
                x: oSprite.width / 4 + 9,
                y: (oSprite.height / 2) + 10
            };

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSprite, s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }

        this._checkBoundLimits();

        //FIND X COORDINATES FOR LEVEL BUTS
        _aPointsX = new Array();
        var iWidth = CANVAS_WIDTH - (EDGEBOARD_X * 2) - 100;
        var iOffsetX = Math.floor(iWidth / NUM_COLS_PAGE_LEVEL) / 2;
        var iXPos = 0;
        for (var i = 0; i < NUM_COLS_PAGE_LEVEL; i++) {
            _aPointsX.push(iXPos);
            iXPos += iOffsetX * 2;
        }

        _aContainerPage = new Array();

        this._createNewLevelPage(0, NUM_LEVELS);

        _pStartPosSelect = {
            x: CANVAS_WIDTH / 2,
            y: _aContainerPage[0].y - _aContainerPage[0].getBounds().height / 2 - 60
        };
        var iWidth = 500;
        var iHeight = 50;
        var iTextX = _pStartPosSelect.x;
        var iTextY = _pStartPosSelect.y;
        _oTextLevelOutline = new CTLText(_oContainer,
            iTextX - iWidth / 2, iTextY - iHeight / 2, iWidth, iHeight,
            40, "center", "#000", FONT_GAME, 1,
            2, 2,
            TEXT_SELECT_LEVEL.toUpperCase(),
            true, true, true,
            false);
        _oTextLevelOutline.setOutline(2);

        _oTextLevel = new CTLText(_oContainer,
            iTextX - iWidth / 2, iTextY - iHeight / 2, iWidth, iHeight,
            40, "center", "#d7d5d2", FONT_GAME, 1,
            2, 2,
            TEXT_SELECT_LEVEL.toUpperCase(),
            true, true, true,
            false);


        if (_aContainerPage.length > 1) {
            //MULTIPLE PAGES
            for (var k = 1; k < _aContainerPage.length; k++) {
                _aContainerPage[k].visible = false;
            }

            _oArrowRight = new CGfxButton(CANVAS_WIDTH / 2 + 320, CANVAS_HEIGHT / 2 + 30, s_oSpriteLibrary.getSprite('arrow_right'), _oContainer);
            _oArrowRight.addEventListener(ON_MOUSE_UP, this._onRight, this);

            _oArrowLeft = new CGfxButton(CANVAS_WIDTH / 2 - 320, CANVAS_HEIGHT / 2 + 30, s_oSpriteLibrary.getSprite('arrow_left'), _oContainer);
            _oArrowLeft.addEventListener(ON_MOUSE_UP, this._onLeft, this);
        }

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.unload = function () {
        for (var i = 0; i < _aLevelButs.length; i++) {
            _aLevelButs[i].unload();
        }

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
        }

        if (_fRequestFullScreen && screenfull.isEnabled) {
            _oButFullscreen.unload();
        }

        _oButExit.unload();

        if (_oArrowLeft !== null) {
            _oArrowLeft.unload();
            _oArrowRight.unload();
        }

        for (var i = 0; i < _aLevelButs.length; i++) {
            _aLevelButs[i].unload();
        }

        s_oStage.removeChild(_oContainer);

        s_oLevelMenu = null;
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oTextLevelOutline.setY(_pStartPosSelect.y + iNewY);
        _oTextLevel.setY(_pStartPosSelect.y + iNewY);
        _oButExit.setPosition(_pStartPosExit.x - iNewX, _pStartPosExit.y + iNewY);
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.isEnabled) {
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX, _pStartPosFullscreen.y + iNewY);
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
            var oLayoutInfo = s_oLevelSettings.getLayoutInfos(i)
            var oSprite = s_oSpriteLibrary.getSprite('but_level_' + i);
            var oBut = new CButLevel(_aPointsX[iCont] + oSprite.width / 2, iY + oSprite.height / 2, oSprite, oLayoutInfo.name, oLayoutInfo.difficulty, FONT_GAME, "#d7d5d2", 20, oContainerLevelBut);
            oBut.addEventListenerWithParams(ON_MOUSE_UP, this._onButLevelRelease, this, [i, oLayoutInfo.name]);
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

    this._onButLevelRelease = function (aParams) {
        s_oLevelMenu.unload();

        switch (aParams[0]) {
            case 0:
                GameDifficulty = "MEDIUM";
                break;
            case 1:
                GameDifficulty = "EASY";
                break;
            case 2:
                GameDifficulty = "HARD";
                break;
            case 3:
                GameDifficulty = "EASY";
                break;
            case 4:
                GameDifficulty = "MEDIUM";
                break;
            case 5:
                GameDifficulty = "HARD";
        }
        LEVEL_SELECTED = aParams[0];
        LEVEL_NAME = aParams[1];
        LEVEL_NAME = LEVEL_NAME.toUpperCase();

        s_oMain.levelSelected(aParams[0], aParams[1]);

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

    this._onExit = function () {
        s_oLevelMenu.unload();

        s_oMain.gotoMenu();
    };

    s_oLevelMenu = this;
    this._init();
}

var s_oLevelMenu = null;