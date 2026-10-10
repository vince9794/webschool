const { json, rawBody , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');
const store = require('../_lib/store');
const img = require('../_lib/imgutil');

const MAX_UPLOAD = 4 * 1024 * 1024; // Netlify functions cap payloads at 6 MB (base64 ≈ +33%)

/* POST /api/media/upload — raw file bytes in the body,
   original name in the x-filename header. */
exports.handler = wrapHandler(async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  const a = await auth.requireAuth(event);
  if (a.error) return json(a.status, { error: a.error });

  const buf = rawBody(event);
  if (!buf || !buf.length) return json(400, { error: 'No file received.' });
  if (buf.length > MAX_UPLOAD) return json(400, { error: 'Images must be 4 MB or smaller.' });

  const kind = img.sniff(buf);
  if (!kind) return json(400, { error: 'Only JPG, PNG, WEBP, GIF or AVIF images.' });

  let original = 'image';
  try {
    original = decodeURIComponent(String((event.headers || {})['x-filename'] || 'image')) || 'image';
  } catch (e) { /* keep default */ }

  const fileName = img.safeName(original, kind.ext);
  await store.setBytes('uploads/' + fileName, buf, kind.mime);

  const meta = (await store.getJSON('data/uploads-meta')) || {};
  meta[fileName] = { name: original, bytes: buf.length, mime: kind.mime, uploadedAt: new Date().toISOString() };
  await store.setJSON('data/uploads-meta', meta);

  return json(200, { path: img.publicUploadPath(fileName), name: original, bytes: buf.length });
});
