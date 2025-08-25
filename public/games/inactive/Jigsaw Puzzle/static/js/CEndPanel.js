function CEndPanel(oSpriteBg, iScore) {
    var _iScore;

    var _oBg;
    var _oGroup;
    var _oMsgText;
    var _oScore;
    var _oButHome;
    var _oButRestart;
    var _oListener;

    this._init = function (oSpriteBg, iScore) {
        _iScore = iScore;

        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible = false;

        _oBg = createBitmap(oSpriteBg);
        _oGroup.addChild(_oBg);

        _oMsgText = new CTLText(_oGroup,
            CANVAS_WIDTH / 2 - 300, (CANVAS_HEIGHT / 2) - 250, 600, 160,
            80, "center", "#fff", PRIMARY_FONT, 1,
            0, 0,
            TEXT_COMPLETED,
            true, true, true,
            false);



        _oScore = new CTLText(_oGroup,
            CANVAS_WIDTH / 2 - 200, (CANVAS_HEIGHT / 2) - 20, 400, 120,
            60, "center", "#fff", PRIMARY_FONT, 1,
            0, 0,
            " ",
            true, true, true,
            false);



        _oButHome = new CGfxButton(CANVAS_WIDTH / 2 - 216, CANVAS_HEIGHT / 2 + 180, s_oSpriteLibrary.getSprite("but_home"), _oGroup);
        _oButHome.addEventListener(ON_MOUSE_UP, this._onButHome, this);

        _oButRestart = new CGfxButton(CANVAS_WIDTH / 2 + 216, CANVAS_HEIGHT / 2 + 180, s_oSpriteLibrary.getSprite("but_restart"), _oGroup);
        _oButRestart.addEventListener(ON_MOUSE_UP, this._onButRestart, this);


        s_oStage.addChild(_oGroup);
    };

    this._initListener = function () {
        _oListener = _oGroup.on("mousedown", function () {});
    };

    this.show = function () {
        _oScore.refreshText(TEXT_SCORE + " " + _iScore);

        _oGroup.visible = true;

        var oParent = this;
        createjs.Tween.get(_oGroup).to({
            alpha: 1
        }, 500).call(function () {
            oParent._initListener();
        });


        $(s_oMain).trigger("save_score", _iScore);
        $(s_oMain).trigger("share_event", _iScore);
        $(s_oMain).trigger("show_interlevel_ad");

        GameEnd = 1;
        Skillprint.endGame({
            score: _iScore,
            time: timeelapsed
        });
    };

    this._onButHome = function () {
        _oGroup.on("mousedown", _oListener);
        s_oStage.removeChild(_oGroup);

        $(s_oMain).trigger("end_session");
        s_oGame.onExit();
    };

    this._onButRestart = function () {
        _oGroup.on("mousedown", _oListener);
        s_oStage.removeChild(_oGroup);

        s_oGame.restart();
    };

    this._init(oSpriteBg, iScore);

    return this;
}