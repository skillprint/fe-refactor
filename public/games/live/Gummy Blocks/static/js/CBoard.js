function CBoard(iX,iY,oParentContainer){
    var _bAlertMode;
    var _iNumPiecePlaced;
    var _iCloudArrival;
    var _aCells;
    var _aCellsLogicState;
    var _aCurPieces;
    var _aXPieceAttach;
    var _oListenerBlock;
    var _oListenerRelease;
    var _oListenerMove;
    
    var _oMaskClouds;
    var _oCurMovingPiece;
    var _oClouds;
    var _oBlock;
    var _oCellContainer;
    var _oPieceContainer;
    var _oContainer;
    var _oParentContainer = oParentContainer;
    
    var _oThis = this;
    
    this._init = function(iX,iY){
        _bAlertMode = false;
        _iNumPiecePlaced = 0;
        
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);
        
        var oSpriteFg = s_oSpriteLibrary.getSprite("cloud_mask")
        _oClouds = createBitmap(s_oSpriteLibrary.getSprite("clouds_back"));
        _oClouds.x = 0;
        _oClouds.y = 450;
        _oContainer.addChild(_oClouds);
        
        _iCloudArrival = oSpriteFg.width-340;
        _oMaskClouds = new createjs.Shape();
        _oMaskClouds.graphics.beginFill("red").drawRect(170, 0, _iCloudArrival, oSpriteFg.height);
        _oMaskClouds.alpha = 0.01;
        _oContainer.addChild(_oMaskClouds);
        
        _oClouds.mask = _oMaskClouds;
        
        this._initBoard();
        
        
        var oFg = createBitmap(oSpriteFg);
        _oContainer.addChild(oFg);
        
        _oContainer.regX = _oContainer.getBounds().width/2;
        _oContainer.regY = _oContainer.getBounds().height/2;
        
        _oPieceContainer = new createjs.Container();
        _oContainer.addChild(_oPieceContainer);
        
        _oBlock = new createjs.Shape();
        _oBlock.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(0, 0, _oContainer.getBounds().width, _oContainer.getBounds().height);
        _oListenerBlock = _oBlock.on("click", function () {});
        _oContainer.addChild(_oBlock);
        
        _aXPieceAttach = [_oContainer.regX-400,_oContainer.regX,_oContainer.regX + 400];

        this.startGame(false);

    };
    
    this.refreshGridScale = function(){
        _oContainer.scaleX = _oContainer.scaleY = CUR_GRID_SCALE;
    };
    
    this.reset = function(){
        _bAlertMode = false;
        _iNumPiecePlaced = 0;
        
        for(var i=0;i<NUM_ROWS;i++){
            for(var j=0;j<NUM_COLS;j++){
                _aCells[i][j].setValue(LABEL_EMPTY);
                _aCellsLogicState[i][j] = LABEL_EMPTY;
            }
        }
        
        //REMOVE CURRENT PIECES
        for(var k=0;k<_aCurPieces.length;k++){
            if(_aCurPieces[k] !== null){
                _aCurPieces[k].unload();
            }
            
        }
        
        this.startGame(true);
    };
    
    this._initBoard = function(){
        _oCellContainer = new createjs.Container();
        _oCellContainer.x = CELL_X;
        _oCellContainer.y = CELL_Y;
        _oContainer.addChild(_oCellContainer);
        
        _aCells = new Array();
        _aCellsLogicState = new Array();
        var iX = 0;
        var iY = 0;
        for(var i=0;i<NUM_ROWS;i++){
            _aCells[i] = new Array();
            _aCellsLogicState[i] = new Array();
            for(var j=0;j<NUM_COLS;j++){
                _aCells[i][j] = new CBoardCell(iX,iY,i,j,_oCellContainer);
                _aCellsLogicState[i][j] = LABEL_EMPTY;
                iX += CELL_WIDTH;
            }
            
            iX = 0;
            iY += CELL_HEIGHT_FAKE;
        }

    };
    
    this.restoreBoardState = function(bRestart){
        var aState = getBoardState();
        if(aState !== null){

            for(var i=0;i<NUM_ROWS;i++){
                for(var j=0;j<NUM_COLS;j++){
                    _aCellsLogicState[i][j] = aState[i][j];
                    _aCells[i][j].setValue(aState[i][j],false);
                }
            }
        }else{
            return false;
        }

        
        var aPiecesToRestore = getSavedPieces();
        if(!bRestart && aPiecesToRestore !== null){
            _iNumPiecePlaced = 0;
            for(var i=0;i<aPiecesToRestore.length;i++){
              
                this.spawnPieces(i,Math.floor(Math.random()*500),aPiecesToRestore[i]);
                if(aPiecesToRestore[i] === null){
                    _iNumPiecePlaced++;
                }
                
            }
        }

        return true;
    };
    
    this._prepareBoardState = function(){
        var aPiecesInfo = new Array();
        for(var i=0;i<_aCurPieces.length;i++){
            if(_aCurPieces[i] !== null){
                aPiecesInfo[i] = _aCurPieces[i].getInfos();
            }else{
                aPiecesInfo[i] = null;
            }
            
        }
        
        s_oGame.saveGameState(_aCellsLogicState,aPiecesInfo);
    };

    
    this.setBlock = function(bBlock){
        _oBlock.visible = bBlock;
    };
    
    this.startGame = function(bRestart){
        _oBlock.visible = false;
        
        _aCurPieces = [null,null,null];
        
        if(bRestart || this.restoreBoardState(bRestart) === false){
            for(var i=0;i<3;i++){
                this.spawnPieces(i,Math.floor(Math.random()*500),s_oPieceSettings.getRandPieceInfos());
            }
        }
    };
    
    this.spawnPieces = function(iIndex,iDelaySpawn,oInfo){
        if(oInfo !== null){
            var oPiece = new CPiece(iIndex,_aXPieceAttach[iIndex],Y_PIECE_ATTACH,oInfo,iDelaySpawn,_oPieceContainer);
            oPiece.addEventListener(ON_SELECT_PIECE,this._onSelectPiece,this);
            _aCurPieces[iIndex] = oPiece;
            
            playSound("swish",1,false);
        }
        
    };
    
    this._onSelectPiece = function(oCurPiece){
        _bAlertMode = false;
        _oCurMovingPiece = oCurPiece;
        
        _oListenerMove = s_oStage.on("pressmove",_oThis._onMove,_oThis);
        _oListenerRelease = s_oStage.on("stagemouseup",_oThis._onRelease,_oThis);
    };
    
    this._onMove = function(evt){
        _oCurMovingPiece.refreshGlobalPos(evt.stageX,evt.stageY);
        
    };
    
    this._onRelease = function(evt){
        s_oStage.off("pressmove",_oListenerMove);
        s_oStage.off("stagemouseup",_oListenerRelease);
        
        this._checkPieceCollision(_oCurMovingPiece.getIndex(),_oCurMovingPiece.getInfos());
    };
    
    this._checkAllCurrentPiecesCanBePlaced = function(){
        //this.printBoardCell();
        var iCont = 0;
        for(var k=0;k<_aCurPieces.length;k++){
            if(_aCurPieces[k] === null || this._checkIfPieceCanBePlaced(_aCurPieces[k]) === false){
                iCont++;
            }
        }
        
        
        if(iCont === _aCurPieces.length){
            //REMOVE PIECE LISTENERS
            for(var i=0;i<_aCurPieces.length;i++){
                if(_aCurPieces[i] !== null){
                    _aCurPieces[i].disableListeners();
                }
            }
            
            clearBoardState();
            saveScore(0);
            s_oGame.gameOver(); 
        }
    };
    
    this._checkIfPieceCanBePlaced = function(oPiece){
        for(var i=0;i<NUM_ROWS;i++){
            for(var j=0;j<NUM_COLS;j++){
                if(this._checkIfPieceFit(i,j,oPiece.getInfos().list_pos)){
                    return true;
                }
            }
        }
        
        return false;
    };

    
    this._checkPieceCollision = function(iIndex,oInfos){
        var oPiece = _aCurPieces[iIndex];
        var aListPos = oInfos.list_pos;
        var oPiecePos = oPiece.getGlobalPos();
        oPiecePos = _oCellContainer.globalToLocal(oPiecePos.x,oPiecePos.y);
        
        var iStartRow = Math.floor(oPiecePos.y / CELL_HEIGHT_FAKE);
        var iStartCol = Math.floor(oPiecePos.x / CELL_WIDTH);
        
        if (this._checkIfPieceFit(iStartRow,iStartCol,aListPos) ){
            playSound("position",1,false);
            
            this.setCellValues(iStartRow,iStartCol,aListPos,oInfos.type);
            s_oGame.refreshScore(oInfos.num_cell);
            
            oPiece.unload();
            _aCurPieces[iIndex] = null;
            
            
            //CHECK CELL CLEARING
            this._checkLines();
            
            //CHECK IF MUST SPAWN NEW PIECES
            _iNumPiecePlaced++;
            if(_iNumPiecePlaced === PIECE_TO_PLACE){
                for(var k=0;k<PIECE_TO_PLACE;k++){
                    this.spawnPieces(k,Math.floor(Math.random()*500),s_oPieceSettings.getRandPieceInfos());
                }
                
                _iNumPiecePlaced = 0;
            }
            
            
            this._prepareBoardState();
            
            //CHECK IF GAME OVER
            this._checkAllCurrentPiecesCanBePlaced();
            
            
        }else{
            oPiece.resetPos();
            this.setBlock(false);
        }
    };
    
    
    
    this._checkIfPieceFit = function(iStartRow,iStartCol,aListPos){
        if(iStartRow < 0 || iStartRow >= NUM_ROWS && iStartCol < 0 && iStartCol >= NUM_COLS){
            return false;
        }
        
        for(var i=0;i<aListPos.length;i++){
            var oCoord = aListPos[i];
            
            if((iStartRow+oCoord.row) < 0 || (iStartRow+oCoord.row) >= NUM_ROWS || (iStartCol+oCoord.col) < 0 || (iStartCol+oCoord.col) >= NUM_COLS || 
                                                                                                _aCells[iStartRow+oCoord.row][iStartCol+oCoord.col].getType() !== LABEL_EMPTY){
                return false;
            }
        }
        
        return true;
    };
    
    this.setCellValues = function(iStartRow,iStartCol,aListPos,iType){
        for(var i=0;i<aListPos.length;i++){
            var oCoord = aListPos[i];
            _aCells[iStartRow+oCoord.row][iStartCol+oCoord.col].setValue(iType,true);
            _aCellsLogicState[iStartRow+oCoord.row][iStartCol+oCoord.col] = iType;
        }
    };
    
    this._checkLines = function(){
        var aRowsToClear = new Array();
        
        //CHECK COLS
        for(var i=0;i<NUM_ROWS;i++){
            var iCont = 0;
            for(var j=0;j<NUM_COLS;j++){
                if(_aCells[i][j].isEmpty()){
                    break;
                }
                iCont++;
            }
            
            if(iCont === NUM_COLS){
                aRowsToClear.push(i);
            }
        }
        

        //CHECK ROWS
        var aColsToClear = new Array();
        for(var i=0;i<NUM_COLS;i++){
            var iCont = 0;
            for(var j=0;j<NUM_ROWS;j++){
                if(_aCells[j][i].isEmpty()){
                    break;
                }
                iCont++;
            }
            
            if(iCont === NUM_ROWS){
                aColsToClear.push(i);
            }
        }


       
        var iTotRemove = aRowsToClear.length+aColsToClear.length;
        if(iTotRemove > 0 ){
            logEvent({event: "LINE_CLEARED", num_lines_cleared: iTotRemove});
            this._destroyRows(aRowsToClear);
            this._destroyCols(aColsToClear);

            this.setBlock(false);
            
            if(iTotRemove >1){
                 playSound("combo_plus",1,false);
            }else{
                 playSound("combo",1,false);
            }
            //SCORE MULTIPLIER
            var iAmountScore = 5* (aRowsToClear.length+aColsToClear.length)*(aRowsToClear.length+aColsToClear.length+1);
            s_oGame.refreshScore(iAmountScore);
            
            return true;
        }
        
        return false;
    };
    
    this._destroyRows = function(aRowsToClear){
        for(var i=0;i<aRowsToClear.length;i++){
            var iDelay = 0;
            for(var k=0;k<NUM_COLS;k++){
                _aCells[aRowsToClear[i]][k].clearAnim(iDelay);
                _aCellsLogicState[aRowsToClear[i]][k] = LABEL_EMPTY;
                iDelay += 50;
            }
        }
    };
    
    this._destroyCols = function(aColsToClear){
        for(var i=0;i<aColsToClear.length;i++){
            var iDelay = 0;
            for(var k=0;k<NUM_ROWS;k++){
                _aCells[k][aColsToClear[i]].clearAnim(iDelay);
                _aCellsLogicState[k][aColsToClear[i]] = LABEL_EMPTY;
                iDelay += 50;
            }
        }
    };
    
    this._findAllFilledCells = function(){
        var aList = new Array();
        for(var i=0;i<NUM_ROWS;i++){
            for(var j=0;j<NUM_COLS;j++){
                if(_aCells[i][j].isEmpty() === false ){
                    aList.push({row:i,col:j});
                }
            }
        }
        
        return aList;
    };

    this.printBoardCell = function(){
        
        for(var i=0;i<NUM_ROWS;i++){
            var szPrint = "";
            for(var j=0;j<NUM_COLS;j++){
                szPrint += _aCells[i][j].getType()+"#"
            }
            trace(szPrint)
            
        }
        trace("####################")
        
    };
    
    this.update = function(){
        _oClouds.x += 1;
        if(_oClouds.x > _iCloudArrival){
            _oClouds.x = -700;
        }
    };
    
    this._init(iX,iY);
}