function CPiece(iX,iY,iWidth,iHeight,iRadius,oJoints,iFrame,oSpriteMask,oSpriteEffect,oSpriteSheet,oParentContainer){
    var DISTANCE_TO_CHECK; 
    var DEBUG = false;
    
    var _bActive;
    var _bAttached;
    var _bDragging;
    var _iIndex;
    var _iStartingRot;
    var _iRadius;
    var _aListeners;
    var _aLogicCircleHitArea;
    var _aActiveJointList;
    var _pStartingPos;
    var _pPosAfterShuffling;
    var _pMouseOffset;
    var _pPrevCoord;
    var _oJoints;
    
    var _oDebugText;
    var _oImage;
    var _oContainer;
    var _oParentContainer;
    var _oThis;
    
    this._init = function(iX,iY,iWidth,iHeight,iRadius,oJoints,iFrame,oSpriteMask,oSpriteEffect,oSpriteSheet){
        _bActive = false;
        _bAttached = false;
        _bDragging = false;
        _iIndex = iFrame;
        _iRadius = iRadius;
        var iIndexRand = Math.floor((Math.random()*PIECE_ROTATIONS.length));
        _iStartingRot = PIECE_ROTATIONS[iIndexRand];
        _oJoints = oJoints;
        
        _aActiveJointList = new Array();

        _oContainer = new createjs.Container();
        _oContainer.x = iX + iWidth/2;
        _oContainer.y = iY + iHeight/2;
        _oContainer.regX = iWidth/2;
        _oContainer.regY = iHeight/2;
        _oContainer.cursor = "pointer";
        _oParentContainer.addChild(_oContainer);
        
        _pStartingPos = {x:_oContainer.x,y:_oContainer.y};

        var oMask = createBitmap(oSpriteMask);    
        _oImage = createSprite(oSpriteSheet,"frame_"+_iIndex,0,0,iWidth,iHeight);
        _oImage.filters = [
            new createjs.AlphaMaskFilter(oMask.image)
        ];
        _oImage.cache(0, 0, iWidth, iHeight);
        _oContainer.addChild(_oImage);
        
        
        var oStroke = createBitmap(oSpriteEffect);
        _oContainer.addChild(oStroke);
        
        if(DEBUG){
            _oDebugText = new createjs.Text(_iIndex,"50px "+PRIMARY_FONT, "red");
            _oDebugText.x = iWidth/2;
            _oDebugText.y = iHeight/2;
            _oDebugText.textAlign = "center";
            _oDebugText.textBaseline = "alphabetic";
            _oContainer.addChild(_oDebugText);
        }
        
        
        this._initHitAreas();
        
        _aListeners = new Array();
        _aListeners.push(_oContainer.on("mousedown",this._onPieceDown));
        _aListeners.push(_oContainer.on("pressmove", this._onDragPiece));
        _aListeners.push(_oContainer.on("pressup", this._onReleasePiece ));
    };
    
    this.unload = function(){
        _oContainer.off("mousedown",_aListeners[0]);        
        _oContainer.off("pressmove",_aListeners[1]);        
        _oContainer.off("pressup",_aListeners[2]);        
    };
    
    this.reset = function(bRotActive){
        _oContainer.alpha = 1;
        _bAttached = false;
        
        if(bRotActive){
            var iIndexRand = Math.floor((Math.random()*PIECE_ROTATIONS.length));
            _iStartingRot = PIECE_ROTATIONS[iIndexRand];
        }else{
            _iStartingRot = 0;
        }
        
        this._initHitAreas();
        _aActiveJointList = new Array();
        this.moveTo(_pPosAfterShuffling);
    };
    
    this._initHitAreas = function(){
        
        DISTANCE_TO_CHECK = _iRadius*_iRadius;
        
        _aLogicCircleHitArea = new Array();
        
        if(_oJoints.up !== null){
            var iX = _oJoints.up[0];
            
            var oRect = new createjs.Shape();
            oRect.graphics.beginFill("rgba(255,0,0,0.3)").drawCircle(iX,_oJoints.up[1],_iRadius);
            if(DEBUG){
                _oContainer.addChild(oRect);    
            }
            
            _aLogicCircleHitArea[JOINT_UP] = {x:iX,y:_oJoints.up[1],pointer:oRect};
        }else{
            _aLogicCircleHitArea[JOINT_UP] = null;
        }
        
        if(_oJoints.right !== null){
            var iY = _oJoints.right[1];
            
            var oRect = new createjs.Shape();
            oRect.graphics.beginFill("rgba(0,255,0,0.3)").drawCircle(_oJoints.right[0],iY,_iRadius);
            if(DEBUG){
                _oContainer.addChild(oRect);    
            } 
            
            _aLogicCircleHitArea[JOINT_RIGHT] = {x:_oJoints.right[0],y:iY,pointer:oRect};
        }else{
             _aLogicCircleHitArea[JOINT_RIGHT] = null;
        }
        
        
        if(_oJoints.down !== null){
            var iX = _oJoints.down[0];
            
            var oRect = new createjs.Shape();
            oRect.graphics.beginFill("rgba(0,0,255,0.3)").drawCircle(iX,_oJoints.down[1],_iRadius);
            if(DEBUG){
                _oContainer.addChild(oRect);    
            }
            
            _aLogicCircleHitArea[JOINT_DOWN] = {x:iX,y:_oJoints.down[1],pointer:oRect};
        }else{
            _aLogicCircleHitArea[JOINT_DOWN] = null;
        }
        
        if(_oJoints.left !== null){
            var iY = _oJoints.left[1];
            
            var oRect = new createjs.Shape();
            oRect.graphics.beginFill("rgba(255,228,0,0.7)").drawCircle(_oJoints.left[0],iY,_iRadius);
            if(DEBUG){
                _oContainer.addChild(oRect);    
            }
            
            _aLogicCircleHitArea[JOINT_LEFT] = {x:_oJoints.left[0],y:iY,pointer:oRect}; 
        }else{
            _aLogicCircleHitArea[JOINT_LEFT] = null;
        }
    };
    
    this.moveTo = function(oPoint){
        _pPosAfterShuffling = oPoint;
        createjs.Tween.get(_oContainer).to({x:oPoint.x,y:oPoint.y ,rotation:_iStartingRot}, 1000,createjs.Ease.cubicOut).call(function(){_bActive = true;s_oInterface.enableGUI(true);});
    };
    
    this.setStartingPosition = function(){
        _oContainer.x = _pStartingPos.x;
        _oContainer.y = _pStartingPos.y;
        _bActive = false;
    };
    
    this.setRotation = function(bRot){
        if(_bAttached){
            return;
        }
        
        if(bRot){
            _oContainer.rotation = _iStartingRot;
        }else{
            _oContainer.rotation = 0;
        }
    };
    
    this.fadeOut = function(){
        createjs.Tween.get(_oContainer).to({alpha:0 }, TIME_FADE_OUT_PIECES);
    };
    
    this.snap = function(iDiffX,iDiffY){
        _oContainer.x = _pStartingPos.x + iDiffX;
        _oContainer.y = _pStartingPos.y + iDiffY;
        
        return _aActiveJointList;
    };
    
    this.checkCollision = function(aHitAreaToCheck){
        var aHitArea = this._updateHitAreaPosition();
        //CALCULATE DISTANCE BETWEEN HIT AREAS
        if(aHitAreaToCheck[JOINT_UP] !== null && aHitArea[JOINT_DOWN] !== null){
            if(distance2(aHitAreaToCheck[JOINT_UP],aHitArea[JOINT_DOWN]) < DISTANCE_TO_CHECK){
                return {joint1:aHitArea[JOINT_DOWN].pointer,joint2:aHitAreaToCheck[JOINT_UP].pointer,dir:JOINT_UP};
            }
        }
        
        if(aHitAreaToCheck[JOINT_RIGHT] !== null && aHitArea[JOINT_LEFT] !== null){
            if(distance2(aHitAreaToCheck[JOINT_RIGHT],aHitArea[JOINT_LEFT]) < DISTANCE_TO_CHECK){
                return {joint1:aHitArea[JOINT_LEFT].pointer,joint2:aHitAreaToCheck[JOINT_RIGHT].pointer,dir:JOINT_RIGHT};
            }
        }
        
        if(aHitAreaToCheck[JOINT_DOWN] !== null && aHitArea[JOINT_UP] !== null){
            if(distance2(aHitAreaToCheck[JOINT_DOWN],aHitArea[JOINT_UP]) < DISTANCE_TO_CHECK){
                return {joint1:aHitArea[JOINT_UP].pointer,joint2:aHitAreaToCheck[JOINT_DOWN].pointer,dir:JOINT_DOWN};
            }
        }
        
        if(aHitAreaToCheck[JOINT_LEFT] !== null && aHitArea[JOINT_RIGHT] !== null){
            if(distance2(aHitAreaToCheck[JOINT_LEFT],aHitArea[JOINT_RIGHT]) < DISTANCE_TO_CHECK){
                return {joint1:aHitArea[JOINT_RIGHT].pointer,joint2:aHitAreaToCheck[JOINT_LEFT].pointer,dir:JOINT_LEFT};
            }
        }
        
        return null;
    };
    
    this._updateHitAreaPosition = function(){
        var aHitArea = new Array();
        if(_aLogicCircleHitArea[JOINT_UP] !== null){
            aHitArea[JOINT_UP] = {x:_oContainer.x - _oContainer.regX + _aLogicCircleHitArea[JOINT_UP].x,
                                  y:_oContainer.y - _oContainer.regY + _aLogicCircleHitArea[JOINT_UP].y,
                                  pointer:_aLogicCircleHitArea[JOINT_UP].pointer}; 
        }else{
            aHitArea[JOINT_UP] = null;
        }
        
        if(_aLogicCircleHitArea[JOINT_RIGHT] !== null){
            aHitArea[JOINT_RIGHT] = {x:_oContainer.x - _oContainer.regX + _aLogicCircleHitArea[JOINT_RIGHT].x,
                                    y:_oContainer.y - _oContainer.regY + _aLogicCircleHitArea[JOINT_RIGHT].y,
                                    pointer:_aLogicCircleHitArea[JOINT_RIGHT].pointer}; 
        }else{
            aHitArea[JOINT_RIGHT] = null;
        }
        
        if(_aLogicCircleHitArea[JOINT_DOWN] !== null){
            aHitArea[JOINT_DOWN] = {x:_oContainer.x - _oContainer.regX+ _aLogicCircleHitArea[JOINT_DOWN].x,
                                    y:_oContainer.y - _oContainer.regY+ _aLogicCircleHitArea[JOINT_DOWN].y,
                                    pointer:_aLogicCircleHitArea[JOINT_DOWN].pointer}; 
        }else{
            aHitArea[JOINT_DOWN] = null;
        }
        
        if(_aLogicCircleHitArea[JOINT_LEFT] !== null){
            aHitArea[JOINT_LEFT] = {x:_oContainer.x - _oContainer.regX + _aLogicCircleHitArea[JOINT_LEFT].x,
                                    y:_oContainer.y - _oContainer.regY + _aLogicCircleHitArea[JOINT_LEFT].y,
                                    pointer:_aLogicCircleHitArea[JOINT_LEFT].pointer}; 
        }else{
            aHitArea[JOINT_LEFT] = null;
        }
        
        return aHitArea;
    };
    
    this.removeJoint = function(oJointToRemove){
        for(var i in _aLogicCircleHitArea){
            if(_aLogicCircleHitArea[i] !== null && _aLogicCircleHitArea[i].pointer === oJointToRemove){
                _oContainer.removeChild(_aLogicCircleHitArea[i].pointer);   
                _aLogicCircleHitArea[i] = null;
                break;
            }
        }
    };
    
    this.setAttached = function(bValue){
        _bAttached = bValue;
    };
    
    this.updateJointList = function(aNewList){
        _aActiveJointList = aNewList;
    };
    
    this.setDepth = function(iDepth){
        _oParentContainer.setChildIndex(_oContainer,iDepth);
    };
    
    this._onPieceDown = function(evt){
        if(_bActive){
            _pMouseOffset = {x : (evt.stageX/s_iScaleFactor - _oContainer.x), y : (evt.stageY/s_iScaleFactor - _oContainer.y)};
            _pPrevCoord = {x : evt.stageX/s_iScaleFactor, y : evt.stageY/s_iScaleFactor};
        }
    };
    
    this._onDragPiece = function(evt){
        if(!_bActive || _pPrevCoord === undefined){
            return;
        }

	if(distance({x:evt.stageX/s_iScaleFactor,y:evt.stageY/s_iScaleFactor},_pPrevCoord) < 10){
            return;
        }
        
        var iNewX = (evt.stageX/s_iScaleFactor - _pMouseOffset.x);
        var iNewY = (evt.stageY/s_iScaleFactor - _pMouseOffset.y);
        if(iNewX < s_iOffsetX || iNewX > CANVAS_WIDTH-s_iOffsetX || iNewY <s_iOffsetY || iNewY > CANVAS_HEIGHT-s_iOffsetY){
            return;
        }
        
        _bDragging = true;
        _oContainer.x = iNewX;
        _oContainer.y = iNewY;
        
        s_oGame.draggingPiece(_oContainer.x,_oContainer.y,_oThis,_aActiveJointList);
    };
    
    this.draggedByOtherPiece = function(iX,iY,pDiff){
        _oContainer.x = iX + pDiff.x;
        _oContainer.y = iY + pDiff.y; 
    };
    
    this._onReleasePiece = function(){
        if(!_bActive){
            return;
        }
        
        if(_bDragging){
            _bDragging = false;
            var aHitArea = _oThis._updateHitAreaPosition();
        
            s_oGame.releasePiece(_oThis,aHitArea);
        }else if(!_bAttached && s_oInterface.isRotationActive()){
            _oContainer.rotation += 45;
        }
    };
    
    this.getHitAreas = function(){
        return _aLogicCircleHitArea;
    };
    
    this.getJoint = function(szType){
        return _aLogicCircleHitArea[szType].pointer;
    };
    
    this.getX = function(){
        return _oContainer.x;
    };
    
    this.getY = function(){
        return _oContainer.y;
    };
    
    this.getDiffX = function(){
        return _oContainer.x - _pStartingPos.x;
    };
    
    this.getDiffY = function(){
        return _oContainer.y - _pStartingPos.y;
    };
    
    this.getStartingX = function(){
        return _pStartingPos.x;
    };
    
    this.getStartingY = function(){
        return _pStartingPos.y;
    };
    
    this.getStartingPos = function(){
        return _pStartingPos;
    };
    
    this.getPos = function(){
        return {x:_oContainer.x,y:_oContainer.y};
    };
    
    this.isAttached = function(){
        return _bAttached;
    };
    
    this.getIndex = function(){
        return _iIndex;
    };
    
    this.getAbsRotation = function(){
        return _oContainer.rotation%360===0?0:_oContainer.rotation;
    };
    
    _oThis = this;
    _oParentContainer = oParentContainer;
    this._init(iX,iY,iWidth,iHeight,iRadius,oJoints,iFrame,oSpriteMask,oSpriteEffect,oSpriteSheet);
}