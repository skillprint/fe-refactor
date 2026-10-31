// A local stand-in for S3 + CloudFront: runs the generated viewer-request
// function on each request, then serves the rewritten path from the export.
//
//   node scripts/static-export/serve.mjs [out] [port] [build/viewer-request.js]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'out');
const port = Number(process.argv[3] || 3003);
const code = fs.readFileSync(process.argv[4] || 'build/viewer-request.js', 'utf8');
const handler = new Function(`${code}\nreturn handler;`)();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/x-component',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
};

// CloudFront hands the function a parsed query; build the same shape.
function querystringOf(search) {
  const qs = {};
  for (const part of search.slice(1).split('&').filter(Boolean)) {
    const [key, ...rest] = part.split('=');
    const value = { value: rest.join('=') };
    const seen = qs[key];
    if (seen) qs[key] = { value: seen.value, multiValue: [...(seen.multiValue || [seen]), value] };
    else qs[key] = value;
  }
  return qs;
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const result = handler({ request: { method: req.method, uri: url.pathname, querystring: querystringOf(url.search), headers: {} } });
    if (result.statusCode) {
      console.log(`${req.method} ${req.url} -> ${result.statusCode} ${result.headers.location.value}`);
      res.writeHead(result.statusCode, { location: result.headers.location.value });
      return res.end();
    }
    let file;
    try {
      file = path.join(root, decodeURIComponent(result.uri));
    } catch {
      file = null;
    }
    const ok = !!file && file.startsWith(root) && fs.existsSync(file) && fs.statSync(file).isFile();
    // S3 has no such key: CloudFront's custom error response serves the 404 page.
    const served = ok ? file : path.join(root, '404.html');
    console.log(`${req.method} ${req.url} -> ${result.uri} ${ok ? 200 : 404}`);
    res.writeHead(ok ? 200 : 404, {
      'content-type': TYPES[path.extname(served)] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    if (req.method === 'HEAD') return res.end();
    res.end(fs.readFileSync(served));
  })
  .listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
