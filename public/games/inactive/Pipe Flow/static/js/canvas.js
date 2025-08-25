////////////////////////////////////////////////////////////
// CANVAS
////////////////////////////////////////////////////////////
var stage
var canvasW=0;
var canvasH=0;

/*!
 * 
 * START GAME CANVAS - This is the function that runs to setup game canvas
 * 
 */
function initGameCanvas(w,h){
	var gameCanvas = document.getElementById("gameCanvas");
	gameCanvas.width = w;
	gameCanvas.height = h;
	
	canvasW=w;
	canvasH=h;
	stage = new createjs.Stage("gameCanvas");
	
	createjs.Touch.enable(stage);
	stage.enableMouseOver(20);
	stage.mouseMoveOutside = true;
	
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", tick);	
}

var guide = false;
var canvasContainer, mainContainer, selectContainer, gameContainer, rectContainer, editContainer, resultContainer, confirmContainer;
var guideline, bg, logo, buttonStart, buttonRestart, buttonFacebook, buttonTwitter, buttonWhatsapp, buttonFullscreen, buttonSoundOn, buttonSoundOff;

$.selectStage = {};
$.pipe = {};

/*!
 * 
 * BUILD GAME CANVAS ASSERTS - This is the function that runs to build game canvas asserts
 * 
 */
function buildGameCanvas(){
	canvasContainer = new createjs.Container();
	mainContainer = new createjs.Container();
	selectContainer = new createjs.Container();
	pipeStartContainer = new createjs.Container();
	pipeDivideContainer = new createjs.Container();
	pipeContainer = new createjs.Container();
	gameContainer = new createjs.Container();
	gameDisplayContainer = new createjs.Container();
	strokeContainer = new createjs.Container();
	rectContainer = new createjs.Container();
	editContainer = new createjs.Container();
	resultContainer = new createjs.Container();
	confirmContainer = new createjs.Container();
	optionsContainer = new createjs.Container();
	
	bg = new createjs.Bitmap(loader.getResult('background'));
	logo = new createjs.Bitmap(loader.getResult('logo'));
	
	buttonStart = new createjs.Bitmap(loader.getResult('buttonStart'));
	centerReg(buttonStart);
	buttonStart.x = canvasW/2;
	buttonStart.y = canvasH/100 * 55;
	
	//select
	buttonPrev = new createjs.Bitmap(loader.getResult('buttonPrev'));
	centerReg(buttonPrev);
	
	buttonNext = new createjs.Bitmap(loader.getResult('buttonNext'));
	centerReg(buttonNext);
	
	buttonPrev.x = canvasW/100 * 30;
	buttonPrev.y = canvasH/100 * 75;
	
	buttonNext.x = canvasW/100 * 70;
	buttonNext.y = canvasH/100 * 75;
	
	itemSelect = new createjs.Bitmap(loader.getResult('itemSelect'));
	centerReg(itemSelect);
	itemSelect.x = canvasW/2;
	itemSelect.y = canvasH/2;
	
	itemSelectLogo = new createjs.Bitmap(loader.getResult('itemLogo'));
	centerReg(itemSelectLogo);
	itemSelectLogo.x = canvasW/2;
	itemSelectLogo.y = canvasH/100 * 17;
	
	selectContainer.addChild(itemSelect, itemSelectLogo, buttonPrev, buttonNext);
	
	var colCount = 1;
	var rowCount = 1;
	var startX = canvasW/100 * 24;
	var startY = canvasH/100 * 30;
	var curX = startX;
	var curY = startY;
	var spaceX = 100;
	var spaceY = 110;
	
	for(var n=0;n<levels_arr.length;n++){
		$.selectStage['icon_'+n] = new createjs.Bitmap(loader.getResult('iconLevel'));
		centerReg($.selectStage['icon_'+n]);
		createHitarea($.selectStage['icon_'+n]);
		
		$.selectStage['iconLock_'+n] = new createjs.Bitmap(loader.getResult('iconLevelLock'));
		centerReg($.selectStage['iconLock_'+n]);
		createHitarea($.selectStage['iconLock_'+n]);
		
		$.selectStage['iconText_'+n] = new createjs.Text();
		$.selectStage['iconText_'+n].font = "40px commandocommando";
		$.selectStage['iconText_'+n].color = "#fff";
		$.selectStage['iconText_'+n].textAlign = "center";
		$.selectStage['iconText_'+n].textBaseline='alphabetic';
		$.selectStage['iconText_'+n].text = n+1;
		
		$.selectStage['icon_'+n].x = $.selectStage['iconLock_'+n].x = $.selectStage['iconText_'+n].x = curX;
		$.selectStage['icon_'+n].y = $.selectStage['iconLock_'+n].y = curY;
		$.selectStage['iconText_'+n].y = curY+10;
		
		curX += spaceX;
		colCount++;
		if(colCount>5){
			colCount = 1;
			curX = startX;
			curY += spaceY;
			rowCount++;
		}
		
		if(rowCount > 4){
			rowCount = 1;
			curX = startX;
			curY = startY;
		}
		
		selectContainer.addChild($.selectStage['icon_'+n], $.selectStage['iconText_'+n], $.selectStage['iconLock_'+n]);
	}
	
	//game
	for(var n=0; n<pipeColors.length; n++){
		$.pipe['pipeHole'+n] = new createjs.Bitmap(loader.getResult('pipeHole'+n));
		centerReg($.pipe['pipeHole'+n]);
		$.pipe['pipeHole'+n].cache(-($.pipe['pipeHole'+n].image.naturalWidth/2), -($.pipe['pipeHole'+n].image.naturalHeight/2), $.pipe['pipeHole'+n].image.naturalWidth, $.pipe['pipeHole'+n].image.naturalHeight);
		$.pipe['pipeHole'+n].x = -500;
		
		$.pipe['pipeConnect'+n] = new createjs.Bitmap(loader.getResult('pipeConnect'+n));
		centerReg($.pipe['pipeConnect'+n]);
		$.pipe['pipeConnect'+n].cache(-($.pipe['pipeConnect'+n].image.naturalWidth/2), -($.pipe['pipeConnect'+n].image.naturalHeight/2), $.pipe['pipeConnect'+n].image.naturalWidth, $.pipe['pipeConnect'+n].image.naturalHeight);
		$.pipe['pipeConnect'+n].x = -500;
		
		$.pipe['pipeStraight'+n] = new createjs.Bitmap(loader.getResult('pipeStraight'+n));
		centerReg($.pipe['pipeStraight'+n]);
		$.pipe['pipeStraight'+n].cache(-($.pipe['pipeStraight'+n].image.naturalWidth/2), -($.pipe['pipeStraight'+n].image.naturalHeight/2), $.pipe['pipeStraight'+n].image.naturalWidth, $.pipe['pipeStraight'+n].image.naturalHeight);
		$.pipe['pipeStraight'+n].x = -500;
		
		$.pipe['pipeCorner'+n] = new createjs.Bitmap(loader.getResult('pipeCorner'+n));
		centerReg($.pipe['pipeCorner'+n]);
		$.pipe['pipeCorner'+n].cache(-($.pipe['pipeCorner'+n].image.naturalWidth/2), -($.pipe['pipeCorner'+n].image.naturalHeight/2), $.pipe['pipeCorner'+n].image.naturalWidth, $.pipe['pipeCorner'+n].image.naturalHeight);
		$.pipe['pipeCorner'+n].x = -500;
		
		$.pipe['pipeDivide'+n] = new createjs.Bitmap(loader.getResult('pipeDivide'+n));
		centerReg($.pipe['pipeDivide'+n]);
		$.pipe['pipeDivide'+n].cache(-($.pipe['pipeDivide'+n].image.naturalWidth/2), -($.pipe['pipeDivide'+n].image.naturalHeight/2), $.pipe['pipeDivide'+n].image.naturalWidth, $.pipe['pipeDivide'+n].image.naturalHeight);
		$.pipe['pipeDivide'+n].x = -500;
		
		$.pipe['pipeConnecting'+n] = new createjs.Bitmap(loader.getResult('pipeConnecting'+n));
		centerReg($.pipe['pipeConnecting'+n]);
		$.pipe['pipeConnecting'+n].cache(-($.pipe['pipeConnecting'+n].image.naturalWidth/2), -($.pipe['pipeConnecting'+n].image.naturalHeight/2), $.pipe['pipeConnecting'+n].image.naturalWidth, $.pipe['pipeConnecting'+n].image.naturalHeight);
		$.pipe['pipeConnecting'+n].x = -500;
		
		gameContainer.addChild($.pipe['pipeHole'+n], $.pipe['pipeConnect'+n], $.pipe['pipeStraight'+n], $.pipe['pipeCorner'+n], $.pipe['pipeDivide'+n], $.pipe['pipeConnecting'+n]);
	}
	
	itemTimerBg = new createjs.Bitmap(loader.getResult('itemTimerBg'));
	centerReg(itemTimerBg);
	
	itemCompleteBg = new createjs.Bitmap(loader.getResult('itemCompleteBg'));
	centerReg(itemCompleteBg);
	
	buttonRetry = new createjs.Bitmap(loader.getResult('buttonRetry'));
	centerReg(buttonRetry);
	buttonRetry.x = canvasW/2;
	buttonRetry.y = 0;
	
	gameLevelTxt = new createjs.Text();
	gameLevelTxt.font = "35px commandocommando";
	gameLevelTxt.color = "#fff";
	gameLevelTxt.textAlign = "left";
	gameLevelTxt.textBaseline='alphabetic';
	gameLevelTxt.text = '';
	
	gamePipeTxt = new createjs.Text();
	gamePipeTxt.font = "35px commandocommando";
	gamePipeTxt.color = "#fff";
	gamePipeTxt.textAlign = "right";
	gamePipeTxt.textBaseline='alphabetic';
	gamePipeTxt.text = '';
	
	gameCompleteTxt = new createjs.Text();
	gameCompleteTxt.font = "35px commandocommando";
	gameCompleteTxt.color = "#fff";
	gameCompleteTxt.textAlign = "center";
	gameCompleteTxt.textBaseline='alphabetic';
	gameCompleteTxt.text = levelCompleteText;
	
	gameTimerTxt = new createjs.Text();
	gameTimerTxt.font = "45px commandocommando";
	gameTimerTxt.color = "#fff";
	gameTimerTxt.textAlign = "center";
	gameTimerTxt.textBaseline='alphabetic';
	gameTimerTxt.text = '00:00';
	
	//result
	itemResult = new createjs.Bitmap(loader.getResult('itemResult'));
	centerReg(itemResult);
	itemResult.x = canvasW/2;
	itemResult.y = canvasH/2;
	
	itemResultLogo = new createjs.Bitmap(loader.getResult('itemLogo'));
	centerReg(itemResultLogo);
	itemResultLogo.x = canvasW/2;
	itemResultLogo.y = canvasH/100 * 22;
	
	resultTitleTxt = new createjs.Text();
	resultTitleTxt.font = "65px commandocommando";
	resultTitleTxt.color = "#fff";
	resultTitleTxt.textAlign = "center";
	resultTitleTxt.textBaseline='alphabetic';
	resultTitleTxt.text = resultTitleText;
	resultTitleTxt.x = canvasW/2;
	resultTitleTxt.y = canvasH/100 * 34;
	
	resultScoreTxt = new createjs.Text();
	resultScoreTxt.font = "60px commandocommando";
	resultScoreTxt.color = "#fada06";
	resultScoreTxt.textAlign = "center";
	resultScoreTxt.textBaseline='alphabetic';
	resultScoreTxt.text = '';
	resultScoreTxt.x = canvasW/2;
	resultScoreTxt.y = canvasH/100 * 40;
	
	resultShareTxt = new createjs.Text();
	resultShareTxt.font = "40px commandocommando";
	resultShareTxt.color = "#1C648C";
	resultShareTxt.textAlign = "center";
	resultShareTxt.textBaseline='alphabetic';
	resultShareTxt.text = shareText;
	resultShareTxt.x = canvasW/2;
	resultShareTxt.y = canvasH/100 * 65;
	
	buttonFacebook = new createjs.Bitmap(loader.getResult('buttonFacebook'));
	buttonTwitter = new createjs.Bitmap(loader.getResult('buttonTwitter'));
	buttonWhatsapp = new createjs.Bitmap(loader.getResult('buttonWhatsapp'));
	centerReg(buttonFacebook);
	createHitarea(buttonFacebook);
	centerReg(buttonTwitter);
	createHitarea(buttonTwitter);
	centerReg(buttonWhatsapp);
	createHitarea(buttonWhatsapp);
	buttonFacebook.x = canvasW/100 * 38;
	buttonTwitter.x = canvasW/2;
	buttonWhatsapp.x = canvasW/100 * 62;
	buttonFacebook.y = buttonTwitter.y = buttonWhatsapp.y = canvasH/100*70;
	
	buttonNextLevel = new createjs.Bitmap(loader.getResult('buttonNextLevel'));
	centerReg(buttonNextLevel);
	buttonNextLevel.x = canvasW/2;
	buttonNextLevel.y = canvasH/100 * 46;
	
	buttonQuitGame = new createjs.Bitmap(loader.getResult('buttonQuitGame'));
	centerReg(buttonQuitGame);
	buttonQuitGame.x = canvasW/2;
	buttonQuitGame.y = canvasH/100 * 55;
	
	//option
	buttonFullscreen = new createjs.Bitmap(loader.getResult('buttonFullscreen'));
	centerReg(buttonFullscreen);
	buttonSoundOn = new createjs.Bitmap(loader.getResult('buttonSoundOn'));
	centerReg(buttonSoundOn);
	buttonSoundOff = new createjs.Bitmap(loader.getResult('buttonSoundOff'));
	centerReg(buttonSoundOff);
	buttonSoundOn.visible = false;
	buttonExit = new createjs.Bitmap(loader.getResult('buttonExit'));
	centerReg(buttonExit);
	buttonSettings = new createjs.Bitmap(loader.getResult('buttonSettings'));
	centerReg(buttonSettings);
	
	createHitarea(buttonFullscreen);
	createHitarea(buttonSoundOn);
	createHitarea(buttonSoundOff);
	createHitarea(buttonExit);
	createHitarea(buttonSettings);
	
	//exit
	itemExit = new createjs.Bitmap(loader.getResult('itemExit'));
	centerReg(itemExit);
	itemExit.x = canvasW/2;
	itemExit.y = canvasH/2;
	
	itemExitLogo = new createjs.Bitmap(loader.getResult('itemLogo'));
	centerReg(itemExitLogo);
	itemExitLogo.x = canvasW/2;
	itemExitLogo.y = canvasH/100 * 28;
	
	buttonConfirm = new createjs.Bitmap(loader.getResult('buttonConfirm'));
	centerReg(buttonConfirm);
	buttonConfirm.x = canvasW/100* 37;
	buttonConfirm.y = canvasH/100 * 63;
	
	buttonCancel = new createjs.Bitmap(loader.getResult('buttonCancel'));
	centerReg(buttonCancel);
	buttonCancel.x = canvasW/100 * 63;
	buttonCancel.y = canvasH/100 * 63;
	
	confirmMessageTxt = new createjs.Text();
	confirmMessageTxt.font = "50px commandocommando";
	confirmMessageTxt.color = "#fff";
	confirmMessageTxt.textAlign = "center";
	confirmMessageTxt.textBaseline='alphabetic';
	confirmMessageTxt.text = exitMessage;
	confirmMessageTxt.x = canvasW/2;
	confirmMessageTxt.y = canvasH/100 *44;
	
	confirmContainer.addChild(itemExit, itemExitLogo, buttonConfirm, buttonCancel, confirmMessageTxt);
	confirmContainer.visible = false;
	
	if(guide){
		guideline = new createjs.Shape();
		guideline.graphics.setStrokeStyle(2).beginStroke('red').drawRect((stageW-contentW)/2, (stageH-contentH)/2, contentW, contentH);
	}
	
	mainContainer.addChild(logo, buttonStart);
	gameDisplayContainer.addChild(gameLevelTxt, gamePipeTxt, itemCompleteBg, gameCompleteTxt, itemTimerBg, gameTimerTxt, buttonRetry);
	gameContainer.addChild(strokeContainer, rectContainer, pipeStartContainer, pipeContainer, pipeDivideContainer, editContainer, gameDisplayContainer);
	resultContainer.addChild(itemResult, itemResultLogo, resultTitleTxt, resultScoreTxt, buttonQuitGame, buttonNextLevel);
	optionsContainer.addChild(buttonFullscreen, buttonSoundOn, buttonSoundOff, buttonExit);
	optionsContainer.visible = false;
	
	if(shareEnable){
		resultContainer.addChild(resultShareTxt, buttonFacebook, buttonTwitter, buttonWhatsapp);
	}
	
	canvasContainer.addChild(bg, mainContainer, selectContainer, gameContainer, resultContainer, confirmContainer, optionsContainer, buttonSettings, guideline);
	stage.addChild(canvasContainer);
	
	resizeCanvas();
}


/*!
 * 
 * RESIZE GAME CANVAS - This is the function that runs to resize game canvas
 * 
 */
function resizeCanvas(){
 	if(canvasContainer!=undefined){
		buttonSettings.x = (canvasW - offset.x) - 60;
		buttonSettings.y = offset.y + 45;
		
		var distanceNum = 75;
		if(curPage != 'game'){
			buttonExit.visible = false;
			buttonSoundOn.x = buttonSoundOff.x = buttonSettings.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;
			buttonSoundOn.x = buttonSoundOff.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+(distanceNum);
			
			buttonFullscreen.x = buttonSettings.x;
			buttonFullscreen.y = buttonSettings.y+(distanceNum*2);
		}else{
			buttonExit.visible = true;
			buttonSoundOn.x = buttonSoundOff.x = buttonSettings.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;
			buttonSoundOn.x = buttonSoundOff.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+(distanceNum);
			
			buttonFullscreen.x = buttonSettings.x;
			buttonFullscreen.y = buttonSettings.y+(distanceNum*2);
			
			buttonExit.x = buttonSettings.x;
			buttonExit.y = buttonSettings.y+(distanceNum*3);
		}
		
		itemTimerBg.x = offset.x + 100;
		itemTimerBg.y = offset.y + 50;
		gameTimerTxt.x = itemTimerBg.x;
		gameTimerTxt.y = itemTimerBg.y + 15;
		
		itemCompleteBg.x = canvasW/2;
		itemCompleteBg.y = (canvasH - offset.y) - (itemCompleteBg.image.naturalHeight/2);
		gameCompleteTxt.x = itemCompleteBg.x;
		gameCompleteTxt.y = itemCompleteBg.y + 12;
		
		buttonRetry.y = (canvasH - offset.y) - (70);
	}
}

/*!
 * 
 * REMOVE GAME CANVAS - This is the function that runs to remove game canvas
 * 
 */
 function removeGameCanvas(){
	 stage.autoClear = true;
	 stage.removeAllChildren();
	 stage.update();
	 createjs.Ticker.removeEventListener("tick", tick);
	 createjs.Ticker.removeEventListener("tick", stage);
 }

/*!
 * 
 * CANVAS LOOP - This is the function that runs for canvas loop
 * 
 */ 
function tick(event) {
	updateGame();
	stage.update(event);
}

/*!
 * 
 * CANVAS MISC FUNCTIONS
 * 
 */
function centerReg(obj){
	obj.regX=obj.image.naturalWidth/2;
	obj.regY=obj.image.naturalHeight/2;
}

function createHitarea(obj){
	obj.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#000").drawRect(0, 0, obj.image.naturalWidth, obj.image.naturalHeight));
}