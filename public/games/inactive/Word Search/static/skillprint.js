var SKILLPRINT_API = 'https://api.staging.skillprint.co';

var url = new URL(window.location.href);
var sessionId = url.searchParams.get('sessionId');
var api = `${SKILLPRINT_API}/users/session_update/?session_id=${sessionId}`;
var api2 = `${SKILLPRINT_API}/users/session_create_in_game/?session_id=${sessionId}`;
var gamecategory = "";
var gamewords;
var gamelanguage;
var gametime;
var gamescore;
var GameEnd = 0;

var Skillprint = {
  startGame(data) {
    return axios
      .post(api, {
        event: "GAME_START",
        category: gamecategory,
        language: gamelanguage,
        words: gamewords,
        timestamp: new Date().toISOString()
      })
  },

  sendDrag(data) {
    return axios
      .post(api, {
        event: "DRAG",
        direction: data.direction,
        time: gametime,
        timestamp: new Date().toISOString()
      })
  },

  sendWord(data) {
    return axios
      .post(api, {
        event: "CORRECT_WORD",
        word: data.word,
        time: gametime,
        timestamp: new Date().toISOString()
      })
  },

  sendPause(data) {
    return axios
      .post(api, {
        event: "GAME_PAUSE",
        timestamp: new Date().toISOString()
      })
  },

  sendResume(data) {
    return axios
      .post(api, {
        event: "GAME_RESUME",
        timestamp: new Date().toISOString()
      })
  },

  endGame(data) {
    return axios
      .post(api, {
        event: "GAME_END",
        category: gamecategory,
        time: gametime,
        score: data.score,
        timestamp: new Date().toISOString()
      })
  },

  restartGame(data) {
    return axios
      .post(api, {
        event: "GAME_RESTART",
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
      }, 500))
      .catch(function (error) {
        console.log(error);
      })
  }
}