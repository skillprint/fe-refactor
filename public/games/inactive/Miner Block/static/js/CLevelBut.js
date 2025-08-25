function CLevelBut(iXPos,iYPos,oSprite,bActive, Level){
    var _bActive;
    var _aCbCompleted;
    var _aCbOwner;
    var _aButton = new Array();
    var _aParams = [];
    var _aStars;
    var _oButton;
    var _oButtonBG;
    var _oListenerMouseDown;
    var _oListenerMouseUp;
    var _oLevelText;
    var _oTween;
    
    this._init = function(iXPos,iYPos,oSprite,bActive){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        if(bActive){
            var iWidth = oSprite.width/2-5;
            var szTextColor = "#ffc600";
        }else{
            var iWidth = oSprite.width/2;
            var szTextColor = "#aaa";
        }
        
        _oButton = new createjs.Container();
        _oButton.x = iXPos;
        _oButton.y = iYPos; 
        _oButton.mouseEnabled = bActive;
        s_oStage.addChild(_oButton);
        if (!s_bMobile){
            _oButton.cursor = "pointer";
	}
        
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: iWidth, height: oSprite.height, regX: (oSprite.width/2)/2, regY: oSprite.height/2}, 
                        animations: {state_true:[0],state_false:[1]}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
         
        _bActive = bActive;
        _oButtonBG = createSprite(oSpriteSheet, "state_"+_bActive,(oSprite.width/2)/2,oSprite.height/2,oSprite.width/2,oSprite.height);
        _oButtonBG.stop();
        _oButton.addChild(_oButtonBG);

        _aButton.push(_oButtonBG);
        
        var oLevelTextStroke = new createjs.Text(Level,"30px "+FONT, "#000000");
        oLevelTextStroke.x = -5;
        oLevelTextStroke.y = 5;
        oLevelTextStroke.textAlign = "center";
        oLevelTextStroke.textBaseline = "alphabetic";
        oLevelTextStroke.lineWidth = 200;
        oLevelTextStroke.outline = 8;
        _oButton.addChild(oLevelTextStroke);
        
        _oLevelText = new createjs.Text(Level,"30px "+FONT, szTextColor);
        _oLevelText.x = -5;
        _oLevelText.y = 5;
        _oLevelText.textAlign = "center";
        _oLevelText.textBaseline = "alphabetic";
        _oLevelText.lineWidth = 200;
        _oButton.addChild(_oLevelText);

        var oStarsContainer = new createjs.Container();
        oStarsContainer.y = -30;
        _oButton.addChild(oStarsContainer);

        _aStars = new Array();
        var oSprite = s_oSpriteLibrary.getSprite('star_empty');
        for(var i=0; i<3; i++){
            _aStars[i] = createBitmap(oSprite);
            _aStars[i].regX = oSprite.width/2;
            _aStars[i].regY = oSprite.height/2;
            _aStars[i].scaleX = _aStars[i].scaleY =  0.40;
            _aStars[i].x = -26 + i*26;
            _aStars[i].y = -(i%2 === 0 ? 0:10);
            _aStars[i].rotation = -20 +i*20;
            oStarsContainer.addChild(_aStars[i]);
        }
        
        this._initListener();
    };
    
    this.unload = function(){
         createjs.Tween.removeTweens(_oButton);
       _oButton.off("mousedown", _oListenerMouseDown);
       _oButton.off("pressup" , _oListenerMouseUp);
	   
       s_oStage.removeChild(_oButton);
    };
    
    this._initListener = function(){
       _oListenerMouseDown = _oButton.on("mousedown", this.buttonDown);
       _oListenerMouseUp = _oButton.on("pressup" , this.buttonRelease);      
    };
    
    this.viewBut = function(oButton){
        s_oStage.addChild(oButton);
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
    
    this.ifClickable = function(){
        if(_oButton.mouseEnabled === true){
            return 1;
        }
        return 0;
    };
    
    this.setActive = function(iLevel, bActive){
        _bActive = bActive;
        _aButton[iLevel].gotoAndStop("state_"+_bActive);
        _aButton[iLevel].mouseEnabled = true;
        
        if(_bActive){
            _oLevelText.color = "#ffc600";
        } else {
            _oLevelText.color = "#ccc";
        }
    };
    
    this.buttonRelease = function(){
        if(_oTween){
            _oButton.scaleX = 1;
            _oButton.scaleY = 1;
        }
        
        playSound("click",1,false);
        
        _bActive = !_bActive;
        _oButtonBG.gotoAndStop("state_"+_bActive);

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP],_aParams);
        }
    };
    
    this.buttonDown = function(){
        if(_oTween){
            _oButton.scaleX = 0.9;
            _oButton.scaleY = 0.9;
        }

       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN],_aParams);
       }
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
    };
    
    this.setStars = function(iNumStars){
        var oSprite = s_oSpriteLibrary.getSprite('star_filled');
        for(var i=0; i<3; i++){
            _aStars[i].visible = true;
            if(i<iNumStars){
                _aStars[i].image = oSprite;
            }
        }
    };
    
    this.pulseAnimation = function () {
        _oTween = createjs.Tween.get(_oButton).to({scaleX: 0.9, scaleY: 0.9}, 850, createjs.Ease.quadOut).to({scaleX: 1, scaleY: 1}, 650, createjs.Ease.quadIn);
    };
    
    this._init(iXPos,iYPos,oSprite,bActive);
}