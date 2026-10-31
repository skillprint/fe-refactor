#!/usr/bin/env bash
# Register Support Desk with a Skillprint backend: the Game record (catalog
# entry, skills, moods, cover) and its GameScoringConfig (the nine parameters,
# mood guidance, event-to-skill guidance). Staging by default.
#
#   SKILLPRINT_PARTNER_KEY=… scripts/register-support-desk.sh            # staging
#   scripts/register-support-desk.sh https://api.skillprint.co           # production (asks twice)
#
# The partner key comes from the environment or a hidden prompt and is never
# printed. The game is created under that key's organization. Skill and mood
# slugs are checked against the host's own lists before anything is written.
# Safe to re-run: an existing Game record is left alone, the scoring config is
# replaced (PUT) from backend/game-scoring-config.json.

set -euo pipefail

HOST="${1:-https://api.staging.skillprint.co}"
HOST="${HOST%/}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GAME_DIR="$ROOT/public/games/live/Support Desk"
CONFIG="$GAME_DIR/backend/game-scoring-config.json"
COVER="$GAME_DIR/cover.jpg"
SLUG="support-desk"
SKILLS=(verbal planning task-switching attention memory deduction)
MOODS=(focus empathy grit collaborate)

case "$HOST" in
  *//api.skillprint.co)
    read -rp "This writes to PRODUCTION ($HOST). Type 'production' to continue: " ok
    [ "$ok" = "production" ] || { echo "Stopped."; exit 1; } ;;
esac

if [ -z "${SKILLPRINT_PARTNER_KEY:-}" ]; then
  read -rsp "Partner API key for $HOST: " SKILLPRINT_PARTNER_KEY
  echo
fi
[ -n "$SKILLPRINT_PARTNER_KEY" ] || { echo "No key given."; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
# Keep the key out of the process list: curl reads the header from a file.
printf 'X-Api-Key: %s\n' "$SKILLPRINT_PARTNER_KEY" > "$TMP/auth"
chmod 600 "$TMP/auth"
api() { curl -sS -H @"$TMP/auth" "$@"; }

echo "== Host: $HOST"

# 1. Is the game already there?
code=$(api -o "$TMP/catalog.json" -w '%{http_code}' "$HOST/games/api/catalog/$SLUG/")
case "$code" in
  200) echo "== Game '$SLUG' already exists; not creating it again."; CREATE=0 ;;
  404) echo "== Game '$SLUG' not found; will create it."; CREATE=1 ;;
  401|403) echo "!! $code from the catalog: the key was refused by $HOST."; cat "$TMP/catalog.json"; echo; exit 1 ;;
  *) echo "!! Unexpected $code from the catalog:"; cat "$TMP/catalog.json"; echo; exit 1 ;;
esac

if [ "$CREATE" = 1 ]; then
  # 2. Only slugs the host already has.
  api -o "$TMP/skills.json" "$HOST/games/api/skills/"
  api -o "$TMP/moods.json" "$HOST/games/api/moods/"
  python3 -I - "$TMP/skills.json" "$TMP/moods.json" "${SKILLS[*]}" "${MOODS[*]}" <<'PY'
import json, sys
def slugs(path):
    d = json.load(open(path))
    if isinstance(d, dict):
        d = d.get("results", d.get("data", []))
    return {x.get("slug") for x in d if isinstance(x, dict)}
have_s, have_m = slugs(sys.argv[1]), slugs(sys.argv[2])
want_s, want_m = sys.argv[3].split(), sys.argv[4].split()
missing = [s for s in want_s if s not in have_s] + [m for m in want_m if m not in have_m]
if not have_s or not have_m:
    sys.exit(f"!! Could not read the skill or mood list (skills: {len(have_s)}, moods: {len(have_m)}).")
if missing:
    sys.exit(f"!! Not on this host: {', '.join(missing)}. Add them in Django admin or change the lists.\n   Skills here: {', '.join(sorted(have_s))}\n   Moods here: {', '.join(sorted(have_m))}")
print(f"== Slugs checked: skills {', '.join(want_s)}; moods {', '.join(want_m)}")
PY

  # 3. Create the record. --form-string so text with ';' isn't cut short.
  form=(
    --form-string "name=Support Desk"
    --form-string "display_name=Support Desk"
    --form-string "short_description=A shift on a help desk. Customers arrive with a problem, a mood and sometimes a wrong idea of what they are owed. Keep to policy, keep them calm, and say how sure you are."
    --form-string "long_description=Support Desk is a customer-support simulation. Simulated customers arrive in a queue, each with a problem, a mood and sometimes a false belief about what they are owed. You read the policy that applies, look things up and act with the account tools, and talk them through it in a chat. Some actions are against policy however hard the customer pushes; an angry customer needs to be heard before they will accept an answer; and when you close a ticket you say how sure you are that it is resolved. The game measures policy adherence under pressure, correcting false beliefs, recovering upset customers, calibration, adapting to a mid-shift rule change and keeping several conversations apart. Humans and AI agents play the same tickets."
    --form-string "instructions=Read the policy for the ticket, then talk to the customer in the chat. Use the tools on the right to look things up and act on the account; some actions are against policy, however hard the customer pushes. Watch the mood badge: a customer who is angry needs to be heard before they will accept an answer. When you are done, close the ticket and set the slider to how sure you are that it is resolved. You are scored on being right about that, not on being confident. With more than one ticket open, switch between them with the tabs and keep their names and order numbers straight."
    --form-string "is_publicly_listed=true"
    --form-string "is_playable_in_pwa=true"
    --form-string "orientation=landscape"
    --form-string "engine_type=custom_js"
    --form-string "html5_entry_file=index.html"
  )
  for s in "${SKILLS[@]}"; do form+=(--form-string "skills=$s"); done
  for m in "${MOODS[@]}"; do form+=(--form-string "moods=$m"); done
  [ -f "$COVER" ] && form+=(-F "thumbnail=@$COVER;type=image/jpeg")

  code=$(api -o "$TMP/create.json" -w '%{http_code}' -X POST "$HOST/games/api/games/" "${form[@]}")
  if [ "$code" != 201 ] && [ "$code" != 200 ]; then
    echo "!! Create failed ($code):"; cat "$TMP/create.json"; echo; exit 1
  fi
  created_slug=$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1])).get("slug",""))' "$TMP/create.json")
  echo "== Created game, slug '${created_slug:-?}'."
  if [ -n "$created_slug" ] && [ "$created_slug" != "$SLUG" ]; then
    echo "!! The backend gave it '$created_slug', not '$SLUG' (a record with that slug exists elsewhere)."
    echo "   The portal resolves suffixed slugs, but tell whoever runs this before going further."
    SLUG="$created_slug"
  fi
fi

# 4. Scoring config: replace it from the manifest the portal also sends.
python3 -I - "$CONFIG" > "$TMP/scoring.json" <<'PY'
import json, sys
c = json.load(open(sys.argv[1]))
body = {k: c[k] for k in ("is_enabled", "parameter_definitions", "adjustment_instructions",
                          "skill_adjustment_instructions", "event_skill_guidance", "notes") if c.get(k) is not None}
print(json.dumps(body))
PY
code=$(api -o "$TMP/config.json" -w '%{http_code}' -X PUT -H "Content-Type: application/json" \
  --data-binary @"$TMP/scoring.json" "$HOST/scoring/api/games/$SLUG/scoring-config/")
if [ "$code" != 200 ]; then
  echo "!! Scoring config PUT failed ($code):"; cat "$TMP/config.json"; echo; exit 1
fi
echo "== Scoring config stored."

# 5. Read both back.
api -o "$TMP/catalog.json" "$HOST/games/api/catalog/$SLUG/"
api -o "$TMP/config.json" "$HOST/scoring/api/games/$SLUG/scoring-config/"
python3 -I - "$TMP/catalog.json" "$TMP/config.json" <<'PY'
import json, sys
g, c = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
names = lambda xs: ", ".join((x.get("slug") or x.get("name") or str(x)) if isinstance(x, dict) else str(x) for x in (xs or []))
params = c.get("parameterDefinitions") or c.get("parameter_definitions") or {}
print(f"== Catalog: {g.get('slug')} | listed={g.get('isPubliclyListed', g.get('is_publicly_listed'))} | pwa={g.get('isPlayableInPwa', g.get('is_playable_in_pwa'))}")
print(f"   skills: {names(g.get('skills'))}")
print(f"   moods:  {names(g.get('moods'))}")
print(f"== Scoring config: enabled={c.get('isEnabled', c.get('is_enabled'))} | params: {', '.join(params)}")
guidance = c.get("eventSkillGuidance") or c.get("event_skill_guidance") or ""
print(f"   event guidance: {len(guidance)} chars | adjustment instructions: {len(c.get('adjustmentInstructions') or c.get('adjustment_instructions') or '')} chars")
PY
echo "== Done. is_active and the tile screenshot URL can only be set in Django admin."
