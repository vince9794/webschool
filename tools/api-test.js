/* ============================================================
   API contract test — runs against either backend:

     node tools/api-test.js http://localhost:3000   (Express dev server)
     node tools/api-test.js http://localhost:3005   (Netlify function harness)

   Ends with a login-throttle test that locks the source IP for
   5 minutes — always run this LAST (after the e2e UI test).
   ============================================================ */

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/+$/, '');

let passed = 0;
let failed = 0;

function ok(cond, label, extra) {
  if (cond) { passed += 1; console.log('  ok    ' + label); }
  else { failed += 1; console.log('  FAIL  ' + label + (extra !== undefined ? '  [' + extra + ']' : '')); }
}

async function call(method, path, opts = {}) {
  const headers = Object.assign({}, opts.headers || {});
  if (opts.token) headers.Authorization = 'Bearer ' + opts.token;
  let body;
  if (opts.raw) body = opts.raw;
  else if (opts.body !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(opts.body); }
  const res = await fetch(BASE + path, { method, headers, body });
  let data = null;
  try { data = await res.json(); } catch (e) { /* non-JSON response */ }
  return { status: res.status, data };
}

/* 1×1 transparent PNG */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

async function main() {
  console.log('API tests → ' + BASE);

  /* ---------- content ---------- */
  let r = await call('GET', '/api/content');
  ok(r.status === 200 && r.data && typeof r.data === 'object' && !Array.isArray(r.data), 'GET /api/content is public');
  const originalContent = r.data || {};

  r = await call('PUT', '/api/content', { body: { x: 1 } });
  ok(r.status === 401, 'PUT /api/content requires auth', r.status);
  r = await call('GET', '/api/stats');
  ok(r.status === 401, 'GET /api/stats requires auth', r.status);

  /* ---------- login ---------- */
  r = await call('POST', '/api/login', { body: { password: 'definitely-wrong' } });
  ok(r.status === 401, 'wrong password rejected', r.status);
  r = await call('POST', '/api/login', { body: { password: 'greenhill' } });
  ok(r.status === 200 && r.data && r.data.token, 'login with default password', JSON.stringify(r.data));
  const token = r.data && r.data.token;
  if (!token) throw new Error('cannot continue without a token');

  /* ---------- media ---------- */
  r = await call('GET', '/api/media', { token });
  const imgs = (r.data && r.data.images) || [];
  ok(r.status === 200 && imgs.length >= 21, 'media list (bundled images)', imgs.length);
  ok(imgs.length > 0 && imgs[0].path.indexOf('images/') === 0, 'bundled image path scheme', imgs[0] && imgs[0].path);
  ok(imgs.every((i) => typeof i.bytes === 'number'), 'media entries carry byte size');

  r = await call('POST', '/api/media/upload', {
    token, raw: PNG,
    headers: { 'Content-Type': 'application/octet-stream', 'X-Filename': encodeURIComponent('E2E Test Image.PNG') }
  });
  ok(r.status === 200 && r.data && r.data.path && r.data.path.indexOf('api/media/file?path=uploads/') === 0,
    'raw body image upload', JSON.stringify(r.data));
  const upPath = r.data && r.data.path;
  const upKey = upPath ? upPath.slice(upPath.indexOf('path=') + 5) : '';

  r = await call('GET', '/api/media', { token });
  const imgs2 = (r.data && r.data.images) || [];
  ok(imgs2.some((i) => i.path === upPath), 'upload appears in media list');
  ok(imgs2.length > 0 && imgs2[0].path === upPath, 'uploads sorted first');

  const fr = await fetch(BASE + '/api/media/file?path=' + upKey);
  const bytes = Buffer.from(await fr.arrayBuffer());
  ok(fr.status === 200, 'uploaded image served', fr.status);
  ok(bytes.equals(PNG), 'served bytes match upload');
  ok(String(fr.headers.get('content-type')) === 'image/png', 'served content-type image/png', fr.headers.get('content-type'));
  ok(String(fr.headers.get('cache-control') || '').includes('max-age=31536000'), 'long cache on uploads', fr.headers.get('cache-control'));

  r = await call('GET', '/api/media/file?path=' + encodeURIComponent('uploads/../secret.txt'));
  ok(r.status === 400, 'path traversal rejected', r.status);
  r = await call('GET', '/api/media/file?path=images/img-01.jpg');
  ok(r.status === 400, 'non-upload key rejected', r.status);

  r = await call('DELETE', '/api/media?path=' + encodeURIComponent('images/img-01.jpg'), { token });
  ok(r.status === 403, 'bundled image delete protected', r.status);

  r = await call('POST', '/api/media/upload', {
    token, raw: Buffer.from('this is definitely not an image'),
    headers: { 'Content-Type': 'application/octet-stream', 'X-Filename': 'evil.svg' }
  });
  ok(r.status === 400, 'non-image payload rejected by sniffing', r.status);

  r = await call('POST', '/api/media/upload', {
    token, raw: Buffer.alloc(Math.ceil(4.5 * 1024 * 1024), 1),
    headers: { 'Content-Type': 'application/octet-stream', 'X-Filename': 'big.png' }
  });
  ok(r.status === 400 && /4 MB/.test((r.data && r.data.error) || ''), 'oversize upload rejected', r.data && r.data.error);

  r = await call('POST', '/api/media/upload', { token });
  ok(r.status === 400, 'empty upload rejected', r.status);

  r = await call('DELETE', '/api/media?path=' + encodeURIComponent('uploads/never-existed.png'), { token });
  ok(r.status === 404, 'missing upload delete → 404', r.status);
  r = await call('DELETE', '/api/media?path=' + encodeURIComponent(upPath), { token });
  ok(r.status === 200, 'upload deleted', r.status);
  r = await call('GET', '/api/media/file?path=' + upKey);
  ok(r.status === 404, 'deleted upload now 404', r.status);

  /* ---------- subscribers ---------- */
  r = await call('POST', '/api/subscribe', { body: { email: 'e2e@example.com', source: 'api-test' } });
  ok(r.status === 200 && r.data && r.data.ok, 'public subscribe', JSON.stringify(r.data));
  r = await call('POST', '/api/subscribe', { body: { email: 'E2E@example.com' } });
  ok(r.status === 200, 're-subscribe accepted');
  r = await call('POST', '/api/subscribe', { body: { email: 'not-an-email' } });
  ok(r.status === 400, 'invalid email rejected', r.status);

  r = await call('GET', '/api/subscribers', { token });
  ok(r.status === 200 && r.data && r.data.activeCount === 1 && r.data.subscribers.length === 1,
    'subscribers list after subscribe', JSON.stringify(r.data && { a: r.data.activeCount, l: r.data.subscribers.length }));
  const subId = r.data.subscribers[0].id;

  r = await call('POST', '/api/subscribers', { token, body: { email: 'manual@example.com', name: 'Manual' } });
  ok(r.status === 200, 'admin adds subscriber', JSON.stringify(r.data));
  r = await call('GET', '/api/subscribers', { token });
  ok(r.data.subscribers.length === 2, 'two subscribers stored', r.data.subscribers.length);

  r = await call('DELETE', '/api/subscribers?id=' + subId, { token });
  ok(r.status === 200, 'subscriber deleted', r.status);
  r = await call('DELETE', '/api/subscribers?id=does-not-exist', { token });
  ok(r.status === 404, 'missing subscriber → 404', r.status);
  r = await call('GET', '/api/subscribers', { token });
  const remainId = r.data.subscribers[0] && r.data.subscribers[0].id;
  r = await call('DELETE', '/api/subscribers?id=' + remainId, { token });
  ok(r.status === 200, 'last subscriber deleted', r.status);
  r = await call('GET', '/api/subscribers', { token });
  ok(r.data.subscribers.length === 0, 'subscribers cleaned up', r.data.subscribers.length);

  /* ---------- push ---------- */
  r = await call('GET', '/api/push-key');
  ok(r.status === 200 && r.data && typeof r.data.publicKey === 'string' && r.data.publicKey.length > 20,
    'public VAPID key served', r.data && r.data.publicKey && r.data.publicKey.length);

  /* ---------- messages ---------- */
  r = await call('GET', '/api/messages');
  ok(r.status === 200 && r.data && Array.isArray(r.data.messages) && r.data.messages.length === 0,
    'no active messages initially', JSON.stringify(r.data));

  r = await call('POST', '/api/messages', { token, body: { title: 'E2E site-only', body: 'hello', link: '', sendTo: 'site-only' } });
  ok(r.status === 200 && r.data && r.data.message && r.data.message.sendTo === 'site-only', 'site-only message created', JSON.stringify(r.data));
  const msgId = r.data.message.id;

  r = await call('GET', '/api/messages');
  ok(r.data.messages.length === 1, 'active message visible publicly', r.data.messages.length);
  r = await call('GET', '/api/messages-all', { token });
  ok(r.data.messages.length === 1, 'full history for admin', r.data.messages.length);

  r = await call('POST', '/api/messages-toggle', { token, body: { id: msgId } });
  ok(r.status === 200 && r.data.message.active === false, 'toggle → hidden', JSON.stringify(r.data));
  r = await call('GET', '/api/messages');
  ok(r.data.messages.length === 0, 'hidden message not public', r.data.messages.length);
  r = await call('POST', '/api/messages-toggle', { token, body: { id: msgId } });
  ok(r.status === 200 && r.data.message.active === true, 'toggle → visible again', JSON.stringify(r.data));

  r = await call('POST', '/api/messages', { token, body: { title: '' } });
  ok(r.status === 400, 'empty title rejected', r.status);
  r = await call('POST', '/api/messages-toggle', { token, body: { id: 'nope' } });
  ok(r.status === 404, 'toggle unknown message → 404', r.status);

  r = await call('POST', '/api/messages', { token, body: { title: 'E2E broadcast', sendTo: 'all' } });
  ok(r.status === 200 && r.data.message.stats && r.data.message.stats.total === 0,
    'broadcast path with 0 devices', JSON.stringify(r.data.message && r.data.message.stats));
  const msgId2 = r.data.message.id;

  await call('DELETE', '/api/messages?id=' + msgId, { token });
  await call('DELETE', '/api/messages?id=' + msgId2, { token });
  r = await call('GET', '/api/messages-all', { token });
  ok(r.data.messages.length === 0, 'messages cleaned up', r.data.messages.length);

  /* ---------- push device register/remove (after message tests) ---------- */
  r = await call('POST', '/api/push-subscribe', {
    body: { subscription: { endpoint: 'https://e2e.invalid/push/abc', keys: { p256dh: 'x', auth: 'y' } }, email: 'e2e@example.com' }
  });
  ok(r.status === 200, 'push device registered', JSON.stringify(r.data));
  r = await call('GET', '/api/subscribers', { token });
  ok(r.data.pushCount === 1, 'pushCount = 1', r.data.pushCount);
  r = await call('POST', '/api/push-unsubscribe', { body: { endpoint: 'https://e2e.invalid/push/abc' } });
  ok(r.status === 200, 'push device removed', JSON.stringify(r.data));
  r = await call('GET', '/api/subscribers', { token });
  ok(r.data.pushCount === 0, 'pushCount = 0', r.data.pushCount);

  /* ---------- stats ---------- */
  r = await call('GET', '/api/stats', { token });
  const s = r.data || {};
  ok(r.status === 200 && s.subscribers === 0 && s.pushDevices === 0 && s.messages === 0 && s.uploads === 0,
    'stats counters back to zero', JSON.stringify(s));
  ok(s.defaultPassword === true, 'defaultPassword flag before change', s.defaultPassword);

  /* ---------- content write + restore ---------- */
  r = await call('PUT', '/api/content', { token, body: { index: { fields: { 'e2e-probe': 'yes' }, lists: {} } } });
  ok(r.status === 200 && r.data && r.data.ok, 'content saved', JSON.stringify(r.data));
  r = await call('GET', '/api/content');
  ok(r.data && r.data.index && r.data.index.fields && r.data.index.fields['e2e-probe'] === 'yes', 'content read back');
  r = await call('PUT', '/api/content', { token, body: originalContent });
  ok(r.status === 200, 'original content restored', r.status);

  /* ---------- password-changed flag ---------- */
  r = await call('POST', '/api/password-changed', { token });
  ok(r.status === 200 && r.data && r.data.ok, 'password-changed flag set', JSON.stringify(r.data));
  r = await call('GET', '/api/stats', { token });
  ok(r.data.defaultPassword === false, 'defaultPassword cleared', r.data.defaultPassword);

  /* ---------- password round trip ---------- */
  r = await call('POST', '/api/password', { token, body: { current: 'greenhill', next: 'e2e-temp-pass-1' } });
  ok(r.status === 200, 'password changed', JSON.stringify(r.data));
  r = await call('POST', '/api/login', { body: { password: 'e2e-temp-pass-1' } });
  ok(r.status === 200 && r.data.token, 'login with new password', r.status);
  const token2 = r.data && r.data.token;
  if (token2) {
    r = await call('GET', '/api/stats', { token });
    ok(r.status === 401, 'old token invalidated by password change', r.status);
    r = await call('POST', '/api/password', { token: token2, body: { current: 'e2e-temp-pass-1', next: 'greenhill' } });
    ok(r.status === 200, 'password restored to greenhill', JSON.stringify(r.data));
  }
  r = await call('POST', '/api/login', { body: { password: 'greenhill' } });
  ok(r.status === 200 && r.data.token, 'login with restored password', r.status);
  const token3 = r.data && r.data.token;

  if (token3) {
    r = await call('POST', '/api/logout', { token: token3 });
    ok(r.status === 200, 'logout', r.status);
  }

  /* ---------- login throttle (LAST — locks this IP for 5 min) ---------- */
  let rejected = 0;
  for (let i = 0; i < 5; i++) {
    r = await call('POST', '/api/login', { body: { password: 'wrong-attempt-' + i } });
    if (r.status === 401) rejected += 1;
  }
  ok(rejected === 5, 'five wrong attempts each rejected', rejected);
  r = await call('POST', '/api/login', { body: { password: 'greenhill' } });
  ok(r.status === 429, 'lockout after 5 failures', r.status);

  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
