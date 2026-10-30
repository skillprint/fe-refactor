# Battle Drones

A mobile real-time strategy game: two armies of flying and ground drones
battle for territory and resources. By Simon Willison and Claude
([simonw/battledrones](https://github.com/simonw/battledrones), Apache-2.0).

**Don't edit these files here.** They're built from
[kachergis/battledrones](https://github.com/kachergis/battledrones) at
`fd64481a5206ad571fe00dc49b08d3f19887b641`. Its `src/skillprint/`
has the Skillprint link. To update the copy, run this from that checkout, with
fe-refactor beside it:

```bash
npm run skillprint:portal
```

## How it talks to the portal

The portal owns the session. The game posts `postMessage`s to it only when
it is embedded in a page, and only for a match the player plays against the
AI (skirmish, Last Stand, ops, the Daily Op). Duels, online free-for-alls,
AI-vs-AI and replays post nothing.

- `gameEvent`: GAME_START (map, mode, difficulty, opener, mutators),
  GAME_END (outcome, kills, losses, score), GAME_PAUSE / GAME_RESUME, and its
  own events: ORDER, UNIT_PRODUCED, BUILDING_COMPLETE, ENEMY_KILLED,
  UNIT_LOST, BUILDING_LOST, UNIT_PROMOTED, CALLDOWN, ENEMY_CALLDOWN,
  UPLINK_CAPTURED, UPLINK_LOST, CRATE_CLAIMED, WAVE_CLEARED, SIDE_ELIMINATED.
- `gameState` every 5 s of battle: scrap, income, both armies' value,
  units, buildings, Uplinks held, kills, losses, orders per minute and game
  speed; at the end, `isGameOver`, `outcome` and `score` (the career XP
  the match earned).
- `screenshot` every 2 s: the 3D view and its health bars, with the HUD's
  numbers stamped top left.
- `GAME_COMPLETE` from the end screen's **📊 Finish** button.

It takes `ADJUST_GAME` (the knobs in `backend/game-scoring-config.json`),
`GAME_PAUSE` and `GAME_RESUME`, and forwards keys 1-9 to the adjustment
tester (1-3 also select squads in the game). Knobs set mid-match go into the
battle record, so "Copy replay JSON" still replays the match exactly.

`static/iframeTest.html` plays the portal's part for testing: open it from
the dev server at `/games/live/Battle Drones/static/iframeTest.html`.
