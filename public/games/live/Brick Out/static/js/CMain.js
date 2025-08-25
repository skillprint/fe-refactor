function CMain(oData) {
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;
    var _oPreloader;
    var _oMenu;
    var _oGame;
    var _oLevelMenu;

    this.initContainer = function () {
        s_oCanvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(s_oCanvas);
        createjs.Touch.enable(s_oStage);

        s_bMobile = jQuery.browser.mobile;
        if (s_bMobile === false) {
            s_oStage.enableMouseOver(20);
            $('body').on('contextmenu', '#canvas', function (e) {
                return false;
            });
        }

        s_iPrevTime = new Date().getTime();

        createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.framerate = 30;

        if (navigator.userAgent.match(/Windows Phone/i)) {
            DISABLE_SOUND_MOBILE = true;
        }

        s_oSpriteLibrary = new CSpriteLibrary();

        //ADD PRELOADER
        _oPreloader = new CPreloader();
    };
    
    this.setLocalStorageLevel = function(iLevel){
        var iSavedLevel = getItem(GAME_NAME+"_level");
        if(iSavedLevel === null || iSavedLevel < iLevel){
            s_iLastLevel = iLevel;
            saveItem(GAME_NAME+"_level", s_iLastLevel);
        }
    };
    
    this.setLocalStorageScore = function(iCurScore,iLevel){
        saveItem(GAME_NAME+"_score_level_"+iLevel, iCurScore);
    };
    
    this.clearLocalStorage = function(){
        s_iLastLevel = 1;
        if(s_bStorageAvailable){
            var iCont = 0;
            while(iCont < localStorage.length){
                var szKey = localStorage.key(iCont);
                if(szKey.indexOf(GAME_NAME) !== -1){
                    localStorage.removeItem(szKey);
                }else{
                    iCont++;
                }
            }
        }
    };
	
    
    this.getScoreTillLevel = function(iLevel){
        if(!s_bStorageAvailable){
            return 0;
        }
        
        var iScore = 0;
        
        for(var i=0;i<iLevel-1;i++){
            iScore += parseInt(getItem(GAME_NAME+"_score_level_"+(i+1) ));
        }
        
        return iScore;
    };
    
    this.getScoreLevel = function(iLevel){
        return getItem(GAME_NAME+"_score_level_"+(iLevel+1) );
    };
    
    this.getSavedLevel = function(){
        if(!s_bStorageAvailable){
            return 1;
        }
        
        var iSavedLevel = getItem(GAME_NAME+"_level");
        if(iSavedLevel === null){
            return 1;
        }else{
            return iSavedLevel;
        }
    };

    this.preloaderReady = function () {
        this._loadImages();
        
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            this._initSounds();
        }

        
        _bUpdate = true;
    };

    this.soundLoaded = function () {
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource / RESOURCE_TO_LOAD * 100);
        _oPreloader.refreshLoader(iPerc);

    };
    
    this._initSounds = function(){
        Howler.mute(!s_bAudioActive);


        s_aSoundsInfo = new Array();
        s_aSoundsInfo.push({path: './sounds/',filename:'game_completed',loop:false,volume:1, ingamename: 'game_completed'});
        s_aSoundsInfo.push({path: './sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'});
        s_aSoundsInfo.push({path: './sounds/',filename:'game_over',loop:false,volume:1, ingamename: 'game_over'});
        s_aSoundsInfo.push({path: './sounds/',filename:'boing',loop:false,volume:1, ingamename: 'boing'});
        s_aSoundsInfo.push({path: './sounds/',filename:'ball_lose',loop:false,volume:1, ingamename: 'ball_lose'});
        s_aSoundsInfo.push({path: './sounds/',filename:'fireball',loop:true,volume:1, ingamename: 'fireball'});
        s_aSoundsInfo.push({path: './sounds/',filename:'brick_crack',loop:false,volume:1, ingamename: 'brick_crack'});
        s_aSoundsInfo.push({path: './sounds/',filename:'brick_explosion',loop:false,volume:1, ingamename: 'brick_explosion'});
        s_aSoundsInfo.push({path: './sounds/',filename:'brick_metal',loop:false,volume:1, ingamename: 'brick_metal'});
        s_aSoundsInfo.push({path: './sounds/',filename:'power_up_bonus',loop:false,volume:1, ingamename: 'power_up_bonus'});
        s_aSoundsInfo.push({path: './sounds/',filename:'power_up_malus',loop:false,volume:1, ingamename: 'power_up_malus'});
        s_aSoundsInfo.push({path: './sounds/',filename:'stage_clear',loop:false,volume:1, ingamename: 'stage_clear'});
        s_aSoundsInfo.push({path: './sounds/',filename:'bullet',loop:false,volume:1, ingamename: 'bullet'});
        s_aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        
        RESOURCE_TO_LOAD += s_aSoundsInfo.length;

        s_aSounds = new Array();
        for(var i=0; i<s_aSoundsInfo.length; i++){
            this.tryToLoadSound(s_aSoundsInfo[i], false);
        }
    };  
    
    this.tryToLoadSound = function(oSoundInfo, bDelay){
        
       setTimeout(function(){        
            s_aSounds[oSoundInfo.ingamename] = new Howl({ 
                                                            src: [oSoundInfo.path+oSoundInfo.filename+'.mp3'],
                                                            autoplay: false,
                                                            preload: true,
                                                            loop: oSoundInfo.loop, 
                                                            volume: oSoundInfo.volume,
                                                            onload: s_oMain.soundLoaded,
                                                            onloaderror: function(szId,szMsg){
                                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                         s_oMain.tryToLoadSound(s_aSoundsInfo[i], true);
                                                                                         break;
                                                                                     }
                                                                                }
                                                                        },
                                                            onplayerror: function(szId) {
                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                          s_aSounds[s_aSoundsInfo[i].ingamename].once('unlock', function() {
                                                                                            s_aSounds[s_aSoundsInfo[i].ingamename].play();
                                                                                            if(s_aSoundsInfo[i].ingamename === "soundtrack" && s_oGame !== null){
                                                                                                setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME);
                                                                                            }

                                                                                          });
                                                                                         break;
                                                                                     }
                                                                                 }
                                                                       
                                                            } 
                                                        });

            
        }, (bDelay ? 200 : 0) );
        
        
    };


    this._loadImages = function () {
        s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);

        s_oSpriteLibrary.addSprite("bg_menu", "./sprites/bg_menu.jpg");
        s_oSpriteLibrary.addSprite("msg_box", "./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("bg_level_1", "./sprites/bg_level_1.jpg");

        s_oSpriteLibrary.addSprite("paddle", "./sprites/paddle.png");
        s_oSpriteLibrary.addSprite("paddle_magnet", "./sprites/paddle_magnet.png");
        s_oSpriteLibrary.addSprite("cannons", "./sprites/cannons.png");

        s_oSpriteLibrary.addSprite("but_exit", "./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("but_pause", "./sprites/but_pause.png");
        s_oSpriteLibrary.addSprite("icon_audio", "./sprites/icon_audio.png");

        s_oSpriteLibrary.addSprite("but_play", "./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("but_restart", "./sprites/but_restart.png");
        s_oSpriteLibrary.addSprite("but_continue", "./sprites/but_continue.png");
        s_oSpriteLibrary.addSprite("but_level", "./sprites/but_level.png");

        s_oSpriteLibrary.addSprite("powerup_edge", "./sprites/powerup_edge.png");
        s_oSpriteLibrary.addSprite("up_edges", "./sprites/up_edges.png");
        s_oSpriteLibrary.addSprite("normal_ball", "./sprites/normal_ball.png");
        s_oSpriteLibrary.addSprite("fire_ball", "./sprites/fire_ball.png");
        s_oSpriteLibrary.addSprite("iron_ball", "./sprites/iron_ball.png");

        s_oSpriteLibrary.addSprite("bullet", "./sprites/bullet.png");
        s_oSpriteLibrary.addSprite("but_yes", "./sprites/but_yes.png");
        s_oSpriteLibrary.addSprite("but_no", "./sprites/but_no.png");

        s_oSpriteLibrary.addSprite("life", "./sprites/life.png");
        s_oSpriteLibrary.addSprite("ctl_logo", "./sprites/ctl_logo.png");
        s_oSpriteLibrary.addSprite("but_credits", "./sprites/but_credits.png");
        s_oSpriteLibrary.addSprite("but_fullscreen", "./sprites/but_fullscreen.png");
        s_oSpriteLibrary.addSprite("but_clear_save", "./sprites/but_clear_save.png");

        for (var i = 0; i < TYPES_OF_BRICK; i++) {
            s_oSpriteLibrary.addSprite("brick" + i, "./sprites/brick" + i + ".png");
        }

        for (var i = 0; i < TYPES_OF_BONUS; i++) {
            s_oSpriteLibrary.addSprite("bonus" + i, "./sprites/bonus" + i + ".png");
            ;
        }

        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };

    this._onImagesLoaded = function () {
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource / RESOURCE_TO_LOAD * 100);
        _oPreloader.refreshLoader(iPerc);
    };

    this._onAllImagesLoaded = function () {
        
    };

    this._onRemovePreloader = function(){
        _oPreloader.unload();
        
        try{
            saveItem("ls_available","ok");
            s_iLastLevel = this.getSavedLevel();
        }catch(evt){
            // localStorage not defined
            s_bStorageAvailable = false;
        }
        

        s_oSoundTrack = playSound("soundtrack", 1,true);
        
        

        this.gotoMenu();
    };
    
    this.gotoMenu = function () {
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };
    
    this.levelSelected = function(iLevel){
        s_iLevelSelected = iLevel;
        _oLevelMenu.unload();
        if(iLevel >= s_iLastLevel){
            s_iLastLevel = iLevel;
        }

        s_oMain.gotoGame(iLevel); 
    };

    this.gotoGame = function (iLevel) {
        _oGame = new CGame(_oData, iLevel);
        _iState = STATE_GAME;
        logEvent({event:"LEVEL_START", level:iLevel});
        $(s_oMain).trigger("game_start");
    };

    this.gotoLevelMenu = function () {
        _oLevelMenu = new CLevelMenu(_oData);
        _iState = STATE_MENU;
    };

    this.stopUpdate = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
        $("#block_game").css("display","block");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            Howler.mute(true);
        }
        
    };

    this.startUpdate = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        $("#block_game").css("display","none");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            if(s_bAudioActive){
                Howler.mute(false);
            }
        }
        
    };
    
     this.stopUpdateNoBlock = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
    };

    this.startUpdateNoBlock = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false; 
    };

    this._update = function (event) {
        if (_bUpdate === false) {
            return;
        }
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;

        if (s_iCntTime >= 1000) {
            s_iCurFps = s_iCntFps;
            s_iCntTime -= 1000;
            s_iCntFps = 0;
        }

        if (_iState === STATE_GAME) {
            _oGame.update();
        }

        s_oStage.update(event);

    };

    s_oMain = this;

    _oData = oData;
    ENABLE_FULLSCREEN = oData.fullscreen;
    ENABLE_CHECK_ORIENTATION = oData.check_orientation;
    s_bAudioActive = oData.audio_enable_on_startup;


    this.initContainer();
}

var s_bMobile;
var s_bAudioActive = true;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;

var s_iLastLevel = 1;

var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oSoundTrack = null;
var s_oCanvas;

var s_bFullscreen = false;
var s_aSounds;
var s_bStorageAvailable = true;
var s_aSoundsInfo;