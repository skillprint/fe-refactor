function CLevelMenu(){
    
    var _bNumActive;
    
    var _aLevels = new Array();
    var _oModeNumOff;
    var _oModeNumOn;
    
    var _oBg;
    var _oButExit;
    var _oAudioToggle;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    
    this._init = function(){
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg)
        
        _bNumActive = false;
        
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('msg_box'));
        s_oStage.addChild(_oBg);
        
        var iWidth = 340;
        var iHeight = 60;
        var iX = CANVAS_WIDTH/2;
        var iY = 354;
        var oDifficultyTextStroke = new CTLText(s_oStage, 
                    iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                    50, "center", "#000000", FONT, 1,
                    2, 2,
                    TEXT_SELECT_LEVEL,
                    true, true, false,
                    false );
        oDifficultyTextStroke.setOutline(8);
        
        var iWidth = 340;
        var iHeight = 60;
        var iX = CANVAS_WIDTH/2;
        var iY = 354;
        var oDifficultyText = new CTLText(s_oStage, 
                    iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                    50, "center", "#ffc600", FONT, 1,
                    2, 2,
                    TEXT_SELECT_LEVEL,
                    true, true, false,
                    false );
        
        
        var oModePos = {x: CANVAS_WIDTH/2+70, y: 430};
        
        var offset_x = 0;
        var offset_y = 0;
        
        for(var i = 0; i < NUM_LEVELS; i++, offset_x += 90 ){
            if(offset_x > 300){
                offset_x = 0;
                offset_y += 90;
            }

            if( i < s_iLastLevel){
                _aLevels.push(new CLevelBut((oModePos.x - 200)+offset_x,oModePos.y+offset_y, s_oSpriteLibrary.getSprite('level_sprite'),true,i+1));
            }else{
                _aLevels.push(new CLevelBut((oModePos.x - 200)+offset_x,oModePos.y+offset_y, s_oSpriteLibrary.getSprite('level_sprite'),false,i+1));
            }
            if(i === 0){
                _aLevels[i].addEventListenerWithParams(ON_MOUSE_UP, this._onClickHelp, this, i);
            }else{
                _aLevels[i].addEventListenerWithParams(ON_MOUSE_UP, this._onClick, this, i);
            }
            s_bFirstTime = true;
            
            
            if(i<s_iLastLevel - 1){
                _aLevels[i].setStars(s_aStars[i]);
            }else if(i=== s_iLastLevel - 1){
                _aLevels[i].pulseAnimation();
            }
            
        }
        
        
        var oExitX;        
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        oExitX = CANVAS_WIDTH - (oSprite.width/2)- 110;
        _pStartPosAudio = {x: oExitX, y: (oSprite.height/2) + 10};
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);          
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
            _pStartPosFullscreen = {x: oSprite.width/4 + 10,y:oSprite.height/2 + 10};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
        
    };  
    
    this.unload = function(){
        for(var i = 0; i < NUM_LEVELS; i++ ){
            _aLevels[i].unload();
        }
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        s_oLevelMenu = null;
        s_oStage.removeAllChildren();        
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oButExit.setPosition(_pStartPosExit.x - iNewX,iNewY + _pStartPosExit.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }        
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX,_pStartPosFullscreen.y + iNewY);
        }
    };
    
    this._onNumModeToggle = function(iData){
        if(iData === NUM_ACTIVE){
            _bNumActive = true;
            _oModeNumOff.setActive(false);
            _oModeNumOn.setActive(true);
            
        }else {
            _bNumActive = false;
            _oModeNumOff.setActive(true);
            _oModeNumOn.setActive(false);
        }
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onClickHelp = function(i){
        var level = i;
        var clickable = _aLevels[i].ifClickable();
        if(clickable){
            s_oLevelMenu.unload();
            s_oMain.gotoHelp(level);
        } 
    };
    
    this._onClick = function(i){
        var level = i;
        var clickable = _aLevels[i].ifClickable();
        if(clickable){
            s_oLevelMenu.unload();
            s_oMain.gotoGame(level, 0);
        } 
    };
    
    this._onModeAdventure = function(){
            _oMode.setActive(true);
    };
     
    this._onExit = function(){
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
        s_oLevelMenu.unload();
        s_oMain.gotoMenu();
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
    
    s_oLevelMenu = this;        
    this._init();
    
    
    
};

var s_oLevelMenu = null;