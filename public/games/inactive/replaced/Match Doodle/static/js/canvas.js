////////////////////////////////////////////////////////////
// CANVAS
////////////////////////////////////////////////////////////
var stage
var canvasW = 0;
var canvasH = 0;

/*!
 * 
 * START GAME CANVAS - This is the function that runs to setup game canvas
 * 
 */
function initGameCanvas(w, h) {
	var gameCanvas = document.getElementById("gameCanvas");
	gameCanvas.width = w;
	gameCanvas.height = h;

	canvasW = w;
	canvasH = h;
	stage = new createjs.Stage("gameCanvas");

	createjs.Touch.enable(stage);
	stage.enableMouseOver(20);
	stage.mouseMoveOutside = true;

	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", tick);
}

var guide = false;
var canvasContainer, mainContainer, selectContainer, gameContainer, editContainer, resultContainer, confirmContainer;
var guideline, bg, logo, buttonStart, buttonRestart, buttonFacebook, buttonTwitter, buttonWhatsapp, buttonFullscreen, buttonSoundOn, buttonSoundOff;

$.items = {};

/*!
 * 
 * BUILD GAME CANVAS ASSERTS - This is the function that runs to build game canvas asserts
 * 
 */
function buildGameCanvas() {
	canvasContainer = new createjs.Container();
	mainContainer = new createjs.Container();

	gameContainer = new createjs.Container();
	instructionContainer = new createjs.Container();
	itemContainer = new createjs.Container();
	resultContainer = new createjs.Container();
	confirmContainer = new createjs.Container();
	optionsContainer = new createjs.Container();

	bg = new createjs.Bitmap(loader.getResult('background'));
	logo = new createjs.Bitmap(loader.getResult('logo'));

	buttonStart = new createjs.Bitmap(loader.getResult('buttonStart'));
	centerReg(buttonStart);
	createHitarea(buttonStart);
	buttonStart.x = canvasW / 2;
	buttonStart.y = canvasH / 100 * 65;

	//game
	itemDrop = new createjs.Bitmap(loader.getResult('itemDrop'));
	centerReg(itemDrop);
	itemDrop.x = dropAreaSettings.x
	itemDrop.y = dropAreaSettings.y;

	for (var n = 0; n < item_arr.length; n++) {
		$.items[n] = new createjs.Bitmap(loader.getResult('item' + n));
		centerReg($.items[n]);
		createHitarea($.items[n]);
		$.items[n].visible = false;
		gameContainer.addChild($.items[n]);
	}

	timerTxt = new createjs.Text();
	timerTxt.font = "50px jsbdoublejointedmedium";
	timerTxt.lineHeight = 50;
	timerTxt.color = "#000";
	timerTxt.textAlign = "center";
	timerTxt.textBaseline = 'alphabetic';
	timerTxt.text = '';
	timerTxt.x = canvasW / 2;

	timerAlertTxt = new createjs.Text();
	timerAlertTxt.font = "50px jsbdoublejointedmedium";
	timerAlertTxt.lineHeight = 50;
	timerAlertTxt.color = "#ef1818";
	timerAlertTxt.textAlign = "center";
	timerAlertTxt.textBaseline = 'alphabetic';
	timerAlertTxt.text = '';
	timerAlertTxt.x = canvasW / 2;

	gameStatusTxt = new createjs.Text();
	gameStatusTxt.font = "70px jsbdoublejointedmedium";
	gameStatusTxt.lineHeight = 70;
	gameStatusTxt.color = "#000";
	gameStatusTxt.textAlign = "center";
	gameStatusTxt.textBaseline = 'alphabetic';
	gameStatusTxt.text = 'tester';
	gameStatusTxt.x = canvasW / 2;
	gameStatusTxt.y = canvasH / 100 * 25;

	//result

	buttonFacebook = new createjs.Bitmap(loader.getResult('buttonFacebook'));
	buttonTwitter = new createjs.Bitmap(loader.getResult('buttonTwitter'));
	buttonWhatsapp = new createjs.Bitmap(loader.getResult('buttonWhatsapp'));
	centerReg(buttonFacebook);
	createHitarea(buttonFacebook);
	centerReg(buttonTwitter);
	createHitarea(buttonTwitter);
	centerReg(buttonWhatsapp);
	createHitarea(buttonWhatsapp);
	buttonFacebook.x = canvasW / 100 * 38;
	buttonTwitter.x = canvasW / 2;
	buttonWhatsapp.x = canvasW / 100 * 62;
	buttonFacebook.y = buttonTwitter.y = buttonWhatsapp.y = canvasH / 100 * 65;

	buttonContinue = new createjs.Bitmap(loader.getResult('buttonContinue'));
	centerReg(buttonContinue);
	createHitarea(buttonContinue);
	buttonContinue.x = canvasW / 2;
	buttonContinue.y = canvasH / 100 * 75;

	scoreDescTxt = new createjs.Text();
	scoreDescTxt.font = "80px jsbdoublejointedmedium";
	scoreDescTxt.lineHeight = 80;
	scoreDescTxt.color = "#000";
	scoreDescTxt.textAlign = "center";
	scoreDescTxt.textBaseline = 'alphabetic';
	scoreDescTxt.text = scoreDescText;
	scoreDescTxt.x = canvasW / 2;
	scoreDescTxt.y = canvasH / 100 * 30;

	scoreTxt = new createjs.Text();
	scoreTxt.font = "180px jsbdoublejointedmedium";
	scoreTxt.lineHeight = 180;
	scoreTxt.color = "#000";
	scoreTxt.textAlign = "center";
	scoreTxt.textBaseline = 'alphabetic';
	scoreTxt.text = 0;
	scoreTxt.x = canvasW / 2;
	scoreTxt.y = canvasH / 100 * 48;


	shareTxt = new createjs.Text();
	shareTxt.font = "40px jsbdoublejointedmedium";
	shareTxt.lineHeight = 50;
	shareTxt.color = "#000";
	shareTxt.textAlign = "center";
	shareTxt.textBaseline = 'alphabetic';
	shareTxt.text = shareText;
	shareTxt.x = canvasW / 2;
	shareTxt.y = canvasH / 100 * 59;

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

	buttonConfirm = new createjs.Bitmap(loader.getResult('buttonConfirm'));
	centerReg(buttonConfirm);
	createHitarea(buttonConfirm);
	buttonConfirm.x = canvasW / 2;
	buttonConfirm.y = canvasH / 100 * 65;

	buttonCancel = new createjs.Bitmap(loader.getResult('buttonCancel'));
	centerReg(buttonCancel);
	createHitarea(buttonCancel);
	buttonCancel.x = canvasW / 2;
	buttonCancel.y = canvasH / 100 * 73;

	confirmTxt = new createjs.Text();
	confirmTxt.font = "50px jsbdoublejointedmedium";
	confirmTxt.lineHeight = 50;
	confirmTxt.color = "#000";
	confirmTxt.textAlign = "center";
	confirmTxt.textBaseline = 'alphabetic';
	confirmTxt.text = exitMessageText;
	confirmTxt.x = canvasW / 2;
	confirmTxt.y = canvasH / 100 * 41;

	confirmContainer.addChild(itemExit, buttonConfirm, buttonCancel, confirmTxt);
	confirmContainer.visible = false;

	if (guide) {
		guideline = new createjs.Shape();
		guideline.graphics.setStrokeStyle(2).beginStroke('red').drawRect((stageW - contentW) / 2, (stageH - contentH) / 2, contentW, contentH);
	}

	mainContainer.addChild(logo, buttonStart);
	gameContainer.addChild(itemDrop, itemContainer, timerTxt, timerAlertTxt, gameStatusTxt);
	resultContainer.addChild(scoreDescTxt, scoreTxt, buttonContinue);
	optionsContainer.addChild(buttonExit, buttonFullscreen, buttonSoundOn, buttonSoundOff);
	optionsContainer.visible = false;

	if (shareEnable) {
		/*resultContainer.addChild(shareTxt, buttonFacebook, buttonTwitter, buttonWhatsapp);*/
	}

	canvasContainer.addChild(bg, mainContainer, gameContainer, resultContainer, confirmContainer, optionsContainer, buttonSettings, guideline);
	stage.addChild(canvasContainer);

	resizeCanvas();
}


/*!
 * 
 * RESIZE GAME CANVAS - This is the function that runs to resize game canvas
 * 
 */
function resizeCanvas() {
	if (canvasContainer != undefined) {
		buttonSettings.x = (canvasW - offset.x) - 60;
		buttonSettings.y = offset.y + 50;

		var distanceNum = 75;
		if (curPage != 'game') {
			buttonExit.visible = false;
			buttonSoundOn.x = buttonSoundOff.x = buttonSettings.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y + distanceNum;
			buttonSoundOn.x = buttonSoundOff.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y + (distanceNum);

			buttonFullscreen.x = buttonSettings.x;
			buttonFullscreen.y = buttonSettings.y + (distanceNum * 2);
		} else {
			buttonExit.visible = true;
			buttonSoundOn.x = buttonSoundOff.x = buttonSettings.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y + distanceNum;
			buttonSoundOn.x = buttonSoundOff.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y + (distanceNum);

			buttonFullscreen.x = buttonSettings.x;
			buttonFullscreen.y = buttonSettings.y + (distanceNum * 2);

			buttonExit.x = buttonSettings.x;
			buttonExit.y = buttonSettings.y + (distanceNum * 3);

			timerTxt.y = timerAlertTxt.y = offset.y + 75;
		}

	}
}

/*!
 * 
 * REMOVE GAME CANVAS - This is the function that runs to remove game canvas
 * 
 */
function removeGameCanvas() {
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
function centerReg(obj) {
	obj.regX = obj.image.naturalWidth / 2;
	obj.regY = obj.image.naturalHeight / 2;
}

function createHitarea(obj) {
	obj.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#000").drawRect(0, 0, obj.image.naturalWidth, obj.image.naturalHeight));
}