function CHelp(){
    var _oListener;

    var _oFade;
    var _oContainer;

    var _oThis = this;
    
    this._init = function(){
        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        s_oStage.addChild(_oContainer);
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("rgba(0,0,0,0.7)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oContainer.addChild(_oFade);
        
        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box_help');
        var oBg = createBitmap(oSpriteBg);
        oBg.regX = oSpriteBg.width/2;
        oBg.regY = oSpriteBg.height/2;
        oBg.x = CANVAS_WIDTH/2;
        oBg.y = CANVAS_HEIGHT/2;
        _oContainer.addChild(oBg);
        
        var oText = new CTLText(_oContainer, 
                    CANVAS_WIDTH/2-300, CANVAS_HEIGHT/2+50,600 , 200, 
                    80, "center", "#fff", FONT, 1,
                    0, 0,
                    TEXT_HELP,
                    true, true, true,
                    false );
                    

        
        _oListener = _oContainer.on("click", this._onSkip,this);
    };
    
    this.unload = function(){
        _oContainer.off("click",_oListener);
    };
    
    this.show = function(){
        _oContainer.visible = true;
        _oContainer.alpha = 0;
        createjs.Tween.get(_oContainer).to({alpha:1}, 500, createjs.Ease.cubicOut);
    };
    
    this.hide = function(){
        createjs.Tween.get(_oContainer).to({alpha:0}, 500, createjs.Ease.cubicOut).call(function(){_oContainer.visible = false;});
    };
    
    this._onSkip = function(){
        _oThis.hide();
    };
    
    this._init();
    
}