var AlchemyIcon =  function(id, dummy, spinner, stage, play_snds){
  var me =  this;
  me.play_snds = play_snds || false;
  if(dummy.image){return;}

  var snd = null;

  spinner.forget = false;
  spinner.mouseEnabled = false;
  spinner.doUpdate =  function(){
      this.rotation -= 5;
      stage.needUpdate = true;
  }
  stage.actives.push(spinner);





  this.doInit = function(){
    me.doLoadImage(id, me.doImageLoading, me.doImageReady);
  }

  this.doImageReady = function(image){
    if(me.play_snds){
        __snds.playSound("combine_finish", "icons");
    }

    spinner.forget = true;
    spinner.visible=false;

    let icon_size = 50;
    let img_width = image.naturalWidth;
    let img_height = image.naturalHeight;
    let scale = Math.min(icon_size/img_width, icon_size/img_height);

    var m = new createjs.Matrix2D();
    m.translate(-icon_size * 0.5, -icon_size * 0.5);
    m.scale(scale,scale);

    var img = new createjs.Shape();
    img.mouseEnabled = false;
    img.graphics.beginBitmapFill(image, "no-repeat", m).drawRoundRect(-32,-32,64,64,10);
    dummy.image = dummy.addChild(img);

    stage.needUpdate = true;
  }

  this.doLoadImage =  function(id, callback_progress, callback_loaded){
    spinner.visible = true;
    var src = "media/images/icon_" + id + ".png";

    //image already loaded, just 
    if(oCONFIG.items[id].image){
      callback_loaded(oCONFIG.items[id].image);
      return;
    }

    dummy.removeAllChildren();

    var img = new Image();
    img.onload = function(){
        oCONFIG.items[id].image = img;
        callback_loaded(img);
    }

    let loader = img.load(src);
    loader.onprogress = function(e){}
    loader.onload = function(){
      let blob = new Blob([this.response]);
      img.src = window.URL.createObjectURL(blob);
    }
    loader.send();

  }

  me.doInit();

}

