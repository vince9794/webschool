const { json, query , wrapHandler } = require('../_lib/respond');
const auth = require('../_lib/auth');
const store = require('../_lib/store');
const img = require('../_lib/imgutil');

/* Static site images are baked into the bundle at build time by
   tools/stage.js (the publish folder can't be scanned at runtime). */
let manifest = [];
try { manifest = require('../_generated/images-manifest.json'); } catch (e) { manifest = []; }

async function listImages() {
  const meta = (await store.getJSON('data/uploads-meta')) || {};
  const uploads = Object.keys(meta).map((key) => ({
    path: img.publicUploadPath(key),
    name: meta[key].name || key,
    bytes: meta[key].bytes || 0
  }));
  const images = manifest.concat(uploads);
  images.sort(img.sortImages);
  return images;
}

async function handleDelete(event) {
  const raw = query(event, 'path');
  if (raw.indexOf('images/') === 0) {
    return json(403, { error: 'Only uploaded images can be deleted. Bundled site images are protected.' });
  }
  const key = img.uploadKeyFromPath(raw) || (img.isUploadKey(raw) ? raw : null);
  if (!key) return json(400, { error: 'Invalid path.' });

  const fileName = key.slice('uploads/'.length);
  const meta = (await store.getJSON('data/uploads-meta')) || {};
  if (!meta[fileName]) return json(404, { error: 'File not found.' });

  await store.delBytes(key);
  delete meta[fileName];
  await store.setJSON('data/uploads-meta', meta);
  return json(200, { ok: true });
}

/* /api/media — GET (list) · DELETE ?path=…
   Uploads live in /api/media-upload (own function file). */
exports.handler = wrapHandler(async (event) => {
  const a = await auth.requireAuth(event);
  if (a.error) return json(a.status, { error: a.error });

  if (event.httpMethod === 'GET') return json(200, { images: await listImages() });
  if (event.httpMethod === 'DELETE') return handleDelete(event);
  return json(405, { error: 'Method not allowed.' });
});
