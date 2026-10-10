/* ============================================================
   Image helpers shared by the Express server (local dev) and
   the Netlify Functions (production).
   ============================================================ */

/* Sniff the real image type from magic bytes — the file extension
   and client-supplied MIME type are never trusted. */
function sniff(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: '.jpg', mime: 'image/jpeg' };
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
      buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) return { ext: '.png', mime: 'image/png' };
  const s = (i, n) => buf.slice(i, i + n).toString('latin1');
  if (s(0, 6) === 'GIF87a' || s(0, 6) === 'GIF89a') return { ext: '.gif', mime: 'image/gif' };
  if (s(0, 4) === 'RIFF' && s(8, 4) === 'WEBP') return { ext: '.webp', mime: 'image/webp' };
  if (s(4, 4) === 'ftyp') {
    const head = buf.slice(0, 32).toString('latin1');
    if (head.indexOf('avif') !== -1 || head.indexOf('avis') !== -1) return { ext: '.avif', mime: 'image/avif' };
  }
  return null; // SVG and everything else are rejected
}

/* Safe on-disk/blob file name: <timestamp>-<slug><ext> */
function safeName(original, ext) {
  let base = String(original || 'image');
  base = base.split(/[\\/]/).pop();            // no directory parts
  base = base.replace(/\.[a-z0-9]+$/i, '');    // drop old extension
  base = base.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return Date.now() + '-' + (base || 'image') + ext;
}

/* Public path stored in content fields for uploaded images.
   Root-relative, so it resolves correctly from every site page. */
function publicUploadPath(fileName) {
  return 'api/media/file?path=uploads/' + fileName;
}

function isUploadKey(key) {
  return typeof key === 'string' && /^uploads\/[a-z0-9._-]+$/i.test(key) && key.indexOf('..') === -1;
}

function isUploadPath(p) {
  return typeof p === 'string' && p.indexOf('api/media/file?path=uploads/') === 0;
}

/* Extract a validated uploads/… key from a stored path (or null). */
function uploadKeyFromPath(p) {
  if (!isUploadPath(p)) return null;
  const key = p.slice(p.indexOf('path=') + 5);
  return isUploadKey(key) ? key : null;
}

/* Media list order: uploads first, then alphabetical. */
function sortImages(a, b) {
  return ((isUploadPath(b.path) ? 1 : 0) - (isUploadPath(a.path) ? 1 : 0)) ||
    String(a.path).localeCompare(String(b.path));
}

module.exports = { sniff, safeName, publicUploadPath, isUploadKey, isUploadPath, uploadKeyFromPath, sortImages };
