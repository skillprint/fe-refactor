// Generates the CloudFront viewer-request function from a static export.
//
//   node scripts/static-export/gen-viewer-request.mjs [out] [build/viewer-request.js]
//
// Every directory under out/ with an index.html is a page. A page with a `_`
// segment is a dynamic route's shell (lib/staticExport.ts). Static pages that
// a shell would match go in a table of their own, so they win over it, as do
// files without an extension. The tables come from the build, so a new route
// can't be forgotten. `games/` is left out: games are served from their own
// origin (NEXT_PUBLIC_GAMES_BASE_URL).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// CloudFront's limit on a function's code.
const MAX_FUNCTION_BYTES = 10 * 1024;

function scan(outDir) {
  const pages = [];
  const files = [];
  const url = (full) => `/${path.relative(outDir, full).split(path.sep).join('/')}`;
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (!entry.isDirectory()) {
        if (!entry.name.includes('.')) files.push(url(full));
        continue;
      }
      if (dir === outDir && (entry.name === '_next' || entry.name === 'games')) continue;
      if (fs.existsSync(path.join(full, 'index.html'))) pages.push(`${url(full)}/`);
      walk(full);
    }
  })(outDir);
  return { pages, files };
}

function matches(shell, page) {
  const a = shell.split('/');
  const b = page.split('/');
  return a.length === b.length && a.every((seg, i) => seg === '_' || seg === b[i]);
}

/** The function's source for the export in `outDir`. */
export function generate(outDir) {
  const { pages, files } = scan(outDir);
  const isShell = (page) => page.split('/').includes('_');
  const shells = pages.filter(isShell).sort((a, b) => b.split('/').length - a.split('/').length || a.localeCompare(b));
  const statics = pages.filter((page) => !isShell(page) && shells.some((shell) => matches(shell, page))).sort();

  const template = fs.readFileSync(new URL('./viewer-request.template.js', import.meta.url), 'utf8');
  const code = template
    .replace('/*SHELLS*/[]', JSON.stringify(shells))
    .replace('/*STATIC*/[]', JSON.stringify(statics))
    .replace('/*FILES*/[]', JSON.stringify(files.sort()));
  const bytes = Buffer.byteLength(code);
  if (bytes > MAX_FUNCTION_BYTES) {
    throw new Error(`viewer-request function is ${bytes} bytes; CloudFront allows ${MAX_FUNCTION_BYTES}`);
  }
  return { code, shells, statics, files };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outDir = process.argv[2] || 'out';
  const target = process.argv[3] || 'build/viewer-request.js';
  const { code, shells, statics, files } = generate(outDir);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, code);
  console.log(`${target}: ${shells.length} shells, ${statics.length} static pages beside them, ${files.length} extensionless files, ${Buffer.byteLength(code)} bytes`);
}
