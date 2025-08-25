var GameTime = 0;

var Skillprint = {

  LevelStart(data) {
    logEvent({
      event: "LEVEL_START",
      level: data.level,
      objectives: data.objectives
    });
    // console.log("LEVEL_START " + data.level + " - " + data.objectives);
  },

  sendDragDrop(data) {
    logEvent({
      event: data.event,
      object_id: data.object_id,
      time: GameTime
    });
    // console.log(data.event + " (" + data.object_id + ") - " + GameTime);
  },

  sendMatch(data) {
    logEvent({
      event: data.event,
      object_done: data.object_done,
      time: GameTime
    });
    // console.log(data.event + " - " + data.object_done + " - " + GameTime);
  },

  levelComplete(data) {
    logEvent({
      event: "LEVEL_COMPLETE",
      level: data.level,
      time: GameTime,
    });
    // console.log("LEVEL_COMPLETE" + " (" + data.level + ") - " + GameTime);
  },

  LevelQuit(data) {
    logEvent({
      event: "LEVEL_QUIT",
      level: data.level
    });
    // console.log("LEVEL_QUIT" + " (" + data.level + ")");
  }
}