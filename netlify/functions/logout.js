const { json , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');

/* POST /api/logout — tokens are stateless; the client discards
   its token. Kept so both backends share one API contract. */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  const a = await auth.requireAuth(event);
  if (a.error) return json(a.status, { error: a.error });
  return json(200, { ok: true });
});
