---
name: create-marketplace-game
description: Creates a new Game record on the Skillprint marketplace backend (staging or production Django API) via POST /games/api/games/ — authenticated with either a partner API key or a Knox admin token — so a game already added to skillprint-rewrite (public/games/live/<GameName>/) gets a real catalog entry — the thing that makes it show up in games/api/catalog/<slug>/, the AI Guide "Target" dropdown, and portal game listings. Use this whenever the user asks to add a game to the catalog, register/publish a game with the backend, attach skills or moods to a game record, or when games/api/catalog/<slug>/ 404s for a game slug that clearly exists in this repo. Always confirms with the user before writing to a live backend, and never invents skill/mood slugs or touches production without explicit sign-off.
---

# Create Marketplace Game

Adding a game's code to `public/games/live/<GameName>/` in skillprint-rewrite does not register it
with the Skillprint marketplace backend — that's a separate Django service (sibling repo
`marketplace/api_backend/`) with its own `Game` model. A game with no `Game` row there will 404 on
`games/api/catalog/<slug>/`, won't appear in the AI Guide Target dropdown, and won't show up in
portal listings, even though it plays fine locally. This skill creates that missing record via the
admin API.

## Why this needs care

`POST /games/api/games/` is an authenticated write to a real backend that other people and services
depend on (staging is shared by the whole team; production is live for real users). It accepts
either a partner API key or a Knox admin token (`HasPartnerAPIKeyOrIsAdminUser`) — see Step 4 for
how those two differ. Treat every call through this skill like any other production-adjacent write:

- **Always show the user the exact request before sending it**, and only proceed after they say
  to go ahead — the bundled script defaults to a dry run for this reason.
- **Never target `production` without a separate, explicit confirmation** from the user beyond
  whatever prompted this skill to trigger. Default to `staging` unless told otherwise.
- **Never invent skill or mood slugs.** Fetch the real, current lists first (Step 2) and only use
  slugs that already exist there — creating a new Skill/Mood row is an admin-UI-only operation this
  skill does not perform (there is no create endpoint for them), so if the skill/mood the user wants
  genuinely doesn't exist yet, tell them it needs to be added in Django admin first rather than
  guessing a slug that will silently fail validation.

## Step 1: Confirm the game is actually missing

```
GET {host}/games/api/catalog/{slug}/
```

- `404 "No Game matches the given query."` → proceed, this skill applies.
- `200` with a body → the game already exists; there's nothing to create. If the user actually
  wanted to *update* an existing game (add a skill, change its description), that's a different
  operation (`PATCH`/`PUT` if such an endpoint exists, or Django admin) — say so rather than trying
  to create a duplicate.

## Step 2: Gather real values — don't invent anything

- `GET {host}/games/api/skills/` and `GET {host}/games/api/moods/` — the authoritative, current
  slug lists for that host. Staging and production can differ, so always re-fetch per host rather
  than reusing a list from a previous run or from `app/config/skillsTaxonomy.ts` in skillprint-rewrite
  (that file is a client-side display mirror, not the source of truth).
- For `short_description` (required by the API) and any skills worth attaching, check whether the
  game already has a `gameDetails['<slug>']` entry in `app/config/gameConfig.ts` in skillprint-rewrite
  — reuse its `description` and treat its `skills` array (plain display strings like `"Sequential
  Memory"`) as a hint for which real backend skill slugs are the closest match, rather than
  reproducing those exact display strings as slugs.
- `name` is technically marked optional in the live Swagger schema, but the underlying Django model
  requires a real, unique string (its `default=None` just satisfies DRF's serializer introspection,
  not the database) — always pass a real `--name` regardless of what the schema claims.

## Step 3: Pick the host

Default to `--host staging` (`https://api.staging.skillprint.co`) unless the user names a different
target. `--host local` (`http://localhost:8002`) is for the Docker marketplace stack described in
project memory, useful for a dry run against disposable data before touching staging. Only use
`--host production` after the user explicitly confirms they want a live production write.

## Step 4: Get credentials — partner API key (preferred) or Knox admin token

`GameCreateAPIView` accepts either:

- **A partner API key** (`X-Api-Key: <prefix.secret>` header, or `Authorization: Api-Key <key>` as
  a fallback) — the simpler path, and the one to prefer when the user just wants to register their
  own game. **Important asymmetry**: a key-only request is always scoped to that key's own
  organization — `perform_create` (`games/views.py`) ignores whatever `organization` value is in
  the request body and substitutes `resolve_partner_organization(request)` instead, so one partner
  can never create a game under another partner's name. Don't bother passing `--organization` when
  using an API key; it'll be silently overridden.
- **A Knox admin token** (`Authorization: Token <knox_token>`, staff user) — still supported, and
  the only way to set an explicit `organization` on someone else's behalf or act with no
  organization at all.

This skill never mints or guesses either credential. Ask the user for one — an API key from their
partner dashboard, or (for the admin path) a Knox token minted by a staff user on the target host.
Pass it straight through to the script as `--api-key` or `--token`; never log it, write it to a
file, or echo it back unredacted.

## Step 5: Dry run, review, then execute

Use the bundled script rather than hand-writing curl — it redacts credentials when printing,
defaults to a dry run, and encodes list fields (`skills`, `moods`) the way the multipart parser
expects (repeated `-F` flags with the same key, not `skills[]` or a comma-joined string):

```bash
python3 scripts/create_game.py \
  --host staging \
  --api-key "$PARTNER_API_KEY" \
  --name "Simon Says" \
  --short-description "Watch, remember, and repeat the growing color sequence." \
  --skill memory \
  --publicly-listed
```

(swap `--api-key "$PARTNER_API_KEY"` for `--token "$KNOX_TOKEN"` to use the Knox admin path instead
— exactly one of the two is required.)

This prints the exact request (credential redacted) and stops — nothing is sent yet. Show that
output to the user. Only re-run with `--execute` appended after they confirm it looks right.

Useful flags: `--display-name`, `--long-description`, repeatable `--skill`/`--mood`,
`--orientation {landscape,portrait}`, `--engine-type {unity,html5_js,construct,phaser,godot_html5,custom_js}`,
`--html5-entry-file` (for HTML5/JS games, the entry file inside the game's static bundle — check the
game's own `index.html` path convention in `public/games/live/<GameName>/static/`).

## Step 6: Verify

After a real `--execute` run, re-fetch `GET {host}/games/api/catalog/{slug}/` and confirm it now
returns `200` with the expected `skills`/`moods` in the response.

## Step 7: Report the caveat about `is_active`

The create API does not expose `is_active` — new games are created with the model default
(`False`). This does **not** block catalog visibility (`GameCatalogAPIView`'s queryset only filters
on `is_publicly_listed`), but if the game needs to be fully "active" for some other downstream
check, that field can only be flipped via Django admin. Mention this to the user rather than
silently leaving it ambiguous.

## Related

- [[game-tuning-params]] produces the mood-adjustment prose + parameter JSON for a game's
  *difficulty tuning*. That's a separate concern from this skill, which creates the game's *catalog
  record* (name, description, skills, moods). A new game typically needs both: this skill first (so
  the game exists as a `Game` row at all), then `game-tuning-params` — and, if the user wants scoring
  config pushed too, that skill's own optional "publish to marketplace API" step targets a different
  endpoint (`scoring/api/games/<slug>/scoring-config/`, for `GameScoringConfig`) — not this one.
