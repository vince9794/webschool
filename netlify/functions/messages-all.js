const { json , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');
const store = require('../_lib/store');

/* GET /api/messages-all — full history for the admin */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed.' });
  const a = await auth.requireAuth(event);
  if (a.error) return json(a.status, { error: a.error });

  const messages = (await store.getJSON('data/messages')) || [];
  return json(200, { messages });
});
