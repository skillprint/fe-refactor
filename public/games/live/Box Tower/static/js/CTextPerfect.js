function CTextPerfect(oParentContainer) {

    var _oParentContainer = oParentContainer;

    var _oStartPoint;
    var _oEndPoint;
    var _oText;
    var _oTextStroke;
    var _oContainer;

    this._init = function () {
        _oContainer = new createjs.Container();
        _oParentContainer.addChild(_oContainer);
        
        
        _oTextStroke = new CTLText(_oContainer, 
                    -350, -200, 700, 100, 
                    100, "center", TEXT_COLOR_STROKE, FONT_GAME, 1,
                    0, 0,
                    TEXT_PERFECT,
                    true, true, false,
                    false );
                    
       
        _oTextStroke.setOutline(3);
        
        _oText = new CTLText(_oContainer, 
                    -350, -200, 700, 100, 
                    100, "center", TEXT_COLOR, FONT_GAME, 1,
                    0, 0,
                    TEXT_PERFECT,
                    true, true, false,
                    false );



        _oStartPoint = {x: PERFECT_TEXT_START_POINT.x, y: PERFECT_TEXT_START_POINT.y - s_iOffsetY};
        _oEndPoint = {x: PERFECT_TEXT_END_POINT.x, y: PERFECT_TEXT_END_POINT.y - s_iOffsetY};
    };

    this.updatePoints = function (iNewX, iNewY) {
        _oStartPoint.y = PERFECT_TEXT_START_POINT.y - iNewY;
        _oEndPoint.y = PERFECT_TEXT_END_POINT.y - iNewY;
    };

    this.animText = function () {
        _oContainer.x = _oStartPoint.x;
        _oContainer.y = _oStartPoint.y;
        _oContainer.visible = true;
        _oContainer.alpha = 1;
        createjs.Tween.get(_oContainer, {override: true}).to({x: _oEndPoint.x, y: _oEndPoint.y, alpha: 0}
        , MS_PERFECT_TEXT, createjs.Ease.cubicOut).set({visible: false});
    };

    this._init();

    return this;
}