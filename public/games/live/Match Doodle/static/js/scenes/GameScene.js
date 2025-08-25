
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

    //how many pairs?
    GameManager.pairs_count = oCONFIG.levels[GameManager.level-1].pairs;

    //create list of all tiles to use
    var card_ids = [];
    for(let i=1; i<=GameManager.pairs_count; i++){
      card_ids.push(i, i);
    }
    card_ids = __utils.doRandomizeArray(card_ids);

    let jitter = 15;


    let min_y = oSTAGE.game_top + 50;
    let max_y = oSTAGE.game_bottom - 50;
    let min_x = oSTAGE.game_left + 50;
    let max_x = oSTAGE.game_right - 50;

   /*

    let area = (oSTAGE.game_width - 70) * (oSTAGE.game_height - 70);
    area -= (80 * 80); //mute
    area -= (80 * 150); //bottom buttons
    area -= (170 * 138); //bottom buttons

    let max_grid = (area / card_ids.length) * 2;
    let max_spacing = Math.min(30, Math.sqrt(max_grid));

    trace("max_spacing = " + max_spacing);
    */

    let max_spacing = 30;

    //generate list of random possible spots
    let random_spots = [];
    let x = min_x;
    let y = min_y;
    let spacing = max_spacing;
    
    do{
      random_spots.push(new createjs.Point(x,y));
      x += spacing;
      if(x > max_x){
        y += spacing;
        x=min_x;
      }
    }while(y <= max_y);



   
    var cluster_x = oSTAGE.game_center_x;
    var cluster_y = (oSTAGE.game_top + 60) + ((oSTAGE.game_bottom - oSTAGE.game_top - 60 - 200) * 0.5);
    var min_dist = 100;
    var max_dist = oSTAGE.game_bottom - cluster_y;


    trace("height = " + (oSTAGE.game_bottom - oSTAGE.game_top));
  trace("cluster_y = " + (cluster_y));

    trace("max = " + max_dist);
    var dist_cutoff = __utils.doLerp(min_dist, max_dist, card_ids.length/80);

    //remove selected
    for(var i=random_spots.length-1; i>=0; i--){
      let pnt = random_spots[i];
      let ok=true;

      //mute button
      if(pnt.x <= oSTAGE.game_left + 80 && pnt.y <= oSTAGE.game_top + 80){
        ok=false;
      }

      //app close button
      if(pnt.x >= oSTAGE.game_right - 80 && pnt.y <= oSTAGE.game_top + 80){
        ok=false;
      }

      //bottom right buttons
      if(pnt.x >= oSTAGE.game_right - 150 && pnt.y >= oSTAGE.game_bottom - 80){
        ok=false;
      }

      //timer
      if(Math.abs(pnt.x - oSTAGE.game_center_x) < 80 && pnt.y <= oSTAGE.game_top + 60){
        ok=false;
      }

      //drop zone
      if(Math.abs(pnt.x - oSTAGE.game_center_x) < 110 && pnt.y >= oSTAGE.game_bottom - 175){
        ok=false;
      }

      if(__utils.doGetDistance(cluster_x, cluster_y, pnt.x, pnt.y) > dist_cutoff){
        ok=false;
      }

      if(!ok){
        random_spots.splice(i,1);
      }
    }

    

    trace(random_spots.length);


    //add cards to group
    cards = [];
    for(let i=0; i<card_ids.length; i++){
      var card_id = card_ids[i];
      var card = new DoodleCard(card_id, frame);
      card.doActivate();
      let r = __utils.getRandomInt(0, random_spots.length - 1);
      let random_pnt = random_spots.splice(r, 1)[0];

      random_pnt.x += __utils.getRandomArbitrary(-jitter,jitter);
      random_pnt.y += __utils.getRandomArbitrary(-jitter,jitter);
      
      card.clip.visible = false;
      card.clip.alpha = 0;
      card.doSetPos(random_pnt.x - frame.cards.x, random_pnt.y - frame.cards.y);
      cards.push(card);
    }

    IsReady = true;

    BlitFader.doFadeIn(500, me.doReady);

  }

  this.doReady =  function(){
    trace("doReady()");
    createjs.Tween.get(frame.messages, { override: true }).wait(1000).to({alpha: 0}, 200).call(me.doShowCards);
}


  this.doShowCards =  function(){
    __snds.playSound("snd_start", "ui");
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
          objectives: GameManager.pairs
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
     GameManager.time_left = me.time_left;
     me.time_left = time_left;
     __utils.doText(frame.game_time.txt_m, display_time.m);
     __utils.doText(frame.game_time.txt_ss, display_time.ss);
      GameManager.display_time = display_time.m + ":" + display_time.ss;
    stage.needUpdate = true;
  }


  this.doWin =  function(){
    trace("doWin()");

    IsPlaying=false;
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
