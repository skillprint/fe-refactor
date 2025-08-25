
var GameScene = function () {
  trace("GameScene()");

  var me = this;
  var canvas = document.getElementById("canvas_screens");
  var stage = BlitStage(canvas, { webgl: false });
  var frame = stage.addChild(new lib.scene_game());

  //timer
  var GameTimer;
  var timeout;
  var timer_current, timer_frame, timer_back, timer_bar;
  var timer_width = 0;
  me.time_left = 0
  me.score = 0;

  //tiles
  var tiles = [];
  var tilesReady = false;
  var grid_spacing = 0;
  var grid_tiles = null;
  var last_tile = null;
  var hover_tile = null;
  var current_tile = null;
  var IsLocked = true;
  var IsPlaying = false;
  var bonus_mode = false;
  var bonus_points=0;
  var bonus_start_time=0;
  var final_level_score = 0;
  var inputListener = {};

  var stats_start_time = 0;


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

    //new game
    GameManager.doNewGame();
    GameManager.doNewLevel(1);

    frame.messages.visible=false;

    //stop any music
    __snds.stopSound("music");
    music_playing = null;

    //reset /  quit buttons
    frame.b_restart.visible=false;

    frame.b_home.helper = new __utils.ButtonHelper(stage,frame.b_home,"norm","over");
    frame.b_home.addEventListener("click", me.doChooseHome);

    frame.wrong_alert.alpha = 1;
    frame.wrong_alert.visible=false;

    for(let i = 1; i<=3; i++){
      let strike = frame.game_tries["strike_" + i];
      if(i > GameManager.lives){
        strike.visible=false;
      }
    }


    me.doScoreUpdate();
    me.doCreateLevel();
  };



 
  this.doCreateLevel =  function(){

    let timer_index = Math.min(oCONFIG.second_on_clock.length -1, GameManager.grid_size - 3);
    let seconds_on_clock = oCONFIG.second_on_clock[timer_index];

    GameTimer = new BlitTimer({"seconds_on_clock": seconds_on_clock, "callback_update": me.doTimerUpdate, "callback_bonuscomplete": me.doBonusComplete, "callback_outoftime": me.doOutOfTime, "direction": -1});
    GameTimer.doFirstUpdate();

    //message
    let msg = JSON.parse(JSON.stringify(oLANG.game_msg));
    msg.value = __utils.doSubText(msg.value, "{*var*}", GameManager.level.toString());
    frame.messages.visible=true;
    frame.messages.alpha = 0;
    __utils.doText(frame.messages.txt, msg);
     createjs.Tween.get(frame.messages, {override: true }).to({alpha: 1}, 250);
    stage.activeTweens.push(frame.messages); 

    __utils.doText(frame.game_goal.txt_goal, oLANG.txt_goal, {_verticalAlign:"center", _text_height:27});
        __utils.doText(frame.game_goal.txt, GameManager.goal.toString(), {_verticalAlign:"center", _text_height:30});


    frame.game_goal.visible = false;
    frame.game_time.visible = false;
    frame.game_tries.visible = false;

    me.doUpdateStrikes();
    me.doCreateTiles();

  }

  /*
  this.doTimerUpdate = function(time_left, percent_left, display_time){
     GameManager.time = me.time_left;
     me.time_left = time_left;

    GameManager.display_time = display_time.m + ":" + display_time.ss;
     __utils.doText(frame.game_time.txt, GameManager.display_time);
  
    stage.needUpdate = true;
  }
  */






  this.doCreateTiles =  function(){

    tiles = [];

    grid_tiles = [];

    for(row = 0; row < GameManager.grid_size; row++){
      grid_tiles.push([]);
      for(col = 0; col < GameManager.grid_size; col++){

        grid_tiles[row].push(null);
        let tile_value = 1;
        
        //create tile
        let tile = frame.tiles.addChild(new lib.number_tile);
        tile.button_base = tile.button_dummy.addChild(new createjs.Shape());

        tile.button_green = tile.button_dummy.addChild(new createjs.Shape());
        tile.button_green.visible = false;

        tile.button_red = tile.button_dummy.addChild(new createjs.Shape());
        tile.button_red.visible = false;

        //value
        __utils.doText(tile.txt, "-", {verticalAlign:"center", text_height:35.2});

        //data
        tile.row = row;
        tile.col = col;
        tile.value = tile_value;
        tile.is_flipped = false;
        tile.addEventListener("mousedown", me.doStartSequence);

        grid_tiles[row][col] = tile;
        tile.visible = false;
        tiles.push(tile);
      }
    }

    tilesReady = true;

    me.doGeneratePuzzle();
    me.doResizeTiles();
    BlitFader.doFadeIn(500, me.doFadeMessage);
  }




  this.doGeneratePuzzle =  function(){
    trace("doGetPath()");

    var length = GameManager.solution_length;

    for(let i=0; i<tiles.length; i++){
      let tile = tiles[i];
      tiles.in_solution = false;
    }

    path = [];
    var starting_row = __utils.getRandomInt(0, GameManager.grid_size - 1);
    var starting_col = __utils.getRandomInt(0, GameManager.grid_size - 1);
    var nextTile = grid_tiles[starting_row][starting_col];
    nextTile.in_solution = true;
    path.push(nextTile);

    while(path.length < length){
      let nextTile = me.doGetRandomAvailTile(starting_row, starting_col);
      if(nextTile){
        //add tile to path
        starting_row = nextTile.row;
        starting_col = nextTile.col;
        nextTile.in_solution = true;
        path.push(nextTile);
      
      }else{
        //restart sequence
        path = [];
        starting_row = __utils.getRandomInt(0, GameManager.grid_size - 1);
        starting_col = __utils.getRandomInt(0, GameManager.grid_size - 1);
        nextTile = grid_tiles[starting_row][starting_col];
        nextTile.in_solution = true;
        path.push(nextTile);
      }
    }


   var sum = path.length;
   var min = GameManager.goal;
   var max = 0;
   while(sum < GameManager.goal){
    let r = __utils.getRandomInt(0, path.length - 1);
    let tile = path[r];
    tile.value++;
    min = Math.min(min, tile.value);
    max = Math.max(max, tile.value);
    sum++;
   }

   for(let i=0; i<tiles.length; i++){
    let tile = tiles[i];
    if(!tile.in_solution){
        tile.value = __utils.getRandomInt(Math.max(1, min-1), Math.min(GameManager.goal-1, max + 6));
    }

    __utils.doText(tile.txt, tile.value.toString(), {verticalAlign:"top"});
   
   }



  }


  this.doGetRandomAvailTile =  function(x,y){
    var adjacents = [[-1,0],[1,0],[0,-1],[0,1]];
    var random_tiles = [];
   
    for(let i=0; i<adjacents.length; i++){
      try{
        let row = x + adjacents[i][0];
        let col = y + adjacents[i][1];
        let tile = grid_tiles[row][col];
        if(!tile.in_solution){
          random_tiles.push(tile);
        }
      }catch(e){}
    }

    if(random_tiles.length >= 1){
      return random_tiles[__utils.getRandomInt(0, random_tiles.length-1)];
    }else{
      return false;
    }
  }



  this.doFadeMessage =  function(){
    createjs.Tween.get(frame.messages, {override: true }).wait(500).to({alpha: 0}, 200).call(me.doRevealGame);
    stage.activeTweens.push(frame.messages); 
  }


  //initially show all the tiles
  this.doRevealGame =  function(){
    let delay = 0; 

    let randomTiles = __utils.doRandomizeArray(tiles);

    for(let i=0; i < randomTiles.length; i++){
      let tile = randomTiles[i];
      tile.alpha = 0;
      tile.visible = true;
      tile.button_base.alpha = 0.25;
      createjs.Tween.get(tile, {override: true }).wait(delay).to({alpha: 1}, 75);
      stage.activeTweens.push(tile); 
      delay += 40;
    }

    frame.game_goal.myy = frame.game_goal.y;
    frame.game_goal.y = oSTAGE.game_top - 30;
    createjs.Tween.get(frame.game_goal, {override: true}).wait(delay).set({visible:true}).to({y: frame.game_goal.myy}, 250, createjs.Ease.cubicOut);
    stage.activeTweens.push(frame.game_goal);

    spLogEvent({event: "LEVEL_START", level: GameManager.level, sumgoal: GameManager.goal, board:GameManager.grid_size});

    frame.game_time.alpha = 1;
    frame.game_time.myy = frame.game_time.y;
    frame.game_time.y = oSTAGE.game_top - 30;
    createjs.Tween.get(frame.game_time, {override: true}).wait(delay).set({visible:true}).to({y: frame.game_time.myy}, 250, createjs.Ease.cubicOut);
    stage.activeTweens.push(frame.game_time);

    frame.game_tries.myy = frame.game_tries.y;
    frame.game_tries.y = oSTAGE.game_bottom + 30;
    createjs.Tween.get(frame.game_tries, {override: true}).wait(delay).set({visible:true}).to({y: frame.game_tries.myy}, 250, createjs.Ease.cubicOut).call(me.doGo);
    stage.activeTweens.push(frame.game_tries);

  }

  
  //unlock and start the timer
  this.doGo =  function(){
    IsLocked = false;
    final_level_score = 0;
    stats_start_time = performance.now();
    GameTimer.doStart();
  }




  this.doStartSequence = function(e){
    if(IsLocked){return;}

    var tile = e.currentTarget;

    for(let i=0; i<tiles.length; i++){
      tiles[i].mouseEnabled=false;
    }

    tile.is_flipped = true;
    createjs.Tween.get(tile.button_base, { override: true }).to({alpha: 1.0}, 100);
    stage.activeTweens.push(tile.button_base);

    GameManager.sequence = [];
    GameManager.sequence.push(tile);
    
    last_tile = null; 
    hover_tile = null;
    current_tile = tile;

    me.doHighlightAvail();

    inputListener = {};
    inputListener.forget = false;
    inputListener.doUpdate = me.doUpdate;
    actives.push(inputListener);
  }


  this.doUpdate =  function(){
    var mouse_x =  (BlitInputs.mouse_x - frame.tiles.x + oSTAGE.game_left) + (GameManager.grid_size * grid_spacing * 0.5);
    var mouse_y =  (BlitInputs.mouse_y - frame.tiles.y + oSTAGE.game_top) + (GameManager.grid_size * grid_spacing * 0.5);
    let mouse_col = Math.floor(mouse_x / grid_spacing);
    let mouse_row = Math.floor(mouse_y / grid_spacing);
    if(mouse_row >= 0 && mouse_row < GameManager.grid_size && mouse_col >= 0 && mouse_col < GameManager.grid_size){
       var last_tile = GameManager.sequence[GameManager.sequence.length - 1];
       var tile = grid_tiles[mouse_row][mouse_col]; 
       hover_tile = tile;

       if(!tile.is_flipped && ((last_tile.row == mouse_row && Math.abs(last_tile.col - mouse_col) == 1) || (last_tile.col == mouse_col && Math.abs(last_tile.row - mouse_row) == 1))){
          //flip new tile

          __snds.playSound("snd_select", "ui");
          tile.is_flipped = true;
          createjs.Tween.get(tile.button_base, { override: true }).to({alpha: 1.0}, 100);
          stage.activeTweens.push(tile.button_base);
          GameManager.sequence.push(tile); 
          last_tile = current_tile; 
          current_tile = tile;
          me.doHighlightAvail();

       }else if(GameManager.sequence.length >= 2 && GameManager.sequence[GameManager.sequence.length-1] == last_tile&& GameManager.sequence[GameManager.sequence.length-2] == tile){
          //unflip last tile
          current_tile.is_flipped = false;
          createjs.Tween.get(current_tile.button_base, { override: true }).to({alpha: 0.35}, 100);
          stage.activeTweens.push(current_tile.button_base);
          GameManager.sequence.pop(); 
          
          last_tile = GameManager.sequence[GameManager.sequence.length-2];
          current_tile = GameManager.sequence[GameManager.sequence.length-1];
          me.doHighlightAvail();

       }
    }
    if(!BlitInputs.mouse_is_down){
      inputListener.forget = true;
      me.doTestSequence();
    }
  }


  this.doHighlightAvail =  function(){
      for(let i=0; i<tiles.length; i++){
        let tile = tiles[i];
        if(tile.is_flipped){
          continue;
        }else if((current_tile.row == tile.row && Math.abs(current_tile.col - tile.col) == 1) || (current_tile.col == tile.col && Math.abs(current_tile.row - tile.row) == 1)){
          createjs.Tween.get(tile.button_base, { override: true }).to({alpha: 0.45}, 100);
          stage.activeTweens.push(tile.button_base); 
        }else{
          createjs.Tween.get(tile.button_base, {override: true}).to({alpha: 0.35}, 300);
          stage.activeTweens.push(tile.button_base);
        }
      }
  }

  this.doUpdateStrikes = function(){
    for(let i = 1; i<=3; i++){
      let strike = frame.game_tries["strike_" + i];
      let clip_frame = (GameManager.strikes >= i) ? 0 : 1;
      strike.gotoAndStop(clip_frame);
    }
  }


  this.doTestSequence =  function(){
    GameManager.tries++;
    let sum = 0;
    for(let i=0; i<GameManager.sequence.length; i++){
      sum += GameManager.sequence[i].value;
    }
    if(sum == GameManager.goal){
      GameManager.score += sum;
      me.doCorrect();
      spLogEvent({event: "LEVEL_COMPLETE", level: GameManager.level, tries: GameManager.tries, sumgoal: GameManager.goal});

    }else{
      me.doWrong({sum:sum, goal:GameManager.goal}); 
      spLogEvent({event: "INCORRECT", level: GameManager.level, tries: GameManager.tries, sumgoal: GameManager.goal, totalsum: sum});
    }
  }



   this.doWrong =  function(res){
    GameManager.strikes++;
    me.doUpdateStrikes();

    var msg_lang = oLANG.wrong_alert;
    var response = JSON.parse(JSON.stringify(msg_lang));
    var response_value =  response.value;
    response.value = __utils.doSubText(response.value, "{*sum*}", res.sum);
    response.value = __utils.doSubText(response.value, "{*goal*}", res.goal);
    __utils.doText(frame.wrong_alert.txt, response, {verticalAlign:"middle"});

    frame.wrong_alert.alpha = 1;
    frame.wrong_alert.visible=true;

    var IsGameOver = (GameManager.strikes >= GameManager.lives);

    for(let i=0; i<tiles.length; i++){
      let tile = tiles[i];
      tile.mouseEnabled = false;
      tile.selected = false;

      //remove avail indicators
      createjs.Tween.get(tile.button_base, { override: true }).to({alpha: 0.35}, 300);
      stage.activeTweens.push(tile.button_base);

 if(!IsGameOver){
      createjs.Tween.get(frame.wrong_alert, {override: true }).wait(1000).to({alpha: 0}, 300).call(()=>{
          frame.wrong_alert.visible = false;
      });

      stage.activeTweens.push(frame.wrong_alert);
    }

      //red and return any flipped tiles
      if(tile.is_flipped){
        tile.is_flipped = false;
        tile.button_red.visible = true;
        tile.button_red.alpha = 1;
        if(!IsGameOver){
          createjs.Tween.get(tile.button_red, {override: true }).wait(1000).to({alpha: 0}, 300).call(()=>{
            tile.button_red.visible = false;
          });

          stage.activeTweens.push(tile.button_red);
        }
      }
    }
    GameManager.sequence = [];

    if(IsGameOver){
      __snds.playSound("snd_gameover", "ui");
      GameTimer.doStop();
      inputListener.forget = true;
      setTimeout(me.doGameOver, 2000);
    }else{
      __snds.playSound("snd_wrong", "ui");
      setTimeout(me.doResetAfterWrong, 1000);
    }
  }



  this.doResetAfterWrong =  function(){
    for(let i=0; i<tiles.length; i++){
      let tile = tiles[i];
      tile.mouseEnabled = true;
    }



  }


  this.doCorrect = function(){
    GameTimer.doStop();
    inputListener.forget = true;
    __snds.playSound("snd_correct", "ui");

    for(let i=0; i<tiles.length; i++){
      let tile = tiles[i];
      tile.mouseEnabled=false;
      tile.selected = false;
      if(tile.is_flipped){
        tile.button_green.visible = true;
        tile.button_green.alpha = 1;
      }
    }

    me.doScoreUpdate();
    setTimeout(me.doStartBonus, 1000);
  }



this.doTimerUpdate = function(time_left, percent_left, display_time){
    me.time_left = time_left;
   GameManager.display_time = display_time.m + ":" + display_time.ss;
    __utils.doText(frame.game_time.txt, GameManager.display_time);

    if(bonus_mode){
      let bonus_seconds = (bonus_start_time - me.time_left) * 0.001;
      let new_points = oCONFIG.bonus_points_per_second * bonus_seconds;
      bonus_start_time = me.time_left;
      GameManager.score = Math.min(final_level_score, GameManager.score + new_points);
      me.doScoreUpdate();
    }
    stage.needUpdate = true;
  }



  this.doOutOfTime = function(){
    createjs.Tween.get(frame.game_time, { override: true }).to({alpha: 0}, 300);
    stage.activeTweens.push(frame.game_time);
    GameTimer.doStop();
  }

  this.doStartBonus =  function(){
    __snds.playSound("snd_bonus", "bonus", -1);
    let seconds_left = me.time_left * 0.001;
    bonus_points = Math.ceil(oCONFIG.bonus_points_per_second * seconds_left);
    bonus_start_time = me.time_left;
    final_level_score = GameManager.score + bonus_points;
    bonus_mode = true;
    GameTimer.doStartBonus();
  }


  this.doBonusComplete =  function(){
    __snds.stopSound("bonus");
    GameTimer.doStop();
    bonus_mode=false;
    GameManager.score = final_level_score;
    me.doScoreUpdate();
    me.doHideGame(me.doNextLevel);
  }






  this.doHideGame = function(callback, delay = 0){

    let randomTiles = __utils.doRandomizeArray(tiles);

    for(let i=0; i < randomTiles.length; i++){
      let tile = randomTiles[i];
      createjs.Tween.get(tile, {override: true }).wait(delay).to({alpha: 0}, 70);
      stage.activeTweens.push(tile); 
      delay += 40;
    }
    //callback();
    setTimeout(callback, delay);
  }




  this.doNextLevel = function(){

    for(let i=0; i < tiles.length; i++){
      //hide all not flipped tiles
      let tile = tiles[i];
      if(tile.is_flipped){
        createjs.Tween.get(tile, {override: true }).to({alpha: 0}, 250);
        stage.activeTweens.push(tile); 
      }
    }

    createjs.Tween.get(frame.game_goal, {override: true}).to({y: oSTAGE.game_top - 30}, 200, createjs.Ease.cubicIn);
    stage.activeTweens.push(frame.game_goal);

    createjs.Tween.get(frame.game_time, {override: true}).to({y: oSTAGE.game_top - 30}, 200, createjs.Ease.cubicIn);
    stage.activeTweens.push(frame.game_time);

     createjs.Tween.get(frame.game_tries, {override: true}).to({y: oSTAGE.game_bottom + 30}, 200, createjs.Ease.cubicIn);
    stage.activeTweens.push(frame.game_tries);

    setTimeout(()=>{
      GameTimer.doDestroy();
      GameManager.doNextLevel();

      frame.tiles.removeAllChildren();
      tiles = [];
      me.doCreateLevel();
    }, 500);
    
  }


   this.doGameOver =  function(){
    trace("doGameOver()");

    IsPlaying=false;
    GameTimer.doStop();
    GameTimer.doDestroy();

    __snds.playSound("snd_level_complete", "ui");

    spLogEvent({event: "GAME_OVER", level: GameManager.level});

    BlitFader.doFadeOut(100, () => {
      me.doDestroy();
      SceneManager = new RecapScene();
    });
  }



  this.doScoreUpdate =  function(){
     __utils.doText(frame.game_score.txt, Math.round(GameManager.score).toString());
  }






  //---------------------------------
  // User Actions
  //---------------------------------

  this.doChooseRestart = function (o) {
    if (IsLocked) {
      return;
    }
    IsLocked = true;
    GameTimer.doDestroy();

    __snds.stopSound("bonus");
    __snds.playSound("snd_popup", "ui");

    var Popup = new PopupConfirm({
      msg: "restart_confirm",
      callback_ok: me.doConfirmRestart,
      callback_cancel: me.doCancel,
    });
  };

  this.doChooseHome = function (o) {
    if (IsLocked) {
      return;
    }
    IsLocked = true;
    GameTimer.doDestroy();
    __snds.playSound("snd_popup", "ui");

    var Popup = new PopupConfirm({
      msg: "home_confirm",
      callback_ok: me.doConfirmHome,
      callback_cancel: me.doCancel,
    });
  };

  this.doConfirmRestart = function () {
    trace("doConfirmRestart()");
    spLogEvent({ event: "LEVEL_RESTART", level: GameManager.level});
    BlitFader.doFadeOut(200, () => {
      me.doDestroy();
      SceneManager = new GameScene();
    });
  };

  this.doConfirmHome = function () {
    trace("doConfirmHome()");

    spLogEvent({event: "LEVEL_QUIT", level: GameManager.level, tries: GameManager.tries, sumgoal: GameManager.goal});

    BlitFader.doFadeOut(200, () => {
      me.doDestroy();
      SceneManager = new TitleScene();
    });
  };

  this.doCancel = function () {
    IsLocked = false;
    GameTimer.doResume();
  };


  this.doDestroy = function () {
    GameTimer.doDestroy();

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
    if(!tilesReady){return;}

    let grid = GameManager.grid_size;

    let margin_top = ((window.innerWidth / window.innerHeight) >= 1.3) ? 90 : 106;
    let margin_bottom = ((window.innerWidth / window.innerHeight) >= 1.3) ? 50 : 106;
    let margin_sides = 5;

    let max_tile_size = 140;

    let max_width = (oSTAGE.game_right - oSTAGE.game_left) - (margin_sides * 2);
    let max_height= (oSTAGE.game_bottom - oSTAGE.game_top) - margin_top - margin_bottom;

    frame.tiles.x = oSTAGE.game_center_x;
    frame.tiles.y = oSTAGE.game_top + margin_top + (max_height * 0.5);

    frame.wrong_alert.x = frame.tiles.x;
    frame.wrong_alert.y = frame.tiles.y;

    grid_spacing = Math.ceil(Math.min(max_tile_size, Math.min(max_width, max_height) / grid));
    
    let button_size = grid_spacing - 3;
    let myx = -(grid_spacing * (grid-1) * 0.5);
    let myy = -(grid_spacing * (grid-1) * 0.5);

    let button_radius = Math.min(12, button_size * 0.3);
    let button_text_scale = Math.min(1, button_size / 40);

    let grid_half_width = (grid_spacing * (grid) * 0.5);


    frame.game_goal.x = frame.tiles.x + grid_half_width - 6;
    frame.game_goal.y = frame.tiles.y - grid_half_width - 4;

    frame.game_time.x = frame.tiles.x - grid_half_width + 6;
    frame.game_time.y = frame.tiles.y - grid_half_width;
 
    frame.game_tries.x = frame.tiles.x;
    frame.game_tries.y = frame.tiles.y + grid_half_width;

    var tile_id = 0;

    for(row = 0; row < GameManager.grid_size; row++){
      for(col = 0; col < GameManager.grid_size; col++){
        let tile = tiles[tile_id];
        tile.x = myx + (col * grid_spacing);
        tile.y = myy + (row * grid_spacing);

        tile.txt.scale = button_text_scale;
        tile.txt.y = -(22*button_text_scale) * 0.5;

        let img_width = images.button_base.naturalWidth;
        let img_height = images.button_base.naturalHeight;
        let scale = Math.min(button_size/img_width, button_size/img_height);

        var m = new createjs.Matrix2D();
        m.translate(-button_size * 0.5, -button_size * 0.5);
        m.scale(scale,scale);

        //base
        tile.button_base.graphics.clear();
        tile.button_base.graphics.beginBitmapFill(images.button_base, "no-repeat", m).drawRoundRect(-button_size*0.5,-button_size*0.5,button_size,button_size,button_radius);

        //green
        tile.button_green.graphics.clear();
        tile.button_green.graphics.beginBitmapFill(images.button_green, "no-repeat", m).drawRoundRect(-button_size*0.5,-button_size*0.5,button_size,button_size,button_radius);

        //red
        tile.button_red.graphics.clear();
        tile.button_red.graphics.beginBitmapFill(images.button_red, "no-repeat", m).drawRoundRect(-button_size*0.5,-button_size*0.5,button_size,button_size,button_radius);

        tile_id++;
      }
    }

   
    
  }



  this.doResizeUpdate = function () {

    frame.b_restart.x = oSTAGE.game_right - 65;
    frame.b_restart.y = oSTAGE.game_bottom - 10;
    frame.b_home.x = oSTAGE.game_right - 5;
    frame.b_home.y = oSTAGE.game_bottom - 10;

    frame.messages.x = oSTAGE.game_center_x;
    frame.messages.y = oSTAGE.game_center_y;

    frame.game_score.x = oSTAGE.game_center_x;
    frame.game_score.y = oSTAGE.game_top;


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
