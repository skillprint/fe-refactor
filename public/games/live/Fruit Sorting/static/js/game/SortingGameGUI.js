function SortingGameGUI(){

  var me = this;

  var mat = null;
  var z_depth = 0;

  var score_digits = [];


  var holder_timer = new THREE.Group();
  var holder_correct = new THREE.Group();
  var holder_wrong = new THREE.Group();
  var holder_buttons = new THREE.Group();
  var holder_messages = new THREE.Group();

  var scalar = 4.0;
  var width_pixel_ratio;

  var correct_digits = [];
  var wrong_digits = [];


  if(!oASSETS.hasOwnProperty('spritesheet_texture')){
    var panel_src = new lib.ui_spritesheet();
    var nom_bounds = panel_src.nominalBounds;

    __utils.doText(panel_src.txt_ready, oLANG.ready, {verticalAlign:"top"});

    for(let i=0; i<=9; i++){
      __utils.doText(panel_src["digit_" + i], i.toString(), {verticalAlign:"top"});
    }
    
    panel_src.cache(0,0, 512, 256, scalar);
    var canvas = panel_src.cacheCanvas;
    canvas.style.background = "ffffff";
    
    var spritesheet_texture = new THREE.CanvasTexture(canvas);
    spritesheet_texture.premultiplyAlpha = true;
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

   
    map.premultiplyAlpha = true;
    map.repeat = new THREE.Vector2(data.src.w / map.image.width, data.src.h / map.image.height);
    map.offset = new THREE.Vector2(data.src.x / map.image.width, data.src.y / map.image.height);  

    if(platform.isMobile){
      map.minFilter = THREE.NearestMipMapNearestFilter;
    }

    map.needsUpdate = true;

    var mat = new THREE.SpriteMaterial({
      map: map,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
      fog:false,
      transparent:true
    });
    
    var sprite = new THREE.Sprite(mat);
    sprite.my_repeat = new THREE.Vector2(data.src.w / map.image.width, data.src.h / map.image.height);
    sprite.my_offset = new THREE.Vector2(data.src.x / map.image.width, data.src.y / map.image.height);
    sprite.center = new THREE.Vector2(data.center.x, data.center.y);
    sprite.position.set(data.pos.x, data.pos.y, z_depth);

    sprite.onBeforeRender = function(){
      this.material.map.repeat = this.my_repeat;
      this.material.map.offset = this.my_offset;

      if(this.alsoBeforeRender){
        this.alsoBeforeRender();
      }
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

    holder_timer.scale.set(width_pixel_ratio * oSTAGE.scale, width_pixel_ratio * oSTAGE.scale, 1);
    holder_timer.position.set(0, (visible_height * 0.5), -1);

    holder_buttons.scale.set(width_pixel_ratio * oSTAGE.scale, width_pixel_ratio * oSTAGE.scale, 1);
    holder_buttons.position.set((visible_width * 0.5), -(visible_height * 0.5), -1);

    holder_messages.scale.set(width_pixel_ratio * oSTAGE.scale, width_pixel_ratio * oSTAGE.scale, 1);
    holder_messages.position.set(0, (visible_height * 0.1), -1);

    holder_correct.scale.set(width_pixel_ratio * oSTAGE.scale, width_pixel_ratio * oSTAGE.scale, 1);
    holder_correct.position.set((visible_width * 0.5), (visible_height * 0.5), -1);
    
    holder_wrong.scale.set(width_pixel_ratio * oSTAGE.scale, width_pixel_ratio * oSTAGE.scale, 1);
    holder_wrong.position.set((visible_width * 0.5), (visible_height * 0.5), -1);
    

  }


  this.doClear =  function(){
    holder_timer.clear();
    holder_correct.clear();
    holder_wrong.clear();
    holder_buttons.clear();
    holder_messages.clear();
  }




  

  //----------------------------------
  // messages
  //---------------------------------

  var messages = {};
  var current_message = null;


  this.doInitLogo =  function(){
    GameWorld.camera.add(holder_messages);
    messages.logo = me.doGenerateSprite({pos:{x:0, y:0},size:{w:380, h:182.62},src:{texture:"spritesheet_logo", x:0, y:0, w:876, h:421}, center: {x : 0.5, y: 0.5}});
    messages.logo.visible = false;
    holder_messages.add(messages.logo);
  }


  this.doInitMessages =  function(){

    messages.out_of_time = me.doGenerateSprite({pos:{x:0, y:-50},size:{w:380, h:93.82},src:{texture:"spritesheet_time", x:0, y:0, w:810, h:200}, center: {x : 0.5, y: 0.5}});
    messages.out_of_time.visible = false;

    messages.correct = me.doGenerateSprite({pos:{x:0, y:0},size:{w:96, h:96},src:{texture:"spritesheet_texture", x:0*scalar, y:128*scalar, w:128*scalar, h:128*scalar}, center: {x : 0.5, y: 0.5}});
    messages.correct.visible = false;

    messages.wrong = me.doGenerateSprite({pos:{x:0, y:0},size:{w:96, h:96},src:{texture:"spritesheet_texture", x:128*scalar, y:128*scalar, w:128*scalar, h:128*scalar}, center: {x : 0.5, y: 0.5}});
    messages.wrong.visible = false;

    messages.ready = me.doGenerateSprite({pos:{x:0, y:0},size:{w:283, h:68},src:{texture:"spritesheet_texture", x:0*scalar, y:60*scalar, w:283*scalar, h:68*scalar}, center: {x : 0.5, y: 0.5}});
    messages.ready.visible = false;

    holder_messages.add(messages.out_of_time,  messages.correct, messages.wrong, messages.ready);
  }



  this.doShowResult = function(which){
    let message = messages[which];
    message.my_scale = new THREE.Vector2(96, 96);
    message.visible = true;
    message.material.opacity = 1;
    message.scale.set(message.my_scale.x * 0.5, message.my_scale.y * 0.5, 1 );
    createjs.Tween.get(message.scale, {override:true}).to({x: message.my_scale.x, y: message.my_scale.y}, 400, createjs.Ease.getElasticOut(1, .8))
      .to({x: message.my_scale.x * .25, y: message.my_scale.y * .25}, 100)
      .call((e)=>{message.visible = false;});
  }



  this.doShowReady = function(callback){
    let message = messages.ready;
    message.my_scale = new THREE.Vector2(283, 68);
    message.visible = true;
    message.material.opacity = 1;
    message.scale.set(message.my_scale.x * 0.5, message.my_scale.y * 0.5, 1 );
    createjs.Tween.get(message.scale, {override:true}).to({x: message.my_scale.x, y: message.my_scale.y}, 600, createjs.Ease.getElasticOut(1, .8))
      .wait(1000)
      .to({x: message.my_scale.x * .25, y: message.my_scale.y * .25}, 200)
      .call((e)=>{
        message.visible = false;
        callback();
      });
  
  }










  this.doShowMessage =  function(which, params={}){
    for(const s in messages) {
      if(s != which){
        me.doHideMessage(s);
      }
    }
    let message = messages[which];
    message.visible = true;

    if(params.pulse){
      message.my_scale = message.scale.clone();
      message.pulse = new __utils.NewPulse(2);
      
      message.alsoBeforeRender = function(){
        this.pulse.update();
        this.scale.x =  message.my_scale.x * (1 + (this.pulse.value *  0.03));
        this.scale.y =  message.my_scale.y * (1 + (this.pulse.value *  0.03));
      }
    }

    if(params.animateIn){
      message.position.y += (oSTAGE.game_height * 0.5) + (380 * 0.5);
      createjs.Tween.get(message.position, {override:true}).to({y: 0}, 1000, createjs.Ease.getElasticOut(1, .8));
    }
}

 this.doHideAllMessages =  function(){
      for(const s in messages) {
        messages[s].visible = false;
    }
  }

  this.doHideMessage =  function(which, params={}){
     

     if(params.animateOut){
      let newy = (oSTAGE.game_height * 0.5) + (380 * 0.5);
      createjs.Tween.get(message.position, {override:true}).to({y: newy}, 500, createjs.Ease.backIn).call((e)=>{
        messages[which].visible = false;
      });
    }else{
      messages[which].visible = false;
    }
  }





  //----------------------------------
  // score
  //---------------------------------

  this.doInitGameUI =  function(){

    //scores
    GameWorld.camera.add(holder_correct);
    GameWorld.camera.add(holder_wrong);

    let myspace = 27;
    let myx = -26;
    let myy = -105;
    let correct_icon = me.doGenerateSprite({pos:{x:myx, y:myy},size:{w:50, h:50},src:{texture:"spritesheet_texture", x:0*scalar, y:128*scalar, w:128*scalar, h:128*scalar}, center: {x : 0.5, y: 0.5}});
   
    let correct_1 = me.doGenerateSprite({pos:{x:myx - 42, y:myy},size:{w:31.25, h:50},src:{texture:"spritesheet_texture", x:0, y:0, w:37.5*scalar, h:60*scalar}, center: {x : 0.5, y: 0.5}});
    let correct_2 = me.doGenerateSprite({pos:{x:myx - 42 - myspace, y:myy},size:{w:31.25, h:50},src:{texture:"spritesheet_texture", x:0, y:0, w:37.5*scalar, h:60*scalar}, center: {x : 0.5, y: 0.5}});
    let correct_3 = me.doGenerateSprite({pos:{x:myx - 42 - myspace - myspace, y:myy},size:{w:31.25, h:50},src:{texture:"spritesheet_texture", x:0, y:0, w:37.5*scalar, h:60*scalar}, center: {x : 0.5, y: 0.5}});

    myy-=50;
    let wrong_icon = me.doGenerateSprite({pos:{x:myx, y:myy},size:{w:50, h:50},src:{texture:"spritesheet_texture", x:128*scalar, y:128*scalar, w:128*scalar, h:128*scalar}, center: {x : 0.5, y: 0.5}});
   
    let wrong_1 = me.doGenerateSprite({pos:{x:myx - 42, y:myy},size:{w:31.25, h:50},src:{texture:"spritesheet_texture", x:0, y:0, w:37.5*scalar, h:60*scalar}, center: {x : 0.5, y: 0.5}});
    let wrong_2 = me.doGenerateSprite({pos:{x:myx - 42 - myspace, y:myy},size:{w:31.25, h:50},src:{texture:"spritesheet_texture", x:0, y:0, w:37.5*scalar, h:60*scalar}, center: {x : 0.5, y: 0.5}});
    let wrong_3 = me.doGenerateSprite({pos:{x:myx - 42 - myspace - myspace, y:myy},size:{w:31.25, h:50},src:{texture:"spritesheet_texture", x:0, y:0, w:37.5*scalar, h:60*scalar}, center: {x : 0.5, y: 0.5}}); 
    
    holder_correct.add(correct_icon, correct_1, correct_2, correct_3);
    holder_wrong.add(wrong_icon, wrong_1, wrong_2, wrong_3);

    correct_digits = [correct_1, correct_2, correct_3];
    wrong_digits = [wrong_1, wrong_2, wrong_3];


    //timer
    GameWorld.camera.add(holder_timer);
    var meter_group = me.doGenerateSprite({pos:{x:-235 + 115, y:-5},size:{w:230, h:49},src:{texture:"spritesheet_texture", x:283*scalar, y:106*scalar, w:230*scalar, h:49*scalar}, center: {x :0, y: 1}});
    me.progbar = me.doGenerateSprite({pos:{x:-226 + 115, y:-11},size:{w:210, h:36},src:{texture:"spritesheet_texture", x:283*scalar, y:156*scalar, w:210*scalar, h:36*scalar}, center: {x :0, y: 1}});
    var meter_frame = me.doGenerateSprite({pos:{x:-235 + 115, y:-5},size:{w:230, h:49},src:{texture:"spritesheet_texture", x:283*scalar, y:206*scalar, w:230*scalar, h:49*scalar}, center: {x :0, y: 1}});
   
    holder_timer.add(meter_group);
    holder_timer.add(me.progbar);
    holder_timer.add(meter_frame);
    
    me.progbar.scale.x = (210 * 0.5);




    //buttons
    GameWorld.camera.add(holder_buttons);
    let b_quit =  me.doGenerateSprite({pos:{x:-40, y:35},size:{w:60, h:52},src:{texture:"spritesheet_texture", x:375*scalar, y:0*scalar, w:60*scalar, h:52*scalar}, center: {x : 0.5, y: 0.5}});
 
    holder_buttons.add(b_quit);
    

  }

  this.doUpdateTimer =  function(p){
    me.progbar.scale.x = (210 * p);
  }



  this.doUpdateCorrect = function(n){

    let arr = n.toString().split("");
    let digit_x = -66 - ((arr.length-1) * 27);
    for(let i=0; i<correct_digits.length; i++){
      correct_digits[i].visible=false;
    }

    for(let i=0; i<arr.length; i++){
      let digit = parseInt(arr[i]);
      correct_digits[i].position.x = digit_x;
      digit_x += 27;
      correct_digits[i].visible=true;
      correct_digits[i].my_offset.x = digit * 0.07324;
    }
  }




   this.doUpdateWrong = function(n){

    let arr = n.toString().split("");
    let digit_x = -66 - ((arr.length-1) * 27);
    for(let i=0; i<wrong_digits.length; i++){
      wrong_digits[i].visible=false;
    }

    for(let i=0; i<arr.length; i++){
      let digit = parseInt(arr[i]);
      wrong_digits[i].position.x = digit_x;
      digit_x += 27;
      wrong_digits[i].visible=true;
      wrong_digits[i].my_offset.x = digit * 0.07324;
    }
  }
}



