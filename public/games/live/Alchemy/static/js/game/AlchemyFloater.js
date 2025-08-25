var AlchemyFloater = function(){

	var me = this;
	var canvas = document.getElementById("canvas_floater");
  	var stage = BlitStage(canvas, {"webgl": false, "no_resize":false});
  	var frame = stage.addChild(new createjs.Container());

	canvas.style.display = "none";

	me.isDragging = false;


	//---------------------------
	// init
	//---------------------------
	
	this.doInit = function(){
		trace("ScrollPanel.doInit()");
		me.isDragging = false;	
	}
	

	this.doPickupItem = function(item, clip_pos, mouse_offset, from){
		var new_tile = frame.addChild(new lib.mc_tile());
		__utils.doText(new_tile.txt, oLANG[item.id]);
		new_tile.item = item;
		new_tile.from = from;
		new_tile.x = clip_pos.x;
		new_tile.y = clip_pos.y;
		new_tile.original_x = new_tile.x;
		new_tile.original_y = new_tile.y;

		new_tile.button.gotoAndStop(1);

		stage.addChild(new_tile);

		new_tile.icon = new AlchemyIcon(item.id, new_tile.icon_dummy, new_tile.spinner_dummy, stage);

		new_tile.drag_offset_x = mouse_offset.x;
		new_tile.drag_offset_y = mouse_offset.y;
		new_tile.forget = false;
		new_tile.doUpdate = me.doDragItem;
        actives.push(new_tile);

        
		me.isDragging = true;
		canvas.style.display = "block";

		stage.update();
	}


	this.doDragItem =  function(){

		this.drag_offset_x *= 0.8;
		this.drag_offset_y *= 0.8;

		this.x = BlitInputs.mouse_x + this.drag_offset_x;
		this.y = BlitInputs.mouse_y + this.drag_offset_y;
		var ok = !(this.x >= SceneManager.LIBRARY.left && this.y >= SceneManager.LIBRARY.top);
		this.alpha = (ok) ? 1 : 0.6;

		stage.needUpdate = true;

		if(!BlitInputs.mouse_is_down){
			this.forget = true;
			if(ok){
				me.doDropItem(this);
			}else{
				me.doForgetItem(this);
			}
		}
	}





	this.doDropItem =  function(tile, is_return = false){
		var item = tile.item;
		me.isDragging=false;

		trace("doDropItem() is_return=" + is_return);

		var ok = SceneManager.BUILDER.doDropItem(item, tile.x, tile.y, is_return);

		if(tile.from == "builder" && !ok){
			me.doReturnBuilderItem(tile);
		}else if(tile.from == "library" && !ok){
			me.doReturnLibraryItem(tile);
		}else{
			me.doDestroy();
		}
		stage.needUpdate = true;
	}

	this.doReturnBuilderItem =  function(tile){
		__snds.playSound("snd_return", "icons");

		me.isDragging=false;
		let dist = __utils.doGetDistance(tile.x, tile.y, tile.original_x, tile.original_y);
		let speed = Math.max(200, dist * 1);
		createjs.Tween.get(tile, {override: true}).to({x: tile.original_x, y:tile.original_y}, speed, createjs.Ease.cubicOut).call(()=>{
			me.doDropItem(tile, true);
		});
	    stage.activeTweens.push(tile);
	}

	this.doReturnLibraryItem =  function(tile){
		__snds.playSound("snd_return", "icons");
		me.isDragging=false;
		tile.button.mouseEnabled = false;
		tile.button.removeAllEventListeners();
		tile.button.gotoAndStop(0);

		let dist = __utils.doGetDistance(tile.x, tile.y, tile.original_x, tile.original_y);
		let speed = Math.max(200, dist * 1);

		createjs.Tween.get(tile, {override: true}).to({x: tile.original_x, y:tile.original_y}, speed, createjs.Ease.cubicOut).call(()=>{
			me.doDestroy();
		});
	    stage.activeTweens.push(tile);
	}

	this.doForgetItem = function(tile){
		__snds.playSound("snd_return", "icons");
		var item = tile.item;
		me.isDragging=false;
		createjs.Tween.get(tile, {override: true}).to({scale: .2, alpha:0}, 200, createjs.Ease.cubicOut).call(me.doDestroy);
	    stage.activeTweens.push(tile);
	    
	}



	//----------------------------------------
	// clean up
	//----------------------------------------
	
	this.doDestroy = function(){
		stage.removeAllEventListeners();
		stage.removeAllChildren();
		stage.actives = [];
		stage.enableMouseOver(0);
		canvas.style.display = "none";
		stage.needUpdate = true;
	}

	me.doInit();
	
}