function StacksGameGUI(){

	var me = this;

	var mat = null;
	var z_depth = 0;

	var score_digits = [];
	var holder_score = new THREE.Group();
	var holder_buttons = new THREE.Group();

	var scalar = 4.0;
	var width_pixel_ratio;

	var move_digits = [];


	if(!oASSETS.hasOwnProperty('spritesheet_texture')){
		var panel_src = new lib.ui_spritesheet();
		var nom_bounds = panel_src.nominalBounds;

		__utils.doText(panel_src.txt_moves, oLANG.label_moves, {verticalAlign:"middle"});

		for(let i=0; i<=9; i++){
			__utils.doText(panel_src["digit_" + i], i.toString(), {verticalAlign:"middle"});
		}
		
		panel_src.cache(0,0, 512, 128, scalar);
		var canvas = panel_src.cacheCanvas;
		canvas.style.background = "ffffff";
		
		var spritesheet_texture = new THREE.CanvasTexture(canvas);
		spritesheet_texture.minFilter = THREE.LinearMipmapLinearFilter;
		spritesheet_texture.magFilter = THREE.LinearFilter;
	  	spritesheet_texture.needsUpdate = true; 
	  	oASSETS["spritesheet_texture"] = spritesheet_texture;	
	 }


	this.doGenerateSprite = function(data){

		var map;
		if (typeof data.src.texture === 'string') {
			map = oASSETS[data.src.texture];
		}else{
			map = data.src.texture;
		}
	
		map.repeat = new THREE.Vector2(data.src.w / map.image.width, data.src.h / map.image.height);
		map.offset = new THREE.Vector2(data.src.x / map.image.width, data.src.y / map.image.height);	

		if(platform.isMobile){
			map.minFilter = THREE.NearestMipMapNearestFilter;
		}

		map.needsUpdate = true;

		var mat = new THREE.SpriteMaterial({map: map, fog:false, transparent:true});
		
		var sprite = new THREE.Sprite(mat);
		sprite.my_repeat = new THREE.Vector2(data.src.w / map.image.width, data.src.h / map.image.height);
		sprite.my_offset = new THREE.Vector2(data.src.x / map.image.width, data.src.y / map.image.height);
		sprite.center = new THREE.Vector2(data.center.x, data.center.y);
		sprite.position.set(data.pos.x, data.pos.y, z_depth);
		sprite.onBeforeRender = function(){
			this.material.map.repeat = this.my_repeat;
			this.material.map.offset = this.my_offset;
		}
		
		var scale = data.size.w;
		sprite.scale.set(data.size.w, data.size.h, 1);
		sprite.renderDepth = 1;
		z_depth += .000001;
		return sprite;	
	}


	this.doResize = function(){

		//calculate for hud coordinate system
		var renderer_size = new THREE.Vector2();
		GameWorld.renderer.getSize(renderer_size);

		var renderer_ratio = renderer_size.width / renderer_size.height;
 		var vFOV = GameWorld.camera.fov * Math.PI / 180;
		var visible_height = 2 * Math.tan( vFOV / 2 ) * 1;
		var visible_width = visible_height * renderer_ratio;
		
		width_pixel_ratio = visible_width / renderer_size.width;
		var height_pixel_ratio = visible_height / renderer_size.height;

 		holder_score.scale.set(width_pixel_ratio * oSTAGE.scale, width_pixel_ratio * oSTAGE.scale, 1);
 		holder_score.position.set(0, (visible_height * 0.5), -1);

 	 	holder_buttons.scale.set(width_pixel_ratio * oSTAGE.scale, width_pixel_ratio * oSTAGE.scale, 1);
 		holder_buttons.position.set((visible_width * 0.5), -(visible_height * 0.5), -1);
 		

	}


	this.doClear =  function(){
		holder_score.clear();
		holder_buttons.clear();
	}


	this.doInitScore =  function(){
		GameWorld.camera.add(holder_score);
		//score panel
		var panel_sprite = me.doGenerateSprite({
			pos:{x:0, y:0},
			size:{w:260, h:36},
			src:{texture:"spritesheet_texture", x:0, y:0, w:260*scalar, h:36*scalar},
			center: {x:0.5, y:1}
		}, false);

		//moves
		let myx = 30;
		let myy = -18;
		let myspace = 21;
		moves_1 = me.doGenerateSprite({pos:{x:myx, y:myy},size:{w:25, h:40},src:{texture:"spritesheet_texture", x:0, y:38*scalar, w:25*scalar, h:40*scalar}, center: {x : 0.5, y: 0.5}});
		moves_2 = me.doGenerateSprite({pos:{x:myx + myspace, y:myy},size:{w:25, h:40},src:{texture:"spritesheet_texture", x:0, y:38*scalar, w:25*scalar, h:40*scalar}, center: {x : 0.5, y: 0.5}});
		moves_3 = me.doGenerateSprite({pos:{x:myx + myspace + myspace, y:myy},size:{w:25, h:40},src:{texture:"spritesheet_texture", x:0, y:38*scalar, w:25*scalar, h:40*scalar}, center: {x : 0.5, y: 0.5}});	
		holder_score.add(panel_sprite, moves_1, moves_2, moves_3);
		move_digits = [moves_1, moves_2, moves_3];


		GameWorld.camera.add(holder_buttons);
		let b_quit =  me.doGenerateSprite({pos:{x:-40, y:35},size:{w:60, h:52},src:{texture:"spritesheet_texture", x:330*scalar, y:0*scalar, w:60*scalar, h:52*scalar}, center: {x : 0.5, y: 0.5}});
		let b_restart =  me.doGenerateSprite({pos:{x:-105, y:35},size:{w:60, h:52},src:{texture:"spritesheet_texture", x:265*scalar, y:0*scalar, w:60*scalar, h:52*scalar}, center: {x : 0.5, y: 0.5}});	

		holder_buttons.add(b_quit, b_restart);
		

	}

	

	this.doUpdateMoves = function(n){
		moves_1.visible=false;
		moves_2.visible=false;
		moves_3.visible=false;
		let arr = n.toString().split("");
		for(let i=0; i<arr.length; i++){
			digit = parseInt(arr[i]);
			move_digits[i].visible=true;
			move_digits[i].my_offset.x = digit * 0.048828;
		}
	}
}



