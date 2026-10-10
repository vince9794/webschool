const { json, bodyJSON , wrapHandler } = require('../_lib/respond');
const store = require('../_lib/store');

/* POST /api/push-unsubscribe — remove a device */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  const body = bodyJSON(event);
  if (!body.endpoint) return json(400, { error: 'Missing endpoint.' });

  const pushes = (await store.getJSON('data/push')) || [];
  const next = pushes.filter((p) => p.endpoint !== body.endpoint);
  await store.setJSON('data/push', next);
  return json(200, { ok: true });
});
