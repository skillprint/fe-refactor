// Telemetry wrapper for the Flanker Task. See Documentation.txt for the
// full event list. All events are sent via the injected `logEvent`
// function (see ../../../inject.js at the repo root).

var Skillprint = {

  taskStart: function () {
    logEvent({
      event: "LEVEL_START",
      task: "flanker"
    });
  },

  trialStart: function (meta) {
    logEvent({
      event: "TRIAL_START",
      phase: meta.phase,
      trialIndex: meta.index,
      congruency: meta.congruency,
      direction: meta.direction
    });
  },

  trialEnd: function (meta, outcome) {
    logEvent({
      event: "TRIAL_END",
      phase: meta.phase,
      trialIndex: meta.index,
      congruency: meta.congruency,
      direction: meta.direction,
      response: outcome.response,
      correct: outcome.correct,
      timedOut: outcome.timedOut,
      rt: outcome.rt
    });
  },

  taskComplete: function (summary) {
    var payload = { event: "LEVEL_COMPLETE" };
    for (var key in summary) {
      if (Object.prototype.hasOwnProperty.call(summary, key)) {
        payload[key] = summary[key];
      }
    }
    logEvent(payload);
  },

  taskQuit: function (progress) {
    logEvent({
      event: "LEVEL_QUIT",
      phase: progress.phase,
      trialIndex: progress.index
    });
  }

};
