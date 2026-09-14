---
name: instrument-telemetry-events
description: Instruments a Skillprint game (public/games/live/<GameName>/) with universal (game-agnostic, fixed-vocabulary) and/or custom (game-specific) telemetry events — the two event-based layers of Skillprint's three-layer telemetry design (raw screenshots+state, universal events, custom events), which exist to give convergent validity: independent signals about the same gameplay that cross-check each other. Use this whenever the user asks to add telemetry/event tracking to a game, wire up LEVEL_START/LEVEL_COMPLETE/GAME_PAUSE-style events, add custom per-action events for an owned game, or mentions "universal telemetry", "convergent validity", "world model corpus", or the telemetry layers by name. Always checks whether the event actually reaches the backend before claiming the game is instrumented — the pipe is dead-by-default in this codebase, not just unused.
---

# Instrument Telemetry Events

Skillprint's telemetry design has three layers, each answering a question the others can't:

- **Layer 0 — raw screenshots + game state.** The general-purpose substrate for training world
  models, independent of any current skill taxonomy.
- **Layer 1 — universal telemetry.** A small, fixed, game-agnostic event vocabulary
  (`LEVEL_START`, `LEVEL_COMPLETE`, `GAME_PAUSE`, ...) that cleans training data (strip menus/pause
  screens), tags sessions for cross-game comparison, prioritizes capture density, and gives a
  cheap sanity check on the vision pipeline (event says `LEVEL_COMPLETE` but vision-derived
  progress didn't move → flag that chunk).
- **Layer 2 — custom telemetry for owned games.** Rich, game-specific events (e.g. a reaction-time
  signal between tap events) that validate an LLM-derived skill score against a real cognitive
  measure, and provide ground-truth labels to train the vision-based scorer itself.

This skill covers **Layers 1 and 2** — both are the same mechanical problem (emit a named JSON
event from the game, get it into `Session.telemetry` on the backend), differing only in vocabulary
and purpose. Layer 0 (screenshots) is already captured automatically by the existing harness/SDK
for every game — there is nothing to instrument there today, and the missing piece (a
structured game-state blob alongside each frame) has no backend endpoint to send it to yet. Don't
invent one; see **Known gaps** below and tell the user it needs backend work first.

## Ground truth: what exists today, and what's actually dead

Verified against the current code (September 2026) — don't trust older assumptions:

- **The event-ingestion endpoint is real**: `POST /games/api/sessions/telemetry?session_id=<id>&game_slug=<slug>`
  (`SessionAddTelemetryAPIView`, marketplace `games/views.py`), body `{"event": {...arbitrary JSON...}}`,
  appended to the session's `telemetry` JSONField. Auth: partner API key or SPA-origin (no Knox
  requirement). It does **not** validate the event name against any vocabulary — anything JSON-shaped
  is accepted and stored.
- **Nothing on the frontend calls it.** `_shared/harness.js` (the shared dev harness used by
  Stroop Test, Simon Says, Order Rush, Typing Speed, Reaction Time, Dual N-Back, Guided Breathing,
  Procedural Maze, etc.) only knows how to POST session start/stop and screenshots, plus send
  `ADJUST_GAME`. It has **no `sendEvent`/telemetry function at all**.
- **An older convention exists but is unwired.** A family of Construct/CreateJS-era games (Sweet
  Memory, Match Doodle, Fruit Sorting, Photo Hunt, Sumagi, Star Puzzles, Colorize 2, Gems of Hanoi,
  Mahjong Deluxe) call a local `spLogEvent(o)` → global `logEvent(params)` → `postMessage`
  (`messageType: 'gameEvent'`) — real per-action events like Sweet Memory's `LEVEL_START`, `FLIP`,
  `MATCH`, `UNMATCH`, `LEVEL_COMPLETE`. **The live portal's message handler
  (`app/game/[slug]/GameClient.tsx`) has no `case` for `'gameEvent'`** — these events are emitted
  into the void today. (The only place that even reads `'gameEvent'` is the separate dev tool
  `app/labs/ai_guide/AiGuideClient.tsx`, and only to trigger a session start on `LEVEL_START` — it
  never forwards or persists the event.)
- **Hextris has a commented-out Layer-2 precedent**: `static/skillprint.js` defines `sendCW`/`sendCCW`
  hooks meant to call `logEvent({event: "CLOCKWISE_TAP", ...})` and `"ANTICLOCKWISE_TAP"` — every
  `logEvent(...)` call in that file is commented out. This is exactly the kind of granular,
  game-specific event Layer 2 wants; it was scaffolded once and never finished.
- **Dungeon Runner is a separate, newer, more minimal bridge** (`static/js/skillprint.js`) —
  `GAME_SCORE_UPDATE`/`GAME_COMPLETE` postMessages only, no per-action `logEvent` mechanism, and its
  `iframeTest.html` reimplements session start/stop with a drifted, snake_case wire shape
  (`session_id`, `skills`) instead of the shared harness's camelCase (`sessionId`, `targetSkill`).
- **No fixed vocabulary is enforced anywhere**, frontend or backend. The closest thing is a set of
  Python constants on `games.models.GameSchema` (`CONTROL_EVENTS`, `POSITIVE_EVENTS`,
  `NEGATIVE_EVENTS`) used by two scoring heuristics — not an enum, not validated at the API layer,
  and it doesn't include `GAME_PAUSE`, `GAME_RESUME`, `MATCH`, or `UNMATCH` even though those
  already appear ad hoc in game code.

## Step 1: Check whether the plumbing already exists (do this every time — it may have been fixed since this skill last ran)

```bash
grep -n "'gameEvent'" app/game/*/GameClient.tsx app/game/**/*.tsx 2>/dev/null
grep -n "sendTelemetryEvent\|sendEvent" public/games/live/_shared/harness.js
```

- If both are present and functioning, skip to Step 3 (instrument the specific game) — the plumbing
  is done.
- If either is missing, you need to add it (Step 2) before any event you add to a game will reach
  the backend. **Do not tell the user a game is "instrumented with telemetry" if events are only
  reaching `postMessage` and dying there** — that's the exact bug this skill exists to avoid
  repeating.

## Step 2: Wire the plumbing (one-time, repo-wide — not per-game)

This is a real code change to shared, production-serving files. Show the user the diff before
committing; this isn't a live-backend write (nothing here is prohibited or needs live-write
confirmation), but it does affect every game's runtime message handling, so don't do it silently
inside a larger unrelated task.

1. **Add a send helper.** In `public/games/live/_shared/harness.js` (or, for games not on the
   shared harness, in the per-game `skillprintShim.js`), add a small function that does what
   `logEvent` in `public/games/live/inject.js` already does, but targeting the real parent origin
   rather than an unsubstituted `{% TARGET_ORIGIN %}` template:
   ```js
   function sendTelemetryEvent(event, fields = {}) {
     window.parent.postMessage(
       JSON.stringify({ ...fields, event, messageType: 'gameEvent' }),
       '*' // or the harness's known parent origin, matching how ADJUST_GAME/screenshot messages are posted
     );
   }
   ```
   Match whatever origin convention the rest of the harness already uses for its other
   `postMessage` calls — don't introduce a third convention.

2. **Add the receiving case in the portal.** In `app/game/[slug]/GameClient.tsx`, the message
   switch already handles `'screenshot'`, `'GAME_COMPLETE'`, `'GAME_PAUSE'`, `'GAME_RESUME'`,
   `'GAME_SCORE_UPDATE'`. Add a case for `'gameEvent'` that parses the JSON payload and POSTs it to
   the existing backend endpoint:
   ```
   POST {apiBase}/games/api/sessions/telemetry?session_id=<current sessionId>&game_slug=<slug>
   Authorization: <same auth the portal already uses for record-session/sessions calls>
   Body: {"event": <the parsed gameEvent payload, minus the messageType wrapper>}
   ```
   Reuse the session id already held by the component (the one used for
   `record-session`/`sessions/{id}/stop`) — don't generate a new one.

3. **Confirm it round-trips**: instrument a trivial event in one game, play it in the real portal
   (not just `iframeTest.html`, which never exercises `GameClient.tsx`), then check the session's
   telemetry — either via the data API (`GET /data/v1/telemetry-events/`, if the user has data-API
   credentials) or by asking a backend engineer to check `Session.objects.get(session_id=...).telemetry`.

## Step 3: Instrument the specific game

Same rigor discipline as the sibling `game-tuning-params` skill: **ground every event in code you
actually read — never invent one because it seems plausible.**

### Universal events (Layer 1)

Use only this fixed list — don't expand it per-game (that's what Layer 2 is for), and don't fire
one that doesn't genuinely apply to this game's structure:

`GAME_START`, `GAME_END`, `LEVEL_START`, `LEVEL_COMPLETE`, `LEVEL_FAILED`, `LEVEL_RESTART`,
`LEVEL_QUIT`, `GAME_PAUSE`, `GAME_RESUME`, `MATCH`, `UNMATCH`

- The first seven have real precedent across existing games (Sweet Memory, Fruit Sorting, Photo
  Hunt, Star Puzzles as `TRY_*`, Colorize 2, Sumagi) and as `GameSchema.CONTROL_EVENTS` constants
  backend-side — reuse those exact spellings.
  `MATCH`/`UNMATCH` have precedent in Match Doodle, Sweet Memory, and Mahjong Deluxe.
- `GAME_PAUSE`/`GAME_RESUME` as **telemetry events** are new — don't confuse them with the
  existing `{type: 'GAME_PAUSE'}` / `{type: 'GAME_RESUME'}` postMessages the harness/shim already
  send for actual pause *control* (parent → game). A telemetry `GAME_PAUSE` event (game → parent,
  `messageType: 'gameEvent'`) is a different, additive signal: "the player paused," not "pause the
  game." Sending both is fine; they serve different purposes.
- Find the real call sites by reading the game's main loop / scene code for where a level actually
  starts, completes, fails, restarts, or quits, and where pause/resume genuinely happens. If a game
  has no concept of "levels" (e.g. an endless runner), map `LEVEL_START`/`LEVEL_COMPLETE` to
  whatever discrete unit the game actually has (a run, a round) — don't force levels onto a game
  that has none.

### Custom events (Layer 2 — owned games only)

- Only worth doing for games Skillprint owns outright (check the `Game` record's organization, or
  ask the user) — this layer's value is training the vision scorer and validating skill scores
  against ground truth, which only makes sense for games under direct control. Instrument the
  *specific, granular player action* the skill score is supposed to be measuring — not everything
  that moves.
- Read the actual input-handling code to find the precise action boundary (e.g. Hextris's `sendCW`/
  `sendCCW` hooks already sit at the exact right call site — a rotation input just wasn't wired to
  fire live). Reuse a dead/commented-out precedent like this rather than re-deriving the hook point
  from scratch.
- Capture whatever numeric/contextual payload makes the event useful as a cognitive-measure proxy —
  e.g. a timestamp precise enough to derive reaction time between two events, not just the event
  name alone.
- Name custom events distinctly from the universal list (e.g. `CLOCKWISE_TAP`, not a repurposed
  `MATCH`) so they can't be confused with Layer 1 at analysis time.

## Step 4: Verify before reporting done

1. Confirm the event fires: check `logEvent`/`sendTelemetryEvent` is actually called at the right
   moment (add a temporary `console.log` or watch it in the harness's on-screen log if testing
   through `iframeTest.html` — but remember `iframeTest.html` bypasses `GameClient.tsx`, so this
   only proves the game emits the event, not that it reaches the backend).
2. Confirm it reaches the backend: play through the real portal page (`/game/<slug>`), then check
   the session's telemetry landed (data API, or ask a backend engineer to inspect `Session.telemetry`
   / the derived `TelemetryEvent` rows for that session).
3. Report both results separately. "The game emits the event" and "the event reached the backend"
   are different claims — don't collapse them.

## Known gaps — flag these to the user rather than working around them

These are backend/data-model gaps this skill cannot close by itself; they're the concrete answer
to "what would the backend need to fully support the three-layer design":

1. **No enforced universal vocabulary.** `TelemetryEvent.event` is a free-text `CharField` with no
   `choices=`/enum, and the only fixed-vocabulary concept (`GameSchema.CONTROL_EVENTS`) is a Python
   constant read by two heuristics, not a validated schema. Nothing stops a typo, and nothing
   distinguishes "universal" from "custom" events except which string you happen to send — they
   share one flat list per session. A real Layer 1 needs at minimum a validated enum (or a
   documented, versioned convention) shared by frontend and backend.
2. **No API to register a custom event taxonomy per game.** `GameSchema.schema` (a JSON-Schema
   validator per game) is the closest existing construct, but it has no view/serializer/URL
   anywhere in the codebase — it's admin/migration-only. Layer 2 has no way for a partner or an LLM
   agent to declare "this game emits `CLOCKWISE_TAP` with this payload shape" the way
   `game-tuning-params`' Step 6 can declare parameter definitions via
   `scoring/api/games/<slug>/scoring-config/`.
3. **No structured game-state capture alongside screenshots (Layer 0).** `GameChunkAnalysis` stores
   images/video plus capture timing and `biometric_signals` (sensor data), but there's no field for
   an arbitrary client-submitted game-state JSON blob (score, level, entity positions) per frame —
   exactly the pairing a world-model trainer needs. Adding this is a schema + serializer + SDK
   change (an optional `game_state` JSON field alongside each `screenshot_N` in the
   `record-session` upload), not something this skill can create from the frontend side alone.
4. **No cross-check between events and vision-derived scoring** — the specific "low-cost sanity
   check on the vision pipeline" the design doc calls out (event says `LEVEL_COMPLETE` fired but
   vision-derived `game_progress` didn't move → flag the chunk) does not exist. Scoring
   (`scoring/schema_builder.py`, `tasks/api_layer.py`) never reads `session.telemetry` at all today;
   the only telemetry consumption (`scoring/adaptation.py:telemetry_counts`) is descriptive
   metadata attached to `ParameterAdjustment`, not a QA gate on the scorer's output.
5. **No mechanism to use custom events as a training/validation signal for the vision scorer** —
   the other half of Layer 2's stated purpose ("training signal for the vision-based scorer
   itself"). This needs the scoring pipeline to actually join `TelemetryEvent` rows against
   `GameChunkAnalysis` scores for the same session/time-window, which isn't implemented.
6. **The production ingestion path itself is incomplete** (see Steps 1–2 above) — `GameClient.tsx`
   doesn't forward `gameEvent` messages, and no shared harness function sends them. This one is
   partly a frontend gap this skill *can* close (Step 2); listed here because until it's closed,
   every other item on this list is moot for any game actually served through the live portal.

## Related

- [[game-tuning-params]] — same "ground everything in real code, never invent" discipline, for the
  `ADJUST_GAME` parameter/difficulty system rather than telemetry events. A game usually needs both
  skills applied independently; they don't share call sites.
- [[create-marketplace-game]] — registers the `Game` catalog record. Layer 2 custom telemetry is
  only worth adding for games owned by Skillprint's own organization, which this skill's record
  will tell you.
