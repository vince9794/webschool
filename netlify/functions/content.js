const { json, bodyJSON , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');
const store = require('../_lib/store');

/* GET  /api/content — public read of saved edits
   PUT  /api/content — admin write (whole object) */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod === 'GET') {
    const content = (await store.getJSON('data/content')) || {};
    return json(200, content);
  }
  if (event.httpMethod === 'PUT') {
    const a = await auth.requireAuth(event);
    if (a.error) return json(a.status, { error: a.error });

    const body = bodyJSON(event);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return json(400, { error: 'Invalid content payload.' });
    }
    await store.setJSON('data/content', body);
    return json(200, { ok: true, savedAt: new Date().toISOString() });
  }
  return json(405, { error: 'Method not allowed.' });
});
