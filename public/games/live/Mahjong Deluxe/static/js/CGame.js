function CGame(iLayout, szName) {
    var _bUpdate = false;
    var _iScore;
    var _iLayout;
    var _iScoreMultByDifficulty;
    var _iContTileDisappearing;
    var _iBonusTimeElaps;
    var _iTilesOnBoard;
    var _iCurHintIndex;
    var _iCurLayoutScale;
    var _szLayoutName;
    var _aTiles = new Array();
    var _aSelectableTiles;
    var _aHintCouples;
    var _pStartPosLayout;
    var _oLevelInfo;
    var _oFirstTileSelected;
    var _oSecondTileSelected;
    var _oFirstHintShowing;
    var _oSecondHintShowing;

    var _oInterface;
    var _oContainerLayout;


    this._init = function (iLayout, szName) {

        _iLayout = iLayout;
        _szLayoutName = szName;

        var oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_game"));
        s_oStage.addChild(oBg);

        this.createLayout();

        _oInterface = new CInterface(0);
        this._setTiles();

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.unload = function () {
        _bUpdate = false;

        _oInterface.unload();
        s_oStage.removeAllChildren();
        s_oGame = null;
    };

    this.reset = function () {
        _iScore = 0;
        _iCurHintIndex = 0;
        _iBonusTimeElaps = BONUS_TIME;
        _iTilesOnBoard = _aTiles.length;
        _iContTileDisappearing = 2;

        _oFirstTileSelected = null;
        _oSecondTileSelected = null;
        _oFirstHintShowing = null;
        _oSecondHintShowing = null;

        this._storeSelectableTiles();
        _oInterface.reset();

        $(s_oMain).trigger("start_level", szName);
        logEvent({event: "LEVEL_START", layout: _szLayoutName})
        _bUpdate = true;
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        _oContainerLayout.x = _pStartPosLayout.x + iNewX;

        _oInterface.refreshButtonPos(iNewX, iNewY);
    };

    this.stopUpdate = function () {
        _bUpdate = false;
    };

    this.startUpdate = function () {
        _bUpdate = true;
    };

    this.createLayout = function () {
        _oLevelInfo = s_oLevelSettings.getLayoutInfos(_iLayout);
        _pStartPosLayout = _oLevelInfo.layout_pos;
        var aTilePos = _oLevelInfo.pos;
        var aBlocks = _oLevelInfo.blocks;
        var aBlockingList = _oLevelInfo.block_list;
        var aHeights = _oLevelInfo.heights;
        _iScoreMultByDifficulty = SCORE_BONUS_LAYOUT[_oLevelInfo.difficulty];

        _oContainerLayout = new createjs.Container();
        _oContainerLayout.x = _pStartPosLayout.x;
        _oContainerLayout.y = _pStartPosLayout.y;
        _oContainerLayout.scaleX = _oContainerLayout.scaleY = _iCurLayoutScale = _oLevelInfo.layout_scale;
        s_oStage.addChild(_oContainerLayout);

        for (var i = 0; i < aTilePos.length; i++) {
            var oTile = new CTile(i, aTilePos[i].x, aTilePos[i].y, aBlocks[i].left_block, aBlocks[i].right_block, aBlocks[i].up_block,
                aBlockingList[i], aHeights[i], _oContainerLayout);
            _aTiles[i] = oTile;
        }
    };

    this._setTiles = function () {
        do {
            var aValues = s_oLevelSettings.getShuffledTiles();
            for (var i = 0; i < _aTiles.length; i++) {
                _aTiles[i].setValue(aValues[i]);
            }
            this.reset();
        } while (_aHintCouples.length === 0);
        _oInterface.setHintNum(_aHintCouples.length);
    };

    this._unloadAllTiles = function () {
        for (var i = 0; i < _aTiles.length; i++) {
            _aTiles[i].unload();
        }
    };

    this._storeSelectableTiles = function () {
        _aSelectableTiles = new Array();

        for (var i = 0; i < _aTiles.length; i++) {
            if (_aTiles[i].isSelectable()) {
                _aSelectableTiles.push(_aTiles[i]);
            }
        }

        _aHintCouples = new Array();
        var iCont = 0;
        while (iCont < _aSelectableTiles.length) {
            var oCurTile = _aSelectableTiles[iCont];

            for (var k = iCont + 1; k < _aSelectableTiles.length; k++) {
                if (oCurTile.getValue() === _aSelectableTiles[k].getValue()) {
                    _aHintCouples.push({
                        first: oCurTile,
                        second: _aSelectableTiles[k]
                    });
                }
            }
            iCont++;
        }


    };

    this.onShuffleBoard = function () {
        if (_oFirstHintShowing) {
            _oFirstHintShowing.deselect();
        }

        if (_oSecondHintShowing) {
            _oSecondHintShowing.deselect();
        }

        var oLevelInfo = s_oLevelSettings.getLayoutInfos(_iLayout);
        var aBlocks = oLevelInfo.blocks;
        var aBlockingList = oLevelInfo.block_list;

        for (var i = 0; i < _aTiles.length; i++) {
            _aTiles[i].initBlocksArray(aBlocks[i].left_block, aBlocks[i].right_block, aBlocks[i].up_block, aBlockingList[i]);
        }

        this._setTiles();
        _oInterface.setHintNum(_aHintCouples.length);
    };

    this.onRestartBoard = function () {
        if (_oFirstHintShowing) {
            _oFirstHintShowing.deselect();
        }

        if (_oSecondHintShowing) {
            _oSecondHintShowing.deselect();
        }
        var oLevelInfo = s_oLevelSettings.getLayoutInfos(_iLayout);
        var aBlocks = oLevelInfo.blocks;
        var aBlockingList = oLevelInfo.block_list;

        for (var i = 0; i < _aTiles.length; i++) {
            _aTiles[i].initBlocksArray(aBlocks[i].left_block, aBlocks[i].right_block, aBlocks[i].up_block, aBlockingList[i]);
        }

        this.reset();
        _oInterface.setHintNum(_aHintCouples.length);
        $(s_oMain).trigger("restart_level", _szLayoutName);
    };

    this.onHintReleased = function () {
        if (_aHintCouples.length === 0) {
            return;
        }
        if (_oFirstHintShowing) {
            _oFirstHintShowing.deselect();
        }

        if (_oSecondHintShowing) {
            _oSecondHintShowing.deselect();
        }

        _oFirstHintShowing = _aHintCouples[_iCurHintIndex].first;
        _oSecondHintShowing = _aHintCouples[_iCurHintIndex].second;

        _oFirstHintShowing.showHint();
        _oSecondHintShowing.showHint();

        logEvent({event: "HINT"}); // , score: _iScore

        _iCurHintIndex++;
        if (_iCurHintIndex === _aHintCouples.length) {
            _iCurHintIndex = 0;
        }

        _iBonusTimeElaps = 0;
        //DECREASE SCORE FOR HINT PENALTY
        _iScore -= HINT_PENALTY;
        if (_iScore < 0) {
            _iScore = 0;
        }
        _oInterface.setScore(_iScore);
    };

    this.removeHint = function () {
        if (_oFirstHintShowing === null || _oSecondHintShowing === null) {
            return;
        }

        this._checkForSimilarBlock(_oFirstHintShowing);
        _oFirstHintShowing.disable();
        this._checkForSimilarBlock(_oSecondHintShowing);
        _oSecondHintShowing.disable();
        playSound("matching", 1, false);

        _oFirstHintShowing = null;
        _oSecondHintShowing = null;

        _iCurHintIndex = 0;
    };

    this.onTileRemoved = function (aUnlockList) {
        _iTilesOnBoard--;
        _iContTileDisappearing--;

        if (_iContTileDisappearing === 0) {
            this._storeSelectableTiles();
            _oInterface.setHintNum(_aHintCouples.length);

            if (_iTilesOnBoard === 0) {
                this._win();
            } else if (_aHintCouples.length === 0) {
                this._gameOver();
            }

            _iContTileDisappearing = 2;
        }
    };

    this.onTileSelected = function (iIndex) {
        if (_oFirstHintShowing !== null) {
            _oFirstHintShowing.deselect();
            _oFirstHintShowing = null;
        }

        if (_oSecondHintShowing !== null) {
            _oSecondHintShowing.deselect();
            _oSecondHintShowing = null;
        }

        if (_oFirstTileSelected === null) {
            _oFirstTileSelected = _aTiles[iIndex];
        } else {
            _oSecondTileSelected = _aTiles[iIndex];
            this._checkTileMatching();
        }
    };

    this.onTileDeselected = function () {
        _oFirstTileSelected = null;
    };

    this._checkTileMatching = function () {
        if (_oFirstTileSelected.getValue() === _oSecondTileSelected.getValue()) {
            //MATCHING FOUND!!
            this._checkForSimilarBlock(_oFirstTileSelected);
            _oFirstTileSelected.remove();
            this._checkForSimilarBlock(_oSecondTileSelected);
            _oSecondTileSelected.remove();

            _iCurHintIndex = 0;
            this._calculateScore();
            playSound("matching", 1, false);
            logEvent({event: "MATCH"});
        } else {
            _oFirstTileSelected.deselect();
            _oSecondTileSelected.deselect();
            logEvent({event: "UNMATCH"});
        }

        _oFirstTileSelected = null;
        _oSecondTileSelected = null;
    };

    this._checkForSimilarBlock = function (oTileRemoved) {
        var aBlockList = oTileRemoved.getBlockList();

        for (var i = 0; i < aBlockList.length; i++) {
            var oTileBlocked = _aTiles[aBlockList[i].tile];
            oTileBlocked.removeBlock(oTileRemoved.getIndex());
        }
    };

    this._calculateScore = function () {
        var iBonus = Math.floor(_iBonusTimeElaps / 100);

        if (iBonus > 0) {
            _oInterface.showBonusScore(_oContainerLayout.x + (_oSecondTileSelected.getX() * _iCurLayoutScale),
                _oContainerLayout.y + (_oSecondTileSelected.getY() * _iCurLayoutScale), iBonus);
        }

        _iScore += (_iScoreMultByDifficulty * iBonus);
        _oInterface.setScore(_iScore);
        _iBonusTimeElaps = BONUS_TIME;
    };

    this._gameOver = function () {
        _bUpdate = false;
        var iBestScore = getItem("md_best_score_" + _iLayout);
        if (iBestScore === null || iBestScore < _iScore) {
            saveItem("md_best_score_" + _iLayout, _iScore);
            iBestScore = _iScore;
        }
        logEvent({event: "LEVEL_FAILED", score: _iScore, layout: _szLayoutName});
        GameEnd = 1;

        _oInterface.gameOver(_iScore);
        playSound("game_over", 1, false);
        $(s_oMain).trigger("end_level", _szLayoutName);
    };

    this._win = function () {
        _bUpdate = false;
        logEvent({event: "LEVEL_WON", score: _iScore, layout: _szLayoutName});
        var iBestScore = getItem("md_best_score_" + _iLayout);
        if (iBestScore === null || iBestScore < _iScore) {
            saveItem("md_best_score_" + _iLayout, _iScore);
            iBestScore = _iScore;
        }

        GameEnd = 1;

        _oInterface.win(_iScore, iBestScore);
        playSound("win", 1, false);

        $(s_oMain).trigger("end_level", _szLayoutName);
    };

    this.onExit = function () {
        this.unload();
        s_oMain.gotoMenu();
        $(s_oMain).trigger("end_session");
    };

    this.update = function () {
        if (_bUpdate === false) {
            return;
        }

        _iBonusTimeElaps -= s_iTimeElaps;

        if (_iBonusTimeElaps < 0) {
            _iBonusTimeElaps = 0;
        }

        _oInterface.refreshTime(_iBonusTimeElaps);

    };

    s_oGame = this;

    this._init(iLayout, szName);
}

var s_oGame = null;