// Builds Battle Drones (github.com/simonw/battledrones) for the Skillprint
// portal without running upstream's vite.config.ts: the same build-time
// constants, computed here, and no service worker (a cache-first worker
// scoped to the game folder would keep serving an old build inside the
// portal). Only the game page is built, not upstream's tool pages.
//
//   BATTLEDRONES_SRC=<checkout> BATTLEDRONES_OUT=<dir> \
//     <checkout>/node_modules/.bin/vite build --config vite.skillprint.config.mjs
//
// Plain object, no imports from vite: the config lives outside the checkout,
// where `vite` doesn't resolve.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(process.env.BATTLEDRONES_SRC ?? ".");
const outDir = resolve(process.env.BATTLEDRONES_OUT ?? join(root, "dist-skillprint"));

// upstream vite.config.ts terrainRevisions(): a hash of each map's painted chunks
function terrainRevisions() {
  const dir = join(root, "public/assets/maps");
  const revs = {};
  for (const map of readdirSync(dir, { withFileTypes: true })) {
    if (!map.isDirectory()) continue;
    const hash = createHash("sha256");
    for (const f of readdirSync(join(dir, map.name)).filter((f) => /^t_\d+_\d+\.webp$/.test(f)).sort())
      hash.update(f).update(readFileSync(join(dir, map.name, f)));
    revs[map.name] = hash.digest("hex").slice(0, 12);
  }
  return revs;
}

// upstream tools/arena/files.ts treeHash(): sorted paths and contents of the given trees
function treeHash(dirs) {
  const h = createHash("sha256");
  const walk = (p) => (statSync(p).isDirectory() ? readdirSync(p).sort().flatMap((n) => walk(join(p, n))) : [p]);
  for (const d of dirs) {
    let files = [];
    try {
      files = walk(join(root, d));
    } catch {
      continue;
    }
    for (const p of files) {
      h.update(relative(root, p).replaceAll("\\", "/"));
      h.update("\0");
      h.update(readFileSync(p));
      h.update("\0");
    }
  }
  return h.digest("hex").slice(0, 16);
}

export default {
  root,
  base: "./",
  define: {
    __TERRAIN_REVS__: JSON.stringify(terrainRevisions()),
    __SIM_HASH__: JSON.stringify(treeHash(["src/sim"])),
    __DUEL_HASH__: JSON.stringify(treeHash(["src/sim", "src/versus", "src/link", "src/net", "src/game/local-side.ts"])),
    __FFA_HASH__: JSON.stringify(treeHash(["src/sim", "src/ffa", "src/net"])),
    __VERSION_TAG__: JSON.stringify(null)
  },
  build: {
    target: "es2022",
    outDir,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      input: { main: join(root, "index.html") },
      output: { manualChunks: { three: ["three"] } }
    }
  }
};
