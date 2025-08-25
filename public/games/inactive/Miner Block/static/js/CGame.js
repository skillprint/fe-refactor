function CGame(oData, iLevel, iScore){
    var _iLevel = iLevel;
    var _iOldX;
    var _iOldY;
    var _iMoves = 0; 
    var _iScore = 0;
    var _iTotalScore = iScore;
    var _iGoal;
    
    var _oInterface;
    var _oEndPanel = null;
    var _oParent;
    
    var _bCanNotGoRight = false;
    var _bCanNotGoLeft = false;
    var _bCanNotGoUp = false;
    var _bCanNotGoDown = false;
    var _bGameOver = false;
    var _bCartSoundCreated = false;
    
    var _oLevel;
    var _aLevelInfo;
    
    var _aGrid = new Array();
    var _aBlock = new Array();
    
    var _iCurPos;
    var _iMouseOffset;
    
    var _iBlocksPlaced = 0;
    
    this._init = function(){
        $(s_oMain).trigger("start_level",iLevel);
        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(oBg); //Draws on canvas
        
        _oLevel = new CLevel();
        _aLevelInfo = _oLevel.getLevel(_iLevel);
        _iGoal = _oLevel.getGoalInLevel(_iLevel);
        
        
        //initializing the array
        _aGrid = new Array();
        for(var iRow=0; iRow < NUM_ROWS; iRow++){
            _aGrid[iRow] = new Array();
            for(var iCol=0; iCol < NUM_COLS; iCol++){
                _aGrid[iRow][iCol] = 0;
            }
        } 
        for(_iBlocksPlaced=0; _iBlocksPlaced < _aLevelInfo.length; _iBlocksPlaced++){
            _aBlock.push( new CBlocks(_aLevelInfo[_iBlocksPlaced].obj_x, _aLevelInfo[_iBlocksPlaced].obj_y, _aLevelInfo[_iBlocksPlaced].obj_type, _iBlocksPlaced) );
            this._updateGrid(_aLevelInfo[_iBlocksPlaced].obj_x, _aLevelInfo[_iBlocksPlaced].obj_y, _aLevelInfo[_iBlocksPlaced].obj_type);
        }
        
        _oInterface = new CInterface(_iGoal, iLevel+1, _iScore);
    };

    this._updateGrid = function(iX, iY, szType){
        switch(szType){
            case "player":
            case "horizzontal_2":
                _aGrid[iX][iY] = 1;
                _aGrid[iX+1][iY] = 1;
                break;
            case "horizzontal_3":
                _aGrid[iX][iY] = 1;
                _aGrid[iX+1][iY] = 1;
                _aGrid[iX+2][iY] = 1;
                break;
            case "vertical_2":
                _aGrid[iX][iY] = 1;
                _aGrid[iX][iY+1] = 1;
                break;
            case "vertical_3":
                _aGrid[iX][iY] = 1;
                _aGrid[iX][iY+1] = 1;
                _aGrid[iX][iY+2] = 1;
                break;
        }
    };
    
    this._unloadFromGrid = function(iX, iY, i){
        var szType = _aBlock[i].getType();
        switch(szType){
            case "player":
            case "horizzontal_2":
                _aGrid[iX][iY] = 0;
                _aGrid[iX+1][iY] = 0;
                break;
            case "horizzontal_3":
                _aGrid[iX][iY] = 0;
                _aGrid[iX+1][iY] = 0;
                _aGrid[iX+2][iY] = 0;
                break;
            case "vertical_2":
                _aGrid[iX][iY] = 0;
                _aGrid[iX][iY+1] = 0;
                break;
            case "vertical_3":
                _aGrid[iX][iY] = 0;
                _aGrid[iX][iY+1] = 0;
                _aGrid[iX][iY+2] = 0;
                break;
        }
    };
    
    this.onFormContainerClick = function(event, oContainer, i){
        //TOUCH EVENTS
        _iCurPos = {x: oContainer.x, y: oContainer.y };
        var r = Math.round((oContainer.x-START_X_GRID)/CELL_WIDTH); 
        var c = Math.round((oContainer.y-START_Y_GRID)/CELL_HEIGHT);
        _iOldX = oContainer.x;
        _iOldY = oContainer.y;
        _iMouseOffset = {x : (event.stageX/s_iScaleFactor) - _iCurPos.x, y : (event.stageY/s_iScaleFactor) - _iCurPos.y};
        this._unloadFromGrid(r, c, i);
    };
    
    this.dragForm = function(event, szType, i){
        var iMouseX = (event.stageX/s_iScaleFactor);
        var iMouseY = (event.stageY/s_iScaleFactor);
        var r = Math.round(((iMouseX - _iMouseOffset.x)-START_X_GRID)/CELL_WIDTH); 
        var c = Math.round(((iMouseY - _iMouseOffset.y)-START_Y_GRID)/CELL_HEIGHT);
        
        if((DISABLE_SOUND_MOBILE === false || s_bMobile === false) && !_bCartSoundCreated){
            playSound("cart",0.5,true);
            _bCartSoundCreated = true;
        }
        
        switch(szType){
            case "player":
            case "horizzontal_2":
                if(iMouseX- _iMouseOffset.x > START_X_GRID && iMouseX - _iMouseOffset.x < START_X_GRID+(CELL_WIDTH*4+10)){
                    if(_iOldX <= iMouseX - _iMouseOffset.x){
                        if(_aGrid[r+1][c] === 0 && _bCanNotGoRight === false){
                            _aBlock[i].setPos(iMouseX - _iMouseOffset.x , _aBlock[i].getPosY());
                            
                        }else{
                            _bCanNotGoRight = true;
                            _bCanNotGoLeft = false;
                            
                            fadeSound("cart",0.5,0,100);
                        }
                    }else{
                        if(_aGrid[r][c] === 0 && _bCanNotGoLeft === false){
                            _aBlock[i].setPos(iMouseX - _iMouseOffset.x , _aBlock[i].getPosY());
                        }else{
                            _bCanNotGoLeft = true;
                            _bCanNotGoRight = false;
                            fadeSound("cart",0.5,0,100);
                        }
                    }
                }
                break;
            case "horizzontal_3":
                if(iMouseX - _iMouseOffset.x > START_X_GRID && iMouseX - _iMouseOffset.x < START_X_GRID+(CELL_WIDTH*3+10)){
                    if(_iOldX <= iMouseX - _iMouseOffset.x){
                        if(_aGrid[r+2][c] === 0 && _bCanNotGoRight === false){
                            _aBlock[i].setPos(iMouseX - _iMouseOffset.x , _aBlock[i].getPosY());
                            
                        }else{
                            _bCanNotGoRight = true;
                            _bCanNotGoLeft = false;
                            fadeSound("cart",0.5,0,100);
                        }
                    }else{
                        if(_aGrid[r][c] === 0 && _bCanNotGoLeft === false){
                            _aBlock[i].setPos(iMouseX - _iMouseOffset.x , _aBlock[i].getPosY());
                           
                        }else{
                            _bCanNotGoLeft = true;
                            _bCanNotGoRight = false;
                            fadeSound("cart",0.5,0,100);
                        }
                    }
                }
                break;
            case "vertical_2":
                if(iMouseY - _iMouseOffset.y > START_Y_GRID && iMouseY - _iMouseOffset.y < START_Y_GRID+(CELL_HEIGHT*4+10)){
                    if(_iOldY <= iMouseY - _iMouseOffset.y){
                        if(_aGrid[r][c+1] === 0 && _bCanNotGoUp === false){
                            _aBlock[i].setPos(_aBlock[i].getPosX() , iMouseY - _iMouseOffset.y);
                            
                        }else{
                            _bCanNotGoUp = true;
                            _bCanNotGoDown = false;
                            fadeSound("cart",0.5,0,100);
                        }
                    }else{
                        if(_aGrid[r][c] === 0 && _bCanNotGoDown === false){
                            _aBlock[i].setPos(_aBlock[i].getPosX() , iMouseY - _iMouseOffset.y);
                            
                        }else{
                            _bCanNotGoDown = true;
                            _bCanNotGoUp = false;
                            fadeSound("cart",0.5,0,100);
                        }
                    }
                }
                break;
            case "vertical_3":
                if(iMouseY - _iMouseOffset.y > START_Y_GRID && iMouseY - _iMouseOffset.y < START_Y_GRID+(CELL_HEIGHT*3+10)){
                    if(_iOldY <= iMouseY - _iMouseOffset.y){
                        if(_aGrid[r][c+2] === 0 && _bCanNotGoUp === false){
                            _aBlock[i].setPos(_aBlock[i].getPosX() , iMouseY - _iMouseOffset.y);
                            
                        }else{
                            _bCanNotGoUp = true;
                            _bCanNotGoDown = false;
                            fadeSound("cart",0.5,0,100);
                        }
                    }else{
                        if(_aGrid[r][c] === 0 && _bCanNotGoDown === false){
                            _aBlock[i].setPos(_aBlock[i].getPosX() , iMouseY - _iMouseOffset.y);
                            
                        }else{
                            _bCanNotGoDown = true;
                            _bCanNotGoUp = false;
                            fadeSound("cart",0.5,0,100);
                        }
                    }
                }
                break;
        }
    };
    
    this.releaseForm = function(event, startpos, szType, i){
        _bCanNotGoRight = false;
        _bCanNotGoLeft = false;
        _bCanNotGoUp = false;
        _bCanNotGoDown = false;
        var iX = _aBlock[i].getPosX();
        var iY = _aBlock[i].getPosY();
        var iModifierX = 0;
        var iModifierY = 0;
        var r = Math.round((iX-START_X_GRID)/CELL_WIDTH); 
        var c = Math.round((iY-START_Y_GRID)/CELL_HEIGHT);
        switch(szType){
            case "player":
            case "horizzontal_2":
                iModifierX = 2;
                break;
            case "horizzontal_3":
                iModifierX = 3;
                break;
            case "vertical_2":
                iModifierY = 2;
                break;
            case "vertical_3":
                iModifierY = 3;
                break;
        }
        var inewX;
        var inewY;
        if(this.checkPieceIfFitInPos( r, c, iModifierX, iModifierY ) === true){
            if(szType === "vertical_2" || szType === "vertical_3"){
                inewX = START_X_GRID+(CELL_WIDTH*r)-12;
                inewY = START_Y_GRID+(CELL_HEIGHT*c)-5;
            }else{
                inewX = START_X_GRID+(CELL_WIDTH*r)-5;
                inewY = START_Y_GRID+(CELL_HEIGHT*c)-5;
            }
            _aBlock[i].placeInGrid(inewX , inewY);
            var iOldR = Math.round((_iOldX-START_X_GRID)/CELL_WIDTH);
            var iOldC = Math.round((_iOldY-START_Y_GRID)/CELL_HEIGHT);
            if(iOldR !== r || iOldC !== c){
                _iMoves++;
                if(_iMoves <= _iGoal){
                    _iScore += 5*(_iLevel+1);
                }else{
                    _iScore -= 6*(_iLevel);
                }
                this._refreshScore();
            }
        }else{
            iX = _aBlock[i].getOldX();
            iY = _aBlock[i].getOldY();
            r = Math.round((iX-START_X_GRID)/CELL_WIDTH); 
            c = Math.round((iY-START_Y_GRID)/CELL_HEIGHT);
            _aBlock[i].goBack(iX , iY);
        }
        this._updateGrid(r, c, szType);
        if(szType === "player"){
            iX = _aBlock[i].getOldX();
            r = Math.round((iX-START_X_GRID)/CELL_WIDTH); 
            if(r === 4){
                _aBlock[i].moveOut();
               
                playSound("cart_exit",1,false);
                
            }
        }
        fadeSound("cart",0.5,0,100);
    };  
    
    this.checkPieceIfFitInPos = function( r, c, iXToAdd, iYToAdd ){
        var bFit = true;
        if(iXToAdd > 0){
            for ( var k = 0; k < iXToAdd; k++ ){
                if( _aGrid[k+r][c] !== 0 ){
                    bFit = false;
                    break;
                }
            }
        }else if(iYToAdd > 0){
            for ( var k = 0; k < iYToAdd; k++ ){
                if( _aGrid[r][k+c] !== 0 ){
                    bFit = false;
                    break;
                }
            }         
        }
       return bFit;
    };
    
    this._refreshScore = function(){
        _oInterface.refreshMoves(_iMoves, _iGoal);
        _oInterface.refreshScore(_iScore);
    };
    
    this.unload = function(){
        _oInterface.unload();
        if(_oEndPanel !== null){
            _oEndPanel.unload();
        }

        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren(); 
    };
 
    this.onExit = function(){
        this.unload();
        s_oMain.gotoMenu();
        
        if(_iLevel < NUM_LEVELS-1){
            $(s_oMain).trigger("end_level", iLevel);
        }
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
        $(s_oMain).trigger("save_score",iScore);
        setVolume("soundtrack",1);
    };
 
    this.onExitEndPanel = function(){
        this.unload();
        s_oMain.gotoMenu();
        
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
        $(s_oMain).trigger("save_score",iScore);
        setVolume("soundtrack",1);
    };
    
    
    this.onRestart = function(){
        for(var iRow=0; iRow < NUM_ROWS; iRow++){
            for(var iCol=0; iCol < NUM_COLS; iCol++){
                _aGrid[iRow][iCol] = 0;
            }
        } 
        var iX = 0;
        var iY = 0;
        for(var i=0; i < _iBlocksPlaced; i++){
            if(_aLevelInfo[i].obj_type === "vertical_2" || _aLevelInfo[i].obj_type === "vertical_3"){
                iX = START_X_GRID+(CELL_WIDTH*_aLevelInfo[i].obj_x)-12;
                iY = START_Y_GRID+(CELL_HEIGHT*_aLevelInfo[i].obj_y)-5;
            }else{
                iX = START_X_GRID+(CELL_WIDTH*_aLevelInfo[i].obj_x)-5;
                iY = START_Y_GRID+(CELL_HEIGHT*_aLevelInfo[i].obj_y)-5;
            }
            _aBlock[i].placeInGrid( iX, iY);
            this._updateGrid(_aLevelInfo[i].obj_x, _aLevelInfo[i].obj_y, _aLevelInfo[i].obj_type);
        }
        _iMoves = 0;
        _iScore = 0;
        this._refreshScore();
        $(s_oMain).trigger("restart_level",iLevel);
        $(s_oMain).trigger("show_interlevel_ad");
    };
    
    this.onNextLevel = function(iScore){
        if((_iLevel+1) === NUM_LEVELS){
            _bGameOver = true;
            this.gameOver();
        }else{
            this.unload();
            s_oMain.gotoGame(_iLevel+1, iScore+_iTotalScore);
        }
        setVolume("soundtrack",1);
        
    };

    this.gameOver = function(){ 
		$(s_oMain).trigger("save_score",_iScore);
        if(_bGameOver){
            $(s_oMain).trigger("end_level", iLevel);
            _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box_2'));
            _oEndPanel.show(_iLevel+1, _iScore+_iTotalScore);
        }else{
            $(s_oMain).trigger("end_level", iLevel);
            _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box_2'));
            _oEndPanel.nextLevel(_iMoves, _iLevel+1, _iGoal, _iScore);
            
            if(_iLevel+2 > s_iLastLevel){
                s_iLastLevel = _iLevel+2;
            }

            if(_iScore > s_aScore[_iLevel]){
                s_aScore[_iLevel] = _iScore;
            }

            var iNumStars;
            if(_iMoves >= _iGoal+5){
                iNumStars = 1;
            }else if(_iMoves >= _iGoal+2){
                iNumStars = 2;
            }else if(_iMoves < _iGoal+2){
                iNumStars = 3;
            }
            if(iNumStars > s_aStars[_iLevel]){
                s_aStars[_iLevel] = iNumStars;
            }
            s_oLocalStorage.saveData();
            
        }
    };
    
    this.update = function(){
        
    };

    s_oGame=this;
    
    _oParent=this;
    this._init();
}

var s_oGame;
