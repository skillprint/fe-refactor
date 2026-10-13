
var GameScene = function () {
  trace("GameScene()");

  var me = this;
  var canvas = document.getElementById("canvas_screens");
  var stage = BlitStage(canvas, { webgl: false });
  var frame = stage.addChild(new lib.scene_game());

  var IsLocked = true;

  var GameTimer;
  var timeout;
  var timer_current, timer_frame, timer_back, timer_bar;
  var timer_width = 0;

  me.time_left = 0

  me.score = 0;
  me.consecutive_matches = 0;

  GameManager.result = null;

  var IsReady = false;
  var IsPlaying = false;
  var cards = [];

  GameWorld = {is_paused : false, actives:[]};
  GameWorld.doUpdate = function(){
    if(this.is_paused){return;}
    var me = this;
    for(var i=me.actives.length-1; i>=0; i--){
        if(me.actives[i]){
          me.actives[i].doUpdate(me.actives[i]);
            if(me.actives[i].need_destroy){
                me.actives.splice(i,1);
            continue;
          }
          if(me.actives[i].forget){
                me.actives.splice(i,1);
            }
        }else{
          me.actives.splice(i,1);
        }
      }
  }
  GameWorld.doPause = function(){};
  GameWorld.doResume = function(){};
  actives.push(GameWorld);

  //---------------------------
  // init
  //---------------------------

  this.doInit = function () {

    IsLocked = false;
    me.forget = false;
    update_queue.push(me);
    RESIZER.doUpdateNow();
    RESIZER.w=0;

    frame.messages.visible=false;

    //stop any music
    __snds.stopSound("music");
    music_playing = null;

    //reset /  quit buttons
    frame.b_restart.helper = new __utils.ButtonHelper(stage,frame.b_restart,"norm","over");
    frame.b_restart.addEventListener("click", me.doChooseRestart);

    frame.b_home.helper = new __utils.ButtonHelper(stage,frame.b_home,"norm","over");
    frame.b_home.addEventListener("click", me.doChooseHome);

    //new game
    GameManager.doNewGame();
    me.doCreateLevel(1);
  };

 



  this.doCreateLevel =  function(l){
    trace("doCreateLevel " + l);
    GameManager.doNewLevel(l);

    GameManager.time_left = 0;
    GameTimer = new BlitTimer({"seconds_on_clock": 0, "callback_update": me.doTimerUpdate, "direction": 1});
    GameTimer.doFirstUpdate();

    //round message
    let msg = JSON.parse(JSON.stringify(oLANG.game_msg));
    msg.value = __utils.doSubText(msg.value, "{*var*}", GameManager.level.toString());
    frame.messages.visible=true;
    frame.messages.alpha = 1;
    __utils.doText(frame.messages.txt, msg);

    //how many pairs? (Skillprint `pairs` knob overrides oCONFIG.levels)
    GameManager.pairs_count = me.doClampPairs(oCONFIG.levels[GameManager.level-1].pairs);

    //create list of all tiles to use
    var card_ids = [];
    level_ids = [];
    for(let i=1; i<=GameManager.pairs_count; i++){
      card_ids.push(i, i);
      level_ids.push(i);
    }
    card_ids = __utils.doRandomizeArray(card_ids);

    let random_spots = me.doGetSpots(card_ids.length, me.doGetSpread());

    //add cards to group
    cards = [];
    for(let i=0; i<card_ids.length; i++){
      let r = __utils.getRandomInt(0, random_spots.length - 1);
      cards.push(me.doAddCard(card_ids[i], random_spots.splice(r, 1)[0]));
    }

    cards_shown = false;
    level_active = true;
    IsReady = true;

    BlitFader.doFadeIn(500, me.doReady);

  }

  //---------------------------
  // card placement + Skillprint difficulty knobs
  //---------------------------

  var MAX_PAIRS = 40; //item_01 ... item_40
  var cards_shown = false;
  var level_active = false;
  var level_ids = [];

  this.doClampPairs = function(n){
    n = Math.round(Number(n));
    if(!isFinite(n)){ n = 5; }
    return Math.max(2, Math.min(MAX_PAIRS, n));
  }

  //cluster radius multiplier: lower packs the heap tighter (more overlap)
  this.doGetSpread = function(){
    let s = Number(oCONFIG.clusterSpread);
    return (isFinite(s) && s > 0) ? s : 1;
  }

  //max tilt of heap cards in degrees: 0 = upright, 180 = any orientation
  this.doGetMaxRotation = function(){
    let r = Number(oCONFIG.cardRotation);
    return isFinite(r) ? Math.max(0, Math.min(180, r)) : 180;
  }

  this.doGetCluster = function(){
    return {
      x: oSTAGE.game_center_x,
      y: (oSTAGE.game_top + 60) + ((oSTAGE.game_bottom - oSTAGE.game_top - 60 - 200) * 0.5),
      min_x: oSTAGE.game_left + 50,
      max_x: oSTAGE.game_right - 50,
      min_y: oSTAGE.game_top + 50,
      max_y: oSTAGE.game_bottom - 50
    };
  }

  //free spots (stage coords) around the cluster centre. The heap radius grows
  //with the number of cards on the table and scales with `spread`; if too few
  //spots fall inside it, the nearest ones outside are used so every card fits.
  this.doGetSpots = function(count, spread){
    let c = me.doGetCluster();
    let spacing = 30;

    let spots = [];
    for(let y = c.min_y; y <= c.max_y; y += spacing){
      for(let x = c.min_x; x <= c.max_x; x += spacing){
        let ok = true;

        //mute button
        if(x <= oSTAGE.game_left + 80 && y <= oSTAGE.game_top + 80){ ok = false; }
        //app close button
        if(x >= oSTAGE.game_right - 80 && y <= oSTAGE.game_top + 80){ ok = false; }
        //bottom right buttons
        if(x >= oSTAGE.game_right - 150 && y >= oSTAGE.game_bottom - 80){ ok = false; }
        //timer
        if(Math.abs(x - oSTAGE.game_center_x) < 80 && y <= oSTAGE.game_top + 60){ ok = false; }
        //drop zone
        if(Math.abs(x - oSTAGE.game_center_x) < 110 && y >= oSTAGE.game_bottom - 175){ ok = false; }

        if(ok){
          let pnt = new createjs.Point(x, y);
          pnt.dist = __utils.doGetDistance(c.x, c.y, x, y);
          spots.push(pnt);
        }
      }
    }

    let min_dist = 100;
    let max_dist = oSTAGE.game_bottom - c.y;
    let dist_cutoff = __utils.doLerp(min_dist, max_dist, count/80) * spread;

    spots.sort(function(a, b){ return a.dist - b.dist; });
    let keep = Math.max(count, spots.filter(function(p){ return p.dist <= dist_cutoff; }).length);
    return spots.slice(0, keep);
  }

  this.doAddCard = function(card_id, pnt){
    let jitter = 15;
    let max_rot = me.doGetMaxRotation();
    let card = new DoodleCard(card_id, frame);
    card.doActivate();
    card.clip.rotation = __utils.getRandomArbitrary(-max_rot, max_rot);
    card.clip.visible = false;
    card.clip.alpha = 0;
    card.doSetPos(pnt.x + __utils.getRandomArbitrary(-jitter,jitter) - frame.cards.x,
                  pnt.y + __utils.getRandomArbitrary(-jitter,jitter) - frame.cards.y);
    return card;
  }

  this.doIsIdle = function(card){
    return card.doUpdate === card.doIdleCard && card.clip.parent === frame.cards;
  }

  //`pairs` knob: change the pair count of the level in progress. New pairs are
  //dealt into the heap; removed pairs are ones with both cards still idle in
  //the heap, so the card on the drop pad and the one being dragged are kept.
  this.doSetPairs = function(n){
    if(!level_active){ return; }
    let target = me.doClampPairs(n);
    let from = GameManager.pairs_count;

    if(target > from){
      let unused = [];
      for(let id=1; id<=MAX_PAIRS; id++){
        if(level_ids.indexOf(id) < 0){ unused.push(id); }
      }
      unused = __utils.doRandomizeArray(unused).slice(0, target - from);
      let spots = __utils.doRandomizeArray(me.doGetSpots(cards.length + unused.length * 2, me.doGetSpread()));
      for(let i=0; i<unused.length; i++){
        level_ids.push(unused[i]);
        for(let k=0; k<2; k++){
          let card = me.doAddCard(unused[i], spots.pop());
          if(cards_shown){
            card.clip.visible = true;
            createjs.Tween.get(card.clip, {override: true }).to({alpha:1}, 300);
          }
          cards.push(card);
        }
      }
      GameManager.pairs_count += unused.length;
    }else if(target < from){
      let removable = [];
      for(let i=0; i<level_ids.length; i++){
        let id = level_ids[i];
        let both = cards.filter(function(c){ return c.id == id && me.doIsIdle(c); });
        if(both.length == 2){ removable.push(id); }
      }
      removable = __utils.doRandomizeArray(removable).slice(0, from - target);
      for(let i=0; i<removable.length; i++){
        let id = removable[i];
        level_ids.splice(level_ids.indexOf(id), 1);
        for(let k=cards.length-1; k>=0; k--){
          if(cards[k].id == id){
            let card = cards.splice(k, 1)[0];
            card.doDestroy();
            createjs.Tween.get(card.clip, { override: true }).to({scale: .2, alpha: 0}, 200).call(function(){
              if(card.clip.parent){ card.clip.parent.removeChild(card.clip); }
            });
          }
        }
      }
      GameManager.pairs_count -= removable.length;
    }

    if(GameManager.pairs_count != from){
      spLogEvent({event: "OBJECTIVES_CHANGED", level: GameManager.level, objectives: GameManager.pairs_count});
      stage.needUpdate = true;
    }
  }

  //`clusterSpread` knob: scale the idle heap about the cluster centre. The
  //spread and rotation tweens don't override each other; picking a card up
  //stops both (DoodleCard.doPickupCard).
  this.doSetSpread = function(old_spread, new_spread){
    if(!level_active || !(old_spread > 0)){ return; }
    let ratio = new_spread / old_spread;
    let c = me.doGetCluster();
    let cx = c.x - frame.cards.x;
    let cy = c.y - frame.cards.y;
    for(let i=0; i<cards.length; i++){
      let card = cards[i];
      if(!me.doIsIdle(card)){ continue; }
      let x = cx + (card.clip.x - cx) * ratio;
      let y = cy + (card.clip.y - cy) * ratio;
      x = Math.min(c.max_x - frame.cards.x, Math.max(c.min_x - frame.cards.x, x));
      y = Math.min(c.max_y - frame.cards.y, Math.max(c.min_y - frame.cards.y, y));
      createjs.Tween.get(card.clip).to({x: x, y: y}, 400, createjs.Ease.cubicInOut);
    }
    stage.needUpdate = true;
  }

  //`cardRotation` knob: re-tilt the idle heap within +/- max degrees
  this.doSetRotation = function(){
    if(!level_active){ return; }
    let max_rot = me.doGetMaxRotation();
    for(let i=0; i<cards.length; i++){
      let card = cards[i];
      if(!me.doIsIdle(card)){ continue; }
      let r = ((card.clip.rotation % 360) + 540) % 360 - 180; //-180..180
      card.clip.rotation = r;
      createjs.Tween.get(card.clip).to({rotation: __utils.getRandomArbitrary(-max_rot, max_rot)}, 400, createjs.Ease.cubicInOut);
    }
    stage.needUpdate = true;
  }

  this.doReady =  function(){
    trace("doReady()");
    createjs.Tween.get(frame.messages, { override: true }).wait(1000).to({alpha: 0}, 200).call(me.doShowCards);
}


  this.doShowCards =  function(){
    __snds.playSound("snd_start", "ui");
      cards_shown = true;
      let delay = 0;
      let delay_addon = Math.max(20, 500 / cards.length);
      for(let i=0; i<cards.length; i++){
        let card = cards[i];
        card.clip.alpha = 0;
        card.clip.visible = true;
        createjs.Tween.get(card.clip, {override: true }).wait(delay).to({alpha:1}, 300);
        delay += delay_addon;
      }
      setTimeout(me.doStartGame, Math.max(2000, delay + 200));
  }

  this.doStartGame = function(){
    let r = __utils.getRandomInt(0, cards.length - 1);
    let card = cards.splice(r, 1)[0];
    GameManager.card_1 = card;
    GameManager.card_2 = null;
    card.doAutoDrop(me.doFirstTurn);
  }

  this.doFirstTurn =  function(){
    IsPlaying = true;
    GameManager.result = null;
    GameTimer.doStart();
    GameManager.canPickup = true;
    spLogEvent(
        {
          event: "LEVEL_START",
          level: GameManager.level,
          objectives: GameManager.pairs_count
        }
    );
  }

  this.doStartTurn =  function(){
    trace("doStartTurn()");
    let r = __utils.getRandomInt(0, cards.length - 1);
    let card = cards.splice(r, 1)[0];
    GameManager.card_1 = card;
    GameManager.card_2 = null;
    card.doAutoDrop();
    GameManager.canPickup = true;
  }

   this.doCorrect = function(){
      trace("doCorrect()");
      if(!IsPlaying){return;}
      GameManager.pairs_found++;
      GameManager.score += 10;
      GameManager.consecutive_matches++;
      spLogEvent({event: "MATCH", time: me.time_left, object_done: GameManager.pairs_found});

      GameManager.canPickup = false;

      stage.needUpdate = true;
  }

  this.doCorrect2 =  function(which){
      trace("doCorrect2()");
      if(!IsPlaying){return;}

     for(let i=cards.length-1; i>=0; i--){
        if(cards[i] == which){
          cards.splice(i, 1);
        }
      }

      GameManager.card_1.doCorrectClear();
      GameManager.card_2.doCorrectClear();

      //update count
      if(GameManager.pairs_found >= GameManager.pairs_count){
        me.doWin();
      }else{
        setTimeout(me.doStartTurn, 500);
      }

      stage.needUpdate = true;
  }



  this.doWrong =  function(){
    trace("doWrong()");
    if(!IsPlaying){return;}
    me.consecutive_matches = 0;
    spLogEvent({event: "UNMATCH", time: me.time_left, object_done: GameManager.pairs_found});
  }





  this.doTimerUpdate = function(time_left, percent_left, display_time){
     me.time_left = time_left;
     GameManager.time_left = me.time_left;
     __utils.doText(frame.game_time.txt_m, display_time.m);
     __utils.doText(frame.game_time.txt_ss, display_time.ss);
      GameManager.display_time = display_time.m + ":" + display_time.ss;
    stage.needUpdate = true;
  }


  this.doWin =  function(){
    trace("doWin()");

    IsPlaying=false;
    level_active = false;
    GameTimer.doStop();
    GameTimer.doDestroy();

    __snds.playSound("snd_level_complete", "ui");

   GameManager.result = "win";
   GameManager.time_left = me.time_left;

    spLogEvent({event: "LEVEL_COMPLETE", level: GameManager.level, time: me.time_left});

 
    var next_level = GameManager.level+1;
    if(next_level <= oCONFIG.levels.length){
      me.doCreateLevel(next_level);
    }else{
      setTimeout(me.doWrapup, 1000);
    }

    BlitSaver.doSaveData("user", oUSER);
  }


  this.doWrapup = function () {
    BlitFader.doFadeOut(100, () => {
      me.doDestroy();
      SceneManager = new RecapScene();
    });
    return;
  };





  //---------------------------------
  // User Actions
  //---------------------------------

  this.doChooseRestart = function (o) {
    if (IsLocked) {
      return;
    }
    IsLocked = true;
    GameTimer.doPause();

    __snds.playSound("snd_popup", "ui");

    var Popup = new PopupConfirm({
      msg: "restart_confirm",
      callback_ok: me.doConfirmRestart,
      callback_cancel: me.doCancel,
    });
  };

  this.doChooseHome = function (o) {
    if (IsLocked) {
      return;
    }
    IsLocked = true;
    GameTimer.doPause();
    __snds.playSound("snd_popup", "ui");

    var Popup = new PopupConfirm({
      msg: "home_confirm",
      callback_ok: me.doConfirmHome,
      callback_cancel: me.doCancel,
    });
  };

  this.doConfirmRestart = function () {
    trace("doConfirmRestart()");
    spLogEvent({ event: "LEVEL_RESTART", level: GameManager.level });
    BlitFader.doFadeOut(200, () => {
      me.doDestroy();
      SceneManager = new GameScene();
    });
  };

  this.doConfirmHome = function () {
    trace("doConfirmHome()");
    spLogEvent({ event: "LEVEL_QUIT", level: GameManager.level });
    BlitFader.doFadeOut(200, () => {
      me.doDestroy();
      SceneManager = new TitleScene();
    });
  };

  this.doCancel = function () {
    IsLocked = false;
    GameTimer.doResume();
  };


  this.doDestroy = function () {
    level_active = false;
    GameTimer.doDestroy();

    var id = window.setTimeout(function() {}, 0);
    while (id--) {
        window.clearTimeout(id); // will do nothing if no timeout with id is present
    }

    for(let i =0; i<cards.length; i++){
      cards[i].doDestroy();
    }

    stage.removeAllChildren();
    stage.enableMouseOver(0);
    me.forget = true;
    stage.needUpdate = true;
  };

  //------------------------
  // resize
  //------------------------

  this.doResizeUpdate = function () {

    frame.b_restart.x = oSTAGE.game_right - 65;
    frame.b_restart.y = oSTAGE.game_bottom - 10;
    frame.b_home.x = oSTAGE.game_right - 5;
    frame.b_home.y = oSTAGE.game_bottom - 10;

    frame.game_time.x = oSTAGE.game_center_x;
    frame.game_time.y = oSTAGE.game_top+5;

    frame.drop_pad.x = oSTAGE.game_center_x;
    frame.drop_pad.y = oSTAGE.game_bottom - 90;

    frame.messages.x = oSTAGE.game_center_x;
    frame.messages.y = oSTAGE.game_top + (oSTAGE.game_height * 0.3);

    frame.cards.x = oSTAGE.game_center_x;
    frame.cards.y = oSTAGE.game_center_y;


    //recache
    if (me.scale != oSTAGE.scale) {
    }


    frame.x = oSTAGE.game_width_margins;
    frame.y = oSTAGE.game_height_margins;
    me.scale = oSTAGE.scale;
  };

  me.doInit();
};
