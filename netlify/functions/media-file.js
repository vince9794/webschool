const { json, imageResponse, query , wrapHandler } = require('../_lib/respond');
const store = require('../_lib/store');
const img = require('../_lib/imgutil');

/* GET /api/media/file?path=uploads/<name> — public image serving
   from Blobs (uploads don't exist as files on Netlify). */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed.' });

  const key = query(event, 'path');
  if (!img.isUploadKey(key)) return json(400, { error: 'Invalid path.' });

  const buf = await store.getBytes(key);
  if (!buf) return json(404, { error: 'Not found.' });

  const fileName = key.slice('uploads/'.length);
  const meta = (await store.getJSON('data/uploads-meta')) || {};
  const mime = (meta[fileName] && meta[fileName].mime) || 'application/octet-stream';
  return imageResponse(200, buf, mime);
});
