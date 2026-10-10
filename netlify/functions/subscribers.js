const { json, bodyJSON, query , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');
const store = require('../_lib/store');

function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '')); }

/* /api/subscribers — GET (list) · POST (add manually) · DELETE ?id=… */
exports.handler = wrapHandler(async (event) => {
  const a = await auth.requireAuth(event);
  if (a.error) return json(a.status, { error: a.error });

  if (event.httpMethod === 'GET') {
    const subscribers = (await store.getJSON('data/subscribers')) || [];
    const pushes = (await store.getJSON('data/push')) || [];
    const active = subscribers.filter((s) => !s.unsubscribed);
    return json(200, { subscribers, pushCount: pushes.length, activeCount: active.length });
  }

  if (event.httpMethod === 'POST') {
    const body = bodyJSON(event);
    if (!validEmail(body.email)) return json(400, { error: 'Enter a valid email address.' });
    const subscribers = (await store.getJSON('data/subscribers')) || [];
    const existing = subscribers.find((s) => s.email.toLowerCase() === String(body.email).toLowerCase());
    if (existing) existing.unsubscribed = false;
    else {
      subscribers.push({
        id: crypto.randomUUID(),
        email: String(body.email).toLowerCase(),
        name: String(body.name || '').slice(0, 80),
        source: 'added by admin',
        subscribedAt: new Date().toISOString(),
        unsubscribed: false
      });
    }
    await store.setJSON('data/subscribers', subscribers);
    return json(200, { ok: true });
  }

  if (event.httpMethod === 'DELETE') {
    const id = query(event, 'id');
    const subscribers = (await store.getJSON('data/subscribers')) || [];
    const next = subscribers.filter((s) => s.id !== id);
    if (next.length === subscribers.length) return json(404, { error: 'Not found.' });
    await store.setJSON('data/subscribers', next);
    return json(200, { ok: true });
  }

  return json(405, { error: 'Method not allowed.' });
});
