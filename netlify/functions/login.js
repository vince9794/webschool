const { json, bodyJSON, getIP , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');

/* POST /api/login — { password } → { token } */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  const ip = getIP(event);
  const settings = await auth.getSettings();

  const blocked = await auth.throttleStatus(ip);
  if (blocked.locked) return json(429, { error: 'Too many attempts. Try again in 5 minutes.' });

  const body = bodyJSON(event);
  if (!auth.verifyPassword(settings, body.password || '')) {
    await auth.recordFailure(ip);
    return json(401, { error: 'Incorrect password.' });
  }
  await auth.clearFailures(ip);
  return json(200, { token: auth.makeToken(settings) });
});
