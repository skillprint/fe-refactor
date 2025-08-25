var PopupColors = function (o = {}) {
  var me = this;

  var canvas = document.getElementById("canvas_popups");
  var stage = BlitStage(canvas, { webgl: false });

  var asset = o.asset || "popup_colors";

  var frame = stage.addChild(new lib[asset]());
  var IsLocked = true;

  var callback_cancel = o.callback_cancel || function () {};
  var callback_ok = o.callback_ok || function () {};
  var colors_bitmap;

  var colors_scale;

  var IsMouseDown = false;
  var currentColor = o.paintColor;

  var drawn_width, drawn_height;
   var inputListener = {};

  //---------------------------
  // init
  //---------------------------

  this.doInit = function () {

    drawn_width = oSTAGE.game_width;
    drawn_height = oSTAGE.game_height;

    me.forget = false;
    update_queue.push(me);
    me.doResizeUpdate();
    RESIZER.needUpdate = true;

    colors_bitmap = images.colors;//(oSTAGE.is_landscape) ? images.colors_landscape : images.colors_portrait;

    me.imageWidth = colors_bitmap.naturalWidth;
    me.imageHeight = colors_bitmap.naturalHeight;
    me.colorsCanvas = document.createElement('canvas');
    me.colorsCanvas.width = me.imageWidth;
    me.colorsCanvas.height = me.imageHeight;
    me.colorsContext = me.colorsCanvas.getContext('2d');
    me.colorsContext.drawImage(colors_bitmap, 0, 0);

    //add user colors
    let used_colors = [];
    let x = 0;
    let y = 559;
    for(let i=0; i<oUSER.colors.length; i++){
      let color = oUSER.colors[i];
      let is_used = false;
      for(let ii=0; ii<used_colors.length; ii++){
        let used_color = used_colors[ii];
        if(color.r == used_color.r && color.g == used_color.g && color.b == used_color.b){
          is_used = true;
        }
      }

      if(!is_used){
        me.colorsContext.fillStyle = 'rgb(' + color.r + "," + color.g + "," + color.b + ')';
        me.colorsContext.beginPath();
        me.colorsContext.fillRect(x, y, 55, 55);
       //me.colorsContext.roundRect(x, y, 55, 55, 6);
        me.colorsContext.fill();
        x += 60;
        used_colors.push(color);
      }
    }



    me.imageData = me.colorsContext.getImageData(0, 0, me.imageWidth, me.imageHeight);

    let image_ratio = me.imageWidth / me.imageHeight;

    let vert_space = (oSTAGE.is_landscape) ? 150 : 200;

    let space_width = oSTAGE.game_width - 32;
    let space_height = oSTAGE.game_height - vert_space;
    let space_ratio = space_width / space_height;

    let width, height;

    if(image_ratio >= space_ratio){
      width = space_width;
      height = width * (1/image_ratio);
    }else{
      height = space_height;
      width = height * (image_ratio);
    }
  
    let scale = colors_scale = width / me.imageWidth;

    //back panel
    let panel_width = width + 12;
    let panel_height =  height + 120;
    frame.panel.bg.x = frame.panel.bg.y = 0;
    frame.panel.bg = frame.panel.bg.addChild(new createjs.Shape());
    frame.panel.bg.x = -(panel_width * 0.5);
    frame.panel.bg.y = -(panel_height * 0.5);
    frame.panel.bg.graphics.clear();
    frame.panel.bg.graphics.beginFill("#222222").drawRoundRect(0, 0, panel_width, panel_height, 20);

    //color picker
    let m = new createjs.Matrix2D();
    m.scale(scale,scale);
    frame.panel.picker.x = frame.panel.picker.y = 0;
    frame.panel.colors = frame.panel.picker.addChild(new createjs.Shape());
    frame.panel.colors.x = -(width * 0.5);
    frame.panel.colors.y = -(height * 0.5);
    frame.panel.colors.graphics.clear();
    frame.panel.colors.graphics.beginBitmapFill(me.colorsCanvas, "no-repeat", m).drawRect(0, 0, width, height);
    frame.panel.colors.addEventListener("mousedown", me.doStartChooser);

    //current color
    let color_string = "rgb(" + currentColor.r + ", " + currentColor.g + ", " + currentColor.b + ")";
    frame.panel.current_color = frame.panel.addChild(new createjs.Shape());
    frame.panel.current_color.x = -(panel_width * 0.5) + 6;
    frame.panel.current_color.y = -(panel_height * 0.5) + 6;
    frame.panel.current_color.graphics.clear();
    frame.panel.current_color.graphics.beginFill(color_string).drawRoundRectComplex (0, 0, 50, 50, 14, 4, 4, 4);

    //new color
    frame.panel.new_color = frame.panel.addChild(new createjs.Shape());
    frame.panel.new_color.x = -(panel_width * 0.5) + 62;
    frame.panel.new_color.y = -(panel_height * 0.5) + 6;
    frame.panel.new_color.graphics.clear();
    frame.panel.new_color.graphics.beginFill(color_string).drawRoundRectComplex (0, 0, (panel_width - 50 - 18) , 50, 4, 14, 4, 4);
    frame.panel.new_color.mywidth = (panel_width - 50 - 18);

    //buttons
    frame.panel.b_cancel.helper = new __utils.ButtonHelper(stage,frame.panel.b_cancel,"norm","over");
    frame.panel.b_cancel.addEventListener("click", me.doChooseCancel);
    frame.panel.b_cancel.x = (panel_width * 0.5) - 110;
    frame.panel.b_cancel.y = (panel_height * 0.5) - 56;

    frame.panel.b_ok.helper = new __utils.ButtonHelper(stage,frame.panel.b_ok,"norm","over");
    frame.panel.b_ok.addEventListener("click", me.doChooseOk);
    frame.panel.b_ok.x = (panel_width * 0.5) - 56;
    frame.panel.b_ok.y = (panel_height * 0.5) - 56;

    stage.needUpdate = true;


    BlitInputs.click_pending = false;
    BlitInputs.release_pending = false;

    inputListener = {};
    inputListener.forget = false;
    inputListener.doUpdate = me.doUpdate;
    actives.push(inputListener);

    canvas.style.display = "block";
   
   

  };



  this.doStartChooser =  function(){
    IsMouseDown = true;
  }



  this.doUpdate =  function(){
    if(IsMouseDown){
        var pt = frame.localToLocal(BlitInputs.mouse_x + oSTAGE.game_left,  BlitInputs.mouse_y + oSTAGE.game_top,  frame.panel.colors);
        if(pt.x > 0 && pt.y > 0 && pt.x < (me.imageWidth * colors_scale) && pt.y < (me.imageHeight * colors_scale)){
          let real_x = Math.floor(pt.x * (1/colors_scale));
          let real_y = Math.floor(pt.y * (1/colors_scale));
          let index = ((real_y * me.imageWidth) + real_x) * 4;

          let r = me.imageData.data[index];
          let g = me.imageData.data[index+1];
          let b = me.imageData.data[index+2];
          let color = {"r":r,"g":g,"b":b};
          
          if(color.r != currentColor.r || color.g != currentColor.g || color.b != currentColor.b){
            me.doUpdateCurrentColor(color);
          }
        }

        if(!BlitInputs.mouse_is_down){
          IsMouseDown = false;
        }
      }
    }


    if(BlitInputs.release_pending){
      BlitInputs.release_pending = false;
      let obj = stage.getObjectUnderPoint(BlitInputs.mouse_x, BlitInputs.mouse_y);
      let IsOnPage = (obj) ? true : false;
      if(!IsOnPage){
        me.doDestroy();
        callback_cancel();
      }
  }




  this.doUpdateCurrentColor =  function(color){
    currentColor = color;
    let color_string = "rgb(" + currentColor.r + ", " + currentColor.g + ", " + currentColor.b + ")";
    frame.panel.new_color.graphics.clear();
    frame.panel.new_color.graphics.beginFill(color_string).drawRoundRectComplex(0, 0,  frame.panel.new_color.mywidth, 50, 4, 14, 4, 4);
    stage.needUpdate = true;
  }


  this.doChooseCancel = function(){
    me.doDestroy();
    callback_cancel();
  }

  this.doChooseOk = function(){
    me.doDestroy();
    callback_ok(currentColor);
  }


  this.doDestroy = function () {
    stage.removeAllChildren();
    stage.enableMouseOver(0);
    inputListener.forget = true;
    me.forget = true;
    stage.needUpdate = true;
    canvas.style.display = "none";
  };

  //------------------------
  // resize
  //------------------------

  this.doResizeUpdate = function () {

    if( drawn_width != oSTAGE.game_width || drawn_height != oSTAGE.game_height){
      me.doChooseCancel();
    }

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
