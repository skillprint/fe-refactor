
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

  GameManager.result = null;

  var IsReady = false;
  var IsPlaying = false;
  var cards = [];
  var cards_turned = [];

  var bonus_mode = false;
  var bonus_points=0;
  var bonus_start_time=0;
  var final_level_score = 0;


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

    IsLocked = true;
    me.forget = false;
    update_queue.push(me);
    RESIZER.doUpdateNow();
    RESIZER.w=0;

    music_playing = null;

    __utils.doText(frame.score_panel.txt_score, oLANG.txt_score);

    frame.b_restart.helper = new __utils.ButtonHelper(stage,frame.b_restart,"norm","over");
    frame.b_restart.addEventListener("click", me.doChooseRestart);

    frame.b_home.helper = new __utils.ButtonHelper(stage,frame.b_home,"norm","over");
    frame.b_home.addEventListener("click", me.doChooseHome);

    frame.game_time.isOpened = false;

    var first_level = oVARS.level || GameManager.level;
    me.doCreateLevel(first_level);
  };

 

  this.doCreateLevel =  function(level){
    trace("doPuzzleReady");
    bonus_mode = false;
    GameManager.doNewLevel(level);
    
    spLogEvent({event: "LEVEL_START", level: GameManager.level, score: GameManager.score, pairs:oCONFIG.levels[GameManager.level-1].pairs});

    me.doUpdateScore();

    GameTimer = new BlitTimer({"seconds_on_clock": oCONFIG.levels[GameManager.level-1].time, "callback_update": me.doTimerUpdate, "callback_bonuscomplete": me.doBonusComplete, "callback_outoftime": me.doOutOfTime, "direction": -1});
     frame.game_time.x = oSTAGE.game_left - 120;
     GameTimer.doFirstUpdate();

     //round message
    let msg = JSON.parse(JSON.stringify(oLANG.game_msg));

    msg.value = __utils.doSubText(msg.value, "{*round*}", GameManager.level.toString());
    msg.value = __utils.doSubText(msg.value, "{*rounds*}", oCONFIG.levels.length.toString());

    frame.messages.visible=true;
    frame.messages.alpha = 1;
    __utils.doText(frame.messages.txt, msg);

    cards=[];

    //create list of all cards to use
    var card_ids = [];
    for(let i=1; i<=GameManager.pairs_count; i++){
      card_ids.push(i,i);
    }
    card_ids = __utils.doRandomizeArray(card_ids);

    //add cards to group
    for(let i=0; i<card_ids.length; i++){
      var card_id = card_ids[i];
      var card_name = "card_" + card_id;
      var card = new createjs.Container();
      card.back = card.addChild(new lib.card_back);
      card.front = card.addChild(new lib[card_name]);
      card.front.visible = false;
      card.myid = card_id;
      card.showing = false;
      card.x = 0;
      card.y = 0;
      card.pos = (i+1);
      card.scale = 1;
      card.visible=false;
      card.helper = new __utils.ButtonHelper(stage,card,"norm","over");
      card.addEventListener("click", me.doSelect);
      frame.cards.addChild(card);
      cards.push(card);
    }

    IsReady = true;
    me.doUpdateLayout();
    BlitFader.doFadeIn(500, me.doShowCards);
  }



  this.doShowCards =  function(){
      let delay = 1000;

      createjs.Tween.get(frame.messages, {override: true }).wait(delay).to({alpha:0}, 300);
      stage.activeTweens.push(frame.messages);

      delay+=300;

      for(let i=0; i<cards.length; i++){
        let card = cards[i];
        card.myx = card.x;
        card.myy = card.y;
        card.scaleX = 0;
        card.visible = true;
        createjs.Tween.get(card, {override: true }).wait(delay).to({rotation:0, scaleX:card.myscale}, 100);
        stage.activeTweens.push(card);
        delay += 50;
      }
      setTimeout(me.doReady, Math.max(2000, delay+ 200));
  }


  this.doReady =  function(){
    frame.messages.visible = false;
    frame.game_time.x = oSTAGE.game_left - 120;
    frame.game_time.myx = oSTAGE.game_left + 14;
    frame.game_time.isOpened = true;
    createjs.Tween.get(frame.game_time).to({x: frame.game_time.myx}, 500, createjs.Ease.cubicOut);
    stage.activeTweens.push(frame.game_time);

    setTimeout(me.doGo, 300);
  }

  this.doGo =  function(){
    IsLocked = false;
    IsPlaying = true;
    bonus_mode = false;
    final_level_score = 0;
    cards_turned = [];
    GameManager.result = null;
    GameTimer.doStart();
    GameManager.display_time = "0";
  }

  this.doSelect = function(e){
    if(IsLocked){return;}
    trace("doSelect()");

    var card = e.currentTarget;
    var id = e.currentTarget.myid;
    cards_turned.push(card);

    spLogEvent({event: "FLIP", card: id, position: card.pos});  
    __snds.playSound("card_flip", "flip", 0, 0.25);
    card.mouseEnabled = false;

    //if both cards flipped, call resolve after delay
    if(cards_turned.length == 2){
      IsLocked = true;

      var IsCorrect = (cards_turned[0].myid == cards_turned[1].myid);
      if(IsCorrect){
        GameManager.consecutive_matches++;
        GameManager.pairs_found++;
        GameManager.score += oCONFIG.points_per_match * GameManager.consecutive_matches;;
        spLogEvent({event: "MATCH", score: GameManager.score, time: me.time_left});  
      }else{
        GameManager.consecutive_matches = 0;
        spLogEvent({event: "UNMATCH", score: GameManager.score, time: me.time_left});
      }
      setTimeout(me.doResolveFlip, 400);
    }


    //animate flip
    createjs.Tween.get(card, { override: true }).to({scaleX: 0}, 200, createjs.Ease.cubicIn).call(()=>{
      card.front.visible = true;
      card.back.visible = false;
    }).to({scaleX: card.myscale}, 200, createjs.Ease.cubicOut);
    stage.activeTweens.push(card);



  }

  //card(s) are flipped over, take next action when both are flipped
  this.doResolveFlip =  function(){
    trace("doResolveFlip()");
    if(cards_turned[0].myid == cards_turned[1].myid){
      me.doCorrect();
    }else{
      me.doWrong();
    }
  }

  //-------------------------
  // correct match
  //-------------------------
   this.doCorrect = function(){
      trace("doCorrect()");
      __snds.playSound("correct", "ui");

      //multiplier

      trace(GameManager.consecutive_matches);
      if(GameManager.consecutive_matches >= 2){
        let px = (cards_turned[1].x + cards_turned[0].x) / 2;
        let py = (cards_turned[1].y + cards_turned[0].y) / 2;
        let multiplier = frame.cards.addChild(new lib.multiplier());
        __utils.doText(multiplier.txt, "x" + GameManager.consecutive_matches);
        multiplier.x = px;
        multiplier.y = py;
        createjs.Tween.get(multiplier, { override: true }).to({y:py-50}, 1000, createjs.Ease.cubicOut);
        createjs.Tween.get(multiplier).wait(1000).to({alpha: 0}, 500).call(()=>{
          frame.cards.removeChild(multiplier);
        });
        stage.activeTweens.push(multiplier);
      }

      me.doUpdateScore();

      //remove matched pair from board
      me.doRemove(cards_turned[0]);
      me.doRemove(cards_turned[1]);

      //update count
      if(GameManager.pairs_found >= GameManager.pairs_count){
        me.doWin();
      }else{
        //unlock for next selection
        cards_turned = [];
        IsLocked=false;
      }
      stage.needUpdate = true;
  }


  //simply remove card
  this.doRemove =  function(card){
    createjs.Tween.get(card, {override: true})
    .to({scale: 0}, 200, createjs.Ease.cubicIn)
    .call(()=>{
      card.visible = false;
      card.front.visible = false;
      card.back.visible = false;
    })
    stage.activeTweens.push(card);
  }


  //-------------------------
  // wrong match
  //-------------------------

  this.doWrong =  function(){
    trace("doWrong()");
    __snds.playSound("wrong", "ui");
    me.doReturn(cards_turned[0]);
    me.doReturn(cards_turned[1]);

    setTimeout(()=>{
        cards_turned[0].mouseEnabled = true;
        cards_turned[1].mouseEnabled = true;
        IsLocked = false;
        cards_turned = [];
    }, 400);
  }


  this.doReturn = function(card){
    trace("doReturn() " );

    //return card
    createjs.Tween.get(card, {override: true})
    .to({scaleX: 0}, 200, createjs.Ease.cubicIn)
    .call(()=>{
      card.front.visible = false;
      card.back.visible = true;
    })
    .to({scaleX: card.myscale}, 200, createjs.Ease.cubicOut);

    stage.activeTweens.push(card);
  }





 





  this.doUpdateScore =  function(){

    let score_str = GameManager.score.toString();
    do{
      score_str = "0" + score_str;
    }while(score_str.length < 4)

    __utils.doText(frame.score_panel.txt, score_str);
    stage.needUpdate = true;
  }


  this.doTimerUpdate = function(time_left, percent_left, display_time){
    me.time_left = time_left;
    __utils.doText(frame.game_time.txt_m, display_time.m);
    __utils.doText(frame.game_time.txt_ss, display_time.ss);
    GameManager.display_time = display_time.m + ":" + display_time.ss;

    if(bonus_mode){
      let bonus_seconds = (bonus_start_time - me.time_left) * 0.001;
      let new_points = oCONFIG.bonus_points_per_second * bonus_seconds;
      bonus_start_time = me.time_left;
      GameManager.score = Math.min(final_level_score, GameManager.score + new_points);
      me.doUpdateScore();
    }
    stage.needUpdate = true;
  }



  this.doOutOfTime = function(){
    GameTimer.doStop();
  }


  this.doWin =  function(){
    trace("doWin()");
    IsPlaying=false;
    GameTimer.doStop();

   // __snds.stopSound("music");
    music_playing = null;

   GameManager.result = "win";
   GameManager.time_left = me.time_left;

    spLogEvent({event: "LEVEL_COMPLETE", level: GameManager.level, score: GameManager.score, time: me.time_left});

    __snds.playSound("next_level", "music", 0, 0.2);

    setTimeout(me.doStartBonus, 1000);
  }


  this.doStartBonus =  function(){
    let seconds_left = me.time_left * 0.001;
    bonus_points = Math.ceil(oCONFIG.bonus_points_per_second * seconds_left);
    bonus_start_time = me.time_left;
    final_level_score = GameManager.score + bonus_points;
    bonus_mode = true;
    GameTimer.doStartBonus();
  }


  this.doBonusComplete =  function(){
    GameTimer.doStop();
    bonus_mode=false;
    GameManager.score = final_level_score;
    me.doUpdateScore();
    var next_level = GameManager.level+1;

    frame.game_time.myx = oSTAGE.game_left - 120;
    frame.game_time.isOpened = false;
    createjs.Tween.get(frame.game_time).to({x: frame.game_time.myx}, 500, createjs.Ease.cubicIn);
    stage.activeTweens.push(frame.game_time);

    if(next_level <= oCONFIG.levels.length){
      setTimeout(()=>{
        me.doCreateLevel(next_level);
      },1000);
    }else{
      setTimeout(me.doWrapup, 500);
    }
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
    if (IsLocked) {return;}
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
    if (IsLocked) {return;}
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
    GameManager.score = GameManager.score_holder;
    spLogEvent({ event: "LEVEL_RESTART", score:GameManager.score, level: GameManager.level });
    BlitFader.doFadeOut(200, () => {
      SceneManager.doDestroy();
      SceneManager = new GameScene();
    });
  };

  this.doConfirmHome = function () {
    trace("doConfirmHome()");
    spLogEvent({ event: "LEVEL_QUIT", score:GameManager.score, level: GameManager.level });
    BlitFader.doFadeOut(200, () => {
      SceneManager.doDestroy();
      SceneManager = new TitleScene();
    });
  };

  this.doCancel = function () {
    IsLocked = false;
    GameTimer.doResume();
  };

  this.doDestroy = function () {

    GameTimer.doDestroy();

    stage.removeAllChildren();
    stage.enableMouseOver(0);
    me.forget = true;
    stage.needUpdate = true;
  };

  //------------------------
  // resize
  //------------------------

   this.doUpdateLayout =  function(){
    trace("doUpdateLayout");
    if(!IsReady){return;}

    let avail_width = oSTAGE.game_width - 40;
    let avail_height = oSTAGE.game_height - 200;

    let space_area = avail_width * avail_height;
    let space_ratio = avail_width / avail_height;

    let num_cards = cards.length;
    let card_area = 156 * 248;
    let card_ratio = 156 / 248;
    
    let area_per_card = Math.min((card_area * 0.5), (space_area / num_cards));
    let col_height = Math.min(124, Math.floor(Math.sqrt( area_per_card / card_ratio, 1)));
    let col_width = col_height * card_ratio;
    var scale = Math.min(((col_width) / 156), ((col_height) / 248)) * 0.95;

    var cols = Math.min(num_cards, Math.floor(avail_width / col_width));
    var rows = Math.ceil(num_cards / cols);
    let spaces = cols*rows;

    //adjust cols
    cols = Math.ceil(num_cards / rows);

    let col = 0;
    let row = 0;
    let spacing_x = col_width;
    let spacing_y = col_height;
    let starting_x = -(((cols-1) * 0.5) * spacing_x);
    let starting_y = -(((rows-1) * 0.5) * spacing_y);

    for(let i=0; i<cards.length; i++){
      var card = cards[i];
      card.myscale = scale;
      card.scale = scale;
      card.x = starting_x + (col * spacing_x);
      card.y = starting_y + (row * spacing_y);
      card.col = col;
      card.row = row;
      col++;
      if(col >= cols){
        col=0;
        row++;
      }
    }
  }


  this.doResizeUpdate = function () {

    frame.score_panel.x = oSTAGE.game_size.center_x;
    frame.score_panel.y = oSTAGE.game_top;

    frame.b_restart.x = oSTAGE.game_right - 75;
    frame.b_restart.y = oSTAGE.game_bottom - 10;
    frame.b_home.x = oSTAGE.game_right - 10;
    frame.b_home.y = oSTAGE.game_bottom - 10;

    frame.game_time.x = (frame.game_time.isOpened) ? oSTAGE.game_left + 14 : oSTAGE.game_left - 120;
    frame.game_time.y = oSTAGE.game_bottom - 10;

    frame.messages.x = oSTAGE.game_center_x;
    frame.messages.y = oSTAGE.game_center_y;

    frame.cards.x = oSTAGE.game_center_x;
    frame.cards.y = oSTAGE.game_center_y;


    //recache
    if (me.scale != oSTAGE.scale) {
    }

    me.doUpdateLayout();

    frame.x = oSTAGE.game_width_margins;
    frame.y = oSTAGE.game_height_margins;
    me.scale = oSTAGE.scale;
  };

  me.doInit();
};
