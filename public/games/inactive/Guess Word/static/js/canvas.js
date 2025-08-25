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
	
	createjs.Ticker.framerate = 60;
	createjs.Ticker.addEventListener("tick", tick);
}

var guide = false;
var canvasContainer, mainContainer, gameContainer, resultContainer, confirmContainer;
var guideline, bg, logo, buttonOk, result, shadowResult, buttonReplay, buttonFacebook, buttonTwitter, buttonWhatsapp, buttonFullscreen, buttonSoundOn, buttonSoundOff;

$.key = {};
$.word = {};

/*!
 * 
 * BUILD GAME CANVAS ASSERTS - This is the function that runs to build game canvas asserts
 * 
 */
function buildGameCanvas(){
	canvasContainer = new createjs.Container();
	titleContainer = new createjs.Container();
	mainContainer = new createjs.Container();
	selectContainer = new createjs.Container();
	gameContainer = new createjs.Container();
	wordsContainer = new createjs.Container();
	wordsListContainer = new createjs.Container();
	keyboardContainer = new createjs.Container();
	totalContainer = new createjs.Container();
	scoreContainer = new createjs.Container();
	resultContainer = new createjs.Container();
	confirmContainer = new createjs.Container();
	
	
	bg = new createjs.Bitmap(loader.getResult('background'));
	bgP = new createjs.Bitmap(loader.getResult('backgroundP'));
	
	buttonStart = new createjs.Bitmap(loader.getResult('buttonStart'));
	centerReg(buttonStart);

	loadingTxt = new createjs.Text();
	loadingTxt.font = "20px comfortaabold";
	loadingTxt.color = '#fff';
	loadingTxt.textAlign = "center";
	loadingTxt.textBaseline='alphabetic';
	loadingTxt.text = textDisplay.loading;

	buttonLetter = new createjs.Bitmap(loader.getResult('buttonLetter'));
	centerReg(buttonLetter);

	letterTxt = new createjs.Text();
	letterTxt.font = "20px comfortaabold";
	letterTxt.color = '#fff';
	letterTxt.textAlign = "center";
	letterTxt.textBaseline='alphabetic';
	letterTxt.y += 8;

	buttonArrowL = new createjs.Bitmap(loader.getResult('buttonArrow'));
	centerReg(buttonArrowL);

	buttonArrowR = new createjs.Bitmap(loader.getResult('buttonArrow'));
	centerReg(buttonArrowR);

	buttonArrowL.scaleX = -1;
	buttonArrowL.x = -120;
	buttonArrowR.x = 120;

	selectContainer.addChild(buttonLetter, letterTxt, buttonArrowL, buttonArrowR);
	
	//game
	gameStatusTxt = new createjs.Text();
	gameStatusTxt.font = "25px comfortaabold";
	gameStatusTxt.color = "#fff";
	gameStatusTxt.textAlign = "center";
	gameStatusTxt.textBaseline='alphabetic';
	gameStatusTxt.text = textDisplay.noword;

	gameScoreTxt = new createjs.Text();
	gameScoreTxt.font = "25px comfortaabold";
	gameScoreTxt.color = "#fff";
	gameScoreTxt.textAlign = "center";
	gameScoreTxt.textBaseline='alphabetic';
	gameScoreTxt.text = '';

	gameScoreBg = new createjs.Shape();
	gameScore = new createjs.Shape();
	gameScore.barW = 0;

	gameScoreBg.y = gameScore.y = 20;

	scoreContainer.addChild(gameScoreTxt, gameScoreBg, gameScore);

	gameTotalTxt = new createjs.Text();
	gameTotalTxt.font = "25px comfortaabold";
	gameTotalTxt.color = "#fff";
	gameTotalTxt.textAlign = "center";
	gameTotalTxt.textBaseline='alphabetic';
	gameTotalTxt.text = '';

	totalContainer.addChild(gameTotalTxt);

	//result
	itemResult = new createjs.Bitmap(loader.getResult('itemPop2'));
	itemResultP = new createjs.Bitmap(loader.getResult('itemPopP2'));
	
	buttonContinue = new createjs.Bitmap(loader.getResult('buttonContinue'));
	centerReg(buttonContinue);
	
	resultShareTxt = new createjs.Text();
	resultShareTxt.font = "20px comfortaabold";
	resultShareTxt.color = '#fff';
	resultShareTxt.textAlign = "center";
	resultShareTxt.textBaseline='alphabetic';
	resultShareTxt.text = textDisplay.share;
	
	resultTitleTxt = new createjs.Text();
	resultTitleTxt.font = "45px comfortaabold";
	resultTitleTxt.color = '#fff';
	resultTitleTxt.textAlign = "center";
	resultTitleTxt.textBaseline='alphabetic';
	resultTitleTxt.text = '';
	
	resultTimerTxt = new createjs.Text();
	resultTimerTxt.font = "30px comfortaabold";
	resultTimerTxt.color = '#fff';
	resultTimerTxt.textAlign = "center";
	resultTimerTxt.textBaseline='alphabetic';
	resultTimerTxt.text = '';
	
	resultDescTxt = new createjs.Text();
	resultDescTxt.font = "40px comfortaabold";
	resultDescTxt.color = '#12B882';
	resultDescTxt.textAlign = "center";
	resultDescTxt.textBaseline='alphabetic';
	resultDescTxt.text = '';
	
	
	buttonFacebook = new createjs.Bitmap(loader.getResult('buttonFacebook'));
	buttonTwitter = new createjs.Bitmap(loader.getResult('buttonTwitter'));
	buttonWhatsapp = new createjs.Bitmap(loader.getResult('buttonWhatsapp'));
	centerReg(buttonFacebook);
	createHitarea(buttonFacebook);
	centerReg(buttonTwitter);
	createHitarea(buttonTwitter);
	centerReg(buttonWhatsapp);
	createHitarea(buttonWhatsapp);
	
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
	optionsContainer = new createjs.Container();
	optionsContainer.addChild(buttonFullscreen, buttonSoundOn, buttonSoundOff, buttonExit);
	optionsContainer.visible = false;

	buttonResultArrowL = new createjs.Bitmap(loader.getResult('buttonArrow'));
	centerReg(buttonResultArrowL);

	buttonResultArrowR = new createjs.Bitmap(loader.getResult('buttonArrow'));
	centerReg(buttonResultArrowR);

	buttonResultArrowL.scaleX = -1;
	
	//exit
	itemExit = new createjs.Bitmap(loader.getResult('itemPop'));
	itemExitP = new createjs.Bitmap(loader.getResult('itemPopP'));
	
	buttonConfirm = new createjs.Bitmap(loader.getResult('buttonConfirm'));
	centerReg(buttonConfirm);
	
	buttonCancel = new createjs.Bitmap(loader.getResult('buttonCancel'));
	centerReg(buttonCancel);
	
	popTitleTxt = new createjs.Text();
	popTitleTxt.font = "45px comfortaabold";
	popTitleTxt.color = "#fff";
	popTitleTxt.textAlign = "center";
	popTitleTxt.textBaseline='alphabetic';
	popTitleTxt.text = textDisplay.exitTitle;
	
	popDescTxt = new createjs.Text();
	popDescTxt.font = "30px comfortaabold";
	popDescTxt.lineHeight = 35;
	popDescTxt.color = "#fff";
	popDescTxt.textAlign = "center";
	popDescTxt.textBaseline='alphabetic';
	popDescTxt.text = textDisplay.exitMessage;
	
	confirmContainer.addChild(itemExit, itemExitP, popTitleTxt, popDescTxt, buttonConfirm, buttonCancel);
	confirmContainer.visible = false;
	
	if(guide){
		guideline = new createjs.Shape();	
		guideline.graphics.setStrokeStyle(2).beginStroke('red').drawRect((stageW-contentW)/2, (stageH-contentH)/2, contentW, contentH);
	}
	
	mainContainer.addChild(titleContainer, buttonStart, loadingTxt, selectContainer);
	wordsContainer.addChild(wordsListContainer, gameStatusTxt);
	gameContainer.addChild(scoreContainer, wordsContainer, keyboardContainer, totalContainer);
	resultContainer.addChild(itemResult, itemResultP, buttonResultArrowL, buttonResultArrowR, buttonContinue, resultTitleTxt, resultDescTxt, resultTimerTxt);
	
	if(shareEnable){
		resultContainer.addChild(resultShareTxt, buttonFacebook, buttonTwitter, buttonWhatsapp);
	}
	
	canvasContainer.addChild(bg, bgP, mainContainer, gameContainer, resultContainer, confirmContainer, optionsContainer, buttonSettings, guideline);
	stage.addChild(canvasContainer);
	
	changeViewport(viewport.isLandscape);
	resizeGameFunc();
}

function changeViewport(isLandscape){
	if(isLandscape){
		//landscape
		stageW=landscapeSize.w;
		stageH=landscapeSize.h;
		contentW = landscapeSize.cW;
		contentH = landscapeSize.cH;
	}else{
		//portrait
		stageW=portraitSize.w;
		stageH=portraitSize.h;
		contentW = portraitSize.cW;
		contentH = portraitSize.cH;
	}
	
	gameCanvas.width = stageW;
	gameCanvas.height = stageH;
	
	canvasW=stageW;
	canvasH=stageH;
	
	changeCanvasViewport();
}

function changeCanvasViewport(){
	if(canvasContainer!=undefined){
		if(viewport.isLandscape){
			bg.visible = true;
			bgP.visible = false;

			titleContainer.x = canvasW/2;
			titleContainer.y = canvasH/2;
			titleContainer.scaleX = titleContainer.scaleY = 1;
			
			buttonStart.x = loadingTxt.x = selectContainer.x = canvasW/2;
			buttonStart.y = loadingTxt.y = selectContainer.y = canvasH/100 * 73;

			//game
			wordsContainer.x = canvasW/2;
			wordsContainer.y = canvasH/100 * 17;

			keyboardContainer.x = canvasW/2;
			keyboardContainer.y = canvasH/100 * 81;

			scoreContainer.x = canvasW/2 + 350;
			scoreContainer.y = canvasH/100 * 50;
			
			//result
			itemResult.visible = true;
			itemResultP.visible = false;
			
			buttonFacebook.x = canvasW/100*45;
			buttonFacebook.y = canvasH/100*62;
			buttonTwitter.x = canvasW/2;
			buttonTwitter.y = canvasH/100*62;
			buttonWhatsapp.x = canvasW/100*55;
			buttonWhatsapp.y = canvasH/100*62;

			buttonResultArrowL.x = canvasW/2 - 210;
			buttonResultArrowL.y = canvasH/100 * 50;

			buttonResultArrowR.x = canvasW/2 + 210;
			buttonResultArrowR.y = canvasH/100 * 50;
			
			buttonContinue.x = canvasW/2;
			buttonContinue.y = canvasH/100 * 72;
	
			resultShareTxt.x = canvasW/2;
			resultShareTxt.y = canvasH/100 * 57;
	
			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 37;
	
			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 51;

			resultTimerTxt.x = canvasW/2;
			resultTimerTxt.y = canvasH/100 * 45;
			
			//exit
			itemExit.visible = true;
			itemExitP.visible = false;

			buttonConfirm.x = (canvasW/2) - 83;
			buttonConfirm.y = (canvasH/100 * 70);
			
			buttonCancel.x = (canvasW/2) + 83;
			buttonCancel.y = (canvasH/100 * 70);

			popTitleTxt.x = canvasW/2;
			popTitleTxt.y = canvasH/100 * 37;
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 48;

		}else{
			bg.visible = false;
			bgP.visible = true;

			titleContainer.x = canvasW/2;
			titleContainer.y = canvasH/2;
			titleContainer.scaleX = titleContainer.scaleY = .7;
			
			buttonStart.x = loadingTxt.x = selectContainer.x = canvasW/2;
			buttonStart.y = loadingTxt.y = selectContainer.y = canvasH/100 * 73;

			//game
			wordsContainer.x = canvasW/2;
			wordsContainer.y = canvasH/100 * 15;

			keyboardContainer.x = canvasW/2;
			keyboardContainer.y = canvasH/100 * 85;

			scoreContainer.x = canvasW/2;
			scoreContainer.y = canvasH/100 * 10;
			
			//result
			itemResult.visible = false;
			itemResultP.visible = true;
			
			buttonFacebook.x = canvasW/100*40;
			buttonFacebook.y = canvasH/100*60;
			buttonTwitter.x = canvasW/2;
			buttonTwitter.y = canvasH/100*60;
			buttonWhatsapp.x = canvasW/100*60;
			buttonWhatsapp.y = canvasH/100*60;

			buttonResultArrowL.x = canvasW/2 - 210;
			buttonResultArrowL.y = canvasH/100 * 50;

			buttonResultArrowR.x = canvasW/2 + 210;
			buttonResultArrowR.y = canvasH/100 * 50;
			
			buttonContinue.x = canvasW/2;
			buttonContinue.y = canvasH/100 * 67;
	
			resultShareTxt.x = canvasW/2;
			resultShareTxt.y = canvasH/100 * 56;
	
			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 40;
	
			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 51;

			resultTimerTxt.x = canvasW/2;
			resultTimerTxt.y = canvasH/100 * 47;
			
			//exit
			itemExit.visible = false;
			itemExitP.visible = true;

			buttonConfirm.x = (canvasW/2) - 83;
			buttonConfirm.y = (canvasH/100 * 67);
			
			buttonCancel.x = (canvasW/2) + 83;
			buttonCancel.y = (canvasH/100 * 67);

			popTitleTxt.x = canvasW/2;
			popTitleTxt.y = canvasH/100 * 40;
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 49;
		}
	}
}



/*!
 * 
 * RESIZE GAME CANVAS - This is the function that runs to resize game canvas
 * 
 */
function resizeCanvas(){
 	if(canvasContainer!=undefined){
		
		buttonSettings.x = (canvasW - offset.x) - 50;
		buttonSettings.y = offset.y + 45;
		
		var distanceNum = 55;
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

			if(curPage == 'game'){
				totalContainer.x = offset.x + 50;
				totalContainer.y = offset.y + 50;
				resizeWordLists();
			}
		}
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