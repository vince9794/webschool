/* ============================================================
   Auth for the Netlify backend.

   - scrypt password hash (same as the Express dev server)
   - stateless signed session tokens (HMAC), 7-day expiry.
     Signing key mixes tokenSecret + adminSalt, so changing the
     password instantly invalidates every outstanding token.
   - login throttle persisted in storage (works across function
     instances, unlike a per-process counter).
   ============================================================ */

const crypto = require('crypto');
const webpush = require('web-push');
const store = require('./store');

const DAY7 = 7 * 24 * 60 * 60 * 1000;

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}

/* First run generates the default admin (password: greenhill),
   a token secret and VAPID push keys. */
async function getSettings() {
  let s = await store.getJSON('data/settings');
  if (!s || !s.adminHash || !s.adminSalt) {
    const salt = crypto.randomBytes(16).toString('hex');
    s = {
      adminSalt: salt,
      adminHash: hashPassword('greenhill', salt),
      tokenSecret: crypto.randomBytes(32).toString('hex'),
      vapid: webpush.generateVAPIDKeys(),
      createdAt: new Date().toISOString()
    };
    await store.setJSON('data/settings', s);
    return s;
  }
  let changed = false;
  if (!s.vapid || !s.vapid.publicKey || !s.vapid.privateKey) { s.vapid = webpush.generateVAPIDKeys(); changed = true; }
  if (!s.tokenSecret) { s.tokenSecret = crypto.randomBytes(32).toString('hex'); changed = true; }
  if (changed) await store.setJSON('data/settings', s);
  return s;
}

function verifyPassword(settings, password) {
  let hash;
  try { hash = hashPassword(password, settings.adminSalt); } catch (e) { return false; }
  const a = Buffer.from(hash);
  const b = Buffer.from(settings.adminHash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ---- signed tokens: "<expiryMs>.<hmacHex>" ---- */
function sign(settings, expStr) {
  return crypto.createHmac('sha256', settings.tokenSecret + '|' + settings.adminSalt)
    .update(expStr).digest('hex');
}

function makeToken(settings) {
  const expStr = String(Date.now() + DAY7);
  return expStr + '.' + sign(settings, expStr);
}

function tokenValid(settings, token) {
  if (!token || typeof token !== 'string') return false;
  const i = token.indexOf('.');
  if (i < 1) return false;
  const expStr = token.slice(0, i);
  const sig = token.slice(i + 1);
  if (!/^\d+$/.test(expStr) || !/^[0-9a-f]{64}$/.test(sig)) return false;
  if (Number(expStr) < Date.now()) return false;
  const expected = sign(settings, expStr);
  try { return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex')); }
  catch (e) { return false; }
}

/* Returns { settings } on success, or { settings, status, error }. */
async function requireAuth(event) {
  const settings = await getSettings();
  const h = event.headers || {};
  const authz = String(h.authorization || h.Authorization || '');
  let token = authz.indexOf('Bearer ') === 0 ? authz.slice(7) : '';
  if (!token) token = queryToken(event);
  if (!tokenValid(settings, token)) return { settings, status: 401, error: 'Not signed in' };
  return { settings };
}

function queryToken(event) {
  const q = event.queryStringParameters || {};
  return q.token ? String(q.token) : '';
}

/* ---- login throttle (5 failures → 5-minute lockout) ---- */
function throttleKey(ip) {
  return 'data/throttle-' + crypto.createHash('sha1').update(String(ip || 'unknown')).digest('hex').slice(0, 16);
}

async function throttleStatus(ip) {
  const t = await store.getJSON(throttleKey(ip));
  if (t && t.lockedUntil && t.lockedUntil > Date.now()) return { locked: true };
  return { locked: false };
}

async function recordFailure(ip) {
  const k = throttleKey(ip);
  const t = (await store.getJSON(k)) || { count: 0, lockedUntil: 0 };
  if (t.first && Date.now() - t.first > 5 * 60 * 1000) t.count = 0; // old window
  t.first = Date.now();
  t.count = (t.count || 0) + 1;
  if (t.count >= 5) { t.lockedUntil = Date.now() + 5 * 60 * 1000; t.count = 0; }
  await store.setJSON(k, t);
}

async function clearFailures(ip) {
  await store.delJSON(throttleKey(ip));
}

async function changePassword(settings, current, next) {
  if (!current || !next || String(next).length < 6) {
    return { status: 400, error: 'New password must be at least 6 characters.' };
  }
  if (!verifyPassword(settings, current)) return { status: 401, error: 'Current password is incorrect.' };
  const salt = crypto.randomBytes(16).toString('hex');
  settings.adminSalt = salt;
  settings.adminHash = hashPassword(next, salt);
  await store.setJSON('data/settings', settings);
  return { ok: true };
}

module.exports = {
  getSettings, verifyPassword, makeToken, requireAuth,
  throttleStatus, recordFailure, clearFailures, changePassword
};
