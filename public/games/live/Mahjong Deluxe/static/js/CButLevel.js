function CButLevel(iXPos,iYPos,oSprite,szName,szDifficulty,szFont,szColor,iFontSize,oParentContainer){
    var _bDisable;
    var _iWidth;
    var _iHeight;
    var _aCbCompleted;
    var _aCbOwner;
    var _aParams;
    var _oListenerDown;
    var _oListenerUp;
    
    var _oButton;
    var _oButtonBg;
    var _oTextName;
    var _oTextDiff;
    var _oParentContainer;
    
    this._init =function(iXPos,iYPos,oSprite,szName,szDifficulty,szFont,szColor,iFontSize){
        _bDisable = false;
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oButton = new createjs.Container();
        _oButton.x = iXPos;
        _oButton.y = iYPos;
        _oButton.regX = oSprite.width/2;
        _oButton.regY = oSprite.height/2;
        _oButton.cursor = "pointer";
        _oParentContainer.addChild(_oButton);

        _oButtonBg = createBitmap( oSprite);
        _oButton.addChild(_oButtonBg);
        _iWidth = oSprite.width;
        _iHeight = oSprite.height;

        var iWidth = 130;
        var iHeight = 26;
        var iTextX = oSprite.width/2;
        var iTextY = 22;
        _oTextDiff = new CTLText(_oButton, 
                    iTextX -iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    iFontSize, "center", szColor, szFont, 1,
                    2, 2,
                    szDifficulty.toUpperCase(),
                    true, true, true,
                    false );
        _oTextDiff.setShadow("#000000", 2, 2, 4); 
        

        var iTextY = _iHeight - 18;
        _oTextName = new CTLText(_oButton, 
                    iTextX-iWidth/2, iTextY - iHeight/2, iWidth, iHeight, 
                    iFontSize, "center", szColor, szFont, 1,
                    2, 2,
                    szName.toUpperCase(),
                    true, true, true,
                    false );
        _oTextName.setShadow("#000000", 2, 2, 4); 

        

        this._initListener();
    };
    
    this.unload = function(){
       _oButton.off("mousedown",_oListenerDown);
       _oButton.off("pressup",_oListenerUp);
       
       _oParentContainer.removeChild(_oButton);
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
    };
    
    this.enable = function(){
        _bDisable = false;
        _oButtonBg.filters = [];

        _oButtonBg.cache(0,0,_iWidth,_iHeight);
    };
    
    this.disable = function(){
        _bDisable = true;
        var matrix = new createjs.ColorMatrix().adjustSaturation(-100);
        _oButtonBg.filters = [
                 new createjs.ColorMatrixFilter(matrix)
        ];
        _oButtonBg.cache(0,0,_iWidth,_iHeight);	
    };
    
    this._initListener = function(){
       _oListenerDown = _oButton.on("mousedown", this.buttonDown);
       _oListenerUp = _oButton.on("pressup" , this.buttonRelease);      
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
    
    this.changeText = function(szText){
        _oTextName.refreshText( szText );
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
    this._init(iXPos,iYPos,oSprite,szName,szDifficulty,szFont,szColor,iFontSize,oParentContainer);
    
    return this;
    
}