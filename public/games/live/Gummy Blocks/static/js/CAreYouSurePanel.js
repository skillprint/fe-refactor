function CAreYouSurePanel(oParentContainer) {
    var _aCbCompleted;
    var _aCbOwner;
    var _oListener;
    
    var _oBg;
    var _oMsg;
    var _oButYes;
    var _oButNo;
    var _oContainer;
    var _oParentContainer;
    var _oFade;
    var _oPanelContainer;
    
    var _oThis = this;

    this._init = function () {
        _aCbCompleted = new Array();
        _aCbOwner = new Array();
        
        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        _oParentContainer.addChild(_oContainer);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;
        _oListener = _oFade.on("click", function () {});
        _oContainer.addChild(_oFade);
        
        _oPanelContainer = new createjs.Container();   
        _oPanelContainer.x = CANVAS_WIDTH/2;
        _oPanelContainer.y = CANVAS_HEIGHT/2;
        _oContainer.addChild(_oPanelContainer);
        
        
        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');
        _oBg = createBitmap(oSpriteBg);
        _oPanelContainer.addChild(_oBg);
        
        
        
        _oMsg = new CTLText(_oPanelContainer, 
                    oSpriteBg.width/2-260, 190, 520, 200, 
                    80, "center", "#fff", FONT, 1,
                    0, 0,
                    " ",
                    true, true, true,
                    false );

               

        _oButYes = new CGfxButton(200, 550, s_oSpriteLibrary.getSprite('but_yes'), _oPanelContainer);
        _oButYes.addEventListener(ON_MOUSE_UP, this._onButYes, this);

        _oButNo = new CGfxButton(oSpriteBg.width-200, 550, s_oSpriteLibrary.getSprite('but_no'), _oPanelContainer);
        _oButNo.addEventListener(ON_MOUSE_UP, this._onButNo, this);
        
        
        _oPanelContainer.regX = oSpriteBg.width/2;
        _oPanelContainer.regY = oSpriteBg.height/2;
    };
    
    this.addEventListener = function (iEvent, cbCompleted, cbOwner) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
    };
    
    this.show = function (szText) {
        _oMsg.refreshText(szText);
   
        _oPanelContainer.scaleX = _oPanelContainer.scaleY = 0.1;
        _oContainer.visible = true;
        createjs.Tween.get(_oPanelContainer).to({scaleX: 1,scaleY:1}, 1000, createjs.Ease.elasticOut);
    };
    
    this.hide = function(){
        _oContainer.visible = false;
    };

    this.unload = function () {
        _oButNo.unload();
        _oButYes.unload();
        _oFade.off("click",_oListener);
    };

    this._onButYes = function () {
        _oThis.hide();
        logEvent({event: "LEVEL_QUIT", score: getScoreSaved()}); // triggers on both restart and quit
        if (_aCbCompleted[ON_BUT_YES_DOWN]) {
            _aCbCompleted[ON_BUT_YES_DOWN].call(_aCbOwner[ON_BUT_YES_DOWN]);
        }
    };

    this._onButNo = function () {
        
        _oThis.hide();
    };

    _oParentContainer = oParentContainer;

    this._init();
}