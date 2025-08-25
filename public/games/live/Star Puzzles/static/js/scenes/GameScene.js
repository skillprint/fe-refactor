
var GameScene = function () {
  trace("GameScene()");

  var me = this;
  var canvas = document.getElementById("canvas_screens");
  var stage = BlitStage(canvas, { webgl: false });
  var frame = stage.addChild(new lib.scene_game());
 
  me.score = 0;


  var puzzle = GameManager.doGetPuzzle(GameManager.level);
  var dot_lookup = {};
  var dots = [];
  var base_lines, active_line, dropped_lines;
  var user_sequence = [];

  //tiles
  var IsLocked = true;
  var DrawMode = false;
  var IsPlaying = false;

  var IsSolved = false;
  var IsFailed = false;

  var inputListener = {};
  var puzzleReady = false;

  var playerTryCount = 0;


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

    me.forget = false;
    update_queue.push(me);
    RESIZER.doUpdateNow();
    RESIZER.w=0;

    frame.messages.visible=false;

    //stop any music
    __snds.stopSound("music");
    music_playing = null;

    //reset /  quit buttons
    frame.b_restart.helper = new __utils.ButtonHelper(stage,frame.b_restart,"norm","over");
    frame.b_restart.addEventListener("click", me.doChooseRestart);

    frame.b_home.helper = new __utils.ButtonHelper(stage,frame.b_home,"norm","over");
    frame.b_home.addEventListener("click", me.doChooseHome);

    frame.b_restart.mouseEnabled = false;
     frame.b_restart.filters = [new createjs.ColorFilter(.5,.5,.5, 0.7, 32, 32, 32, 0)];
    __utils.doCache(frame.b_restart);

    me.doCreateLevel();
  };




  this.doCreateLevel =  function(){

    //message
    let msg = JSON.parse(JSON.stringify(oLANG.game_msg));
    msg.value = __utils.doSubText(msg.value, "{*var*}", GameManager.level.toString());
    frame.messages.visible=true;
    frame.messages.alpha = 0;
    __utils.doText(frame.messages.txt, msg);
     createjs.Tween.get(frame.messages, {override: true }).to({alpha: 1}, 250);
    stage.activeTweens.push(frame.messages);

    frame.puzzle_dots.removeAllChildren();
    frame.puzzle_lines.removeAllChildren();
    frame.puzzle_active_line.removeAllChildren();
    frame.puzzle_dropped_lines.removeAllChildren();

    base_lines = frame.puzzle_lines.addChild(new createjs.Shape());

    dropped_lines = frame.puzzle_dropped_lines.addChild(new createjs.Shape());

    puzzle = GameManager.doGetPuzzle(GameManager.level);
    dot_lookup = {};
    dots = [];
 
    for(let i=0; i<puzzle.dots.length; i++){
      let node = puzzle.dots[i];
      let dot = frame.puzzle_dots.addChild(new lib.puzzle_dot());
      dot.myid = node.myid;
      dot.myx = node.myx;
      dot.myy = node.myy;
      dot.x = node.x;
      dot.y = node.y;
      dots.push(dot);
      dot_lookup[node.myid] = dot;
      dot.is_current= false;
      dot.addEventListener("mousedown", me.doStartSequence);
      dot.can_connect = true;
    }

    IsSolved = false;
    IsFailed = false;

     frame.b_restart.mouseEnabled = false;
     frame.b_restart.filters = [new createjs.ColorFilter(.5,.5,.5, 0.7, 32, 32, 32, 0)];
    __utils.doCache(frame.b_restart);

    me.doResizeTiles();
    puzzleReady=true;
    BlitFader.doFadeIn(500, me.doFadeMessage);
  }

  this.doFadeMessage =  function(){
    me.doRevealGame();
   // createjs.Tween.get(frame.messages, {override: true }).wait(1000).to({alpha: 0}, 200);
   // stage.activeTweens.push(frame.messages);
  }


  //initially show all the tiles
  this.doRevealGame =  function(){
    let delay = 0; 
    me.doGo();
  }
  
  //unlock and start the timer
  this.doGo =  function(){
    spLogEvent({event: "LEVEL_START", level: GameManager.level});
    playerTryCount = 0;
    IsLocked = false;
    IsSolved = false;
    IsFailed = false;
  }


  this.doStartSequence = function(e){
    trace("doStartSequence()");
    if(IsLocked || DrawMode){return;}
    trace(e.currentTarget);

    var dot = e.currentTarget;
    let possible_connections = me.doCheckConnections(dot);

    playerTryCount++;
    spLogEvent({
        event: "TRY_START",
        level: GameManager.level,
        try: playerTryCount,
        vertex: e.currentTarget.myid,
        connections: possible_connections
    });

    frame.b_restart.mouseEnabled = true;
    frame.b_restart.filters = [];
    frame.b_restart.uncache();

    IsSolved = false;
    IsFailed = false;
    user_sequence = [];
    DrawMode = true;

   
    dot.is_current = true;
    createjs.Tween.get(dot.dot_glow, {override: true }).to({scale:1.25}, 100).to({scale:1}, 1000, createjs.Ease.getElasticOut(1, .8));
    stage.activeTweens.push(dot.dot_glow);

    for(let i=0; i<dots.length; i++){
      dots[i].mouseEnabled=false;
      dot.can_connect = false;
    }

   

    me.doCheckConnections(dot);
    frame.puzzle_dropped_lines.alpha = 1.0;

    //start active line
    frame.puzzle_active_line.removeAllChildren();
    active_line = frame.puzzle_active_line.addChild(new createjs.Shape());
    active_line.pt1 = dot;

    inputListener = {};
    inputListener.forget = false;
    inputListener.doUpdate = me.doUpdate;
    actives.push(inputListener);
  }



  this.doUpdate =  function(){
    var mouse_x =  (BlitInputs.mouse_x - frame.puzzle_dots.x + oSTAGE.game_left);
    var mouse_y =  (BlitInputs.mouse_y - frame.puzzle_dots.y + oSTAGE.game_top);

    //draw active line
    var start_color = "rgba(255,255,255,1.0)";
    var end_color = "rgba(255,255,255,0.0)";

    active_line.graphics.clear();
    active_line.graphics.setStrokeStyle(14);

    active_line.graphics.beginLinearGradientStroke([start_color, end_color], [.75, 1], active_line.pt1.x, active_line.pt1.y, mouse_x, mouse_y);

    active_line.graphics.moveTo(active_line.pt1.x, active_line.pt1.y);
    active_line.graphics.lineTo(mouse_x, mouse_y);
    active_line.graphics.endStroke();

   for(let i=0; i<dots.length; i++){
    var connection_ok = false;
    let dot = dots[i];
    let d = __utils.doGetDistance(mouse_x, mouse_y, dot.x, dot.y);
    if(d < 30){
      connection_ok = me.doTryConnection(active_line.pt1, dot);
    }

    //new connection, test
    if(connection_ok){
      active_line.graphics.clear();
      active_line.pt1 = dot;
      me.doResizeTiles();
      user_sequence.push(dot);

       createjs.Tween.get(dot.dot_glow, {override: true }).to({scale:1.25}, 100).to({scale:1}, 1000, createjs.Ease.getElasticOut(1, .8));
      stage.activeTweens.push(dot.dot_glow);


      let solved = me.doTestSequence();
      if(solved){

        spLogEvent({event: "TRY_SOLVED", level: GameManager.level, try: playerTryCount});

        frame.b_restart.mouseEnabled = false;
        frame.b_restart.filters = [new createjs.ColorFilter(.5,.5,.5, 0.7, 32, 32, 32, 0)];
        __utils.doCache(frame.b_restart);

        IsLocked = true;
        DrawMode = false;
        IsSolved = true;
        active_line.graphics.clear();
        inputListener.forget = true;
        me.doResizeTiles();
        __snds.playSound("snd_correct", "ui");
        setTimeout(me.doSolved, 1100);
      }

      let possible_connections = me.doCheckConnections(dot);
      if(!solved && possible_connections == 0){
        spLogEvent({event: "TRY_FAILED", level: GameManager.level, try: playerTryCount});

        IsLocked = true;
        DrawMode = false;
        me.doFail();
      }else if(!solved){
          __snds.playSound("snd_select", "ui");
      }

      break;
    }
   }
   
    stage.needUpdate = true;
  }




  this.doCheckConnections =  function(dot){
    
    //clear can connect status
    for(let i=0; i<dots.length; i++){
      let dot = dots[i];
      dot.can_connect = false;
    }

    var possible_connections = 0;
    for(let i=0; i<puzzle.lines.length; i++){
      var line = puzzle.lines[i];
      if(!line.connected){
        if(line.pt1 == dot.myid){
          possible_connections++;
         dot_lookup[line.pt2].can_connect = true;
        }else if(line.pt2 == dot.myid){
          dot_lookup[line.pt1].can_connect = true;
          possible_connections++;
        }
      }
    }
    return possible_connections;
  }


 this.doTryConnection =  function(pt1, pt2){ 
    for(let i=0; i<puzzle.lines.length; i++){
      var line = puzzle.lines[i];
      if((line.pt1 == pt1.myid && line.pt2 == pt2.myid) || (line.pt2 == pt1.myid && line.pt1 == pt2.myid)){
        if(line.connected){
          return false;
        }else{
          line.connected = true;
          return true;
        }
      }
    }
 }


  this.doTestSequence =  function(){
    GameManager.tries++;
     for(let i=0; i<puzzle.lines.length; i++){
      var line = puzzle.lines[i];
      if(!line.connected){
        return false;
      }
    }
    return true;
  }


  this.doSolved = function(){


    var delay = 0;
    for(let i=0; i<user_sequence.length; i++){
      let dot = user_sequence[i];
      createjs.Tween.get(dot, {override: true }).wait(delay).to({scale:1.5}, 100).to({scale:1}, 1000, createjs.Ease.getElasticOut(1, .8));
      stage.activeTweens.push(dot);
      delay+=100;
    }

    setTimeout(me.doHideGame, delay + 2000);
  }

  this.doHideGame = function(callback, delay = 0){
    BlitFader.doFadeOut(500, me.doNextLevel);
  }

  this.doNextLevel = function(){
    trace("doNextLevel()");
    GameManager.level++;
    
    if(GameManager.level < oUSER.progress.length){
      
      oUSER.progress[GameManager.level-1].unlocked = true;
      BlitSaver.doSaveData("user", oUSER);
     
      me.doCreateLevel();
  
    }else{
      me.doDestroy();
      SceneManager = new RecapScene();
    }

  }




  this.doFail =  function(){
    trace("dofail()");

    IsLocked = true;
    IsFailed = true;
    DrawMode = false;
    createjs.Tween.get(frame.puzzle_dropped_lines, {override: true }).wait(500).to({alpha:0}, 500);
    stage.activeTweens.push(frame.puzzle_dropped_lines);
    active_line.graphics.clear();
    inputListener.forget = true;
    me.doResizeTiles();
    __snds.playSound("snd_wrong", "ui");

     for(let i=0; i<dots.length; i++){
      let dot = dots[i];
      dot.can_connect = false;
    }

    setTimeout(me.doClearLines, 1000);
  }


  

  this.doClearLines = function(){
    trace("doClearLines()");

 frame.b_restart.mouseEnabled = false;
     frame.b_restart.filters = [new createjs.ColorFilter(.5,.5,.5, 0.7, 32, 32, 32, 0)];
    __utils.doCache(frame.b_restart);
   
    for(let i=0; i<puzzle.lines.length; i++){
      var line = puzzle.lines[i];
      line.connected = false;
    }

     for(let i=0; i<dots.length; i++){
      dots[i].mouseEnabled=true;
    }

    if(active_line){
    active_line.graphics.clear();
  }
    inputListener.forget = true;
    me.doResizeTiles();
    IsLocked = false;
    DrawMode = false;
  }


  //---------------------------------
  // User Actions
  //---------------------------------

  this.doChooseRestart = function (o) {
    if (IsLocked) {
      return;
    }
    spLogEvent({event: "TRY_ABANDON", level: GameManager.level, try: playerTryCount});
    me.doClearLines();

  };

  this.doChooseHome = function (o) {
    if (IsLocked) {
      return;
    }
    spLogEvent({event: "TRY_ABANDON", level: GameManager.level, try: playerTryCount});
    me.doClearLines();
    IsLocked = true;
    __snds.playSound("snd_popup", "ui");

    var Popup = new PopupConfirm({
      msg: "home_confirm",
      callback_ok: me.doConfirmHome,
      callback_cancel: me.doCancel,
    });
  };

  this.doConfirmHome = function () {
    spLogEvent({event: "LEVEL_QUIT", level: GameManager.level, try: playerTryCount});
    BlitFader.doFadeOut(200, () => {
      me.doDestroy();
      SceneManager = new TitleScene();
    });
  };

  this.doCancel = function () {
    IsLocked = false;
  };


  this.doDestroy = function () {

    inputListener.forget = true;
    var id = window.setTimeout(function() {}, 0);
    while (id--) {
        window.clearTimeout(id); // will do nothing if no timeout with id is present
    }

    stage.removeAllChildren();
    stage.enableMouseOver(0);
    me.forget = true;
    stage.needUpdate = true;
  };

  //------------------------
  // resize
  //------------------------


  this.doResizeTiles =  function(){
    if(!puzzleReady){return;}

    let margins = 80;
    let max_width = (oSTAGE.game_width) - (100);
    let max_height= (oSTAGE.game_height) - (margins* 2);

    frame.puzzle_active_line.x = oSTAGE.game_center_x;
    frame.puzzle_active_line.y = oSTAGE.game_center_y;

    //button dots
    frame.puzzle_dots.x = oSTAGE.game_center_x;
    frame.puzzle_dots.y = oSTAGE.game_center_y;
    var max_size = Math.min(max_width, max_height);
    var puzzle_scale = Math.min(.5, max_size / puzzle.size);
    for(let i=0; i<dots.length; i++){
      let dot = dots[i];
      dot.x = dot.myx * puzzle_scale;
      dot.y = dot.myy * puzzle_scale;
    }

    //draw base lines
    frame.puzzle_lines.x = oSTAGE.game_center_x;
    frame.puzzle_lines.y = oSTAGE.game_center_y;
    base_lines.graphics.clear();
    base_lines.graphics.setStrokeStyle(12);
    base_lines.graphics.beginStroke("rgba(0,0,0,0.6)");
    for(let i=0; i<puzzle.lines.length; i++){
      let node = puzzle.lines[i];
      let dot1 = dot_lookup[node.pt1];
      let dot2 = dot_lookup[node.pt2];
      base_lines.graphics.moveTo(dot1.x, dot1.y);
      base_lines.graphics.lineTo(dot2.x, dot2.y);
    }
    base_lines.graphics.endStroke();


    //draw dropped lines
    var line_color = (IsSolved) ? "rgba(153,255,0,0.8)" : (IsFailed) ? "rgba(242,95,0,0.8)" : "rgba(255,255,255,1.0)";
    var line_color_2 = (IsSolved) ? "rgba(153,255,0,1)" : (IsFailed) ? "rgba(242,95,0,1.0)" : "rgba(255,255,255,1.0)";
    var line_width = (IsSolved) ? 16 : (IsFailed) ? 16 : 14;
    var line_width_2 = (IsSolved) ? 14 : (IsFailed) ? 14 : 12;

    frame.puzzle_dropped_lines.x = oSTAGE.game_center_x;
    frame.puzzle_dropped_lines.y = oSTAGE.game_center_y;
    dropped_lines.graphics.clear();
    dropped_lines.graphics.setStrokeStyle(line_width);
    dropped_lines.graphics.beginStroke(line_color);
    for(let i=0; i<puzzle.lines.length; i++){
      let node = puzzle.lines[i];
      if(node.connected){
        let dot1 = dot_lookup[node.pt1];
        let dot2 = dot_lookup[node.pt2];
        dropped_lines.graphics.moveTo(dot1.x, dot1.y);
        dropped_lines.graphics.lineTo(dot2.x, dot2.y);
      }
    }
    dropped_lines.graphics.endStroke();

    //add another line for effect
    /*
    if(IsSolved){
      dropped_lines.graphics.setStrokeStyle(line_width_2);
      dropped_lines.graphics.beginStroke(line_color_2);
      for(let i=0; i<puzzle.lines.length; i++){
        let node = puzzle.lines[i];
        if(node.connected){
          let dot1 = dot_lookup[node.pt1];
          let dot2 = dot_lookup[node.pt2];
          dropped_lines.graphics.moveTo(dot1.x, dot1.y);
          dropped_lines.graphics.lineTo(dot2.x, dot2.y);
        }
      }
      dropped_lines.graphics.endStroke();
    }
    */

  }



  this.doResizeUpdate = function () {

    frame.b_restart.x = oSTAGE.game_right - 65;
    frame.b_restart.y = oSTAGE.game_bottom - 10;
    frame.b_home.x = oSTAGE.game_right - 5;
    frame.b_home.y = oSTAGE.game_bottom - 10;

    frame.messages.x = oSTAGE.game_center_x;
    frame.messages.y = oSTAGE.game_top + 5;

    me.doResizeTiles();


    //recache
    if (me.scale != oSTAGE.scale) {
    }


    frame.x = oSTAGE.game_width_margins;
    frame.y = oSTAGE.game_height_margins;
    me.scale = oSTAGE.scale;
  };

  me.doInit();
};
