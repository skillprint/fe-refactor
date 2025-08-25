function CCreditsPanel() {
    var _oListener;
    var _oFade;
    var _oPanelContainer;
    var _oButExit;
    var _oLogo;

    var _pStartPanelPos;

    this._init = function () {

        _oPanelContainer = new createjs.Container();
        s_oStage.addChild(_oPanelContainer);

        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        var oPanel = createBitmap(oSprite);
        oPanel.regX = oSprite.width / 2;
        oPanel.regY = oSprite.height / 2;
        oPanel.on("click", function () {});
        _oPanelContainer.addChild(oPanel);

        _oPanelContainer.x = CANVAS_WIDTH / 2;
        _oPanelContainer.y = CANVAS_HEIGHT / 2;
        _pStartPanelPos = {
            x: _oPanelContainer.x,
            y: _oPanelContainer.y
        };

        var oTitle = new CTLText(_oPanelContainer,
            -250, -140, 500, 80,
            80, "center", "#fff", PRIMARY_FONT, 1,
            0, 0,
            TEXT_DEVELOPED,
            true, true, false,
            false);


        var oLink = new CTLText(_oPanelContainer,
            -250, 60, 500, 80,
            80, "center", "#fff", PRIMARY_FONT, 1,
            0, 0,
            "",
            true, true, false,
            false);


        var oSprite = s_oSpriteLibrary.getSprite('ctl_logo');
        _oLogo = createBitmap(oSprite);
        _oListener = _oLogo.on("mousedown", this._onLogoButRelease);
        _oLogo.regX = oSprite.width / 2;
        _oLogo.regY = oSprite.height / 2;
        _oPanelContainer.addChild(_oLogo);

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _oButExit = new CGfxButton(318, -298, oSprite, _oPanelContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this.unload, this);

    };

    this.unload = function () {

        s_oStage.removeChild(_oFade);
        s_oStage.removeChild(_oPanelContainer);

        _oButExit.unload();

        _oLogo.off("click", _oListener);


    };

    this._onLogoButRelease = function () {
        //window.open("http://www.codethislab.com/index.php?&l=en");
    };


    this._init();


};