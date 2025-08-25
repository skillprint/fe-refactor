var GameScene = function () {
  trace("GameScene()");

  var me = this;

  var IsLocked = true;
  var prompt_attempt = 0;

  var buildComplete = false;

  var timeout;

  var LIBRARY;
  var FLOATER;
  var BUILDER;

  recipe_lookups = {};

  //---------------------------
  // init
  //---------------------------

  this.doInit = function () {
    trace("doInit()");

    game_start_time = performance.now();

    spLogEvent({event: "SESSION_START"});

    for(let item_id in oCONFIG.items){
      let item = oCONFIG.items[item_id];
      item.id = item_id;
      if(item.recipe){
        let part_1 = item.recipe[0];
        let part_2 = item.recipe[1];
        if(item.recipe!=null){
          recipe_lookups[part_1 + "+" + part_2] = item_id;
          recipe_lookups[part_2 + "+" + part_1] = item_id;
        }
      }
    }

    //create scroll panel
    me.LIBRARY = LIBRARY = new AlchemyLibrary();
    me.FLOATER = FLOATER = new AlchemyFloater();
    me.BUILDER = BUILDER = new AlchemyBuilder();

    IsLocked = false;
    me.forget = false;
    update_queue.push(me);
    me.doResizeUpdate();
    RESIZER.needUpdate = true;

    document.getElementById("canvas_screens").style.display = "none";

    BlitFader.doFadeIn(500);
  };


  this.doDestroy = function () {
    me.LIBRARY.doDestroy();
    me.FLOATER.doDestroy();
    me.BUILDER.doDestroy();
    me.forget = true;
  };

  //------------------------
  // resize
  //------------------------

  this.doResizeUpdate = function () {
    

    let library_width = 0;
    let library_height = 0;

    if(oSTAGE.is_landscape){
      library_width =  Math.floor(Math.max(210, oSTAGE.game_width * 0.35));
    }else{
      library_height = Math.floor(Math.max(160, oSTAGE.game_height * 0.4));
    }

    LIBRARY.doResize(library_width, library_height);
    BUILDER.doResize(oSTAGE.game_width - library_width - 2, oSTAGE.game_height - library_height - 2);

   // frame.x = oSTAGE.game_width_margins;
   // frame.y = oSTAGE.game_height_margins;
   // me.scale = oSTAGE.scale;
  };

  

  me.doInit();
};
