/* ============================================================
   Storage abstraction for the Netlify backend.

   Production : Netlify Blobs (site-wide store "greenhill",
                strong consistency so admin edits show instantly).
   Testing    : GREENHILL_STORE=mem keeps everything in memory
                (tools/function-server.js harness).

   Local development keeps using the Express server
   (npm start) with JSON files in server/data/.

   Notes:
   - Missing keys return null (the Blobs API returns null for
     absent keys — it does not throw), so nothing here swallows
     errors: configuration/network problems propagate and are
     turned into readable JSON 500s by wrapHandler.
   - Strong consistency needs an "uncachedEdgeURL" the runtime
     may not always provide. If it's missing (BlobsConsistencyError)
     we fall back to a default (eventual) store so the site keeps
     working — writes propagate globally within 60 seconds.
   ============================================================ */

const mode = process.env.GREENHILL_STORE || 'blobs';

const memJSON = new Map();
const memBin = new Map();
let blobs = null;

function store() {
  if (!blobs) {
    const { getStore } = require('@netlify/blobs');
    blobs = getStore({ name: 'greenhill', consistency: 'strong' });
  }
  return blobs;
}

/* Run a Blobs operation, falling back to eventual consistency
   if strong mode isn't available in this environment. */
async function op(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e && e.name === 'BlobsConsistencyError') {
      const { getStore } = require('@netlify/blobs');
      blobs = getStore({ name: 'greenhill' }); // default: eventual
      return fn();
    }
    throw e;
  }
}

/* ---- JSON values ---- */
async function getJSON(key) {
  if (mode === 'mem') {
    const v = memJSON.get(key);
    return v === undefined ? null : v;
  }
  const v = await op(() => store().get(key, { type: 'json' }));
  return v === undefined || v === null ? null : v;
}

async function setJSON(key, value) {
  if (mode === 'mem') { memJSON.set(key, value); return; }
  await op(() => store().setJSON(key, value));
}

async function delJSON(key) {
  if (mode === 'mem') { memJSON.delete(key); return; }
  await op(() => store().delete(key));
}

/* ---- binary values (uploaded images) ---- */
async function getBytes(key) {
  if (mode === 'mem') {
    const v = memBin.get(key);
    return v ? Buffer.from(v) : null;
  }
  const ab = await op(() => store().get(key, { type: 'arrayBuffer' }));
  return ab ? Buffer.from(ab) : null;
}

async function setBytes(key, buf, contentType) {
  if (mode === 'mem') { memBin.set(key, Buffer.from(buf)); return; }
  await op(() => store().set(key, new Blob([buf], { type: contentType || 'application/octet-stream' })));
}

async function delBytes(key) {
  if (mode === 'mem') { memBin.delete(key); return; }
  await op(() => store().delete(key));
}

module.exports = { mode, getJSON, setJSON, delJSON, getBytes, setBytes, delBytes };
