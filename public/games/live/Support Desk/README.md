# Support Desk

A customer-support simulation. The player is the agent on a help desk; simulated customers arrive with a problem, a mood and sometimes a false belief about what they are owed. The player reads the policy, uses account tools, keeps the customer calm, and closes each ticket with a declared confidence that it was resolved.

It is the first arcade game built to be played by humans and by LLM agents against the same world: the world, policies, tasks and reward come from τ-bench 2.0 through the `tau2-engine` sidecar and Django's `supportsim` API. Neither is deployed yet. Until they are, the game falls back to a practice desk of four scripted tickets that speaks the same request and response shapes; `?mock=1` asks for it directly and `?mock=0` refuses the fallback.

## Run it

| URL | What |
|---|---|
| `/game/support-desk?mock=1&sdk=false` | the game in the portal frame, scripted customers, no session |
| `/game/support-desk?mock=1` | scripted customers, a real session (frames and events reach the scorer) |
| `/game/support-desk` | the live engine when the API the portal points at has `supportsim`, else the practice desk |
| `/games/live/Support%20Desk/static/index.html?mock=1` | the bare game |
| `/games/live/Support%20Desk/static/iframeTest.html` | the dev bench: partner key, session, presets 1–9, manual `ADJUST_GAME` |

Game-side switches: `?mock=1`, `?domain=telecom|banking|retail`, `?tickets=3`, `?voice=1`, `?autostart=1`, `?apiBase=https://…` (engine override; the portal also passes its API base in a `SKILLPRINT_CONFIG` message).

## What it measures

Everything below is computed from engine state and events, never from a model reading the transcript. The shift summary shows them; the portal result panel (Phase 2) shows the same tiles.

| Tile | From |
|---|---|
| Policy adherence | tickets with no `POLICY_VIOLATION` |
| Beliefs corrected | `BELIEF_CORRECTED` on tickets that carried a false belief |
| Moods recovered | customers who reached `angry` and left `calm` |
| Calibration | Brier score of the declared confidence against τ reward |
| Rule-change lag | turns from `POLICY_SWITCH` to the first correct use of the new rule |
| Mix-ups | `CONFUSION`: another open customer's name or order id in a reply |

Plus the three numbers a real desk reports: handle time, first-contact resolution, CSAT.

## Files

- `static/index.html`, `static/desk.css`: the console.
- `static/src/main.js`: the game (`SupportDeskGame`), the shift, tickets, actions, scoring, the `window.__harness` agent interface.
- `static/src/engine.js`: the HTTP client for `supportsim` (`POST tickets/`, `tickets/{id}/turn/`, `tickets/{id}/close/`). `static/src/mockEngine.js`: the scripted stand-in, with `affect.js` (the mood state machine the real engine mirrors).
- `static/src/skillprint.js`: the portal bridge (frames every 2.5 s, `gameEvent`, `gameState`, `GAME_COMPLETE`; receives `ADJUST_GAME`, pause and resume, `SKILLPRINT_CONFIG`).
- `static/src/params.js`: the nine adjustable parameters; `backend/game-scoring-config.json` mirrors them for the backend.
- `static/src/voice/index.js`: the customer's voice, local only (Kokoro in the browser, else `speechSynthesis`).
- `static/src/metrics.js`: the shift summary. `static/src/timing.js`: shift clock and reply latency.
- `static/src/harnessHook.js`: `window.__harness.getState()` / `play(action)` for the agent harness.

## Events

Universal: `GAME_START`, `LEVEL_START`, `LEVEL_COMPLETE`, `LEVEL_FAILED`, `LEVEL_QUIT`, `GAME_PAUSE`, `GAME_RESUME`, `GENERIC_NEGATIVE`, `GAME_END`.
Custom: `TICKET_OPEN`, `AGENT_MESSAGE`, `TOOL_CALL`, `CUSTOMER_REPLY`, `CUSTOMER_SPEECH`, `BARGE_IN`, `AFFECT_CHANGE`, `POLICY_VIOLATION`, `POLICY_SWITCH`, `BELIEF_CORRECTED`, `TICKET_SWITCH`, `CONFUSION`, `HOLD`, `UNHOLD`, `TICKET_CLOSED`, `SHIFT_SUMMARY`, `ADJUSTMENT_APPLIED`, `ENGINE_FALLBACK`, `ENGINE_ERROR`. Text fields are capped at 500 characters. `TICKET_OPEN.engine` says whether a ticket came from the live engine or the practice desk.

## Voice

Local only. Kokoro-82M (8-bit, about 90 MB, cached after the first load) runs in a Web Worker, because on WebAssembly it is single-threaded here (the portal is not cross-origin isolated) and would otherwise freeze the page. Lines are made a sentence at a time and the first sentence plays while the rest are made. Until the model is ready, and wherever it cannot load, the browser's `speechSynthesis` speaks instead. `?ttsDevice=webgpu` opts into the GPU (much faster, but a ~330 MB model), `?tts=browser` skips Kokoro.

Measured on an M1 Mac in Chrome, 8-bit on WebAssembly:

| Line | First sound | Line finished | Page responsiveness during synthesis |
|---|---|---|---|
| One sentence, 4.4 s of audio, on the main thread (before the worker) | 9.5 s | 14 s | frozen |
| Three sentences, about 7 s of audio, in the worker | 3.1 s | 20.3 s | normal |

Text always appears at once, so the voice trails the transcript. The Phase 3 voice (the local Qwen3-TTS service, with emotion instructions) is the path to speech at conversational speed.

With the voice on, a customer line never holds up the conversation: the reply clock starts when the line has been heard, and replying before that is recorded as `BARGE_IN`. A line that never reports its end is abandoned after roughly its expected length.

## Not in this phase

Speech input, the local Qwen3-TTS voice with emotion, the result panel in the portal dialog, the text-only scoring path, and the agent adapter that drives `window.__harness` live in later phases of the plan.

One gap for that adapter: actions through `window.__harness.play()` fire no DOM input, and the portal counts a same-origin frame's inputs itself (it ignores the game's own count there), so an agent's chunks would reach the backend with `input_count` 0 and be left out of skill scores. Either the adapter types and clicks with real input events, as the harness's portal adapter already does, or the portal takes the larger of its count and the game's.
