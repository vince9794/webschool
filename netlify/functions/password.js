const { json, bodyJSON , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');

/* POST /api/password — { current, next } → { ok } */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  const a = await auth.requireAuth(event);
  if (a.error) return json(a.status, { error: a.error });

  const body = bodyJSON(event);
  const result = await auth.changePassword(a.settings, body.current, body.next);
  if (result.error) return json(result.status, { error: result.error });
  return json(200, { ok: true });
});
