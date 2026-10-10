const { json , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');
const store = require('../_lib/store');

/* GET /api/stats — dashboard counters */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed.' });
  const a = await auth.requireAuth(event);
  if (a.error) return json(a.status, { error: a.error });

  const content = (await store.getJSON('data/content')) || {};
  const subscribers = (await store.getJSON('data/subscribers')) || [];
  const pushes = (await store.getJSON('data/push')) || [];
  const messages = (await store.getJSON('data/messages')) || [];
  const meta = (await store.getJSON('data/uploads-meta')) || {};

  const contentPages = Object.keys(content).filter((k) => k !== 'global');
  let fieldCount = 0;
  Object.values(content).forEach((u) => {
    fieldCount += Object.keys((u && u.fields) || {}).length;
    fieldCount += Object.keys((u && u.lists) || {}).length;
  });

  return json(200, {
    subscribers: subscribers.filter((s) => !s.unsubscribed).length,
    pushDevices: pushes.length,
    messages: messages.length,
    editedPages: contentPages.length,
    editedItems: fieldCount,
    uploads: Object.keys(meta).length,
    lastMessage: messages[0] || null,
    defaultPassword: !a.settings.passwordChanged
  });
});
