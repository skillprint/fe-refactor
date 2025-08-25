function CTile(iIndex,iX,iY,aLeftBlocks,aRightBlocks,aUpBlocks,aBlockingList,iHeight,oParentContainer){
    var _bActive;
    var _bFree;
    var _bSelected;
    var _bHint;
    var _iIndex;
    var _szLabel;
    var _szValue;
    var _iBoardHeight;
    var _aLeftBlocks;
    var _aRightBlocks;
    var _aUpBlocks;
    var _aBlockingList;
    var _oListenerClick;
    var _oListenerOver;
    var _oListenerOut;
        
    var _oSprite;
    var _oSelection;
    var _oContainer;
    var _oParentContainer;
    var _oThis;
    
    this._init = function(iIndex,iX,iY,aLeftBlocks,aRightBlocks,aUpBlocks,aBlockingList,iHeight){
        _iIndex = iIndex;
        
        _iBoardHeight = iHeight;
        
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);

        var oData = {   
                        images: [s_oSpriteLibrary.getSprite("tiles")], 
                        frames: {width: TILE_WIDTH, height: TILE_HEIGHT,regX:TILE_WIDTH/2,regY:TILE_HEIGHT/2}, 
                        animations: {
                                    bamboo1:[0,0],
                                    bamboo2:[1,1],
                                    bamboo3:[2,2],
                                    bamboo4:[3,3], 
                                    bamboo5:[4,4], 
                                    bamboo6:[5,5], 
                                    bamboo7:[6,6], 
                                    bamboo8:[7,7], 
                                    bamboo9:[8,8],
                                    characters1:[9,9],
                                    characters2:[10,10], 
                                    characters3:[11,11],
                                    characters4:[12,12], 
                                    characters5:[13,13], 
                                    characters6:[14,14], 
                                    characters7:[15,15],
                                    characters8:[16,16], 
                                    characters9:[17,17],
                                    circle1:[18,18], 
                                    circle2:[19,19], 
                                    circle3:[20,20], 
                                    circle4:[21,21], 
                                    circle5:[22,22], 
                                    circle6:[23,23], 
                                    circle7:[24,24],
                                    circle8:[25,25],
                                    circle9:[26,26], 
                                    dragon1:[27,27],
                                    dragon2:[28,28], 
                                    dragon3:[29,29], 
                                    flower1:[30,30],
                                    flower2:[31,31], 
                                    flower3:[32,32], 
                                    flower4:[33,33],
                                    season1:[34,34], 
                                    season2:[35,35], 
                                    season3:[36,36], 
                                    season4:[37,37],
                                    wind1:[38,38], 
                                    wind2:[39,39], 
                                    wind3:[40,40],
                                    wind4:[41,41]                               
                            }
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oSprite = createSprite(oSpriteSheet,"bamboo1",TILE_WIDTH/2,TILE_HEIGHT/2,TILE_WIDTH,TILE_HEIGHT);
        _oContainer.addChild(_oSprite);
        
        var oSpriteSelection = s_oSpriteLibrary.getSprite("selection");
        _oSelection = createBitmap(oSpriteSelection);
        _oSelection.x = -TILE_WIDTH/2;
        _oSelection.y = -TILE_HEIGHT/2 + 2;
        _oSelection.visible = false;
        _oContainer.addChild(_oSelection);

        this.initBlocksArray(aLeftBlocks,aRightBlocks,aUpBlocks,aBlockingList);
        
        
        
        _oListenerClick = _oContainer.on("click",this._onTileSelected);
        if(!s_bMobile){
            _oListenerOver = _oContainer.on("mouseover",this._onTileOver);
            _oListenerOut = _oContainer.on("mouseout",this._onTileOut);
        }
        
    };
    
    this.unload = function(){
        _oContainer.off("click",_oListenerClick);
        if(!s_bMobile){
            _oContainer.off("mouseover",_oListenerOver);
            _oContainer.off("mouseout",_oListenerOut);
        }
        _oParentContainer.removeChild(_oContainer);
    };
    
    this.setValue = function(szLabel){
        _szLabel = szLabel;
        _oSprite.gotoAndStop(_szLabel);
        
        this.assignLabel();
    };
    
    this.initBlocksArray = function(aLeftBlocks,aRightBlocks,aUpBlocks,aBlockingList){
        _bSelected = false;
        _bActive = true;
        _bHint = false;
        
        _aLeftBlocks = new Array();
        _aRightBlocks = new Array();
        _aUpBlocks = new Array();
        _aBlockingList = new Array();

        var i;
        for(i=0;i<aLeftBlocks.length;i++){
            _aLeftBlocks.push(aLeftBlocks[i]);
        }

        for(i=0;i<aRightBlocks.length;i++){
            _aRightBlocks.push(aRightBlocks[i]);
        }

        for(i=0;i<aUpBlocks.length;i++){
            _aUpBlocks.push(aUpBlocks[i]);
        }

        for(i=0;i<aBlockingList.length;i++){
            _aBlockingList.push(aBlockingList[i]);
        }
        
        this._checkIfTileIsFree();
        
        _oSelection.visible = false;
        _oContainer.scaleX = _oContainer.scaleY = 1;
        _oContainer.visible = true;
        _oContainer.alpha = 1;
    };
    
    this.assignLabel = function(){
        if(_szLabel.indexOf("season") !== -1){
            _szValue = "season";
        }else if(_szLabel.indexOf("flower") !== -1){
            _szValue = "flower";
        }else{
            _szValue=_szLabel;
        }
    };
    
    this.deselect = function(){
        createjs.Tween.removeTweens(_oContainer);
        _oSelection.visible = false;
        _oContainer.alpha = 1;
        _bSelected = false;
        _bHint = false;
    };

    this.disable = function(){
	if(_bHint){
            _bHint = false;
            createjs.Tween.removeTweens(_oContainer);
        }
	
        _oContainer.visible = false;
        _bSelected = false;
        _bActive=false;

        if(s_oGame === null){
            s_oHelp.onTileRemoved(_aBlockingList);
        }else{
            s_oGame.onTileRemoved(_aBlockingList);
        }     
    };

    this.remove = function(){
        _bActive=false;
        
        if(_bHint){
            _bHint = false;
            createjs.Tween.removeTweens(_oContainer);
        }
	
        var oParent = this;
        createjs.Tween.get(_oContainer).to({scaleX:0.1,scaleY:0.1} , 300,createjs.Ease.backIn).call(function(){oParent.disable();});
    };
  

    this.showHint = function(){
        _bHint = true;
        this._playHintAnim();
    };
    
    this._playHintAnim = function(){
        createjs.Tween.get(_oContainer).to({alpha:0.5} , 600,createjs.Ease.cubicOut).to({alpha:1},600,createjs.Ease.cubicOut).call(function(){_oThis._playHintAnim();});
    };
    
    this._checkIfTileIsFree = function(){
        _bFree = false;
        if( (_aLeftBlocks.length === 0) && (_aUpBlocks.length === 0)){
            _bFree = true;
        }else if( (_aRightBlocks.length === 0) && (_aUpBlocks.length === 0)){
            _bFree = true;
        }
    };
    
    this.removeBlock = function(iIndexToRemove){
        var i;
        for(i=0;i<_aRightBlocks.length;i++){
            if(_aRightBlocks[i] === iIndexToRemove){
                //remove this tile from blocks
                _aRightBlocks.splice(i,1);
                this._checkIfTileIsFree();
                return;
            }
        }

        for(i=0;i<_aLeftBlocks.length;i++){
            if(_aLeftBlocks[i] === iIndexToRemove){
                //remove this tile from blocks
                _aLeftBlocks.splice(i,1);
                this._checkIfTileIsFree();
                return;
            }
        }

        for(i=0;i<_aUpBlocks.length;i++){
            if(_aUpBlocks[i] === iIndexToRemove){
                //remove this tile from blocks
                _aUpBlocks.splice(i,1);
                this._checkIfTileIsFree();
                return;
            }
        }
    };
    
    this._onTileSelected = function(){
        
        if(_bHint){
            if(s_oGame === null){
                s_oHelp.removeHint();
            }else{
                s_oGame.removeHint();
            }
            
        }else if(_oThis.isSelectable()){
            if(_bSelected){
                _oThis.deselect();
                if(s_oGame === null){
                    s_oHelp.onTileDeselected();
                }else{
                    s_oGame.onTileDeselected();
                }
                
            }else{
                _bSelected = true;
                _oSelection.visible = true;
                if(s_oGame === null){
                    s_oHelp.onTileSelected(_iIndex);
                }else{
                    s_oGame.onTileSelected(_iIndex);
                }              
            }
        }
    };
    
    this._onTileOver = function(){ 
        if(_oThis.isSelectable()){
            _oSelection.visible = true;
        }
    };

    this._onTileOut = function(){
        if(_bSelected === false){
            _oSelection.visible = false;
        }
    };
    
    this.getValue = function(){
        return _szValue;
    };

    this.isSelectable = function(){
        if (_bFree && _bActive){
            return true;
        }else{
            return false;
        }
    };
    
    this.getBlockList = function(){
        return _aBlockingList;
    };
    
    this.getHeight = function(){
        return _iBoardHeight;
    };
    
    this.getIndex = function(){
        return _iIndex;
    };
    
    this.getX = function(){
        return _oContainer.x ;
    };
    
    this.getY = function(){
        return _oContainer.y ;
    };
    
    _oThis = this;
    _oParentContainer = oParentContainer;
    this._init(iIndex,iX,iY,aLeftBlocks,aRightBlocks,aUpBlocks,aBlockingList,iHeight,oParentContainer);
    
    return this;
}