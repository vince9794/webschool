const { json , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');
const store = require('../_lib/store');

/* POST /api/password-changed — clears the "default password" flag */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  const a = await auth.requireAuth(event);
  if (a.error) return json(a.status, { error: a.error });

  a.settings.passwordChanged = true;
  await store.setJSON('data/settings', a.settings);
  return json(200, { ok: true });
});
