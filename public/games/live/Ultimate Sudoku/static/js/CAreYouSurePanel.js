function CAreYouSurePanel(oConfirmFunction, oNegateFunction) {

    var _oButYes;
    var _oButNo;
    var _oPanelContainer;
    var _oParent;
    var _oListener;

    this._init = function (oConfirmFunction, oNegateFunction) {


        _oPanelContainer = new createjs.Container();
        _oListener = _oPanelContainer.on("mousedown", function () {});
        s_oStage.addChild(_oPanelContainer);

        var oSprite = s_oSpriteLibrary.getSprite('credit_bg');
        var oPanel = createBitmap(oSprite);
        oPanel.regX = oSprite.width / 2;
        oPanel.regY = oSprite.height / 2;

        _oPanelContainer.addChild(oPanel);

        _oPanelContainer.x = CANVAS_WIDTH / 2;
        _oPanelContainer.y = CANVAS_HEIGHT / 2;


        var oTitle = new CTLText(_oPanelContainer,
            -400, -180, 800, 240,
            120, "left", PRIMARY_FONT_COLOUR, SECONDARY_FONT, 1,
            0, 0,
            TEXT_ARE_SURE,
            true, true, true,
            false);



        _oButYes = new CGfxButton(150, 150, s_oSpriteLibrary.getSprite('but_yes'), _oPanelContainer);
        _oButYes.addEventListener(ON_MOUSE_UP, this._onButYes, this);

        _oButNo = new CGfxButton(-150, 150, s_oSpriteLibrary.getSprite('but_exit'), _oPanelContainer);
        _oButNo.addEventListener(ON_MOUSE_UP, this._onButNo, this);
        _oButNo.pulseAnimation();
    };

    this._onButYes = function () {
        Skillprint.LevelQuit({
            scores: 0
        });

        _oParent.unload();
        if (oConfirmFunction) {
            oConfirmFunction();
        }

    };

    this._onButNo = function () {
        _oParent.unload();
        if (oNegateFunction) {
            oNegateFunction();
        }
    };

    this.unload = function () {
        _oButNo.unload();
        _oButYes.unload();

        _oPanelContainer.off("mousedown", _oListener);

        s_oStage.removeChild(_oPanelContainer);
    };

    _oParent = this;
    this._init(oConfirmFunction, oNegateFunction);
}