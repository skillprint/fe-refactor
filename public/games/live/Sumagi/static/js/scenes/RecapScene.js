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


      __utils.doText(frame.result_block.txt_hdr, oLANG.complete_hdr);

      var msg_lang = oLANG.complete_msg;
      var response = JSON.parse(JSON.stringify(msg_lang));
      var response_value =  response.value;
      response.value = __utils.doSubText(response.value, "{*level*}", GameManager.level);
      response.value = __utils.doSubText(response.value, "{*score*}", GameManager.score);
      __utils.doText(frame.result_block.txt_msg, response, {verticalAlign:"top"});

    //play button
    __utils.doText(frame.b_play.txt, oLANG.replay);
    frame.b_play.visible = false;
    frame.b_play.helper = new __utils.ButtonHelper(stage,frame.b_play,"norm","over");
    frame.b_play.addEventListener("click", me.doChooseContinue);

    frame.b_play.y = oSTAGE.game_bottom + 100;
    createjs.Tween.get(frame.b_play, { override: true }).wait(delay).set({ visible: true }).to({ y: frame.b_play.myy }, 500, createjs.Ease.cubicOut);
    stage.activeTweens.push(frame.b_play);

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

      let goto_home_action =  function(){
        SceneManager.doDestroy();
        SceneManager = new TitleScene();
      }

      BlitFader.doFadeOut(200, goto_home_action);

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

    frame.result_block.x = oSTAGE.game_center_x;
    frame.result_block.y = oSTAGE.game_center_y;

    frame.b_play.myy = frame.b_play.y = oSTAGE.game_bottom - 20;
    frame.b_play.x = oSTAGE.game_center_x;

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
