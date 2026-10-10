const { json, bodyJSON , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');
const store = require('../_lib/store');

/* POST /api/messages-toggle — { id } show/hide a message banner */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  const a = await auth.requireAuth(event);
  if (a.error) return json(a.status, { error: a.error });

  const body = bodyJSON(event);
  const messages = (await store.getJSON('data/messages')) || [];
  const m = messages.find((x) => x.id === body.id);
  if (!m) return json(404, { error: 'Not found.' });
  m.active = m.active === false;
  await store.setJSON('data/messages', messages);
  return json(200, { ok: true, message: m });
});
