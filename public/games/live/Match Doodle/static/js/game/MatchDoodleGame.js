var MatchDoodleGameManager = function () {
  var me = this;

  me.level = 1;
  me.found = 0;
  me.card_1 = null;
  me.card_2 = null;
  me.canPickup = false;
  me.pairs_found = 0;
  me.score= 0;
  me.consecutive_matches= 0;

  me.draggingCard = null;

  var ready_callback = null;

  this.doNewGame = function () {
    me.level = 1;
    me.pairs_found = 0;
    me.score= 0;
    me.consecutive_matches= 0;
  };

  this.doNewLevel =  function(l){
    me.level = l;
    me.found = 0;
    me.card_1 = null;
    me.card_2 = null;
    me.canPickup = false;
    me.pairs_found = 0;
    me.consecutive_matches= 0;

    me.pairs = oCONFIG.levels[me.level-1].pairs;

  }

  this.doLoadPuzzle =  function(callback){
    ready_callback = callback;
    ready_callback();
}


  this.doDestroy = function () {
    __snds.stopSound("music");
    inputListener.forget = true;
    me.forget = true;
  };


};



var DoodleCard = function(card_id, frame){
  var me = this;

  me.id = card_id;

  var card;
  var stage = frame.stage;
  var target = frame.cards;
  var IsDragging = false;
  var start_x = 0;
  var start_y = 0;
  var rot_dir = 0;
  var move_speed_x = 0;
  var move_speed_y = 0;
  var rot_speed = 0;
  var rot_dir = 0;
  var card_image;
 var card_name;

  this.doInit = function(){
    card_image = images["item_" + ((card_id<10)?"0":"") + card_id];
    card_name = "card_" + card_id;
    var bmp = new createjs.Bitmap(card_image);

    card = new createjs.Container(); 
    card.image = card.addChild(bmp);
    card.image.x = -card_image.naturalWidth * 0.5;
    card.image.y = -card_image.naturalHeight * 0.5;
    card.myid = card_id;
    card.scale = 0.5;
    card.rotation = __utils.getRandomArbitrary(0,360);
    frame.cards.addChild(card);
    me.clip = card;
  }

  this.doActivate = function(){
      var hit = new createjs.Shape();
      hit.graphics.beginFill("#000");
      hit.graphics.drawRect(card.image.x, card.image.y, card_image.naturalWidth, card_image.naturalHeight);
      card.hitArea = hit;

      card.helper = new __utils.ButtonHelper(stage, card,"norm","over");
      card.addEventListener("mousedown", me.doPickupCard);
      me.forget = false;
      me.doUpdate = me.doIdleCard;
      GameWorld.actives.push(me);
  }


  this.doSetPos = function(x,y){
    card.x = x;
    card.y = y;
  }

  this.doAutoDrop = function(callback){
    trace("doAutoDrop()");
    me.doUpdate = function(){};
    me.forget = true;
    card.mouseEnabled = false;

    let loc = frame.drop_pad.drop_1.localToLocal(0, 0, frame.cards);
    createjs.Tween.get(card, { override: true }).to({x: loc.x, y:loc.y, rotation:0}, 600, createjs.Ease.cubicInOut).call(()=>{
        frame.drop_pad.drop_1.addChild(card);
        card.x = 0;
        card.y = 0;
        if(callback){
          callback();
        }
    });
    stage.activeTweens.push(card);
  }

  this.doIdleCard = function(){

    move_speed_x *= 0.90;
    move_speed_y *= 0.90;

    card.x += move_speed_x;
    card.y += move_speed_y;

    let min_y = (-oSTAGE.game_height * 0.5) + 35;
    let max_y = (oSTAGE.game_height * 0.5) - 35;
    let min_x = (-oSTAGE.game_width * 0.5) + 35;
    let max_x = (oSTAGE.game_width * 0.5) - 35;

    if(card.x > max_x && move_speed_x > 0){
      move_speed_x = -move_speed_x * 0.5;
    }else if(card.x < min_x && move_speed_x < 0){
      move_speed_x = -move_speed_x * 0.5;
    }

    if(card.y > max_y && move_speed_y > 0){
      move_speed_y = -move_speed_y * 0.5;
    }else if(card.y < min_y && move_speed_y < 0){
      move_speed_y = -move_speed_y * 0.5;
    }


    if(GameManager.draggingCard){
      let offset_x = card.x - GameManager.draggingCard.x;
      let offset_y = card.y - GameManager.draggingCard.y;
      let dist = Math.sqrt(offset_x * offset_x + offset_y * offset_y);
      if(dist < 50){
        let offset = (dist - 50);
        let normal_x = offset_x / dist;
        let normal_y = offset_y / dist;
        move_speed_x = (-Math.sign(offset) * normal_x * 0.2);
        move_speed_y = (-Math.sign(offset) * normal_y * 0.2);

      }
    }

    card.x = Math.min(max_x, Math.max(min_x, card.x));
    card.y = Math.min(max_y, Math.max(min_y, card.y));

    rot_speed *= 0.9;
    card.rotation = (card.rotation + rot_speed) % 360;

    stage.needUpdate = true;
  }


  this.doPickupCard = function(){
    trace("doPickupCard() " + me.id);
    if(!GameManager.canPickup){return;}

    __snds.playSound("snd_pickup", "ui");

    IsDragging = true;
    target.setChildIndex(card, target.children.length);
    start_x = card.x;
    start_y = card.y;
    move_speed_x = 0;
    move_speed_y = 0;
    rot_dir = (Math.random() > 0.5) ? 1 : -1;
    rot_speed = rot_dir * 3;
    BlitInputs.release_pending = false;
    me.doUpdate = me.doDragCard;

    GameManager.draggingCard = me.clip;

    spLogEvent({event: "PICKUP", object_id: me.id, time: GameManager.time_left});

  }

  this.doDragCard = function(){

    let min_y = (-oSTAGE.game_height * 0.5) + 75;
    let max_y = (oSTAGE.game_height * 0.5) - 35;
    let min_x = (-oSTAGE.game_width * 0.5) + 35;
    let max_x = (oSTAGE.game_width * 0.5) - 35;

    let move_x = (BlitInputs.mouse_x - BlitInputs.start_x);
    let move_y = (BlitInputs.mouse_y - BlitInputs.start_y);
    let new_x = start_x + move_x;
    let new_y = start_y + move_y;

    new_x = Math.min(max_x, Math.max(min_x, new_x));
    new_y = Math.min(max_y, Math.max(min_y, new_y));

    move_speed_x = (new_x - card.x);
    move_speed_y = (new_y - card.y);
    rot_speed = Math.min(3, __utils.doGetDistance(move_speed_x, move_speed_y, 0, 0));
    card.rotation = (card.rotation + rot_speed) % 360;
    card.x = new_x;
    card.y = new_y;
    stage.needUpdate = true;
    if(BlitInputs.release_pending){
      BlitInputs.release_pending = false;
      me.doDropCard();
    }
  }

   this.doDropCard = function(){
      trace("doDropCard()");
      IsDragging = false;
      GameManager.draggingCard = null;

       spLogEvent({event: "DROP", object_id: me.id, time: GameManager.time_left});

      let loc = frame.drop_pad.drop_2.localToLocal(0, 0, frame.cards);
      let dist = __utils.doGetDistance(loc.x, loc.y, card.x, card.y);

      if(dist < 50){
        let isMatch = (GameManager.card_1.id == me.id);
        if(isMatch){
          GameManager.card_2 = me;
          me.doCorrectDrop();
        }else{
          me.doWrongDrop();   
        }
      }else{ 
        me.doUpdate = me.doIdleCard;
      }
  }

  this.doCorrectDrop = function(){
    trace("doCorrectDrop()");
    me.doUpdate = function(){};
    __snds.playSound("correct", "ui");

    move_speed_x = 0;
    move_speed_y = 0;
    rot_speed = 0;
    me.forget = true;
    card.mouseEnabled=false;
    let loc = frame.drop_pad.drop_2.localToLocal(0, 0, frame.cards);
    let dist = __utils.doGetDistance(card.x, card.y, loc.x, loc.y);
    let time = dist * 3;
    SceneManager.doCorrect();


    createjs.Tween.get(card, { override: true }).to({x: loc.x, y:loc.y}, time, createjs.Ease.cubicInOut).call(()=>{
       frame.drop_pad.drop_2.addChild(card);
        card.x = 0;
        card.y = 0;
        SceneManager.doCorrect2(me);
    });
    stage.activeTweens.push(card);
  }

  this.doWrongDrop = function(){
    trace("doWrongDrop()");
    me.doUpdate = function(){};

    __snds.playSound("wrong", "ui");
    move_speed_x = 0;
    move_speed_y = 0;
    rot_speed = 0;
    card.mouseEnabled=false;
    let loc = frame.drop_pad.drop_2.localToLocal(0, 0, frame.cards);
    let dist = __utils.doGetDistance(card.x, card.y, start_x, start_y);
    let time = dist * 1.5;

    SceneManager.doWrong();

    createjs.Tween.get(card, { override: true }).to({x: start_x, y:start_y}, time, createjs.Ease.cubicInOut).call(()=>{
        me.doUpdate = me.doIdleCard;
        card.mouseEnabled=true;
    });
    stage.activeTweens.push(card);
  }


  this.doCorrectClear =  function(){
    createjs.Tween.get(card, { override: true }).to({scale: .2, alpha: 0}, 200).call(me.doDestroy);
    stage.activeTweens.push(card);
  }



  this.doDestroy = function(){
    card.mouseEnabled=false;
    me.doUpdate = function(){};
    move_speed_x = 0;
    move_speed_y = 0;
    rot_speed = 0;
    me.forget = true;
  card.mouseEnabled=false;
  }


  me.doInit();

}
