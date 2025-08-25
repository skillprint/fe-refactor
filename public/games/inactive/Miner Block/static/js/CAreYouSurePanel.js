function CAreYouSurePanel(oSpriteBg, oContainer) {
    var _aCbCompleted;
    var _aCbOwner;

    var _oBg;

    var _oGroup;
    var _oPanelContainer;
    var _oButNo;
    var _oButYes;
    var _oParent;

    this._init = function (oSpriteBg, oContainer) {
        _aCbCompleted = new Array();
        _aCbOwner = new Array();

        _oGroup = new createjs.Container();
        _oGroup.alpha = 0;
        _oGroup.visible = false;
        _oGroup.on("mousedown",function(){});

        _oPanelContainer = new createjs.Container();   
        _oPanelContainer.x = CANVAS_WIDTH/2;
        _oPanelContainer.y = CANVAS_HEIGHT/2;
        _oGroup.addChild(_oPanelContainer);

        _oBg = createBitmap(oSpriteBg);
        _oBg.regX = oSpriteBg.width/2;
        _oBg.regY = oSpriteBg.height/2;
        _oPanelContainer.addChild(_oBg);

        var iWidth = 750;
        var iHeight = 100;
        var iTextX = 0;
        var iTextY = -80;
        var oExplTextStroke = new CTLText(_oPanelContainer, 
                    iTextX-iWidth/2, iTextY-iHeight/2, iWidth, iHeight, 
                    40, "center", "#000000", FONT, 1,
                    2, 2,
                    TEXT_ARE_SURE,
                    true, true, false,
                    false );
        oExplTextStroke.setOutline(8);
                    
  
        var iWidth = 750;
        var iHeight = 100;
        var iTextX = 0;
        var iTextY = -80;
        var oExplText = new CTLText(_oPanelContainer, 
                    iTextX-iWidth/2, iTextY-iHeight/2, iWidth, iHeight, 
                    40, "center", "#ffc600", FONT, 1,
                    2, 2,
                    TEXT_ARE_SURE,
                    true, true, true,
                    false );
                    
        
        var oSpriteButHome = s_oSpriteLibrary.getSprite("but_exit");
        _oButNo = new CGfxButton(-140, 120, oSpriteButHome, _oPanelContainer);
        _oButNo.addEventListener(ON_MOUSE_DOWN, _oParent._onRefuse, this);
        _oButNo.pulseAnimation();

        var oSpriteButHome = s_oSpriteLibrary.getSprite("but_confirm");
        _oButYes = new CGfxButton(140, 120, oSpriteButHome, _oPanelContainer);
        _oButYes.addEventListener(ON_MOUSE_DOWN, _oParent._onYes, this);

        oContainer.addChild(_oGroup);
    };

    this.unload = function () {
        _oGroup.removeAllEventListeners();
        oContainer.removeChild(_oGroup);
        _oButNo.unload();
        _oButNo = null;
        _oButYes.unload();
        _oButYes = null;
    };

    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };

    this.hide = function(){
        _oGroup.visible = false;
        
        createjs.Tween.get(_oGroup).to({alpha: 0}, 500);
    };

    this.show = function () {
        _oGroup.visible = true;

        createjs.Tween.get(_oGroup).to({alpha: 1}, 500);
    };

    this._onRefuse = function () {
        _oParent.hide();
        
        var iEventToLaunch = ON_REFUSE;
        if(_aCbCompleted[iEventToLaunch]){
            _aCbCompleted[iEventToLaunch].call(_aCbOwner[iEventToLaunch]);
        }
    };

    this._onYes = function () {
        _oParent.hide();
        
        var iEventToLaunch = ON_CONFIRM;
        if(_aCbCompleted[iEventToLaunch]){
            _aCbCompleted[iEventToLaunch].call(_aCbOwner[iEventToLaunch]);
        }
    };

    _oParent = this;
    this._init(oSpriteBg, oContainer);

    return this;
}