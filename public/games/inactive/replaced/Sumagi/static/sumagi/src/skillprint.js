var gamedifficulty = 0;
var gameboard = 0;
var gameround = 1;
var gametime = 0;

var TotalGameTime = 0;
var TotalTiles = 1;

var Skillprint = {

  //Level Start / Start Playing
  levelStart(data) {
    logEvent({
      event: "LEVEL_START",
      difficulty: data.difficulty,
      board: data.board,
      level: data.level,
      sumgoal: data.answer
    });

    // console.log("LEVEL_START (" + data.level + ") " + data.difficulty + " - " + data.board);
  },

  //Player match the tile
  sendTap(data) {
    logEvent({
      event: "TAP",
      tries: data.tries,
      times: gametime,
      totalsum: data.sumtotal,
      sumgoal: data.answer,
      tiles: TotalTiles
    });

    // console.log("TAP (" + data.tries + ") Time: " + gametime + " - Total Sum: " + data.sumtotal + " - Sum goal: " + data.answer + " - Total tiles: " + TotalTiles);
  },

  //Player finish the level
  levelComplete(data) {
    logEvent({
      event: "LEVEL_COMPLETE",
      level: gameround,
      tries: data.tries,
      times: gametime,
      sumgoal: data.answer,
    });

    // console.log("LEVEL_COMPLETE (" + gameround + ") Time: " + gametime + " - Total Tries: " + data.tries + " - Sum goal: " + data.answer);
  },

  //Player quit in the middle of the game
  LevelQuit() {
    logEvent({
      event: "LEVEL_QUIT",
      level: gameround
    });

    // console.log("LEVEL_QUIT (" + gameround + ")");
  }
}