var TutorialScene = function(){

	trace("TutorialScene()");

	var me = this;
	var canvas = document.getElementById("canvas_screens");
	var stage = BlitStage(canvas, {webgl:false});
	var frame = stage.addChild(new lib.scene_instructions);
	var IsLocked = true;

	var instructions_id = 0;

	var img, dots;
	var txt_measure, div_instructions, instructions_image, instructions_dots, instructions_txt;

	var shown_prev = false;
	var instructions_list;
	var instruction_images = [];
	
	var buildComplete = false;

	var txt_height = 0;

	var instructions_ready = false;

	var image_spacing = 0;

	//---------------------------
	// init
	//---------------------------

	var instructions_mobile, instructions_desktop;

	this.doProcessData =  function(){
	  instructions_mobile = [];
	  instructions_desktop = [];
	  for(var s in oLANG){
	    var o = oLANG[s];
	      switch(o.type){
	        case "instruction_mobile":
	          instructions_mobile.push({msg: o.id, img:o.img});
	          break;

	        case "instruction_desktop":
	          instructions_desktop.push({msg: o.id, img:o.img});
	          break;
	      } 
		}
	}

	this.doInit = function(){
		IsLocked = false;
		me.forget=false;


		me.doProcessData();
		instructions_list = (platform.isTouchDevice) ? instructions_mobile : instructions_desktop;

		oUSER.seen_help = true;
		seen_help = true;

	    //header
		__utils.doText(frame.header.txt, oLANG.tutorial_header, {verticalAlign:"middle"});

		//previous
		frame.b_prev_image.visible = false;
		frame.b_prev_image.helper = new __utils.ButtonHelper(stage, frame.b_prev_image, "norm", "over");
		frame.b_prev_image.addEventListener("click", function(e){
		__snds.playSound("snd_click_2", "ui");
			instructions_id--;
			if(instructions_id < 0){
				instructions_id = instructions_list.length-1;
			}
			me.doShowInstruction();
		});

		//next
		frame.b_next_image.helper = new __utils.ButtonHelper(stage, frame.b_next_image, "norm", "over");
		frame.b_next_image.addEventListener("click", function(e){
		__snds.playSound("snd_click_2", "ui");
			instructions_id++;
			if(instructions_id>=instructions_list.length){
				instructions_id = 0;
			}
			me.doShowInstruction();
		});

		//play button
		var b_play = frame.b_play;
		b_play.helper = new __utils.ButtonHelper(stage, b_play, "norm", "over");
		__utils.doText(b_play.txt, oLANG.play);
		b_play.addEventListener("click", function(e){
			__snds.playSound("btn_press", "interface");
			me.doChoosePlay();
		});

		frame.b_play.visible =false;

		//texts
		txt_height = 0;
		for(i=0; i<instructions_list.length; i++){
			__utils.doText(frame.txt_instructions.txt, oLANG[instructions_list[i].msg], {verticalAlign:"true_middle"});
			txt_height = Math.max(txt_height, frame.txt_instructions.txt.getMeasuredHeight());
		}

		//dots
		dots = [];
		var my_space = 15;
		var myx = -(((instructions_list.length-1) * my_space) * 0.5);
		for(var i=0; i<instructions_list.length; i++){
			var dot = new lib.tutorial_dot;
			frame.dots_holder.addChild(dot);
			dot.x = myx + (my_space * i);
			dots.push(dot);
		}
		frame.dots_holder.x = oSTAGE.game_center_x;

		//images
		instruction_images = [];
		for(var i=0; i<instructions_list.length; i++){

			let image_group = new createjs.Container();
			frame.image_holder.addChild(image_group);

			image_group.src = images[instructions_list[i].msg];
			image_group.bitmap_shape = image_group.addChild(new createjs.Shape());

			let size = me.doRedrawImage(image_group);
			//image_spacing = (size.w+20);
			image_spacing = Math.max((size.w+20),  (oSTAGE.game_right - oSTAGE.game_center_x) + (size.w * 0.5) - 60);
			image_group.x = image_spacing * i;

			//image_group.scale = (i==0) ? 1 : 0.75;
			instruction_images.push(image_group);
		}

		frame.image_holder.addEventListener("mousedown", function(e){
			swiper.forget = false;
			actives.push(swiper);
		});

		//set game background
		GameWorld.doSetBackground({"type":"pattern", "asset" : oASSETS.background});

		update_queue.push(me);
		me.doResizeUpdate();
		RESIZER.needUpdate = true;

		instructions_ready=false;

		me.doShowInstruction();
		me.doInitComplete();
	}



	this.doRedrawImage =  function(image_group){

		let img = image_group.src;
		let shape = image_group.bitmap_shape;
		let border_shape = image_group.border_shape;
		//let highlight_shape = image_group.highlight_shape;

		let src_width = img.naturalWidth;
		let src_height = img.naturalHeight;
		let src_ratio = src_width / src_height;

		let margin_top = 50;
		let margin_sides = 50;

		let space_width = oSTAGE.game_width - (margin_sides*2);
		let space_height = oSTAGE.game_height - margin_top - 100 - txt_height - 20;
		let space_ratio = space_width / space_height;

		let img_width, img_height, img_scale;
		if(src_ratio >= space_ratio){
			img_width = space_width;
			img_height = img_width * (1 / src_ratio);
		}else{
			img_height = space_height;
			img_width = img_height * (src_ratio);
		}

		img_scale = img_width / src_width;
	 	var matrix = new createjs.Matrix2D()
        matrix.scale(img_scale, img_scale);

		shape.graphics.clear();
		shape.graphics.beginBitmapFill(img, "no-repeat", matrix);
		shape.graphics.setStrokeStyle(3);
		shape.graphics.beginStroke("#ffffff");
		shape.graphics.drawRoundRect(0, 0, img_width, img_height, 16);
		shape.regX = img_width * 0.5;
		shape.regY = img_height * 0.5;

		return {"w":img_width, "h":img_height};
	}


	this.doInitComplete =  function(){
		buildComplete = true;

		let delay = 500;
		frame.b_play.y = oSTAGE.game_bottom + 210;
		createjs.Tween.get(frame.b_play, {override:true}).wait(delay).set({visible:true}).to({y: frame.b_play.myy}, 500, createjs.Ease.cubicOut);
		stage.activeTweens.push(frame.b_play);

		BlitFader.doFadeIn(500);
	}


	this.doShowInstruction = function(){
		instructions_ready = false;

		__utils.doText(frame.txt_instructions.txt, oLANG[instructions_list[instructions_id].msg], {verticalAlign:"true_middle"});

		let new_offset = -(instructions_id * image_spacing);
		
		for(var i=0; i<instruction_images.length; i++){
			var image_group = instruction_images[i];
			let size = me.doRedrawImage(image_group);
			
			image_spacing = Math.max((size.w+20),  (oSTAGE.game_right - oSTAGE.game_center_x) + (size.w * 0.5) - 60);
			
			//image_spacing = (size.w+20);
			
			let scroll_offset = -(instructions_id * image_spacing) + (image_spacing * i);
			let new_scale = 1;//(i==instructions_id) ? 1 : 0.75;

			createjs.Tween.get(image_group, {override:true}).to({x:scroll_offset, scale:new_scale}, 300, createjs.Ease.cubicOut);
			stage.activeTweens.push(image_group);

		}

		//dots
		for(let i=0; i<dots.length;i++){
			let frame = (instructions_id == i) ? 1: 0;
			dots[i].gotoAndStop(frame);
		}

		//arrows
		if(instructions_id == 0){
			frame.b_prev_image.visible=false;
			frame.b_next_image.visible=true;
		}else if(instructions_id == instructions_list.length-1){
			frame.b_prev_image.visible=true;
			frame.b_next_image.visible=false;
		}else{
			frame.b_prev_image.visible=true;
			frame.b_next_image.visible=true;
		}

	}



	var swiper = {};
	swiper.forget = false;
	swiper.mouse_start = 0;
	swiper.speed = 0;

	swiper.doUpdate =  function(){
		
			let speed = BlitInputs.mouse_x - BlitInputs.mouse_start_x;
			for(var i=0; i<instruction_images.length; i++){
				var image_group = instruction_images[i];
				let size = me.doRedrawImage(image_group);
				//image_spacing = (size.w+20);
				image_spacing = Math.max((size.w+20),  (oSTAGE.game_right - oSTAGE.game_center_x) + (size.w * 0.5) - 60);
				let scroll_offset = -(instructions_id * image_spacing) + (image_spacing * i) + speed;
				image_group.x = scroll_offset;
			}

			stage.needUpdate = true;
			if(!BlitInputs.mouse_is_down){
				this.forget = true;
				if(speed > 50){
					instructions_id = Math.max(instructions_id - 1, 0);
				}else if(speed < -50){
					instructions_id = Math.min(instructions_id + 1, instructions_list.length-1);
				}else{
				}

				me.doShowInstruction();

			}


	}


	//---------------------------------
	// User Actions
	//---------------------------------

	this.doChoosePlay = function(o){
		if(IsLocked){return;}
		IsLocked = true;
		__snds.playSound("snd_click", "ui");

		let action =  function(){
			me.doDestroy();
			doFinishLoading(()=>{
				SceneManager.doDestroy();
				StacksGame.doInit();
			});
		}
		BlitFader.doFadeOut(200, action);

	}
	

	this.doDestroy = function(){
		stage.removeAllChildren();
		stage.enableMouseOver(0);
		GameWorld.doClearObjects();
		me.forget = true;
		swiper.forget = true;
		stage.needUpdate = true;
	}



	//------------------------
	// resize
	//------------------------

	this.doResizeUpdate = function(){

		frame.header.x = oSTAGE.game_size.center_x;
		frame.header.y = oSTAGE.game_top;

		frame.b_play.myy = frame.b_play.y = oSTAGE.game_bottom - 20;
		frame.b_play.x = oSTAGE.game_size.center_x;

		//images
		let max_height = 0;
		for(var i=0; i<instruction_images.length; i++){
			let image_group = instruction_images[i];
			let size = me.doRedrawImage(image_group);
			max_height = Math.max(max_height, size.h);
			image_spacing = Math.max((size.w+20),  (oSTAGE.game_right - oSTAGE.game_center_x) + (size.w * 0.5) - 60);
			//image_spacing = (size.w+20);
			let scroll_offset = -(instructions_id * image_spacing) + (image_spacing * i);
			createjs.Tween.get(image_group, {override:true}).set({x:scroll_offset});
			stage.activeTweens.push(image_group);
		}

		frame.image_holder.x = oSTAGE.game_center_x;
		frame.dots_holder.y = frame.image_holder.y + (max_height* 0.5) + 12;

		let min_y = frame.image_holder.y + (max_height* 0.5) + 24;
		let max_y = oSTAGE.game_bottom - 90;
		let mid_y = max_y - ((max_y - min_y) * 0.5);


		frame.txt_instructions.txt.lineWidth = (oSTAGE.game_right - oSTAGE.game_left) - 100;
		//__utils.doText(frame.txt_instructions.txt, oLANG[instructions_list[instructions_id].msg], {verticalAlign:"true_middle"});

		frame.txt_instructions.x = oSTAGE.game_size.center_x;
		frame.txt_instructions.y = mid_y;
		
		frame.b_next_image.x = oSTAGE.game_right - 4;
		frame.b_next_image.y = Math.max(mid_y, min_y+25);

		frame.b_prev_image.x = oSTAGE.game_left + 4;
		frame.b_prev_image.y = Math.max(mid_y, min_y+25);




		let margin_top = 50;
		let space_height = oSTAGE.game_height - margin_top - 100 - txt_height - 20;
		frame.image_holder.y = oSTAGE.game_top + margin_top + (space_height * 0.5);

		//recache
		if(me.scale != oSTAGE.scale){
			
		}

		frame.x = oSTAGE.game_width_margins;
		frame.y = oSTAGE.game_height_margins;
		me.scale = oSTAGE.scale;


		
	}
	

	me.doInit();

}


