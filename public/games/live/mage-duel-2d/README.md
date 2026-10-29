# Mage Duel

Portal slug `mage-duel` (`SLUG_TO_DIR_MAP` maps it to this `mage-duel-2d` folder). A typing duel for language practice: pick a region (Spanish, French, German, Italian), then type the translation of each spell word before the warlord's strikes wear you down. Screenshots go to the portal through html2canvas (`static/index.html`), gameplay events through `emitEvent` in `static/game.js` (see `docs/engine-game-events.md`), and difficulty knobs through `static/skillprintShim.js`.

## Difficulty knobs

The names match `parameters.json`, `backend/game-scoring-config.json` and `GameAdjustmentTester`. Each value is clamped to its range and rounded. All six hold across duels ("Repeat Mission" and a new region); `adjustGame` is defined at load, so they can be set on the world map or mid-duel.

| Parameter | Type | Range (default) | Effect |
|---|---|---|---|
| `heroDamage` | integer | 2 - 25 (4) | Damage per correct spell; the warlord has 100 HP (4 = 25 spells to win, 10 = 10, 25 = 4). Next spell that lands. |
| `enemyDamage` | integer | 2 - 40 (15) | Damage per enemy strike; the hero has 100 HP (15 = 7 strikes). Next strike. |
| `enemyAttackRateMs` | integer | 1500 - 15000 (5000) | Time between enemy strikes. Mid-duel, the attack timer restarts with the new period at once. |
| `healAmount` | integer | 0 - 50 (20) | HP a "heal" word restores (1 in 11 words, 1 in 7 sentences). Next heal. |
| `showHelper` | integer | 0 - 1 (1) | 1 shows the translation to type under the prompt; 0 hides it (recall instead of copying). The word on screen changes at once. |
| `useSentences` | integer | 0 - 1 (0) | 1 asks for short sentences (about 3 times the letters) instead of words. From the next word. |

How: `game.js` is a classic script, so its state is global. `window.GAME_CONFIG` holds the four numbers and is read each time a spell, strike or heal lands; the shim writes it and, for `enemyAttackRateMs` during a duel, calls `startEnemyAttacks()` to restart the timer. `showHelper` and `useSentences` are top-level `let`s read by `nextWord()`; the world-map checkboxes overwrite them when a duel starts, so once the portal sets one the shim ticks the matching checkbox and wraps `startGame()` to re-apply the value first. The shim is loaded after `game.js`.

Also changed in `game.js`:
- Removed the `window.adjustGame` that `startGame()` defined (it only existed once a duel had started, and took any value unclamped) and the in-game 1-9 key table (`window.Skillprint.registerAdjustments` exists nowhere; its fallback sent `value` instead of `parameterValue`, setting the knob to `undefined`, and added another key listener every duel). Keys now go to the portal like every other game: the shim forwards 1-9, and keeps a digit pressed in the spell box out of it (no answer has a digit; it would count as a typo).
- `startGame()` re-enables the spell box: the previous duel's end left it disabled, so "Repeat Mission" started a duel the player could not type in.

Tested in headless Chrome (game in an iframe of itself, so its posts reach a parent):

| Step | Result |
|---|---|
| At load (world map) | `adjustGame` defined; `GAME_CONFIG` 4 / 15 / 5000 / 20, helper on, sentences off |
| Defaults, one spell | warlord -4 HP; strikes at 4.8 s and 9.6 s, -15 HP each |
| `heroDamage` 10 mid-duel | next spell -10 HP |
| `enemyDamage` 30 + `enemyAttackRateMs` 2000 mid-duel | next strike 2.4 s later, -30 HP |
| `healAmount` 45, heal word cast | hero 40 -> 85 HP |
| `showHelper` 0 | word on screen: "Type to Translate (Hidden)", opacity 0; next word hidden too |
| `useSentences` 1 | next prompt a sentence (`S_HEAL`); checkbox ticked |
| `heroDamage` 999, `enemyAttackRateMs` 100, `healAmount` -5, `showHelper` 0.4 | 25, 1500, 0, 0 |
| unknown name / non-numeric value | `console.warn`, nothing changed |
| Win, then "Repeat Mission" | knobs held (25 / 30 / 15000 / 0, helper off, sentences on); spell box enabled; next spell -25 HP; `LEVEL_START` carries the values |
| Back to map, player ticks "Show Translation Helper", picks a region | portal value wins: helper off, checkbox unticked |
| Key 5 typed in the spell box | forwarded as `skillprint_keydown`; not typed |
| `ADJUST_GAME` message | applied (`heroDamage` 7) |

## Testing with keys 1-9 (GameAdjustmentTester)

- **Key 1**: heroDamage 10 (10 spells win)
- **Key 2**: enemyDamage 25 (harder strikes)
- **Key 3**: enemyAttackRateMs 9000 (slower strikes)
- **Key 4**: enemyAttackRateMs 3000 (faster strikes)
- **Key 5**: healAmount 40 (stronger heals)
- **Key 6**: showHelper 0 (hide the translation)
- **Key 7**: useSentences 1 (sentences)
- **Key 8**: showHelper 1 + useSentences 0 (helper back, single words)
- **Key 9**: all six back to their defaults

## Backend

`backend/game-scoring-config.json` holds the `GameScoringConfig` for this game. The portal sends its `sdk_game_parameters` on session start (`parameterManifest` in `app/config/gameConfig.ts`), so the backend provisions these parameters automatically. See `backend/README.md` for the one-time admin step.
