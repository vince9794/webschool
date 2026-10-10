/* ============================================================
   Local harness that runs the Netlify Functions in-process.

   Serves the static site + /api/* through the real function
   handlers with in-memory storage — the production code path —
   so the admin platform can be tested end-to-end without a
   Netlify deploy. Not used in production.

   Run with:  node tools/function-server.js   (port 3005)
   ============================================================ */

process.env.GREENHILL_STORE = 'mem';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const FN_DIR = path.join(ROOT, 'netlify', 'functions');
const PORT = Number(process.env.PORT || 3005);

const handlers = {};
fs.readdirSync(FN_DIR).forEach((f) => {
  if (f.endsWith('.js')) handlers[f.replace(/\.js$/, '')] = require(path.join(FN_DIR, f)).handler;
});

const BLOCKED_TOP = new Set(['server', 'netlify', 'tools', 'node_modules', 'publish']);
const ALLOWED_EXT = new Set(['.html', '.css', '.js', '.json', '.webp', '.jpg', '.jpeg', '.png', '.gif', '.avif', '.ico', '.svg', '.woff', '.woff2', '.txt', '.map']);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.svg': 'image/svg+xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.map': 'application/json'
};

function statOrNull(p) { try { return fs.statSync(p); } catch (e) { return null; } }

function sendJSON(res, status, body) {
  const buf = Buffer.from(JSON.stringify(body));
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': buf.length });
  res.end(buf);
}

function serveStatic(res, pathname) {
  let p = decodeURIComponent(pathname);
  if (p === '/') p = '/index.html';
  const rel = p.replace(/^\/+/, '');
  const abs = path.resolve(ROOT, rel);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return sendJSON(res, 404, { error: 'Not found' });
  if (BLOCKED_TOP.has(rel.split('/')[0])) return sendJSON(res, 404, { error: 'Not found' });
  if (rel === 'package.json' || rel === 'package-lock.json' || rel === 'README.md') return sendJSON(res, 404, { error: 'Not found' });

  let file = abs;
  let st = statOrNull(file);
  if (st && st.isDirectory()) { file = path.join(file, 'index.html'); st = statOrNull(file); }
  if (!st || !st.isFile()) {
    const alt = abs + '.html';
    const st2 = statOrNull(alt);
    if (st2 && st2.isFile()) file = alt;
    else return sendJSON(res, 404, { error: 'Not found' });
  }
  const ext = path.extname(file).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return sendJSON(res, 404, { error: 'Not found' });
  const buf = fs.readFileSync(file);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': buf.length, 'Cache-Control': 'no-cache' });
  res.end(buf);
}

function runFunction(res, name, req, searchParams) {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', async () => {
    const raw = Buffer.concat(chunks);
    const ct = String(req.headers['content-type'] || '');
    const textual = !ct || /json|text|urlencoded/i.test(ct);
    const event = {
      httpMethod: req.method,
      path: '/.netlify/functions/' + name,
      queryStringParameters: Object.fromEntries(searchParams),
      headers: req.headers,
      body: raw.length ? (textual ? raw.toString('utf8') : raw.toString('base64')) : null,
      isBase64Encoded: raw.length ? !textual : false
    };
    try {
      const out = await handlers[name](event, { functionName: name });
      const body = out.body == null ? Buffer.alloc(0)
        : (out.isBase64Encoded ? Buffer.from(String(out.body), 'base64') : Buffer.from(String(out.body), 'utf8'));
      const headers = Object.assign({}, out.headers, { 'Content-Length': body.length });
      res.writeHead(out.statusCode || 200, headers);
      res.end(body);
    } catch (e) {
      console.error('[harness] function "' + name + '" threw:', e);
      sendJSON(res, 500, { error: e.message || 'Server error' });
    }
  });
}

const server = http.createServer((req, res) => {
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch (e) { return sendJSON(res, 400, { error: 'Bad request' }); }

  if (url.pathname.indexOf('/api/') === 0) {
    // Mirror netlify.toml: /api/media/upload → function media-upload,
    // /api/media/file → media-file, everything else flat (/api/login → login).
    const name = url.pathname.slice(5).replace(/\//g, '-');
    if (!/^[a-z0-9-]+$/i.test(name) || !handlers[name]) return sendJSON(res, 404, { error: 'Not found' });
    return runFunction(res, name, req, url.searchParams);
  }
  serveStatic(res, url.pathname);
});

server.listen(PORT, () => {
  console.log('Function harness: http://localhost:' + PORT + '/  (admin at /admin, ' + Object.keys(handlers).length + ' functions, memory storage)');
});
