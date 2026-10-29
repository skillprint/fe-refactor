#!/bin/sh
# Rebuilds public/games/live/Battle Drones/static: upstream Battle Drones at
# the pinned commit, plus skillprint.patch, bundled by vite.skillprint.config.mjs
# (never upstream's vite.config.ts). See README.md next to this script.
#
#   scripts/battle-drones/build.sh            # in a temporary directory
#   BATTLEDRONES_WORK=~/bd scripts/battle-drones/build.sh   # reuse a checkout
set -eu

UPSTREAM=https://github.com/simonw/battledrones.git
COMMIT=ca4f13b36013e1980289046e731a295d2bf02a3e

HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(cd "$HERE/../.." && pwd)
OUT="$REPO/public/games/live/Battle Drones/static"
WORK=${BATTLEDRONES_WORK:-$(mktemp -d)}
SRC="$WORK/battledrones"

if [ ! -d "$SRC/.git" ]; then
  git init --quiet "$SRC"
  git -C "$SRC" remote add origin "$UPSTREAM"
fi
git -C "$SRC" fetch --quiet --depth 1 origin "$COMMIT"
git -C "$SRC" checkout --quiet --force FETCH_HEAD
git -C "$SRC" clean --quiet -fd -e node_modules
git -C "$SRC" apply "$HERE/skillprint.patch"

# (no install scripts: nothing in the dependency tree needs one to build)
(cd "$SRC" && npm ci --ignore-scripts --no-audit --no-fund --loglevel=error)
"$SRC/node_modules/.bin/tsc" --noEmit -p "$SRC/tsconfig.json"
(cd "$HERE" && BATTLEDRONES_SRC="$SRC" BATTLEDRONES_OUT="$WORK/static" \
  "$SRC/node_modules/.bin/vite" build --config "$HERE/vite.skillprint.config.mjs" --logLevel warn)

# the harness page is ours, not the build's: keep it across rebuilds
cp "$OUT/iframeTest.html" "$WORK/iframeTest.html"
rm -rf "$OUT"
cp -R "$WORK/static" "$OUT"
cp "$WORK/iframeTest.html" "$OUT/iframeTest.html"
echo "Built Battle Drones $COMMIT (+ skillprint.patch) into $OUT"
