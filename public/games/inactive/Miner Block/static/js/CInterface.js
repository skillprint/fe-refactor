function CInterface(iGoal, iLevel, iScore){
    var _oAudioToggle;
    var _oButExit;
    var _oButRestart;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _oHelpPanel=null;
    
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosRestart;
    var _pStartPosFullscreen;
    
    var _oAreYouSurePanel;
    var _oMovesText;
    var _oMovesTextStroke;
    var _oMovesPos          = {x: CANVAS_WIDTH/2+50, y: CANVAS_HEIGHT-100};
    var _oScoreText;
    var _oScoreTextStroke;
    var _oScorePos          = {x: CANVAS_WIDTH/2-290, y: CANVAS_HEIGHT-100};
    
    var _oLevelTextStroke;
    var _oLevelText;
    var _oLevelPos          = {x: CANVAS_WIDTH/2-290, y: 40};
    
    this._init = function(iGoal, iLevel, iScore){                
        var oExitX;        
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height/2)-10, y: (oSprite.height/2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_restart');
        _pStartPosRestart = {x: _pStartPosExit.x-(oSprite.width) , y: (oSprite.height/2) + 10};
        _oButRestart = new CGfxButton(_pStartPosRestart.x, _pStartPosRestart.y, oSprite, s_oStage);
        _oButRestart.addEventListener(ON_MOUSE_UP, this._onRestart, this);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosRestart.x - oSprite.width/2 , y: (oSprite.height/2) + 10};
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);     
            
            _pStartPosFullscreen = {x:_pStartPosAudio.x - oSprite.width/2 ,y:oSprite.height/2 + 10};
        }else{
            _pStartPosFullscreen = {x: _pStartPosRestart.x - oSprite.width/2 , y: (oSprite.height/2) + 10};
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        
        
        _oMovesTextStroke = new createjs.Text(TEXT_MOVES+": 0/"+iGoal," 40px "+FONT, "#000000");
        _oMovesTextStroke.x = _oMovesPos.x;
        _oMovesTextStroke.y = _oMovesPos.y;
        _oMovesTextStroke.textAlign = "left";
        _oMovesTextStroke.textBaseline = "alphabetic";
        _oMovesTextStroke.lineWidth = 650;
        _oMovesTextStroke.outline = 8;
        s_oStage.addChild(_oMovesTextStroke); //Draws on canvas

        _oMovesText = new createjs.Text(TEXT_MOVES+": 0/"+iGoal," 40px "+FONT, "#ffc600");
        _oMovesText.x = _oMovesPos.x;
        _oMovesText.y = _oMovesPos.y;
        _oMovesText.textAlign = "left";
        _oMovesText.textBaseline = "alphabetic";
        _oMovesText.lineWidth = 650;
        s_oStage.addChild(_oMovesText); //Draws on canvas
        
        _oScoreTextStroke = new createjs.Text(TEXT_SCORE+": "+iScore," 40px "+FONT, "#000000");
        _oScoreTextStroke.x = _oScorePos.x;
        _oScoreTextStroke.y = _oScorePos.y;
        _oScoreTextStroke.textAlign = "left";
        _oScoreTextStroke.textBaseline = "alphabetic";
        _oScoreTextStroke.lineWidth = 650;
        _oScoreTextStroke.outline = 8;
        s_oStage.addChild(_oScoreTextStroke); //Draws on canvas

        _oScoreText = new createjs.Text(TEXT_SCORE+": "+iScore," 40px "+FONT, "#ffc600");
        _oScoreText.x = _oScorePos.x;
        _oScoreText.y = _oScorePos.y;
        _oScoreText.textAlign = "left";
        _oScoreText.textBaseline = "alphabetic";
        _oScoreText.lineWidth = 650;
        s_oStage.addChild(_oScoreText); 
        
        _oLevelTextStroke = new createjs.Text(TEXT_LEVEL+": "+iLevel," 30px "+FONT, "#000000");
        _oLevelTextStroke.x = _oLevelPos.x;
        _oLevelTextStroke.y = _oLevelPos.y;
        _oLevelTextStroke.textAlign = "left";
        _oLevelTextStroke.textBaseline = "alphabetic";
        _oLevelTextStroke.lineWidth = 650;
        _oLevelTextStroke.outline = 8;
        s_oStage.addChild(_oLevelTextStroke); 

        _oLevelText = new createjs.Text(TEXT_LEVEL+": "+iLevel," 30px "+FONT, "#ffc600");
        _oLevelText.x = _oLevelPos.x;
        _oLevelText.y = _oLevelPos.y;
        _oLevelText.textAlign = "left";
        _oLevelText.textBaseline = "alphabetic";
        _oLevelText.lineWidth = 650;
        s_oStage.addChild(_oLevelText); //Draws on canvas
        
        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        _oAreYouSurePanel = new CAreYouSurePanel(oSprite, s_oStage);
        _oAreYouSurePanel.addEventListener(ON_CONFIRM, this._onConfirmExit, this);
        
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.refreshMoves = function(iMoves, iGoal){
        _oMovesTextStroke.text = TEXT_MOVES+": "+iMoves+"/"+iGoal;
        _oMovesText.text = TEXT_MOVES+": "+iMoves+"/"+iGoal;
    };
    
    this.refreshScore = function(iScore){
        _oScoreTextStroke.text = TEXT_SCORE+": "+iScore;
        _oScoreText.text = TEXT_SCORE+": "+iScore;
    }
    
    this.unload = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        
        _oButExit.unload();
        _oButRestart.unload();
        
        if(_oHelpPanel!==null){
            _oHelpPanel.unload();
        }
        _oAreYouSurePanel.unload();
        s_oInterface = null;
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oButExit.setPosition(_pStartPosExit.x - iNewX,iNewY + _pStartPosExit.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }   
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x - iNewX,_pStartPosFullscreen.y + iNewY);
        }
        
        _oButRestart.setPosition(_pStartPosRestart.x - iNewX,iNewY + _pStartPosRestart.y);
        _oMovesTextStroke.x = _oMovesPos.x-iNewX;
        _oMovesText.x = _oMovesPos.x-iNewX;
        _oScoreTextStroke.x = _oScorePos.x+iNewX;
        _oScoreText.x = _oScorePos.x+iNewX;
        _oLevelTextStroke.x = _oLevelPos.x+iNewX;
        _oLevelText.x = _oLevelPos.x+iNewX;
        _oLevelTextStroke.y = _oLevelPos.y + iNewY;
        _oLevelText.y = _oLevelPos.y + iNewY;
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onExit = function(){
        _oAreYouSurePanel.show();
    };
    
    this._onConfirmExit = function(){
        s_oGame.onExit();  
    };
    
    this._onRestart = function(){
        s_oGame.onRestart();  
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.isEnabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };

    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };
    
    s_oInterface = this;
    
    this._init(iGoal, iLevel, iScore);
    
    return this;
}

var s_oInterface = null;