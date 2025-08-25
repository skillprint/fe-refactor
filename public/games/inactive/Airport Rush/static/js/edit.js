////////////////////////////////////////////////////////////
// EDIT TERMINALS
////////////////////////////////////////////////////////////
var edit = {show:true, option:'', terminalNum:0, runwayNum:0, pointNum:0, modeNum:0, pointMode:'', gateNum:0};

var editShape;
var dotWidth = 8;
var editDot;
var colourEdit = '#00ff00';

var editPlane;
var editPlaneShadow;
var runwayColour_arr = ['orange','white','yellow','green','blue','yellow','white','orange'];

/*!
 * 
 * EDIT READY
 * 
 */
$(function() {
	 $.editor.enable = true;
});

function loadEditPage(){
	$.get('editTools.html', function(data){
		$('body').prepend(data);
		buildEditButtons();
		buildEditCanvas();
		$('#editWrapper').show();
		toggleEditOption();
		loadTerminalAssets();
		toggleGateEdit();
		buttonExit.visible = false;
	});		
}

function buildEditCanvas(){
	bgScore.visible = txtScoreGuide.visible = txtScoreNumber.visible = false;
	
	editPlane = new createjs.Sprite($.planesData[0], "static");
	editPlane.framerate = 20;
	editPlane.gotoAndStop(0);
	
	editPlaneShadow = new createjs.Sprite($.planesData['shadow'+0], "static");
	editPlaneShadow.framerate = 20;
	editPlaneShadow.gotoAndStop(0);
	
	planeData.push({type:0, plane:editPlane, shadow:editPlaneShadow, mode:0, value:{x:0, y:0, oldX:0, oldY:0, lastX:0, lastY:0}, level:{val:0}, runwayNum:edit.runwayNum, gateNum:0});
	
	editDot = new createjs.Shape();
	editDot.alpha = .5;
	editDot.graphics.beginFill(colourEdit).drawCircle(0, 0, dotWidth+5);
	editDot.visible = false;
	editShape = new createjs.Shape();
	
	stage.addEventListener("dblclick", function(evt) {
		if(edit.option == 'runway'){
			actionPoint('new');
		}
	});
}

function buildEditButtons(){
	$('#toggleShowOption').click(function(){
		toggleShowOption();
	});
	
	//terminal
	buildTerminalDD();
	$("#terminallist").change(function() {
		if($(this).val() != ''){
			terminalNum = Number($(this).val());
			loadTerminalAssets();
		}
	});
	
	$('#prevTerminal').click(function(){
		toggleTerminal(false);
	});
	
	$('#nextTerminal').click(function(){
		toggleTerminal(true);
	});
	
	$('#moveTerminalUp').click(function(){
		actionTerminal('moveup');
	});
	
	$('#moveTerminalDown').click(function(){
		actionTerminal('movedown');
	});
	
	$('#removeTerminal').click(function(){
		actionTerminal('remove');
	});
	
	$('#addTerminal').click(function(){
		actionTerminal('new');
	});
	
	//option
	$('#editTerminal').click(function(){
		toggleEditOption('terminal');
	});
	
	$('#editRunway').click(function(){
		toggleEditOption('runway');
	});
	
	$('#generate').click(function(){
		generateArray();
	});
	
	//terminal details
	$('#updateTerminal').click(function(){
		updateTerminalData();
	});
	
	$('#backTerminal').click(function(){
		toggleEditOption('');
	});
	
	//runway
	$("#runwaylist").change(function() {
		if($(this).val() != ''){
			edit.runwayNum = Number($(this).val());
			planeData[0].runwayNum = edit.runwayNum;
			loadRunwayData();
		}
	});
	
	$('#prevRunway').click(function(){
		toggleRunway(false);
	});
	
	$('#nextRunway').click(function(){
		toggleRunway(true);
	});
	
	$('#moveRunwayUp').click(function(){
		actionRunway('moveup');
	});
	
	$('#moveRunwayDown').click(function(){
		actionRunway('movedown');
	});
	
	$('#removeRunway').click(function(){
		actionRunway('remove');
	});
	
	$('#addRunway').click(function(){
		actionRunway('new');
	});
	
	//points
	$('#removePoint').click(function(){
		actionPoint('remove');
	});
	
	$('#updatePoint').click(function(){
		updatePointData();
	});
	
	$('#backRunway').click(function(){
		toggleEditOption('');
	});
	
	//model
	$("#modelist").change(function() {
		if($(this).val() != ''){
			edit.modeNum = Number($(this).val());
			edit.pointMode = {mode:edit.modeNum, point:0};
			toggleGateEdit();
		}
	});
	
	$('#prevMode').click(function(){
		toggleMode(false);
	});
	
	$('#nextMode').click(function(){
		toggleMode(true);
	});
	
	$("#gatelist").change(function() {
		if($(this).val() != ''){
			edit.gateNum = Number($(this).val());
			planeData[0].gateNum = edit.gateNum;
			
			loadRunwayData();
		}
	});
	
	$('#prevGate').click(function(){
		toggleGate(false);
	});
	
	$('#nextGate').click(function(){
		toggleGate(true);
	});
	
	$('#addGate').click(function(){
		actionGate('new');
	});
	
	$('#removeGate').click(function(){
		actionGate('remove');
	});
	
	//animation
	$('#testRun').click(function(){
		initTestRun();
	});
	
	$('#testPause').click(function(){
		stopTestRun();
	});
}

/*!
 * 
 * TOGGLE OPTION - This is the function that runs to toggle option
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

function toggleEditOption(con){
	edit.option = con;
	
	$('#editOptionWrapper').hide();
	$('#editTerminalWrapper').hide();
	$('#editRunwayWrapper').hide();
	
	stopTestRun()
	
	if(con == 'terminal'){
		$('#editTerminalWrapper').show();
	}else if(con == 'runway'){
		$('#editRunwayWrapper').show();
	}else{
		$('#editOptionWrapper').show();
	}
	
}

/*!
 * 
 * BUILD TERMINAL DROPDOWN - This is the function that runs to build terminal dropdown
 * 
 */
function buildTerminalDD(){
	$('#terminallist').empty();
	for(var n=0;n<terminals_arr.length;n++){
		$('#terminallist').append($("<option/>", {
			value: n,
			text: 'Terminal '+(n+1)
		}));
	}
	
	$('#terminallist').prop("selectedIndex", edit.terminalNum);
}

/*!
 * 
 * TOGGLE TERMINAL - This is the function that runs to toggle terminal
 * 
 */
function toggleTerminal(con){
	if(con){
		edit.terminalNum++;
		edit.terminalNum = edit.terminalNum > terminals_arr.length - 1 ? 0 : edit.terminalNum;
	}else{
		edit.terminalNum--;
		edit.terminalNum = edit.terminalNum < 0 ? terminals_arr.length - 1 : edit.terminalNum;
	}
	
	$('#terminallist').prop("selectedIndex", edit.terminalNum);
	loadTerminalAssets();
}

/*!
 * 
 * EDITOR ACTION - This is the function that runs to for editor action
 * 
 */
function actionTerminal(action){
	switch(action){
		case 'new':
			var length = terminals_arr.length + 1;
			terminals_arr.push({name:'Terminal NEW', src:'assets/terminal_01.png', thumb:'', runway:[]});					
			edit.terminalNum = terminals_arr.length-1;
			buildTerminalDD();
			loadTerminalAssets();
		break;
		
		case 'remove':
			if(terminals_arr.length > 1){
				terminals_arr.splice(edit.terminalNum, 1);
				edit.terminalNum = 0;
				buildTerminalDD();
				loadTerminalAssets();
			}
		break;
		
		case 'moveup':
			if(edit.terminalNum-1 >= 0){
				swapArray(terminals_arr, edit.terminalNum-1, edit.terminalNum);
				edit.terminalNum--;
				buildTerminalDD();
				loadTerminalAssets();
			}
		break;
		
		case 'movedown':
			if(edit.terminalNum+1 < terminals_arr.length){
				swapArray(terminals_arr, edit.terminalNum+1, edit.terminalNum);
				edit.terminalNum++;
				buildTerminalDD();
				loadTerminalAssets();
			}
		break;
	}
}

/*!
 * 
 * LOAD TERMINAL DATA - This is the function that runs to load terminal data
 * 
 */
function loadTerminalData(){
	$('#terminalImage').val(terminals_arr[edit.terminalNum].src);
	$('#terminalThumb').val(terminals_arr[edit.terminalNum].thumb);
	$('#terminalName').val(terminals_arr[edit.terminalNum].name);
	
	edit.runwayNum = 0;
	edit.gateNum = 0;
	edit.modeNum = 0;
	edit.pointMode = {mode:edit.modeNum, point:0};
	
	toggleGateEdit();
	buildRunwayDD();
}

/*!
 * 
 * UPDATE TERMINAL DATA - This is the function that runs to update terminal data
 * 
 */
function updateTerminalData(){
	terminals_arr[edit.terminalNum].src = $('#terminalImage').val();
	terminals_arr[edit.terminalNum].thumb = $('#terminalThumb').val();
	terminals_arr[edit.terminalNum].name = $('#terminalName').val();
}

/*!
 * 
 * BUILD RUNWAY DROPDOWN - This is the function that runs to build runway dropdown
 * 
 */
function buildRunwayDD(){
	$('#runwaylist').empty();
	for(var n=0;n<terminals_arr[edit.terminalNum].runway.length;n++){
		$('#runwaylist').append($("<option/>", {
			value: n,
			text: 'Runway '+(n+1)
		}));
	}
	
	$('#runwaylist').prop("selectedIndex", edit.runwayNum);
	loadRunwayData();
}

/*!
 * 
 * TOGGLE RUNWAY - This is the function that runs to toggle runway
 * 
 */
function toggleRunway(con){
	if(con){
		edit.runwayNum++;
		edit.runwayNum = edit.runwayNum > terminals_arr[edit.terminalNum].runway.length - 1 ? 0 : edit.runwayNum;
	}else{
		edit.runwayNum--;
		edit.runwayNum = edit.runwayNum < 0 ?  terminals_arr[edit.terminalNum].runway.length - 1 : edit.runwayNum;
	}
	
	$('#runwaylist').prop("selectedIndex", edit.runwayNum);
	loadRunwayData();
}

/*!
 * 
 * EDITOR ACTION - This is the function that runs to for editor action
 * 
 */
function actionRunway(action){
	switch(action){
		case 'new':
			terminals_arr[edit.terminalNum].runway.push({landing:[],holding1:[],taxiway1:[],terminalin:[{path:[]}],terminalout:[{path:[]}],taxiway2:[],holding2:[],takeoff:[]});
			edit.runwayNum = Number(terminals_arr[edit.terminalNum].runway.length-1);
			edit.modeNum = 0;
			edit.pointMode = {mode:edit.modeNum, point:0};
			planeData[0].runwayNum = edit.runwayNum;
			buildRunwayDD();
		break;
		
		case 'remove':
			var pointNum = edit.runwayNum;
			terminals_arr[edit.terminalNum].runway.splice(pointNum, 1);
			editDot.visible = false;
			edit.runwayNum = edit.runwayNum > terminals_arr[edit.terminalNum].runway.length - 1 ? terminals_arr[edit.terminalNum].runway.length -1 : edit.runwayNum;
			edit.modeNum = 0;
			edit.pointMode = {mode:edit.modeNum, point:0};
			planeData[0].runwayNum = edit.runwayNum;
			buildRunwayDD();
		break;
			
		case 'moveup':
			if(edit.runwayNum-1 >= 0){
				swapArray(terminals_arr[edit.terminalNum].runway, edit.runwayNum-1, edit.runwayNum);
				edit.runwayNum--;
				planeData[0].runwayNum = edit.runwayNum;
				buildRunwayDD();
			}
		break;
		
		case 'movedown':
			if(edit.runwayNum+1 < terminals_arr[edit.terminalNum].runway.length){
				swapArray(terminals_arr[edit.terminalNum].runway, edit.runwayNum+1, edit.runwayNum);
				edit.runwayNum++;
				planeData[0].runwayNum = edit.runwayNum;
				buildRunwayDD();
			}
		break;
	}
}

/*!
 * 
 * LOAD RUNWAY DATA - This is the function that runs to toggle runway data
 * 
 */
function loadRunwayData(){
	edit.modeNum = 0;
	$('#modelist').prop("selectedIndex", edit.modeNum);
	
	/*if(terminals_arr[edit.terminalNum].runway.length >= 2){
		terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[3]] = terminals_arr[edit.terminalNum].runway[0][trackName_arr[3]];
		terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[4]] = terminals_arr[edit.terminalNum].runway[0][trackName_arr[4]];	
	}*/
	
	toggleGateEdit();
	buildRunwayData();
}

/*!
 * 
 * BUILD RUNWAY DATA - This is the function that runs to build runway data
 * 
 */
function buildRunwayData(){
	drawAllDots();
	drawEditLines();
	loadPointData();	
}

/*!
 * 
 * ACTION POINT - This is the function that runs to action point
 * 
 */
function actionPoint(action){
	switch(action){
		case 'new':
			if(terminals_arr[edit.terminalNum].runway.length == 0){
				alert('Add a runway first.')
				return;
			}
			
			var currentX = Math.round(stage.mouseX);
			var currentY = Math.round(stage.mouseY);
			if(edit.pointMode.mode == 3 || edit.pointMode.mode == 4){
				if(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.gateNum].path.length == 0){
					terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.gateNum].path.push({x:currentX, y:currentY});	
				}else{
					terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.gateNum].path.splice(edit.pointMode.point+1, 0, {x:currentX, y:currentY});
				}
			}else{
				if(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]].length == 0){
					terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]].push({x:currentX, y:currentY});
				}else{
					terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]].splice(edit.pointMode.point+1, 0, {x:currentX, y:currentY});
				}
			}
			buildRunwayData();
		break;
		
		case 'remove':
			if(editDot.visible == false){
				alert('Select a point to remove.');
				return;
			}

			if(edit.pointMode.mode == 3 || edit.pointMode.mode == 4){
				terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.gateNum].path.splice(edit.pointMode.point, 1);
				//updateAllGate(cModeNum);
			}else{
				terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]].splice(edit.pointMode.point, 1);
			}

			buildRunwayData();
		break;
	}
}

/*!
 * 
 * REDRAW POINT - This is the function that runs to redraw point
 * 
 */
 var lastPoint = {x:0, y:0};
function drawEditLines(){
	editShape.graphics.clear();
	
	if(terminals_arr[edit.terminalNum].runway.length == 0){
		return;
	}
	
	var strokeStyle;
	for(var p=0;p<trackName_arr.length;p++){
		if(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]].length > 0){
			if(edit.modeNum == p){
				strokeStyle = 7;
			}else{
				strokeStyle = 2;
			}
			
			if(p != 3 && p!=4){
				if(p == 0){
					editShape.graphics.setStrokeStyle(strokeStyle).beginStroke(runwayColour_arr[p]).moveTo(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][0].x, terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][0].y);
				}else {
					editShape.graphics.setStrokeStyle(strokeStyle).beginStroke(runwayColour_arr[p]).moveTo(lastPoint.x, lastPoint.y);
				}
				
				for(var n=0;n<terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]].length;n++){
					editShape.graphics.lineTo(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][n].x, terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][n].y);
					lastPoint.x = terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][n].x
					lastPoint.y = terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][n].y
				}
			}else{
				editShape.graphics.setStrokeStyle(strokeStyle).beginStroke(runwayColour_arr[p]).moveTo(lastPoint.x, lastPoint.y);
				
				for(var n=0;n<terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][edit.gateNum].path.length;n++){
					editShape.graphics.lineTo(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][edit.gateNum].path[n].x, terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][edit.gateNum].path[n].y);
					lastPoint.x = terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][edit.gateNum].path[n].x
					lastPoint.y = terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][edit.gateNum].path[n].y
				}
			}
		}
	}
}

/*!
 * 
 * DRAW ALL POINTS - This is the function that runs to draw all points
 * 
 */
function drawAllDots(){
	editDot.visible = false;
	editDotContainer.removeAllChildren();
	editDotContainer.addChild(editDot, editShape, editPlaneShadow, editPlane);
	
	if(terminals_arr[edit.terminalNum].runway.length == 0){
		return;
	}
	
	for(var p=0;p<trackName_arr.length;p++){
		if(p != 3 && p!=4){
			for(var n=0;n<terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]].length;n++){
				drawDot(p, n, terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][n].x, terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][n].y);
			}
		}else{
			for(var n=0;n<terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][edit.gateNum].path.length;n++){
				drawDot(p, n, terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][edit.gateNum].path[n].x, terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[p]][edit.gateNum].path[n].y);
			}
		}
	}
}

/*!
 * 
 * DRAW SINGLE POINT - This is the function that runs to draw single point
 * 
 */
function drawDot(p,n,x,y){
	var circle = new createjs.Shape();
	var colourCheckDot = runwayColour_arr[p];
	
	circle.graphics.beginFill(colourCheckDot).drawCircle(0, 0, dotWidth);
	circle.x = x;
	circle.y = y;
	editDotContainer.addChild(circle);
	
	circle.cursor = "pointer";
	circle.name = p+'_'+n;
	circle.addEventListener("mousedown", function(evt) {
		toggleDragEvent(evt, 'drag')
	});
	circle.addEventListener("pressmove", function(evt) {
		toggleDragEvent(evt, 'move')
	});
	circle.addEventListener("pressup", function(evt) {
		toggleDragEvent(evt, 'drop')
	});
}

/*!
 * 
 * POINT EVENT - This is the function that runs to for point event handler
 * 
 */
function toggleDragEvent(obj, con){
	switch(con){
		case 'drag':
			obj.target.offset = {x:obj.target.x-(obj.stageX), y:obj.target.y-(obj.stageY)};
			obj.target.alpha = .5;
			
			edit.pointNum = obj.target.name;
			toggleEditDot(obj.target.x, obj.target.y, obj.target.name);
		break;
		
		case 'move':
			obj.target.alpha = .5;
			obj.target.x = (obj.stageX) + obj.target.offset.x;
			obj.target.y = (obj.stageY) + obj.target.offset.y;
			toggleEditDot(obj.target.x, obj.target.y, obj.target.name);
			
			if(edit.pointMode.mode == 3 || edit.pointMode.mode == 4){
				terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.gateNum].path[edit.pointMode.point].x = Math.round(obj.target.x);
				terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.gateNum].path[edit.pointMode.point].y = Math.round(obj.target.y);
			}else{
				terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.pointMode.point].x = Math.round(obj.target.x);
				terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.pointMode.point].y = Math.round(obj.target.y);
			}
			
			drawEditLines();
		break;
		
		case 'drop':
			obj.target.alpha = 1;
		break;
	}
}

/*!
 * 
 * TOGGLE EDIT POINT - This is the function that runs to toggle edit point
 * 
 */
function toggleEditDot(x, y, name){
	edit.pointMode = getPointNum(edit.pointNum);
	
	editDot.x = x;
	editDot.y = y;
	editDot.visible = true;
	
	edit.modeNum = edit.pointMode.mode;
	$('#modelist').prop("selectedIndex", edit.modeNum);
	
	toggleGateEdit();
	loadPointData();
}

/*!
 * 
 * LOAD POINT DATA - This is the function that runs to load point data
 * 
 */
function loadPointData(){
	if(editDot.visible == false){
		$('#pointX').val('');
		$('#pointY').val('');	
		return;
	}
	
	if(edit.pointMode.mode == 3 || edit.pointMode.mode == 4){
		$('#pointX').val(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.gateNum].path[edit.pointMode.point].x);
		$('#pointY').val(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.gateNum].path[edit.pointMode.point].y);
	}else{
		$('#pointX').val(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.pointMode.point].x);
		$('#pointY').val(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.pointMode.point].y);
	}
}

/*!
 * 
 * UPDATE POINT DATA - This is the function that runs to update point data
 * 
 */
function updatePointData(){
	if(editDot.visible == false){
		alert('Select a point to update')
		return;
	}
	
	if(edit.pointMode.mode == 3 || edit.pointMode.mode == 4){
		terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.gateNum].path[edit.pointMode.point].x = $('#pointX').val();
		terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.gateNum].path[edit.pointMode.point].y = $('#pointY').val();
	}else{
		terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.pointMode.point].x = $('#pointX').val();
		terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[edit.pointMode.mode]][edit.pointMode.point].y = $('#pointY').val();
	}
	
	buildRunwayData();
}

function getPointNum(pointNum){
	var cModeNum = Number(pointNum.substring(0,1));
	var pointNum = Number(pointNum.substring(2,pointNum.length));
	return {mode:cModeNum, point:pointNum};
}

/*!
 * 
 * TEST RUN - This is the function that runs to test run
 * 
 */
function initTestRun(){
	$('#testPause').show();
	
	terminalNum = edit.terminalNum;
	planeData[0].mode = 0;
	planeData[0].runwayNum = edit.runwayNum;
	animatePlane(0);
}

function stopTestRun(){
	$('#testPause').hide();
	
	clearInterval(planeData[0].interval);
	TweenMax.killTweensOf(planeData[0].level);
	TweenMax.killTweensOf(planeData[0].value);
	
	planeData[0].plane.x = planeData[0].shadow.x = -100;
	planeData[0].plane.y = planeData[0].shadow.y = -100;
}


/*!
 * 
 * TOGGLE MODE - This is the function that runs to toggle mode
 * 
 */
function toggleMode(con){
	if(con){
		edit.modeNum++;
		edit.modeNum = edit.modeNum > trackName_arr.length - 1 ? 0 : edit.modeNum;
	}else{
		edit.modeNum--;
		edit.modeNum = edit.modeNum < 0 ? trackName_arr.length - 1 : edit.modeNum;
	}
	
	$('#modelist').prop("selectedIndex", edit.modeNum);
	edit.pointMode = {mode:edit.modeNum, point:0}
	toggleGateEdit();
}

/*!
 * 
 * TOGGLE GATES OPTION - This is the function that runs to toggle gates option
 * 
 */
function toggleGateEdit(){
	$('.gateEditWrapper').hide();
	if(edit.modeNum == 3 || edit.modeNum == 4){
		$('.gateEditWrapper').show();
		buildTerminalGate();
	}
	drawEditLines()
}

/*!
 * 
 * BUILD TERMINAL GATE - This is the function that runs to build terminal gate
 * 
 */
function buildTerminalGate(){
	$('#gatelist').empty();
	for(var n=0;n<terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[3]].length;n++){
		$('#gatelist').append($("<option/>", {
			value: n,
			text: 'Gate '+(n+1)
		}));
	}
	
	$('#gatelist').val(edit.gateNum);
}

/*!
 * 
 * TOGGLE GATE - This is the function that runs to toggle gate
 * 
 */
function toggleGate(con){
	if(con){
		edit.gateNum++;
		edit.gateNum = edit.gateNum > terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[3]].length - 1 ? 0 : edit.gateNum;
	}else{
		edit.gateNum--;
		edit.gateNum = edit.gateNum < 0 ? terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[3]].length - 1 : edit.gateNum;
	}
	
	planeData[0].gateNum = edit.gateNum;
	$('#gatelist').prop("selectedIndex", edit.gateNum);
	
	drawAllDots();
	drawEditLines();
}

/*!
 * 
 * ACTION GATE - This is the function that runs to action gate
 * 
 */
function actionGate(action){
	switch(action){
		case 'new':
			for(var n=0;n<terminals_arr[edit.terminalNum].runway.length;n++){
				terminals_arr[edit.terminalNum].runway[n][trackName_arr[3]].push({path:[]});
				terminals_arr[edit.terminalNum].runway[n][trackName_arr[4]].push({path:[]});
			}

			edit.gateNum = Number(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[3]].length-1);
			planeData[0].gateNum = edit.gateNum;
			
			buildTerminalGate();

			drawAllDots();
			drawEditLines();
		break;
		
		case 'remove':
			if(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[3]].length >= 2){
				terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[3]].splice(edit.gateNum, 1);
				terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[4]].splice(edit.gateNum, 1);
					
				edit.gateNum = Number(terminals_arr[edit.terminalNum].runway[edit.runwayNum][trackName_arr[3]].length-1);
				planeData[0].gateNum = edit.gateNum;
				
				buildTerminalGate();
				
				drawAllDots();
				drawEditLines();
			}
		break;
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
	for(var e=0;e<terminals_arr.length;e++){
		var pathArray = '';
		for(t=0;t<terminals_arr[e].runway.length;t++){
			pathArray += '{';
			for(p=0;p<trackName_arr.length;p++){
				pathArray += trackName_arr[p]+':[';

				if(p == 3 || p == 4){
					if(terminals_arr[e].runway[t][trackName_arr[p]].length == 0){
						return;	
					}
					for(var n=0;n<terminals_arr[e].runway[t][trackName_arr[p]].length;n++){
						pathArray += '{path:[';
						if(terminals_arr[e].runway[t][trackName_arr[p]][n].path.length == 0){
							return;	
						}
						for(g=0;g<terminals_arr[e].runway[t][trackName_arr[p]][n].path.length;g++){
							pathArray += '{x:'+terminals_arr[e].runway[t][trackName_arr[p]][n].path[g].x+', y:'+terminals_arr[e].runway[t][trackName_arr[p]][n].path[g].y+'}, ';
						}
						pathArray += ']},';
					}
				}else{
					if(terminals_arr[e].runway[t][trackName_arr[p]].length == 0){
						return;	
					}
					for(n=0;n<terminals_arr[e].runway[t][trackName_arr[p]].length;n++){
						incomplete = true;
						pathArray += '{x:'+terminals_arr[e].runway[t][trackName_arr[p]][n].x+', y:'+terminals_arr[e].runway[t][trackName_arr[p]][n].y+'}, ';
					}
				}
				pathArray += '],';
			}
			pathArray += '},';
		}
		
		outputArray += space+"{\n";
		outputArray += space2+"name:'"+terminals_arr[e].name+"',\n";
		outputArray += space2+"src:'"+terminals_arr[e].src+"',\n";
		outputArray += space2+"thumb:'"+terminals_arr[e].thumb+"',\n";
		outputArray += space2+"runway:[\n"+pathArray+"],\n";
		outputArray += space+"},\n\n";
				
	}
	 
	outputArray += space+'];';
	outputArray = outputArray.replace(/undefined/g,0);
	$('#outputArray').val(outputArray);	
}

/*!
 * 
 * LOAD TERMINAL ASSETS - This is the function that runs to load terminal assets
 * 
 */
var terminalFileFest;
function loadTerminalAssets(){
	terminalContainer.removeAllChildren();
	
	terminalFileFest = [];
	terminalFileFest.push({src:terminals_arr[edit.terminalNum].src, id:'terminal_'+edit.terminalNum});
	
	if(terminalFileFest.length == 0){
		loadTerminalData();
	}else{
		loader = new createjs.LoadQueue(false);		
		loader.addEventListener("complete", handleEditAssetsComplete);
		loader.loadManifest(terminalFileFest);
	}
}

function handleEditAssetsComplete() {
	$.terminals['terminal_'+edit.terminalNum] = new createjs.Bitmap(loader.getResult('terminal_'+edit.terminalNum));
	$.terminals['terminal_'+edit.terminalNum].name = 'terminal'+edit.terminalNum;
	terminalContainer.addChild($.terminals['terminal_'+edit.terminalNum]);
	
	loadTerminalData();
};