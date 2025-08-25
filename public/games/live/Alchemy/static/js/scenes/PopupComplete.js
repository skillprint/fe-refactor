var PopupComplete = function (o = {}) {
  var me = this;

  var canvas = document.getElementById("canvas_popups");
  var stage = BlitStage(canvas, { webgl: false });
  var frame = stage.addChild(new lib.popup_complete());
  var IsLocked = true;

  var callback_ok = o.callback_ok || function () {};

  //---------------------------
  // init
  //---------------------------

  this.doInit = function () {
    me.forget = false;
    update_queue.push(me);
    me.doResizeUpdate();
    RESIZER.needUpdate = true;

    __utils.doText(frame.panel.txt_hdr, oLANG[o.hdr],  {verticalAlign:"top"});
    __utils.doText(frame.panel.txt_msg, oLANG[o.msg],  {verticalAlign:"top"});
    __utils.doText(frame.panel.b_ok.txt, oLANG[o.ok]);

    frame.panel.txt_msg.y = frame.panel.txt_hdr.y +  frame.panel.txt_hdr.getMeasuredHeight();
    frame.panel.b_ok.y = frame.panel.txt_msg.y +  frame.panel.txt_msg.getMeasuredHeight() + 10;

    frame.panel.b_ok.helper = new __utils.ButtonHelper(stage,frame.panel.b_ok,"norm","over");
    frame.panel.b_ok.addEventListener("click", me.doChooseOk);
    canvas.style.display = "block";

    frame.panel.b_ok.myy = frame.panel.b_ok.y;

    frame.panel.txt_hdr.visible = false;
    frame.panel.txt_hdr.alpha = 0;

    frame.panel.txt_msg.visible = false;
    frame.panel.txt_msg.alpha = 0;

    let delay = 0;

    createjs.Tween.get(frame.panel.txt_hdr, { override: true }).wait(delay).set({visible: true}).to({ alpha:1 }, 500);
    stage.activeTweens.push(frame.panel.txt_hdr);
    delay+=500;

    createjs.Tween.get(frame.panel.txt_msg, { override: true }).wait(delay).set({visible: true}).to({ alpha:1 }, 500);
    stage.activeTweens.push(frame.panel.txt_msg);
    delay+=500;

    frame.panel.b_ok.visible = false;
    frame.panel.b_ok.y = oSTAGE.game_bottom + 10;
    createjs.Tween.get(frame.panel.b_ok, { override: true }).wait(delay).set({visible: true}).to({y:frame.panel.b_ok.myy}, 500, createjs.Ease.cubicOut);
    stage.activeTweens.push(frame.panel.b_ok);



  };

  this.doChooseOk = function () {
    __snds.playSound("snd_click_2", "ui");
    me.doDestroy();
    callback_ok();
  };

  this.doDestroy = function () {
    stage.removeAllChildren();
    stage.enableMouseOver(0);
    me.forget = true;
    stage.needUpdate = true;
    canvas.style.display = "none";
  };

  //------------------------
  // resize
  //------------------------

  this.doResizeUpdate = function () {
    //recache
    if (me.scale != oSTAGE.scale) {
    }

    frame.panel.x = oSTAGE.game_center_x;
    frame.panel.y = oSTAGE.game_center_y;

    frame.x = oSTAGE.game_width_margins;
    frame.y = oSTAGE.game_height_margins;
    me.scale = oSTAGE.scale;
  };

  me.doInit();
};
