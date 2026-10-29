// Eriksen Flanker Task
//
// Classic arrow-flanker paradigm: a central target arrow ('<' or '>') is
// flanked by two distractor arrows on each side that either point the same
// direction (congruent) or the opposite direction (incongruent). Players
// tap left/right to report the direction of the *middle* arrow only.
//
// Primary dependent variable: the "flanker effect" -- the difference in
// mean correct RT between incongruent and congruent trials. Larger values
// indicate more interference from the irrelevant flankers (poorer
// selective attention / response inhibition).

(function () {
  "use strict";

  var CONFIG = {
    practiceTrialsPerCell: 2, // x4 cells (congruent/incongruent x left/right) = 8 practice trials
    mainTrialsPerCell: 10, // x4 cells = 40 main trials
    mainTimeoutMs: 1700,
    practiceTimeoutMs: 4000,
    fixationMinMs: 400,
    fixationMaxMs: 700,
    feedbackDurationMs: 500,
    interTrialIntervalMs: 300
  };

  var el = {}; // populated in init() with DOM references
  var mainResults = []; // trial records from the main block only, used for scoring

  // ---------------------------------------------------------------------
  // trial construction
  // ---------------------------------------------------------------------

  function oppositeDirection(direction) {
    return direction === "left" ? "right" : "left";
  }

  function stimulusString(direction, congruency) {
    // Plain ASCII angle brackets, not the Unicode "‹ ›" glyphs -- those
    // aren't reliably equal-width/symmetric across fonts (uneven side
    // bearings, or silent fallback-font substitution), which shows up as
    // uneven spacing around the target on incongruent trials. '<'/'>'
    // are guaranteed monospace in any monospace font stack and are what
    // the classic paradigm actually uses.
    var targetChar = direction === "left" ? "<" : ">";
    var flankerDirection = congruency === "congruent" ? direction : oppositeDirection(direction);
    var flankerChar = flankerDirection === "left" ? "<" : ">";
    return flankerChar + flankerChar + targetChar + flankerChar + flankerChar;
  }

  // Balanced, shuffled list of trials: equal counts of
  // congruent/incongruent x left/right.
  function buildTrials(perCell) {
    var congruencies = ["congruent", "incongruent"];
    var directions = ["left", "right"];
    var trials = [];
    congruencies.forEach(function (congruency) {
      directions.forEach(function (direction) {
        for (var i = 0; i < perCell; i++) {
          trials.push({ congruency: congruency, direction: direction });
        }
      });
    });
    return shuffle(trials);
  }

  function shuffle(array) {
    var a = array.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  // ---------------------------------------------------------------------
  // trial execution
  // ---------------------------------------------------------------------

  // Resolves with { side: 'left'|'right', time } on tap, or null on timeout.
  function waitForResponse(timeoutMs) {
    return new Promise(function (resolve) {
      var resolved = false;

      function finish(side) {
        if (resolved) return;
        resolved = true;
        var time = performance.now();
        cleanup();
        resolve(side ? { side: side, time: time } : null);
      }

      function onLeft(e) { e.preventDefault(); flashZone(el.zoneLeft); finish("left"); }
      function onRight(e) { e.preventDefault(); flashZone(el.zoneRight); finish("right"); }

      var timer = setTimeout(function () { finish(null); }, timeoutMs);

      function cleanup() {
        el.zoneLeft.removeEventListener("pointerdown", onLeft);
        el.zoneRight.removeEventListener("pointerdown", onRight);
        clearTimeout(timer);
      }

      el.zoneLeft.addEventListener("pointerdown", onLeft);
      el.zoneRight.addEventListener("pointerdown", onRight);
    });
  }

  function flashZone(zoneEl) {
    zoneEl.classList.add("pressed");
    setTimeout(function () { zoneEl.classList.remove("pressed"); }, 120);
  }

  function showFixation() { el.fixation.classList.remove("hidden"); }
  function hideFixation() { el.fixation.classList.add("hidden"); }

  function showStimulus(text) {
    el.stimulus.textContent = text;
    el.stimulus.classList.remove("hidden");
  }
  function hideStimulus() { el.stimulus.classList.add("hidden"); }

  function showFeedback(kind, text) {
    el.feedback.textContent = text;
    el.feedback.className = kind;
    el.feedback.classList.remove("hidden");
  }
  function hideFeedback() {
    el.feedback.classList.add("hidden");
    el.feedback.className = "hidden";
  }

  // Runs a single trial and, for main-block trials, records the result.
  async function runTrial(trial, meta, opts) {
    showFixation();
    await sleep(randRange(CONFIG.fixationMinMs, CONFIG.fixationMaxMs));
    hideFixation();

    Skillprint.trialStart(meta);

    var stimText = stimulusString(trial.direction, trial.congruency);
    showStimulus(stimText);
    var startTime = performance.now();

    var response = await waitForResponse(opts.timeoutMs);
    hideStimulus();

    var timedOut = response === null;
    var rt = timedOut ? null : Math.round(response.time - startTime);
    var correct = !timedOut && response.side === trial.direction;

    var outcome = {
      response: timedOut ? null : response.side,
      correct: correct,
      timedOut: timedOut,
      rt: rt
    };
    Skillprint.trialEnd(meta, outcome);

    if (opts.phase === "main") {
      mainResults.push({
        congruency: trial.congruency,
        direction: trial.direction,
        correct: correct,
        timedOut: timedOut,
        rt: rt
      });
    }

    if (opts.feedback) {
      if (timedOut) {
        showFeedback("timeout", "Too slow!");
      } else if (correct) {
        showFeedback("correct", "Correct");
      } else {
        showFeedback("incorrect", "Incorrect");
      }
      await sleep(CONFIG.feedbackDurationMs);
      hideFeedback();
    }

    await sleep(CONFIG.interTrialIntervalMs);
  }

  async function runBlock(trials, opts) {
    for (var i = 0; i < trials.length; i++) {
      var meta = { phase: opts.phase, index: i, congruency: trials[i].congruency, direction: trials[i].direction };
      await runTrial(trials[i], meta, opts);
    }
  }

  function showMessage(text) {
    return new Promise(function (resolve) {
      el.messageText.textContent = text;
      el.messageOverlay.classList.remove("hidden");
      function onTap(e) {
        e.preventDefault();
        el.messageOverlay.removeEventListener("pointerdown", onTap);
        el.messageOverlay.classList.add("hidden");
        resolve();
      }
      el.messageOverlay.addEventListener("pointerdown", onTap);
    });
  }

  // ---------------------------------------------------------------------
  // scoring
  // ---------------------------------------------------------------------

  function mean(numbers) {
    if (numbers.length === 0) return null;
    var sum = numbers.reduce(function (a, b) { return a + b; }, 0);
    return Math.round((sum / numbers.length) * 10) / 10;
  }

  function accuracy(trials) {
    if (trials.length === 0) return null;
    var nCorrect = trials.filter(function (t) { return t.correct; }).length;
    return Math.round((nCorrect / trials.length) * 1000) / 10; // percent, 1 decimal
  }

  function computeSummary() {
    var congruent = mainResults.filter(function (r) { return r.congruency === "congruent"; });
    var incongruent = mainResults.filter(function (r) { return r.congruency === "incongruent"; });

    var congruentRTs = congruent.filter(function (r) { return r.correct; }).map(function (r) { return r.rt; });
    var incongruentRTs = incongruent.filter(function (r) { return r.correct; }).map(function (r) { return r.rt; });

    var congruentMeanRT = mean(congruentRTs);
    var incongruentMeanRT = mean(incongruentRTs);
    var flankerEffectRT = (congruentMeanRT !== null && incongruentMeanRT !== null)
      ? Math.round((incongruentMeanRT - congruentMeanRT) * 10) / 10
      : null;

    return {
      nTrials: mainResults.length,
      overallAccuracy: accuracy(mainResults),
      congruentAccuracy: accuracy(congruent),
      incongruentAccuracy: accuracy(incongruent),
      congruentMeanRT: congruentMeanRT,
      incongruentMeanRT: incongruentMeanRT,
      flankerEffectRT: flankerEffectRT
    };
  }

  function renderResults(summary) {
    var rows = [
      ["Trials completed", summary.nTrials],
      ["Overall accuracy", summary.overallAccuracy !== null ? summary.overallAccuracy + "%" : "—"],
      ["Congruent accuracy", summary.congruentAccuracy !== null ? summary.congruentAccuracy + "%" : "—"],
      ["Incongruent accuracy", summary.incongruentAccuracy !== null ? summary.incongruentAccuracy + "%" : "—"],
      ["Congruent mean RT", summary.congruentMeanRT !== null ? summary.congruentMeanRT + " ms" : "—"],
      ["Incongruent mean RT", summary.incongruentMeanRT !== null ? summary.incongruentMeanRT + " ms" : "—"],
      ["Flanker effect (interference)", summary.flankerEffectRT !== null ? summary.flankerEffectRT + " ms" : "—"]
    ];
    el.resultsSummary.innerHTML = rows.map(function (row) {
      return "<div>" + row[0] + ": <span class=\"stat-value\">" + row[1] + "</span></div>";
    }).join("");
  }

  // ---------------------------------------------------------------------
  // top-level flow
  // ---------------------------------------------------------------------

  function showScreen(screenEl) {
    [el.startScreen, el.taskScreen, el.resultsScreen].forEach(function (s) {
      s.classList.add("hidden");
    });
    screenEl.classList.remove("hidden");
  }

  async function startTask() {
    showScreen(el.taskScreen);
    mainResults = [];
    Skillprint.taskStart();

    await showMessage(
      "Warm-up round. Tap left or right to match the MIDDLE arrow. " +
      "You'll see if you were right."
    );
    var practiceTrials = buildTrials(CONFIG.practiceTrialsPerCell);
    await runBlock(practiceTrials, { phase: "practice", timeoutMs: CONFIG.practiceTimeoutMs, feedback: true });

    await showMessage(
      "Now for the real thing. No more feedback — " +
      "respond as quickly and accurately as you can."
    );
    var mainTrials = buildTrials(CONFIG.mainTrialsPerCell);
    await runBlock(mainTrials, { phase: "main", timeoutMs: CONFIG.mainTimeoutMs, feedback: false });

    var summary = computeSummary();
    Skillprint.taskComplete(summary);
    renderResults(summary);
    showScreen(el.resultsScreen);
  }

  function init() {
    el.startScreen = document.getElementById("start-screen");
    el.taskScreen = document.getElementById("task-screen");
    el.resultsScreen = document.getElementById("results-screen");
    el.startButton = document.getElementById("start-button");
    el.restartButton = document.getElementById("restart-button");
    el.messageOverlay = document.getElementById("message-overlay");
    el.messageText = document.getElementById("message-text");
    el.fixation = document.getElementById("fixation");
    el.stimulus = document.getElementById("stimulus");
    el.feedback = document.getElementById("feedback");
    el.zoneLeft = document.getElementById("zone-left");
    el.zoneRight = document.getElementById("zone-right");
    el.resultsSummary = document.getElementById("results-summary");

    el.startButton.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      startTask();
    });
    el.restartButton.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      startTask();
    });

    // Best-effort: log an early quit if the app is backgrounded mid-task.
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden" && !el.taskScreen.classList.contains("hidden")) {
        Skillprint.taskQuit({ phase: "unknown", index: mainResults.length });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
