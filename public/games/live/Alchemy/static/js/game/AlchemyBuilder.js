var AlchemyBuilder = function(){

	var me = this;
	var canvas = document.getElementById("canvas_builder");
	var stage = BlitStage(canvas, {"webgl": false, "no_resize":true});
	var frame = stage.addChild(new lib.scene_game());
	canvas.style.display = "none";

	me.pending_pickup = null;
	me.pending_remove = null;
	me.clips = [];

	var IsLocked = false;


	//---------------------------
	// init
	//---------------------------
	
	this.doInit = function(){
		me.pending_pickup = null;
		canvas.style.display = "block";
		me.clips = [];

		frame.b_restart.helper = new __utils.ButtonHelper(stage, frame.b_restart,"norm","over");
		frame.b_restart.addEventListener("click", me.doChooseRestart);
		frame.b_home.helper = new __utils.ButtonHelper(stage, frame.b_home,"norm","over");
		frame.b_home.addEventListener("click", me.doChooseHome);

    __utils.doText(frame.hdr.txt, oLANG.workspace);

		var o = new Object();
        o.forget = false;
        o.update_function = me.doUpdateFrame;
        stage.actives.push(o);
        let tempBuilder = oUSER.builder.slice();
        oUSER.builder = [];
	 	for(let i=0; i<tempBuilder.length; i++){
	      let o = tempBuilder[i];
	      me.doRestoreItem(o.item, o.x, o.y);
	    }
	}


	this.doRestoreItem =  function(item, x, y){

		var new_tile = stage.addChild(new lib.mc_tile());
		__utils.doText(new_tile.txt, oLANG[item.id]);
		new_tile.x = x;
		new_tile.y = y;
		new_tile.myx = x;
		new_tile.myy = y;
		new_tile.item = item;
		
		new_tile.button.clip = new_tile;
		new_tile.button.helper = new __utils.ButtonHelper(stage, new_tile.button, "norm", "over");
		new_tile.button.addEventListener("mousedown", function(e){
			var clip = e.currentTarget.clip;
			me.pending_pickup = clip;
		});


		new_tile.icon = new AlchemyIcon(item.id, new_tile.icon_dummy, new_tile.spinner_dummy, stage);

		me.clips.push(new_tile);
		oUSER.builder.push({"id": new_tile.id,"item": item, "x":x, "y":y});
		stage.needUpdate = true;
	}



	this.doUpdateFrame =  function(){

		if(me.pending_remove){
			stage.removeChild(me.pending_remove);
			me.pending_remove=false;
		}
		if(BlitInputs.mouse_is_down){
			if(me.pending_pickup){
				let clip = me.pending_pickup;
				let clip_pos = new createjs.Point(clip.x + me.left, clip.y + me.top);
				let mouse_offset = new createjs.Point(clip_pos.x - BlitInputs.mouse_x, clip_pos.y - BlitInputs.mouse_y);
 				SceneManager.FLOATER.doPickupItem(clip.item, clip_pos, mouse_offset, "builder");
 				me.doDestroyTile(clip);
				me.pending_remove = clip;
				me.pending_pickup = null;
			}
		}else{
			me.pending_pickup = null;
		}

	}

	this.doDropItem = function(item, x, y, is_return){

		var closest_clip = null;
		var close_clips = [];
		var closest_dist = Infinity;
		var closest_combinable_clip = null;
		var close_combinable_clips = [];
		var closest_combinable_dist = Infinity;

		for(let i=0; i<me.clips.length; i++){
			let clip = me.clips[i];
			let dist = __utils.doGetDistance(x,y,clip.x,clip.y);
			if(dist < 40){
				//register close clips
				close_clips.push(clip);
				if(dist < closest_dist){
					closest_dist = dist;
					closest_clip = clip;
				}

				//register close combinable clips
				let id_1 = item.id;
				let id_2 = closest_clip.item.id;
				let combinable = (recipe_lookups.hasOwnProperty(id_1 + "+" + id_2));
				if(combinable){
					close_combinable_clips.push(clip);
					if(dist < closest_combinable_dist){
						closest_combinable_dist = dist;
						closest_combinable_clip = clip;
					}
				}
			}
		}


		if(!is_return && closest_combinable_clip){
			let id_1 = item.id;
			let id_2 = closest_clip.item.id;
			let new_item = oCONFIG.items[recipe_lookups[id_1 + "+" + id_2]];
			me.doCombineItems(item, x, y, closest_combinable_clip, new_item);

			trace(id_1 + ", " + id_2);

			spLogEvent({
	      		event: "COMBINE_ATTEMPT",
	      		result: me.doItemExists(new_item.id) ? "success_exists" : "success_new",
	      		item_1: id_1,
	      		item_2: id_2,
	      		resulting_item: new_item.id
			});
			return true;
			
		}else if(!is_return && closest_clip){

			let id_1 = item.id;
			let id_2 = closest_clip.item.id;

			spLogEvent({
				event: "COMBINE_ATTEMPT",
	      		result:"fail",
	      		item_1:id_1,
	      		item_2:id_2
	    	});

			return false;
		
		}else{
			if(!is_return){
				__snds.playSound("snd_drop", "icons");
			}
			me.doAddItem(item, x, y, {"speed":{x:0,y:0}, "is_return" : is_return});
			return true;
		}
	}



	this.doItemExists = function(id){
		for(let i=0; i<oUSER.library.length; i++){
			let o = oUSER.library[i];
			if(o.id == id){
				return true;
			}
		}
		return false;
	}


	this.doCombineItems =  function(item, x, y, existing_tile, new_item){
		var new_tile = stage.addChild(new lib.mc_tile());
		__utils.doText(new_tile.txt, oLANG[item.id]);
		new_tile.icon = new AlchemyIcon(item.id, new_tile.icon_dummy, new_tile.spinner_dummy, stage, true);
		new_tile.x = x;
		new_tile.y = y;
		new_tile.myx = x;
		new_tile.myy = y;

		new_tile.button.removeAllEventListeners();
		existing_tile.button.removeAllEventListeners();
		createjs.Tween.get(new_tile.txt, {override: true}).to({alpha:0}, 100);
		createjs.Tween.get(existing_tile.txt, {override: true}).to({alpha:0}, 100);
		
		//find center point
		let center = new createjs.Point((x + existing_tile.x) * 0.5, (y + existing_tile.y) * 0.5);
		createjs.Tween.get(new_tile, {override: true}).to({x:center.x, y:center.y}, 400, createjs.Ease.cubicInOut).call(()=>{
	    	me.doDestroyTile(new_tile);
	    });
	    stage.activeTweens.push(new_tile);
	    createjs.Tween.get(existing_tile, {override: true}).to({x:center.x, y:center.y}, 400, createjs.Ease.cubicOut).call(()=>{
	    	me.doDestroyTile(existing_tile);
				me.doAddItem(new_item, center.x, center.y, {"fx":true});
	    });
	    stage.activeTweens.push(existing_tile);
	}




	this.doAddItem =  function(item, x, y, options){

		var new_tile = stage.addChild(new lib.mc_tile());
		__utils.doText(new_tile.txt, oLANG[item.id]);
		new_tile.x = x;
		new_tile.y = y;
		new_tile.myx = x;
		new_tile.myy = y;
		new_tile.item = item;
		
		new_tile.button.clip = new_tile;
		new_tile.button.helper = new __utils.ButtonHelper(stage, new_tile.button, "norm", "over");
		new_tile.button.addEventListener("mousedown", function(e){
			var clip = e.currentTarget.clip;
			me.pending_pickup = clip;
		});

		new_tile.icon = new AlchemyIcon(item.id, new_tile.icon_dummy, new_tile.spinner_dummy, stage);
		
		if(options.fx){
			new_tile.txt.alpha = 0;
			createjs.Tween.get(new_tile.txt, {override: true}).to({alpha:1}, 100);
			stage.activeTweens.push(new_tile.txt);
			new_tile.icon_dummy.rotation = -360;
			createjs.Tween.get(new_tile.icon_dummy, {override: true}).to({rotation:0}, 500, createjs.Ease.cubicOut);
			stage.activeTweens.push(new_tile.icon_dummy);
		}else{
			new_tile.button.gotoAndStop(1);


		}

		me.clips.push(new_tile);

		//add to library?
		var isNew = true;
		for(let i=0; i<oUSER.library.length;i++){
			if(oUSER.library[i].id == item.id){
				isNew=false;
			}
		}

		if(isNew){
			SceneManager.LIBRARY.doAddItem(item);
			SceneManager.LIBRARY.doUpdateFound();
		}

		oUSER.builder.push({"id": new_tile.id,"item": item, "x":x, "y":y});
		BlitSaver.doSaveData("user", oUSER);

		
		stage.update();
	}




	//----------------------------------------
	// clean up
	//----------------------------------------


	this.doDestroyTile =  function(tile){
		trace("doDestroyTile()");

		for(let i=me.clips.length-1; i>=0; i--){
			if(me.clips[i] == tile){
 				me.clips.splice(i, 1);
			}
		}

		for(let i=0; i<oUSER.builder.length;i++){
			if(oUSER.builder[i].id == tile.id){
				oUSER.builder.splice(i, 1);
			}
		}
		BlitSaver.doSaveData("user", oUSER);
		tile.forget = true;
		stage.removeChild(tile);
	}







//---------------------------------
  // User Actions
  //---------------------------------

  this.doChooseRestart = function (o) {
    trace("doRestart()");

    if (IsLocked) {
      return;
    }
    IsLocked = true;
    __snds.playSound("snd_popup", "ui");
    var Popup = new PopupConfirm({
      msg: "clear_confirm",
      callback_ok: me.doConfirmRestart,
      callback_cancel: me.doCancel,
    });
  };

  this.doChooseHome = function (o) {
    if (IsLocked) {
      return;
    }
    IsLocked = true;
    __snds.playSound("snd_popup", "ui");
    var Popup = new PopupConfirm({
      msg: "home_confirm",
      callback_ok: me.doConfirmHome,
      callback_cancel: me.doCancel,
    });
  };

  this.doConfirmRestart = function () {
    spLogEvent({event: "WORKSPACE_CLEAR"});
   	me.doClear();
   	IsLocked = false;
  };

  this.doConfirmHome = function () {
    spLogEvent({ event: "GAME_QUIT"});
    BlitFader.doFadeOut(200, () => {
      SceneManager.doDestroy();
      SceneManager = new TitleScene();
    });
  };

  this.doCancel = function () {
    IsLocked = false;
  };



	this.doClear = function(){
		 oUSER.builder = [];
		BlitSaver.doSaveData("user", oUSER);
		for(let i=me.clips.length-1; i>=0; i--){
 			let tile = me.clips[i];
			stage.removeChild(tile);
			tile.forget = true;
 			me.clips.splice(i, 1);
			
		}
		stage.needUpdate = true;
	}

	
	this.doDestroy = function(){
		stage.removeAllEventListeners();
		stage.removeAllChildren();
		stage.actives = [];
		stage.enableMouseOver(0);
		canvas.style.display = "none";
		stage.needUpdate = true;
	}


	this.doContrainClips =  function(){
		for(let i=0; i<me.clips.length; i++){
			let clip = me.clips[i];

			clip.x = Math.min(my_width, clip.myx);
			clip.y = Math.min(my_height, clip.myy);



		}
	}

	

	this.doResize = function(w, h){

	    if(oSTAGE.is_landscape){
			my_width = w;
			my_height = oSTAGE.game_height;
	    	me.top = 0;
	    	me.left = 0;
	    }else{
			my_width = oSTAGE.game_width; 
			my_height = h;
	    	me.top = 0;
	    	me.left = 0;
	    }


		canvas.style.width = ((my_width * oSTAGE.scale) | 0) + "px";
		canvas.style.height = ((my_height * oSTAGE.scale) | 0) + "px";
		canvas.width  = ((my_width * oSTAGE.scale) * oSTAGE.pixel_ratio) | 0;
		canvas.height = ((my_height * oSTAGE.scale) * oSTAGE.pixel_ratio) | 0;


	    frame.b_restart.x = my_width - 75;
	    frame.b_restart.y = my_height - 10;
	    frame.b_home.x = my_width - 10;
	    frame.b_home.y = my_height - 10;

	    frame.hdr.y = 0;
	    frame.hdr.x = my_width * 0.5;

		stage.scale = oSTAGE.scale * oSTAGE.pixel_ratio;

		me.doContrainClips();

		stage.needUpdate = true;

	}

	active_stages.push(stage);

	me.doInit();
	
}