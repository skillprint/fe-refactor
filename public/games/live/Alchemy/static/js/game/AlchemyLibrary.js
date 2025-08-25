var AlchemyLibrary = function(){

	var me = this;
	var level_name;
	var category;
	var scroll_panel;
	var scroll_bar;
	var canvas = document.getElementById("canvas_library");
  	var stage = BlitStage(canvas, {"webgl": false, "no_resize":true});
  	var frame = stage.addChild(new lib.scene_library());

  	var my_height, my_width, my_x, my_y;

  	me.top = 0;
  	me.left = 0;

  var scroll_speed = 0;
  var IsLocked = false;

  var current_scroll = 0;

	me.is_dragging = false;
	me.pending_pickup = null;

	me.isFloating = false;
	me.frames_down = 0;

	var current_scroll = 0;

	var b_reset;


	var tiles = [];

	var last_data = {w:0,h:0,icons:0};



	//---------------------------
	// init
	//---------------------------
	
	this.doInit = function(){

		trace("ScrollPanel.doInit()");

		me.is_dragging = false;
		me.pending_pickup = null;
		
		if(!platform.IsMobile){
			stage.enableMouseOver(20);
		}

		__utils.doText(frame.hdr.txt, oLANG.library);
		
		//create scroll panel
		scroll_panel = frame.scroll_panel;
		scroll_panel.x = 0;
		scroll_panel.y = 0;
		scroll_panel.wheel_speed = 0;
		scroll_panel.wheel_frames = 0;
		scroll_panel.drag_mode = 0;

		//create scrollbar
		scroll_bar = new createjs.Container();
		scroll_bar.x = my_width - 12;
		scroll_bar.y = 4;

		scroll_bar.my_height = my_height-8;
		stage.addChild(scroll_bar);
		
		//scrollbar background
		var bg = new createjs.Shape();
		bg.snapToPixel = true;
		scroll_bar.bg = scroll_bar.addChild(bg);

		//scrollbar handle
		var handle = new createjs.Shape();
		handle.snapToPixel = true;
		scroll_bar.handle = scroll_bar.addChild(handle);
		handle.addEventListener("mousedown", function(e){
			scroll_panel.drag_mode = 1;
			scroll_panel.wheel_frames = 0;
			scroll_panel.wheel_speed = 0;
			e.currentTarget.move_start = e.currentTarget.y;
			e.currentTarget.press_pos = BlitInputs.mouse_y;
		}); 

		//stage listeners
		canvas.addEventListener("mousewheel", me.doScrollWheel, false);
		canvas.addEventListener("DOMMouseScroll", me.doScrollWheel, false);
		canvas.style.display = "block";

		

	


		//create float loop
		var o = new Object();
		o.me = scroll_panel;
    o.need_destroy = false;
		o.persists = true;
    o.update_function = me.doUpdateScrollBar;
    stage.actives.push(o);
    
    me.doPopulateItems(oUSER.library);
    me.doUpdateFound();
			
	}
	

	this.doPopulateItems = function(items){
		trace("doPopulateItems()");
		scroll_panel.removeAllChildren();

		scroll_panel.b_reset = scroll_panel.addChild(new lib.b_reset());
		__utils.doText(scroll_panel.b_reset.txt, oLANG.txt_reset);
		scroll_panel.b_reset.helper = new __utils.ButtonHelper(stage, scroll_panel.b_reset,"norm","over");
	    scroll_panel.b_reset.addEventListener("click", me.doChooseReset);


		tiles = [];
		//add items
		for(var i=0; i<items.length; i++){
			let item = items[i];
			var new_tile = new lib.mc_tile();
			__utils.doText(new_tile.txt, oLANG[item.id]);
			new_tile.item = item;
			new_tile.button.clip = new_tile;
			new_tile.button.helper = new __utils.ButtonHelper(stage, new_tile.button, "norm", "over");
			new_tile.button.addEventListener("mousedown", function(e){
				var clip = e.currentTarget.clip;
				me.pending_pickup = clip;
			});

			new_tile.icon = new AlchemyIcon(item.id, new_tile.icon_dummy, new_tile.spinner_dummy, stage);

			var text = new createjs.TextArc("Text Arc", '20pt Arial', '#000', 100);
			text.textAlign = "center";
			text.x = 0;
			text.y = 0;

		//add to panel
		scroll_panel.addChild(new_tile);
		tiles.push(new_tile);
		}

		//me.doSortTiles();
		me.doResizeScrollBar();
	}


	this.doAddItem =  function(item){
		oUSER.library.push(item);
		
		var new_tile = new lib.mc_tile();
		new_tile.item = item;
		__utils.doText(new_tile.txt, oLANG[item.id]);
		
		new_tile.button.clip = new_tile;
		new_tile.button.helper = new __utils.ButtonHelper(stage, new_tile.button, "norm", "over");
		new_tile.button.addEventListener("mousedown", function(e){
			var clip = e.currentTarget.clip;
			me.pending_pickup = clip;
		});


		new_tile.icon = new AlchemyIcon(item.id, new_tile.icon_dummy, new_tile.spinner_dummy, stage);

		//add to panel
		scroll_panel.addChild(new_tile);
		tiles.push(new_tile);

		//me.doSortTiles();

		me.doResizeScrollBar();
	}

/*
	this.doSortTiles = function(){
				tiles.sort((a, b) => {
					let id1 = a.item.id;
					let id2 = b.item.id;

			    if (id1 < id2) {
			        return -1;
			    }
			    if (id1 > id2) {
			        return 1;
			    }
			    return 0;
			});

	}
*/

	this.doUpdateFound = function(){

		let str = oUSER.library.length + " / " + Object.keys(oCONFIG.items).length;

		if(!oUSER.seen_complete && oUSER.library.length >= Object.keys(oCONFIG.items).length){
			oUSER.seen_complete = true;
			BlitSaver.doSaveData("user", oUSER);
			setTimeout(()=>{
				me.doShowComplete();
			},1000);
		}

	 __utils.doText(frame.hdr.txt_found, str);
	 __utils.doText(frame.found.txt_found, str);
	}

	
	this.doResizeScrollBar = function(){

		if(last_data.w == my_width && last_data.h == my_height && last_data.icons == tiles.length){return;}

		last_data.w = my_width;
		last_data.h = my_height;
		last_data.icons = tiles.length;

		let scroll_bar_width = 14;
		let scroll_bar_radius = scroll_bar_width * 0.5;
		let scroll_bar_margin = 4;

		let top_margin = (oSTAGE.is_landscape) ? 50 : 30;
		var grid_width = 80;
		var grid_height = 100;
		var panel_width = my_width - scroll_bar_width - (scroll_bar_margin*2);
		var cols = Math.floor(panel_width / grid_width);

		var margins = (grid_width* 0.5) + (panel_width - (cols * grid_width)) * 0.5;
		var my_x = margins;
		var my_y = (grid_height * 0.5) + top_margin;


		var col = 0;
		var row = 0;
		for(var i=0; i<tiles.length; i++){
			let tile = tiles[i];
			tile.x = margins + (col * grid_width);
			tile.y = my_y;
			col++;
			if(col >= cols){
				col=0;
				if(i+1<tiles.length){
					my_y += grid_height;
				}
			}
		}

		//finish panel
		my_y += (grid_height * 0.5) + 20;

		scroll_panel.b_reset.x = my_width * 0.5;
		scroll_panel.b_reset.y = Math.max(my_height - 50, my_y);

		my_y += 60;

		scroll_panel.x = 0;
		//scroll_panel.y = 0;
		scroll_panel.my_height = my_y;
		scroll_panel.scroll_max = my_height - scroll_panel.my_height; 

		scroll_bar.x = my_width - (scroll_bar_width) - scroll_bar_margin;
		scroll_bar.y = top_margin + 4;
		scroll_bar.my_height = my_height - (top_margin + 8);

		scroll_bar.bg.graphics.clear();
		scroll_bar.bg.graphics.beginFill(createjs.Graphics.getRGB(0, 0, 0, .5));
		scroll_bar.bg.graphics.drawRoundRect(0, 0, scroll_bar_width, scroll_bar.my_height, scroll_bar_radius, scroll_bar_radius, scroll_bar_radius, scroll_bar_radius);

		var span_percent = Math.min(1, my_height / scroll_panel.my_height);
		scroll_bar.handle.graphics.clear();
		scroll_bar.handle.graphics.beginFill(createjs.Graphics.getRGB(255, 255, 255, 1));
		scroll_bar.handle.graphics.drawRoundRect(0, 0, scroll_bar_width, scroll_bar.my_height * span_percent, scroll_bar_radius, scroll_bar_radius, scroll_bar_radius, scroll_bar_radius);
		
		scroll_bar.handle.max_move = scroll_bar.my_height - (scroll_bar.my_height * span_percent);
		if(span_percent >= 1){
			scroll_bar.handle.visible=false;
			scroll_bar.bg.alpha = 0.25;
		}else{
			scroll_bar.handle.visible=true;
			scroll_bar.bg.alpha = 1;
		}




		var percent = scroll_panel.y/scroll_panel.scroll_max;
		scroll_bar.handle.y = percent * scroll_bar.handle.max_move;

		stage.needUpdate = true;
		
	}
	
	

	this.doUpdateScrollBar = function(o){

		if (IsLocked) {return;}
		if(me.isFloating){return;}
		if(SceneManager.FLOATER.isDragging){return;}
		var panel = o.me;
		var percent, drag_amt, new_pos;
		let pre_move = panel.y;

		if(!BlitInputs.mouse_is_down){
			me.frames_down = 0;
		}

		if(scroll_panel.drag_mode == 1){
			//user is dragging the handle
			let scroll_move = BlitInputs.mouse_y - BlitInputs.mouse_start_y;

			new_pos = Math.max(0, Math.min(scroll_bar.handle.max_move, (scroll_bar.handle.move_start + scroll_move)));
			percent = new_pos/scroll_bar.handle.max_move;
			scroll_bar.handle.y = new_pos;
			panel.y = (scroll_panel.scroll_max * percent);
			scroll_speed = panel.y - pre_move;
			
			if(!BlitInputs.mouse_is_down){
				scroll_panel.drag_mode = 0;
				me.is_dragging = false;
				me.pending_pickup = null;
			}	
			
		}else if(me.is_dragging){

			//dragging panel for scroll
			let scroll_move = BlitInputs.mouse_y - BlitInputs.mouse_start_y;

			panel.y = Math.min(0, Math.max(scroll_panel.scroll_max, (panel.move_start + scroll_move))) | 0;
			scroll_speed = panel.y - pre_move;

			percent = panel.y/scroll_panel.scroll_max;
			scroll_bar.handle.y = percent * scroll_bar.handle.max_move;
			
			if(!BlitInputs.mouse_is_down){
				scroll_panel.drag_mode = 0;
				me.is_dragging = false;
				me.pending_pickup = null;
			}	

		}else if(BlitInputs.mouse_is_down){

			me.frames_down++;

			if(!me.is_dragging && me.pending_pickup && me.frames_down > 3){
				let clip = me.pending_pickup;
				let clip_pos = new createjs.Point(clip.x + me.left, (clip.y + me.top) + panel.y);
				let mouse_offset = new createjs.Point(clip_pos.x - BlitInputs.mouse_x, clip_pos.y - BlitInputs.mouse_y);
 				
 				SceneManager.FLOATER.doPickupItem(clip.item, clip_pos, mouse_offset, "library");
				me.pending_pickup = null;
				me.is_dragging = false;
				me.frames_down = 0;
			}else if(Math.abs(BlitInputs.mouse_y - BlitInputs.mouse_start_y) > 6 && (BlitInputs.mouse_start_x > me.left && BlitInputs.mouse_start_x < (me.left + my_width))&& (BlitInputs.mouse_start_y > me.top && BlitInputs.mouse_start_y < (me.top + my_height))){
				scroll_speed = 0;
				panel.move_start = panel.y;
				me.pending_pickup = null;
				me.is_dragging = true;
			
			}

		}else if(scroll_panel.wheel_frames != 0){
			//scrollwheel active
			scroll_speed = scroll_panel.wheel_speed;

			panel.y = Math.min(0, Math.max(scroll_panel.scroll_max, panel.y + scroll_speed)) | 0;
			scroll_panel.wheel_frames--;
			percent = panel.y/scroll_panel.scroll_max;
			scroll_bar.handle.y = percent * scroll_bar.handle.max_move;
			


		}else if(scroll_speed != 0){
			//scroll slowing
			scroll_speed *= 0.8;

			panel.y = Math.min(0, Math.max(scroll_panel.scroll_max, panel.y + scroll_speed));
			percent = panel.y/scroll_panel.scroll_max;
			scroll_bar.handle.y = percent * scroll_bar.handle.max_move;
			if(Math.abs(scroll_panel.wheel_speed) < 1){
				scroll_panel.wheel_speed=0;
			}
		}

	}



	//---------------------------------
  // User Actions
  //---------------------------------

  this.doShowComplete = function (o) {
    trace("doShowComplete()");

    if (IsLocked) {return;}
    IsLocked = true;
    __snds.playSound("snd_complete", "ui");

    var Popup = new PopupComplete({
    	hdr: "complete_hdr",
      msg: "complete_msg",
      ok: "ok",
      callback_ok: me.doCancel,
    });
  };


  this.doChooseReset = function (o) {
    trace("doChooseReset()");

    if (IsLocked) {return;}
    IsLocked = true;
    __snds.playSound("snd_popup", "ui");

    var Popup = new PopupConfirm({
      msg: "reset_confirm",
      callback_ok: me.doConfirmReset,
      callback_cancel: me.doCancel,
    });
  };

  this.doConfirmReset = function () {
    me.doResetProgress();
   	IsLocked = false;
    
  };


  this.doCancel = function () {
    IsLocked = false;
  };
	
	

this.doResetProgress = function(){

  spLogEvent({event: "SESSION_RESET"});

	last_data.w = 0;
	last_data.h = 0;
	last_data.icons = 0;

	scroll_panel.y = 0;

	SceneManager.BUILDER.doClear();

		oUSER.library = [];
 		for(let item_id in oCONFIG.items){
	      let item = oCONFIG.items[item_id];
	      if(item.recipe==null){
	        oUSER.library.push({"id" : item_id, "icon" : item.icon, "recipe" : item.recipe});
	      }
	  }

    me.doPopulateItems(oUSER.library);

		me.doUpdateFound();

		BlitSaver.doSaveData("user", oUSER);

		

		stage.needUpdate = true;
	}


	//----------------------------------------
	// input
	//----------------------------------------
	
	this.doScrollWheel = function(e){
		var e = window.event || e; // old IE support
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		scroll_panel.wheel_speed = 36 * delta;
		scroll_panel.wheel_frames = 5;	
		if(e.preventDefault){
			e.preventDefault();
		}else{
			e.returnValue = false;
		}
	}

	//----------------------------------------
	// clean up
	//----------------------------------------
	
	this.doDestroy = function(){
		canvas.removeEventListener("mousewheel", me.doScrollWheel);
		canvas.removeEventListener("DOMMouseScroll", me.doScrollWheel);
		stage.removeAllEventListeners();
		stage.removeAllChildren();
		stage.actives = [];
		stage.enableMouseOver(0);
		canvas.style.display = "none";
	}


	

	this.doResize = function(w, h){

	    if(oSTAGE.is_landscape){
			my_width = w;
			my_height = oSTAGE.game_height;
	    	me.top = 0;
	    	me.left = oSTAGE.game_width - my_width;
			canvas.style.left = "";
			canvas.style.right = "0px";
			canvas.style.top = "0px";
			canvas.style.bottom = "0px";
	    }else{
			my_width = oSTAGE.game_width; 
			my_height = h;
	    	me.top = oSTAGE.game_height - my_height;
	    	me.left = 0;
			canvas.style.left = "0px";
			canvas.style.right ="0px";
			canvas.style.top = "";
			canvas.style.bottom = "0px";
	    }

		canvas.style.width = ((my_width * oSTAGE.scale) | 0) + "px";
		canvas.style.height = ((my_height * oSTAGE.scale) | 0) + "px";
		canvas.width  = ((my_width * oSTAGE.scale) * oSTAGE.pixel_ratio) | 0;
		canvas.height = ((my_height * oSTAGE.scale) * oSTAGE.pixel_ratio) | 0;
		stage.scale = oSTAGE.scale * oSTAGE.pixel_ratio;

		frame.fader.x = 0;
		frame.fader.y = 0;
		frame.fader.scaleX = my_width/100;

    	frame.hdr.y = 0;
	    frame.hdr.x = my_width * 0.5;
	    frame.hdr.txt_found.visible = (oSTAGE.is_landscape);


	    frame.found.visible = (!oSTAGE.is_landscape);
	    frame.found.y = 2;
	    frame.found.x = my_width-5;



		me.doResizeScrollBar();

		stage.needUpdate = true;

	}

	active_stages.push(stage);

	me.doInit();
	
}