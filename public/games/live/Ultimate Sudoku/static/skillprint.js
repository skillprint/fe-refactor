var gamedifficulty;
var gametotal = 0;
var gametime = 0;
var timemode = 0;
var GameScore;

var Skillprint = {

  LevelStart() {
    logEvent({
      event: "LEVEL_START",
      difficulty: gamedifficulty
    });
  },

  sendCell(data) {
    logEvent({
      event: "ACTIVE_CELL",
      cell: data.cell
    });
  },

  sendEnter(data) {
    logEvent({
      event: data.validation,
      number: data.number,
      times: gametime,
      total: gametotal,
    });
  },

  sendDelete(data) {
    logEvent({
      event: "DELETE",
      number: data.number,
      times: gametime,
      total: gametotal,
    });
  },

  LevelQuit(data) {
    logEvent({
      event: "LEVEL_QUIT",
      difficulty: gamedifficulty,
      times: gametime,
      score: data.scores,
    });
  },

  LevelComplete(data) {
    logEvent({
      event: "LEVEL_COMPLETE",
      difficulty: gamedifficulty,
      times: gametime,
      score: data.scores,
    });
  }
}