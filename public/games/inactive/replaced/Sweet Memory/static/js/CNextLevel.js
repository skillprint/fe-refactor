function CNextLevel() {
        var _oMsgText;
        var _oMatchTextScore;
        var _oMsgTimeScore;
        var _oMsgTotalScore;
        var _oMsgLevelScore;
        var _oContinueButton;
        var _oGroup;

        this._init = function () {
                _oGroup = new createjs.Container();
                _oGroup.alpha = 0;
                _oGroup.visible = false;
                s_oStage.addChild(_oGroup);

                var oBg = createBitmap(s_oSpriteLibrary.getSprite("msg_box"));
                _oGroup.addChild(oBg);

                _oMsgText = new CTLText(_oGroup,
                        CANVAS_WIDTH / 2 - 300, (CANVAS_HEIGHT / 2) - 150, 600, 48,
                        48, "center", "#fff", FONT_GAME, 1,
                        0, 0,
                        TEXT_LEVELCOMPLETED,
                        true, true, false,
                        false);

                _oMsgText.setShadow("#000000", 3, 3, 2);

                _oMatchTextScore = new CTLText(_oGroup,
                        CANVAS_WIDTH / 2 - 300, (CANVAS_HEIGHT / 2) - 70, 600, 30,
                        30, "center", "Pink", FONT_GAME, 1,
                        0, 0,
                        TEXT_MATCH_SCORE,
                        true, true, false,
                        false);

                _oMatchTextScore.setShadow("#000000", 2, 2, 2);

                _oMsgTimeScore = new CTLText(_oGroup,
                        CANVAS_WIDTH / 2 - 300, (CANVAS_HEIGHT / 2) - 34, 600, 30,
                        30, "center", "Pink", FONT_GAME, 1,
                        0, 0,
                        TEXT_TIMEBONUS,
                        true, true, false,
                        false);


                _oMsgTimeScore.setShadow("#000000", 2, 2, 2);

                _oMsgLevelScore = new CTLText(_oGroup,
                        CANVAS_WIDTH / 2 - 300, (CANVAS_HEIGHT / 2), 600, 34,
                        34, "center", "Pink", FONT_GAME, 1,
                        0, 0,
                        TEXT_LEVEL_SCORE,
                        true, true, false,
                        false);


                _oMsgLevelScore.setShadow("#000000", 2, 2, 2);

                _oMsgTotalScore = new CTLText(_oGroup,
                        CANVAS_WIDTH / 2 - 300, (CANVAS_HEIGHT / 2) + 70, 600, 48,
                        48, "center", "Pink", FONT_GAME, 1,
                        0, 0,
                        TEXT_TOTALSCORE,
                        true, true, false,
                        false);

                _oMsgTotalScore.setShadow("#000000", 2, 2, 2);



                _oContinueButton = new CTextButton(CANVAS_WIDTH / 2, 700,
                        s_oSpriteLibrary.getSprite('but_menu_bg'),
                        "CONTINUE",
                        FONT_GAME,
                        "White",
                        "24",
                        _oGroup);
                _oContinueButton.addEventListener(ON_MOUSE_UP, this.hide, this);
        };


        this.display = function (iMatchScore, iTimeBonus, iLevelScore, iTotalScore, iLevel) {
                _oMatchTextScore.refreshText(TEXT_MATCH_SCORE + " = " + iMatchScore);
                _oMsgTimeScore.refreshText(TEXT_TIMEBONUS + " = " + iTimeBonus);
                _oMsgLevelScore.refreshText(TEXT_LEVEL_SCORE + " = " + iLevelScore);
                _oMsgTotalScore.refreshText(TEXT_TOTALSCORE + " " + iTotalScore);

                _oGroup.visible = true;
                createjs.Tween.get(_oGroup).to({
                        alpha: 1
                }, 250);

                gamescore = iTotalScore;
                gametime = iTimeBonus;
                GameLevel = iLevel;
                //console.log(GameLevel);
                Skillprint.levelComplete();
        };

        this.hide = function () {
                _oGroup.alpha = 0;
                _oGroup.visible = false;
                s_oGame.nextLevel();
        };

        this.unload = function () {
                _oContinueButton.unload();
                s_oStage.removeChild(_oGroup);
        };

        this._init();
}