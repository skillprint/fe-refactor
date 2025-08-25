var RecapScene = function(){

	trace("RecapScene()");

	var me = this;
	var canvas = document.getElementById("canvas_screens");
	var stage = BlitStage(canvas, {webgl:false});
	var frame = stage.addChild(new lib.scene_recap);

	var IsLocked = true;
	var prompt_attempt = 0;

	var buildComplete = false;

	var timeout;

	//---------------------------
	// init
	//---------------------------

	this.doInit = function(){
		IsLocked = false;
		me.forget=false;
		update_queue.push(me);
		me.doResizeUpdate();
		RESIZER.needUpdate = true;

		var delay = 500;

		//result
		frame.star_1.visible=false;
		frame.star_2.visible=false;
		frame.star_3.visible=false;

		__utils.doText(frame.result_block.txt_hrd, oLANG["recap_hdr_"+ StacksGame.stars + "_stars"]);

		let t = JSON.parse(JSON.stringify(oLANG.recap_msg));
		t.value = __utils.doSubValue(oLANG.recap_msg.value, StacksGame.moves);
		__utils.doText(frame.result_block.txt_msg, t);

		//play button
		__utils.doText(frame.b_replay.txt, oLANG.replay);
		frame.b_replay.visible=false;
		frame.b_replay.helper = new __utils.ButtonHelper(stage, frame.b_replay, "norm", "over");
		frame.b_replay.addEventListener("click", me.doChooseReplay);
		
		frame.b_replay.y = oSTAGE.game_bottom + 100;
		createjs.Tween.get(frame.b_replay, {override:true}).wait(delay).set({visible:true}).to({y: frame.b_replay.myy}, 500, createjs.Ease.cubicOut);
		stage.activeTweens.push(frame.b_replay);
		delay+=200;

		//play button
		__utils.doText(frame.b_play.txt, oLANG.continue);
		frame.b_play.visible=false;
		frame.b_play.helper = new __utils.ButtonHelper(stage, frame.b_play, "norm", "over");
		frame.b_play.addEventListener("click", me.doChooseContinue);
		
		frame.b_play.y = oSTAGE.game_bottom + 100;
		createjs.Tween.get(frame.b_play, {override:true}).wait(delay).set({visible:true}).to({y: frame.b_play.myy}, 500, createjs.Ease.cubicOut);
		stage.activeTweens.push(frame.b_play);
		
		GameWorld.doClearObjects();
		GameWorld.scene.background = oASSETS.background;
		me.doShowStars();

		BlitFader.doFadeIn(500);

	
	}

	this.doShowStars =  function(){




		let user_progress = oUSER.progress[StacksGame.level-1];

		

		let disks = 2 + StacksGame.level;
		let min_moves = (2 * disks) - 1;
		let has_1_star =(StacksGame.stars >= 1);
		let has_2_star = (StacksGame.stars >= 2);
		let has_3_star = (StacksGame.stars >= 3);
		frame.star_1.visible=true;
		frame.star_2.visible=true;
		frame.star_3.visible=true;
		frame.star_1.gotoAndStop((has_1_star) ? "on" : "off");
		frame.star_2.gotoAndStop((has_2_star) ? "on" : "off");
		frame.star_3.gotoAndStop((has_3_star) ? "on" : "off");



	}



	//---------------------------------
	// User Actions
	//---------------------------------

	this.doChooseContinue = function(o){
		if(IsLocked){return;}
		IsLocked = true;
		__snds.playSound("snd_click", "ui");
		BlitFader.doFadeOut(200, ()=>{
			SceneManager.doDestroy();
			SceneManager = new LevelsScene();
		});
	}

	this.doChooseReplay = function(o){
		if(IsLocked){return;}
		IsLocked = true;
		__snds.playSound("snd_click", "ui");
		BlitFader.doFadeOut(200, ()=>{
			SceneManager.doDestroy();
			SceneManager = new GameScene();
			SceneManager.doInit();
		});
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

		frame.b_play.myy = frame.b_play.y = oSTAGE.game_bottom - 20;
		frame.b_play.x = oSTAGE.game_size.center_x;


		frame.b_replay.myy = frame.b_replay.y = oSTAGE.game_bottom - 90;
		frame.b_replay.x = oSTAGE.game_size.center_x;

		frame.result_block.x = oSTAGE.game_size.center_x;
		frame.result_block.y = oSTAGE.game_size.center_y - 60;


		frame.star_1.x = oSTAGE.game_size.center_x - 60;
		frame.star_1.y = oSTAGE.game_size.center_y + 40;
		frame.star_2.x = oSTAGE.game_size.center_x;
		frame.star_2.y = oSTAGE.game_size.center_y + 40;
		frame.star_3.x = oSTAGE.game_size.center_x + 60;
		frame.star_3.y = oSTAGE.game_size.center_y + 40;

		//recache
		if(me.scale != oSTAGE.scale){
			
		}

		frame.x = oSTAGE.game_width_margins;
		frame.y = oSTAGE.game_height_margins;
		me.scale = oSTAGE.scale;
	}
	

	me.doInit();

}


