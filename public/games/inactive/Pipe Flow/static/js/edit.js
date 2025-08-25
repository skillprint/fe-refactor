////////////////////////////////////////////////////////////
// EDIT PUZZLES
////////////////////////////////////////////////////////////
var edit = {show:true, option:'', pipeNum:0, pipeCon:0, editColor:'#003366',  editHover:'#00FF7F'};

/*!
 * 
 * EDIT READY
 * 
 */
$(function() {
	 $.editor.enable = true;
});

function loadEditPage(){
	jQuery.ajax({ 
		 url: "editTools.html", dataType: "html" 
	}).done(function( responseHtml ) {
		$("body").prepend(responseHtml);
		
		buildEditCanvas();
		buildEditButtons();
		$('#editWrapper').show();
		toggleEditOption();
	});
}

function buildEditButtons(){
	$('#toggleShowOption').click(function(){
		toggleShowOption();
	});
	
	//start
	for(var n=0;n<pipeColors.length;n++){
		$('#pipelist').append($("<option/>", {
			value: n,
			text: 'Pipe '+(n+1)
		}));
	}
	
	$("#pipelist").change(function() {
		if($(this).val() != ''){
			edit.pipeNum = Number($(this).val());
			checkPipeRemove();
		}
	});
	
	buildLevelDD();
	$("#levellist").change(function() {
		if($(this).val() != ''){
			gameData.levelNum = Number($(this).val());
			
			edit.pipeNum = 0;
			$('#pipelist').prop("selectedIndex", edit.pipeNum);
	
			toggleEditOption();
			reloadEditLevel();
		}
	});
	
	$('#prevLevel').click(function(){
		toggleLevel(false);
	});
	
	$('#nextLevel').click(function(){
		toggleLevel(true);
	});
	
	$('#moveLevelUp').click(function(){
		actionLevel('moveup');
	});
	
	$('#moveLevelDown').click(function(){
		actionLevel('movedown');
	});
	
	$('#addNewLevel').click(function(){
		actionLevel('new');
	});
	
	$('#removeLevel').click(function(){
		actionLevel('remove');
	});
	
	//option
	$('#editLevels').click(function(){
		toggleEditOption('levels');
	});
	
	$('#testPlay').click(function(){
		toggleEditOption('play');
	});
	
	$('#stopTestPlay').click(function(){
		toggleEditOption('stop');
	});
	
	$('#generateArray').click(function(){
		generateArray();
	});
	
	//levels
	$('#updateLevels').click(function(){
		updateLevelData();
	});
	
	$('#doneLevels').click(function(){
		toggleEditOption();
	});
	
	$('#prevPipe').click(function(){
		togglePipe(false);
	});
	
	$('#nextPipe').click(function(){
		togglePipe(true);
	});
	
	$('#updatePipe').click(function(){
		toggleEditOption('pipe');
	});
	
	$('#removePipe').click(function(){
		actionPipe('remove');
	});
}

 /*!
 * 
 * TOGGLE DISPLAY OPTION - This is the function that runs to toggle display option
 * 
 */
 
function toggleShowOption(){
	if(edit.show){
		edit.show = false;
		$('#editOption').hide();
		$('#toggleShowOption').val('Show Edit Option');
	}else{
		edit.show = true;
		$('#editOption').show();
		$('#toggleShowOption').val('Hide Edit Option');
	}
}

 /*!
 * 
 * TOGGLE EDIT OPTIONS - This is the function that runs to toggle edit options
 * 
 */
function toggleEditOption(con){
	edit.option = con;
	
	$('#actionWrapper').hide();
	$('#playWrapper').hide();
	$('#editLevelsWrapper').hide();
	$('#pipeWrapper').hide();
	
	if(con == 'levels'){
		$('#editLevelsWrapper').show();
		loadLevelData();
		checkPipeRemove();	
	}else if(con == 'pipe'){
		$('#pipeWrapper').show();
		togglePipePlace();
	}else if(con == 'play'){
		$('#playWrapper').show();
		toggleGamePlay(true);
	}else if(con == 'stop'){
		toggleGamePlay(false);
		toggleEditOption();
	}else{
		$('#actionWrapper').show();
	}
	
	if(gameData.paused && edit.option != 'pipe'){
		reloadEditLevel();
	}
}

 /*!
 * 
 * BUILD EDIT CANVAS - This is the function that runs to build edit canvas
 * 
 */
var editContainer;
$.editPipe = [];

function buildEditCanvas(){
	editRectContainer = new createjs.Container();
	editPipeContainer = new createjs.Container();
	editContainer.addChild(editRectContainer, editPipeContainer);
	
	for(var n=0; n<pipeColors.length; n++){
		$.editPipe[n+'start'] = $.pipe['pipeHole'+n].clone();
		$.editPipe[n+'end'] = $.pipe['pipeHole'+n].clone();
		editPipeContainer.addChild($.editPipe[n+'start'], $.editPipe[n+'end']);
	}
	
	gameDisplayContainer.visible = buttonSettings.visible = false;
}

/*!
 * 
 * TOGGLE STAGE - This is the function that runs to toggle levels
 * 
 */
function toggleLevel(con){
	if(con){
		gameData.levelNum++;
		gameData.levelNum = gameData.levelNum > levels_arr.length - 1 ? 0 : gameData.levelNum;
	}else{
		gameData.levelNum--;
		gameData.levelNum = gameData.levelNum < 0 ? levels_arr.length - 1 : gameData.levelNum;
	}
	$('#levellist').prop("selectedIndex", gameData.levelNum);
	
	edit.pipeNum = 0;
	$('#pipelist').prop("selectedIndex", edit.pipeNum);
	
	reloadEditLevel();
}

/*!
 * 
 * ACTION STAGE - This is the function that runs to action level
 * 
 */
function actionLevel(con){
	switch(con){
		case 'new':
			levels_arr.push({
								row:5,
								column:5,
								size:110,
								invicible:[],
								pipes:[]
								
							});
			gameData.levelNum = levels_arr.length-1;
		break;
		
		case 'remove':
			levels_arr.splice(gameData.levelNum, 1);
			gameData.levelNum = 0;
		break;
		
		case 'moveup':
			if(gameData.levelNum-1 >= 0){
				swapArray(levels_arr, gameData.levelNum-1, gameData.levelNum);
				gameData.levelNum--;
			}
		break;
		
		case 'movedown':
			if(gameData.levelNum+1 < levels_arr.length){
				swapArray(levels_arr, gameData.levelNum+1, gameData.levelNum);
				gameData.levelNum++;
			}
		break;
	}
	
	edit.pipeNum = 0;
	$('#pipelist').prop("selectedIndex", edit.pipeNum);
	
	buildLevelDD();
	reloadEditLevel();
}

 /*!
 * 
 * BUILD STAGE DROPDOWN - This is the function that runs to build stage dropdown
 * 
 */
function buildLevelDD(){
	$('#levellist').empty();
	for(n=0;n<levels_arr.length;n++){
		$('#levellist').append($("<option/>", {
			value: n,
			text: 'Level '+(n+1)
		}));
	}	
	
	$('#levellist').prop("selectedIndex", gameData.levelNum);
}

 /*!
 * 
 * LOAD STAGE DATA - This is the function that runs to load stage data
 * 
 */
function loadLevelData(){
	$('#rectSize').val(levels_arr[gameData.levelNum].size);
	$('#totalColumn').val(levels_arr[gameData.levelNum].column);
	$('#totalRow').val(levels_arr[gameData.levelNum].row);
}

 /*!
 * 
 * UPDATE STAGE DATA - This is the function that runs to update stage data
 * 
 */
function updateLevelData(){
	if(levels_arr[gameData.levelNum].column != Number($('#totalColumn').val())){
		levels_arr[gameData.levelNum].pipes = [];
	}
	
	if(levels_arr[gameData.levelNum].row != Number($('#totalRow').val())){
		levels_arr[gameData.levelNum].pipes = [];
	}
	
	levels_arr[gameData.levelNum].size = Number($('#rectSize').val());
	levels_arr[gameData.levelNum].column = Number($('#totalColumn').val());
	levels_arr[gameData.levelNum].row = Number($('#totalRow').val());
	
	checkPipeRemove();
	reloadEditLevel();
}

 /*!
 * 
 * RELOAD STAGE - This is the function that runs to reload stage
 * 
 */
function reloadEditLevel(){
	buildRects();
	buildEditRects();
}

 /*!
 * 
 * BUILD EDIT GRID - This is the function that runs to build edit grid
 * 
 */
function buildEditRects(){
	editRectContainer.removeAllChildren();
	for(var n=0; n<pipeColors.length; n++){
		$.editPipe[n+'start'].visible = false;
		$.editPipe[n+'end'].visible = false;
	}
	
	var rectSize = levels_arr[gameData.levelNum].size;
	var rectFinalSize = levels_arr[gameData.levelNum].size - (puzzleSettings.space * 2);
	
	for(var r=0; r<levels_arr[gameData.levelNum].row; r++){
		for(var c=0; c<levels_arr[gameData.levelNum].column; c++){
			gameData.grid[r][c].visible = false;
			
			var newRect = new createjs.Shape();
			newRect.graphics.beginFill(edit.editColor).drawRect(0 - (rectFinalSize/2), 0 - (rectFinalSize/2), rectFinalSize, rectFinalSize);
			newRect.x = gameData.grid[r][c].x;
			newRect.y = gameData.grid[r][c].y;
			newRect.r = r;
			newRect.c = c;
			newRect.hidden = false;
			
			newRect.cursor = "pointer";
			newRect.addEventListener("mouseover", function(evt) {
				if(edit.option == 'pipe'){
					var pipeCon = edit.pipeCon == 0 ? 'start' : 'end';
					$.editPipe[edit.pipeNum+pipeCon].visible = true;
					$.editPipe[edit.pipeNum+pipeCon].x = evt.target.x;
					$.editPipe[edit.pipeNum+pipeCon].y = evt.target.y;
					$.editPipe[edit.pipeNum+pipeCon].alpha = 1;
					$.editPipe[edit.pipeNum+pipeCon].scaleX = $.editPipe[edit.pipeNum+pipeCon].scaleY = gameData.scalePercent;
				}else{
					evt.target.hiddenObj.visible = true;
				}
			});
			newRect.addEventListener("mouseout", function(evt) {
				if(!evt.target.hidden){
					evt.target.hiddenObj.visible = false;
				}
			});
			newRect.addEventListener("click", function(evt) {
				if(edit.option == 'pipe'){
					updatePipeData(evt.target.r, evt.target.c);
					
					edit.pipeCon++;
					if(edit.pipeCon > 1){
						toggleEditOption('levels');	
					}
				}else{
					toggleHidden(evt.target);
				}
			});
			
			var newRectHover = new createjs.Shape();
			newRectHover.graphics.beginFill(edit.editHover).drawRect(0 - (rectFinalSize/2), 0 - (rectFinalSize/2), rectFinalSize, rectFinalSize);
			newRectHover.x = gameData.grid[r][c].x;
			newRectHover.y = gameData.grid[r][c].y;
			newRectHover.visible = false;
			newRectHover.alpha = .5;
			newRect.hiddenObj = newRectHover;
			
			for(var n=0; n<levels_arr[gameData.levelNum].invicible.length; n++){
				if(levels_arr[gameData.levelNum].invicible[n].r == r && levels_arr[gameData.levelNum].invicible[n].c == c){
					newRect.hidden = true;
					newRect.hiddenObj.visible = true;
				}
			}
			
			for(var n=0; n<levels_arr[gameData.levelNum].pipes.length; n++){
				for(var p=0; p<pipeColors.length; p++){
					if(levels_arr[gameData.levelNum].pipes[n].index == p){
						if(levels_arr[gameData.levelNum].pipes[n].start.r == r && levels_arr[gameData.levelNum].pipes[n].start.c == c){
							$.editPipe[p+'start'].visible = true;
							$.editPipe[p+'start'].x = gameData.grid[r][c].x;
							$.editPipe[p+'start'].y = gameData.grid[r][c].y;
							$.editPipe[p+'start'].scaleX = $.editPipe[p+'start'].scaleY = gameData.scalePercent;
							$.editPipe[p+'start'].alpha = .3;
							if(p == edit.pipeNum){
								$.editPipe[p+'start'].alpha = 1;
							}
						}
						if(levels_arr[gameData.levelNum].pipes[n].end.r == r && levels_arr[gameData.levelNum].pipes[n].end.c == c){
							$.editPipe[p+'end'].visible = true;
							$.editPipe[p+'end'].x = gameData.grid[r][c].x;
							$.editPipe[p+'end'].y = gameData.grid[r][c].y;
							$.editPipe[p+'end'].scaleX = $.editPipe[p+'end'].scaleY = gameData.scalePercent;
							$.editPipe[p+'end'].alpha = .3;
							if(p == edit.pipeNum){
								$.editPipe[p+'end'].alpha = 1;	
							}
						}
					}
				}
			}
			
			editRectContainer.addChild(newRect, newRectHover);
		}
	}	
}

/*!
 * 
 * TOGGLE PIPE - This is the function that runs to toggle pipes
 * 
 */
function togglePipe(con){
	if(con){
		edit.pipeNum++;
		edit.pipeNum = edit.pipeNum > pipeColors.length - 1 ? 0 : edit.pipeNum;
	}else{
		edit.pipeNum--;
		edit.pipeNum = edit.pipeNum < 0 ? pipeColors.length - 1 : edit.pipeNum;
	}
	
	$('#pipelist').prop("selectedIndex", edit.pipeNum);
	checkPipeRemove();
	reloadEditLevel();
}

 /*!
 * 
 * ACTION PIPE - This is the function that runs to action pipe
 * 
 */
function actionPipe(con){
	switch(con){
		case 'new':
			levels_arr[gameData.levelNum].pipes.push({
								index:edit.pipeNum,
								start:{r:0, c:0},
								end:{r:0, c:0}
								
							});
		break;
		
		case 'remove':
			var findIndex = findExistPipe();
			levels_arr[gameData.levelNum].pipes.splice(findIndex, 1);
			checkPipeRemove();
			reloadEditLevel();
		break;
	}	
}

 /*!
 * 
 * CHECK PIPE REMOVE - This is the function that runs to check pipe remove
 * 
 */
function checkPipeRemove(){
	$('#removePipe').show();
	
	var findIndex = findExistPipe();
	if(findIndex == -1){
		$('#removePipe').hide();
	}
}

 /*!
 * 
 * TOGGLE PIPE PLACE - This is the function that runs to toggle pipe place
 * 
 */
function togglePipePlace(){
	edit.pipeCon = 0;
	
	$.editPipe[edit.pipeNum+'start'].visible = false;
	$.editPipe[edit.pipeNum+'end'].visible = false;
}

 /*!
 * 
 * UPDATE PIPE DATA - This is the function that runs to update pipe data
 * 
 */
function updatePipeData(r, c){
	var findIndex = findExistPipe();
	if(findIndex == -1){
		actionPipe('new');	
		findIndex = findExistPipe();
	}
	
	if(edit.pipeCon == 0){
		levels_arr[gameData.levelNum].pipes[findIndex].start.r = r;
		levels_arr[gameData.levelNum].pipes[findIndex].start.c = c;
	}else if(edit.pipeCon == 1){
		levels_arr[gameData.levelNum].pipes[findIndex].end.r = r;
		levels_arr[gameData.levelNum].pipes[findIndex].end.c = c;
	}
}

function findExistPipe(){
	var findIndex = -1;
	for(var n=0; n<levels_arr[gameData.levelNum].pipes.length; n++){
		if(levels_arr[gameData.levelNum].pipes[n].index == edit.pipeNum){
			findIndex = n;
		}
	}	
	return findIndex;
}

 /*!
 * 
 * TOGGLE HIDDEN - This is the function that runs to toggle hidden
 * 
 */
function toggleHidden(obj){
	var addHidden = false;
	if(obj.hidden){
		obj.hidden = false;
		obj.hiddenObj.visible = false;
	}else{
		obj.hidden = true;
		obj.hiddenObj.visible = true;
		addHidden = true;
	}
	
	for(var n=0; n<levels_arr[gameData.levelNum].invicible.length; n++){
		if(levels_arr[gameData.levelNum].invicible[n].r == obj.r && levels_arr[gameData.levelNum].invicible[n].c == obj.c){
			levels_arr[gameData.levelNum].invicible.splice(n,1);	
		}
	}
	
	if(addHidden){
		levels_arr[gameData.levelNum].invicible.push({r:obj.r, c:obj.c});	
	}
}

/*!
 * 
 * GENERATE ARRAY - This is the function that runs to generate array
 * 
 */
function generateArray(){
	var outputArray = '';
	var space = '					';
	var space2 = '						';
	var space3 = '							';
	
	outputArray += "[\n";
	for(e=0;e<levels_arr.length;e++){
		var invicibleArray = '';
		for(var l=0; l < levels_arr[e].invicible.length; l++){
			invicibleArray += "{r:"+levels_arr[e].invicible[l].r+", c:"+levels_arr[e].invicible[l].c+"},";
		}
		
		var pipesArray = '\n';
		for(var l=0; l < levels_arr[e].pipes.length; l++){
			pipesArray += space3+"{index:"+levels_arr[e].pipes[l].index+", start:{r:"+levels_arr[e].pipes[l].start.r+", c:"+levels_arr[e].pipes[l].start.c+"}, end:{r:"+levels_arr[e].pipes[l].end.r+", c:"+levels_arr[e].pipes[l].end.c+"}},\n";
		}
		
		outputArray += space+"{\n";
		outputArray += space2+"row:"+levels_arr[e].row+",\n";
		outputArray += space2+"column:"+levels_arr[e].column+",\n";
		outputArray += space2+"size:"+levels_arr[e].size+",\n";
		outputArray += space2+"invicible:["+invicibleArray+"],\n";
		outputArray += space2+"pipes:["+pipesArray+"]\n";
		outputArray += space+"},\n\n";
	}
	outputArray += space+'];';
	$('#outputArray').val(outputArray);	
}

/*!
 * 
 * TOGGLE GAME PLAY - This is the function that runs to toggle game play
 * 
 */
function toggleGamePlay(con){
	editContainer.visible = true;
	
	if(con){
		editContainer.visible = false;
		
		toggleGameStatus('Game start:');
		stopGame();
		startGame();
	}else{
		stopGame();
	}
}

function toggleGameStatus(text){
	$('#gameStatus').html(text);
}