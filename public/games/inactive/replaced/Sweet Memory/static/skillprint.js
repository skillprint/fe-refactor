var SKILLPRINT_API = 'https://api.skillprint.co';

var url = new URL(window.location.href);
var sessionId = url.searchParams.get('sessionId');
var api = `${SKILLPRINT_API}/users/session_update/?session_id=${sessionId}`;
var api2 = `${SKILLPRINT_API}/users/session_create_in_game/?session_id=${sessionId}`;

var gamescore = 0;
var gametime = 0;
var totalcard = 0;
var GameLevel = 0;
var GameEnd = 0;

var Skillprint = {

  LevelStart() {
    logEvent({
      event: "LEVEL_START",
      level: GameLevel,
      score: gamescore,
      timeleft: gametime,
      totalcard: totalcard
    });
    // console.log("LEVEL_START (" + GameLevel + ") Score: " + gamescore + " Timeleft: " + gametime + " Cards: " + totalcard);
  },

  CheckCard(data) {
    logEvent({
      event: data.event,
      score: gamescore,
      timeleft: gametime,
    });
    // console.log(data.event + " - Score: " + gamescore + " Timeleft: " + gametime);
  },

  TapFlip(data) {
    logEvent({
      event: "FLIP",
      name: data.name,
      position: data.position
    });
    // console.log("FLIP" + " - Name: " + data.name + " Position: " + data.position);
  },

  levelComplete() {
    logEvent({
      event: "LEVEL_COMPLETE",
      level: GameLevel,
      score: gamescore,
      timebonus: gametime
    });
    // console.log("LEVEL_COMPLETE (" + GameLevel + ") - Score: " + gamescore + " Time bonus: " + gametime);
  },

  LevelFailed(data) {
    logEvent({
      event: "LEVEL_FAILED",
      level: GameLevel,
      score: data.score
    });
    // console.log("LEVEL_FAILED (" + GameLevel + ") - Score: " + data.score);
  },

  LevelQuit() {
    logEvent({
      event: "LEVEL_QUIT",
      level: GameLevel,
      score: gamescore
    });
    // console.log("LEVEL_QUIT (" + GameLevel + ") - Score: " + gamescore);
  }
}