var RecapScene = function () {
  trace("RecapScene()");

  var me = this;
  var canvas = document.getElementById("canvas_screens");
  var stage = BlitStage(canvas, { webgl: false });
  var frame = stage.addChild(new lib.scene_recap());

  var IsLocked = true;
  var prompt_attempt = 0;

  var buildComplete = false;

  var timeout;

  //---------------------------
  // init
  //---------------------------

  this.doInit = function () {
    IsLocked = false;
    me.forget = false;
    update_queue.push(me);
    me.doResizeUpdate();
    RESIZER.needUpdate = true;

    var delay = 500;

     //header
    __utils.doText(frame.header.txt, oLANG.results_header);

      var hdr_lang = oLANG.results_win;
      __utils.doText(frame.result_block.txt_hrd, hdr_lang);

      var msg_lang = oLANG.result_win_msg;
      
      var response = JSON.parse(JSON.stringify(msg_lang));
      var response_value =  response.value;
      response.value = __utils.doSubText(response.value, "{*score*}", GameManager.score);
      __utils.doText(frame.result_block.txt_msg, response);


   




    //play button
    __utils.doText(frame.b_replay.txt, oLANG.replay);
    frame.b_replay.visible = false;
    frame.b_replay.helper = new __utils.ButtonHelper(stage,frame.b_replay,"norm","over");
    frame.b_replay.addEventListener("click", me.doChooseReplay);

    frame.b_replay.y = oSTAGE.game_bottom + 100;
    createjs.Tween.get(frame.b_replay, { override: true }).wait(delay).set({ visible: true }).to({ y: frame.b_replay.myy }, 500, createjs.Ease.cubicOut);
    stage.activeTweens.push(frame.b_replay);
    delay += 200;

    //play button
    __utils.doText(frame.b_play.txt, oLANG.continue);
    frame.b_play.visible = false;
    frame.b_play.helper = new __utils.ButtonHelper(stage,frame.b_play,"norm","over");
    frame.b_play.addEventListener("click", me.doChooseContinue);

    frame.b_play.y = oSTAGE.game_bottom + 100;
    createjs.Tween.get(frame.b_play, { override: true }).wait(delay).set({ visible: true }).to({ y: frame.b_play.myy }, 500, createjs.Ease.cubicOut);
    stage.activeTweens.push(frame.b_play);

 __snds.playSound("win", "music", 0, 0.2);
 //__snds.playSound("music_title_loop", "music", -1, .5);
    BlitFader.doFadeIn(500);
  };


  //---------------------------------
  // User Actions
  //---------------------------------

  this.doChooseContinue = function (o) {
    if (IsLocked) {
      return;
    }
    IsLocked = true;
    __snds.playSound("snd_click", "ui");

    var progress_to_next = false; 
    var next_level = GameManager.level+1;

    let num_puzzles = Math.min(puzzles.length, oCONFIG.levels);
    
    if(next_level <= num_puzzles && oUSER.progress[next_level-1].unlocked){
        progress_to_next=true;
    }


      let goto_next_action =  function(){
        GameManager.level = next_level;
        SceneManager.doDestroy();
        doFinishLoading(()=>{
          SceneManager.doDestroy();
          SceneManager = new GameScene();
        });
      }
      
      let goto_home_action =  function(){
        SceneManager.doDestroy();
        SceneManager = new TitleScene();
      }

      let action = (progress_to_next) ? goto_next_action : goto_home_action;
      BlitFader.doFadeOut(200, action);

  };





  this.doChooseReplay = function (o) {
    if (IsLocked) {
      return;
    }
    IsLocked = true;
    __snds.playSound("snd_click", "ui");

    spLogEvent({event: "LEVEL_RESTART"});

    BlitFader.doFadeOut(200, () => {
      SceneManager.doDestroy();
      SceneManager = new GameScene();
    });
  };

  this.doDestroy = function () {
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

    frame.b_play.myy = frame.b_play.y = oSTAGE.game_bottom - 20;
    frame.b_play.x = oSTAGE.game_size.center_x;

    frame.b_replay.myy = frame.b_replay.y = oSTAGE.game_bottom - 80;
    frame.b_replay.x = oSTAGE.game_size.center_x;

    frame.result_block.x = oSTAGE.game_size.center_x;

    let m_top = (oSTAGE.game_top + 80);
    let m_bottom = (oSTAGE.game_bottom - 150);
    let myy = m_top + ((m_bottom - m_top) * 0.5);

    frame.result_block.y = myy;

    //recache
    if (me.scale != oSTAGE.scale) {
    }

    frame.x = oSTAGE.game_width_margins;
    frame.y = oSTAGE.game_height_margins;
    me.scale = oSTAGE.scale;
  };

  me.doInit();
};
