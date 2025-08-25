function GlobalQuit(target, options) {
  var me = this;

  //create or reuse stage
  var canvas = document.getElementById(target);
  var stage = canvas.my_stage || new createjs.Stage(canvas);

  stage.enableMouseOver(0);
  stage.tickChildren = false;
  stage.tickEnabled = false;
  stage.needUpdate = false;
  stage.snapToPixelsEnabled = true;
  stage.actives = [];
  stage.activeTweens = [];
  stage.enableDOMEvents(false);
  stage.forget = false;

  if (platform.isMobile) {
    createjs.Touch.enable(stage);
    stage.enableDOMEvents(false);
  } else {
    stage.enableDOMEvents(true);
    stage.enableMouseOver(20);
  }

  canvas.my_stage = stage;
  me.mouse_is_over = false;
  me.my_scale = 1;

  var IsLocked = false;

  var isPaused = false;

  canvas.onmouseover = function () {
    me.mouse_is_over = true;
  };

  canvas.onmouseout = function () {
    me.mouse_is_over = false;
  };

  this.doChooseQuit = function () {
    if (IsLocked) {
      return;
    }
    IsLocked = true;
    __snds.playSound("snd_popup", "ui");

    var Popup = new PopupConfirm({
      msg: "quit_confirm",
      callback_ok: me.doConfirm,
      callback_cancel: me.doCancel,
    });
  };

  this.doCancel = function () {
    IsLocked = false;
  };

  this.doConfirm = function () {
    spQuitApp();
  };

  //clear
  stage.removeAllChildren();
  var frame = stage.addChild(new lib.scene_global_quit());
  var elem = document.documentElement;
  var fullScreen_capable =
    elem.requestFullscreen ||
    elem.msRequestFullscreen ||
    elem.mozRequestFullScreen ||
    elem.webkitRequestFullscreen
      ? true
      : false;

  frame.b_quit.helper = new __utils.ButtonHelper(
    stage,
    frame.b_quit,
    "norm",
    "over"
  );
  frame.b_quit.helper.setSounds({
    mousedown: "snd_click",
    rollover: "snd_rollover",
  });
  frame.b_quit.addEventListener("click", me.doChooseQuit);

  //---------------------------
  // resizer
  //---------------------------

  this.doResizeUpdate = function () {
    var scale = oSTAGE.scale;

    //update canvas
    canvas.style.width = 52 * scale + "px";
    canvas.style.height = 52 * scale + "px";
    canvas.width = 52 * scale * __utils.getPixelRatio();
    canvas.height = 52 * scale * __utils.getPixelRatio();

    frame.b_quit.x = 52;
    frame.b_quit.y = 0;

    //update frame
    frame.my_scale = scale;
    me.my_scale = scale;

    //update stage
    stage.scale = scale * __utils.getPixelRatio();
    stage.needUpdate = true;
  };

  //---------------------------
  // start
  //---------------------------

  me.doResizeUpdate();
  var resize_updater = { doResizeUpdate: me.doResizeUpdate };
  update_queue.push(resize_updater);

  active_stages.push(stage);

  canvas.style.display = "block";
}
