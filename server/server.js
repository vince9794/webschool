/* ============================================================
   THE GREENHILL SCHOOL — Admin Platform Server
   ------------------------------------------------------------
   Serves the public website, the /admin management platform,
   and the JSON API:
     - content  (texts, images, cards)  → server/data/content.json
     - media    (image uploads)         → images/uploads/
     - subscribers + browser push subscriptions
     - messages (admin → subscribers' browsers)
   ============================================================ */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const webpush = require('web-push');
const imgutil = require('../netlify/_lib/imgutil'); // shared with the Netlify Functions

const ROOT = path.resolve(__dirname, '..');          // site root (static files)
const DATA_DIR = path.join(__dirname, 'data');       // JSON stores
const UPLOAD_DIR = path.join(ROOT, 'images', 'uploads');

/* ------------------------------------------------------------
   Small JSON file store (safe: atomic write, in-memory cache)
   ------------------------------------------------------------ */
function loadJson(file, fallback) {
  const p = path.join(DATA_DIR, file);
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { return fallback; }
}
function saveJson(file, value) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const p = path.join(DATA_DIR, file);
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, p); // atomic on same volume
}

const store = {
  content: loadJson('content.json', {}),
  subscribers: loadJson('subscribers.json', []),
  pushes: loadJson('push-subscriptions.json', []),
  messages: loadJson('messages.json', []),
  settings: loadJson('settings.json', null)
};

/* ------------------------------------------------------------
   Settings: admin password (scrypt hash) + VAPID keys
   ------------------------------------------------------------ */
function scryptHash(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}

if (!store.settings) {
  const salt = crypto.randomBytes(16).toString('hex');
  store.settings = {
    adminSalt: salt,
    adminHash: scryptHash('greenhill', salt), // default password — change in Settings
    vapid: webpush.generateVAPIDKeys(),
    createdAt: new Date().toISOString()
  };
  saveJson('settings.json', store.settings);
}
if (!store.settings.vapid) {
  store.settings.vapid = webpush.generateVAPIDKeys();
  saveJson('settings.json', store.settings);
}
webpush.setVapidDetails(
  'mailto:admin@greenhill.ac.ke',
  store.settings.vapid.publicKey,
  store.settings.vapid.privateKey
);

/* ------------------------------------------------------------
   Sessions (token → expiry). Persisted so restarts stay logged in.
   ------------------------------------------------------------ */
const sessions = loadJson('sessions.json', {});
function saveSessions() { saveJson('sessions.json', sessions); }

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions[token] = { created: Date.now(), expires: Date.now() + 1000 * 60 * 60 * 24 * 7 };
  pruneSessions();
  saveSessions();
  return token;
}
function pruneSessions() {
  const now = Date.now();
  Object.keys(sessions).forEach((t) => { if (sessions[t].expires < now) delete sessions[t]; });
}

/* ------------------------------------------------------------
   Express app
   ------------------------------------------------------------ */
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '25mb' })); // base64 images arrive as JSON

const PORT = process.env.PORT || 3000;

/* ---- auth helpers ---- */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.query.token || '');
  pruneSessions();
  if (token && sessions[token]) return next();
  res.status(401).json({ error: 'Not signed in' });
}

const loginAttempts = {}; // naive per-IP throttle
function tooManyAttempts(ip) {
  const a = loginAttempts[ip] || { count: 0, until: 0 };
  if (a.until > Date.now()) return true;
  return false;
}
function recordFailure(ip) {
  const a = loginAttempts[ip] || { count: 0, until: 0 };
  a.count += 1;
  if (a.count >= 5) { a.until = Date.now() + 5 * 60 * 1000; a.count = 0; } // 5 min lockout
  loginAttempts[ip] = a;
}

/* ============================================================
   API — auth
   ============================================================ */
app.post('/api/login', (req, res) => {
  const ip = req.ip;
  if (tooManyAttempts(ip)) return res.status(429).json({ error: 'Too many attempts. Try again in 5 minutes.' });
  const password = (req.body && req.body.password) || '';
  const hash = scryptHash(password, store.settings.adminSalt);
  const ok = hash.length === store.settings.adminHash.length &&
    crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(store.settings.adminHash));
  if (!ok) { recordFailure(ip); return res.status(401).json({ error: 'Incorrect password.' }); }
  delete loginAttempts[ip];
  res.json({ token: createSession() });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  delete sessions[token];
  saveSessions();
  res.json({ ok: true });
});

app.post('/api/password', requireAuth, (req, res) => {
  const { current, next } = req.body || {};
  if (!current || !next || String(next).length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }
  const hash = scryptHash(current, store.settings.adminSalt);
  const ok = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(store.settings.adminHash));
  if (!ok) return res.status(401).json({ error: 'Current password is incorrect.' });
  const salt = crypto.randomBytes(16).toString('hex');
  store.settings.adminSalt = salt;
  store.settings.adminHash = scryptHash(next, salt);
  saveJson('settings.json', store.settings);
  // Sign out every device (parity with the stateless Netlify tokens,
  // which are tied to the password salt).
  Object.keys(sessions).forEach((t) => { delete sessions[t]; });
  saveSessions();
  res.json({ ok: true });
});

/* ============================================================
   API — content (public read; admin write)
   ============================================================ */
app.get('/api/content', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json(store.content);
});

app.put('/api/content', requireAuth, (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Invalid content payload.' });
  }
  store.content = body;
  saveJson('content.json', store.content);
  res.json({ ok: true, savedAt: new Date().toISOString() });
});

/* ============================================================
   API — media library
   ============================================================ */
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

/* Bundled photos (images/, uploads/ walked separately) + uploads.
   Uploads use the same public path as production:
   api/media/file?path=uploads/<name>  → served from disk by the
   route below, from Blobs on Netlify. */
function listImages() {
  const out = [];
  function walk(dir, base) {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const ent of entries) {
      if (ent.isDirectory()) {
        if (ent.name === 'uploads') continue;
        walk(path.join(dir, ent.name), base ? base + '/' + ent.name : ent.name);
      } else if (ALLOWED_EXT.has(path.extname(ent.name).toLowerCase())) {
        let bytes = 0;
        try { bytes = fs.statSync(path.join(dir, ent.name)).size; } catch (e) {}
        out.push({ path: 'images/' + (base ? base + '/' : '') + ent.name, name: ent.name, bytes });
      }
    }
  }
  walk(path.join(ROOT, 'images'), '');

  let ups = [];
  try { ups = fs.readdirSync(UPLOAD_DIR, { withFileTypes: true }); } catch (e) { /* no uploads yet */ }
  for (const d of ups) {
    if (!d.isFile() || !ALLOWED_EXT.has(path.extname(d.name).toLowerCase())) continue;
    let bytes = 0;
    try { bytes = fs.statSync(path.join(UPLOAD_DIR, d.name)).size; } catch (e) {}
    out.push({ path: imgutil.publicUploadPath(d.name), name: d.name, bytes });
  }
  out.sort(imgutil.sortImages);
  return out;
}

app.get('/api/media', requireAuth, (req, res) => {
  res.json({ images: listImages() });
});

/* Raw-body upload — identical contract to the Netlify Function:
   POST /api/media/upload · body = file bytes · x-filename = original name */
app.post('/api/media/upload', requireAuth, express.raw({ type: '*/*', limit: '6mb' }), (req, res) => {
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || !buf.length) return res.status(400).json({ error: 'No file received.' });
  if (buf.length > 4 * 1024 * 1024) return res.status(400).json({ error: 'Images must be 4 MB or smaller.' });
  const kind = imgutil.sniff(buf);
  if (!kind) return res.status(400).json({ error: 'Only JPG, PNG, WEBP, GIF or AVIF images.' });
  let original = 'image';
  try { original = decodeURIComponent(String(req.get('x-filename') || 'image')) || 'image'; } catch (e) { /* keep default */ }
  const fileName = imgutil.safeName(original, kind.ext);
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, fileName), buf);
  res.json({ path: imgutil.publicUploadPath(fileName), name: original, bytes: buf.length });
});

/* Public image serving for uploads: GET /api/media/file?path=uploads/<name> */
app.get('/api/media/file', (req, res) => {
  const key = String(req.query.path || '');
  if (!imgutil.isUploadKey(key)) return res.status(400).json({ error: 'Invalid path.' });
  const abs = path.join(UPLOAD_DIR, key.slice('uploads/'.length));
  if (!abs.startsWith(UPLOAD_DIR)) return res.status(400).json({ error: 'Invalid path.' });
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(abs, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'Not found.' });
  });
});

app.delete('/api/media', requireAuth, (req, res) => {
  const raw = String(req.query.path || '');
  if (raw.indexOf('images/') === 0) {
    return res.status(403).json({ error: 'Only uploaded images can be deleted. Bundled site images are protected.' });
  }
  const key = imgutil.uploadKeyFromPath(raw) || (imgutil.isUploadKey(raw) ? raw : null);
  if (!key) return res.status(400).json({ error: 'Invalid path.' });
  const abs = path.join(UPLOAD_DIR, key.slice('uploads/'.length));
  if (!abs.startsWith(UPLOAD_DIR) || !fs.existsSync(abs)) return res.status(404).json({ error: 'File not found.' });
  try { fs.unlinkSync(abs); } catch (e) { return res.status(404).json({ error: 'File not found.' }); }
  res.json({ ok: true });
});

/* ============================================================
   API — subscribers
   ============================================================ */
function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '')); }

app.post('/api/subscribe', (req, res) => {
  const { email, name, source } = req.body || {};
  if (!validEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  const existing = store.subscribers.find((s) => s.email.toLowerCase() === String(email).toLowerCase());
  if (existing) {
    existing.unsubscribed = false;
    existing.updatedAt = new Date().toISOString();
  } else {
    store.subscribers.push({
      id: crypto.randomUUID(),
      email: String(email).toLowerCase(),
      name: String(name || '').slice(0, 80),
      source: String(source || 'website').slice(0, 40),
      subscribedAt: new Date().toISOString(),
      unsubscribed: false
    });
  }
  saveJson('subscribers.json', store.subscribers);
  res.json({ ok: true, message: 'You are subscribed. Thank you!' });
});

app.get('/api/subscribers', requireAuth, (req, res) => {
  const active = store.subscribers.filter((s) => !s.unsubscribed);
  res.json({
    subscribers: store.subscribers,
    pushCount: store.pushes.length,
    activeCount: active.length
  });
});

app.post('/api/subscribers', requireAuth, (req, res) => { // admin adds manually
  const { email, name } = req.body || {};
  if (!validEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  const existing = store.subscribers.find((s) => s.email.toLowerCase() === String(email).toLowerCase());
  if (existing) { existing.unsubscribed = false; }
  else {
    store.subscribers.push({
      id: crypto.randomUUID(),
      email: String(email).toLowerCase(),
      name: String(name || '').slice(0, 80),
      source: 'added by admin',
      subscribedAt: new Date().toISOString(),
      unsubscribed: false
    });
  }
  saveJson('subscribers.json', store.subscribers);
  res.json({ ok: true });
});

app.delete('/api/subscribers', requireAuth, (req, res) => {
  const before = store.subscribers.length;
  store.subscribers = store.subscribers.filter((s) => s.id !== String(req.query.id || ''));
  if (store.subscribers.length === before) return res.status(404).json({ error: 'Not found.' });
  saveJson('subscribers.json', store.subscribers);
  res.json({ ok: true });
});

/* ============================================================
   API — browser push subscriptions
   ============================================================ */
app.get('/api/push-key', (req, res) => {
  res.json({ publicKey: store.settings.vapid.publicKey });
});

app.post('/api/push-subscribe', (req, res) => {
  const { subscription, email } = req.body || {};
  if (!subscription || !subscription.endpoint) return res.status(400).json({ error: 'Missing subscription.' });
  const found = store.pushes.find((p) => p.endpoint === subscription.endpoint);
  if (found) {
    found.subscription = subscription;
    found.email = email ? String(email).toLowerCase() : found.email;
    found.updatedAt = new Date().toISOString();
  } else {
    store.pushes.push({
      id: crypto.randomUUID(),
      endpoint: subscription.endpoint,
      subscription,
      email: email ? String(email).toLowerCase() : null,
      createdAt: new Date().toISOString()
    });
  }
  saveJson('push-subscriptions.json', store.pushes);
  res.json({ ok: true });
});

app.post('/api/push-unsubscribe', (req, res) => {
  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint.' });
  store.pushes = store.pushes.filter((p) => p.endpoint !== endpoint);
  saveJson('push-subscriptions.json', store.pushes);
  res.json({ ok: true });
});

/* ============================================================
   API — messages (admin → subscribers' browsers)
   ============================================================ */
app.get('/api/messages', (req, res) => {
  // public read of active messages (for on-site banners)
  const active = store.messages.filter((m) => m.active !== false).slice(0, 5);
  res.json({ messages: active });
});

app.get('/api/messages-all', requireAuth, (req, res) => {
  res.json({ messages: store.messages });
});

app.post('/api/messages', requireAuth, async (req, res) => {
  const { title, body, link, sendTo } = req.body || {};
  if (!title || !String(title).trim()) return res.status(400).json({ error: 'Message title is required.' });
  const message = {
    id: crypto.randomUUID(),
    title: String(title).trim().slice(0, 120),
    body: String(body || '').trim().slice(0, 600),
    link: String(link || '').slice(0, 300),
    sendTo: (sendTo === 'push' || sendTo === 'all' || sendTo === 'site-only') ? sendTo : 'all',
    createdAt: new Date().toISOString(),
    active: true,
    stats: { delivered: 0, failed: 0, total: store.pushes.length }
  };

  // Browser push delivery (best effort — invalid/expired subscriptions are pruned)
  if (message.sendTo !== 'site-only') {
    const payload = JSON.stringify({
      title: message.title,
      body: message.body,
      link: message.link || '/',
      id: message.id
    });
    const dead = [];
    await Promise.all(store.pushes.map(async (p) => {
      try {
        await webpush.sendNotification(p.subscription, payload);
        message.stats.delivered += 1;
      } catch (err) {
        message.stats.failed += 1;
        if (err && (err.statusCode === 404 || err.statusCode === 410)) dead.push(p.id);
        else if (err) console.warn('push error:', err.statusCode || err.message);
      }
    }));
    if (dead.length) {
      store.pushes = store.pushes.filter((p) => !dead.includes(p.id));
      saveJson('push-subscriptions.json', store.pushes);
      message.stats.total = store.pushes.length;
    }
  }

  store.messages.unshift(message);
  store.messages = store.messages.slice(0, 100); // keep a manageable history
  saveJson('messages.json', store.messages);
  res.json({ ok: true, message });
});

app.delete('/api/messages', requireAuth, (req, res) => {
  store.messages = store.messages.filter((m) => m.id !== String(req.query.id || ''));
  saveJson('messages.json', store.messages);
  res.json({ ok: true });
});

app.post('/api/messages-toggle', requireAuth, (req, res) => {
  const m = store.messages.find((x) => x.id === (req.body && req.body.id));
  if (!m) return res.status(404).json({ error: 'Not found.' });
  m.active = m.active === false;
  saveJson('messages.json', store.messages);
  res.json({ ok: true, message: m });
});

/* ============================================================
   API — dashboard stats
   ============================================================ */
app.get('/api/stats', requireAuth, (req, res) => {
  const contentPages = Object.keys(store.content).filter((k) => k !== 'global');
  let fieldCount = 0;
  Object.values(store.content).forEach((u) => {
    fieldCount += Object.keys((u && u.fields) || {}).length;
    fieldCount += Object.keys((u && u.lists) || {}).length;
  });
  res.json({
    subscribers: store.subscribers.filter((s) => !s.unsubscribed).length,
    pushDevices: store.pushes.length,
    messages: store.messages.length,
    editedPages: contentPages.length,
    editedItems: fieldCount,
    uploads: (function count(dir) {
      try { return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isFile()).length; }
      catch (e) { return 0; }
    })(UPLOAD_DIR),
    lastMessage: store.messages[0] || null,
    defaultPassword: !store.settings.passwordChanged
  });
});

app.post('/api/password-changed', requireAuth, (req, res) => {
  store.settings.passwordChanged = true;
  saveJson('settings.json', store.settings);
  res.json({ ok: true });
});

/* ============================================================
   Static site + admin platform
   ============================================================ */

// Never serve private folders/files (data stores, deps, manifests)
app.use((req, res, next) => {
  const p = req.path;
  const blocked =
    p === '/server' || p.startsWith('/server/') ||
    p === '/netlify' || p.startsWith('/netlify/') ||
    p === '/tools' || p.startsWith('/tools/') ||
    p === '/publish' || p.startsWith('/publish/') ||
    p === '/node_modules' || p.startsWith('/node_modules/') ||
    p === '/package.json' || p === '/package-lock.json' ||
    p === '/_scan.js' || p === '/README.md';
  if (blocked) return res.status(404).end();
  next();
});

app.use('/admin', express.static(path.join(ROOT, 'admin'), { index: 'index.html' }));
app.use(express.static(ROOT, { index: 'index.html', extensions: ['html'] }));

// /admin SPA fallback
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(ROOT, 'admin', 'index.html'));
});

// API 404
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  const pad = (label, value) => `  │  ${label.padEnd(11)}${value.padEnd(40)}│`;
  console.log('');
  console.log('  ┌───────────────────────────────────────────────────┐');
  console.log('  │  THE GREENHILL SCHOOL — Admin Platform            │');
  console.log('  ├───────────────────────────────────────────────────┤');
  console.log(pad('Website :', `http://localhost:${PORT}/`));
  console.log(pad('Admin   :', `http://localhost:${PORT}/admin`));
  console.log(`  │  ${'Password: greenhill'.padEnd(51)}│`);
  console.log('  │  (change it in admin → Settings)                 │');
  console.log('  └───────────────────────────────────────────────────┘');
  console.log('');
});
