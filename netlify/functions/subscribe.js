const { json, bodyJSON , wrapHandler } = require('../_lib/respond');
const store = require('../_lib/store');

function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '')); }

/* POST /api/subscribe — public newsletter signup (or re-subscribe) */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  const body = bodyJSON(event);
  if (!validEmail(body.email)) return json(400, { error: 'Please enter a valid email address.' });

  const subscribers = (await store.getJSON('data/subscribers')) || [];
  const existing = subscribers.find((s) => s.email.toLowerCase() === String(body.email).toLowerCase());
  if (existing) {
    existing.unsubscribed = false;
    existing.updatedAt = new Date().toISOString();
  } else {
    subscribers.push({
      id: crypto.randomUUID(),
      email: String(body.email).toLowerCase(),
      name: String(body.name || '').slice(0, 80),
      source: String(body.source || 'website').slice(0, 40),
      subscribedAt: new Date().toISOString(),
      unsubscribed: false
    });
  }
  await store.setJSON('data/subscribers', subscribers);
  return json(200, { ok: true, message: 'You are subscribed. Thank you!' });
});
