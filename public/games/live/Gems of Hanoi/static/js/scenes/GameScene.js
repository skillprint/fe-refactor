var GameScene = function(){

	trace("GameScene()");

	var me = this;
	var canvas = document.getElementById("canvas_screens");
	var stage = BlitStage(canvas, {webgl:false});
	var frame = stage.addChild(new lib.scene_game);

	var IsLocked = true;
	var prompt_attempt = 0;

	var buildComplete = false;

	var timeout;

	//---------------------------
	// init
	//---------------------------

	this.doInit = function(){

		StacksGame.doInit();
		BlitFader.doFadeIn(500, StacksGame.doGo);

		return;

		IsLocked = false;
		me.forget=false;
		update_queue.push(me);
		me.doResizeUpdate();
		RESIZER.needUpdate = true;

		 //header
		__utils.doText(frame.header.txt, oLANG.label_moves, {verticalAlign:"middle"});

		var delay = 500;

		//reset button
		frame.b_restart.helper = new __utils.ButtonHelper(stage, frame.b_restart, "norm", "over");
		frame.b_restart.addEventListener("click", me.doChooseRestart);

		frame.b_home.helper = new __utils.ButtonHelper(stage, frame.b_home, "norm", "over");
		frame.b_home.addEventListener("click", me.doChooseHome);


		StacksGame.doInit();
		BlitFader.doFadeIn(500, StacksGame.doGo);

	}

	this.doUpdateMoves = function(moves){

		let str = __utils.doFormatNumber(moves);
		__utils.doText(frame.header.txt_moves, str, {verticalAlign:"middle"});
		stage.needUpdate = true;
	}

	//---------------------------------
	// User Actions
	//---------------------------------

	this.doChooseRestart = function(o){
		if(IsLocked){return;}
		IsLocked = true;
		__snds.playSound("snd_popup", "ui");

		var Popup = new PopupConfirm({
			msg: "restart_confirm",
			callback_ok : me.doConfirmRestart,
			callback_cancel : me.doCancel
		});
	}

	this.doChooseHome = function(o){
		if(IsLocked){return;}
		IsLocked = true;
		__snds.playSound("snd_popup", "ui");

		var Popup = new PopupConfirm({
			msg: "home_confirm",
			callback_ok : me.doConfirmHome,
			callback_cancel : me.doCancel
		});
	}


	this.doConfirmRestart = function(){
		spLogEvent({event: "LEVEL_RESTART", level: StacksGame.level});
		BlitFader.doFadeOut(200, ()=>{
			SceneManager.doDestroy();
			SceneManager = new GameScene();
			SceneManager.doInit();
		});
	}

	this.doConfirmHome = function(){
		spLogEvent({event: "LEVEL_QUIT", level: StacksGame.level});
		BlitFader.doFadeOut(200, ()=>{
			SceneManager.doDestroy();
			SceneManager = new TitleScene();
		});
	}

	this.doCancel =  function(){
		IsLocked = false;
	}
	

	this.doDestroy = function(){
		stage.removeAllChildren();
		stage.enableMouseOver(0);
		GameWorld.doClearObjects();
		me.forget = true;
		stage.needUpdate = true;
	}



	//------------------------
	// resize
	//------------------------

	this.doResizeUpdate = function(){
		frame.header.x = oSTAGE.game_size.center_x;
		frame.header.y = oSTAGE.game_top;
		frame.b_restart.x = oSTAGE.game_right - 80;
		frame.b_restart.y = oSTAGE.game_bottom - 15;

		frame.b_home.x = oSTAGE.game_right - 15;
		frame.b_home.y = oSTAGE.game_bottom - 15;

		//recache
		if(me.scale != oSTAGE.scale){
			
		}

		frame.x = oSTAGE.game_width_margins;
		frame.y = oSTAGE.game_height_margins;
		me.scale = oSTAGE.scale;
	}
	

	//me.doInit();

}


