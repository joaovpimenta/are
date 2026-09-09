import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const port = Number(process.env.PORT ?? 4173);
const pagesBase = normalizeBase(process.env.ARE_PAGES_BASE_PATH ?? '/are/');
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.glb', 'model/gltf-binary'],
  ['.gltf', 'model/gltf+json'],
  ['.bin', 'application/octet-stream'],
  ['.map', 'application/json; charset=utf-8'],
]);

function normalizeBase(value) {
  const withLeading = value.startsWith('/') ? value : `/${value}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

async function existingFile(pathname) {
  const decoded = decodeURIComponent(pathname.split('?')[0]);
  let relative = decoded;
  if (relative === pagesBase.slice(0, -1)) relative = '/';
  else if (relative.startsWith(pagesBase)) relative = `/${relative.slice(pagesBase.length)}`;
  relative = relative.replace(/^\/+/, '');
  const safe = normalize(relative).replace(/^(\.\.(\/|\\|$))+/, '');
  const candidates = safe.endsWith('/') || safe === ''
    ? [join(root, safe, 'index.html')]
    : [join(root, safe), join(root, safe, 'index.html')];
  for (const candidate of candidates) {
    const resolved = resolve(candidate);
    if (resolved !== root && !resolved.startsWith(`${root}${sep}`)) continue;
    try {
      const info = await stat(resolved);
      if (info.isFile()) return { path: resolved, size: info.size };
    } catch {
      // Try the next production-build candidate.
    }
  }
  return null;
}

const server = createServer(async (request, response) => {
  const file = await existingFile(new URL(request.url ?? '/', 'http://localhost').pathname);
  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    'content-type': mime.get(extname(file.path).toLowerCase()) ?? 'application/octet-stream',
    'content-length': file.size,
    'cache-control': 'no-store',
  });
  createReadStream(file.path).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving validated dist at http://127.0.0.1:${port} (Pages base ${pagesBase})`);
});
