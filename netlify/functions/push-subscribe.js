const { json, bodyJSON , wrapHandler } = require('../_lib/respond');
const store = require('../_lib/store');

/* POST /api/push-subscribe — browser opts in to notifications */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  const body = bodyJSON(event);
  const subscription = body.subscription;
  if (!subscription || !subscription.endpoint) return json(400, { error: 'Missing subscription.' });

  const pushes = (await store.getJSON('data/push')) || [];
  const found = pushes.find((p) => p.endpoint === subscription.endpoint);
  if (found) {
    found.subscription = subscription;
    found.email = body.email ? String(body.email).toLowerCase() : found.email;
    found.updatedAt = new Date().toISOString();
  } else {
    pushes.push({
      id: crypto.randomUUID(),
      endpoint: subscription.endpoint,
      subscription,
      email: body.email ? String(body.email).toLowerCase() : null,
      createdAt: new Date().toISOString()
    });
  }
  await store.setJSON('data/push', pushes);
  return json(200, { ok: true });
});
