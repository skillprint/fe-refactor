var SKILLPRINT_API = 'https://api.skillprint.co';

var url = new URL(window.location.href);
var sessionId = url.searchParams.get('sessionId');
var api = `${SKILLPRINT_API}/users/session_update/?session_id=${sessionId}`;
var api2 = `${SKILLPRINT_API}/users/session_create_in_game/?session_id=${sessionId}`;
var gamelevel = 1;
var gamescore = 0;
var gamelives = 0;
var GameEnd = 0;
var GameState = "";
var Skillprint = {

  startGame(data) {
    return axios
      .post(api, {
        event: "GAME_START",
        timestamp: new Date().toISOString()
      })
  },

  levelStart(data) {
    return axios
      .post(api, {
        event: "LEVEL_START",
        level: gamelevel,
        lives: gamelives,
        timestamp: new Date().toISOString()
      }),
      GameState = "Play";
  },

  playerDeath(data) {
    return axios
      .post(api, {
        event: "DEATH",
        score: gamescore,
        lives: gamelives,
        timestamp: new Date().toISOString()
      })
  },

  playerArrived(data) {
    return axios
      .post(api, {
        event: "ARRIVED",
        score: gamescore,
        lives: gamelives,
        timestamp: new Date().toISOString()
      })
  },

  levelFailed(data) {
    return axios
      .post(api, {
        event: "LEVEL_FAILED",
        score: gamescore,
        level: gamelevel,
        timestamp: new Date().toISOString()
      }),
      GameState = "End";
  },

  levelComplete(data) {
    return axios
      .post(api, {
        event: "LEVEL_COMPLETED",
        score: gamescore,
        level: gamelevel,
        lives: gamelives,
        timestamp: new Date().toISOString()
      })
  },

  endGame(data) {
    return axios
      .post(api, {
        event: "GAME_END",
        timestamp: new Date().toISOString()
      })
  },

  newSession() {
    return axios
      .post(api2, {
        at_opened: new Date().toISOString()
      })
      .then(function (response) {
          sessionId = response.data.id;
          api = `${SKILLPRINT_API}/users/session_update/?session_id=${sessionId}`;
          api2 = `${SKILLPRINT_API}/users/session_create_in_game/?session_id=${sessionId}`;
        }, setTimeout(function () {
          GameEnd = 0;
          Skillprint.startGame();
        }, 500),
        setTimeout(function () {
          Skillprint.levelStart();
        }, 1000))
      .catch(function (error) {
        console.log(error);
      })
  }
}