var SumagiGameManager = function () {
  var me = this;

  me.level = 1;

  this.doNewGame = function () {
    me.level = 1;
    me.score= 0;
    me.strikes = 0;
    me.lives = 3;

  /*
    var msg = "";
    for(let i=1; i<40; i++){
      let g = me.doNewLevel(i);
      msg += "," + g;
    }
    */
  };

  this.doNextLevel =  function(){
    me.level++;
    me.doNewLevel(me.level);
  }

  this.doNewLevel= function(l){
    me.level = l;
    me.tries = 0;
    me.time = 0;

    let difficulty_level = Math.ceil(me.level / oCONFIG.rounds_per_difficulty_level);

    me.grid_size = Math.min(8, 2 + Math.ceil(difficulty_level / 4));
    me.solution_length = (me.level<=1) ? 3 : (me.grid_size+1);

    let range_min = (difficulty_level + 2) * 3;
    let range_max = range_min + (difficulty_level);
    me.goal = __utils.getRandomInt(range_min, range_max);


    me.sequence = [];
  }


  this.doDestroy = function () {
    __snds.stopSound("music");
    inputListener.forget = true;
    me.forget = true;
  };


};