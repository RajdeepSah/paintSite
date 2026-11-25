// Tiny zero-dependency static file server for local development and tests.
// Usage: node scripts/serve.mjs [port]   (default port 8080)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

export function startServer(port = 8080) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
      let file = join(ROOT, path);
      if (!file.startsWith(ROOT)) throw Object.assign(new Error('Forbidden'), { code: 403 });
      const info = await stat(file).catch(() => null);
      if (info && info.isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, {
        'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      res.end(body);
    } catch (err) {
      const code = err.code === 403 ? 403 : 404;
      res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(code === 403 ? 'Forbidden' : 'Not found');
    }
  });
  return new Promise((ok) => server.listen(port, () => ok(server)));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || process.env.PORT || 8080);
  startServer(port).then(() => console.log(`Serving ${ROOT} at http://localhost:${port}`));
}
