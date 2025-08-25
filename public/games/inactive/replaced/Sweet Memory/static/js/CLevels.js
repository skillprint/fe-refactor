var CLevels = (function(){
	var _iUpMargin = CARD_HEIGHT/2 + CANVAS_HEIGHT*0.2;
	var _iEffectiveCentreX = CANVAS_WIDTH/2;
	var _iEffectiveCentreY = (CANVAS_HEIGHT - _iUpMargin)/2 + _iUpMargin;
	var _iEffectiveCanvasHeight = CANVAS_HEIGHT - _iUpMargin;
	var _iCardPadding = 30;

	// send level data
	var getLevelData = function(iLevel){

		var _iCardsNum = s_aCardsPerLevel[iLevel - 1];
                
                if(_iCardsNum > MAX_CARDS){
                    _iCardsNum = MAX_CARDS;
                }
                
		var _oLevel = {
			cardZoomFactor : 1,
			cardsNum : _iCardsNum,
			cardsPos : [],
			timeAllotted : s_aSecsPerLevel[iLevel - 1] * 1000
		}
		for (var scaling = 1; scaling >= 0.1; scaling -= 0.01) {

			for (var rows = 2; rows <= 6; rows += 1) {

				var _iCardsPerRow = _iCardsNum/rows;

				if (_iCardsPerRow*(CARD_WIDTH*scaling + _iCardPadding*scaling) <= CANVAS_WIDTH &&
					(rows)*(CARD_HEIGHT*scaling+_iCardPadding*scaling) <= _iEffectiveCanvasHeight &&
					_iCardsNum%rows === 0) {

					var _iXShift = _iEffectiveCentreX - (_iCardsPerRow - 1)*(CARD_WIDTH*scaling+_iCardPadding*scaling)*0.5;
					var _iYShift = _iEffectiveCentreY - (_iUpMargin + ((CARD_HEIGHT*scaling+_iCardPadding*scaling)*(rows-1) + _iUpMargin)*0.5);

					for (var i = 0; i < rows; i++) {
						for (var j = 0; j < _iCardsPerRow; j++) {
							_oLevel.cardsPos[i*_iCardsPerRow + j] = [_iXShift+(CARD_WIDTH*scaling+_iCardPadding*scaling)*j,
																	 _iYShift + _iUpMargin+(CARD_HEIGHT*scaling+_iCardPadding*scaling)*i];
						};
					};

					_oLevel.cardZoomFactor = scaling;
					return _oLevel;
				};
			};
		};

	};

	return getLevelData;
})();