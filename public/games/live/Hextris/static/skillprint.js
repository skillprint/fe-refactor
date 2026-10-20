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

// Hextris's full state, sent with every screenshot (window.skillprintGameState,
// public/games/GAME_STATE.md) and every 500 ms as a gameState message
// (js/update.js), as data for scoring and for training game-playing models.
// - rotation: how many sixths the hex has turned (MainHex.position, 0-5).
// - stacks: for each side of the hex (sides turn with it), the colours stacked
//   on it, nearest the hex first.
// - falling: each block still falling: its screen lane (0-5, as
//   Block.fallingLane), the side it would land on at the current rotation,
//   its colour, and its distance out, from 1 (just spawned) to 0 (at the hex).
// - combo: whether a combo is running, so the next clear multiplies.
window.skillprintGameState = function () {
  var hex = typeof MainHex !== "undefined" ? MainHex : null;
  var sides = hex ? hex.sides : 6;
  var rotation = hex ? ((hex.position % sides) + sides) % sides : 0;
  var startDist = typeof settings !== "undefined" ? settings.startDist * settings.scale : 1;
  var stacks = hex && hex.blocks
    ? hex.blocks.map(function (side) { return side.map(function (b) { return Skillprint.colorName(b.color); }); })
    : [];
  var falling = (typeof blocks !== "undefined" ? blocks : [])
    .filter(function (b) { return !b.settled && !b.removed; })
    .map(function (b) {
      return {
        lane: b.fallingLane,
        side: (sides - b.fallingLane + rotation) % sides,
        color: Skillprint.colorName(b.color),
        distance: Math.round(Math.max(0, b.distFromHex / startDist) * 1000) / 1000
      };
    });
  var state = typeof gameState !== "undefined" ? gameState : 0;
  return {
    score: typeof score !== "undefined" ? score : 0,
    difficulty: typeof waveone !== "undefined" ? waveone.difficulty : 0,
    gameState: state,
    isGameOver: state === 2,
    rotation: rotation,
    stacks: stacks,
    falling: falling,
    blocksOnScreen: falling.length,
    lockedBlocks: stacks.reduce(function (n, side) { return n + side.length; }, 0),
    combo: !!(hex && typeof settings !== "undefined" && hex.ct - hex.lastCombo < settings.comboTime)
  };
};
