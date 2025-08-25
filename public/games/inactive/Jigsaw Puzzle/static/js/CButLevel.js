function CButLevel(iXPos,iYPos,oSprite,szLabel,oParentContainer){
    var _bDisable;
    var _iWidth;
    var _iHeight;
    var _szLabel;
    var _aCbCompleted;
    var _aCbOwner;
    var _aParams;
    var _oButton;
    var _oButtonBg;
    var _oParentContainer;
    
    this._init =function(iXPos,iYPos,oSprite,szLabel){
        _bDisable = false;
        _szLabel = szLabel;
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        var oSpriteBg = s_oSpriteLibrary.getSprite("but_level");
        
        _oButton = new createjs.Container();
        _oButton.x = iXPos + oSpriteBg.width/2;
        _oButton.y = iYPos + oSpriteBg.height/2;
        _oButton.regX = oSpriteBg.width/2;
        _oButton.regY = oSpriteBg.height/2;
        _oButton.cursor = "pointer";
        _oParentContainer.addChild(_oButton);
        
        
        var oBg = createBitmap(oSpriteBg);
        _oButton.addChild(oBg);
        
        _oButtonBg = createBitmap( oSprite);
        _oButtonBg.scaleX = _oButtonBg.scaleY = 0.4;
        _oButtonBg.x = 80;
        _oButtonBg.y = 80;
        _oButton.addChild(_oButtonBg);
        
        _iWidth = oSpriteBg.width;
        _iHeight = oSpriteBg.height;

        
        this._initListener();
    };
    
    this.unload = function(){
       _oButton.off("mousedown");
       _oButton.off("pressup");
       
       _oParentContainer.removeChild(_oButton);
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
    };
    
    this.enable = function(){
        _bDisable = false;
        _oButton.filters = [];

        _oButton.cache(0,0,_iWidth,_iHeight);
    };
    
    this.disable = function(){
        _bDisable = true;
        var matrix = new createjs.ColorMatrix().adjustSaturation(-100);
        _oButton.filters = [
                 new createjs.ColorMatrixFilter(matrix)
        ];
        _oButton.cache(0,0,_iWidth,_iHeight);	
    };
    
    this._initListener = function(){
       _oButton.on("mousedown", this.buttonDown);
       _oButton.on("pressup" , this.buttonRelease);      
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.addEventListenerWithParams = function(iEvent,cbCompleted, cbOwner,aParams){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
        _aParams = aParams;
    };
    
    this.buttonRelease = function(){
        if(_bDisable){
            return;
        }
        
        playSound("click",1,false);
        
        _oButton.scaleX = 1;
        _oButton.scaleY = 1;

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP],_aParams);
        }
    };
    
    this.buttonDown = function(){
        if(_bDisable){
            return;
        }
        _oButton.scaleX = 0.9;
        _oButton.scaleY = 0.9;

       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN],_aParams);
       }
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this.setX = function(iXPos){
         _oButton.x = iXPos;
    };
    
    this.setY = function(iYPos){
         _oButton.y = iYPos;
    };
    
    this.getButtonImage = function(){
        return _oButton;
    };

    this.getX = function(){
        return _oButton.x;
    };
    
    this.getY = function(){
        return _oButton.y;
    };
    
    _oParentContainer = oParentContainer;
    this._init(iXPos,iYPos,oSprite,oParentContainer);
    
    return this;
    
}