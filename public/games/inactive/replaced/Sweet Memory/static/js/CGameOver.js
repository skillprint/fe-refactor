function CGameOver() {
    var _oMsgTextBack;
    var _oMsgTextScore;
    var _oContinueButton;
    var _oGroup;

    this._init = function () {
        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible = false;
        s_oStage.addChild(_oGroup);

        var oBg = createBitmap(s_oSpriteLibrary.getSprite('msg_box'));
        _oGroup.addChild(oBg);

        _oMsgTextBack = new CTLText(_oGroup,
            CANVAS_WIDTH / 2 - 300, (CANVAS_HEIGHT / 2) - 120, 600, 50,
            50, "center", "#fff", FONT_GAME, 1,
            0, 0,
            TEXT_GAMEOVER,
            true, true, false,
            false);

        _oMsgTextBack.setShadow("#000000", 3, 3, 2);


        _oMsgTextScore = new CTLText(_oGroup,
            CANVAS_WIDTH / 2 - 300, (CANVAS_HEIGHT / 2), 600, 48,
            48, "center", "Pink", FONT_GAME, 1,
            0, 0,
            TEXT_TOTALSCORE + " 0",
            true, true, false,
            false);


        _oMsgTextScore.setShadow("#000000", 2, 2, 2);



        _oContinueButton = new CTextButton(CANVAS_WIDTH / 2, 700,
            s_oSpriteLibrary.getSprite('but_menu_bg'),
            TEXT_PLAY_AGAIN,
            FONT_GAME,
            "White",
            "24",
            _oGroup);

        _oContinueButton.addEventListener(ON_MOUSE_UP, this.unload, this);
    }

    this.display = function (iScore) {
        _oMsgTextScore.refreshText(TEXT_TOTALSCORE + " " + iScore);

        _oGroup.visible = true;
        createjs.Tween.get(_oGroup).to({
            alpha: 1
        }, 250).call(function () {
            $(s_oMain).trigger("show_interlevel_ad");
        });
        $(s_oMain).trigger("save_score", iScore);

        Skillprint.LevelFailed({
            score: iScore
        })
    };

    this.unload = function () {
        _oContinueButton.unload();
        s_oStage.removeChild(_oGroup);

        s_oGame.unload(false);
    };

    this._init();
}