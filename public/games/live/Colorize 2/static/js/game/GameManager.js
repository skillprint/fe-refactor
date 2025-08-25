var ColorizeGameManager = function () {
  var me = this;
  var LOADER;
  var base_img;

  me.imageData;
  me.imageWidth;
  me.imageHeight;

  me.paintCanvas;
  me.paintContext;
  me.linesCanvas;
  me.linesContext;
  me.lineImageData;

  me.thumbCanvas;
  me.thumbContext;

  me.displayCanvas;
  me.displayContext;
  me.displayImageData;

  me.startColor;
  me.outlineColor = {r:0,g:0,b:0};
  me.paintColor;

  me.page = "";

  me.countSegmentsMode = false;

  var readyCallback;

  me.undoStack = [];
  me.redoStack = [];
  me.createStack = [];

  me.historyId = 0;

  this.doRecordUndo =  function(action){
    me.undoStack.push(action);
  }

  this.doRecordRedo =  function(action){
    me.redoStack.push(action);
  }

  this.doUndo = function(){
    if(me.undoStack.length <= 0){return;}
    let action = me.undoStack.pop();
    GameManager.doPaintAt(action.x, action.y, action.color, false, true);
    me.doRecordCreateStack(action);
  }

  this.doRedo =  function(){
    if(me.redoStack.length <= 0){return;}
    let action = me.redoStack.pop();
    GameManager.doPaintAt(action.x, action.y, action.color, true, false);
    me.doRecordCreateStack(action);
  }

  this.doRecordCreateStack = function(action){
    if(action){
      me.createStack.push(action);
    }else{
      me.createStack = [];
    }
    oUSER.progress[me.page.src] = me.createStack;

    me.thumbContext.drawImage(me.displayCanvas, 0, 0, 256, 256);
    oUSER.thumbs[me.page.src] = GameManager.thumbCanvas.toDataURL("image/jpeg", 0.85);

    BlitSaver.doSaveData("user", oUSER);
  }







  this.doRestoreCreateStack =  function(){

    if(oUSER.progress.hasOwnProperty(me.page.src)){
      me.createStack = oUSER.progress[me.page.src];
      for(let i=0; i<me.createStack.length; i++){
        let action = me.createStack[i];
        GameManager.doPaintAt(action.x, action.y, action.color, false, false);
      }
    }else{
      me.createStack=[];
    }
  }




  this.doNewPage = function(page){
    me.page = page;
    let filename = page.src.split('/').pop();
    let id = filename.split('.')[0];
    me.puzzle_id = id;
    trace(me.puzzle_id);
  }


  this.doLoadPage =  function(callback){
    page = me.page;
    readyCallback = callback;
    
    LOADER = new LoaderScreen();

    var load_percent = 0;

    base_img = new Image();
    base_img.onload = function(){
      LOADER.doDestroy();
      LOADER= null;
      me.doProcessPage();
    }

    let loader_base = base_img.load(me.page.src);
    loader_base.onprogress = function(e){
       load_percent = (e.loaded / e.total);
       if(LOADER){
        LOADER.doUpdateBar(load_percent);
      }
    }
    loader_base.onload = function(){
      let blob = new Blob([this.response]);
      base_img.src = window.URL.createObjectURL(blob);
    }
    loader_base.send();
  
  }

  this.doProcessPage =  function(){
  
    me.imageWidth = base_img.naturalWidth;
    me.imageHeight = base_img.naturalHeight;

    //thumb creator
    me.thumbCanvas = document.createElement('canvas');
    me.thumbCanvas.width = 256;
    me.thumbCanvas.height = 256;
    me.thumbContext = me.thumbCanvas.getContext('2d', {willReadFrequently: true});
    me.thumbContext.drawImage(base_img, 0, 0, 256, 256);

    //create a paint canvas that is black & white
    me.paintCanvas = document.createElement('canvas');
    me.paintCanvas.width = me.imageWidth;
    me.paintCanvas.height = me.imageHeight;
    me.paintContext = me.paintCanvas.getContext('2d', {willReadFrequently: true});
    me.paintContext.drawImage(base_img, 0, 0);
    me.imageData = me.paintContext.getImageData(0, 0, me.imageWidth, me.imageHeight);

    //make paint canvas black and white
    for(let y=1; y<me.imageHeight; y++){
      for(let x=1; x<me.imageWidth; x++){
        let index = ((y * me.imageData.width) + x) * 4;
        let r = me.imageData.data[index];
        let g = me.imageData.data[index+1];
        let b = me.imageData.data[index+2];
        if(r+g+b > 0){
          me.imageData.data[index] = 255;
          me.imageData.data[index+1] = 255;
          me.imageData.data[index+2] = 255;
        }
      }
    }

    me.segments = me.doCountSegments();

    //create alpha canvas for outlines
    me.linesCanvas = document.createElement('canvas');
    me.linesCanvas.width = me.imageWidth;
    me.linesCanvas.height = me.imageHeight;
    me.lineContext = me.linesCanvas.getContext('2d');
    me.lineContext.drawImage(base_img, 0, 0);
    me.lineImageData = me.lineContext.getImageData(0, 0, me.imageWidth, me.imageHeight);

    //assign multiplier to alpha channel
    for(let y=1; y<me.imageWidth; y++){
      for(let x=1; x<me.imageHeight; x++){
        let index = ((y * me.lineImageData.width) + x) * 4;
        let r = me.lineImageData.data[index];
        me.lineImageData.data[index+3] = r;
      }
    }

    //create final display canvas
    me.displayCanvas = document.createElement('canvas');
    me.displayCanvas.width = me.imageWidth;
    me.displayCanvas.height = me.imageHeight;
    me.displayContext = me.displayCanvas.getContext('2d');
    me.displayContext.drawImage(base_img, 0, 0);
    me.displayImageData = me.displayContext.getImageData(0, 0, me.imageWidth, me.imageHeight);

    
    
    me.undoStack = [];
    me.redoStack = [];
    readyCallback(me.displayCanvas, me.segments);
  }


  this.doClear = function(){
    for(let y=1; y<me.imageHeight; y++){
      for(let x=1; x<me.imageWidth; x++){
        let index = ((y * me.imageData.width) + x) * 4;
        let r = me.imageData.data[index];
        let g = me.imageData.data[index+1];
        let b = me.imageData.data[index+2];
        if(r != 0 || g != 0 || b != 0){
          me.imageData.data[index] = 255;
          me.imageData.data[index+1] = 255;
          me.imageData.data[index+2] = 255;
          let pixel_multiplier = me.lineImageData.data[index+3] / 255;
          me.displayImageData.data[index] = 255 * pixel_multiplier;
          me.displayImageData.data[index+1] = 255 * pixel_multiplier;
          me.displayImageData.data[index+2] = 255 * pixel_multiplier;
        }
      }
    }
    me.paintContext.putImageData(me.imageData,0,0);
    me.displayContext.putImageData(me.displayImageData,0,0);
  }


  this.doCountSegments = function(){
    trace("doCountSegments()");
    me.countSegmentsMode = true;

    let imageDataSave = me.imageData.data.slice();
    var segments = 0;
    for(let y=1; y<me.imageWidth; y++){
      for(let x=1; x<me.imageHeight; x++){
        if(me.matchColor(x, y, {"r":255,"g":255,"b":255})){
           me.doPaintAt(x,y,{"r":2,"g":2,"b":2});
          //me.doPaintAt(x,y,{"r":__utils.getRandomInt(0,255),"g":__utils.getRandomInt(0,255),"b":__utils.getRandomInt(0,255)});
           segments++;
        }
      }
    }

    for(let y=1; y<me.imageWidth; y++){
      for(let x=1; x<me.imageHeight; x++){
        if(me.matchColor(x, y, {"r":2,"g":2,"b":2})){
           me.doPaintAt(x,y,{"r":255,"g":255,"b":255});
        }
      }
    }

    trace(segments);
    me.imageData.data = imageDataSave.slice();
    me.countSegmentsMode = false;
    return segments;
  }




  this.doPaintAt = function (x, y, color, recordUndo = false, recordRedo = false) {
    me.paintColor = color;
    
    let index = ((y * me.imageData.width) + x) * 4;
    let r = me.imageData.data[index];
    let g = me.imageData.data[index+1];
    let b = me.imageData.data[index+2];

    //painting same color, exit
    if(r == me.paintColor.r && g == me.paintColor.g && b == me.paintColor.b){
      return;
    }
    me.startColor = {"r":r,"g":g,"b":b};
    me.paintColor = color;
    
    //outline color, exit
    if (me.matchOutlineColor(r, g, b)) {
        return;
    }

    if(!me.countSegmentsMode && me.doCheckEdge(x,y) == false){
      return;
    }

   if(recordUndo){
      me.doRecordUndo({"x":x, "y":y, "color":me.startColor});
    }
    if(recordRedo){
      me.doRecordRedo({"x":x, "y":y, "color":me.startColor});
    }

    me.doFloodFill(x, y);
  }


  this.doCheckEdge =  function(x,y){
    var drawingBoundLeft = 0;
    var drawingBoundTop = 0;
    var drawingBoundRight = me.imageWidth - 1;
    var drawingBoundBottom = me.imageHeight - 1;


    for(let myy = y; myy >= drawingBoundTop; myy--){
      if(!me.matchColor(x, myy, me.startColor)){
        break;
      }else if(myy == drawingBoundTop){
        return false;
      }
    }

    for(let myy = y; myy <= drawingBoundBottom; myy++){
      if(!me.matchColor(x, myy, me.startColor)){
        break;
      }else if(myy == drawingBoundBottom){
        return false;
      }
    }

     for(let myx = x; myx >= drawingBoundLeft; myx--){
      if(!me.matchColor(myx, y, me.startColor)){
        break;
      }else if(myx == drawingBoundLeft){
        return false;
      }
    }

    for(let myx = x; myx <= drawingBoundRight; myx++){
      if(!me.matchColor(myx, y, me.startColor)){
        break;
      }else if(myx == drawingBoundRight){
        return false;
      }
    }

    return true;



  }


  this.doFloodFill = function(x, y){

    var newPos, x, y, pixelPos;
    var reachLeft,reachRight;
    var drawingBoundLeft = 0;
    var drawingBoundTop = 0;
    var drawingBoundRight = me.imageWidth - 1;
    var drawingBoundBottom = me.imageHeight - 1;

    var pixelStack = [[x, y]];

    while (pixelStack.length) {

        newPos = pixelStack.pop();
        x = newPos[0];
        y = newPos[1];

        //Go up as long as the color matches and is inside the canvas
        while (y >= drawingBoundTop && me.matchColor(x, y, me.startColor)) {
          y -= 1;
        }

        y += 1;
        reachLeft = false;
        reachRight = false;

        //Go down as long as the color matches and is inside the canvas
        while (y <= drawingBoundBottom && me.matchColor(x, y, me.startColor)) {

          me.doColorPixel(x, y, me.paintColor);

          if (x >= drawingBoundLeft) {
            if (me.matchColor(x-1, y, me.startColor)) {
              if (!reachLeft) {
                pixelStack.push([x-1, y]);
                reachLeft = true;
              }
            }else if(reachLeft) {
              reachLeft = false;
            }
          }
          if (x < drawingBoundRight) {
            if (me.matchColor(x+1, y, me.startColor)) {
              if (!reachRight) {
                pixelStack.push([x+1, y]);
                reachRight = true;
              }
            } else if (reachRight) {
              reachRight = false;
            }
          }
          y+=1;
        }
      }
  }

  this.matchOutlineColor = function (r, g, b) {
    return (r == me.outlineColor.r && g == me.outlineColor.g && b == me.outlineColor.b);
  }

  
  this.matchColor = function (x, y, color) {
    let index = ((y * me.imageData.width) + x) * 4;

    let r = me.imageData.data[index];
    let g = me.imageData.data[index+1];
    let b = me.imageData.data[index+2];
    return (r == color.r && g == color.g && b == color.b);
  }

  this.doColorPixel = function(x, y, color){
    let index = ((y * me.imageData.width) + x) * 4;
  
    //color paint layer
    me.imageData.data[index] = color.r;
    me.imageData.data[index+1] = color.g;
    me.imageData.data[index+2] = color.b;

    //update shaded display layer
    if(!me.countSegmentsMode){
      let pixel_multiplier = me.lineImageData.data[index+3] / 255;
      me.displayImageData.data[index] = color.r * pixel_multiplier;
      me.displayImageData.data[index+1] = color.g * pixel_multiplier;
      me.displayImageData.data[index+2] = color.b * pixel_multiplier;
    }
  }

  this.doRedraw =  function(){
    me.displayContext.putImageData(me.displayImageData,0,0);
  }



};