function CHelpPanel(oSpriteBg){
    
    var _oBg;
    var _oGroup;
    var _oHelp;
    var _oHelpText;
    var _oButPlay;
    
    this._init = function(oSpriteBg){        
        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        
        _oBg = createBitmap(oSpriteBg);
             
        _oHelp = createBitmap(s_oSpriteLibrary.getSprite('bg_help'));
        _oHelp.x = CANVAS_WIDTH/2-180;
        _oHelp.y = CANVAS_HEIGHT/2-150;

        _oGroup = new createjs.Container();
     
        _oGroup.addChild(oBg, _oBg, _oHelp);
        
        _oHelpText = new CComic(CANVAS_WIDTH/2-50, CANVAS_HEIGHT/2+180, _oGroup, TEXT_HELP, 1);
        
        _oGroup.alpha = 0;
        s_oStage.addChild(_oGroup);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_play_small');
        _oButPlay = new CGfxButton((CANVAS_WIDTH/2+160),CANVAS_HEIGHT -270,oSprite,_oGroup);
                
        var oParent = this;
        createjs.Tween.get(_oGroup).to({alpha:1 }, 500).call(function() {
            _oButPlay.addEventListener(ON_MOUSE_DOWN, oParent._onButPlayRelease, this);
        });
    };
    
    this._onButPlayRelease = function(){
        _oButPlay.unload();
        s_oStage.removeChild(_oGroup);
        s_oMain.gotoGame(0, 0);
    };
    
    this._init(oSpriteBg);
    
    return this;
}
