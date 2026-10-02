var GameState = "";

// Telemetry events for the Skillprint portal. Each is posted to the parent
// shell as {type: 'gameEvent', data: {event, at, ...}}, where `at` is when it
// happened in epoch milliseconds (performance.timeOrigin + performance.now(),
// which the shell's clock matches). The shell turns it into session time and
// sends it with the next screenshot upload.
//
// Universal events (the SDK's GameEvent): GAME_START, LEVEL_START,
// LEVEL_FAILED, LEVEL_RESTART, GAME_PAUSE, GAME_RESUME, MATCH. Hextris is
// endless, so a run is a level: it starts, and it fails at game over.
// Game-specific: ROTATE_CLOCKWISE, ROTATE_ANTICLOCKWISE.

var COLOR_NAMES = { "#e74c3c": "RED", "#f1c40f": "YELLOW", "#3498db": "BLUE", "#2ecc71": "GREEN" };

var Skillprint = {
  gameStarted: false,

  now() {
    return typeof performance !== "undefined" && performance.timeOrigin
      ? performance.timeOrigin + performance.now()
      : Date.now();
  },

  send(event, data) {
    if (!window.parent || window.parent === window) return;
    var payload = Object.assign({}, data || {}, { event: event, at: Skillprint.now() });
    window.parent.postMessage({ type: "gameEvent", data: payload }, "*");
  },

  colorName(color) {
    return COLOR_NAMES[color] || color;
  },

  LevelStart() {
    if (!Skillprint.gameStarted) {
      Skillprint.gameStarted = true;
      Skillprint.send("GAME_START");
    }
    Skillprint.send("LEVEL_START", { score: typeof score !== "undefined" ? score : 0 });
    GameState = "Play";
  },

  // steps is Hex.rotate's: 1 turns the hexagon anticlockwise (left key, A,
  // or a tap on the left half), -1 clockwise.
  Rotate(steps, data) {
    Skillprint.send(steps > 0 ? "ROTATE_ANTICLOCKWISE" : "ROTATE_CLOCKWISE", data);
  },

  BlockMatch(data) {
    Skillprint.send("MATCH", data);
  },

  sendPause() {
    Skillprint.send("GAME_PAUSE");
    GameState = "Pause";
  },

  sendResume() {
    Skillprint.send("GAME_RESUME");
    GameState = "Play";
  },

  LevelFailed(data) {
    Skillprint.send("LEVEL_FAILED", data);
    GameState = "End";
  },

  LevelRestart(data) {
    Skillprint.send("LEVEL_RESTART", data);
    setTimeout(function () {
      Skillprint.LevelStart();
    }, 100);
  }
};
