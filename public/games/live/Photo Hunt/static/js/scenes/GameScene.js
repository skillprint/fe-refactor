

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

  me.differences_count = 0;
  me.score_found = 0;
  me.time_left = 0
  GameManager.result = null;

  var IsReady = false;
  var IsPlaying = false;

  var checkmarks = [];

  var missed_click_times = [];
  var IsTilt = false;

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

    //stop any music
    __snds.stopSound("music");
    music_playing = null;

    spLogEvent({event: "LEVEL_START", level: GameManager.level});

    //new game timer
    timer_back = new createjs.Shape();
    timer_back.alpha = 0.5;
    timer_back.graphics.beginFill("black").drawRoundRect(0,0,512,8,3);

    timer_bar = new createjs.Shape();
    timer_bar.graphics.beginFill("#E8528B").drawRoundRect(0,0,512,8,3);
    frame.timer_bar.addChild(timer_back, timer_bar);

    photo_frame_1 = new createjs.Shape();
    photo_frame_1.graphics.setStrokeStyle(4).beginStroke("#ffffff").drawRoundRect(0,0,100,100,20);
    photo_frame_2 = new createjs.Shape();
    photo_frame_2.graphics.setStrokeStyle(4).beginStroke("#ffffff").drawRoundRect(0,0,100,100,20);


    //reset /  quit buttons
    frame.b_restart.helper = new __utils.ButtonHelper(stage,frame.b_restart,"norm","over");
    frame.b_restart.addEventListener("click", me.doChooseRestart);

    frame.b_home.helper = new __utils.ButtonHelper(stage,frame.b_home,"norm","over");
    frame.b_home.addEventListener("click", me.doChooseHome);

  //__utils.doText(frame.ready.txt, oLANG.ready);


    let response = JSON.parse(JSON.stringify(oLANG.level_popup));
    response.value = __utils.doSubValue(response.value, GameManager.level);
    __utils.doText(frame.ready.txt, response);


  //__utils.doText(frame.ready.txt, oLANG.level_popup);


  __utils.doText(frame.level_tag.txt, GameManager.level.toString());
  __utils.doText(frame.level_tag.txt_level, oLANG.level_tag);
  frame.level_tag.visible = false;
    
    //new game
    frame.visible=false;
    GameManager.doInit();
    GameManager.doLoadPuzzle(me.doPuzzleReady);
  };

 

  this.doPuzzleReady =  function(){
    trace("doPuzzleReady");
    trace(puzzle);

    frame.visible=true;

    GameTimer = new BlitTimer({"seconds_on_clock": puzzle.time, "callback_update": me.doTimerUpdate, "callback_outoftime": me.doOutOfTime});
    GameTimer.doFirstUpdate();
   
    //images
    var img_1 = new createjs.Shape();
    img_1.graphics.setStrokeStyle(6).beginStroke("#ffffff").beginBitmapFill(GameManager.image_a, "no-repeat").drawRoundRect(0,0,512,512,10);
    frame.image_1.img = frame.image_1.addChild(img_1);

    var img_2 = new createjs.Shape();
    img_2.graphics.setStrokeStyle(6).beginStroke("#ffffff").beginBitmapFill(GameManager.image_b, "no-repeat").drawRoundRect(0,0,512,512,10);
    frame.image_2.img = frame.image_2.addChild(img_2);

    //button groups
    var grp_1 = new createjs.Container();
    frame.image_1.grp = frame.image_1.addChild(grp_1);

    var grp_2 = new createjs.Container();
    frame.image_2.grp = frame.image_2.addChild(grp_2);

    me.differences_count = puzzle.differences.length;

    __utils.doText(frame.game_prog.txt_found, "0");
    __utils.doText(frame.game_prog.txt_total, me.differences_count);

    var response = JSON.parse(JSON.stringify(oLANG.game_header));
    response.value = __utils.doSubValue(response.value, me.differences_count);
    __utils.doText(frame.header.txt, response);

    img_1.addEventListener("click", me.doMiss);
    img_2.addEventListener("click", me.doMiss);
    checkmarks = [];
   
    for(let i=0; i < puzzle.differences.length; i++){
      let difference = puzzle.differences[i];

      //use square if no hit area
      if(difference.hitArea.length == 0){
        difference.hitArea.push(difference.box[0], difference.box[1]);
        difference.hitArea.push(difference.box[0] + difference.box[2], difference.box[1]);
        difference.hitArea.push(difference.box[0] + difference.box[2], difference.box[1] + difference.box[3]);
        difference.hitArea.push(difference.box[0], difference.box[1] + difference.box[3]);
      }
      //use center of square if no center
      if(difference.center.length == 0){
        difference.center.push(difference.box[0] + (difference.box[2] * 0.5));
        difference.center.push(difference.box[1] + (difference.box[3] * 0.5));
      }

      //hit areas
      var coords = difference.hitArea.slice(); 
      var hit = new createjs.Shape();
      hit.graphics.beginFill("#000");
      hit.graphics.moveTo(coords.shift(), coords.shift());
      do{
        hit.graphics.lineTo(coords.shift(), coords.shift());
      }while(coords.length > 0);

      //checkmarks
      var checkmark_1 = new lib.checkmark();
      checkmark_1.mouseEnabled = false;
      checkmark_1.x = difference.center[0];
      checkmark_1.y = difference.center[1];
      checkmark_1.visible = false;

      var checkmark_2 = new lib.checkmark();
      checkmark_2.mouseEnabled = false;
      checkmark_2.x = difference.center[0];
      checkmark_2.y = difference.center[1];
      checkmark_2.visible = false;

      checkmarks.push(checkmark_1, checkmark_2);

      //buttons
      var button_1 = new createjs.Shape();   
      button_1.myid = i;
      button_1.hitArea = hit.clone(true);
      button_1.addEventListener("click", me.doSelect);
      frame.image_1["button_" + i] = grp_1.addChild(button_1);
      frame.image_1["checkmark_" + i] = grp_1.addChild(checkmark_1);

      //buttons
      var button_2 = new createjs.Shape();   
      button_2.myid = i;
      button_2.hitArea = hit.clone(true);
      button_2.addEventListener("click", me.doSelect);
      frame.image_2["button_" + i] = grp_2.addChild(button_2);
      frame.image_2["checkmark_" + i] = grp_2.addChild(checkmark_2);
    }

    IsReady = true;
    me.doPuzzleLayout();
    BlitFader.doFadeIn(500, me.doReady);
  }


  this.doMiss =  function(){
      trace("doMiss()");
      if(!IsPlaying || IsTilt){return;}
    __snds.playSound("wrong", "ui");
    spLogEvent({event: "TAP", condition:false, difficulty:0, level: GameManager.level, guess: me.score_found, time: me.time_left});


    var now = performance.now();
    missed_click_times.push(now);

    if(missed_click_times.length > oCONFIG.tilt_misses){
      if(missed_click_times[0] >= now - (oCONFIG.tilt_seconds * 1000)){
        me.doTilt();
      }
      missed_click_times.shift();
    }

    
  }


  this.doTilt = function(){
    trace("doTilt");
    IsTilt = true;
    __utils.doText(frame.ready.txt, oLANG.tilt);
    frame.ready.alpha = 1;
    frame.ready.visible=true;
    stage.needUpdate = true;
    setTimeout(me.doEndTilt, 1000);
  }

  this.doEndTilt =  function(){
    trace("doEndTilt");
    IsTilt = false;
    createjs.Tween.get(frame.ready, {override: true}).to({alpha: 0}, 500).call(()=>{frame.ready.visible=false;});
    stage.activeTweens.push(frame.ready);


  }



   this.doSelect = function(e){
      trace("doSelect()");
      if(!IsPlaying || IsTilt){return;}

      var id = e.currentTarget.myid;
      var difference = puzzle.differences[id];

    __snds.playSound("correct", "ui");

      missed_click_times = [];

      //disable
      frame.image_1["button_" + id].mouseEnabled = false;
      frame.image_1["button_" + id].mouseChildren = false;
      frame.image_2["button_" + id].mouseEnabled = false;
      frame.image_2["button_" + id].mouseChildren = false;
 
      let check_1 = frame.image_1["checkmark_" + id];
      let check_2 = frame.image_2["checkmark_" + id];

      check_1.visible = true;
      check_1.scale = 1.5;
      check_2.visible = true;
      check_2.scale = 1.5;

      createjs.Tween.get(check_1, {override: true}).to({scale: 1}, 1200, createjs.Ease.getElasticOut(1, .8));
      stage.activeTweens.push(check_1);

      createjs.Tween.get(check_2, {override: true}).to({scale: 1}, 1200, createjs.Ease.getElasticOut(1, .8));
      stage.activeTweens.push(check_2);

      me.score_found++;

      __utils.doText(frame.game_prog.txt_found, me.score_found);

      spLogEvent({event: "TAP", condition:true, difficulty: difference.difficulty, level: GameManager.level, guess: me.score_found, time: me.time_left});
  
      //update count
      if(me.score_found >= me.differences_count){
        me.doWin();
      }

      stage.needUpdate = true;


  }




  this.doPuzzleLayout =  function(){
    trace("doPuzzleLayout");
    if(!IsReady){return;}

    let avail_width = oSTAGE.game_width - 10;
    let avail_height = oSTAGE.game_height - 150;
    let landscape = (avail_width >= avail_height); 
    let mysize;
    let timer_y;

    //groups;
    if(landscape){
        mysize = Math.min(avail_height ,(avail_width - 5) * 0.5);
        frame.image_1.y = frame.image_2.y = oSTAGE.game_center_y - (mysize*0.5) - 10;
        frame.image_1.x = oSTAGE.game_center_x  - 2.5 - (mysize);
        frame.image_2.x = oSTAGE.game_center_x  + 2.5;
        frame.image_1.grp.scale = (mysize / 512);
        frame.image_2.grp.scale = (mysize / 512);
        timer_width = (mysize * 2) + 5;
        timer_y = frame.image_1.y +  mysize + 8;
    }else{ 
        mysize = Math.min(avail_width ,(avail_height - 5) * 0.5);
        frame.image_1.x = frame.image_2.x = oSTAGE.game_center_x - (mysize*0.5);
        frame.image_1.y = oSTAGE.game_center_y - 2.5 - (mysize) - 10;
        frame.image_2.y = oSTAGE.game_center_y + 2.5 - 10;
        frame.image_1.grp.scale = (mysize / 512);
        frame.image_2.grp.scale = (mysize / 512);
        timer_width = (mysize);
        timer_y = frame.image_2.y +  mysize + 8;
    }

    let m = new createjs.Matrix2D();
    m.scale((mysize / 512), (mysize / 512));
    
    frame.image_1.img.graphics.clear();
    frame.image_1.img.graphics.setStrokeStyle(3).beginStroke("#ffffff").beginBitmapFill(GameManager.image_a, "no-repeat", m).drawRoundRect(0,0,mysize,mysize,10);
    frame.image_2.img.graphics.clear();
    frame.image_2.img.graphics.setStrokeStyle(3).beginStroke("#ffffff").beginBitmapFill(GameManager.image_b, "no-repeat", m).drawRoundRect(0,0,mysize,mysize,10);
 
    //timer bar
    frame.timer_bar.x = oSTAGE.game_center_x - (timer_width * 0.5);
    frame.timer_bar.y = timer_y;

    timer_back.graphics.clear();
    timer_back.graphics.beginFill("#00").drawRoundRect(0,0,timer_width,8,3);

    timer_bar.graphics.clear();
    timer_bar.graphics.beginFill("#FAE553").drawRoundRect(0,0, Math.max(6, timer_width * GameTimer.percent_left), 8,3);

  }



  this.doReady =  function(){
    frame.ready.visible=true;
    setTimeout(me.doGo, 1000);
  }

  this.doGo =  function(){
    trace("doGo()");
    IsPlaying = true;
    GameManager.result = null;
     __snds.playSound("music_game_loop", "music", -1, .5);
    GameTimer.doStart();

    createjs.Tween.get(frame.ready, {override: true}).to({alpha: 0}, 500).call(()=>{frame.ready.visible=false;});
    stage.activeTweens.push(frame.ready);

    GameManager.display_time = "0";


  }

  this.doTimerUpdate =  function(time_left, percent_left, display_time){
    me.time_left = time_left;
    timer_bar.graphics.clear();
    timer_bar.graphics.beginFill("#FAE553").drawRoundRect(0,0, Math.max(6, (timer_width * percent_left)), 8, 3);
    stage.needUpdate = true;

     __utils.doText(frame.game_time.txt_m, display_time.m);
     __utils.doText(frame.game_time.txt_ss, display_time.ss);

      GameManager.display_time = display_time.m + ":" + display_time.ss;


  }


  this.doOutOfTime = function(){
    trace("doOutOfTime()");
     me.time_left = 0;
    IsPlaying=false;
    GameTimer.doStop();

    GameManager.result = "lose";
    GameManager.score_found = me.score_found;

    __utils.doText(frame.game_time.txt_m, "0");
    __utils.doText(frame.game_time.txt_ss, "00");

     spLogEvent({event: "LEVEL_FAILED", level: GameManager.level, guess: me.score_found, time: me.time_left});

    __snds.playSound("timeup", "ui");
    __snds.stopSound("music");
   music_playing = null;
   
    setTimeout(me.doWrapup, 1000);

  }


  this.doWin =  function(){
    trace("doWin()");
    IsPlaying=false;
    GameTimer.doStop();

    __snds.stopSound("music");
    music_playing = null;

   GameManager.result = "win";
   GameManager.time_left = me.time_left;

    spLogEvent({event: "LEVEL_COMPLETE", level: GameManager.level, guess: me.score_found, time: me.time_left});

    oUSER.progress[GameManager.level-1].best = Math.max((oCONFIG.seconds_on_clock - me.time_left), oUSER.progress[GameManager.level-1].best);
    

    var next_level = GameManager.level+1;
    if(next_level <= oUSER.progress.length && !oUSER.progress[next_level-1].unlocked){
      oUSER.progress[next_level-1].unlocked = true;
      oUSER.progress[next_level-1].new_unlock = true;

      if(next_level == oUSER.progress.length){
        spLogEvent({event: "ALL_LEVELS_COMPLETED"});
      }
    }

    BlitSaver.doSaveData("user", oUSER);
    setTimeout(me.doAnimateWin, 1000);
  }


  this.doAnimateWin =  function(){
    __snds.playSound("winner", "ui");
    var delay = 0;

    for(let i=0; i<checkmarks.length; i+=2){
      let check_1 = checkmarks[i];
      let check_2 = checkmarks[i+1];
    
      createjs.Tween.get(check_1, {override: true}).wait(delay).to({scale:1.5}, 100, createjs.Ease.cubicOut).to({scale: 1}, 1200, createjs.Ease.getElasticOut(1, .8));
      stage.activeTweens.push(check_1);

      createjs.Tween.get(check_2, {override: true}).wait(delay).to({scale:1.5}, 100, createjs.Ease.cubicOut).to({scale: 1}, 1200, createjs.Ease.getElasticOut(1, .8));
      stage.activeTweens.push(check_2);

      delay+=200;


    }

    setTimeout(me.doWrapup, delay+500);
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
      SceneManager.doDestroy();
      SceneManager = new GameScene();
    });
  };

  this.doConfirmHome = function () {
    trace("doConfirmHome()");
    spLogEvent({ event: "LEVEL_QUIT", level: GameManager.level });
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

  this.doResizeUpdate = function () {

    frame.header.x = oSTAGE.game_size.center_x;
    frame.header.y = oSTAGE.game_top;
  
    frame.ready.x = oSTAGE.game_center_x;
    frame.ready.y = oSTAGE.game_center_y;

    frame.b_restart.x = oSTAGE.game_right - 75;
    frame.b_restart.y = oSTAGE.game_bottom - 10;
    frame.b_home.x = oSTAGE.game_right - 10;
    frame.b_home.y = oSTAGE.game_bottom - 10;

    frame.game_prog.x = oSTAGE.game_left + 15;
    frame.game_prog.y = oSTAGE.game_bottom - 14;

    frame.game_time.x = oSTAGE.game_left + 140;
    frame.game_time.y = oSTAGE.game_bottom - 14;

    frame.level_tag.x = oSTAGE.game_right - 5;
    frame.level_tag.y = oSTAGE.game_top + 2;

    //recache
    if (me.scale != oSTAGE.scale) {
    }

    me.doPuzzleLayout();

    frame.x = oSTAGE.game_width_margins;
    frame.y = oSTAGE.game_height_margins;
    me.scale = oSTAGE.scale;
  };

  me.doInit();
};
