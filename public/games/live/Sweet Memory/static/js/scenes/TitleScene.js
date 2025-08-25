var TitleScene = function () {
  trace("TitleScene()");

  var me = this;
  var canvas = document.getElementById("canvas_screens");
  var stage = BlitStage(canvas, { webgl: false });
  var frame = stage.addChild(new lib.scene_title());

  var IsLocked = true;
  var prompt_attempt = 0;

  var buildComplete = false;

  var timeout;

  //---------------------------
  // init
  //---------------------------

  this.doInit = function () {

   /* 
		let action =  function(){
      GameManager.level = 1;
      SceneManager.doDestroy();
      SceneManager = new GameScene();
		}
		BlitFader.doFadeOut(200, action);
		return;


  
*/
    IsLocked = false;
    me.forget = false;
    update_queue.push(me);
    me.doResizeUpdate();
    RESIZER.needUpdate = true;

    var delay = 500;

    //play button
    __utils.doText(frame.b_play.txt, oLANG.play);
    frame.b_play.visible = false;
    frame.b_play.helper = new __utils.ButtonHelper(stage,frame.b_play,"norm","over");
    frame.b_play.addEventListener("click", me.doChoosePlay);
    frame.b_play.y = oSTAGE.game_bottom + 210;
    
    createjs.Tween.get(frame.b_play, { override: true }).wait(delay).set({ visible: true }).to({ y: frame.b_play.myy }, 500, createjs.Ease.cubicOut);
    stage.activeTweens.push(frame.b_play);

    frame.b_help.visible = false;
    frame.b_help.helper = new __utils.ButtonHelper(stage,frame.b_help,"norm","over");
    frame.b_help.addEventListener("click", me.doChooseHelp);
    frame.b_help.y = oSTAGE.game_bottom + 210;

    delay+=100;
    
    createjs.Tween.get(frame.b_help, { override: true }).wait(delay).set({ visible: true }).to({ y: frame.b_help.myy }, 500, createjs.Ease.cubicOut);
    stage.activeTweens.push(frame.b_help);


  //  __snds.playSound("music_title_loop", "music", -1, .5);

    BlitFader.doFadeIn(500);

   
  };

  //---------------------------------
  // User Actions
  //---------------------------------


  this.doChooseHelp = function(){

    
    __snds.playSound("snd_click", "ui");
    
    let goto_title_action =  function(){
      SceneManager.doDestroy();
      SceneManager = new TitleScene();
    }

    let goto_help_action =  function(){
      SceneManager.doDestroy();
      SceneManager = new TutorialScene(goto_title_action, "ok");
    }

    BlitFader.doFadeOut(200, goto_help_action);

  }



  this.doChoosePlay = function (o) {
    if (IsLocked) {
      return;
    }
    IsLocked = true;
    __snds.playSound("snd_click", "ui");

    GameManager.doNewGame();

    let goto_game_action =  function(){
        SceneManager.doDestroy();
        doFinishLoading(()=>{
          SceneManager.doDestroy();
          SceneManager = new GameScene();
        });
      }
      
      let goto_help_action =  function(){
        SceneManager.doDestroy();
        SceneManager = new TutorialScene(goto_game_action, "play");
      }

      let action = (oUSER.seen_help) ? goto_game_action : goto_help_action;
      BlitFader.doFadeOut(200, action);

  };

  this.doDestroy = function () {
    stage.removeAllChildren();
    stage.enableMouseOver(0);
    me.forget = true;
    stage.needUpdate = true;
  };

  //------------------------
  // resize
  //------------------------

  this.doResizeUpdate = function () {
    frame.b_play.myy = frame.b_play.y = oSTAGE.game_bottom - 20;
    frame.b_play.x = oSTAGE.game_size.center_x;

    let logo_space = ((oSTAGE.game_bottom-80) - oSTAGE.game_top);
   
    frame.logo.x = oSTAGE.game_size.center_x;
    frame.logo.y = oSTAGE.game_top + (logo_space * 0.5);

   // frame.logo.scale = Math.min(1, ((oSTAGE.game_right - oSTAGE.game_left) - 20) / 500);

   frame.candy_left.x = oSTAGE.game_left;
   frame.candy_left.y = oSTAGE.game_bottom;

   frame.candy_right.x = oSTAGE.game_right;
   frame.candy_right.y = oSTAGE.game_bottom;


    frame.b_help.myy = frame.b_help.y = oSTAGE.game_bottom - 20;
    frame.b_help.x = oSTAGE.game_size.center_x - 150 ;

    //recache
    if (me.scale != oSTAGE.scale) {
    }

    frame.x = oSTAGE.game_width_margins;
    frame.y = oSTAGE.game_height_margins;
    me.scale = oSTAGE.scale;
  };

  me.doInit();
};
