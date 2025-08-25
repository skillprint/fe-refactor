////////////////////////////////////////////////////////////
// GAME
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */
 var puzzleSettings = {
							stroke:8, //stroke size
							strokeColor:'#000', //sroke color
							space:3, //grid spacing
							backgroundColor:'#003366', //background color
							divideSize:14, //pipe divide size
						};

//pipes array assets						
var pipeColors = [
					{
						color:'#ff0000',
						assets:['assets/pipe_01a.png',
								'assets/pipe_01b.png',
								'assets/pipe_01c.png',
								'assets/pipe_01d.png',
								'assets/pipe_01e.png',
								'assets/pipe_01f.png'
								]
					},
					{
						color:'#0E4BA5',
						assets:['assets/pipe_02a.png',
								'assets/pipe_02b.png',
								'assets/pipe_02c.png',
								'assets/pipe_02d.png',
								'assets/pipe_02e.png',
								'assets/pipe_02f.png'
								]
					},
					{
						color:'#FF7F00',
						assets:['assets/pipe_03a.png',
								'assets/pipe_03b.png',
								'assets/pipe_03c.png',
								'assets/pipe_03d.png',
								'assets/pipe_03e.png',
								'assets/pipe_03f.png'
								]
					},
					{
						color:'#FFD24D',
						assets:['assets/pipe_04a.png',
								'assets/pipe_04b.png',
								'assets/pipe_04c.png',
								'assets/pipe_04d.png',
								'assets/pipe_04e.png',
								'assets/pipe_04f.png'
								]
					},
					{
						color:'#00D900',
						assets:['assets/pipe_05a.png',
								'assets/pipe_05b.png',
								'assets/pipe_05c.png',
								'assets/pipe_05d.png',
								'assets/pipe_05e.png',
								'assets/pipe_05f.png'
								]
					},
					{
						color:'#CF0BFF',
						assets:['assets/pipe_06a.png',
								'assets/pipe_06b.png',
								'assets/pipe_06c.png',
								'assets/pipe_06d.png',
								'assets/pipe_06e.png',
								'assets/pipe_06f.png'
								]
					},
					{
						color:'#38B6FF',
						assets:['assets/pipe_07a.png',
								'assets/pipe_07b.png',
								'assets/pipe_07c.png',
								'assets/pipe_07d.png',
								'assets/pipe_07e.png',
								'assets/pipe_07f.png'
								]
					}
				];
 
 var levelText = 'Level [NUMBER]'; //level text display
 var pipePercentText = 'Pipe : [NUMBER] PERCENT'; //pipe percent text display
 var levelCompleteText = 'LEVEL CLEAR'; //level complete text display
 
 var resultTitleText = 'LEVEL [NUMBER]'; //result level display
 var resultTimeText = 'TIME : [TIME]'; //result time display
 var exitMessage = 'Are you sure you want\nto quit the game'; //quit game message


//Social share, [SCORE] will replace with game score
var shareEnable = true; //toggle share
var shareText = 'SHARE YOUR SCORE'; //social share message
var shareTitle = 'Highscore on Pipe Flow Game at Level [LEVEL].';//social share score title
var shareMessage = 'Level [LEVEL] is mine new highscore on Pipe Flow Game! Try it now!'; //social share score message
				
/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
 
$.editor = {enable:false};
var gameData = {levelNum:0, paused:true, pressed:false, grid:[], pipes:[], currentPipe:null, currentPipeNum:-1, complete:false, stageLevelCompleted:0, stageComplete:false, stageUnlockNum:-1, pipeWidth:110, scalePercent:1};
var timeData = {enable:false, startDate:null, nowDate:null, timer:0};
var cookieName = 'pipeflow2019';

/*!
 * 
 * DATA UPDATE - This is the function that runs to update data
 * 
 */
function retrieveLevelData(){
	var curStage = Cookies.get(cookieName);
	if(curStage != undefined){
		gameData.stageLevelCompleted = Number(curStage);
		
		for(var p = 1; p <= selectData.total; p++){
			var startNum = (p-1) * selectData.max;
			var endNum = startNum + (selectData.max-1);
			if(gameData.stageLevelCompleted >= startNum && gameData.stageLevelCompleted <= endNum){
				selectData.page = p;
			}
		}
	}
}

function saveLevelData(){
	if(Number(gameData.levelNum)+1 > gameData.stageLevelCompleted){
		gameData.stageLevelCompleted = Number(gameData.levelNum)+1;
		gameData.stageUnlockNum = gameData.stageLevelCompleted;
		if(gameData.stageLevelCompleted >= levels_arr.length){
			gameData.stageUnlockNum = -1;	
		}
		Cookies.set(cookieName, gameData.stageLevelCompleted, {expires:360});
	}
}

/*!
 * 
 * GAME BUTTONS - This is the function that runs to setup button event
 * 
 */
function buildGameButton(){
	
	buttonStart.cursor = "pointer";
	buttonStart.addEventListener("click", function(evt) {
		playSound('soundClick');
		goPage('select');
	});
	
	//game
	stage.on("stagemousedown", function(evt) {
		if(!gameData.paused){
			gameData.pressed = true;
		}
	});
	
	stage.on("stagemousemove", function(evt) {
		if(!gameData.paused && !gameData.complete){
			/*for(var r=0; r<levels_arr[gameData.levelNum].row; r++){
				for(var c=0; c<levels_arr[gameData.levelNum].column; c++){
					var curRect = gameData.grid[r][c];
					var pt = curRect.globalToLocal(stage.mouseX, stage.mouseY);
					if (stage.mouseInBounds && curRect.hitTest(pt.x, pt.y)) {
						checkConnectRect(curRect);	
					}
				}	
			}*/
			if(gameData.pressed){
				checkRectCollision();
			}
		}
	});
	
	stage.on("stagemouseup", function(evt) {
		gameData.pressed = false;
	});
	
	buttonConfirm.cursor = "pointer";
	buttonConfirm.addEventListener("click", function(evt) {
		playSound('soundClick');
		toggleConfirm(false);
		stopGame(true);
		goPage('main');
	});
	
	buttonCancel.cursor = "pointer";
	buttonCancel.addEventListener("click", function(evt) {
		playSound('soundClick');
		toggleConfirm(false);
	});
	
	buttonQuitGame.cursor = "pointer";
	buttonQuitGame.addEventListener("click", function(evt) {
		playSound('soundClick');
		goPage('main');
	});
	
	buttonNextLevel.cursor = "pointer";
	buttonNextLevel.addEventListener("click", function(evt) {
		playSound('soundClick');
		gameData.levelNum++;
		goPage('game');
	});
	
	buttonRetry.cursor = "pointer";
	buttonRetry.addEventListener("click", function(evt) {
		playSound('soundClick');
		resetGrid();
	});
	
	//result
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
	
	//options
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
	
	buttonSettings.cursor = "pointer";
	buttonSettings.addEventListener("click", function(evt) {
		toggleOption();
	});
	
	buttonExit.cursor = "pointer";
	buttonExit.addEventListener("click", function(evt) {
		toggleConfirm(true);
		toggleOption();
	});
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
	selectContainer.visible = false;
	gameContainer.visible = false;
	resultContainer.visible = false;
	
	var targetContainer = null;
	switch(page){
		case 'main':
			stopSoundLoop('musicGame');
			playSoundLoop('musicMain');
			setSoundVolume('musicMain', .5);
			targetContainer = mainContainer;
		break;
		
		case 'select':
			targetContainer = selectContainer;
			selectPage(selectData.page);
		break;
		
		case 'game':
			if(!$.editor.enable){
				stopSoundLoop('musicMain');
				playSoundLoop('musicGame');
				setSoundVolume('musicGame', .2);
			}
			targetContainer = gameContainer;
			if(!$.editor.enable){
				startGame();
			}
		break;
		
		case 'result':
			targetContainer = resultContainer;
			stopGame();
			
			millisecondsToTime(timeData.timer);
			resultTitleTxt.text = resultTitleText.replace('[NUMBER]', gameData.levelNum+1);
			resultScoreTxt.text = resultTimeText.replace('[TIME]', millisecondsToTime(timeData.timer));
			saveLevelData();
			
			if(gameData.levelNum < levels_arr.length-1){
				buttonNextLevel.visible = true;
				buttonNextLevel.y = canvasH/100 * 46;
				buttonQuitGame.y = canvasH/100 * 55;	
			}else{
				buttonNextLevel.visible = false;
				buttonQuitGame.y = canvasH/100 * 50;	
			}
			
			saveGame(gameData.levelNum+1);
		break;
	}
	
	if(targetContainer != null){
		targetContainer.visible = true;
		targetContainer.alpha = 0;
		TweenMax.to(targetContainer, .5, {alpha:1, overwrite:true});
	}
	
	resizeCanvas();
}

function toggleConfirm(con){
	confirmContainer.visible = con;
	
	if(con){
		TweenMax.pauseAll(true, true);
		gameData.paused = true;
	}else{
		TweenMax.resumeAll(true, true);
		if(curPage == 'game'){
			gameData.paused = false;
		}
	}
}


/*!
 * 
 * SELECT LEVEL - This is the function that runs to display select levels
 * 
 */
var selectData = {page:0, total:1, max:20};
function buildSelectLevel(){
	selectData.total = levels_arr.length/selectData.max;
	
	if (String(selectData.total).indexOf('.') > -1){
		selectData.total=Math.floor(selectData.total)+1;
	}
	toggleSelect(false);
	
	buttonPrev.cursor = "pointer";
	buttonPrev.addEventListener("mousedown", function(evt) {
		playSound('soundClick');
		toggleSelect(false);
	});
	
	buttonNext.cursor = "pointer";
	buttonNext.addEventListener("mousedown", function(evt) {
		playSound('soundClick');
		toggleSelect(true);
	});
	
	for(var n=0;n<levels_arr.length;n++){
		$.selectStage['icon_'+n].name = n;
		$.selectStage['icon_'+n].cursor = "pointer";
		$.selectStage['icon_'+n].addEventListener("mousedown", function(evt) {
			if(Number(evt.target.name) <= gameData.stageLevelCompleted){
				playSound('soundClick');
				gameData.levelNum = Number(evt.target.name);
				goPage('game');
			}
		});
	}
}

function toggleSelect(con){
	if(con){
		selectData.page++;
		selectData.page = selectData.page > selectData.total ? selectData.total : selectData.page;
	}else{
		selectData.page--;
		selectData.page = selectData.page < 1 ? 1 : selectData.page;
	}
	selectPage(selectData.page);
}

function selectPage(num){
	selectData.page = num;
	
	var startNum = (selectData.page-1) * selectData.max;
	var endNum = startNum + (selectData.max-1);
	
	for(var n=0;n<levels_arr.length;n++){
		if(n >= startNum && n <= endNum){
			$.selectStage['icon_'+n].visible = true;
			$.selectStage['iconLock_'+n].visible = true;
			$.selectStage['iconText_'+n].visible = false;
			if(n <= gameData.stageLevelCompleted){
				if(gameData.stageUnlockNum == n){
					gameData.stageUnlockNum = -1;
					$.selectStage['iconText_'+n].alpha = 0;
					$.selectStage['iconText_'+n].visible = true;
					
					TweenMax.to($.selectStage['iconLock_'+n], 0, {delay:.5, overwrite:true, onComplete:unlockTween, onCompleteParams:[n]});
				}else{
					$.selectStage['iconText_'+n].visible = true;
					$.selectStage['iconLock_'+n].visible = false;
				}
			}
		}else{
			$.selectStage['iconLock_'+n].visible = false;
			$.selectStage['icon_'+n].visible = false;
			$.selectStage['iconText_'+n].visible = false;	
		}
	}
	
	if(gameData.stageUnlockNum > 0){
		toggleSelect(true);
		return;
	}
	
	if(selectData.page == 1){
		buttonPrev.visible = false;	
	}else{
		buttonPrev.visible =  true;	
	}
	
	if(selectData.page == selectData.total || selectData.total == 1){
		buttonNext.visible = false;	
	}else{
		buttonNext.visible = true;	
	}
}

function unlockTween(n){
	TweenMax.to($.selectStage['iconText_'+n], .5, {alpha:1, overwrite:true});
	TweenMax.to($.selectStage['iconLock_'+n], .5, {alpha:0, overwrite:true, onComplete:unlockTweenComplete, onCompleteParams:[n]});
}

function unlockTweenComplete(n){
	$.selectStage['iconText_'+n].visible = true;
	$.selectStage['iconLock_'+n].visible = false;		
}

/*!
 * 
 * START GAME - This is the function that runs to start play game
 * 
 */

function startGame(){
	playSound('soundResult');
	gameLevelTxt.text = levelText.replace('[NUMBER]', gameData.levelNum+1);
	
	itemCompleteBg.scaleX = itemCompleteBg.scaleY = 1;
	gameCompleteTxt.scaleX = gameCompleteTxt.scaleY = 1;
	itemCompleteBg.visible = false;
	gameCompleteTxt.visible = false;
	
	gameData.paused = false;
	gameData.pressed = false;
	gameData.currentPipe = null;
	gameData.currentPipeNum = -1;
	gameData.complete = false;
	
	buttonRetry.visible = true;
	buildRects();
	resetGrid();
	toggleGameTimer(true);
}

 /*!
 * 
 * STOP GAME - This is the function that runs to stop play game
 * 
 */
function stopGame(){
	gameData.paused = true;
	TweenMax.killAll();
}

/*!
 * 
 * SAVE GAME - This is the function that runs to save game
 * 
 */
function saveGame(score){
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
 * LOOP UPDATE GAME - This is the function that runs to update game loop
 * 
 */
function updateGame(){
	if(!$.editor.enable){
		if(!gameData.paused && timeData.enable){
			updateTimer();	
		}
	}
}

/*!
 * 
 * BUILD GRID - This is the function that runs to build grid
 * 
 */
function buildRects(){
	gameData.sequence = [];
	gameData.grid = [];
	gameData.pipes = [];
	
	strokeContainer.removeAllChildren();
	rectContainer.removeAllChildren();
	pipeStartContainer.removeAllChildren();
	pipeContainer.removeAllChildren();
	pipeDivideContainer.removeAllChildren();
	
	var rectSize = levels_arr[gameData.levelNum].size;
	var rectFinalSize = levels_arr[gameData.levelNum].size - (puzzleSettings.space * 2);
	var rectStrokeSize = levels_arr[gameData.levelNum].size + (puzzleSettings.stroke * 2);
	gameData.scalePercent = rectSize/gameData.pipeWidth;
	
	var gridW = (rectSize * (levels_arr[gameData.levelNum].column-1));
	var gridH = (rectSize * (levels_arr[gameData.levelNum].row-1));
	
	var startX = canvasW/2 - (gridW/2);
	var startY = canvasH/2 - (gridH/2);
	var curX = startX;
	var curY = startY;
	
	gameLevelTxt.x = startX - (rectFinalSize/2);
	gameLevelTxt.y = startY - ((rectFinalSize/2) + 25);
	
	gamePipeTxt.x = startX + (gridW+(rectFinalSize/2));
	gamePipeTxt.y = startY - ((rectFinalSize/2) + 25);
	
	var rectCount = 0;
	for(var r=0; r<levels_arr[gameData.levelNum].row; r++){
		gameData.grid[r] = [];
		for(var c=0; c<levels_arr[gameData.levelNum].column; c++){
			var newRectStroke = new createjs.Shape();
			newRectStroke.graphics.beginFill(puzzleSettings.strokeColor);
			newRectStroke.graphics.drawRect(0 - (rectStrokeSize/2), 0 - (rectStrokeSize/2), rectStrokeSize, rectStrokeSize);
			newRectStroke.x = curX;
			newRectStroke.y = curY;
			
			var newRect = new createjs.Shape();
			newRect.graphics.beginFill(puzzleSettings.backgroundColor);
			newRect.graphics.drawRect(0 - (rectFinalSize/2), 0 - (rectFinalSize/2), rectFinalSize, rectFinalSize);
			newRect.x = curX;
			newRect.y = curY;
			newRect.num = rectCount;
			newRect.connect = false;
			newRect.pipeNum = -1;
			rectCount++;
			
			var newRectBg = new createjs.Shape();
			newRectBg.graphics.beginFill(puzzleSettings.backgroundColor);
			newRectBg.changeColor = newRectBg.graphics.beginFill(puzzleSettings.backgroundColor).command;
			newRectBg.graphics.drawRect(0 - (rectFinalSize/2), 0 - (rectFinalSize/2), rectFinalSize, rectFinalSize);
			newRectBg.x = curX;
			newRectBg.y = curY;
			newRectBg.alpha = 1;
			newRect.bg = newRectBg;
			
			//invisible
			for(var n=0; n<levels_arr[gameData.levelNum].invicible.length; n++){
				if(levels_arr[gameData.levelNum].invicible[n].r == r && levels_arr[gameData.levelNum].invicible[n].c == c){
					newRect.visible = false;
					newRectStroke.visible = false;
					newRectBg.visible = false;
				}
			}
			
			curX += rectSize;
			strokeContainer.addChild(newRectStroke);
			rectContainer.addChild(newRect, newRectBg);
			
			gameData.grid[r][c] = newRect;
			
			newRect.cursor = "pointer";
			newRect.addEventListener("mousedown", function(evt) {
				checkConnectStart(evt.target);
			});
		}
		curX = startX;
		curY += rectSize;
	}
	
	//pipes
	for(var n=0; n<levels_arr[gameData.levelNum].pipes.length; n++){
		for(var p=0; p<pipeColors.length; p++){
			if(levels_arr[gameData.levelNum].pipes[n].index == p){
				var newPipeContainer = new createjs.Container();
				var newPipeDivContainer = new createjs.Container();
				pipeContainer.addChild(newPipeContainer);
				pipeDivideContainer.addChild(newPipeDivContainer);
				
				gameData.pipes.push({index:levels_arr[gameData.levelNum].pipes[n].index, seq:[], container:newPipeContainer, divContainer:newPipeDivContainer, complete:false});
				
				var pipeIndex = gameData.pipes.length-1;
				var startRect = gameData.grid[levels_arr[gameData.levelNum].pipes[n].start.r][levels_arr[gameData.levelNum].pipes[n].start.c];
				startRect.connect = true;
				startRect.pipeNum = pipeIndex;
				$.pipe[pipeIndex+'start'] = $.pipe['pipeHole'+levels_arr[gameData.levelNum].pipes[n].index].clone();
				$.pipe[pipeIndex+'start'].x = startRect.x;
				$.pipe[pipeIndex+'start'].y = startRect.y;
				$.pipe[pipeIndex+'start'].scaleX = $.pipe[pipeIndex+'start'].scaleY = gameData.scalePercent;
				pipeStartContainer.addChild($.pipe[pipeIndex+'start']);
				
				var endRect = gameData.grid[levels_arr[gameData.levelNum].pipes[n].end.r][levels_arr[gameData.levelNum].pipes[n].end.c];
				endRect.connect = true;
				endRect.pipeNum = pipeIndex;
				$.pipe[pipeIndex+'end'] = $.pipe['pipeHole'+levels_arr[gameData.levelNum].pipes[n].index].clone();
				$.pipe[pipeIndex+'end'].x = endRect.x;
				$.pipe[pipeIndex+'end'].y = endRect.y;
				$.pipe[pipeIndex+'end'].scaleX = $.pipe[pipeIndex+'end'].scaleY = gameData.scalePercent;
				pipeStartContainer.addChild($.pipe[pipeIndex+'end']);
			}
		}
	}
}

function checkRectCollision(){
	var rectSize = levels_arr[gameData.levelNum].size;
	for(var r=0; r<levels_arr[gameData.levelNum].row; r++){
		for(var c=0; c<levels_arr[gameData.levelNum].column; c++){
			var curRect = gameData.grid[r][c];
			if(curRect.visible){
				var distanceNum = getDistanceByValue(curRect.x, curRect.y, stage.mouseX, stage.mouseY);
				if(distanceNum <= rectSize/2){
					checkConnectRect(curRect);
				}
			}
		}	
	}	
}

/*!
 * 
 * PIPE CONNECTION - This is the function that runs to build pipe connection
 * 
 */
function checkConnectStart(obj){
	if(gameData.complete){
		return;	
	}
	
	if(obj.connect){
		playPipeSound()
		gameData.currentPipeNum = obj.pipeNum;
		for(var s=0; s<gameData.pipes[obj.pipeNum].seq.length; s++){
			var curRect = gameData.pipes[obj.pipeNum].seq[s];
			curRect.bg.alpha = 0;
			if(!curRect.connect){
				curRect.pipeNum = -1;
			}
		}
		gameData.pipes[gameData.currentPipeNum].complete = false;
		gameData.pipes[gameData.currentPipeNum].seq = [];
		gameData.pipes[gameData.currentPipeNum].seq.push(obj);
		gameData.currentPipe = obj;
		buildPipes(gameData.currentPipeNum);
	}else if(obj.pipeNum != -1){
		if(gameData.pipes[obj.pipeNum].seq[gameData.pipes[obj.pipeNum].seq.length-1] == obj){
			playPipeSound()
			gameData.currentPipeNum = obj.pipeNum;
			gameData.currentPipe = obj;
		}
	}
}

function checkConnectRect(obj){
	if(gameData.complete){
		return;	
	}
	
	if(gameData.currentPipe != obj && gameData.currentPipe != undefined && gameData.pressed){
		var distanceNum = getDistanceByValue(obj.x, obj.y, gameData.currentPipe.x, gameData.currentPipe.y);
		var rectSize = levels_arr[gameData.levelNum].size;
			
		if(distanceNum <= rectSize){
			var rebuildPipe = false;
			if(obj.pipeNum == -1){
				//if pipe available to connect
				playPipeSound();
				gameData.pipes[gameData.currentPipeNum].seq.push(obj);
				gameData.currentPipe = obj;
				obj.pipeNum = gameData.currentPipeNum;
				rebuildPipe = true;
			}else if(obj.pipeNum == gameData.currentPipeNum){
				if(obj.pipeNum == gameData.currentPipeNum && obj.connect && obj != gameData.pipes[gameData.currentPipeNum].seq[0]){
					//last pipe to connect
					playPipeSound();
					gameData.pipes[gameData.currentPipeNum].seq.push(obj);
					gameData.pipes[gameData.currentPipeNum].complete = true;
					animateBgColor(gameData.currentPipeNum);
					
					gameData.currentPipeNum = -1;
					gameData.currentPipe = null;
					
					checkLevelComplete();
					rebuildPipe = true;
				}else if(obj == gameData.pipes[gameData.currentPipeNum].seq[gameData.pipes[gameData.currentPipeNum].seq.length-2]){
					//reverse
					playPipeSound();
					gameData.pipes[gameData.currentPipeNum].seq.splice(gameData.pipes[gameData.currentPipeNum].seq.length-1);
					gameData.currentPipe.pipeNum = -1;
					gameData.currentPipe = obj;
					rebuildPipe = true;
				}
			}else{
				//no pipe to connect
			}
			if(rebuildPipe){
				buildPipes(obj.pipeNum);
			}
		}
	}
}

function resetGrid(){
	for(var n=0; n<gameData.pipes.length; n++){
		gameData.pipes[n].container.removeAllChildren();
		gameData.pipes[n].divContainer.removeAllChildren();
		
		for(var s=0; s<gameData.pipes[n].seq.length; s++){
			var curRect = gameData.pipes[n].seq[s];
			curRect.bg.alpha = 0;
			if(!curRect.connect){
				curRect.pipeNum = -1;
			}
		}
		gameData.pipes[n].complete = false;
		gameData.pipes[n].seq = [];
	}
	
	gamePipeTxt.text = pipePercentText.replace('[NUMBER]', 0);
	buildPipes();	
}

function playPipeSound(){
	var randomPipeSound = Math.round(Math.random()*2)+1;
	playSound('soundPipe'+randomPipeSound);	
}

/*!
 * 
 * BUILD PIPES - This is the function that runs to build pipes
 * 
 */
 
function buildPipes(num){
	
	var allPipeCon = false;
	if(isNaN(num)){
		allPipeCon = true;	
	}
	
	//pipeContainer.removeAllChildren();
	//pipeDivideContainer.removeAllChildren();
	
	for(var n=0; n<gameData.pipes.length; n++){
		var pipeIndex = gameData.pipes[n].index;
		var prevDirX = 'none';
		var prevDirY = 'none';
		
		if(!allPipeCon && n == num){
			gameData.pipes[n].container.removeAllChildren();
			gameData.pipes[n].divContainer.removeAllChildren();
			if(gameData.pipes[n].seq.length > 1){
				for(var s=0; s<gameData.pipes[n].seq.length; s++){
					var curRect = gameData.pipes[n].seq[s];
					var nextRect = s < gameData.pipes[n].seq.length-1 ? gameData.pipes[n].seq[s+1] : null;
					var dirX = 'none';
					var dirY = 'none';
					var cornerPipe = false;
					var firstPipe = false;
					var lastPipe = false;
					
					if(nextRect != null){
						dirX = getDirectionX(curRect, nextRect);
						dirY = getDirectionY(curRect, nextRect);
						
						if(dirX != 'none' && prevDirY != 'none'){
							cornerPipe = true;
						}else if(dirY != 'none' && prevDirX != 'none'){
							cornerPipe = true;
						}
					}else{
						dirX = prevDirX;
						dirY = prevDirY;
					}
					
					var pipeType = 'pipeStraight';
					if(s == 0){
						firstPipe = true;
						pipeType = 'pipeConnect';
					}else if(s == gameData.pipes[n].seq.length-1 && gameData.pipes[n].complete){
						lastPipe = true;
						pipeType = 'pipeConnect';	
					}else if(s == gameData.pipes[n].seq.length-1){
						pipeType = 'pipeConnecting';
					}else if(cornerPipe){
						pipeType = 'pipeCorner';	
					}
					
					var newPipe = $.pipe[pipeType+pipeIndex].clone();
					newPipe.scaleX = newPipe.scaleY = gameData.scalePercent;
					if(cornerPipe){
						if(prevDirX == 'none'){
							if(prevDirY == 'down'){
								newPipe.scaleY = gameData.scalePercent;
							}else if(prevDirY == 'up'){
								newPipe.scaleY = -(gameData.scalePercent);
							}
							var oppositeDir = prevDirY == 'down' ? 'up' : 'down';
							addPipeDivier(n, curRect, pipeIndex, oppositeDir);
							addPipeDivier(n, curRect, pipeIndex, dirX);
							
							if(dirX == 'right'){
								newPipe.scaleX = gameData.scalePercent;
							}else if(dirX == 'left'){
								newPipe.scaleX = -(gameData.scalePercent);
							}
						}else {
							if(prevDirX == 'left'){
								newPipe.scaleX = gameData.scalePercent;
							}else if(prevDirX == 'right'){
								newPipe.scaleX = -(gameData.scalePercent);
							}
							var oppositeDir = prevDirX == 'left' ? 'right' : 'left';
							addPipeDivier(n, curRect, pipeIndex, oppositeDir);
							addPipeDivier(n, curRect, pipeIndex, dirY);
							
							if(dirY == 'up'){
								newPipe.scaleY = gameData.scalePercent;
							}else if(dirY == 'down'){
								newPipe.scaleY = -(gameData.scalePercent);
							}	
						}
					}else if(lastPipe){
						if(dirX == 'right'){
							newPipe.rotation = 180;
						}else if(dirX == 'left'){
							newPipe.rotation = 0;
						}else if(dirY == 'down'){
							newPipe.rotation = 270;
						}else if(dirY == 'up'){
							newPipe.rotation = 90;
						}	
						
						if(dirX != 'none'){
							var oppositeDir = dirX == 'left' ? 'right' : 'left';
							addPipeDivier(n, curRect, pipeIndex, oppositeDir);
						}
						
						if(dirY != 'none'){
							var oppositeDir = dirY == 'down' ? 'up' : 'down';
							addPipeDivier(n, curRect, pipeIndex, oppositeDir);
						}
					}else{
						if(dirX == 'right'){
							newPipe.rotation = 0;
						}else if(dirX == 'left'){
							newPipe.rotation = 180;
						}else if(dirY == 'down'){
							newPipe.rotation = 90;
						}else if(dirY == 'up'){
							newPipe.rotation = 270;
						}
						
						if(firstPipe){
							if(dirX != 'none'){
								addPipeDivier(n, curRect, pipeIndex, dirX);
							}
							
							if(dirY != 'none'){
								addPipeDivier(n, curRect, pipeIndex, dirY);
							}
						}
					}
								
					prevDirX = dirX;
					prevDirY = dirY;
					
					newPipe.x = curRect.x;
					newPipe.y = curRect.y;
					gameData.pipes[n].container.addChild(newPipe);
				}
			}
		}
	}
}

function addPipeDivier(n, rect, index, direction){
	var rectSize = levels_arr[gameData.levelNum].size;
	var rectFinalSize = levels_arr[gameData.levelNum].size - (puzzleSettings.space * 2);
	
	var newPipe = $.pipe['pipeDivide'+index].clone();
	newPipe.scaleX = newPipe.scaleY = gameData.scalePercent;
	newPipe.x = rect.x;
	newPipe.y = rect.y;
	
	if(direction == 'right'){
		newPipe.rotation = 90;
		newPipe.x = rect.x + ((rectSize/2));
	}else if(direction == 'left'){
		newPipe.rotation = 90;
		newPipe.x = rect.x - ((rectSize/2));
	}else if(direction == 'up'){
		newPipe.y = rect.y - ((rectSize/2));
	}else if(direction == 'down'){
		newPipe.y = rect.y + ((rectSize/2));
	}
	
	gameData.pipes[n].divContainer.addChild(newPipe);	
}

function getDirectionX(start, end){
	var dirX = 'none';
	if (start.x > end.x) {
		dirX = "left";
	} else if (start.x < end.x) {
		dirX = "right";
	}
	return dirX;	
}

function getDirectionY(start, end){
	var dirY = 'none';
	if (start.y > end.y) {
		dirY = "up";
	} else if (start.y < end.y) {
		dirY = "down";
	}
	return dirY;	
}

/*!
 * 
 * BACKGROUND ANIMATION - This is the function that runs to animate background
 * 
 */
function animateBgColor(pipeNum){
	playWaterSound();
	for(var s=0; s<gameData.pipes[pipeNum].seq.length; s++){
		var curRect = gameData.pipes[pipeNum].seq[s];
		var curColor = pipeColors[gameData.pipes[pipeNum].index].color;
		curRect.bg.alpha = 0;
		curRect.bg.changeColor.style = curColor;
		TweenMax.to(curRect.bg, .3, {delay:s*.05, alpha:.5, overwrite:true});
	}	
}

function playWaterSound(){
	var randomPipeSound = Math.round(Math.random()*3)+1;
	playSound('soundWater'+randomPipeSound);	
}

/*!
 * 
 * CHECK GAME COMPLETE - This is the function that runs to check game is complete
 * 
 */
function checkLevelComplete(){
	var totalSquare = 0;
	var totalCompleted = 0;
	
	for(var r=0; r<levels_arr[gameData.levelNum].row; r++){
		for(var c=0; c<levels_arr[gameData.levelNum].column; c++){
			var curRect = gameData.grid[r][c];
			if(curRect.visible){
				totalSquare++;	
			}
		}	
	}
	
	for(var n=0; n<gameData.pipes.length; n++){
		totalCompleted += gameData.pipes[n].seq.length;
	}
	
	gamePipeTxt.text = pipePercentText.replace('[NUMBER]', Math.round(totalCompleted/totalSquare * 100));
	
	if(totalSquare == totalCompleted){
		if(!gameData.complete){
			playSound('soundComplete');
			gameData.complete = true;
			
			if($.editor.enable){
				toggleGameStatus('Game Complete:');
			}else{
				toggleGameTimer(false);
				
				buttonRetry.visible = false;
				itemCompleteBg.visible = true;
				gameCompleteTxt.visible = true;
				itemCompleteBg.alpha = 0;
				gameCompleteTxt.alpha = 0;
				
				TweenMax.to(gameCompleteTxt, .2, {delay:.3, alpha:1, scaleX:1.2, scaleY:1.2, overwrite:true, onComplete:function(){
					TweenMax.to(gameCompleteTxt, .5, {scaleX:1, scaleY:1, overwrite:true, onComplete:function(){
						TweenMax.to(gameCompleteTxt, .5, {overwrite:true, onComplete:function(){
							
						}});
					}});
				}});
				
				TweenMax.to(itemCompleteBg, .2, {delay:.3, alpha:1, scaleX:1.2, scaleY:1.2, overwrite:true, onComplete:function(){
					TweenMax.to(itemCompleteBg, .5, {scaleX:1, scaleY:1, overwrite:true, onComplete:function(){
						TweenMax.to(itemCompleteBg, .5, {delay:1, overwrite:true, onComplete:function(){
							goPage('result');
						}});
					}});
				}});
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
	if($.editor.enable){
		return;	
	}
	
	if(con){
		timeData.startDate = new Date();
	}
	timeData.enable = con;
}

function updateTimer(){
	timeData.nowDate = new Date();
	timeData.timer = (timeData.nowDate.getTime() - timeData.startDate.getTime());
	gameTimerTxt.text = millisecondsToTime(timeData.timer);
}

/*!
 * 
 * MILLISECONDS CONVERT - This is the function that runs to convert milliseconds to time
 * 
 */
function millisecondsToTime(milli) {
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
	
	title = title.replace("[LEVEL]", gameData.levelNum+1);
	text = text.replace("[LEVEL]", gameData.levelNum+1);
	var shareurl = '';
	
	if( action == 'twitter' ) {
		shareurl = 'https://twitter.com/intent/tweet?url='+loc+'&text='+text;
	}else if( action == 'facebook' ){
		shareurl = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(loc+'share.php?desc='+text+'&title='+title+'&url='+loc+'&thumb='+loc+'share.jpg&width=590&height=300');
	}else if( action == 'whatsapp' ){
		shareurl = "whatsapp://send?text=" + encodeURIComponent(text) + " - " + encodeURIComponent(loc);
	}
	
	window.open(shareurl);
}