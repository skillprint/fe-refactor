////////////////////////////////////////////////////////////
// GAME v1.4
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

//words array
var words_arr = [
	{file:'4letters.json', name:'4 LETTERS', letters:4},
	{file:'5letters.json', name:'5 LETTERS', letters:5},
	{file:'6letters.json', name:'6 LETTERS', letters:6},
];

//title settings
var titleSettings = {
	title:[
		["g","u","e","s","s"],
		["w","o","r","d"],
	],
	width:150,
	height:150,
	round:10,
	spaceY:10,
	spaceX:10,
	fontSize:80,
	offsetY:28,
	color:'#fff',
	bgColor:'#202938',
	bgColorCorrect:'#12B882',
	bgColorPosition:'#F79C0C'
}

//word settings
var wordsSettings = {
	width:80,
	height:80,
	round:5,
	spaceY:10,
	spaceX:10,
	fontSize:40,
	offsetY:12,
	color:'#fff',
	bgColor:'#202938',
	bgColorCorrect:'#12B882',
	bgColorPosition:'#F79C0C',
	bgColorNotExist:'#0F0F1E',
	chances:6, //total chances
	point:100, //total points
	pointBar:{
		height:10,
		round:5,
		color:'#14396c',
		bgColor:'#1f2938'
	},
	giveup:true, //give up button
	hint:true, //hint button
	hintTotal:10, //total dim keyboard hint
	totalWordPlay:5, //total word to play
	autoClear:true //auto clear when enter no word in dictionary
}

//keyboard settings
var key_arr = [
	["q","w","e","r","t","y","u","i","o","p"],
	["a","s","d","f","g","h","j","k","l"],
	["delete","z","x","c","v","b","n","m","enter"]
];

var keyboardSettings = {
	width:48,
	height:48,
	widthEnter:100,
	widthDelete:60,
	widthGiveup:130,
	widthHint:130,
	enterCode:'enter',
	enterKeyCode:13,
	deleteCode:'delete',
	deleteKeyCode:8,
	spaceY:5,
	spaceX:5,
	round:5,
	fontSize:20,
	offsetY:8,
	color:'#fff',
	bgColor:'#202938',
	bgColorPress:'#374660',
};

//game test display
var textDisplay = {
					loading:'LOADING WORDS...',
					noWord:'No word in dictionary.',
					wordComplete:'Word Complete!',
					noChances:'You tried all chances!',
					wordReveal:'The answer was "[WORD]".',
					giveup:'GIVE UP',
					hint:'HINT',
					point:'[NUMBER]PTS',
					total:'[NUMBER]/[TOTAL]',
					exitTitle:'EXIT GAME',
					exitMessage:'ARE YOU SURE\nYOU WANT TO\nQUIT THE GAME?',
					share:'SHARE YOUR SCORE',
					resultTitleComplete:'COMPLETE',
					resultTitleOver:'GAME OVER',
					resultTimer:'TIME : [NUMBER]',
					resultDesc:'SCORE : [NUMBER]PTS',
					resultWord:'WORD [NUMBER]',
				}

//Social share, [SCORE] will replace with game score
var shareEnable = true; //toggle share
var shareTitle = 'Highscore on Guess Word is [SCORE]PTS';//social share score title
var shareMessage = '[SCORE]PTS is mine new highscore on Guess Word game! Try it now!'; //social share score message

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
var playerData = {score:0, scores:[]};
var gameData = {paused:true, wordCount:0, animating:false, wordNum:0, words:[], letters:[], score:[], chances:0, complete:false, keyboard:{correct:[], position:[], notexist:[]}, resultNum:0, resultSound:false, hint:[]};
var tweenData = {score:0, tweenScore:0};
var timeData = {enable:false, startDate:null, nowDate:null, timer:0, oldTimer:0};

/*!
 * 
 * GAME BUTTONS - This is the function that runs to setup button event
 * 
 */
function buildGameButton(){
	if($.browser.mobile || isTablet){

	}else{
		var isInIframe = (window.location != window.parent.location) ? true : false;
		if(isInIframe){
			this.document.onkeydown = keydown;
			this.document.onkeyup = keyup;
		
			$(window).blur(function() {
				appendFocusFrame();
			});
			appendFocusFrame();
        }else{
            this.document.onkeydown = keydown;
			this.document.onkeyup = keyup;
        }
	}

	buttonStart.cursor = "pointer";
	buttonStart.addEventListener("click", function(evt) {
		playSound('soundButton');
		//goPage('game');
		buttonStart.visible = false;
		selectContainer.visible = true;
	});

	buttonLetter.cursor = "pointer";
	buttonLetter.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('game');
	});

	buttonArrowL.cursor = "pointer";
	buttonArrowL.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleLetters(false);
	});

	buttonArrowR.cursor = "pointer";
	buttonArrowR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleLetters(true);
	});
	
	itemExit.addEventListener("click", function(evt) {
	});
	
	buttonContinue.cursor = "pointer";
	buttonContinue.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('main');
	});
	
	buttonFacebook.cursor = "pointer";
	buttonFacebook.addEventListener("click", function(evt) {
		share('facebook');
	});
	
	buttonTwitter.cursor = "pointer";
	buttonTwitter.addEventListener("click", function(evt) {
		share('twitter');
	});
	buttonWhatsapp.cursor = "pointer";
	buttonWhatsapp.addEventListener("click", function(evt) {
		share('whatsapp');
	});
	
	buttonSoundOff.cursor = "pointer";
	buttonSoundOff.addEventListener("click", function(evt) {
		toggleGameMute(true);
	});
	
	buttonSoundOn.cursor = "pointer";
	buttonSoundOn.addEventListener("click", function(evt) {
		toggleGameMute(false);
	});
	
	buttonFullscreen.cursor = "pointer";
	buttonFullscreen.addEventListener("click", function(evt) {
		toggleFullScreen();
	});
	
	buttonExit.cursor = "pointer";
	buttonExit.addEventListener("click", function(evt) {
		togglePop(true);
		toggleOption();
	});
	
	buttonSettings.cursor = "pointer";
	buttonSettings.addEventListener("click", function(evt) {
		toggleOption();
	});
	
	buttonConfirm.cursor = "pointer";
	buttonConfirm.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
		
		stopAudio();
		stopGame();
		goPage('main');
	});
	
	buttonCancel.cursor = "pointer";
	buttonCancel.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
	});

	buttonResultArrowL.cursor = "pointer";
	buttonResultArrowL.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleResult(false);
	});

	buttonResultArrowR.cursor = "pointer";
	buttonResultArrowR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleResult(true);
	});

	buildTitle();
	buildKeyboard();
	toggleLetters(true);
	toggleLetters(false);
}

/*!
 * 
 * TOGGLE LETTERS - This is the function that runs to toggle letters
 * 
 */
function toggleResult(con){
	if(con){
		gameData.resultNum++;
		gameData.resultNum = gameData.resultNum > wordsSettings.totalWordPlay-1 ? wordsSettings.totalWordPlay-1 : gameData.resultNum;
	}else{
		gameData.resultNum--;
		gameData.resultNum = gameData.resultNum < -1 ? -1 : gameData.resultNum++;
	}

	showResultStats();
}

/*!
 * 
 * TOGGLE LETTERS - This is the function that runs to toggle letters
 * 
 */
function toggleLetters(con){
	if(con){
		gameData.wordNum++;
		gameData.wordNum = gameData.wordNum >= words_arr.length ? words_arr.length-1 : gameData.wordNum;
	}else{
		gameData.wordNum--;
		gameData.wordNum = gameData.wordNum < 0 ? 0 : gameData.wordNum++;
	}

	letterTxt.text = words_arr[gameData.wordNum].name;
}

/*!
 * 
 * BUILD TITLE - This is the function that runs to setup title
 * 
 */
function buildTitle(){
	gameData.title = [];
	var pos = {startX:0, startY:0};

	var totalH = (titleSettings.height * titleSettings.title.length);
	totalH = totalH + (titleSettings.spaceY * (titleSettings.title.length - 1));
	pos.startY = -(totalH/2);

	for(var n=0; n<titleSettings.title.length; n++){
		var totalW = titleSettings.width * (titleSettings.title[n].length);
		totalW = totalW + (titleSettings.spaceX * (titleSettings.title[n].length - 1));
		pos.startX = -(totalW/2);

		for(var k=0; k<titleSettings.title[n].length; k++){
			var bgW = titleSettings.width;
			var bgH = titleSettings.height;

			pos.startX += (bgW/2);

			$.word[n+'_title_'+k] = new createjs.Container();
			$.word[n+'_title_'+k].x = pos.startX;
			$.word[n+'_title_'+k].y = pos.startY;

			$.word[n+'_title_'+k+'_bg'] = new createjs.Shape();
			$.word[n+'_title_'+k+'_bg'].fillCommand = $.word[n+'_title_'+k+'_bg'].graphics.beginFill(titleSettings.bgColor).command;
			$.word[n+'_title_'+k+'_bg'].graphics.drawRoundRectComplex(-(bgW/2), -(bgH/2), bgW, bgH, titleSettings.round, titleSettings.round, titleSettings.round, titleSettings.round);

			$.word[n+'_title_'+k].bg = $.word[n+'_title_'+k+'_bg'];

			$.word[n+'_title_'+k+'_text'] = new createjs.Text();
			$.word[n+'_title_'+k+'_text'].font = titleSettings.fontSize + "px comfortaabold";
			$.word[n+'_title_'+k+'_text'].color = titleSettings.color;
			$.word[n+'_title_'+k+'_text'].textAlign = "center";
			$.word[n+'_title_'+k+'_text'].textBaseline='alphabetic';
			$.word[n+'_title_'+k+'_text'].text = titleSettings.title[n][k].toUpperCase();
			$.word[n+'_title_'+k+'_text'].y = titleSettings.offsetY;

			gameData.title.push($.word[n+'_title_'+k]);
			$.word[n+'_title_'+k].addChild($.word[n+'_title_'+k+'_bg'], $.word[n+'_title_'+k+'_press'], $.word[n+'_title_'+k+'_text']);
			titleContainer.addChild($.word[n+'_title_'+k]);

			pos.startX += (bgW/2) + titleSettings.spaceX;
		}
		pos.startY += titleSettings.height + titleSettings.spaceY;
	}
}

/*!
 * 
 * BUILD KEYBOARD - This is the function that runs to build keyboard
 * 
 */
function buildKeyboard(){
	var pos = {startX:0, startY:0};

	var totalH = (keyboardSettings.height * key_arr.length);
	totalH = totalH + (keyboardSettings.spaceY * (key_arr.length - 1));
	pos.startY = -(totalH/2);

	for(var n=0; n<key_arr.length; n++){
		var totalW = keyboardSettings.width * (key_arr[n].length);
		totalW = totalW + (keyboardSettings.spaceX * (key_arr[n].length - 1));

		if(key_arr[n].indexOf(keyboardSettings.enterCode) != -1){
			totalW -= keyboardSettings.width;
			totalW += keyboardSettings.widthEnter;
		}

		if(key_arr[n].indexOf(keyboardSettings.deleteCode) != -1){
			totalW -= keyboardSettings.width;
			totalW += keyboardSettings.widthDelete;
		}

		pos.startX = -(totalW/2);

		for(var k=0; k<key_arr[n].length; k++){
			var bgW = keyboardSettings.width;
			var bgH = keyboardSettings.height;
			if(key_arr[n][k] == keyboardSettings.enterCode){
				bgW = keyboardSettings.widthEnter;
			}

			if(key_arr[n][k] == keyboardSettings.deleteCode){
				bgW = keyboardSettings.widthDelete;
			}

			pos.startX += (bgW/2);

			$.key[n+'_'+k] = new createjs.Container();
			$.key[n+'_'+k].x = pos.startX;
			$.key[n+'_'+k].y = pos.startY;
			$.key[n+'_'+k].letter = key_arr[n][k];

			$.key[n+'_'+k+'_bg'] = new createjs.Shape();
			$.key[n+'_'+k+'_bg'].fillCommand = $.key[n+'_'+k+'_bg'].graphics.beginFill(keyboardSettings.bgColor).command;
			$.key[n+'_'+k+'_bg'].graphics.drawRoundRectComplex(-(bgW/2), -(bgH/2), bgW, bgH, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round);

			$.key[n+'_'+k+'_press'] = new createjs.Shape();
			$.key[n+'_'+k+'_press'].fillCommand = $.key[n+'_'+k+'_press'].graphics.beginFill(keyboardSettings.bgColorPress).command;
			$.key[n+'_'+k+'_press'].graphics.drawRoundRectComplex(-(bgW/2), -(bgH/2), bgW, bgH, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round);
			$.key[n+'_'+k+'_press'].alpha = 0;

			$.key[n+'_'+k].bg = $.key[n+'_'+k+'_bg'];
			$.key[n+'_'+k].bgPress = $.key[n+'_'+k+'_press'];

			if(key_arr[n][k] == keyboardSettings.deleteCode){
				$.key[n+'_'+k+'_text'] = new createjs.Bitmap(loader.getResult('itemDel'));
				centerReg($.key[n+'_'+k+'_text']);
			}else{
				$.key[n+'_'+k+'_text'] = new createjs.Text();
				$.key[n+'_'+k+'_text'].font = keyboardSettings.fontSize + "px comfortaabold";
				$.key[n+'_'+k+'_text'].color = keyboardSettings.color;
				$.key[n+'_'+k+'_text'].textAlign = "center";
				$.key[n+'_'+k+'_text'].textBaseline='alphabetic';
				$.key[n+'_'+k+'_text'].text = key_arr[n][k].toUpperCase();
				$.key[n+'_'+k+'_text'].y = keyboardSettings.offsetY;
			}

			if(key_arr[n][k] != keyboardSettings.deleteCode && key_arr[n][k] != keyboardSettings.enterCode){
				gameData.hint.push(key_arr[n][k]);
			}

			$.key[n+'_'+k].cursor = "pointer";
			$.key[n+'_'+k].addEventListener("click", function(evt) {
				matchKeyboard(evt.currentTarget.letter);
			});
			
			$.key[n+'_'+k].addChild($.key[n+'_'+k+'_bg'], $.key[n+'_'+k+'_press'], $.key[n+'_'+k+'_text']);
			keyboardContainer.addChild($.key[n+'_'+k]);

			pos.startX += (bgW/2) + keyboardSettings.spaceX;
		}
		pos.startY += keyboardSettings.height + keyboardSettings.spaceY;
	}

	//giveup
	var bgW = keyboardSettings.widthGiveup;
	var bgH = keyboardSettings.height;

	$.key['giveup'] = new createjs.Container();
	$.key['giveup'].letter = 'giveup';
	$.key['giveup_bg'] = new createjs.Shape();
	$.key['giveup_bg'].fillCommand = $.key['giveup_bg'].graphics.beginFill(keyboardSettings.bgColor).command;
	$.key['giveup_bg'].graphics.drawRoundRectComplex(-(bgW/2), -(bgH/2), bgW, bgH, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round);

	$.key['giveup_press'] = new createjs.Shape();
	$.key['giveup_press'].fillCommand = $.key['giveup_press'].graphics.beginFill(keyboardSettings.bgColorPress).command;
	$.key['giveup_press'].graphics.drawRoundRectComplex(-(bgW/2), -(bgH/2), bgW, bgH, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round);
	$.key['giveup_press'].alpha = 0;

	$.key['giveup'].bg = $.key['giveup_bg'];
	$.key['giveup'].bgPress = $.key['giveup_press'];

	$.key['giveup_text'] = new createjs.Text();
	$.key['giveup_text'].font = keyboardSettings.fontSize + "px comfortaabold";
	$.key['giveup_text'].color = keyboardSettings.color;
	$.key['giveup_text'].textAlign = "center";
	$.key['giveup_text'].textBaseline='alphabetic';
	$.key['giveup_text'].text = textDisplay.giveup;
	$.key['giveup_text'].y = keyboardSettings.offsetY;

	$.key['giveup'].cursor = "pointer";
	$.key['giveup'].addEventListener("click", function(evt) {
		matchKeyboard(evt.currentTarget.letter);
	});
	
	$.key['giveup'].addChild($.key['giveup_bg'], $.key['giveup_press'], $.key['giveup_text']);
	
	//hint
	var bgW = keyboardSettings.widthHint;
	var bgH = keyboardSettings.height;

	$.key['hint'] = new createjs.Container();
	$.key['hint'].letter = 'hint';
	$.key['hint_bg'] = new createjs.Shape();
	$.key['hint_bg'].fillCommand = $.key['hint_bg'].graphics.beginFill(keyboardSettings.bgColor).command;
	$.key['hint_bg'].graphics.drawRoundRectComplex(-(bgW/2), -(bgH/2), bgW, bgH, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round);

	$.key['hint_press'] = new createjs.Shape();
	$.key['hint_press'].fillCommand = $.key['hint_press'].graphics.beginFill(keyboardSettings.bgColorPress).command;
	$.key['hint_press'].graphics.drawRoundRectComplex(-(bgW/2), -(bgH/2), bgW, bgH, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round, keyboardSettings.round);
	$.key['hint_press'].alpha = 0;

	$.key['hint'].bg = $.key['hint_bg'];
	$.key['hint'].bgPress = $.key['hint_press'];

	$.key['hint_text'] = new createjs.Text();
	$.key['hint_text'].font = keyboardSettings.fontSize + "px comfortaabold";
	$.key['hint_text'].color = keyboardSettings.color;
	$.key['hint_text'].textAlign = "center";
	$.key['hint_text'].textBaseline='alphabetic';
	$.key['hint_text'].text = textDisplay.hint;
	$.key['hint_text'].y = keyboardSettings.offsetY;

	$.key['hint'].cursor = "pointer";
	$.key['hint'].addEventListener("click", function(evt) {
		matchKeyboard(evt.currentTarget.letter);
	});

	$.key['hint'].addChild($.key['hint_bg'], $.key['hint_press'], $.key['hint_text']);

	gameContainer.addChild($.key['giveup'], $.key['hint']);
}

/*!
 * 
 * WORD LISTS - This is the function that runs to build word lists
 * 
 */
function buildWordLists(){
	wordsListContainer.removeAllChildren();
	var pos = {startX:0, startY:0};

	var totalH = (wordsSettings.height/2);
	pos.startY = totalH;

	for(var n=0; n<wordsSettings.chances; n++){
		var totalW = wordsSettings.width * (gameData.totalLetters);
		totalW = totalW + (wordsSettings.spaceX * (gameData.totalLetters - 1));

		pos.startX = -(totalW/2);

		for(var k=0; k<gameData.totalLetters; k++){
			var bgW = wordsSettings.width;
			var bgH = wordsSettings.height;

			pos.startX += (bgW/2);
			
			$.word[n+'_'+k] = new createjs.Container();
			$.word[n+'_'+k].x = pos.startX;
			$.word[n+'_'+k].y = $.word[n+'_'+k].oriY = pos.startY;

			$.word[n+'_'+k+'_bg'] = new createjs.Shape();
			$.word[n+'_'+k+'_bg'].fillCommand = $.word[n+'_'+k+'_bg'].graphics.beginFill(wordsSettings.bgColor).command;
			$.word[n+'_'+k+'_bg'].graphics.drawRoundRectComplex(-(bgW/2), -(bgH/2), bgW, bgH, wordsSettings.round, wordsSettings.round, wordsSettings.round, wordsSettings.round);
			$.word[n+'_'+k].bg = $.word[n+'_'+k+'_bg'];

			$.word[n+'_'+k+'_text'] = new createjs.Text();
			$.word[n+'_'+k+'_text'].font = wordsSettings.fontSize + "px comfortaabold";
			$.word[n+'_'+k+'_text'].color = wordsSettings.color;
			$.word[n+'_'+k+'_text'].textAlign = "center";
			$.word[n+'_'+k+'_text'].textBaseline='alphabetic';
			$.word[n+'_'+k+'_text'].text = '';
			$.word[n+'_'+k+'_text'].x = 0;
			$.word[n+'_'+k+'_text'].y = wordsSettings.offsetY;
			
			$.word[n+'_'+k].addChild($.word[n+'_'+k+'_bg'], $.word[n+'_'+k+'_text'])
			wordsListContainer.addChild($.word[n+'_'+k]);

			pos.startX += (bgW/2) + wordsSettings.spaceX;
		}
		pos.startY += wordsSettings.height + wordsSettings.spaceY;
	}
}

function appendFocusFrame(){
	$('#mainHolder').prepend('<div id="focus" style="position:absolute; width:100%; height:100%; z-index:1000;"></div');
	$('#focus').click(function(){
		$('#focus').remove();
	});	
}


/*!
 * 
 * KEYBOARD EVENTS - This is the function that runs for keyboard events
 * 
 */
function keydown(event) {
	var letter = String.fromCharCode(event.which);

	if(event.keyCode == keyboardSettings.enterKeyCode){
		letter = keyboardSettings.enterCode;
	}else if(event.keyCode == keyboardSettings.deleteKeyCode){
		letter = keyboardSettings.deleteCode;
	}else if(event.keyCode == keyboardSettings.upKeyCode){
		letter = keyboardSettings.upCode;
	}else if(event.keyCode == keyboardSettings.downKeyCode){
		letter = keyboardSettings.downCode;
	}

	matchKeyboard(letter.toLowerCase());
}

function keyup(event) {

}

/*!
 * 
 * TOGGLE POP - This is the function that runs to toggle popup overlay
 * 
 */
function togglePop(con){
	confirmContainer.visible = con;
}


/*!
 * 
 * DISPLAY PAGES - This is the function that runs to display pages
 * 
 */
var curPage=''
function goPage(page){
	curPage=page;
	
	mainContainer.visible = false;
	gameContainer.visible = false;
	resultContainer.visible = false;

	toggleTitleFlip(false);
	
	var targetContainer = null;
	switch(page){
		case 'main':
			targetContainer = mainContainer;
			toggleTitleFlip(true);

			buttonStart.visible = true;
			selectContainer.visible = false;
		break;
		
		case 'game':
			targetContainer = gameContainer;
			startGame();
		break;
		
		case 'result':
			targetContainer = resultContainer;
			stopGame();
			togglePop(false);
			
			gameData.resultNum = -1;
			gameData.resultSound = false;
			showResultStats();
			saveGame(playerData.score);
		break;
	}
	
	if(targetContainer != null){
		targetContainer.visible = true;
		targetContainer.alpha = 0;
		TweenMax.to(targetContainer, .5, {alpha:1, overwrite:true});
	}
	
	resizeCanvas();
}

function showResultStats(){
	resultDescTxt.text = 0;
	tweenData.tweenScore = 0;

	var thisScore = 0;
	var thisTime = 0;
	var thisComplete = true;

	if(gameData.resultNum == -1){
		for(var n=0; n<playerData.scores.length; n++){
			thisScore += playerData.scores[n].score;
			thisTime += playerData.scores[n].timer;

			if(!playerData.scores[n].complete){
				thisComplete = false;
			}
		}
		playerData.score = thisScore;

		if(thisComplete){
			if(!gameData.resultSound){
				gameData.resultSound = true;
				playSound('soundComplete');
			}
			resultTitleTxt.text = textDisplay.resultTitleComplete;
		}else{
			if(!gameData.resultSound){
				gameData.resultSound = true;
				playSound('soundOver');
			}
			resultTitleTxt.text = textDisplay.resultTitleOver;
		}
	}else{
		thisScore = playerData.scores[gameData.resultNum].score;
		thisTime = playerData.scores[gameData.resultNum].timer;

		resultTitleTxt.text = textDisplay.resultWord.replace('[NUMBER]', gameData.resultNum+1);
	}

	TweenMax.to(tweenData, .5, {tweenScore:thisScore, overwrite:true, onUpdate:function(){
		resultDescTxt.text = textDisplay.resultDesc.replace('[NUMBER]', Math.round(tweenData.tweenScore));
	}});

	resultTimerTxt.text = textDisplay.resultTimer.replace('[NUMBER]', millisecondsToTimeGame(thisTime));
	
	buttonResultArrowL.visible = false;
	buttonResultArrowR.visible = false;

	if(playerData.scores.length > 1){
		if(gameData.resultNum >= 0){
			buttonResultArrowL.visible = true;
		}

		if(gameData.resultNum < playerData.scores.length-1){
			buttonResultArrowR.visible = true;
		}
	}
}

/*!
 * 
 * TITLE ANIMATION - This is the function that runs for title animation
 * 
 */
function toggleTitleFlip(con){
	if(con){
		TweenMax.to(titleContainer, 1, {overwrite:true, onComplete:function(){
			var obj = gameData.title[Math.floor(Math.random()*gameData.title.length)];
			animateTitleFlip(obj);
			toggleTitleFlip(true);
		}});
	}else{
		for(var n=0; n<gameData.title.length; n++){
			gameData.title[n].bg.fillCommand.style = titleSettings.bgColor;
			gameData.title[n].scaleX = gameData.title[n].scaleY = 1;
			TweenMax.killTweensOf(gameData.title[n]);
		}
		TweenMax.killTweensOf(titleContainer);
	}
}

function animateTitleFlip(obj){
	titleContainer.setChildIndex( obj, titleContainer.numChildren-1);

	TweenMax.to(obj, .2, {scaleY:0, overwrite:true, onComplete:function(){
		var randomColor = randomIntFromInterval(1,3);
		if(randomColor == 1){
			obj.bg.fillCommand.style = titleSettings.bgColor;
		}else if(randomColor == 2){
			obj.bg.fillCommand.style = titleSettings.bgColorPosition;
		}else if(randomColor == 3){
			obj.bg.fillCommand.style = titleSettings.bgColorCorrect;	
		}
		TweenMax.to(obj, 1, {scaleY:1, overwrite:true, ease: Elastic. easeOut.config( 1, 0.3), onComplete:function(){
			
		}});
	}});
}

/*!
 * 
 * START GAME - This is the function that runs to start game
 * 
 */
function startGame(){
	gameData.totalLetters = words_arr[gameData.wordNum].letters;
	gameData.wordCount = 0;

	playerData.scores = [];
	buildWordLists();
	findWord();
}

 /*!
 * 
 * STOP GAME - This is the function that runs to stop play game
 * 
 */
function stopGame(){
	gameData.paused = true;
	TweenMax.killAll(false, true, false);
}

function saveGame(score){
	if ( typeof toggleScoreboardSave == 'function' ) { 
		$.scoreData.score = score;
		if(typeof type != 'undefined'){
			$.scoreData.type = type;	
		}
		toggleScoreboardSave(true);
	}

	/*$.ajax({
      type: "POST",
      url: 'saveResults.php',
      data: {score:score},
      success: function (result) {
          console.log(result);
      }
    });*/
}

/*!
 * 
 * FIND WORD - This is the function that runs to find word
 * 
 */
function findWord(){
	gameData.paused = false;
	$.key['giveup'].visible = wordsSettings.giveup;
	$.key['hint'].visible = wordsSettings.hint;

	gameData.complete = false;
	gameData.chances = 0;
	gameData.letters = [];
	gameData.score = [];
	gameData.animating = false;

	gameData.keyboard.correct = [];
	gameData.keyboard.position = [];
	gameData.keyboard.notexist = [];

	//reset keyboard
	for(var n=0; n<key_arr.length; n++){
		for(var k=0; k<key_arr[n].length; k++){
			$.key[n+'_'+k+'_bg'].alpha = 1;
			$.key[n+'_'+k+'_bg'].fillCommand.style = keyboardSettings.bgColor;
		}
	}

	//reset word lists
	for(var n=0; n<wordsSettings.chances; n++){
		for(var k=0; k<gameData.totalLetters; k++){
			$.word[n+'_'+k+'_text'].text = '';
			$.word[n+'_'+k+'_bg'].fillCommand.style = wordsSettings.bgColor;
			$.word[n+'_'+k].bg.nextColor = '';
			$.word[n+'_'+k].y = $.word[n+'_'+k].oriY;
			$.word[n+'_'+k].scaleX = $.word[n+'_'+k].scaleY = 1;
		}
	}

	gameData.answer = gameData.words[gameData.wordNum][Math.floor(Math.random()*gameData.words[gameData.wordNum].length)];
	console.log(gameData.answer);

	resizeWordLists();

	playerData.score = wordsSettings.point;
	updateScore();
	updateTotal();

	gameStatusTxt.alpha = 0;
	toggleGameTimer(true);

	wordsContainer.alpha = 0;
	TweenMax.to(wordsContainer, .5, {alpha:1, overwrite:true, onUpdate:function(){
		
	}});
}

function resizeWordLists(){
	wordsContainer.scaleX = wordsContainer.scaleY = 1;
	keyboardContainer.scaleX = keyboardContainer.scaleY = 1;
	
	var totalWordListH = wordsSettings.chances * wordsSettings.height;
	totalWordListH += (wordsSettings.chances-1) * wordsSettings.spaceY;

	$.key['giveup'].y = totalWordListH + 190;
	$.key['hint'].y = totalWordListH + 190;

	$.key['giveup'].scaleX = $.key['giveup'].scaleY = 1;
	$.key['hint'].scaleX = $.key['hint'].scaleY = 1;

	gameStatusTxt.y = totalWordListH + 35;
	
	var buttonScalePercent = 1;
	if(viewport.isLandscape){
		$.key['hint'].y = scoreContainer.y + 60;
		$.key['giveup'].y = scoreContainer.y + 60;
		var scalePercent = 370/totalWordListH;
		wordsContainer.scaleX = wordsContainer.scaleY = scalePercent;

		buttonScalePercent = .8;
		keyboardContainer.scaleX = keyboardContainer.scaleY = buttonScalePercent;
		$.key['giveup'].scaleX = $.key['giveup'].scaleY = buttonScalePercent;
		$.key['hint'].scaleX = $.key['hint'].scaleY = buttonScalePercent;
	}

	if($.key['giveup'].visible && $.key['hint'].visible){
		$.key['giveup'].x = scoreContainer.x + (((keyboardSettings.widthGiveup/2) + 10) * buttonScalePercent);
		$.key['hint'].x = scoreContainer.x - (((keyboardSettings.widthHint/2) + 10) * buttonScalePercent);
	}else{
		$.key['giveup'].x = scoreContainer.x;
		$.key['hint'].x = scoreContainer.x;
	}

	updateScore();
}

/*!
 * 
 * UPDATE SCORE & TOTAL - This is the function that runs to update score and total
 * 
 */
function updateScore(){
	var barW = gameData.totalLetters * wordsSettings.width;
	barW += (gameData.totalLetters-1) * wordsSettings.spaceX;
	var barH = wordsSettings.pointBar.height;

	if(viewport.isLandscape){
		barW = barW/3;
	}

	gameScoreBg.graphics.clear();
	gameScoreBg.graphics.beginFill(wordsSettings.pointBar.bgColor).drawRoundRectComplex(-(barW/2), -(barH/2), barW, barH, wordsSettings.pointBar.round, wordsSettings.pointBar.round, wordsSettings.pointBar.round, wordsSettings.pointBar.round);
	
	TweenMax.to(gameScore, .5, {barW:playerData.score, overwrite:true, onUpdate:function(){
		gameScoreTxt.text = textDisplay.point.replace('[NUMBER]', Math.round(gameScore.barW));

		var percent = gameScore.barW/100 * barW;
		percent = percent < 10 ? 10 : percent;
		gameScore.graphics.clear().beginFill(wordsSettings.pointBar.color).drawRoundRectComplex(-(barW/2), -(barH/2), percent, barH, wordsSettings.pointBar.round, wordsSettings.pointBar.round, wordsSettings.pointBar.round, wordsSettings.pointBar.round);
	}});
}

function updateTotal(){
	var totalText = textDisplay.total.replace('[NUMBER]', gameData.wordCount+1);
	totalText = totalText.replace('[TOTAL]', wordsSettings.totalWordPlay);
	gameTotalTxt.text = totalText;

	if(wordsSettings.totalWordPlay == 1){
		totalContainer.visible = false;
	}
}

/*!
 * 
 * MATCH KEYBOARD - This is the function that runs to match keyboard
 * 
 */
function matchKeyboard(letter){
	if(gameData.paused){
		return;
	}

	if(gameData.animating){
		return;
	}

	for(var n=0; n<key_arr.length; n++){
		for(var k=0; k<key_arr[n].length; k++){
			if(letter == key_arr[n][k].toLowerCase()){
				if(letter == keyboardSettings.enterCode){
					playSound('soundEnter');
				}else{
					playSound('soundKey');
				}
				animateKeyboard($.key[n+'_'+k].bgPress);
				updateLetter(letter);
			}
		}
	}

	if(letter == 'giveup'){
		gameData.complete = false;
		playSound('soundEnter')
		animateKeyboard($.key['giveup'].bgPress);

		playerData.score = 0;
		updateScore();
		$.key['giveup'].visible = false;
		$.key['hint'].visible = false;
		displayStatus('giveup');
		endGame(3);
	}

	if(letter == 'hint'){
		playSound('soundEnter')
		animateKeyboard($.key['hint'].bgPress);

		$.key['hint'].visible = false;

		resizeWordLists();
		showWordHint();
	}
}

/*!
 * 
 * SHOW HINT - This is the function that runs to show hint
 * 
 */
function showWordHint(){
	shuffle(gameData.hint);

	var wordArr = [];
	for(var n=0; n<gameData.answer.length; n++){
		wordArr.push(gameData.answer.substring(n,n+1));
	}

	var totalHint = wordsSettings.hintTotal;
	for(var n=0; n<gameData.hint.length; n++){
		var currentLetter = gameData.hint[n];
		if(wordArr.indexOf(currentLetter) == -1 && gameData.keyboard.notexist.indexOf(currentLetter) == -1){
			gameData.keyboard.notexist.push(currentLetter);
			totalHint--;
		}

		if(totalHint == 0){
			n = gameData.hint.length;
		}
	}

	highlightKeyboard();

	var hintScoreDeduct = Math.floor(wordsSettings.point/100 * ((wordsSettings.chances-gameData.chances)*2));
	playerData.score -= hintScoreDeduct;
	updateScore();
}

function animateKeyboard(obj){
	var animationSpeed = .2;
	obj.alpha = 0;
	TweenMax.to(obj, animationSpeed, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(obj, animationSpeed, {alpha:0, overwrite:true, onComplete:function(){
			
		}});
	}});
}

/*!
 * 
 * UPDATE LETTERS - This is the function that runs to update letters
 * 
 */
function updateLetter(letter){
	if(letter == keyboardSettings.enterCode){
		if(gameData.letters.length == gameData.totalLetters){
			checkWord();
		}
	}else if(letter == keyboardSettings.deleteCode){
		if(gameData.letters.length > 0){
			$.word[gameData.chances+'_'+(gameData.letters.length-1)+'_text'].text = '';
			gameData.letters.splice(gameData.letters.length-1,1);
		}
	}else{
		if(gameData.letters.length < gameData.totalLetters){
			gameData.letters.push(letter);
			$.word[gameData.chances+'_'+(gameData.letters.length-1)+'_text'].text = letter.toUpperCase();
		}
	}
}

/*!
 * 
 * CHECK WORD - This is the function that runs to check word
 * 
 */
function checkWord(){
	var word = '';
	for(var n=0; n<gameData.letters.length; n++){
		word += gameData.letters[n];
	}

	if(gameData.words[gameData.wordNum].indexOf(word) != -1){
		highlightWord(word);
	}else{
		if(wordsSettings.autoClear){
			for(var k=0; k<gameData.totalLetters; k++){
				$.word[gameData.chances+'_'+k+'_text'].text = '';
			}
			gameData.letters = [];
		}
		playSound('soundError');
		displayStatus('error');
	}
}

/*!
 * 
 * DISPLAY STATUS - This is the function that runs to display status
 * 
 */
function displayStatus(status){
	var showText = '';
	if(status == 'error'){
		showText = textDisplay.noWord;
	}else if(status == 'complete'){
		showText = textDisplay.wordComplete;
	}else if(status == 'chances'){
		showText = textDisplay.noChances;
	}else if(status == 'giveup'){
		showText = textDisplay.wordReveal.replace('[WORD]', gameData.answer.toUpperCase());
	}
	gameStatusTxt.text = showText;
	gameStatusTxt.alpha = 0;
	TweenMax.to(gameStatusTxt, .5, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(gameStatusTxt, .5, {delay:1.5, alpha:0, overwrite:true, onComplete:function(){

		}});
	}});

	TweenMax.to($.key['giveup'], .5, {alpha:0, overwrite:true, onComplete:function(){
		TweenMax.to($.key['giveup'], .5, {delay:1.5, alpha:1, overwrite:true, onComplete:function(){

		}});
	}});

	TweenMax.to($.key['hint'], .5, {alpha:0, overwrite:true, onComplete:function(){
		TweenMax.to($.key['hint'], .5, {delay:1.5, alpha:1, overwrite:true, onComplete:function(){

		}});
	}});
}

/*!
 * 
 * HIGHLIGHT - This is the function that runs to highlight word and keyboard
 * 
 */
function highlightWord(word){
	var chanceScore = Math.floor(wordsSettings.point/wordsSettings.chances);
	var letterCorrectScore = Math.floor(chanceScore/gameData.totalLetters);
	var letterPositionScore = Math.floor(letterCorrectScore/2);
	playerData.score -= chanceScore;

	var excludeIndex_arr = [];
	var lettersLeft_arr = [];
	var correctCount = 0;

	//match correct word
	for(var n=0; n<gameData.totalLetters; n++){
		if(word.substring(n,n+1) == gameData.answer.substring(n,n+1)){
			excludeIndex_arr.push(n);
			$.word[gameData.chances+'_'+n+'_bg'].nextColor = wordsSettings.bgColorCorrect;
			gameData.keyboard.correct.push(gameData.answer.substring(n,n+1));
			correctCount++;

			if(gameData.score.indexOf(n) == -1){
				gameData.score.push(n);
			}
			playerData.score += letterCorrectScore;
		}else{
			lettersLeft_arr.push(gameData.answer.substring(n,n+1));
		}
	}

	//match wrong position word
	for(var n=0; n<gameData.totalLetters; n++){
		if(excludeIndex_arr.indexOf(n) == -1){
			var possibleIndex = lettersLeft_arr.indexOf(word.substring(n,n+1));
			if(possibleIndex != -1){
				playerData.score += letterPositionScore;
				lettersLeft_arr.splice(possibleIndex, 1);
				excludeIndex_arr.push(n);
				$.word[gameData.chances+'_'+n+'_bg'].nextColor = wordsSettings.bgColorPosition;
				gameData.keyboard.position.push(word.substring(n,n+1));
			}
		}
	}

	//match not exist word
	for(var n=0; n<gameData.totalLetters; n++){
		if(excludeIndex_arr.indexOf(n) == -1){
			$.word[gameData.chances+'_'+n+'_bg'].nextColor = wordsSettings.bgColorNotExist;
			gameData.keyboard.notexist.push(word.substring(n,n+1));
		}
	}

	if(correctCount == gameData.totalLetters){
		$.key['giveup'].visible = false;
		$.key['hint'].visible = false;
		if(gameData.chances == 0){
			playerData.score = wordsSettings.point;
		}
		gameData.complete = true;
		gameData.completeAnimation = false;
	}

	playSound('soundNothing');
	animateWords('flip');
}

function highlightKeyboard(){
	for(var n=0; n<key_arr.length; n++){
		for(var k=0; k<key_arr[n].length; k++){
			if(gameData.keyboard.notexist.indexOf(key_arr[n][k]) != -1){
				$.key[n+'_'+k+'_bg'].fillCommand.style = wordsSettings.bgColorNotExist;
				$.key[n+'_'+k+'_bg'].alpha = 0;
				TweenMax.to($.key[n+'_'+k+'_bg'], .5, {alpha:1, overwrite:true});
			}
		}
	}

	for(var n=0; n<key_arr.length; n++){
		for(var k=0; k<key_arr[n].length; k++){
			if(gameData.keyboard.position.indexOf(key_arr[n][k]) != -1){
				$.key[n+'_'+k+'_bg'].fillCommand.style = wordsSettings.bgColorPosition;
				$.key[n+'_'+k+'_bg'].alpha = 0;
				TweenMax.to($.key[n+'_'+k+'_bg'], .5, {alpha:1, overwrite:true});
			}
		}
	}

	for(var n=0; n<key_arr.length; n++){
		for(var k=0; k<key_arr[n].length; k++){
			if(gameData.keyboard.correct.indexOf(key_arr[n][k]) != -1){
				$.key[n+'_'+k+'_bg'].fillCommand.style = wordsSettings.bgColorCorrect;
				$.key[n+'_'+k+'_bg'].alpha = 0;
				TweenMax.to($.key[n+'_'+k+'_bg'], .5, {alpha:1, overwrite:true});
			}
		}
	}
}

/*!
 * 
 * ANIMATE WORD - This is the function that runs to animate word
 * 
 */
function animateWords(con){
	gameData.animating = true;
	gameData.animateCount = 0;
	for(var n=0; n<gameData.totalLetters; n++){
		if(con == 'flip'){
			animateFlip($.word[gameData.chances+'_'+n], n*.2);
		}else{
			animateBounce($.word[gameData.chances+'_'+n], n*.2);
		}
	}
}

function animateFlip(obj, delay){
	TweenMax.to(obj, .2, {delay:delay, scaleY:0, overwrite:true, onComplete:function(){
		if(obj.bg.nextColor != ''){
			obj.bg.fillCommand.style = obj.bg.nextColor;
		}
		TweenMax.to(obj, 1, {scaleY:1, overwrite:true, ease: Elastic. easeOut.config( 1, 0.3), onComplete:function(){
			animateLetterComplete();
		}});
	}});
}

function animateBounce(obj, delay){
	TweenMax.to(obj, .2, {delay:delay, y:obj.oriY-20, overwrite:true, onComplete:function(){
		if(obj.bg.nextColor != ''){
			obj.bg.fillCommand.style = obj.bg.nextColor;
		}
		TweenMax.to(obj, 1, {y:obj.oriY, overwrite:true, ease: Elastic. easeOut.config( 1, 0.3), onComplete:function(){
			animateLetterComplete();
		}});
	}});
}

function animateLetterComplete(){
	gameData.animateCount++;
	if(gameData.animateCount >= gameData.totalLetters){
		gameData.animating = false;

		if(gameData.complete){
			if(gameData.completeAnimation){
				endGame(2);
			}else{
				gameData.completeAnimation = true;
				playSound('soundSuccess');
				displayStatus('complete');
				animateWords('bounce');
			}
		}else{
			playSound('soundSomething');
			highlightKeyboard();
			gameData.chances++;
			gameData.letters = [];
			updateScore();

			if(gameData.chances >= wordsSettings.chances){
				displayStatus('chances');
				endGame(3);
			}
		}
	}
}

/*!
 * 
 * GAME TIMER - This is the function that runs for game timer
 * 
 */
function toggleGameTimer(con){	
	if(con){
		timeData.startDate = new Date();
	}else{
		
	}
	timeData.enable = con;
}


/*!
 * 
 * UPDATE GAME - This is the function that runs to loop game update
 * 
 */
function updateGame(){
	if(!gameData.paused){
		if(timeData.enable){
			timeData.nowDate = new Date();
			timeData.elapsedTime = Math.floor((timeData.nowDate.getTime() - timeData.startDate.getTime()));
			timeData.timer = (timeData.elapsedTime);
		}
	}
}

/*!
 * 
 * END GAME - This is the function that runs for game end
 * 
 */
function endGame(tween){
	gameData.paused = true;
	toggleGameTimer(false);

	playerData.scores.push({timer:timeData.timer, score:playerData.score, complete:gameData.complete});
	gameData.wordCount++;

	TweenMax.to(gameContainer, tween, {overwrite:true, onComplete:function(){
		if(gameData.wordCount >= wordsSettings.totalWordPlay){
			goPage('result')
		}else{
			findWord();
		}
	}});
}

/*!
 * 
 * MILLISECONDS CONVERT - This is the function that runs to convert milliseconds to time
 * 
 */
function millisecondsToTimeGame(milli) {
	var milliseconds = milli % 1000;
	var seconds = Math.floor((milli / 1000) % 60);
	var minutes = Math.floor((milli / (60 * 1000)) % 60);
	
	if(seconds<10){
		seconds = '0'+seconds;  
	}
	
	if(minutes<10){
		minutes = '0'+minutes;  
	}
	
	return minutes+':'+seconds;
}

/*!
 * 
 * OPTIONS - This is the function that runs to toggle options
 * 
 */

function toggleOption(){
	if(optionsContainer.visible){
		optionsContainer.visible = false;
	}else{
		optionsContainer.visible = true;
	}
}

function loadJSON(){
	buttonStart.visible = false;
	loadingTxt.visible = true;

	loopJSONFile();
}

function loopJSONFile(){
	$.getJSON(words_arr[gameData.wordNum].file, function(data){
		gameData.words.push([]);
		gameData.words[gameData.wordNum] = data;

		gameData.wordNum++;
		if(gameData.wordNum < words_arr.length){
			loopJSONFile();
		}else{
			gameData.wordNum = 0;
			buttonStart.visible = true;
			loadingTxt.visible = false;
		}
	}).fail(function(){
		//console.log("An error has occurred.");
	});
}


/*!
 * 
 * OPTIONS - This is the function that runs to mute and fullscreen
 * 
 */
function toggleGameMute(con){
	buttonSoundOff.visible = false;
	buttonSoundOn.visible = false;
	toggleMute(con);
	if(con){
		buttonSoundOn.visible = true;
	}else{
		buttonSoundOff.visible = true;	
	}
}

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

/*!
 * 
 * SHARE - This is the function that runs to open share url
 * 
 */
function share(action){
	gtag('event','click',{'event_category':'share','event_label':action});
	
	var loc = location.href
	loc = loc.substring(0, loc.lastIndexOf("/") + 1);
	
	var title = '';
	var text = '';
	
	title = shareTitle.replace("[SCORE]", playerData.score);
	text = shareMessage.replace("[SCORE]", playerData.score);
	
	var shareurl = '';
	
	if( action == 'twitter' ) {
		shareurl = 'https://twitter.com/intent/tweet?url='+loc+'&text='+text;
	}else if( action == 'facebook' ){
		shareurl = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(loc+'share.php?desc='+text+'&title='+title+'&url='+loc+'&thumb='+loc+'share.jpg&width=590&height=300');
	}else if( action == 'google' ){
		shareurl = 'https://plus.google.com/share?url='+loc;
	}else if( action == 'whatsapp' ){
		shareurl = "whatsapp://send?text=" + encodeURIComponent(text) + " - " + encodeURIComponent(loc);
	}
	
	window.open(shareurl);
}