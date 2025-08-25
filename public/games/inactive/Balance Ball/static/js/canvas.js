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
	canvasW=w;
	canvasH=h;
	stage = new createjs.Stage("gameCanvas");
	
	createjs.Touch.enable(stage);
	stage.enableMouseOver(20);
	stage.mouseMoveOutside = true;
	
	createjs.Ticker.framerate = 60;
	createjs.Ticker.addEventListener("tick", tick);	
}

var canvasContainer, mainContainer, gameContainer, resultContainer;
var conMain,btnStart, bgPop, bgOverlay, resultTxt, buttonReplay, btnBackMain, btnShare, btnBack, btnFb, btnTwitter, btnWhatsapp, scorePopTxt;
var gameBall, bgGame, gamePlayer, shadowPlayer, shadowBall, playerdata, scoreDescTxt, scoreNumTxt, scoreDisplayTxt, shareTxt;
var txtExtra=0;

/*!
 * 
 * BUILD GAME CANVAS ASSERTS - This is the function that runs to build game canvas asserts
 * 
 */
function buildGameCanvas(){
	canvasContainer = new createjs.Container();
	mainContainer = new createjs.Container();
	gameContainer = new createjs.Container();
	menuContainer = new createjs.Container();
	resultContainer = new createjs.Container();
	confirmContainer = new createjs.Container();
	optionsContainer = new createjs.Container();
	
	//main
	conMain = new createjs.Bitmap(loader.getResult("conMain"));
	btnStart = new createjs.Bitmap(loader.getResult("btnStart"));
	mainContainer.addChild(conMain, btnStart);
	
	centerReg(btnStart);
	btnStart.x=canvasW/2;
	btnStart.y=canvasH/100*87;
	
	var _frameW=190;
	var _frameH=260;
	var _frame = {"regX": (_frameW/2), "regY": (_frameH/2), "height": _frameH, "count": 8, "width": _frameW};
	var _animations = {"left": 0,
					   "right": 1,
					   "leftrun":{frames: [2,3], speed: .3},
					   "rightrun":{frames: [4,5], speed: .3},
					   "jumpleft":{frames: [6], speed: .3},
					   "jumpright":{frames: [7], speed: .3}};
	//game
	playerdata = new createjs.SpriteSheet({
		"images": [loader.getResult("gamePlayer").src],
		"frames": _frame,
		"animations": _animations
	});
	
	gamePlayer = new createjs.Sprite(playerdata, "left");
	gamePlayer.framerate = 20;
	
	shadowPlayer = new createjs.Bitmap(loader.getResult("shadowPlayer"));
	shadowBall = new createjs.Bitmap(loader.getResult("shadowBall"));
	gameBall = new createjs.Bitmap(loader.getResult("gameBall"));
	bgGame = new createjs.Bitmap(loader.getResult("bgGame"));
	centerReg(gameBall);
	centerReg(shadowPlayer);
	centerReg(shadowBall);
	
	scoreDescTxt = new createjs.Text();
	scoreNumTxt = new createjs.Text();
	scoreDescTxt.font = "60px pixellife";
	scoreNumTxt.font = "100px pixellife";
	scoreDescTxt.color = "#ffffff";
	scoreNumTxt.color = "#f89b09";
	scoreDescTxt.text = scoreDisplayText;
	scoreNumTxt.text = "0";
	scoreDescTxt.textAlign = scoreNumTxt.textAlign = "center";
	
	scoreDescTxt.x=canvasW/100*14;
	scoreDescTxt.y=canvasH/100*1;
	
	scoreNumTxt.x=canvasW/100*14;
	scoreNumTxt.y=canvasH/100*5;
	
	scoreDisplayTxt= new createjs.Text();
	scoreDisplayTxt.font = "300px pixellife";
	scoreDisplayTxt.color = "#f89b09";
	scoreDisplayTxt.text="10";
	scoreDisplayTxt.textAlign = "center";
	scoreDisplayTxt.x=canvasW/2;
	
	if(!$.browser.mozilla){
		txtExtra=2;
	}
	scoreDisplayTxt.y=canvasH/100*(20+txtExtra);
	
	var heartSpace = 15;
	var heartStartX = 0;
	for(n=1; n<=gameLife; n++){
		this["heartBlank"+n] = new createjs.Bitmap(loader.getResult("heartBlank"));
		this["heartFull"+n] = new createjs.Bitmap(loader.getResult("heartFull"));
		
		if(n==1){
			var heatWidth = ((this["heartFull"+n].image.naturalWidth)*gameLife)+(heartSpace*(gameLife-1));
			heartStartX = (canvasW/2)-(heatWidth/3);
		}
		centerReg(this["heartBlank"+n]);
		centerReg(this["heartFull"+n]);
		
		this["heartBlank"+n].x=this["heartFull"+n].x=heartStartX;
		this["heartBlank"+n].y=this["heartFull"+n].y=(this["heartFull"+n].image.naturalHeight/2)+heartSpace;
		heartStartX+=(this["heartFull"+n].image.naturalWidth)+heartSpace;
		
		gameContainer.addChild(this["heartBlank"+n], this["heartFull"+n]);
	}
	
	gameBall.x=shadowBall.x=-500;
	gameContainer.addChild(shadowPlayer, shadowBall, gamePlayer, scoreDescTxt, scoreNumTxt, scoreDisplayTxt, gameBall);
	
	
	bgOverlay = new createjs.Shape();
	bgOverlay.graphics.beginFill("#000").drawRect(0, 0, canvasW, canvasH);
	bgOverlay.alpha=.5;
	
	bgPop = new createjs.Bitmap(loader.getResult("bgPop"));
	
	buttonReplay = new createjs.Bitmap(loader.getResult("btnReplay"));
	btnBackMain = new createjs.Bitmap(loader.getResult("btnBackMain"));
	
	btnShare = new createjs.Bitmap(loader.getResult("btnShare"));
	btnBack = new createjs.Bitmap(loader.getResult("btnBack"));
	btnFb = new createjs.Bitmap(loader.getResult("btnFb"));
	btnTwitter = new createjs.Bitmap(loader.getResult("btnTwitter"));
	btnWhatsapp = new createjs.Bitmap(loader.getResult("btnWhatsapp"));
	
	resultTxt= new createjs.Text();
	resultTxt.font = "80px pixellife";
	resultTxt.color = "#ffffff";
	resultTxt.text = gameOverText;
	resultTxt.textAlign = "center";
	resultTxt.x=canvasW/2;
	resultTxt.y=canvasH/100*(25+txtExtra);
	
	scorePopTxt= new createjs.Text();
	scorePopTxt.font = "280px pixellife";
	scorePopTxt.color = "#ffffff";
	scorePopTxt.text = "10";
	scorePopTxt.textAlign = "center";
	scorePopTxt.x=canvasW/2;
	scorePopTxt.y=canvasH/100*(32+txtExtra);
	
	shareTxt= new createjs.Text();
	shareTxt.font = "40px pixellife";
	shareTxt.color = "#ffffff";
	shareTxt.text=shareText;
	shareTxt.textAlign = "center";
	shareTxt.x=canvasW/2;
	shareTxt.y=canvasH/100*(60+txtExtra);
	
	menuContainer.addChild(bgOverlay, bgPop, resultContainer)
	resultContainer.addChild(resultTxt, buttonReplay, btnBackMain, btnBack, scorePopTxt);
	if(shareEnable){
		resultContainer.addChild(btnShare, btnFb, btnTwitter, btnWhatsapp, shareTxt);	
	}
	
	
	centerReg(buttonReplay);
	createHitarea(buttonReplay);
	centerReg(btnBackMain);
	createHitarea(btnBackMain);
	
	centerReg(btnShare);
	createHitarea(btnShare);
	
	centerReg(btnBack);
	createHitarea(btnBack);
	
	centerReg(btnFb);
	createHitarea(btnFb);
	
	centerReg(btnTwitter);
	createHitarea(btnTwitter);
	
	centerReg(btnWhatsapp);
	createHitarea(btnWhatsapp);
	
	btnBack.x=canvasW/2;
	btnBack.y=canvasH/100 * 78;
	
	buttonReplay.x=btnFb.x=canvasW/100*30;
	btnBackMain.x=btnTwitter.x=canvasW/2;
	btnShare.x=btnWhatsapp.x=canvasW/100*70;
	
	if(!shareEnable){
		buttonReplay.x=canvasW/100*30;
		btnBackMain.x=canvasW/100*70;
	}
	
	buttonReplay.y=btnBackMain.y=btnShare.y=btnFb.y=btnTwitter.y=btnWhatsapp.y=canvasH/100*70;
	
	centerReg(bgPop);
	
	bgPop.x=canvasW/2;
	bgPop.y=canvasH/2;
	
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
	
	buttonConfirm = new createjs.Bitmap(loader.getResult('buttonConfirm'));
	centerReg(buttonConfirm);
	buttonConfirm.x = canvasW/2;
	buttonConfirm.y = canvasH/100 * 58;
	
	buttonCancel = new createjs.Bitmap(loader.getResult('buttonCancel'));
	centerReg(buttonCancel);
	buttonCancel.x = canvasW/2;
	buttonCancel.y = canvasH/100 * 70;
	
	confirmMessageTxt = new createjs.Text();
	confirmMessageTxt.font = "50px pixellife";
	confirmMessageTxt.lineHeight = 60;
	confirmMessageTxt.color = "#fff";
	confirmMessageTxt.textAlign = "center";
	confirmMessageTxt.textBaseline='alphabetic';
	confirmMessageTxt.text = exitMessage;
	confirmMessageTxt.x = canvasW/2;
	confirmMessageTxt.y = canvasH/100 *40;
	
	confirmContainer.addChild(itemExit, buttonConfirm, buttonCancel, confirmMessageTxt);
	confirmContainer.visible = false;
	
	canvasContainer.addChild(bgGame, mainContainer, gameContainer, menuContainer, confirmContainer, optionsContainer, buttonSettings);
	optionsContainer.addChild(buttonFullscreen, buttonSoundOn, buttonSoundOff, buttonExit);
	optionsContainer.visible = false;
	
	stage.addChild(canvasContainer)
	
	gameContainer.visible=false;
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
		
		var distanceNum = 90;
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