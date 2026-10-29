# Flanker Task

The Eriksen arrow-flanker task, a cognitive-validation task from the `games` repo (`live/Flanker Task`). This is the pilot for bringing the games repo's cognitive tasks into the portal.

The portal copy differs from the games repo in these ways:
- **`static/index.html`:**
  - A `logEvent` stub queues events until `../../SkillprintLib/skillprintScreenshot.js` loads.
  - That script then forwards every event to `GameClient` as a `gameEvent` (fe-refactor#45), and it takes the screenshots.
  - In the games repo, `package.py` injected `inject.js` instead.
- **`static/skillprintShim.js`:**
  - Forwards keys 1-9 to the parent.
  - Ignores `ADJUST_GAME`. The protocol is fixed (8 practice + 40 main trials, balanced for congruency and direction), so scores stay comparable, and the task has no difficulty knobs.

## Events

`Documentation.txt` has the full list:

| Event | When | Fields |
|---|---|---|
| `LEVEL_START` | Start is tapped | `task` |
| `TRIAL_START` | Each trial | `phase`, `trialIndex`, `congruency`, `direction` |
| `TRIAL_END` | Each trial | Same as `TRIAL_START`, plus `response`, `correct`, `timedOut`, `rt` (ms) |
| `LEVEL_COMPLETE` | The task finishes | Accuracy and mean correct RT by congruency, and `flankerEffectRT` (incongruent minus congruent mean RT) |
| `LEVEL_QUIT` | The player leaves mid-task | |

## Backend

A session starts only if marketplace has a listed, active, PWA-playable `Game` with slug `flanker-task`. The marketplace seed script `api_backend/scripts/seed-flanker-task.sh` creates it.
