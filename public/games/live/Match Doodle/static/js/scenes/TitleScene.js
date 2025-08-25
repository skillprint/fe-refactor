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

    me.doGenerateDoodles();

    BlitFader.doFadeIn(500);

   
  };



  this.doGenerateDoodles =  function(){
    
    let min_y = oSTAGE.game_top;
    let max_y = oSTAGE.game_bottom;
    let min_x = oSTAGE.game_left;
    let max_x = oSTAGE.game_right;

    let max_spacing = 40;

    //generate list of random possible spots
    let random_spots = [];
    let x = min_x;
    let y = min_y;
    let spacing = max_spacing;
    do{
      random_spots.push(new createjs.Point(x,y));
      x += spacing;
      if(x > max_x){
        y += spacing;
        x=min_x;
      }
    }while(y <= max_y);


    //remove selected
    for(var i=random_spots.length-1; i>=0; i--){
      let pnt = random_spots[i];
      let ok=true;

      if(pnt.x <= oSTAGE.game_left + 100 && pnt.y <= oSTAGE.game_top + 100){
        ok=false;
      }
      if(pnt.x >= oSTAGE.game_right - 100 && pnt.y <= oSTAGE.game_top + 100){
        ok=false;
      }

      if(pnt.y >= oSTAGE.game_bottom - 120){
        ok=false;
      }

      if(Math.abs(pnt.x - frame.logo.x) < 160 && Math.abs(pnt.y - frame.logo.y) < 120){
        ok=false;
      }

      if(!ok){
        random_spots.splice(i,1);
      }
    }
    
    //add cards to group
     //create list of all tiles to use
    var card_ids = [];
    for(let i=1; i<=random_spots.length; i++){
      let r = __utils.getRandomInt(1, oCONFIG.doodles.length-1);
      card_ids.push(r);
    }
    card_ids = __utils.doRandomizeArray(card_ids);

    let amt = Math.min(card_ids.length-1,random_spots.length-1 );
    cards = [];
    for(let i=0; i<amt; i++){
      var card_id = card_ids[i];
      var card = new DoodleCard(card_id, frame);
      card.clip.scale = 0.4;
      let r = __utils.getRandomInt(0, random_spots.length - 1);
      let random_pnt = random_spots.splice(r, 1)[0];
      random_pnt.x += __utils.getRandomArbitrary(-20,20);
      random_pnt.y += __utils.getRandomArbitrary(-20,20);

      card.doSetPos(random_pnt.x - frame.cards.x, random_pnt.y - frame.cards.y);
      cards.push(card);
    }




  }

  //---------------------------------
  // User Actions
  //---------------------------------


  this.doChooseHelp = function(){
     if (IsLocked) {
      return;
    }
    IsLocked = true;
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


    GameManager.level = 1;

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

    frame.cards.x = oSTAGE.game_size.center_x;
    frame.cards.y = frame.logo.y;

    frame.b_help.myy = frame.b_help.y = oSTAGE.game_bottom - 20;
    frame.b_help.x = oSTAGE.game_size.center_x - 130 ;

    //recache
    if (me.scale != oSTAGE.scale) {
    }

    frame.x = oSTAGE.game_width_margins;
    frame.y = oSTAGE.game_height_margins;
    me.scale = oSTAGE.scale;
  };

  me.doInit();
};
