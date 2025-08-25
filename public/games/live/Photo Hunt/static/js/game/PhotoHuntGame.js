var PhotoHuntGameManager = function () {
  var me = this;

  me.level = 1;
  me.found = 0;
  me.image_a = null;
  me.image_b = null;

  var base_img;
  var diffs_img;

  var LOADER;

  var ready_callback = null;

  var mouse = new createjs.Point();


  Image.prototype.load = function(url){
      var thisImg = this;
      var xmlHTTP = new XMLHttpRequest();
      xmlHTTP.thisImg = thisImg;
      xmlHTTP.open('GET', url,true);
      xmlHTTP.responseType = 'arraybuffer';
     
     return xmlHTTP;
  };

  Image.prototype.completedPercentage = 0;





  this.doInit = function () {
    me.found = 0;
  };

  this.doLoadPuzzle =  function(callback){
    ready_callback = callback;

    BlitFader.doFadeIn(500);
    LOADER = new LoaderScreen();

    puzzle = puzzles[me.level - 1];
    let a_loaded = false;
    let b_loaded = false;
    var load_percent_a = 0;
    var load_percent_b = 0;




    base_img = new Image();
    base_img.onload = function(){
      a_loaded = true;
      if(a_loaded && b_loaded){
        me.doPrepPuzzle();
      }
    }

    let loader_base = base_img.load(puzzle.source_a);
    loader_base.onprogress = function(e){
       load_percent_a = (e.loaded / e.total);
       if(LOADER){
        LOADER.doUpdateBar((load_percent_a + load_percent_b) / 2);
      }
    }
    loader_base.onload = function(){
      let blob = new Blob([this.response]);
      base_img.src = window.URL.createObjectURL(blob);
    }
    loader_base.send();




    diffs_img = new Image();
    diffs_img.onload = function(){
      b_loaded = true;
      if(a_loaded && b_loaded){
        me.doPrepPuzzle();
      }
    }

    let loader_diffs = base_img.load(puzzle.source_b);
    loader_diffs.onprogress = function(e){
       load_percent_b = (e.loaded / e.total);
      if(LOADER){
        LOADER.doUpdateBar((load_percent_a + load_percent_b) / 2);
      }    }

    loader_diffs.onload = function(){
      let blob = new Blob([this.response]);
      diffs_img.src = window.URL.createObjectURL(blob);
    }
    loader_diffs.send();

  }


this.doPrepPuzzle = function(){
  trace("me.doPrepPuzzle()");

  LOADER.doDestroy();
  LOADER= null;

  let img_width = base_img.naturalWidth;
  let img_height = base_img.naturalHeight;

  //base
  let base_canvas = document.createElement('canvas');
  let base_context = base_canvas.getContext('2d');
  base_canvas.width = img_width;
  base_canvas.height = img_height;
  base_context.drawImage(base_img, 0, 0);

  //differences
  let diffs_canvas = document.createElement('canvas');
  let diffs_context = diffs_canvas.getContext('2d');
  diffs_canvas.width = diffs_img.naturalWidth;
  diffs_canvas.height = diffs_img.naturalHeight;
  diffs_context.drawImage(diffs_img, 0, 0);

  //final images
  let img1_canvas = document.createElement('canvas');
  let img1_context = img1_canvas.getContext('2d');
  img1_canvas.width = img_width;
  img1_canvas.height = img_height;
  img1_context.drawImage(base_img, 0, 0);
  
  let img2_canvas = document.createElement('canvas');
  let img2_context = img2_canvas.getContext('2d');
  img2_canvas.width = img_width;
  img2_canvas.height = img_height;
  img2_context.drawImage(base_img, 0, 0);

  for(let i=0; i < puzzle.differences.length; i++){
    let difference = puzzle.differences[i];
    difference.box[2] = Math.min(difference.box[2], img_width-difference.box[0]);
    difference.box[3] = Math.min(difference.box[3], img_height-difference.box[1]);
    let dst_ctx = (Math.random() >= 0.5) ? img1_context : img2_context;
    dst_ctx.drawImage(diffs_canvas, difference.box[0], difference.box[1], difference.box[2], difference.box[3], difference.box[0], difference.box[1], difference.box[2], difference.box[3]);
  }

  me.image_a = img1_canvas;
  me.image_b = img2_canvas;

  BlitFader.doFadeOut(200, ready_callback);
 // ready_callback();
}














  this.doDestroy = function () {
    __snds.stopSound("music");
    GameTimer.doDestroy();
    inputListener.forget = true;
    me.forget = true;
  };


};
