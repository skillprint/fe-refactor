var LevelsScene = function(){

	trace("LevelsScene()");

	var me = this;
	var canvas = document.getElementById("canvas_screens");
	var stage = BlitStage(canvas, {webgl:false});
	var frame = stage.addChild(new lib.scene_levels);

	var my_height, my_width, my_x, my_y;

	var IsLocked = true;
	var IsReady = false;
	var prompt_attempt = 0;

	var buildComplete = false;

	var timeout;
	var num_puzzles;
	var buttons = [];

	var tiles = [];
	var categories = [];
	var scroll_panel;
	var scroll_bar;
	var scroll_header;
	var scroll_speed = 0;
  	var current_scroll = 0;

  	var last_data = {w:0,h:0,icons:0};



	me.frames_down = 0;


	//---------------------------
	// init
	//---------------------------

	this.doInit = function(){
		IsLocked = true;

     	document.body.style.backgroundImage = '';

		me.forget=false;
		update_queue.push(me);
		me.doResizeUpdate();
		RESIZER.needUpdate = true;

		
		//create scroll panel
		scroll_panel = frame.scroll_panel.addChild(new createjs.Container());
		scroll_panel.x = 0;
		scroll_panel.y = 0;
		scroll_panel.wheel_speed = 0;
		scroll_panel.wheel_frames = 0;
		scroll_panel.drag_mode = 0;

		//create scrollbar
		scroll_bar = new createjs.Container();
		scroll_bar.x = oSTAGE.game_right - 12;
		scroll_bar.y = 4;

		scroll_bar.my_height = oSTAGE.game_height - 8;
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

		me.doPopulatePages();

		IsLocked = false;
	}



	this.doPopulatePages = function(){
		trace("doPopulatePages()");

		scroll_panel.removeAllChildren();

		scroll_header = scroll_panel.addChild(new lib.scene_header());
		__utils.doText(scroll_header.txt, oLANG.page_header, {verticalAlign:"middle"});
		
		
		tiles = [];
		categories = [];

		for(let i=0; i<oCONFIG.categories.length; i++){
			let category = oCONFIG.categories[i];
			//category button
			let category_button = new lib.chooser_category();
			scroll_panel.addChild(category_button);
			__utils.doText(category_button.txt, oLANG["category_" + category.id]);
			category_button.category = category.id;
			category_button.IsOpened = true;
			categories.push(category_button);
			
			//pages
			for(let ii=0; ii<category.pages.length; ii++){
				let page = category.pages[ii];

				let tile = new createjs.Container();
				tile.info = page;
				tile.src = page.src;
				tile.helper = new __utils.ButtonHelper(stage, tile, "norm", "over");
				tile.addEventListener("click", function(e){
					let info = e.currentTarget.info;
					me.doSelectPage(info);
				});

				tile.image = tile.addChild(new createjs.Shape());
				tile.image.graphics.clear();
    			tile.image.graphics.beginFill("#222222").drawRoundRect(0, 0, 100, 100, 20);

				tile.category = category.id;
				scroll_panel.addChild(tile);
				tiles.push(tile);
			}
		}


		IsReady = true;

		//me.doSortTiles();
		me.doResizeScrollBar();
    	BlitFader.doFadeIn(500);
	}


	this.doResizeScrollBar = function(){

		if(!IsReady){return;}
		my_width = oSTAGE.game_width;
		my_height = oSTAGE.game_height;

		if(last_data.w == my_width && last_data.h == my_height){return;}

		last_data.w = my_width;
		last_data.h = my_height;
		last_data.icons = tiles.length;

		let scroll_bar_width = 14;
		let scroll_bar_radius = scroll_bar_width * 0.5;
		let scroll_bar_margin = 4;
		var panel_width = Math.min(640, (my_width - scroll_bar_width - 4 - 20));
		let top_margin = 60;

		let panel_cols = 6;
		var grid_width = panel_width / panel_cols;
		while(grid_width < 150){
			panel_cols--;
			grid_width = panel_width / panel_cols;
		}
		var grid_height = grid_width;
		var cols = Math.floor(panel_width / grid_width);

		scroll_panel.x = 0 + (((oSTAGE.game_width - 18) - (grid_width * cols)) * 0.5);
		scroll_panel.y = 0;

		scroll_header.x = 0;
		scroll_header.y = 0;

		var margins = 0;
		var my_x = margins;
		var my_y = top_margin + scroll_bar_margin;

		scroll_header.x = panel_width * 0.5;
		scroll_header.y = 0;

		//add category buttons
		for(let i=0; i<categories.length; i++){
			let category = categories[i];
			category.x = 0;
			category.y = my_y;
			my_y += 40;

			//make subset of tiles
			let subset = [];
			if(!category.IsOpened){continue;}

			for(let ii=0; ii<tiles.length; ii++){
				let tile = tiles[ii];
				if(tile.category == category.category){
					subset.push(tile);
				}
			}
			
			//position tiles
			var col = 0;
			var row = 0;
			for(let ii=0; ii<subset.length; ii++){
				let tile = subset[ii];
				tile.x = margins + (col * grid_width);
				tile.y = my_y;

      			let file_name = "media/puzzles_thumbs/" + tile.src.split('/').pop();
				let img;

				if(oUSER.thumbs.hasOwnProperty(tile.src)){
					img = document.createElement('img');
      				img.src = oUSER.thumbs[tile.src];
      				img.onload = function(e){

      					let m = new createjs.Matrix2D();
		      			let s = (grid_width-12) / e.currentTarget.naturalWidth;
		      			m.scale(s,s);
						tile.image.graphics.clear();
		    			tile.image.graphics.setStrokeStyle(4).beginStroke("white").beginBitmapFill(e.currentTarget, "no-repeat", m).drawRoundRect(0, 0, grid_width-12, grid_height-12, 10);
	      			}
      			}else{
					img = images[file_name];
					let m = new createjs.Matrix2D();
	      			let s = (grid_width-12) / img.naturalWidth;
	      			m.scale(s,s);
					tile.image.graphics.clear();
	    			tile.image.graphics.setStrokeStyle(4).beginStroke("white").beginBitmapFill(img, "no-repeat", m).drawRoundRect(0, 0, grid_width-12, grid_height-12, 10);
	      		}
	 
      			


				col++;
				if(col >= cols){
					col=0;
					if(ii+1 < subset.length){
						my_y += grid_height;
					}
				}
				
			}
			my_y += grid_height + 10;

		}




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

		var percent = (scroll_panel.y)/scroll_panel.scroll_max;
		scroll_bar.handle.y = percent * scroll_bar.handle.max_move;

		stage.needUpdate = true;
		
	}


	this.doUpdateScrollBar = function(o){
		if (IsLocked) {return;}


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
				scroll_panel.mouseEnabled = true;
				scroll_panel.mouseChildren = true;
			}	

		}else if(BlitInputs.mouse_is_down){

			me.frames_down++;
			if(Math.abs(BlitInputs.mouse_y - BlitInputs.mouse_start_y) > 6){
				scroll_speed = 0;
				panel.move_start = panel.y;
				me.pending_pickup = null;
				me.is_dragging = true;
				scroll_panel.mouseEnabled = false;
				scroll_panel.mouseChildren = false;
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
			scroll_speed *= 0.9;
			panel.y = Math.min(0, Math.max(scroll_panel.scroll_max, panel.y + scroll_speed));
			percent = panel.y/scroll_panel.scroll_max;
			scroll_bar.handle.y = percent * scroll_bar.handle.max_move;
			if(Math.abs(scroll_panel.wheel_speed) < 1){
				scroll_panel.wheel_speed=0;
			}
		}

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






















	this.doSelectPage = function(page){

		if(IsLocked){return;}
		IsLocked = true;
		__snds.playSound("snd_click", "ui");


		GameManager.doNewPage(page);

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
		canvas.removeEventListener("mousewheel", me.doScrollWheel);
		canvas.removeEventListener("DOMMouseScroll", me.doScrollWheel);
		stage.removeAllEventListeners();
		stage.removeAllChildren();
		stage.actives = [];
		stage.removeAllChildren();
		stage.enableMouseOver(0);
		me.forget = true;
		stage.needUpdate = true;
	}
 


	//------------------------
	// resize
	//------------------------

	this.doResizeUpdate = function(){




		//recache
		if(me.scale != oSTAGE.scale){
			
		}

		frame.scroll_panel.x = oSTAGE.game_left;
		frame.scroll_panel.y = oSTAGE.game_top;


		me.doResizeScrollBar();

		frame.x = oSTAGE.game_width_margins;
		frame.y = oSTAGE.game_height_margins;
		me.scale = oSTAGE.scale;
	}
	

	me.doInit();

}


