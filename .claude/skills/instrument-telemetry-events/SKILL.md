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

## Ground truth: how an event reaches the backend (updated 2026-09-30)

Verified against the code; re-check Step 1 each time, since this moves:

- **The path is the screenshot upload, not `sessions/telemetry`.** A game posts
  `{type: 'gameEvent', data: {event, at, ...fields}}` to its parent. `at` is when it happened, in
  epoch ms: `performance.timeOrigin + performance.now()`, which reads the same in the game frame
  and the portal. `GameClient.tsx`'s `'gameEvent'` case calls `SkillprintClient.recordEvent()`,
  which stamps it onto the session's `SessionTimeline` (skillprint-js-sdk) as ms from session
  start. The next screenshot upload carries it as `events`, and the closing upload takes the
  rest. The backend appends them to `Session.telemetry` (marketplace #119).
- **Screenshots carry their own time too.** `SkillprintLib/skillprintScreenshot.js` posts
  `capturedAt` (same clock), sent as `offset_ms<n>` and stored as
  `GameChunkAnalysis.frame_offsets_ms`. Each chunk's vision prompts list the events whose own
  `timestamp` falls in that chunk's window (marketplace #120), whichever upload brought them.
- **Don't post to `POST /games/api/sessions/telemetry`.** It takes one event per request, and it
  has `authentication_classes = []`, so it 404s every player-owned session, which is every portal
  session (marketplace #110).
- **Reference implementation: Hextris** (`public/games/live/Hextris/static/skillprint.js`).
  `Skillprint.send(event, data)` posts the message. Its hooks sit in `Hex.rotate` (every applied
  rotation, keys or taps), in `checking.js` (MATCH), in `view.js` (pause and resume), and in the
  start, restart and game-over paths in `main.js`, `initialization.js` and `input.js`.
- **The legacy convention is still dead.** Construct/CreateJS-era games (Sweet Memory, Match
  Doodle, Fruit Sorting, Photo Hunt, Sumagi, Star Puzzles, Colorize 2, Gems of Hanoi, Mahjong
  Deluxe) call `spLogEvent` → `logEvent` → a JSON-string `postMessage` (`messageType: 'gameEvent'`).
  `skillprintScreenshot.js` redefines `globalThis.logEvent` as a no-op, and the portal only reads
  the object form. Several of these games have strict legacy `GameSchema` rows
  (`games/fixtures/game_schema_fixture.json`). `Session.save()` validates every telemetry entry
  against them, so an entry that doesn't match breaks the session's saves. Check the game's
  schema before turning one of these on (marketplace #36 makes schemas permissive).
- **Universal vocabulary:** the SDK's `GameEvent` enum is exactly marketplace's
  `GameSchema.UNIVERSAL_TELEMETRY_EVENTS` (since #119). Anything else is game-specific.

## Step 1: Check the plumbing still exists

```bash
grep -n "'gameEvent'" "app/game/[slug]/GameClient.tsx"
grep -n "recordEvent\|SessionTimeline" app/lib/skillprintSdk.ts
grep -n "capturedAt" public/games/live/SkillprintLib/skillprintScreenshot.js
```

If any is missing, restore it before instrumenting a game: an event that only reaches
`postMessage` is not instrumented.

## Step 2: Emit from the game

Add a sender like Hextris's `Skillprint.send`, which posts `{type: 'gameEvent', data: {event,
at, ...}}` to `window.parent` with target `'*'`, the convention the game's other messages use.
Stamp `at` when the thing happens, not when it's convenient to send.

## Step 3: Instrument the specific game

Same rigor discipline as the sibling `game-tuning-params` skill: **ground every event in code you
actually read — never invent one because it seems plausible.**

### Universal events (Layer 1)

Use only this fixed list — don't expand it per-game (that's what Layer 2 is for), and don't fire
one that doesn't genuinely apply to this game's structure:

`GAME_START`, `GAME_END`, `LEVEL_START`, `LEVEL_COMPLETE`, `LEVEL_FAILED`, `LEVEL_RESTART`,
`LEVEL_QUIT`, `GAME_PAUSE`, `GAME_RESUME`, `MATCH`, `UNMATCH`, `HINT`, `GENERIC_POSITIVE`, `GENERIC_NEGATIVE`
(the SDK's `GameEvent`)

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
2. Confirm it reaches the backend: play through the real portal page (`/game/<slug>`), then
   compare what the uploads sent with what `Session.telemetry` holds. Wrap `window.fetch` in the
   page to read each `record-session` form's `events` field. A backend that isn't deployed yet
   can run as the throwaway E2E stack from the `marketplace-local-stack` memory. Count the events
   on both sides: on 2026-09-30 a whole-model `session.save()` in `scoring/hextrix.py` silently
   dropped two thirds of them (fixed in #119).
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
3. **(Mostly done.)** Screenshots can now carry `game_state<n>` (score and anything else) and
   `offset_ms<n>`. The rest of this item predates that:
   **No structured game-state capture alongside screenshots (Layer 0).** `GameChunkAnalysis` stores
   images/video plus capture timing and `biometric_signals` (sensor data), but there's no field for
   an arbitrary client-submitted game-state JSON blob (score, level, entity positions) per frame —
   exactly the pairing a world-model trainer needs. Adding this is a schema + serializer + SDK
   change (an optional `game_state` JSON field alongside each `screenshot_N` in the
   `record-session` upload), not something this skill can create from the frontend side alone.
4. **(Partly done: #120 puts each chunk's events into its vision prompts; there's still no QA
   gate.)** **No cross-check between events and vision-derived scoring** — the specific "low-cost sanity
   check on the vision pipeline" the design doc calls out (event says `LEVEL_COMPLETE` fired but
   vision-derived `game_progress` didn't move → flag the chunk) does not exist. Scoring
   (`scoring/schema_builder.py`, `tasks/api_layer.py`) never reads `session.telemetry` at all today;
   the only telemetry consumption (`scoring/adaptation.py:telemetry_counts`) is descriptive
   metadata attached to `ParameterAdjustment`, not a QA gate on the scorer's output.
5. **No mechanism to use custom events as a training/validation signal for the vision scorer** —
   the other half of Layer 2's stated purpose ("training signal for the vision-based scorer
   itself"). This needs the scoring pipeline to actually join `TelemetryEvent` rows against
   `GameChunkAnalysis` scores for the same session/time-window, which isn't implemented.
6. **(Closed by the upload path above.)** **The production ingestion path itself was incomplete** (see Steps 1–2 above) — `GameClient.tsx`
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
