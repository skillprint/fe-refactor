function CAlertSavingBox(szText,oParentContainer){
    var _oMsg;
    var _oButOk;
    var _oThis;
    var _oContainer;
    var _oParentContainer;

    this._init = function (szText) {
        _oContainer = new createjs.Container();
        _oParentContainer.addChild(_oContainer);

        var oFade;

        oFade = new createjs.Shape();
        oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        oFade.alpha = 0.5;

        oFade.on("click", function () {});

        _oContainer.addChild(oFade);

        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');
        var oBg = createBitmap(oSpriteBg);

        oBg.x = CANVAS_WIDTH * 0.5;
        oBg.y = CANVAS_HEIGHT * 0.5;
        oBg.regX = oSpriteBg.width * 0.5;
        oBg.regY = oSpriteBg.height * 0.5;
        _oContainer.addChild(oBg);
       
        var iWidth = 350;
        var iHeight = 220;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = 270;
        var oMsgBack = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    28, "center", "#000000", FONT_GAME, 1,
                    2, 2,
                    szText,
                    true, true, true,
                    false );
        oMsgBack.setOutline(2); 
        
        _oMsg = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    28, "center", "#d7d5d2", FONT_GAME, 1,
                    2, 2,
                    szText,
                    true, true, true,
                    false );
       
        _oButOk = new CGfxButton(CANVAS_WIDTH / 2 + 206, 174, s_oSpriteLibrary.getSprite('but_exit_small'), _oContainer);
        _oButOk.addEventListener(ON_MOUSE_UP, this._onButOk, this);
    };

    this._onButOk = function () {
        _oThis.unload();
    };

    this.unload = function () {
        _oButOk.unload();
        _oParentContainer.removeChild(_oContainer);
    };
    
    _oThis = this;
    _oParentContainer = oParentContainer;

    this._init(szText);
}