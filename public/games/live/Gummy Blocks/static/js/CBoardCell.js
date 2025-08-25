function CBoardCell(iX,iY,iRow,iCol,oParentContainer){
    var _bEmpty;
    var _iValue;
    var _aCbCompleted;
    var _aCbOwner;
    var _oListenerClick;
    
    var _oCell;
    var _oContainer;
    var _oParentContainer = oParentContainer;
    
    var _oThis = this;
    
    this._init = function(iX,iY){
        _bEmpty = true;
        _iValue = LABEL_EMPTY;
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);

        var oBg = createBitmap(s_oSpriteLibrary.getSprite("cell_bg"));
        oBg.regX = CELL_WIDTH/2;
        oBg.regY = CELL_HEIGHT/2
        _oContainer.addChild(oBg);


        var oData = {   
                        images: [s_oSpriteLibrary.getSprite("cubes_sprite")], 
                        // width, height & registration point of each sprite
                        frames: {width: CELL_WIDTH, height: CELL_HEIGHT,regX:CELL_WIDTH/2,regY:CELL_HEIGHT/2}, 
                        animations: {idle:0,type_1:1,type_2:2,type_3:3,type_4:4,type_5:5,type_6:6,type_7:7,type_8:8,type_9:9}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
            
        _oCell = createSprite(oSpriteSheet,"idle",CELL_WIDTH/2,CELL_HEIGHT/2,CELL_WIDTH,CELL_HEIGHT);
        _oCell.y = -8;
        _oCell.visible = false;
        _oContainer.addChild(_oCell);

    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.setValue = function(iValue,bTween){
        _iValue = iValue;
        _oCell.scaleX = _oCell.scaleY = 1.1;
        
        if(iValue === LABEL_EMPTY){
            _bEmpty = true;
            _oCell.visible = false;
        }else{
            _oCell.visible = true;
            _oCell.gotoAndStop("type_"+iValue);
            _bEmpty = false;
            
            if(bTween){
                createjs.Tween.get(_oCell).to({scaleX:1,scaleY:1}, 1500, createjs.Ease.elasticOut)
            }else{
                _oCell.scaleX = _oCell.scaleY = 1;
            }
        }
    };
    
    this.clearAnim = function(iDelay){

        var oParent = this;
        createjs.Tween.get(_oCell).wait(iDelay).to({scaleX:0.1,scaleY:0.1}, 300, createjs.Ease.backIn).call(function(){oParent.setValue(LABEL_EMPTY)});
        
        
        _iValue = LABEL_EMPTY;
    };
    
    this._onClick = function(){
        _oContainer.off("click",_oListenerClick);
        
        _oThis.clearAnim(0);
    };
    
    this.isEmpty = function(){
        return _bEmpty;
    };
    
    this.getX = function(){
        return _oContainer.x;
    };
    
    this.getY = function(){
        return _oContainer.y;
    };
    
    this.getType = function(){
        return _iValue;
    };
    
    this._init(iX,iY);
}