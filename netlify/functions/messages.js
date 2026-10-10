const { json, bodyJSON, query , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');
const store = require('../_lib/store');
const push = require('../_lib/push');

/* /api/messages — GET (active, for on-site banners)
                  · POST (create + best-effort push delivery)
                  · DELETE ?id=… */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod === 'GET') {
    const messages = (await store.getJSON('data/messages')) || [];
    const active = messages.filter((m) => m.active !== false).slice(0, 5);
    return json(200, { messages: active });
  }

  const a = await auth.requireAuth(event);
  if (a.error) return json(a.status, { error: a.error });

  if (event.httpMethod === 'POST') {
    const body = bodyJSON(event);
    if (!body.title || !String(body.title).trim()) return json(400, { error: 'Message title is required.' });

    const pushes = (await store.getJSON('data/push')) || [];
    const message = {
      id: crypto.randomUUID(),
      title: String(body.title).trim().slice(0, 120),
      body: String(body.body || '').trim().slice(0, 600),
      link: String(body.link || '').slice(0, 300),
      sendTo: (body.sendTo === 'push' || body.sendTo === 'all' || body.sendTo === 'site-only') ? body.sendTo : 'all',
      createdAt: new Date().toISOString(),
      active: true,
      stats: { delivered: 0, failed: 0, total: pushes.length }
    };

    if (message.sendTo !== 'site-only') {
      const payload = JSON.stringify({
        title: message.title,
        body: message.body,
        link: message.link || '/',
        id: message.id
      });
      try {
        const r = await push.broadcast(a.settings, pushes, payload);
        message.stats = r.stats;
        if (r.dead.length) {
          const remaining = pushes.filter((p) => r.dead.indexOf(p.id) === -1);
          await store.setJSON('data/push', remaining);
          message.stats.total = remaining.length;
        }
      } catch (e) { /* delivery is best effort */ }
    }

    const messages = (await store.getJSON('data/messages')) || [];
    messages.unshift(message);
    await store.setJSON('data/messages', messages.slice(0, 100)); // keep a manageable history
    return json(200, { ok: true, message });
  }

  if (event.httpMethod === 'DELETE') {
    const id = query(event, 'id');
    const messages = (await store.getJSON('data/messages')) || [];
    await store.setJSON('data/messages', messages.filter((m) => m.id !== id));
    return json(200, { ok: true });
  }

  return json(405, { error: 'Method not allowed.' });
});
