
var GameScene = function () {
  trace("GameScene()");

  var me = this;
  var canvas = document.getElementById("canvas_screens");
  var stage = BlitStage(canvas, { webgl: false });
  var frame = stage.addChild(new lib.scene_game());
 
  var page;
 
  //tiles
  var IsLocked = true;
  var DrawMode = false;
  var IsPlaying = false;
  var IsReady = false;

  var IgnoreNext = false;

  var paintColor = {"r":0,"g":0,"b":0};

  var IsPopupActive = false;

  var inputListener = {};


  //gameworld stub for timer compatibility
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

    //document.body.style.backgroundImage = 'url("media/images/background.jpg")';

    me.forget = false;
    update_queue.push(me);
    RESIZER.doUpdateNow();
    RESIZER.w=0;

    IsReady=false;
    zoom = 1;

    //stop any music
    __snds.stopSound("music");
    music_playing = null;

    //reset /  quit buttons
    frame.b_restart.helper = new __utils.ButtonHelper(stage,frame.b_restart,"norm","over");
    frame.b_restart.addEventListener("click", me.doChooseRestart);

    frame.b_home.helper = new __utils.ButtonHelper(stage,frame.b_home,"norm","over");
    frame.b_home.addEventListener("click", me.doChooseHome);

    frame.b_save.helper = new __utils.ButtonHelper(stage,frame.b_save,"norm","over");
    frame.b_save.addEventListener("click", me.doChooseSave);

    frame.zoom_in.helper = new __utils.ButtonHelper(stage,frame.zoom_in,"norm","over");
    frame.zoom_in.addEventListener("click", me.doZoomIn);

    frame.zoom_out.helper = new __utils.ButtonHelper(stage,frame.zoom_out,"norm","over");
    frame.zoom_out.addEventListener("click", me.doZoomOut);

    frame.pencil.helper = new __utils.ButtonHelper(stage,frame.pencil,"norm","over");
    frame.pencil.addEventListener("click", me.doPopupColors);

    frame.button_undo.helper = new __utils.ButtonHelper(stage,frame.button_undo,"norm","over");
    frame.button_undo.addEventListener("click", me.doUndo);

     frame.button_redo.helper = new __utils.ButtonHelper(stage,frame.button_redo,"norm","over");
    frame.button_redo.addEventListener("click", me.doRedo);

    frame.coloring_page.mover = frame.coloring_page.addChild(new createjs.Container());

    //frame.coloring_page.shadow = frame.coloring_page.mover.addChild(new createjs.Shape());
    
    frame.coloring_page.img = frame.coloring_page.mover.addChild(new createjs.Shape());
   // frame.coloring_page.lines = frame.coloring_page.mover.addChild(new createjs.Shape());

    frame.coloring_page.img.mouseEnabled = false;

    //frame.coloring_page.texture.name = "page";
    frame.coloring_page.img.name = "page";
    //frame.coloring_page.lines.name = "page";

    GameManager.doLoadPage(me.doPageReady);
 
  };


  this.doPageReady =  function(canvas, segments){

    let natural_width = GameManager.paintCanvas.width;
    let natural_height = GameManager.paintCanvas.height;

    frame.coloring_page.img.x = -natural_width * 0.5;
    frame.coloring_page.img.y = -natural_height * 0.5;
    frame.coloring_page.img.graphics.clear();
    frame.coloring_page.img.graphics.beginBitmapFill(GameManager.displayCanvas, "no-repeat").drawRoundRect(0,0,natural_width,natural_height,10);

    me.doUpdateRedoButtons();

    IsReady = true;

    me.doResizePage();

    BlitInputs.click_pending = false;
    BlitInputs.release_pending = false;

    inputListener = {};
    inputListener.forget = false;
    inputListener.doUpdate = me.doUpdate;
    actives.push(inputListener);

    me.doPickColor(oUSER.color);

    GameManager.doRestoreCreateStack();
    GameManager.doRedraw();
    frame.coloring_page.img.graphics.clear();
    frame.coloring_page.img.graphics.beginBitmapFill(GameManager.displayCanvas, "no-repeat").drawRoundRect(0,0,GameManager.paintCanvas.width, GameManager.paintCanvas.height,10);
   
    stage.update();


    spLogEvent({event: "START_PUZZLE", puzzle: GameManager.puzzle_id, segments: GameManager.segments});

    setTimeout(me.doGo, 200);
  }

  this.doGo =  function(){
    BlitFader.doFadeIn(500);
    IsLocked = false;
  }



  this.doResizePage =  function(){
    if(!IsReady){return;}

    let natural_width = GameManager.paintCanvas.width;
    let natural_height = GameManager.paintCanvas.height;
    let vert_space = (oSTAGE.game_width- 240 > oSTAGE.game_height) ? 16 : 120;
    let avail_width = oSTAGE.game_width - 16;
    let avail_height = oSTAGE.game_height - vert_space;
    let myscale = Math.min(avail_width/natural_width, avail_height/natural_height);
    let my_width = myscale * natural_width;
    let my_height = myscale * natural_height;

    frame.coloring_page.x = oSTAGE.game_center_x;// - (my_width * 0.5);
    frame.coloring_page.y = oSTAGE.game_center_y;// - (my_height * 0.5);
    frame.coloring_page.myscale = myscale;
    frame.coloring_page.scale = myscale * zoom;

    frame.coloring_page.mover.force_bounds = {
      "x": -((natural_width * 0.5) + 10),
      "y": -((natural_width * 0.5) + 10),
      "width": natural_width + 20,
      "height": natural_width + 20,
    };

    //__utils.doCache(frame.coloring_page.mover, zoom);


  }


  var IsDragging = false;
  var IsScaling = false;
  var IsCoasting = false;

  var mover_x, mover_y, zoom;
  var drag_speed_x, drag_speed_y;
  var speed_x=0, speed_y=0;

  var zoom_levels = oCONFIG.zoom_levels;
  var zoom_level = 0;


  this.doZoomIn =  function(){

    zoom_level = Math.min(zoom_levels.length-1, zoom_level+1);
    zoom = zoom_levels[zoom_level];

    //__utils.doCache(frame.coloring_page.mover, zoom);

    createjs.Tween.get(frame.coloring_page, { override: true }).to({scale: frame.coloring_page.myscale * zoom }, 500, createjs.Ease.cubicOut);
    stage.activeTweens.push(frame.coloring_page);

  }

  this.doZoomOut=  function(){
    zoom_level = Math.max(0, zoom_level-1);
    zoom = zoom_levels[zoom_level];

    //__utils.doCache(frame.coloring_page.mover, zoom);

    createjs.Tween.get(frame.coloring_page, { override: true }).to({scale: frame.coloring_page.myscale * zoom }, 500, createjs.Ease.cubicOut);
    stage.activeTweens.push(frame.coloring_page);

    
  }


  var IsOnPage = false;

  var start_scale = 1.0;
  var start_zoom,start_dist,start_pos_1,start_pos_2,start_pos_mid;

  this.doUpdate =  function(){

    if(IsLocked){
      return;
    }

    //capture press
    if(BlitInputs.click_pending){
      BlitInputs.click_pending = false;
      mover_x = frame.coloring_page.mover.x;
      mover_y = frame.coloring_page.mover.y;
      IsCoasting = false;
      let obj = stage.getObjectUnderPoint(BlitInputs.mouse_x, BlitInputs.mouse_y);
      IsOnPage = (obj && obj.name == "page") ? true : false;
    }




    if(IsScaling){
      //scaling
      if(BlitInputs.touches.length == 2){
        let cur_pos_1 = {"x": BlitInputs.touches[0].my_x, "y": BlitInputs.touches[0].my_y};
        let cur_pos_2 = {"x": BlitInputs.touches[1].my_x, "y": BlitInputs.touches[1].my_y};
        let cur_dist = __utils.doGetDistance(cur_pos_1.x, cur_pos_1.y, cur_pos_2.x, cur_pos_2.y);
        let cur_pos_mid = {"x": (cur_pos_1.x + cur_pos_2.x) * 0.5, "y": (cur_pos_1.y + cur_pos_2.y) * 0.5};

        let new_scale = (start_scale / start_dist) * cur_dist;
        let new_zoom = (start_zoom / start_dist) * cur_dist;
        zoom = new_zoom;
        frame.coloring_page.scale = frame.coloring_page.myscale * zoom;

        
      }else{
        IgnoreNext = true;
        IsScaling = false;
      }

    }else if(IsOnPage && BlitInputs.touches.length == 2){
        //start scaling
        start_scale = frame.coloring_page.scale;
        start_pos_1 = {"x": BlitInputs.touches[0].start_x, "y": BlitInputs.touches[0].start_y};
        start_pos_2 = {"x": BlitInputs.touches[1].start_x, "y": BlitInputs.touches[1].start_y};
        start_dist = __utils.doGetDistance(start_pos_1.x, start_pos_1.y, start_pos_2.x, start_pos_2.y);
        start_pos_mid = {"x": (start_pos_1.x + start_pos_2.x) * 0.5, "y": (start_pos_1.y + start_pos_2.y) * 0.5};
        start_zoom = zoom;
        IsScaling = true;

    }else if(BlitInputs.mouse_is_down){

      //dragging?
      let drag_dist = __utils.doGetDistance(BlitInputs.mouse_start_x, BlitInputs.mouse_start_y, BlitInputs.mouse_x, BlitInputs.mouse_y); 
      if(IsDragging){
        let page_scale = frame.coloring_page.scale;
        let move_x = BlitInputs.mouse_x - BlitInputs.mouse_start_x;
        let move_y = BlitInputs.mouse_y - BlitInputs.mouse_start_y;
        let new_x = mover_x + (move_x * (1.0/page_scale)); 
        let new_y = mover_y + (move_y * (1.0/page_scale)); 
        speed_x = new_x - frame.coloring_page.mover.x;
        speed_y = new_y - frame.coloring_page.mover.y;
        frame.coloring_page.mover.x = new_x;
        frame.coloring_page.mover.y = new_y;
        stage.needUpdate = true;
      }else if(drag_dist>2){
        IsDragging = true;
      }


    }else if(IsCoasting){

        //coasting after drag
        frame.coloring_page.mover.x += speed_x;
        frame.coloring_page.mover.y += speed_y;
        speed_x *= 0.8;
        speed_y *= 0.8;
        if(speed_x < 0.5 && speed_y < 0.5){
          IsCoasting=false;
        }
    }






    //capture release
    if(BlitInputs.release_pending){
      BlitInputs.release_pending = false;

      if(IsDragging){
        IsDragging = false;
        IsCoasting = true;
        return;
      }

      if(!IsOnPage){
        return;
      }

      if(IgnoreNext){
        IgnoreNext = false;
        return;
      }

      let pos = me.doGetPositionOnPage();
      let mouse_x = pos.x;
      let mouse_y = pos.y;

      //fill space
      if(pos.isOn){
        GameManager.redoStack = [];

        let action = {"x":mouse_x | 0, "y":mouse_y | 0, "color":paintColor};

        GameManager.doPaintAt(mouse_x | 0, mouse_y | 0, paintColor, true, false);
        GameManager.doRedraw();
        frame.coloring_page.img.graphics.clear();
        frame.coloring_page.img.graphics.beginBitmapFill(GameManager.displayCanvas, "no-repeat").drawRoundRect(0,0,GameManager.paintCanvas.width, GameManager.paintCanvas.height,10);
        //__utils.doCache(frame.coloring_page.mover, zoom);

        me.doUpdateRedoButtons();

        GameManager.doRecordCreateStack(action);
     }
    }
    
    stage.needUpdate = true;
  }



  this.doUndo =  function(){
    GameManager.doUndo();

    GameManager.doRedraw();
    frame.coloring_page.img.graphics.clear();
    frame.coloring_page.img.graphics.beginBitmapFill(GameManager.displayCanvas, "no-repeat").drawRoundRect(0,0,GameManager.paintCanvas.width, GameManager.paintCanvas.height,10);
   // __utils.doCache(frame.coloring_page.mover, zoom);

    me.doUpdateRedoButtons();

  }

  this.doRedo = function(){
    GameManager.doRedo();

    GameManager.doRedraw();
    frame.coloring_page.img.graphics.clear();
    frame.coloring_page.img.graphics.beginBitmapFill(GameManager.displayCanvas, "no-repeat").drawRoundRect(0,0,GameManager.paintCanvas.width, GameManager.paintCanvas.height,10);
    //__utils.doCache(frame.coloring_page.mover, zoom);

    me.doUpdateRedoButtons();

  }




  this.doUpdateRedoButtons = function(){
    if(GameManager.undoStack.length <= 0){
      frame.button_undo.mouseEnabled = false;
      frame.button_undo.alpha = 0.5;
    }else{
      frame.button_undo.mouseEnabled = true;
      frame.button_undo.alpha = 1;
    }

    if(GameManager.redoStack.length <= 0){
      frame.button_redo.mouseEnabled = false;
      frame.button_redo.alpha = 0.5;
    }else{
      frame.button_redo.mouseEnabled = true;
      frame.button_redo.alpha = 1;
    }

    stage.needUpdate = true;

  }



  this.doGetPositionOnPage = function(){
      //convert mouse coors to accomodate drag and scale
      let mouse_x =  (BlitInputs.mouse_x - frame.coloring_page.x + oSTAGE.game_left);
      let mouse_y =  (BlitInputs.mouse_y - frame.coloring_page.y + oSTAGE.game_top);
      let page_scale = frame.coloring_page.scale;
      mouse_x += (GameManager.paintCanvas.width * 0.5 * page_scale);
      mouse_y += (GameManager.paintCanvas.height * 0.5 * page_scale);
      mouse_x -= (frame.coloring_page.mover.x * page_scale);
      mouse_y -= (frame.coloring_page.mover.y * page_scale);
      mouse_x *= (1/page_scale);
      mouse_y *= (1/page_scale);
      let isOn = (mouse_x >= 0 && mouse_x < GameManager.paintCanvas.width && mouse_y >= 0 && mouse_y < GameManager.paintCanvas.height);
      return {"x":mouse_x, "y":mouse_y, "isOn":isOn};
  }


  this.doIsOverButton =  function(){

    if(BlitInputs.mouse_x > oSTAGE.game_right-30 && BlitInputs.mouse_y < oSTAGE.game_top+60){
      return true;
    }

    if(BlitInputs.mouse_x > oSTAGE.game_right-80 && BlitInputs.mouse_y > oSTAGE.game_bottom-50){
      return true;
    }

    if(BlitInputs.mouse_x < oSTAGE.game_left + 50 && BlitInputs.mouse_y < oSTAGE.game_top+50){
      return true;
    }

    return false;

  }



  this.doClear = function(){

      BlitInputs.click_pending = false;
      BlitInputs.release_pending = false;
      GameManager.doClear();
      frame.coloring_page.img.graphics.clear();
      frame.coloring_page.img.graphics.beginBitmapFill(GameManager.displayCanvas, "no-repeat").drawRoundRect(0,0,GameManager.paintCanvas.width, GameManager.paintCanvas.height,10);
      //__utils.doCache(frame.coloring_page.mover, zoom);
      stage.needUpdate = true;

      GameManager.undoStack = [];
      GameManager.redoStack = [];

      GameManager.doRecordCreateStack(null);

      me.doUpdateRedoButtons();

  }


  //---------------------------------
  // Color Picker
  //---------------------------------


  this.doPopupColors = function(e){
    if (IsLocked) {
      return;
    }
    IsLocked = true;
    //IgnoreNext = true;
    BlitInputs.click_pending = false;
    BlitInputs.release_pending = false;

    var Popup = new PopupColors({
      paintColor: paintColor,
      callback_ok: me.doPickColor,
      callback_cancel: me.doCancel,
    });
  }

  this.doPickColor =  function(color){
    IsLocked = false;
    BlitInputs.click_pending = false;
    BlitInputs.release_pending = false;
    paintColor = color;
    frame.pencil.color.filters = [new createjs.ColorFilter(0,0,0,1, paintColor.r, paintColor.g, paintColor.b, 0)];
   __utils.doCache(frame.pencil.color);

    oUSER.color = color;
    oUSER.colors.unshift(color);
    while(oUSER.colors.length > 11){
      oUSER.colors.pop();
    }

    BlitSaver.doSaveData("user", oUSER);

  }


  //---------------------------------
  // User Actions
  //---------------------------------

  this.doChooseSave = function(){

      var canvas_image = GameManager.displayCanvas.toDataURL("image/jpeg");
      var blob = __utils.dataURItoBlob(canvas_image);
      var filename = "My Coloring Page.jpg";

      const a = document.createElement('a');
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 0)
      
    
  }


  this.doChooseRestart = function (o) {
     if (IsLocked) {
      return;
    }

    IsLocked = true;
    BlitInputs.click_pending = false;
    BlitInputs.release_pending = false;
    __snds.playSound("snd_popup", "ui");

    var Popup = new PopupConfirm({
      msg: "clear_confirm",
      callback_ok: me.doConfirmRestart,
      callback_cancel: me.doCancel,
    });

  };
 this.doConfirmRestart = function () {
    spLogEvent({event: "PUZZLE_CLEAR", puzzle: GameManager.puzzle_id, colored_segments: GameManager.segments - GameManager.doCountSegments()});

     me.doClear();
    IsLocked = false;
  };





  this.doChooseHome = function (o) {
    if (IsLocked) {
      return;
    }
    IsLocked = true;
    //IgnoreNext = true;
    BlitInputs.click_pending = false;
    BlitInputs.release_pending = false;
    __snds.playSound("snd_popup", "ui");

    var Popup = new PopupConfirm({
      msg: "home_confirm",
      callback_ok: me.doConfirmHome,
      callback_cancel: me.doCancel,
    });
  };

  this.doConfirmHome = function () {
    spLogEvent({event: "PUZZLE_QUIT", puzzle: GameManager.puzzle_id, colored_segments: GameManager.segments - GameManager.doCountSegments()});

    BlitFader.doFadeOut(200, () => {
      me.doDestroy();
      SceneManager = new TitleScene();
    });
  };

  this.doCancel = function () {
    BlitInputs.click_pending = false;
    BlitInputs.release_pending = false;
    IsLocked = false;
  };


  this.doDestroy = function () {

    inputListener.forget = true;
    var id = window.setTimeout(function() {}, 0);
    while (id--) {
        window.clearTimeout(id);
    }

    stage.removeAllChildren();
    stage.enableMouseOver(0);
    me.forget = true;
    stage.needUpdate = true;
  };

  
  this.doResizeUpdate = function () {

   // frame.zoom_panel.x = oSTAGE.game_right + 20;
   // frame.zoom_panel.y = oSTAGE.game_center_y;


    if(oSTAGE.is_landscape){
     
      frame.zoom_in.x = oSTAGE.game_right - 55;
      frame.zoom_in.y = oSTAGE.game_center_y - 52;
      frame.zoom_out.x =oSTAGE.game_right - 55;
      frame.zoom_out.y = oSTAGE.game_center_y + 2;

    }else{
      frame.zoom_in.x = oSTAGE.game_center_x - 52;
      frame.zoom_in.y = oSTAGE.game_top + 5;
      frame.zoom_out.x = oSTAGE.game_center_x + 2;
      frame.zoom_out.y = oSTAGE.game_top + 5;


    }

    frame.b_restart.x = oSTAGE.game_right - 65;
    frame.b_restart.y = oSTAGE.game_bottom - 5;
    frame.b_home.x = oSTAGE.game_right - 5;
    frame.b_home.y = oSTAGE.game_bottom - 5;
    frame.b_save.x = oSTAGE.game_right - 125;
    frame.b_save.y = oSTAGE.game_bottom - 5;

    frame.pencil.x = oSTAGE.game_left + 20;
    frame.pencil.y = oSTAGE.game_bottom + 20;

    frame.button_undo.x = oSTAGE.game_left + 74;
    frame.button_undo.y = oSTAGE.game_bottom -5;

    frame.button_redo.x = oSTAGE.game_left + 130;
    frame.button_redo.y = oSTAGE.game_bottom -5;

    //recache
    if (me.scale != oSTAGE.scale) {
    }

    me.doResizePage();
    frame.x = oSTAGE.game_width_margins;
    frame.y = oSTAGE.game_height_margins;
    me.scale = oSTAGE.scale;
  };

  me.doInit();
};
