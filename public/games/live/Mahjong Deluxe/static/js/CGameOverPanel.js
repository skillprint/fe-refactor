function CGameOverPanel() {

    var _oScoreText;
    var _oButHome;
    var _oButShuffle;
    var _oButRestart;
    var _oListenerDown;
    var _oContainer;
    var scoregame;

    this.init = function () {
        _oContainer = new createjs.Container()
        _oListenerDown = _oContainer.on("click", function () {});
        _oContainer.visible = false;
        s_oStage.addChild(_oContainer);

        var oSpriteBg = s_oSpriteLibrary.getSprite("msg_box");
        var oBg = createBitmap(oSpriteBg);
        _oContainer.addChild(oBg);


        var iWidth = 430;
        var iHeight = 50;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = CANVAS_HEIGHT / 2 - 100;
        var oTextOutline = new CTLText(_oContainer,
            iTextX - iWidth / 2, iTextY - iHeight / 2, iWidth, iHeight,
            40, "center", "#000", FONT_GAME, 1,
            2, 2,
            TEXT_NO_TILES,
            true, true, true,
            false);
        oTextOutline.setOutline(2);

        var oText = new CTLText(_oContainer,
            iTextX - iWidth / 2, iTextY - iHeight / 2, iWidth, iHeight,
            40, "center", "#d7d5d2", FONT_GAME, 1,
            2, 2,
            TEXT_NO_TILES,
            true, true, true,
            false);

        var iWidth = 430;
        var iHeight = 30;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = CANVAS_HEIGHT / 2 - 60;
        _oScoreText = new CTLText(_oContainer,
            iTextX - iWidth / 2, iTextY - iHeight / 2, iWidth, iHeight,
            30, "center", "#d7d5d2", FONT_GAME, 1,
            2, 2,
            TEXT_NO_TILES,
            true, true, true,
            false);


        var oSpriteBut = s_oSpriteLibrary.getSprite("but_generic_small");
        _oButShuffle = new CTextButton(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100, oSpriteBut, TEXT_SHUFFLE, FONT_GAME, "#d7d5d2", 20, _oContainer);
        _oButShuffle.addEventListener(ON_MOUSE_UP, this._onShuffle, this);

        _oButRestart = new CTextButton(CANVAS_WIDTH / 2, _oButShuffle.getY() - oSpriteBut.height, oSpriteBut, TEXT_RESTART, FONT_GAME, "#d7d5d2", 20, _oContainer);
        _oButRestart.addEventListener(ON_MOUSE_UP, this._onRestart, this);

        _oButHome = new CTextButton(CANVAS_WIDTH / 2, _oButRestart.getY() - oSpriteBut.height, oSpriteBut, TEXT_EXIT, FONT_GAME, "#d7d5d2", 20, _oContainer);
        _oButHome.addEventListener(ON_MOUSE_UP, this._onExit, this);
    };

    this.unload = function () {
        _oButHome.unload();
        _oButShuffle.unload();
        _oButRestart.unload();
        _oContainer.off("click", _oListenerDown);
    };

    this.show = function (iScore) {
        scoregame = iScore;
        _oScoreText.refreshText(TEXT_FINAL_SCORE + ": " + iScore);
        _oContainer.alpha = 0;
        _oContainer.visible = true;
        createjs.Tween.get(_oContainer).to({
            alpha: 1
        }, 500, createjs.Ease.cubicOut).call(function () {
            $(s_oMain).trigger("show_interlevel_ad");
        });

        $(s_oMain).trigger("save_score", iScore);
        $(s_oMain).trigger("share_event", iScore);

        /*

        var obj = {};
        obj['score'] = iScore;
        var datascore = JSON.stringify(obj);

        xhr.open("POST", url_post_score, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = function () {
            console.log(this.responseText);
        }
        xhr.send(datascore);*/
    };

    this._onShuffle = function () {

        s_oGame.onShuffleBoard();
        createjs.Tween.get(_oContainer).to({
            alpha: 0
        }, 500, createjs.Ease.cubicOut).call(function () {
            _oContainer.visible = false;
        });
    };

    this._onExit = function () {
        _oContainer.visible = false;
        s_oMain.gotoMenu();
    };

    this._onRestart = function () {

        s_oGame.onRestartBoard();
        createjs.Tween.get(_oContainer).to({
            alpha: 0
        }, 500, createjs.Ease.cubicOut).call(function () {
            _oContainer.visible = false;
        });
    };

    this.init();
}