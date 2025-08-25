var SortingGameManager = function () {
  var me = this;

  me.score_correct = 0;
  me.score_wrong = 0;

  var updateFunction = () => {};
  var IsLocked = false;
  var inputListener;
  var box_1, box_2;
  me.boxes;
  var want_box;
  me.click_pending = false;
  var GameTimer;
  me.IsPlaying = false;

  var isOutOfTime = false;
  var mouse = new THREE.Vector2();
  var raycaster = new THREE.Raycaster();

  var match_type = "shape";
  var fruit;
  var fruit_name;

  var turn_timer_start = 0;

  this.doInit = function () {
    __snds.stopSound("music");
    music_playing = null;

    spLogEvent({event: "LEVEL_START"});


    me.score_correct = 0;
    me.score_wrong = 0;

    updateFunction = () => {};

    doSetMaterialOverrides();

    me.forget = false;

    GameWorld.cam_target = new THREE.Vector3(0, 0, 0);
    GameWorld.cam_pos = new THREE.Vector3(0, 0, 80);
    GameWorld.camera.position.set(GameWorld.cam_pos.x,GameWorld.cam_pos.y,GameWorld.cam_pos.z);
    GameWorld.camera.lookAt(GameWorld.cam_target.x,GameWorld.cam_target.y,GameWorld.cam_target.z);
    GameWorld.cam_dist = GameWorld.camera.position.distanceTo(GameWorld.cam_target);
    GameWorld.min_focus_width = 30;
    GameWorld.min_focus_height = 20;
    GameWorld.max_focus_width = 32;
    GameWorld.max_focus_height = 25;
    GameWorld.doClearObjects();


    GameGUI.doInitGameUI();
    GameGUI.doInitMessages();
    GameGUI.doUpdateCorrect(0);
    GameGUI.doUpdateWrong(0);
    GameGUI.doUpdateTimer(1);


    document.getElementById("canvas_screens").style.display = "none";
    
    RESIZER.doUpdateNow();
    GameWorld.actives.push(me);

    me.boxes = [];
    box_1 = new GameBox(1, "left"); 
    box_2 = new GameBox(2, "right");
    want_box = 0;

    GameTimer = new BlitTimer({"seconds_on_clock": oCONFIG.seconds_on_clock, "callback_update": me.doTimerUpdate, "callback_outoftime": me.doOutOfTime});

    RESIZER.w=0;
    BlitFader.doFadeIn(500, me.doReady);

    IsLocked = false;

    //button listener
    inputListener = {};
    inputListener.forget = false;
    inputListener.doUpdate = me.doCheckInput;
    GameWorld.actives.push(inputListener);
  };

  var home_is_over = false;


  this.doCheckInput = function () {
    
    if(IsLocked) {
      me.click_pending = false;
      return;
    }

    let over_quit = false;
    let offset_x, offset_y;

    want_box = 0;

    if(BlitInputs.click_pending) {
      BlitInputs.click_pending = false;

      //check for buttons
      offset_x = Math.abs(BlitInputs.mouse_x - (oSTAGE.game_width - 40));
      offset_y = Math.abs(BlitInputs.mouse_y - (oSTAGE.game_height - 35));
      if (offset_x <= 30 && offset_y <= 26) {
        over_quit = true;
      }
      if(over_quit) {
        me.doChooseHome();
        return;
      }

      //check for box selection
      mouse.x = +(BlitInputs.mouse_x / oSTAGE.game_width) * 2 -1;
      mouse.y = -(BlitInputs.mouse_y / oSTAGE.game_height) * 2 + 1;
      raycaster.setFromCamera(mouse, GameWorld.camera);
      const intersects = raycaster.intersectObjects(me.boxes);
      if(intersects.length > 0){
        want_box = intersects[0].object.parent.me.my_id;
      }
    }
  };



  this.doReady =  function(){


    GameGUI.doShowReady(me.doGo);

  }

  this.doGo = function () {
    __snds.playSound("music", "music", -1);
    me.IsPlaying =true;
    GameTimer.doStart();
    me.doPresentNext();
  };



  this.doPresentNext =  function(){
    if(!me.IsPlaying){return;}

    //find random item
    let r = __utils.getRandomInt(0, oCONFIG.items.length-1);
    let o = oCONFIG.items[r];
    let other, other_id;
    fruit_name = o.name;
    fruit = new GameFruit(o);

    //select type
    if(Math.random() < 0.45){
      match_type = (match_type == "shape") ? "color" : "shape";
    }

    if(match_type == "shape"){
      other_id = o.use_shape_with[__utils.getRandomInt(0, o.use_shape_with.length-1)];
    }else{
      other_id = o.use_color_with[__utils.getRandomInt(0, o.use_color_with.length-1)];
    }
    other = oCONFIG.items[other_id];

    //select correct
    let correct = (__utils.getRandomInt(0, 1) == 0) ? 1 : 2;

    switch(correct){
      case 1:
        box_1.doShow(o, match_type, true);
        box_2.doShow(other, match_type, false);
        break
      case 2:
        box_2.doShow(o, match_type, true);
        box_1.doShow(other, match_type, false);
        break;
    }
   

    me.doAwaitPlayerChoice();

  }

  this.doAwaitPlayerChoice = function () {
    trace("doAwaitPlayerChoice()");
    IsLocked = false;

    turn_timer_start = performance.now();
    
    updateFunction = function(){
      switch(want_box){
        case 1:
          if(box_1.is_correct){
            me.doPlayerCorrect(box_1);
          }else{
            me.doPlayerWrong(box_1);
          }
          updateFunction = null;
          break
        case 2:
          if(box_2.is_correct){
            me.doPlayerCorrect(box_2);

          }else{
            me.doPlayerWrong(box_2);
          }
          updateFunction = null;
          break;
      }
    };
  };


  this.doPlayerCorrect =  function(which){
    trace("doPlayerCorrect()");
    if(!me.IsPlaying){return;}

    __snds.playSound("correct", "ui");
    GameGUI.doShowResult("correct");

    let turn_time = performance.now() - turn_timer_start;
    spLogEvent({event: "TAP", success: "correct", matchType: match_type, whichFruit: fruit_name, responseTime: turn_time});

    fruit.doCorrect(which, ()=>{
      let selected_box = (which.my_id==1) ? box_1 :box_2;
      //selected_box.doClose();
      box_1.doClose();
      box_2.doClose();
      box_1.doHide();
      box_2.doHide();
      setTimeout(me.doPresentNext, 300);
    });

    me.score_correct++;
    GameGUI.doUpdateCorrect(me.score_correct);
  }



  this.doPlayerWrong =  function(which){
    trace("doPlayerWrong()");
    if(!me.IsPlaying){return;}

    __snds.playSound("wrong", "ui");
    GameGUI.doShowResult("wrong");

    let turn_time = performance.now() - turn_timer_start;
    spLogEvent({event: "TAP", success: "incorrect", matchType: match_type, whichFruit: fruit_name, responseTime: turn_time});

    box_1.doClose();
    box_2.doClose();

    fruit.doWrong(which, ()=>{
      box_1.doHide();
      box_2.doHide();
      setTimeout(me.doPresentNext, 300);
    });

    me.score_wrong++;
    GameGUI.doUpdateWrong(me.score_wrong);
    
  }

  this.doTimerUpdate =  function(time_left, percent){
    GameGUI.doUpdateTimer(percent);
  }



  this.doOutOfTime =  function(){
    trace("doOutOfTime()");
    __snds.playSound("timeup", "ui");
    __snds.stopSound("music");
    music_playing = null;


    me.IsPlaying = false;
    updateFunction = null;
    GameGUI.doUpdateTimer(0);
    GameTimer.doStop();
    box_1.doClose();
    box_2.doClose();
    
    /*
    fruit.doWrong(null, ()=>{
      box_1.doHide();
      box_2.doHide();
    });
    */

    GameGUI.doShowMessage("out_of_time", {pulse:true, animateIn:true});

    setTimeout(me.doWrapup, 2000);
  }




  this.doWrapup = function () {

    let total_score = GameManager.score_wrong + GameManager.score_correct;
    let correct = GameManager.score_correct;
    let avg = (total_score!=0) ? Math.floor((correct / total_score) * 100) : 0;

    spLogEvent({event: "LEVEL_COMPLETE", correct: GameManager.score_correct, incorrect: GameManager.score_wrong, average: avg});

    BlitFader.doFadeOut(100, () => {
      me.doDestroy();
      GameWorld.doClearObjects();
      GameGUI.doClear();
      document.getElementById("canvas_screens").style.display = "block";
      SceneManager = new RecapScene();
    });
    return;
  };

  this.doUpdate = function () {
    if (updateFunction) {
      updateFunction();
    }
  };

  this.doDestroy = function () {
    __snds.stopSound("music");
    GameTimer.doDestroy();
    inputListener.forget = true;
    me.forget = true;
  };






  //---------------------------------
  // User Actions
  //---------------------------------

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

  this.doConfirmHome = function(){
    GameTimer.doDestroy();
    spLogEvent({ event: "LEVEL_QUIT", level: GameManager.level });
    BlitFader.doFadeOut(200, () => {
      me.doDestroy();
      GameWorld.doClearObjects();
      GameGUI.doClear();
      document.getElementById("canvas_screens").style.display = "block";
      SceneManager = new TitleScene();
    });
  };

  this.doCancel = function () {
    IsLocked = false;
    GameTimer.doResume();
    BlitInputs.click_pending = false;
    me.click_pending = false;
  };
};
