var SKILLPRINT_API = 'https://api.skillprint.co';

var url = new URL(window.location.href);
var sessionId = url.searchParams.get('sessionId');
var api = `${SKILLPRINT_API}/users/session_update/?session_id=${sessionId}`;
var api2 = `${SKILLPRINT_API}/users/session_create_in_game/?session_id=${sessionId}`;
var image_name;
var pieces;
var timeelapsed;
var gamescore = 0;
var GameEnd = 0;
var Skillprint = {

  startGame() {
    return axios
      .post(api, {
        event: "GAME_START",
        image: image_name,
        pieces: pieces,
        timestamp: new Date().toISOString()
      })
  },

  puzzleMatch() {
    return axios
      .post(api, {
        event: "PUZZLE_MATCH",
        score: gamescore,
        time: timeelapsed,
        timestamp: new Date().toISOString()
      })
  },

  restartGame() {
    return axios
      .post(api, {
        event: "GAME_RESTART",
        timestamp: new Date().toISOString()
      })
  },

  endGame(data) {
    return axios
      .post(api, {
        event: "GAME_END",
        image: image_name,
        pieces: pieces,
        score: gamescore,
        time: timeelapsed,
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
        Skillprint.startGame({
          image: image_name,
          pieces: pieces
        });
      }, 500))
      .catch(function (error) {
        console.log(error);
      })
  }
}