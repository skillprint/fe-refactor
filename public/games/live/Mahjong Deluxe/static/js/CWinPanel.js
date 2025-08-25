function CWinPanel() {
    var _oScoreText;
    var _oBestScoreText;
    var _oButHome;
    var _oButShuffle;
    var _oListenerDown;
    var _oContainer;

    this.init = function () {
        _oContainer = new createjs.Container()
        _oListenerDown = _oContainer.on("click", function () {});
        _oContainer.visible = false;
        s_oStage.addChild(_oContainer);

        var oSpriteBg = s_oSpriteLibrary.getSprite("msg_box");
        var oBg = createBitmap(oSpriteBg);
        _oContainer.addChild(oBg);


        var iWidth = 430;
        var iHeight = 60;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = CANVAS_HEIGHT / 2 - 80;
        var oCongratsTextOutline = new CTLText(_oContainer,
            iTextX - iWidth / 2, iTextY - iHeight / 2, iWidth, iHeight,
            50, "center", "#000", FONT_GAME, 1,
            2, 2,
            TEXT_CONGRATS,
            true, true, true,
            false);
        oCongratsTextOutline.setOutline(2);

        var oCongratsText = new CTLText(_oContainer,
            iTextX - iWidth / 2, iTextY - iHeight / 2, iWidth, iHeight,
            50, "center", "#d7d5d2", FONT_GAME, 1,
            2, 2,
            TEXT_CONGRATS,
            true, true, true,
            false);


        var iWidth = 430;
        var iHeight = 50;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = CANVAS_HEIGHT / 2;
        _oScoreText = new CTLText(_oContainer,
            iTextX - iWidth / 2, iTextY - iHeight / 2, iWidth, iHeight,
            40, "center", "#fff", FONT_GAME, 1,
            2, 2,
            TEXT_FINAL_SCORE,
            true, true, true,
            false);

        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = CANVAS_HEIGHT / 2 + 40;
        _oBestScoreText = new CTLText(_oContainer,
            iTextX - iWidth / 2, iTextY - iHeight / 2, iWidth, iHeight,
            40, "center", "#fff", FONT_GAME, 1,
            2, 2,
            TEXT_BEST_SCORE,
            true, true, true,
            false);

        _oButHome = new CTextButton(CANVAS_WIDTH / 2 - 140, CANVAS_HEIGHT / 2 + 100, s_oSpriteLibrary.getSprite("but_generic_small"), TEXT_EXIT, FONT_GAME, "#d7d5d2", 20, _oContainer);
        _oButHome.addEventListener(ON_MOUSE_UP, this._onExit, this);

        _oButShuffle = new CTextButton(CANVAS_WIDTH / 2 + 140, CANVAS_HEIGHT / 2 + 100, s_oSpriteLibrary.getSprite("but_generic_small"), TEXT_SHUFFLE, FONT_GAME, "#d7d5d2", 20, _oContainer);
        _oButShuffle.addEventListener(ON_MOUSE_UP, this._onShuffle, this);
    };

    this.unload = function () {
        _oButHome.unload();
        _oButShuffle.unload();
        _oContainer.off("click", _oListenerDown);
    };

    this.show = function (iScore, iBestScore) {
        _oScoreText.refreshText(TEXT_FINAL_SCORE + ": " + iScore);
        _oBestScoreText.refreshText(TEXT_BEST_SCORE + ": " + iBestScore);
        _oContainer.alpha = 0;
        _oContainer.visible = true;

        createjs.Tween.get(_oContainer).to({
            alpha: 1
        }, 500, createjs.Ease.cubicOut).call(function () {
            $(s_oMain).trigger("show_interlevel_ad");
        });

        $(s_oMain).trigger("save_score", iScore);
        $(s_oMain).trigger("share_event", iScore);
    };

    this._onShuffle = function () {
        createjs.Tween.get(_oContainer).to({
            alpha: 0
        }, 500, createjs.Ease.cubicOut).call(function () {
            _oContainer.visible = false;
            s_oGame.onShuffleBoard();
        });
    };

    this._onExit = function () {
        createjs.Tween.get(_oContainer).to({
            alpha: 0
        }, 500, createjs.Ease.cubicOut).call(function () {
            _oContainer.visible = false;
            s_oMain.gotoMenu();
        });
    };

    this.init();
}