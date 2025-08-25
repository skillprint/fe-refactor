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
	var num_puzzles;
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

		num_puzzles = oCONFIG.puzzles.length;


		for(let level=1; level<=num_puzzles; level++){
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

			button.unlocked = user_progress.unlocked;

			if(user_progress.unlocked){
				button.mouseEnabled = true;
				button.lock.visible=false;
				button.txt.visible=true;
				
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
				button.txt.visible=false;
				button.scaleX = button.scaleY = 0.9;
				button.filters = [new createjs.ColorFilter(.5,.5,.5, 0.7, 32, 32, 32, 0)];
				__utils.doCache(button);
			}
		}
		me.doLayoutButtons();

		//reset button
		__utils.doText(frame.b_reset.txt, oLANG.reset);
		frame.b_reset.helper = new __utils.ButtonHelper(stage, frame.b_reset, "norm", "over");
		frame.b_reset.addEventListener("click", me.doChooseReset);
		
		BlitFader.doFadeIn(500);

	
}


	this.doLayoutButtons =  function(){


		var grid_total_width = oSTAGE.game_width - 40;
		var grid_total_height = oSTAGE.game_height - 120;
		var grid_total_area = grid_total_width * grid_total_height;
		
		var grid_area = grid_total_area / buttons.length;
		var grid_max_size = 100;
		var grid_size = Math.min(grid_max_size, Math.sqrt(grid_area));

		var max_cols = Math.ceil(grid_total_width / grid_size);
		var cols = Math.min(buttons.length, max_cols);
		var rows = Math.ceil(buttons.length / cols);
		let col = 0;
		let row = 0;
		let spacing_x = Math.min(grid_total_width/max_cols, grid_total_height/rows);
		let spacing_y = spacing_x;
		let starting_x = oSTAGE.game_center_x -(((cols-1) * 0.5) * spacing_x);
		let starting_y = oSTAGE.game_center_y -(((rows-1) * 0.5) * spacing_y);

		let button_scale = Math.min(1, spacing_x/80);

		for(let i=0; i<buttons.length; i++){
			var button = buttons[i];
			button.x = starting_x + (col * spacing_x);
			button.y = starting_y + (row * spacing_y);
			button.scale = Math.min(1, spacing_x/80);
			col++;
			if(col >= cols){
				col=0;
				row++;
			}

			if(button.unlocked){
				//button.scale = button_scale
				button.filters = [];
			}else{
				//button.scale = button_scale * 0.9;
				button.filters = [new createjs.ColorFilter(.5,.5,.5, 0.7, 32, 32, 32, 0)];
				__utils.doCache(button);
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
		oUSER.progress = [];
		//add levels
	    for(let i=0; i<oCONFIG.puzzles.length; i++){
	      oUSER.progress.push(JSON.parse(JSON.stringify(oCONFIG.level_template)));
	    }
	    //unlock first
	    oUSER.progress[0].unlocked = true;
	    BlitSaver.doSaveData("user", oUSER);

		BlitFader.doFadeTo(1);
		me.doDestroy();
		SceneManager = new TitleScene();
	}


	this.doChooseLevel = function(e){

		if(IsLocked){return;}
		IsLocked = true;

		__snds.playSound("snd_click", "ui");

		GameManager.doNewGame();
		GameManager.level = e.currentTarget.my_level;

		let goto_game_action =  function(){
	      SceneManager.doDestroy();
	      doFinishLoading(()=>{
	        SceneManager.doDestroy();
      		SceneManager = new GameScene();
	      });
	    }
	    
	    let goto_help_action =  function(){
	      SceneManager.doDestroy();
	      SceneManager = new TutorialScene(goto_game_action, "play");
	    }

 		let action = (oUSER.seen_help) ? goto_game_action : goto_help_action;
    	BlitFader.doFadeOut(200, action);
			
	}



	this.doDestroy = function(){
		stage.removeAllChildren();
		stage.enableMouseOver(0);
		me.forget = true;
		stage.needUpdate = true;
	}
 


	//------------------------
	// resize
	//------------------------

	this.doResizeUpdate = function(){

		frame.header.x = oSTAGE.game_size.center_x;
		frame.header.y = oSTAGE.game_top;

		frame.b_reset.x = oSTAGE.game_right - 10;
		frame.b_reset.y = oSTAGE.game_bottom - 10;
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


