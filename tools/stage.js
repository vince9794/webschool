/* ============================================================
   Stage the deployable site into publish/ for Netlify.

   Copies only the public files (pages, css, js, images, admin,
   service worker) so server code, data stores and tooling are
   never published, and generates the static-image manifest that
   the media function reads at runtime (netlify/_generated/…).

   Run with:  npm run stage
   Netlify runs it automatically as the build command.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUB = path.join(ROOT, 'publish');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

let copied = 0;

function ensure(relDir) {
  const dir = path.join(PUB, relDir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function copyFile(rel) {
  const src = path.join(ROOT, rel);
  const dst = path.join(PUB, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  copied += 1;
}

function copyDir(rel, skipDirNames) {
  const src = path.join(ROOT, rel);
  let entries = [];
  try { entries = fs.readdirSync(src, { withFileTypes: true }); } catch (e) { return; }
  for (const ent of entries) {
    const childRel = rel + '/' + ent.name;
    if (ent.isDirectory()) {
      if ((skipDirNames || []).indexOf(ent.name) !== -1) continue;
      copyDir(childRel, skipDirNames);
    } else {
      copyFile(childRel);
    }
  }
}

/* ---- collect image manifest (site's bundled photos only) ---- */
function walkImages(dir, base, out) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (ent.name === 'uploads') continue; // served from Blobs on Netlify
      walkImages(path.join(dir, ent.name), base ? base + '/' + ent.name : ent.name, out);
    } else if (IMAGE_EXT.has(path.extname(ent.name).toLowerCase())) {
      const rel = 'images/' + (base ? base + '/' : '') + ent.name;
      let bytes = 0;
      try { bytes = fs.statSync(path.join(dir, ent.name)).size; } catch (e) {}
      out.push({ path: rel, name: ent.name, bytes });
    }
  }
  return out;
}

function main() {
  fs.rmSync(PUB, { recursive: true, force: true });
  ensure('');
  copied = 0;

  // 8 public pages
  fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).forEach((f) => copyFile(f));

  // assets + admin platform + service worker
  copyDir('css');
  copyDir('js');
  copyDir('images', ['uploads']); // local uploads live on disk only (re-upload after deploying)
  copyDir('admin');
  copyFile('sw.js');

  // manifest for the media function (bundled into the function at build time)
  const manifest = walkImages(path.join(ROOT, 'images'), '', []);
  const genDir = path.join(ROOT, 'netlify', '_generated');
  fs.mkdirSync(genDir, { recursive: true });
  fs.writeFileSync(path.join(genDir, 'images-manifest.json'), JSON.stringify(manifest, null, 2));

  console.log('Staged ' + copied + ' files → publish/  ·  ' + manifest.length + ' site images in manifest');
  console.log('Deploy with Netlify CLI:  npm run deploy');
}

main();
