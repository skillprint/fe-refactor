var sizeselected;
var gamescore;

var Skillprint = {

  LevelStart(data) {
    logEvent({
      event: "LEVEL_START",
      size: sizeselected,
      empty: data.empty,
      full: data.full
    });
    /* console.log("LEVEL_START " + sizeselected);
    console.log("Empty state : " + data.empty);
    console.log("Full state : " + data.full); */
  },

  sendTap(data) {
    logEvent({
      event: "TAP",
      position: data.position,
      color: data.color
    });
    // console.log("TAP " + "Position : " + data.position + " " + data.color);
  },

  sendUndo(data) {
    logEvent({
      event: "UNDO_MOVE",
      position: data.position,
      color: data.color
    });
    // console.log("UNDO_MOVE " + "Position : " + data.position + " " + data.color);
  },

  LevelComplete(data) {
    logEvent({
      event: "LEVEL_COMPLETE",
      size: sizeselected,
      score: data.score
    });
    // console.log("LEVEL_COMPLETE " + sizeselected + "-" + data.score);
  },

  LevelQuit(data) {
    logEvent({
      event: "LEVEL_QUIT",
      size: sizeselected,
      score: data.score
    });
    // console.log("LEVEL_QUIT " + sizeselected + "-" + data.score);
  }
}