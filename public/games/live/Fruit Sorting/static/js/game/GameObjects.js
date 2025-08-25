var GameBox =  function(my_id, side){
	
		var me = this;

		me.my_id = my_id;
    me.is_correct = false;

	 	let start_offset = (GameWorld.visible_width * 0.5) + 8;
		let start_x = (side == "left") ? -start_offset : start_offset;
		let my_y = Math.max(-(GameWorld.visible_height* 0.5) + 2, -15);

    var box = oASSETS.box.clone();
    box.position.set(start_x, my_y, 0);
    box.rotation.z = 0;
    GameWorld.scene.add(box);
    me.box = box;

   	var label = box.getObjectByName("label");
    label.material = new THREE.MeshBasicMaterial({map:label.material.map.clone(), side:THREE.SingleSide, transparent:true}); 
    label.material.map.offset.y = 0;

    var lid_1 = box.getObjectByName("lid_1");
    var lid_2 = box.getObjectByName("lid_2");
   	lid_1.rot= lid_1.rotation.x;
    lid_2.rot = lid_2.rotation.x;

    var body = box.getObjectByName("body");

    GameManager.boxes.push(lid_1, lid_2, body);

    box.me = me;

    this.doShow =  function(o, mode, is_correct){

    	me.is_correct = is_correct;

			let start_offset = (GameWorld.visible_width * 0.5) + 8;
			let start_x = (side == "left") ? -start_offset : start_offset;
			let my_y = Math.max(-(GameWorld.visible_height* 0.5) + 2, -15);
			let sign = Math.sign(start_x);
			let my_x = 7.5 * sign;
			let my_rot = __utils.radFromDeg(sign * 10);

			label.material.map.offset.x = (mode == "shape") ? 0 : 0.368;
			label.material.map.offset.y = (mode == "shape") ? (o.shape * 0.25) : (o.color * 0.25);

			//let my_rot = __utils.radFromDeg(180);

			box.position.x = my_x;//start_x;
			box.position.y = my_y;
	    box.rotation.z = __utils.radFromDeg(180);//__utils.radFromDeg(sign * -90);
			//createjs.Tween.get(box.position, {override:true}).to({x:my_x}, 500, createjs.Ease.cubicOut);
			createjs.Tween.get(box.rotation, {override:true}).to({z:my_rot}, 300, createjs.Ease.cubicOut);
			
			lid_1.rotation.x = 0;
			lid_2.rotation.x = 0;
			createjs.Tween.get(lid_1.rotation, {override:true}).to({x:lid_1.rot}, 250, createjs.Ease.getElasticOut(1, .8));
			createjs.Tween.get(lid_2.rotation, {override:true}).to({x:lid_2.rot}, 250, createjs.Ease.getElasticOut(1, .8));
    }

    this.doClose = function(){
			createjs.Tween.get(lid_1.rotation, {override:true}).to({x:0}, 150);
			createjs.Tween.get(lid_2.rotation, {override:true}).to({x:0}, 150);
    }

    this.doHide = function(){
    	me.is_correct = false;
			let start_offset = (GameWorld.visible_width * 0.5) + 8;
			let end_x = (side == "left") ? -start_offset : start_offset;
			let sign = Math.sign(end_x);
			//let my_rot = __utils.radFromDeg(sign * 60);


			let my_rot = __utils.radFromDeg(180);
			createjs.Tween.get(box.rotation, {override:true}).to({z:my_rot}, 300, createjs.Ease.cubicIn);

			//createjs.Tween.get(box.position, {override:true}).to({x:end_x}, 500, createjs.Ease.cubicIn);
			//createjs.Tween.get(box.rotation, {override:true}).to({z:my_rot}, 500, createjs.Ease.cubicIn);
    }

}




var GameFruit =  function(o){
		var me = this

    var fruit = oASSETS[o.name].clone();
    GameWorld.scene.add(fruit);

    var box = new THREE.Box3();
		box.setFromObject(fruit);
		var bottom = fruit.position.y - box.min.y;

    fruit.position.set(0, (GameWorld.visible_height * 0.5) + 5, 0);
   	fruit.scale.set(1.1, 1.1, 1.1);
		fruit.rotation.set(__utils.radFromDeg(-90),0,0);

		createjs.Tween.get(fruit.position, {override:true}).to({y:3}, 1000, createjs.Ease.getElasticOut(1, .8));
    fruit.my_scale = fruit.scale.clone();
    fruit.pulse = new __utils.NewPulse(4);
    
    fruit.onBeforeRender = function(){
      this.pulse.update();
      this.scale.x =  this.my_scale.x * (1 + (this.pulse.value *  0.03));
      this.scale.y =  this.my_scale.y * (1 + (this.pulse.value *  0.03));
      this.scale.z =  this.my_scale.z * (1 + (this.pulse.value *  0.03));
    }


    this.doCorrect =  function(box, callback){

    	//drop into box
			fruit.onBeforeRender = function(){};
			createjs.Tween.get(fruit.position, {override:true}).to({x:box.box.position.x}, 200, createjs.Ease.cubicOut);
			createjs.Tween.get(fruit.position, {override:false}).to({y:box.box.position.y + (bottom * 0.75)}, 200, createjs.Ease.cubicIn);
			createjs.Tween.get(fruit.rotation, {override:true}).to({z:box.box.rotation.z}, 200);
			createjs.Tween.get(fruit.scale, {override:true}).to({x:.75,y:.75,z:.75}, 200).call(()=>{
				me.doDestroy();
				callback();
			});
    }


    this.doWrong = function(box, callback){

			fruit.onBeforeRender = function(){};

			let start_offset = (GameWorld.visible_width * 0.5) + 8;
			let sign = Math.sign(box.box.position.x);
			let end_x = start_offset * -sign;

			createjs.Tween.get(fruit.position, {override:true}).to({x:end_x}, 300, createjs.Ease.cubicIn);
			createjs.Tween.get(fruit.position, {override:false}).to({y:fruit.position.y + 3}, 300, createjs.Ease.cubicIn);
			createjs.Tween.get(fruit.rotation, {override:true}).to({y:fruit.rotation.y + (-sign * 6)}, 300);
			createjs.Tween.get(fruit.scale, {override:true}).to({x:.75,y:.75,z:.75}, 300).call(me.doDestroy);
			callback();
			
    }

    this.doDestroy =  function(){
			GameWorld.scene.remove(fruit);
    }


}