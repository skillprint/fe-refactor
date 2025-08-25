var SweetMemoryGameManager = function () {
  var me = this;

  me.level = 1;
  me.found = 0;
  me.image_a = null;
  me.image_b = null;



  var ready_callback = null;

  this.doNewGame = function () {
    me.level = 1;
    me.score= 0;
    me.score_holder = 0;
  };

  this.doNewLevel =  function(level){
    me.score_holder = me.score;
    me.level = level;
    me.found = 0;
    me.card_1 = null;
    me.card_2 = null;
    me.pairs_found = 0;
    me.consecutive_matches= 0;
    me.pairs_count = oCONFIG.levels[me.level-1].pairs;

  }

  this.doDestroy = function () {
   // __snds.stopSound("music");
    GameTimer.doDestroy();
    inputListener.forget = true;
    me.forget = true;
  };


};
