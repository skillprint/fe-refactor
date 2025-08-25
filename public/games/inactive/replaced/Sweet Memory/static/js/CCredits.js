function CCredits() {
    var _oPanel;
    var _oPanelContainer;
    var _oButExit;
    var _oLogo;
    var _oListener;

    var _pStartPanelPos;

    this._init = function () {

        _oPanelContainer = new createjs.Container();
        _oPanelContainer.alpha = 0;
        s_oStage.addChild(_oPanelContainer);

        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        _oPanel = createBitmap(oSprite);
        _oPanel.regX = oSprite.width / 2;
        _oPanel.regY = oSprite.height / 2;
        _oListener = _oPanel.on("click", this._onLogoButRelease);
        _oPanelContainer.addChild(_oPanel);

        _oPanelContainer.x = CANVAS_WIDTH / 2;
        _oPanelContainer.y = CANVAS_HEIGHT / 2;
        _pStartPanelPos = {
            x: _oPanelContainer.x,
            y: _oPanelContainer.y
        };

        var oTitleBack = new createjs.Text("DEVELOPED BY", "30px " + FONT_GAME, "#000");
        oTitleBack.x = 2;
        oTitleBack.y = -78;
        oTitleBack.textAlign = "center";
        oTitleBack.textBaseline = "middle";
        oTitleBack.lineWidth = 300;
        _oPanelContainer.addChild(oTitleBack);

        var oTitle = new createjs.Text("DEVELOPED BY", "30px " + FONT_GAME, "#ffffff");
        oTitle.y = -80;
        oTitle.textAlign = "center";
        oTitle.textBaseline = "middle";
        oTitle.lineWidth = 300;
        _oPanelContainer.addChild(oTitle);

        var oLinkBack = new createjs.Text("", "30px " + FONT_GAME, "#000");
        oLinkBack.x = 2;
        oLinkBack.y = 82;
        oLinkBack.textAlign = "center";
        oLinkBack.textBaseline = "middle";
        oLinkBack.lineWidth = 300;
        _oPanelContainer.addChild(oLinkBack);

        var oLink = new createjs.Text("", "30px " + FONT_GAME, "#ffffff");
        oLink.y = 80;
        oLink.textAlign = "center";
        oLink.textBaseline = "middle";
        oLink.lineWidth = 300;
        _oPanelContainer.addChild(oLink);

        var oSprite = s_oSpriteLibrary.getSprite('logo_ctl');
        _oLogo = createBitmap(oSprite);
        _oLogo.regX = oSprite.width / 2;
        _oLogo.regY = oSprite.height / 2;
        _oPanelContainer.addChild(_oLogo);

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _oButExit = new CGfxButton(290, -150, oSprite, _oPanelContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this.unload, this);

        new createjs.Tween.get(_oPanelContainer).to({
            alpha: 1
        }, 500);
    };

    this.unload = function () {

        _oButExit.disable();


        s_oStage.removeChild(_oPanelContainer);

        _oButExit.unload();


        _oPanel.off("click", _oListener);
    };

    this._onLogoButRelease = function () {
        //window.open("http://www.codethislab.com/index.php?&l=en");
    };


    this._init();


};