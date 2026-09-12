#!/usr/bin/env python3
"""
Create a Game record on the Skillprint marketplace backend via
POST /games/api/games/ (multipart/form-data). Accepts either a partner API
key or a Knox admin token — exactly one of --api-key / --token is required.

A key-only request is always scoped to that key's own organization (the
backend ignores --organization in that case and substitutes the key's real
org); --organization only has effect when authenticating with --token.

Defaults to a dry run: it prints the exact request it would send (credential
redacted) and does nothing else. Pass --execute only after the user has
reviewed that printed request and told you to proceed.

Example (API key, preferred):
  python3 create_game.py --host staging --api-key "$PARTNER_API_KEY" \\
    --name "Simon Says" \\
    --short-description "Watch, remember, and repeat the growing color sequence." \\
    --skill memory --publicly-listed
  # review the printed request, then re-run with --execute

Example (Knox admin token):
  python3 create_game.py --host staging --token "$KNOX_TOKEN" \\
    --name "Simon Says" --short-description "..." --skill memory --publicly-listed
"""
import argparse
import shlex
import subprocess
import sys

HOSTS = {
    "staging": "https://api.staging.skillprint.co",
    "production": "https://api.skillprint.co",
    "local": "http://localhost:8002",
}

ENGINE_TYPES = ["unity", "html5_js", "construct", "phaser", "godot_html5", "custom_js"]


def build_args():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--host", required=True, choices=list(HOSTS) + ["custom"],
                   help="Which backend to hit. 'custom' requires --base-url.")
    p.add_argument("--base-url", help="Required when --host custom, e.g. https://api.example.com")
    creds = p.add_mutually_exclusive_group(required=True)
    creds.add_argument("--api-key", help="Partner API key ('prefix.secret'), sent as 'X-Api-Key: <key>'. "
                                         "Scopes the created game to this key's own organization.")
    creds.add_argument("--token", help="Knox admin token (sent as 'Authorization: Token <token>'). "
                                       "Required if you need to set --organization explicitly.")
    p.add_argument("--name", required=True, help="Internal name; the backend slugifies this (avoid changing later)")
    p.add_argument("--display-name", help="Defaults to --name on the backend if omitted")
    p.add_argument("--short-description", required=True)
    p.add_argument("--long-description")
    p.add_argument("--organization", metavar="SLUG",
                   help="Only takes effect with --token (admin). Ignored and overridden by the caller's "
                        "own organization when authenticating with --api-key.")
    p.add_argument("--skill", action="append", default=[], metavar="SLUG",
                   help="Existing skill slug to attach, repeatable. Must already exist on the target host "
                        "(check GET games/api/skills/ first) — this script does not create skills.")
    p.add_argument("--mood", action="append", default=[], metavar="SLUG",
                   help="Existing mood slug to attach, repeatable. Same caveat as --skill.")
    p.add_argument("--publicly-listed", action="store_true",
                   help="Set is_publicly_listed=true. Required for the game to appear in games/api/catalog/.")
    p.add_argument("--orientation", choices=["landscape", "portrait"])
    p.add_argument("--engine-type", choices=ENGINE_TYPES)
    p.add_argument("--html5-entry-file", help="Entry HTML file for html5_js games, e.g. index.html")
    p.add_argument("--execute", action="store_true",
                   help="Actually send the request. Without this flag, only prints the request (dry run).")
    return p.parse_args()


def main():
    args = build_args()
    base = args.base_url if args.host == "custom" else HOSTS[args.host]
    if not base:
        sys.exit("--base-url is required when --host custom")
    if args.host == "production" and not args.execute:
        print("NOTE: --host production selected. This writes to a live, shared system — get explicit,\n"
              "separate user confirmation before ever passing --execute here.\n")
    url = f"{base.rstrip('/')}/games/api/games/"

    if args.organization and not args.token:
        print("WARNING: --organization only has effect with --token (admin). An --api-key request "
              "is always scoped to that key's own organization, so --organization will be ignored "
              "by the backend.\n")

    fields = []  # list of (key, value) — repeated keys for array fields (DRF multipart convention)
    fields.append(("name", args.name))
    if args.display_name:
        fields.append(("display_name", args.display_name))
    fields.append(("short_description", args.short_description))
    if args.long_description:
        fields.append(("long_description", args.long_description))
    for s in args.skill:
        fields.append(("skills", s))
    for m in args.mood:
        fields.append(("moods", m))
    if args.organization:
        fields.append(("organization", args.organization))
    if args.publicly_listed:
        fields.append(("is_publicly_listed", "true"))
    if args.orientation:
        fields.append(("orientation", args.orientation))
    if args.engine_type:
        fields.append(("engine_type", args.engine_type))
    if args.html5_entry_file:
        fields.append(("html5_entry_file", args.html5_entry_file))

    if args.api_key:
        auth_header = f"X-Api-Key: {args.api_key}"
        redacted_auth_header = "X-Api-Key: ***redacted***"
    else:
        auth_header = f"Authorization: Token {args.token}"
        redacted_auth_header = "Authorization: Token ***redacted***"

    cmd = ["curl", "-sS", "-X", "POST", url, "-H", auth_header]
    for k, v in fields:
        cmd.extend(["-F", f"{k}={v}"])

    redacted = ["curl", "-sS", "-X", "POST", url, "-H", redacted_auth_header]
    for k, v in fields:
        redacted.extend(["-F", f"{k}={v}"])

    print("Request to be sent:")
    print(" ", " ".join(shlex.quote(c) for c in redacted))
    print()

    if not args.execute:
        print("Dry run only (no --execute passed). Nothing was sent.")
        return

    result = subprocess.run(cmd, capture_output=True, text=True)
    print(f"HTTP exchange complete (curl exit code {result.returncode}).")
    print(result.stdout)
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        sys.exit(result.returncode)


if __name__ == "__main__":
    main()
