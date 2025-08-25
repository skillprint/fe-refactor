var StacksGameManager = function(){

	var me = this;

	me.level = null;
	me.moves = 0;
	me.floating_disk = null;

	var stacks = [];
	var updateFunction = ()=>{};
	var over_post = -1;

	var IsLocked = false;

	var buttonListener;

	me.click_pending = false;

	this.doInit =  function() {

		__snds.stopSound("music");
		music_playing = null;
		over_post = -1;
		updateFunction = ()=>{};


		spLogEvent({event: "LEVEL_START", level: me.level, disks: (me.level + 2)});

		me.forget = false;

		GameWorld.cam_target = new THREE.Vector3(0, 6, 0);
		GameWorld.cam_pos = new THREE.Vector3(0, 30, 80);
		GameWorld.camera.position.set(GameWorld.cam_pos.x, GameWorld.cam_pos.y, GameWorld.cam_pos.z);
		GameWorld.camera.lookAt (GameWorld.cam_target.x, GameWorld.cam_target.y, GameWorld.cam_target.z);
		
		GameWorld.cam_dist = GameWorld.camera.position.distanceTo(GameWorld.cam_target);
		GameWorld.min_focus_width = 30;
		GameWorld.min_focus_height = 20;
		
		GameWorld.max_focus_width = 32;
		GameWorld.max_focus_height = 25;

  		GameGUI.doInitScore();


		me.moves = 0;

		GameWorld.doClearObjects();
		
		GameGUI.doUpdateMoves(0);

		//posts
		stacks = [];
		let spacing_x = 11;
		let myx = -spacing_x;
		for(let i=0; i<3; i++){
			let post = (i==2) ? oASSETS.post_gold.clone() : oASSETS.post.clone();
			post.position.set(myx,-.5,0);
			post.rotation.z = __utils.radFromDeg(-20);

			let shadow = oASSETS.shadow.clone();
			shadow.position.set(myx,-.5,0);
			shadow.material.transparent = true;
			shadow.material.blending = THREE.FlatShading;
			shadow.material.opacity = .4;
			shadow.rotation.z = __utils.radFromDeg(-10);

			GameWorld.scene.add(post, shadow);
			let stack = {"myx": myx, "post": post, "disks":[], "pos":post.position};
			stacks.push(stack);
			myx+=spacing_x;
		}

		//add disks to first stack
		let stack = stacks[0];
		let spacing_y = 1;
		let config = oCONFIG.disk_config[me.level-1];
		
		for(let i=0; i<config.length; i++){
			let id = config[i];
			let disk = oASSETS["disk_" + id].clone();
			disk.my_id = id;
			disk.which = (config.length - i);
			disk.position.set(stack.myx, i * spacing_y, 0);
			disk.material.transparent=true;
			disk.material.blending = THREE.FlatShading;
			GameWorld.scene.add(disk);
			stack.disks.push(disk);
		}

		document.getElementById("canvas_screens").style.display = "none";

		RESIZER.w = 0;
		GameWorld.actives.push(me);

		BlitFader.doFadeIn(500, me.doGo);

		IsLocked=false;

		buttonListener = {};
		buttonListener.forget = false;
		buttonListener.doUpdate = me.doCheckButtons;
		GameWorld.actives.push(buttonListener);

	}


	var home_is_over = false;
	var reset_is_over = false;


	this.doCheckButtons = function(){
		if(IsLocked){
			me.click_pending=false;
			return
		};

		let over_quit = false;
		let over_reset = false;
		let offset_x, offset_y;

		if(BlitInputs.click_pending){
			BlitInputs.click_pending = false;

			offset_x = Math.abs(BlitInputs.mouse_x - (oSTAGE.game_width-40));
			offset_y = Math.abs(BlitInputs.mouse_y - (oSTAGE.game_height-35));
			if (offset_x <= 30 && offset_y <= 26){
				over_quit= true;
			}

			offset_x = Math.abs(BlitInputs.mouse_x - (oSTAGE.game_width-105));
			offset_y = Math.abs(BlitInputs.mouse_y - (oSTAGE.game_height-35));
			if (offset_x <= 30 && offset_y <= 26){
				over_reset= true;
			}

			if(over_quit){
				me.doChooseHome();
			}else if(over_reset){
				me.doChooseRestart();
			}else{
				me.click_pending = true;
			}
	
		}
	}



	this.doGo =  function(){
		 me.doAwaitPlayerPickup();
	}



	this.doPickupDisk =  function(which_stack){
		let stack = stacks[which_stack];
		if(stack.disks.length == 0){
			me.doAwaitPlayerPickup();
		}else{
			me.floating_disk = stack.disks.pop();
			me.floating_disk.from_stack = which_stack;
			createjs.Tween.get(me.floating_disk.position, {override:true}).to({y:14}, 1000, createjs.Ease.getElasticOut(1, .8));
			me.doAwaitPlayerDrop();
		}
	}

	this.doDropDisk = function(which_stack){
		//slide to post
		let stack = stacks[which_stack];

		let ok=false;
		if(stack.disks.length==0){
			ok=true;
		}else if(stack.disks[stack.disks.length-1].my_id < me.floating_disk.my_id){
			ok=true;
		} 
		let offset = Math.abs(stack.myx - me.floating_disk.position.x);
		let time = (offset/24) * 500;
		createjs.Tween.get(me.floating_disk.position, {override:true}).to({x:stack.myx}, time, createjs.Ease.cubicInOut).call(()=>{
			if(ok){
				createjs.Tween.get(me.floating_disk.position, {override:true}).to({y:(stack.disks.length*1)}, 1000, createjs.Ease.bounceOut);
				stack.disks.push(me.floating_disk);
				if(me.floating_disk.from_stack == which_stack){
					me.doAwaitPlayerPickup();
				}else{
					spLogEvent({event: "MOVED", disk: me.floating_disk.which, peg: (which_stack + 1)});
					me.doCompleteMove();
				}

				me.floating_disk = null;
			}else{

				__snds.playSound("snd_bad", "ui");
				createjs.Tween.get(me.floating_disk.rotation, {override:true}).to({y:-.1}, 200, createjs.Ease.cubicInOut).to({y:.1}, 200, createjs.Ease.cubicInOut).to({y:0}, 200, createjs.Ease.cubicInOut);
				me.doAwaitPlayerDrop();
			}
		});

		return ok;
	}



	this.doCompleteMove =  function(){
		me.moves++;
		let solved = me.doCheckSolve();
		
		GameGUI.doUpdateMoves(me.moves);
		__snds.playSound("snd_good", "ui");

		if(solved){
			setTimeout(me.doAnimateWin, 1000);
		}else{
			me.doAwaitPlayerPickup();
		}
	}


	this.doAnimateWin = function(){
		__snds.playSound("snd_game_complete", "ui");	
		let stack = stacks[2];
		let delay = 0;
		let hang_delay = stack.disks.length * 50;
		for(let i=stack.disks.length-1; i>=0; i--){
			let disk = stack.disks[i];
			disk.myy = disk.position.y
			createjs.Tween.get(disk.position, {override:true}).wait(delay).to({y:disk.myy + 2 + (i*1)}, 200 + (i*20), createjs.Ease.cubicOut).to({y:disk.myy}, 200 + (i*20), createjs.Ease.cubicIn);
			delay += 50;
			hang_delay-=50;
		}
		setTimeout(me.doWrapup, delay + 2000);
	}


	this.doCheckSolve =  function(){
		let stack = stacks[2];
		var disks = stack.disks;
		let key = oCONFIG.disk_config[me.level-1];
		let ok = true;

		if(disks.length != key.length){
			return false;
		}

		for(let i=0;i<disks.length; i++){
			if(disks[i].my_id != key[i]){
				return false;
			}
		}

		return true;
	}





	this.doAwaitPlayerPickup = function(){
		me.click_pending = false;
		updateFunction = ()=>{
			if(IsLocked){return};
			if(me.click_pending){
				me.click_pending = false;
				over_post = me.doGetPostOver();
				if(over_post != -1){ 
					updateFunction = null;
					me.doPickupDisk(over_post);
				}
			}
		}
	}

	me.doAwaitPlayerDrop =  function(){
		me.click_pending = false;
		updateFunction = ()=>{
			if(IsLocked){return};
			if(me.click_pending){
				me.click_pending = false;
				over_post = me.doGetPostOver();
				if(over_post != -1){ 
					updateFunction = null;
					me.doDropDisk(over_post);
				}
			}
		}
	}






	this.doGetPostOver =  function(){
		var widthHalf = oSTAGE.game_width / 2
		var heightHalf = oSTAGE.game_height / 2;

		GameWorld.camera.updateMatrixWorld();

		var pos_1 = stacks[0].post.position.clone();
		pos_1.project(GameWorld.camera);
		pos_1.x = ( pos_1.x * widthHalf ) + widthHalf;
		pos_1.y = -( pos_1.y * heightHalf ) + heightHalf;

		var pos_2 = stacks[1].post.position.clone();
		pos_2.project(GameWorld.camera);
		pos_2.x = ( pos_2.x * widthHalf ) + widthHalf;
		pos_2.y = -( pos_2.y * heightHalf ) + heightHalf;

		var pos_3 = stacks[2].post.position.clone();
		pos_3.project(GameWorld.camera);
		pos_3.x = ( pos_3.x * widthHalf ) + widthHalf;
		pos_3.y = -( pos_3.y * heightHalf ) + heightHalf;

		let post_half_width = Math.abs(pos_1.x - pos_2.x) * 0.5;

		let over_post = -1;
		if(Math.abs(BlitInputs.mouse_x - pos_1.x) < post_half_width){
			over_post = 0;
		}else if(Math.abs(BlitInputs.mouse_x - pos_2.x) < post_half_width){
			over_post = 1;
		}else if(Math.abs(BlitInputs.mouse_x - pos_3.x) < post_half_width){
			over_post = 2;
		}

		var popup_canvas = document.getElementById("canvas_popups");
		var popup_is_visible = (popup_canvas.style.display != "none");

		if(BlitInputs.mouse_y > oSTAGE.game_height - 60 || popup_is_visible || BlitInputs.mouse_y <  60){
			over_post = -1;
		}

		return over_post;


	}


	this.doWrapup = function(){

		spLogEvent({event: "LEVEL_COMPLETE", level: me.level, moves: me.moves});

		let user_progress = oUSER.progress[StacksGame.level-1];

		let disks = 2 + me.level;
		let min_moves = Math.pow(2, disks) - 1;
		let has_1_star = (me.moves <= (min_moves + Math.ceil(min_moves * 0.2)));
		let has_2_star = (me.moves <= (min_moves + Math.ceil(min_moves * 0.1)));
		let has_3_star = (me.moves <= (min_moves));

		me.stars = (has_3_star) ? 3 : (has_2_star) ? 2 : (has_1_star) ? 1 : 0;

		trace("level = " + me.level);
		trace("moves = " + me.moves);
		trace("min_moves = " + min_moves);
		trace("stars = " + me.stars);

		let new_star = (me.stars > user_progress.stars);


		oUSER.progress[me.level-1].best = Math.min(me.moves, oUSER.progress[me.level-1].best);
		oUSER.progress[me.level-1].stars = Math.max(user_progress.stars, me.stars);
		
		var next_level = me.level+1;
		if(next_level <= oUSER.progress.length && !oUSER.progress[next_level-1].unlocked){
 			oUSER.progress[next_level-1].unlocked = true;
 			oUSER.progress[next_level-1].new_unlock = true;

 			if(next_level == oUSER.progress.length){
				spLogEvent({event: "ALL_LEVELS_COMPLETED"});
 			}
		}
		
 		BlitSaver.doSaveData("user", oUSER);

		BlitFader.doFadeOut(100, ()=>{
			me.doDestroy();
			GameWorld.doClearObjects();
			GameGUI.doClear();
			document.getElementById("canvas_screens").style.display = "block";
			SceneManager = new RecapScene();	
		});
		return;
	}


	this.doUpdate = function(){
		if(updateFunction){
			updateFunction();
		}
	}

	this.doDestroy =  function(){
		__snds.stopSound("music");
		buttonListener.forget = true;
		me.forget = true;
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
			me.doDestroy();
			GameWorld.doClearObjects();
			GameGUI.doClear();
			StacksGame.doInit();
		});
	}

	this.doConfirmHome = function(){
		spLogEvent({event: "LEVEL_QUIT", level: StacksGame.level});
		BlitFader.doFadeOut(200, ()=>{
			me.doDestroy();
			GameWorld.doClearObjects();
			GameGUI.doClear();
			document.getElementById("canvas_screens").style.display = "block";
			SceneManager = new TitleScene();
		});
	}

	this.doCancel =  function(){
		IsLocked = false;
		BlitInputs.click_pending = false;
		me.click_pending = false;
	}















}