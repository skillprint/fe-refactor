function CAreYouSurePanel(oParentContainer){
    var _iTypeAlert;
    var _aCbCompleted;
    var _aCbOwner;
    
    var _oTextBack;
    var _oText;
    var _oButYes;
    var _oButNo;
    var _oListenerDown;
    var _oContainer;
    var _oParentContainer;
    
    this._init = function(){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oContainer = new createjs.Container();
        _oListenerDown = _oContainer.on("click",function(){});
        _oContainer.visible = false;
        _oParentContainer.addChild(_oContainer);
        
        var oBg = createBitmap(s_oSpriteLibrary.getSprite('msg_box'));
        _oContainer.addChild(oBg);
       
        var iWidth = 430;
        var iHeight = 130;
        var iTextX = CANVAS_WIDTH / 2;
        var iTextY = 220;
        _oTextBack = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    50, "center", "#000", FONT_GAME, 1,
                    2, 2,
                    " ",
                    true, true, true,
                    false );
        _oTextBack.setOutline(2); 
        
        _oText = new CTLText(_oContainer, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    50, "center", "#d7d5d2", FONT_GAME, 1,
                    2, 2,
                    " ",
                    true, true, true,
                    false );
        
        _oButYes = new CGfxButton(CANVAS_WIDTH/2 + 170,344,s_oSpriteLibrary.getSprite("but_yes"),_oContainer);
        _oButYes.addEventListener(ON_MOUSE_UP,this._onReleaseYes,this);
        
        _oButNo = new CGfxButton(CANVAS_WIDTH/2 - 170,344,s_oSpriteLibrary.getSprite("but_no"),_oContainer);
        _oButNo.addEventListener(ON_MOUSE_UP,this._onReleaseNo,this);
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.unload = function(){
        _oContainer.off("click",_oListenerDown);
        _oButNo.unload();
        _oButYes.unload();
    };
    
    this.show = function(szText,iType){
        _oTextBack.refreshText( szText );
        _oText.refreshText( szText );
        _iTypeAlert = iType;
        _oContainer.visible = true;
        _oContainer.alpha = 0;
        createjs.Tween.get(_oContainer).to({alpha: 1}, 500,createjs.Ease.cubicOut);
    };
    
    this.hide = function(){
        _oContainer.visible = false;
    };
    
    this._onReleaseYes = function(){
        if(_aCbCompleted[ON_RELEASE_YES]){
            _aCbCompleted[ON_RELEASE_YES].call(_aCbOwner[ON_RELEASE_YES],_iTypeAlert);
        }
    };
    
    this._onReleaseNo = function(){
        if(_aCbCompleted[ON_RELEASE_NO]){
            _aCbCompleted[ON_RELEASE_NO].call(_aCbOwner[ON_RELEASE_NO],_iTypeAlert);
        }
        _oContainer.visible = false;
    };
    
    _oParentContainer = oParentContainer;
    this._init(oParentContainer);
}