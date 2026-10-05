---
name: create-marketplace-game
description: Creates a new Game record on the Skillprint marketplace backend (staging or production Django API) via POST /games/api/games/ — authenticated with either a partner API key or a Knox admin token — so a game already added to skillprint-rewrite (public/games/live/<GameName>/) gets a real catalog entry — the thing that makes it show up in games/api/catalog/<slug>/, the AI Guide "Target" dropdown, and portal game listings. Use this whenever the user asks to add a game to the catalog, register/publish a game with the backend, attach skills or moods to a game record, or when games/api/catalog/<slug>/ 404s for a game slug that clearly exists in this repo. Always confirms with the user before writing to a live backend, and never invents skill/mood slugs or touches production without explicit sign-off.
---

# Create Marketplace Game

Adding a game's code to `public/games/live/<GameName>/` in skillprint-rewrite does not register it
with the Skillprint marketplace backend — that's a separate Django service (sibling repo
`marketplace/api_backend/`) with its own `Game` model. A game with no `Game` row there will 404 on
`games/api/catalog/<slug>/`, won't appear in the AI Guide Target dropdown, and won't show up in
portal listings, even though it plays fine locally. This skill creates that missing record with a
single `curl` call — no bundled script, since the request is a one-shot form POST with no
non-trivial logic to wrap.

## Why this needs care

`POST /games/api/games/` is an authenticated write to a real backend that other people and services
depend on (staging is shared by the whole team; production is live for real users). Treat every
call through this skill like any other production-adjacent write:

- **Always show the user the exact request before sending it**, with the credential redacted, and
  only send it after they say to go ahead.
- **Never target production without a separate, explicit confirmation** from the user beyond
  whatever prompted this skill to trigger. Default to staging unless told otherwise.
- **Never invent skill or mood slugs.** Fetch the real, current lists first (Step 2) and only use
  slugs that already exist there — creating a new Skill/Mood row is an admin-UI-only operation this
  skill does not perform (there is no create endpoint for them), so if the skill/mood the user wants
  genuinely doesn't exist yet, tell them it needs to be added in Django admin first rather than
  guessing a slug that will silently fail validation.

## Step 1: Confirm the game is actually missing

```bash
curl -s "https://<host>/games/api/catalog/<slug>/"
```

- `404 {"detail": "No Game matches the given query."}` → proceed, this skill applies.
- `200` with a body → the game already exists; there's nothing to create. If the user actually
  wanted to *update* an existing game (add a skill, change its description), that's a different
  operation (Django admin, or a PATCH/PUT endpoint if one exists) — say so rather than trying to
  create a duplicate.

## Step 2: Gather real values — don't invent anything

```bash
curl -s "https://<host>/games/api/skills/"
curl -s "https://<host>/games/api/moods/"
```

These are the authoritative, current slug lists for that host. Staging and production can differ,
so always re-fetch per host rather than reusing a list from a previous run or from
`app/config/skillsTaxonomy.ts` in skillprint-rewrite (that file is a client-side display mirror, not
the source of truth).

For `short_description` (required by the API) and any skills worth attaching, check whether the
game already has a `gameDetails['<slug>']` entry in `app/config/gameConfig.ts` in skillprint-rewrite
— reuse its `description` and treat its `skills` array (plain display strings like `"Sequential
Memory"`) as a hint for which real backend skill slugs are the closest match, rather than
reproducing those exact display strings as slugs.

`name` is technically marked optional in the live Swagger schema (`https://<host>/swagger/`), but
the underlying Django model requires a real, unique string (its `default=None` just satisfies DRF's
serializer introspection, not the database) — always send a real `name` regardless of what the
schema claims.

## Step 3: Pick the host

Default to staging (`https://api.staging.skillprint.co`) unless the user names a different target.
`http://localhost:8002` is the Docker marketplace stack described in project memory, useful for a
dry run against disposable data before touching staging. Only use production
(`https://api.skillprint.co`) after the user explicitly confirms they want a live production write.

## Step 4: Get credentials — partner API key (preferred) or Knox admin token

`GameCreateAPIView` accepts either:

- **A partner API key** (`X-Api-Key: <prefix.secret>` header) — the simpler path, and the one to
  prefer when the user just wants to register their own game. **Important asymmetry**: a key-only
  request is always scoped to that key's own organization — `perform_create` (`games/views.py`)
  ignores whatever `organization` value is in the request body and substitutes
  `resolve_partner_organization(request)` instead, so one partner can never create a game under
  another partner's name. Don't bother sending `organization` when using an API key; it'll be
  silently overridden.
- **A Knox admin token** (`Authorization: Token <knox_token>`, staff user) — still supported, and
  the only way to set an explicit `organization` on someone else's behalf or act with no
  organization at all.

This skill never mints or guesses either credential. Ask the user for one — an API key from their
partner dashboard, or (for the admin path) a Knox token minted by a staff user on the target host.
Never log it, write it to a file, or echo it back unredacted — always print the request with the
credential replaced by `***redacted***` before actually sending anything.

## Step 5: Build the request, show it redacted, then send it

The endpoint takes `multipart/form-data`; array fields (`skills`, `moods`) are sent as the same
`-F` key repeated once per value — not `skills[]` and not a comma-joined string:

```bash
curl -X POST "https://<host>/games/api/games/" \
  -H "X-Api-Key: <partner_api_key>" \
  -F "name=Simon Says" \
  -F "short_description=Watch, remember, and repeat the growing color sequence." \
  -F "skills=memory" \
  -F "is_publicly_listed=true"
```

(swap `-H "X-Api-Key: <partner_api_key>"` for `-H "Authorization: Token <knox_admin_token>"` to use
the Knox admin path instead.)

Other fields worth knowing about, all optional: `display_name` (defaults to `name`),
`long_description`, repeated `-F "moods=<slug>"`, `organization` (Knox path only, see Step 4),
`orientation` (`landscape`/`portrait`), `engine_type`
(`unity`/`html5_js`/`construct`/`phaser`/`godot_html5`/`custom_js`), `html5_entry_file` (the entry
HTML file inside the game's static bundle, for `html5_js` games).

First show the user this exact command with the credential replaced by `***redacted***` — do not
run it yet. Only actually execute the `curl` call after they confirm it looks right.

## Step 6: Verify

After sending it for real, re-run Step 1's `GET` and confirm it now returns `200` with the expected
`skills`/`moods` in the response.

## Step 7: Report the caveat about `is_active`

The create API does not expose `is_active` — new games are created with the model default
(`False`). This does **not** block catalog visibility (`GameCatalogAPIView`'s queryset only filters
on `is_publicly_listed`), but if the game needs to be fully "active" for some other downstream
check, that field can only be flipped via Django admin. Mention this to the user rather than
silently leaving it ambiguous.

## Related

- [[game-tuning-params]] produces the mood-adjustment prose + parameter JSON for a game's
  *difficulty tuning*, and its own optional Step 6 publishes that to a different endpoint
  (`scoring/api/games/<slug>/scoring-config/`, for `GameScoringConfig`). This skill creates the
  game's *catalog record* (name, description, skills, moods) instead — a new game typically needs
  this skill first (so the game exists as a `Game` row at all), then `game-tuning-params`.
