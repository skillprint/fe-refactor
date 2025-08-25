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
    __utils.doText(frame.header.txt, oLANG.results_header, {verticalAlign:"middle"});

    __utils.doText(frame.result_block.txt_correct, GameManager.score_correct.toString());
    __utils.doText(frame.result_block.txt_wrong, GameManager.score_wrong.toString());

    let total_score = GameManager.score_wrong + GameManager.score_correct;
    let correct = GameManager.score_correct;
    let avg = (total_score!=0) ? Math.floor((correct / total_score) * 100) : 0;


    __utils.doText(frame.result_block.txt_avg, avg.toString() + "%");

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

    GameWorld.doClearObjects();
    GameWorld.scene.background = oASSETS.background;


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
    BlitFader.doFadeOut(200, () => {
      SceneManager.doDestroy();
      SceneManager = new TitleScene();
    });
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
      SceneManager.doInit();
    });
  };

  this.doDestroy = function () {
    stage.removeAllChildren();
    stage.enableMouseOver(0);
    GameWorld.doClearObjects();
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

    frame.b_replay.myy = frame.b_replay.y = oSTAGE.game_bottom - 90;
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
