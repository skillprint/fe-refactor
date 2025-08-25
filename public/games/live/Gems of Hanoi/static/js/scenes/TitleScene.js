var TitleScene = function(){

	trace("TitleScene()");

	var me = this;
	var canvas = document.getElementById("canvas_screens");
	var stage = BlitStage(canvas, {webgl:false});
	var frame = stage.addChild(new lib.scene_title);

	var IsLocked = true;
	var prompt_attempt = 0;

	var buildComplete = false;

	var timeout;

	//---------------------------
	// init
	//---------------------------

	this.doInit = function(){

/*
		let action =  function(){
			SceneManager.doDestroy();
			SceneManager = new TutorialScene();
		}
		BlitFader.doFadeOut(200, action);
		return

*/

		IsLocked = false;
		me.forget=false;
		update_queue.push(me);
		me.doResizeUpdate();
		RESIZER.needUpdate = true;

		var delay = 500;

		//logo
		frame.logo.visible = true;
		frame.logo.alpha = 1;
		//createjs.Tween.get(frame.logo, {override:true}).set({visible:true}).to({alpha: 1}, 500);
		//stage.activeTweens.push(frame.logo);

		//play button
		trace(frame.b_play.txt);
		__utils.doText(frame.b_play.txt, oLANG.play);
		frame.b_play.visible=false;
		frame.b_play.helper = new __utils.ButtonHelper(stage, frame.b_play, "norm", "over");
		frame.b_play.addEventListener("click", me.doChoosePlay);
		frame.b_play.y = oSTAGE.game_bottom + 210;
		createjs.Tween.get(frame.b_play, {override:true}).wait(delay).set({visible:true}).to({y: frame.b_play.myy}, 500, createjs.Ease.cubicOut);
		stage.activeTweens.push(frame.b_play);

		GameWorld.doClearObjects();
		GameWorld.doSetBackground({"type":"pattern", "asset" : oASSETS.background});

		//GameWorld.scene.background = oASSETS.background;
		BlitFader.doFadeIn(500);

	}

	//---------------------------------
	// User Actions
	//---------------------------------

	this.doChoosePlay = function(o){
		if(IsLocked){return;}
		IsLocked = true;

		__snds.playSound("snd_click", "ui");

		BlitFader.doFadeOut(200, ()=>{
			SceneManager.doDestroy();
			SceneManager = new LevelsScene();
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

		frame.logo.x = oSTAGE.game_size.center_x;
		frame.logo.y = oSTAGE.game_size.center_y;


		frame.logo.scale = Math.min(1, ((oSTAGE.game_right - oSTAGE.game_left) - 20) / 500);

		//recache
		if(me.scale != oSTAGE.scale){
			
		}

		frame.x = oSTAGE.game_width_margins;
		frame.y = oSTAGE.game_height_margins;
		me.scale = oSTAGE.scale;
	}
	

	me.doInit();

}


