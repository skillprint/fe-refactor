var LevelsScene = function(){

	trace("LevelsScene()");

	var me = this;
	var canvas = document.getElementById("canvas_screens");
	var stage = BlitStage(canvas, {webgl:false});
	var frame = stage.addChild(new lib.scene_levels);

	var IsLocked = true;
	var prompt_attempt = 0;

	var buildComplete = false;

	var timeout;
	var buttons = [];

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

		 //header
		__utils.doText(frame.header.txt, oLANG.levels_header, {verticalAlign:"middle"});

		for(let level=1; level<=oCONFIG.levels; level++){
			var button = new lib.button_level;

			__utils.doText(button.txt, level);
			button.my_level = level;
			buttons.push(button);
			frame.addChild(button);
			button.helper = new __utils.ButtonHelper(stage, button, "norm", "over");
			button.addEventListener("click", me.doChooseLevel);

			let user_progress = oUSER.progress[level-1];
			let disks = 2 + level;
			let min_moves = (2 * disks) - 1;

			if(user_progress.unlocked){
				button.mouseEnabled = true;
				button.lock.visible=false;
				for(let i=1; i<=3;i++){
					let star = button["star_" + i];
					let has_star = (user_progress.stars >= i);
					star.visible = true;
					star.gotoAndStop((has_star) ? "on" : "off2");
				}

				if(user_progress.new_unlock){
					oUSER.progress[level-1].new_unlock = false;
					BlitSaver.doSaveData("user", oUSER);

					button.scaleX = button.scaleY = 0.9;
					createjs.Tween.get(button, {override:true}).wait(500).to({scaleX: 1.05, scaleY:1.05}, 200, createjs.Ease.cubicOut).to({scaleX: 1, scaleY:1}, 500, createjs.Ease.cubicInOut);
					stage.activeTweens.push(frame.b_play);


				}

			}else{
				button.mouseEnabled = false;
				button.lock.visible=true;
				button.star_1.visible=false;
				button.star_2.visible=false;
				button.star_3.visible=false;
				button.scaleX = button.scaleY = 0.9;

				button.filters = [new createjs.ColorFilter(.5,.5,.5, 1, 123, 95, 22, 0)];

				__utils.doCache(button);
			}
		}
		me.doLayoutButtons();



	
		//reset button
		__utils.doText(frame.b_reset.txt, oLANG.reset);
		frame.b_reset.helper = new __utils.ButtonHelper(stage, frame.b_reset, "norm", "over");
		frame.b_reset.addEventListener("click", me.doChooseReset);
		
		GameWorld.doClearObjects();
		BlitFader.doFadeIn(500);

	
}


	this.doLayoutButtons =  function(){
		var cols = (oSTAGE.game_width >= 550) ? 4 : 3;
		var rows = Math.ceil(oCONFIG.levels / cols);
		let col = 0;
		let row = 0;
		let spacing_x = 130;
		let spacing_y = 130;
		let starting_x = oSTAGE.game_center_x -(((cols-1) * 0.5) * spacing_x);
		let starting_y = oSTAGE.game_center_y -(((rows-1) * 0.5) * spacing_y);

		let myx = starting_x;
		let myy = starting_y;

		//frame.header.y = starting_y-100;

		for(let i=0; i<buttons.length; i++){
			var button = buttons[i];
			button.x = starting_x + (col * spacing_x);
			button.y = starting_y + (row * spacing_y);
			col++;
			if(col >= cols){
				col=0;
				row++;
			}
		}

	}

	//---------------------------------
	// User Actions
	//---------------------------------

	this.doChooseReset = function(o){
		if(IsLocked){return;}
		IsLocked = true;
		__snds.playSound("snd_popup", "ui");

		var Popup = new PopupConfirm({
			msg: "reset_confirm",
			callback_ok : me.doReset,
			callback_cancel : me.doCancel
		});
		
	}

	this.doCancel =  function(){
		IsLocked = false;
	}

	this.doReset =  function(){
		oUSER.progress = [
	      {unlocked:true, plays:0, stars:0, best:1000},
	      {unlocked:false, plays:0, stars:0, best:1000},
	      {unlocked:false, plays:0, stars:0, best:1000},
	      {unlocked:false, plays:0, stars:0, best:1000},
	      {unlocked:false, plays:0, stars:0, best:1000},
	      {unlocked:false, plays:0, stars:0, best:1000},
	      {unlocked:false, plays:0, stars:0, best:1000},
	      {unlocked:false, plays:0, stars:0, best:1000}
	    ];
	    BlitSaver.doSaveData("user", oUSER);

		BlitFader.doFadeTo(1);
			me.doDestroy();
			SceneManager = new TitleScene();
		

	}


	this.doChooseLevel = function(e){

		if(IsLocked){return;}
		IsLocked = true;

		__snds.playSound("snd_click", "ui");

		StacksGame.level = e.currentTarget.my_level;

		let action_1 =  function(){
			me.doDestroy();
			doFinishLoading(()=>{
				SceneManager.doDestroy();
				SceneManager = new GameScene();
				SceneManager.doInit();
			});
		}

		let action_2 =  function(){
			SceneManager.doDestroy();
			SceneManager = new TutorialScene();
		}

		let action = (seen_help) ? action_1 : action_2
		BlitFader.doFadeOut(200, action);
			
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

		frame.b_reset.x = oSTAGE.game_right - 15;
		frame.b_reset.y = oSTAGE.game_bottom - 15;
		me.doLayoutButtons();


		//recache
		if(me.scale != oSTAGE.scale){
			
		}

		frame.x = oSTAGE.game_width_margins;
		frame.y = oSTAGE.game_height_margins;
		me.scale = oSTAGE.scale;
	}
	

	me.doInit();

}


