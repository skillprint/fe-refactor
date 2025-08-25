function CScoreText (x,y,iScore){
    
    var _oScoreHit;
    
    this._init = function(x,y,iScore){
        _oScoreHit = new createjs.Text("+"+iScore," 30px "+FONT_GAME, "#d7d5d2");
        _oScoreHit.textAlign="center";
        _oScoreHit.x = x;
        _oScoreHit.y = y;
        _oScoreHit.alpha = 0;
        _oScoreHit.shadow = new createjs.Shadow("#000000", 2, 2, 2);
        s_oStage.addChild(_oScoreHit);
        
        var oParent = this;
        createjs.Tween.get(_oScoreHit).to({alpha:1}, 400, createjs.Ease.quadIn).call(function(){oParent.moveUp();});  
    };
	
    this.moveUp = function(){
        var iNewY = _oScoreHit.y-100;
        var oParent = this;
        createjs.Tween.get(_oScoreHit).to({y:iNewY}, 1000, createjs.Ease.sineIn).call(function(){oParent.unload();});
        createjs.Tween.get(_oScoreHit).wait(500).to({alpha:0}, 500);
    };
	
    this.unload = function(){
        s_oStage.removeChild(_oScoreHit);
    };
	
    this._init(x,y,iScore);
    
}