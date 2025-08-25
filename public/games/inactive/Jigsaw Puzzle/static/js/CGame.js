function CGame(iDifficulty, oData) {
    var _bPause;
    var _iNumPieces;
    var _iRows;
    var _iCols;
    var _iScore;
    var _iTimeElaps;
    var _iAdCounter;
    var _szImage;
    var _aPieces;
    var _aShufflePoints;
    var _aJointList;
    var _aActiveJoints;

    var _oContainerPieces;
    var _oInterface;
    var _oEndPanel = null;
    var _oPreviewImage;
    var _oParent;

    this._init = function (iDifficulty) {
        _bPause = true;
        _iNumPieces = DIFFICULTY[iDifficulty];
        _iAdCounter = 0;
        _iScore = 0;
        gamescore = 0;
        timeelapsed = 0;
        _iTimeElaps = 0;
        _szImage = s_szImageSelected;

        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(oBg);

        var oFrame = createBitmap(s_oSpriteLibrary.getSprite("frame"));
        oFrame.x = BOARD_X - 5;
        oFrame.y = BOARD_Y - 5;
        s_oStage.addChild(oFrame);

        _oPreviewImage = createBitmap(s_oSpriteLibrary.getSprite(_szImage));
        _oPreviewImage.x = BOARD_X;
        _oPreviewImage.y = BOARD_Y;
        _oPreviewImage.alpha = 0.5;
        _oPreviewImage.visible = false;
        s_oStage.addChild(_oPreviewImage);

        this._createShufflePoints();
        this._attachImage(iDifficulty);
        this._initJoints();

        _oInterface = new CInterface();

        setTimeout(function () {
            s_oGame.shuffleBoard();
        }, 2000);

        if (GameEnd == 1) {
            Skillprint.newSession();
        } else {
            Skillprint.startGame({
                image: image_name,
                pieces: pieces
            });
        }
    };

    this.unload = function () {
        _oInterface.unload();

        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren();

        s_oGame = null;
    };

    this.restart = function () {
        _iTimeElaps = 0;
        _iScore = 0;
        _bPause = false;

        for (var i = 0; i < _iRows; i++) {
            for (var j = 0; j < _iCols; j++) {
                _aPieces[i][j].reset(_oInterface.isRotationActive());
            }
        }

        this._initJoints();
        _oPreviewImage.alpha = 0.5;
        _oPreviewImage.visible = _oInterface.isPreviewVisible();
        Skillprint.restartGame();

        setTimeout(function () {
            GameEnd = 1;
            Skillprint.newSession();
        }, 500);
    };

    this._createShufflePoints = function () {
        //CREATE LOGIC BOUND RECTANGLES
        var oLeftRect = new createjs.Rectangle(BOARD_X - 300, BOARD_Y + 100, 100, BOARD_Y + 500);
        var oRightRect = new createjs.Rectangle(BOARD_X + IMAGE_WIDTH + 200, BOARD_Y + 100, 100, BOARD_Y + 500);

        _aShufflePoints = new Array();
        for (var i = 0; i < _iNumPieces / 2; i++) {
            var iRandX = Math.floor(Math.random() * ((oLeftRect.x + oLeftRect.width) - oLeftRect.x + 1)) + oLeftRect.x;
            var iRandY = Math.floor(Math.random() * ((oLeftRect.y + oLeftRect.height) - oLeftRect.y + 1)) + oLeftRect.y;
            var oPoint = {
                x: iRandX,
                y: iRandY
            };
            _aShufflePoints.push(oPoint);

            var iRandX = Math.floor(Math.random() * ((oRightRect.x + oLeftRect.width) - oRightRect.x + 1)) + oRightRect.x;
            var iRandY = Math.floor(Math.random() * ((oRightRect.y + oLeftRect.height) - oRightRect.y + 1)) + oRightRect.y;
            var oPoint = {
                x: iRandX,
                y: iRandY
            };
            _aShufflePoints.push(oPoint);
        }

        shuffle(_aShufflePoints);
    };

    this._attachImage = function (iDifficulty) {
        _oContainerPieces = new createjs.Container();
        s_oStage.addChild(_oContainerPieces);

        var szSuffix = "of" + _iNumPieces;

        var oInfos = s_oGameSettings.getPieces(_iNumPieces);
        var oJoints = s_oGameSettings.getPieceJoints(_iNumPieces);
        var oAnims = {};
        for (var j = 0; j < _iNumPieces; j++) {
            oAnims["frame_" + j] = j;
        }

        var oData = {
            images: [s_oSpriteLibrary.getSprite(_szImage)],
            // width, height & registration point of each sprite
            frames: oInfos,
            animations: oAnims
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _aPieces = new Array();
        var oSize = s_oGameSettings.getPieceSize(_iNumPieces);
        _iRows = oSize.rows;
        _iCols = oSize.cols;
        for (var i = 0; i < _iRows; i++) {
            _aPieces[i] = new Array();
            for (var j = 0; j < _iCols; j++) {
                var iIndex = (i * _iCols) + j;
                var oSprite = s_oSpriteLibrary.getSprite("piece_" + iIndex + szSuffix);
                var oPiece = new CPiece(BOARD_X + oInfos[iIndex][0],
                    BOARD_Y + oInfos[iIndex][1],
                    oSprite.width,
                    oSprite.height,
                    LOGIC_CIRCLE_RADIUS[iDifficulty],
                    oJoints[iIndex],
                    iIndex,
                    oSprite,
                    s_oSpriteLibrary.getSprite("effect_piece_" + iIndex + szSuffix),
                    oSpriteSheet,
                    _oContainerPieces);

                _aPieces[i][j] = oPiece;
            }
        }
    };

    this._initJoints = function () {
        _aActiveJoints = new Array();
        _aJointList = new Array();
        for (var i = 0; i < _iRows; i++) {
            for (var j = 0; j < _iCols; j++) {
                if (j + 1 < _iCols) {
                    //SET PIECE ON THE RIGHT
                    var oJoint1 = _aPieces[i][j].getJoint(JOINT_RIGHT);
                    var oJoint2 = _aPieces[i][j + 1].getJoint(JOINT_LEFT);
                    _aJointList.push({
                        joint1: oJoint1,
                        joint2: oJoint2
                    });
                }

                if (i + 1 < _iRows) {
                    //SET PIECE DOWN
                    var oJoint1 = _aPieces[i][j].getJoint(JOINT_DOWN);
                    var oJoint2 = _aPieces[i + 1][j].getJoint(JOINT_UP);
                    _aJointList.push({
                        joint1: oJoint1,
                        joint2: oJoint2
                    });
                }
            }
        }
    };

    this.shuffleBoard = function () {
        for (var i = 0; i < _iRows; i++) {
            for (var j = 0; j < _iCols; j++) {
                _aPieces[i][j].moveTo(_aShufflePoints[(i * _iCols) + j]);
            }
        }

        _bPause = false;
    };

    this.draggingPiece = function (iX, iY, oPieceDragging, aJointList) {
        var iCurDepth = _oContainerPieces.numChildren - 1;
        oPieceDragging.setDepth(iCurDepth);

        for (var i = 0; i < aJointList.length; i++) {
            if (oPieceDragging !== aJointList[i]) {
                var pDiff = {
                    x: aJointList[i].getStartingX() - oPieceDragging.getStartingX(),
                    y: aJointList[i].getStartingY() - oPieceDragging.getStartingY()
                };
                aJointList[i].draggedByOtherPiece(iX, iY, pDiff);
                iCurDepth--;
                aJointList[i].setDepth(iCurDepth);
            }
        }
    };

    this.releasePiece = function (oPiece, aHitAreas) {
        //CHECK IF THERE ARE ANY JOINT
        if (this._checkCollision(oPiece, aHitAreas) === false) {
            playSound("place", 1, false);
        }

        //CHECK IF PUZZLE IS OVER
        var iNumPieceAttached = 0;
        for (var i = 0; i < _iRows; i++) {
            for (var j = 0; j < _iCols; j++) {
                if (_aPieces[i][j].isAttached()) {
                    iNumPieceAttached++;
                }
            }
        }

        if (iNumPieceAttached === _iNumPieces) {
            this._win();
        }
    };

    this._checkCollision = function (oPiece, aHitAreas) {
        var bFound = false;
        for (var i = 0; i < _iRows; i++) {
            for (var j = 0; j < _iCols; j++) {
                if (oPiece !== _aPieces[i][j] && oPiece.getAbsRotation() === 0 && _aPieces[i][j].getAbsRotation() === 0) {
                    var oRet = _aPieces[i][j].checkCollision(aHitAreas);

                    if (oRet !== null) {
                        var oJoint1 = oRet.joint1;
                        var oJoint2 = oRet.joint2;
                        if (this._findJointInList(oJoint1, oJoint2)) {
                            //SNAP PIECE
                            var iDiffX = _aPieces[i][j].getDiffX();
                            var iDiffY = _aPieces[i][j].getDiffY();
                            var aJointList = oPiece.snap(iDiffX, iDiffY);

                            //SNAP OTHER PIECES EVENTUALLY
                            for (var k = 0; k < aJointList.length; k++) {
                                aJointList[k].snap(iDiffX, iDiffY);
                            }

                            //CREATE PIECE ISLAND EVENTUALLY
                            this._updateActiveJoints(oPiece, _aPieces[i][j]);

                            //REMOVE JOINTS INVOLVED IN COLLISION
                            _aPieces[i][j].removeJoint(oJoint1);
                            oPiece.removeJoint(oJoint2);

                            playSound("snap", 1, false);
                            Skillprint.puzzleMatch();
                            bFound = true;
                        }

                    }
                }

            }
        }

        return bFound;
    };

    this._findJointInList = function (oJoint1, oJoint2) {
        for (var i = 0; i < _aJointList.length; i++) {
            if ((oJoint1 === _aJointList[i].joint1 && oJoint2 === _aJointList[i].joint2) || (oJoint1 === _aJointList[i].joint2 && oJoint2 === _aJointList[i].joint1)) {
                return true;
            }
        }
        return false;
    };

    this._updateActiveJoints = function (oPieceToAttach, oPieceMaster) {
        //CHECK IF THIS PIECE IS ALREADY IN AN ACTIVE LIST
        var aListToEmpty = [oPieceToAttach];
        var bFound = false;
        for (var i = 0; i < _aActiveJoints.length; i++) {
            var aList = _aActiveJoints[i];
            for (var j = 0; j < aList.length; j++) {
                if (aList[j] === oPieceToAttach) {
                    aListToEmpty = aList;
                    bFound = true;
                    break;
                }
            }

            if (bFound) {
                _aActiveJoints.splice(i, 1);
                break;
            }
        }

        //FILL ACTIVE JOINT LIST
        for (var k = 0; k < aListToEmpty.length; k++) {
            var bFound = false;
            for (var i = 0; i < _aActiveJoints.length; i++) {
                var aList = _aActiveJoints[i];
                for (var j = 0; j < aList.length; j++) {
                    if (aList[j] === oPieceMaster) {
                        _aActiveJoints[i].push(aListToEmpty[k]);
                        aListToEmpty[k].updateJointList(_aActiveJoints[i]);
                        bFound = true;
                        break;
                    }
                }
                if (bFound) {
                    break;
                }
            }

            if (!bFound) {
                _aActiveJoints[_aActiveJoints.length] = new Array();
                _aActiveJoints[_aActiveJoints.length - 1].push(aListToEmpty[k]);
                _aActiveJoints[_aActiveJoints.length - 1].push(oPieceMaster);
                aListToEmpty[k].updateJointList(_aActiveJoints[_aActiveJoints.length - 1]);
                oPieceMaster.updateJointList(_aActiveJoints[_aActiveJoints.length - 1]);
            }
        }

        gamescore = Math.floor((999999 - _iTimeElaps) / 100);
        /*Skillprint.puzzleMatch({
            score: gamescore,
            time: timeelapsed
        })*/
        oPieceToAttach.setAttached(true);
        oPieceMaster.setAttached(true);
    };

    this._win = function () {
        _oInterface.playWinEffect();
    };

    this.pause = function (bPause) {
        _bPause = bPause;
    };

    this.placePiecesInCorrectPosition = function () {
        for (var i = 0; i < _iRows; i++) {
            for (var j = 0; j < _iCols; j++) {
                _aPieces[i][j].setStartingPosition();
            }
        }
    };

    this.playFinalEffect = function () {
        _iScore = Math.floor((999999 - _iTimeElaps) / 100);
        gamescore = _iScore;
        if (_iScore < 0) {
            _iScore = 0;
        }

        for (var i = 0; i < _iRows; i++) {
            for (var j = 0; j < _iCols; j++) {
                _aPieces[i][j].fadeOut();
            }
        }

        _oPreviewImage.visible = true;
        _oPreviewImage.alpha = 0;
        createjs.Tween.get(_oPreviewImage).to({
            alpha: 1
        }, TIME_FADE_OUT_PIECES).call(function () {
            _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box'), _iScore);
            _oEndPanel.show();
        });

        _bPause = true;
        playSound("win", 1, false);
    };

    this.showPreview = function (bShow) {
        _oPreviewImage.visible = bShow;
    };

    this.toggleRotation = function (bRotation) {
        for (var i = 0; i < _iRows; i++) {
            for (var j = 0; j < _iCols; j++) {
                _aPieces[i][j].setRotation(bRotation);
            }
        }
    };

    this.onExit = function () {
        this.unload();
        s_oMain.gotoMenu();
    };

    this.update = function () {
        if (!_bPause) {
            _iTimeElaps += s_iTimeElaps;
            timeelapsed = _iTimeElaps;
            _oInterface.refreshTime(formatTime(_iTimeElaps));
        }

    };

    s_oGame = this;

    _oParent = this;
    this._init(iDifficulty);
}

var s_oGame;