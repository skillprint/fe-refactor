function CBlocks(iX, iY, szType, i){
    
    var _szType = szType;
    var _iIndex = i;
    var _oContainerForm;
    var _oListenerDown;
    var _oListenerUp;
    var _oListenerMove;
    
    var _oPosToStay = {x: 0, y: 0};
    
    this._init = function(iX, iY, szType, i){
        _oContainerForm = new createjs.Container();
        if(szType === "vertical_2" || szType === "vertical_3"){
            _oPosToStay = {x: START_X_GRID+(CELL_WIDTH*iX)-12, y: START_Y_GRID+(CELL_HEIGHT*iY)-5};
        }else{
            _oPosToStay = {x: START_X_GRID+(CELL_WIDTH*iX)-5, y: START_Y_GRID+(CELL_HEIGHT*iY)-5};
        }
        if(szType === "player"){
            var oData = {   
                images: [s_oSpriteLibrary.getSprite('player')], 
                framerate: 9,
                // width, height & registration point of each sprite
                frames: {width: 159, height: 90, regX: 0, regY: 0}, 
                animations: {idle:[0, 11, "idle"]}
            };
            var oSpriteSheet = new createjs.SpriteSheet(oData);
         
            var _oSourceImage = createSprite(oSpriteSheet, "idle", 0, 0, 159, 90);

            _oContainerForm.x = _oPosToStay.x;
            _oContainerForm.y = _oPosToStay.y; 

            s_oStage.addChild(_oSourceImage);
        }else{
            var _oSourceImage = createBitmap(s_oSpriteLibrary.getSprite(szType));
            _oContainerForm.x = _oPosToStay.x;
            _oContainerForm.y = _oPosToStay.y;
        }
        
        _oContainerForm.addChild(_oSourceImage);
        
        s_oStage.addChild(_oContainerForm);
        
        _oListenerDown = _oContainerForm.on("mousedown", this._onFormContainerClick, this);
        _oListenerUp = _oContainerForm.on("pressup", this._releaseForm, this );
        _oListenerMove = _oContainerForm.on("pressmove", this._dragForm, this );
    };
    
    this._onFormContainerClick = function(event){
        s_oGame.onFormContainerClick(event, _oContainerForm, _iIndex);
    };
    
    this._dragForm = function(event){
        s_oGame.dragForm(event, _szType, _iIndex);  
    };
    
    this._releaseForm = function(event){
        s_oGame.releaseForm(event, _oPosToStay, _szType, _iIndex); 
    }; 
    
    this.placeInGrid = function(iX, iY){
        createjs.Tween.get( _oContainerForm, {override: true} ).to({x: iX, y: iY }, (500), createjs.Ease.cubicOut).call(function() {});
        _oPosToStay = {x: iX, y: iY};
    };
    
    this.goBack = function(iX, iY){
        createjs.Tween.get( _oContainerForm ).to({x: iX, y: iY }, (200), createjs.Ease.cubicOut).call(function() {});
    };
    
    this.moveOut = function(){
        createjs.Tween.get( _oContainerForm, {override: true} ).to({x: CANVAS_WIDTH }, (500), createjs.Ease.cubicIn).call(function() {
            s_oGame.gameOver();
        });
    };
    
    this.setPos = function(iX, iY){
        _oContainerForm.x = iX;
        _oContainerForm.y = iY;
    };
    
    this.getPosX = function(){
        return _oContainerForm.x;
    };
    
    this.getPosY = function(){
        return _oContainerForm.y;
    };
    
    this.getOldX = function(){
        return _oPosToStay.x;
    };
    
    this.getOldY = function(){
        return _oPosToStay.y;
    };
    
    this.getType = function(){
        return _szType;
    };
    
    this.deleteForm = function(){
        _oContainerForm.off("mousedown", _oListenerDown);
        _oContainerForm.off("pressmove", _oListenerUp);
        _oContainerForm.off("pressup", _oListenerMove);
        s_oStage.removeChild(_oContainerForm);
    };
    
    this._init(iX, iY, szType, i);
    
}