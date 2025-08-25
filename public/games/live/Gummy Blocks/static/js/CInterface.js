function CInterface(){
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _oAudioToggle;
    var _oButFullscreen;
    var _oButExit;
    var _oButRestart;
    var _oGUIExpandible;
    var _oScoreText;
    var _oBestScoreText;
    var _oAreYouSurePanel;
    var _oRollingScore;
    var _oContainerScore;
    
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _pStartPosRestart;
    var _pStartPosScore;
    
    this._init = function(){    
        _pStartPosScore = {x:CANVAS_WIDTH/2,y:120};
        _oContainerScore = new createjs.Container();
        _oContainerScore.x = _pStartPosScore.x;
        _oContainerScore.y = _pStartPosScore.y;
        s_oStage.addChild(_oContainerScore);
        
        var oScoreBg = createBitmap(s_oSpriteLibrary.getSprite("score_panel"));
        _oContainerScore.addChild(oScoreBg);
        
        _oScoreText =  new CTLText(_oContainerScore, 
                    oScoreBg.x+100, oScoreBg.y, 250, 110, 
                    80, "right", "#fff", FONT, 1,
                    0, 0,
                    "0",
                    true, true, false,
                    false );

        
        
        var oBestBg = createBitmap(s_oSpriteLibrary.getSprite("rank_panel"));
        oBestBg.x = 500;
        _oContainerScore.addChild(oBestBg);
        
        _oBestScoreText =  new CTLText(_oContainerScore, 
                    oBestBg.x+100, oBestBg.y, 250, 110, 
                    80, "right", "#fff", FONT, 1,
                    0, 0,
                    ""+s_iBestScore,
                    true, true, false,
                    false );

                    

        
        _oContainerScore.regX = _oContainerScore.getBounds().width/2;
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
	_pStartPosExit = {x:CANVAS_WIDTH - (oSprite.width/2) -10,y:(oSprite.height/2) +10};
        _oButExit = new CGfxButton(_pStartPosExit.x,_pStartPosExit.y,oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _pStartPosAudio = {x:_pStartPosExit.x - oSprite.width,y:_pStartPosExit.y}
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            
            _pStartPosFullscreen = {x: _pStartPosAudio.x - oSprite.width/2,y:_pStartPosAudio.y};
        }else{
            _pStartPosFullscreen = {x:_pStartPosExit.x - oSprite.width,y:_pStartPosExit.y}
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }

        
        _pStartPosRestart = {x:CANVAS_WIDTH - (oSprite.width/2) -10,y:_pStartPosExit.y};
        _oButRestart = new CGfxButton(_pStartPosRestart.x,_pStartPosRestart.y,s_oSpriteLibrary.getSprite("but_restart"),s_oStage);
        _oButRestart.addEventListener(ON_MOUSE_UP,this._onRestart,this);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_settings');
        _oGUIExpandible = new CGUIExpandible(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oGUIExpandible.addButton(_oButExit);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oGUIExpandible.addButton(_oAudioToggle);
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oGUIExpandible.addButton(_oButFullscreen);
        }

        _oGUIExpandible.addButton(_oButRestart);
        
        _oRollingScore = new CRollingScore();
        
        _oAreYouSurePanel = new CAreYouSurePanel(s_oStage);
    };
    
    this.unload = function(){
        _oGUIExpandible.unload();
        _oAreYouSurePanel.unload();
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        if (_fRequestFullScreen && screenfull.enabled){
                _oButFullscreen.unload();
        }
        
        _oButExit.unload();
        _oButRestart.unload();

        s_oInterface = null;
    };
        
    this.refreshButtonPos = function(){
        _oGUIExpandible.refreshPos();
        _oContainerScore.y = _pStartPosScore.y + s_iOffsetY;
    };
    
    this.refreshGridScale = function(){
        _oContainerScore.scaleX = _oContainerScore.scaleY = CUR_GRID_SCALE;
    };
    
    this.refreshScore = function(iScore){
        _oRollingScore.rolling(_oScoreText.getText(), null, iScore);
    };
    
    this.refreshBestScore = function(){
        _oBestScoreText.refreshText(s_iBestScore);
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onExit = function(){
        _oAreYouSurePanel.show(TEXT_ARE_YOU_SURE);
        _oAreYouSurePanel.addEventListener(ON_BUT_YES_DOWN,s_oGame.onExit,s_oGame);
    };

    this.resetFullscreenBut = function(){
        if (_fRequestFullScreen && screenfull.enabled){
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
    
    this._onRestart = function(){
        _oAreYouSurePanel.show(TEXT_ARE_YOU_SURE_RESTART);
        _oAreYouSurePanel.addEventListener(ON_BUT_YES_DOWN,s_oGame.restart,s_oGame);
    };
    
    this._onConfirm = function(){
        
    };

    s_oInterface = this;
    
    this._init();
    
    return this;
}

var s_oInterface = null;