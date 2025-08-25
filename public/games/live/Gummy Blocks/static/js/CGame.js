function CGame(){
    var _bUpdate;
    var _iScore;
    
    
    var _oBoard;
    var _oInterface;
    var _oHelp;
    
    var _oGameOverPanel;
    
    
    this._init = function(){
        setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME );
        s_oPieceSettings = new CPieceSettings();

        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(oBg); 

        _oBoard = new CBoard(CANVAS_WIDTH/2,CANVAS_HEIGHT/2,s_oStage);

        _oInterface = new CInterface();
        
        _iScore = getScoreSaved();
        _oInterface.refreshScore(_iScore);
        // may be resuming saved game, so give score
        logEvent({event: "LEVEL_START", score: _iScore});

        _oGameOverPanel = new CGameOver();
  
        _oHelp = new CHelp();
        _oHelp.show();
        
        this.refreshButtonPos();

        _bUpdate = true;

    };
    
    
    this.unload = function(){
        _oInterface.unload();
       
        _oHelp.unload();

        s_oGame = null;
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren(); 
    };
    
    this.refreshButtonPos = function(){
       
        this.refreshGridScale();
        
        _oInterface.refreshButtonPos();
        
        
    };
    
    this.refreshGridScale = function(){
        var iMaxGridSizeHeight = (CANVAS_HEIGHT - (s_iOffsetY*2));
        CUR_GRID_SCALE = iMaxGridSizeHeight/MAX_TABLE_HEIGHT;

        
        if(CUR_GRID_SCALE <= 1){
            CUR_GRID_SCALE = parseFloat(CUR_GRID_SCALE.toFixed(2));
        }
        
        _oBoard.refreshGridScale();
        _oInterface.refreshGridScale();
    };
    
    this.restart = function(){
        logEvent({event: "LEVEL_RESTART"});
        _iScore = 0;
        _oInterface.refreshScore(_iScore);
        
        _oBoard.reset();
        
        _bUpdate = true;
    };
    
    this.refreshScore = function(iAmount){
        _iScore += iAmount;
        _oInterface.refreshScore(_iScore);
    };
    
    this.saveGameState = function(aCells,aPieces){
        saveScore(_iScore);
        saveBoardState(aCells);
        saveBoardPieces(aPieces);
    };
    
    this.gameOver = function(){
        logEvent({event: "LEVEL_FAILED", score: _iScore});

        if(s_iBestScore < _iScore){
            s_iBestScore = _iScore;
            _oInterface.refreshBestScore();
            saveBestScore(_iScore);
        }
        
        _oGameOverPanel.show(_iScore);
    };

   
    this.onExit = function(){
        this.unload();
        
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
        
        s_oMain.gotoMenu();
    };
    
    this.update = function(){
        if(_bUpdate){
            _oBoard.update();
        }
    };

    s_oGame = this;
    
    this._init();
}

var s_oGame = null;
var s_oHandEvaluator;