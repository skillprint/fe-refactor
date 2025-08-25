var GameState = "";

var Skillprint = {
  LevelStart() {
    // logEvent({
    //   event: "LEVEL_START"
    // });
    // console.log("LEVEL_START");
    GameState = "Play";
  },

  sendCW(data) {
    // logEvent({
    //   event: "CLOCKWISE_TAP",
    //   score: data.score
    // });
    // console.log("CLOCKWISE_TAP - " + data.score);
  },

  sendCCW(data) {
    // logEvent({
    //   event: "ANTICLOCKWISE_TAP",
    //   score: data.score
    // });
    // console.log("ANTICLOCKWISE_TAP - " + data.score);
  },

  TwoColorsMeet(data) {
    // logEvent({
    //   event: "2_COLORS",
    //   color: data.color,
    //   score: data.score
    // });
    // console.log("2_COLORS (" + data.color + ") - " + data.score);
  },

  ThreeColorsMeet(data) {
    // logEvent({
    //   event: "3_COLORS",
    //   color: data.color,
    //   score: data.score
    // });
    // console.log("3_COLORS (" + data.color + ") - " + data.score);
  },

  BlockMatch(data) {
    // logEvent({
    //   event: "MATCH",
    //   color: data.color,
    //   score: data.score
    // });
    // console.log("MATCH (" + data.color + ") - " + data.score);
  },

  sendPause() {
    // logEvent({
    //   event: "GAME_PAUSE"
    // });
    // console.log("GAME_PAUSE");
    GameState = "Pause";
  },

  sendResume() {
    // logEvent({
    //   event: "GAME_RESUME"
    // });
    // console.log("GAME_RESUME");
    GameState = "Play";
  },

  LevelFailed(data) {
    // logEvent({
    //   event: "LEVEL_FAILED",
    //   score: data.score
    // });
    // console.log("LEVEL_FAILED - " + data.score);
    GameState = "End";
  },

  LevelRestart(data) {
    // logEvent({
    //   event: "LEVEL_RESTART",
    //   score: data.score
    // });
    // console.log("LEVEL_RESTART - " + data.score);
    setTimeout(function () {
      Skillprint.LevelStart();
    }, 100);
  }
}