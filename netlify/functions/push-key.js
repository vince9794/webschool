const { json , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');

/* GET /api/push-key — public VAPID key for the subscribe widget */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed.' });
  const settings = await auth.getSettings();
  return json(200, { publicKey: settings.vapid.publicKey });
});
