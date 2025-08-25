function CPiece(iIndex,iX,iY,oInfo,iDelay,oParentContainer){
    var _iIndex = iIndex;
    var _aPieces;
    var _aCbCompleted;
    var _aCbOwner;
    var _pStartPos;
    var _oInfos;
    var _oListenerPress;
    
    
    var _oHitArea;
    var _oContainer;
    var _oParentContainer = oParentContainer;
    
    var _oThis = this;
    
    this._init = function(iX,iY,oInfo,iDelay){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        _pStartPos = {x:iX,y:iY};
        _oInfos = oInfo;
        
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);
        
        
        _aPieces = new Array();
        
        var aList = oInfo.list_pos;
        
        
        for(var i=0;i<aList.length;i++){
            var iXPos = aList[i].col * CELL_WIDTH;
            var iYPos = aList[i].row * CELL_HEIGHT_FAKE;
            
            var oData = {   
                        images: [s_oSpriteLibrary.getSprite("cubes_sprite")], 
                        // width, height & registration point of each sprite
                        frames: {width: CELL_WIDTH, height: CELL_HEIGHT,regX:CELL_WIDTH/2,regY:CELL_HEIGHT/2}, 
                        animations: {idle:0,type_1:1,type_2:2,type_3:3,type_4:4,type_5:5,type_6:6,type_7:7,type_8:8,type_9:9}
                   };
                   
            var oSpriteSheet = new createjs.SpriteSheet(oData);
        
            var oCell = createSprite(oSpriteSheet,"type_"+oInfo.type,CELL_WIDTH/2,CELL_HEIGHT/2,CELL_WIDTH,CELL_HEIGHT);
            oCell.x = iXPos+CELL_WIDTH/2;
            oCell.y = iYPos+CELL_HEIGHT/2;
            _oContainer.addChild(oCell);
            
            _aPieces.push(oCell);
        }
        
        
        _oContainer.scaleX = _oContainer.scaleY = 0.01;
        _oContainer.regX = _oContainer.getBounds().width/2;
        _oContainer.regY = _oContainer.getBounds().height/2;
        
        
        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("red").drawRect(-50, -50, _oContainer.getBounds().width+100, _oContainer.getBounds().height+100);
        _oHitArea.alpha = 0.01;
        _oContainer.addChild(_oHitArea);
        

        //POP ANIM SHOW
        createjs.Tween.get(_oContainer).wait(iDelay).to({scaleX:SCALE_STARTING_PIECE,scaleY:SCALE_STARTING_PIECE}, 700, createjs.Ease.elasticOut).call(function(){                                                                                             
                                                                                                           _oThis._initMouseListeners();                                                                                                             
                                                                                                    });
    };
    
    this.unload = function(){
        _oHitArea.off("mousedown",_oListenerPress);
        
        _oParentContainer.removeChild(_oContainer);
    };
    
    this.disableListeners = function(){
        _oHitArea.off("mousedown",_oListenerPress);
    };
    
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };

    this._initMouseListeners = function(){
        _oListenerPress = _oHitArea.on("mousedown",_oThis._onPress);
    };
    
    this.resetPos = function(){
        createjs.Tween.removeTweens(_oContainer);
        _oContainer.x = _pStartPos.x;
        _oContainer.y = _pStartPos.y;
        _oContainer.scaleX = _oContainer.scaleY = SCALE_STARTING_PIECE;
    };
    
    this._onPress = function(evt){
        createjs.Tween.get(_oContainer).to({scaleX:1,scaleY:1}, 500, createjs.Ease.cubicOut);
        
        _oThis.refreshGlobalPos(evt.stageX,evt.stageY);

        
        if(_aCbCompleted[ON_SELECT_PIECE]){
           _aCbCompleted[ON_SELECT_PIECE].call(_aCbOwner[ON_SELECT_PIECE],_oThis);
        }
    };

    this.refreshGlobalPos = function(iX,iY){
        var pPos = _oParentContainer.globalToLocal(iX,iY);
        _oContainer.x = pPos.x;
        if(s_bMobile){
            _oContainer.y = pPos.y-OFFSET_PIECE_Y;
        }else{
            _oContainer.y = pPos.y - 10;
        }
        
    };
    
    this.getX = function(){
        return _oContainer.x;  
    };
    
    this.getY = function(){
        return _oContainer.y;
    };
    
    this.getGlobalPos = function(){
        return _oParentContainer.localToGlobal(_oContainer.x- _oContainer.getBounds().width/2 + CELL_WIDTH,_oContainer.y-_oContainer.getBounds().height/2 + CELL_HEIGHT_FAKE);
    };
    
    this.getInfos = function(){
        return _oInfos;
    };
    
    this.getIndex = function(){
        return _iIndex;
    };
    
    this._init(iX,iY,oInfo,iDelay);
}

