/* ============================================================
   End-to-end test of the admin SPA (admin/admin.js) in jsdom
   against a running backend:

     node tools/e2e-admin.js http://localhost:3000   (Express)
     node tools/e2e-admin.js http://localhost:3005   (function harness)

   Requires dev deps:  npm i -D esbuild  and  npm i --no-save jsdom
   Run BEFORE tools/api-test.js (that suite ends by locking logins).
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const esbuild = require('esbuild');

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/+$/, '');
const ROOT = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function ok(cond, label, extra) {
  if (cond) { passed += 1; console.log('  ok    ' + label); }
  else { failed += 1; console.log('  FAIL  ' + label + (extra !== undefined ? '  [' + extra + ']' : '')); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(fn, label, ms = 10000) {
  const t0 = Date.now();
  let lastErr = null;
  while (Date.now() - t0 < ms) {
    try {
      const v = await fn();
      if (v) return v;
    } catch (e) { lastErr = e; }
    await sleep(50);
  }
  throw new Error('timeout waiting for: ' + label + (lastErr ? ' — ' + lastErr.message : ''));
}

/* 1×1 transparent PNG */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

async function main() {
  console.log('E2E (jsdom) → ' + BASE);

  /* ---- bundle the real admin SPA (ESM → single classic script) ---- */
  const bundle = esbuild.buildSync({
    entryPoints: [path.join(ROOT, 'admin', 'admin.js')],
    bundle: true,
    format: 'iife',
    target: 'es2020',
    write: false,
    logLevel: 'silent'
  }).outputFiles[0].text;

  const html = fs.readFileSync(path.join(ROOT, 'admin', 'index.html'), 'utf8')
    .replace('<script type="module" src="admin.js"></script>', '');

  const dom = new JSDOM(html, {
    url: BASE + '/admin/',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  const w = dom.window;

  /* ---- environment shims ---- */
  w.fetch = async (u, opts = {}) => {
    const url = new URL(String(u), BASE + '/');
    const headers = Object.assign({}, opts.headers || {});
    let body = opts.body;
    if (body && typeof body === 'object' && typeof body.arrayBuffer === 'function') {
      body = new Uint8Array(await body.arrayBuffer()); // jsdom File/Blob → bytes
    }
    return fetch(url, { method: opts.method || 'GET', headers, body, redirect: 'follow' });
  };
  w.confirm = () => true;
  w.alert = () => {};
  w.scrollTo = () => {};
  try {
    Object.defineProperty(w.navigator, 'clipboard', {
      value: { writeText: async () => '' }, configurable: true
    });
  } catch (e) { /* clipboard unavailable — fine */ }

  /* ---- run the app ---- */
  w.eval(bundle);

  const $ = (sel) => w.document.querySelector(sel);
  const $$ = (sel) => Array.from(w.document.querySelectorAll(sel));

  try {
    /* ---------- login ---------- */
    ok($('#loginView').hidden === false && $('#app').hidden === true, 'login view shown on boot');

    $('#passwordInput').value = 'wrong-password-e2e';
    $('#loginForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => $('#loginError').textContent.trim(), 'login error message');
    ok(true, 'wrong password shows an error');

    $('#passwordInput').value = 'greenhill';
    $('#loginForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    await waitFor(() => $('#app').hidden === false, 'app visible after sign-in');
    ok(true, 'sign-in with default password');

    const token = w.localStorage.getItem('gh_admin_token');
    ok(!!token, 'auth token stored locally');

    /* ---------- dashboard ---------- */
    await waitFor(() => $('#view-dashboard').querySelector('.stat-tile'), 'dashboard stat tiles');
    ok($('#view-dashboard').textContent.includes('subscribers'), 'dashboard stats render');

    /* ---------- content editor ---------- */
    $('#sideNav').querySelector('button[data-view="content"]').click();
    await waitFor(() => $('#pageTabs').children.length >= 8, 'page tabs');
    ok($('#pageTabs').children.length >= 8, 'page tabs render', $('#pageTabs').children.length);
    await waitFor(() => $('#validationChip') && $('#validationChip').textContent.trim(), 'validation chip');
    ok($('#validationChip').textContent.includes('All selectors OK'),
      'all schema selectors OK', $('#validationChip').textContent);

    await waitFor(() => $('#contentEditor').querySelector('input[type="text"][data-field-id]'), 'first text field');
    const inp = $('#contentEditor').querySelector('input[type="text"][data-field-id]');
    const fieldId = inp.dataset.fieldId;
    const pageKey = $('#pageTabs .active').dataset.page;
    const originalContent = await (await fetch(BASE + '/api/content')).json();
    const newValue = (inp.value || '') + ' E2E';
    inp.value = newValue;
    inp.dispatchEvent(new w.Event('input', { bubbles: true }));
    $('#savePageBtn').click();
    await waitFor(async () => {
      const c = await (await fetch(BASE + '/api/content')).json();
      return c[pageKey] && c[pageKey].fields && c[pageKey].fields[fieldId] === newValue;
    }, 'content edit persisted by backend');
    ok(true, 'edit → save persisted (' + pageKey + ' / ' + fieldId + ')');

    const restore = await fetch(BASE + '/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(originalContent)
    });
    ok(restore.ok, 'original content restored after test', restore.status);

    /* ---------- media library ---------- */
    $('#sideNav').querySelector('button[data-view="media"]').click();
    await waitFor(() => $('#mediaGrid').querySelector('.media-tile'), 'media tiles');
    const before = $('#mediaGrid').querySelectorAll('.media-tile').length;
    ok(before >= 21, 'media library lists bundled images', before);

    const file = new w.File([PNG], 'E2E Upload.png', { type: 'image/png' });
    const uploadInput = $('#mediaUpload');
    Object.defineProperty(uploadInput, 'files', { value: [file], configurable: true });
    uploadInput.dispatchEvent(new w.Event('change', { bubbles: true }));
    await waitFor(() => $('#mediaGrid').querySelectorAll('.media-tile').length === before + 1, 'uploaded tile appears');
    ok(true, 'raw upload through the SPA');

    const upTile = $('#mediaGrid').querySelector('.media-tile');
    ok(upTile.dataset.path.indexOf('api/media/file?path=uploads/') === 0,
      'upload uses serving-path scheme', upTile.dataset.path);
    const tileSrc = upTile.querySelector('img').getAttribute('src') || '';
    ok(tileSrc.indexOf('/api/media/file?path=uploads/') === 0, 'tile preview src', tileSrc);

    upTile.querySelector('[data-del]').click();
    await waitFor(() => $('#mediaGrid').querySelectorAll('.media-tile').length === before, 'uploaded tile deleted');
    ok(true, 'upload deleted from SPA');

    /* bundled photo must be protected */
    const bundledTile = $('#mediaGrid').querySelector('.media-tile[data-path^="images/"]');
    const countBeforeBad = $('#mediaGrid').querySelectorAll('.media-tile').length;
    bundledTile.querySelector('[data-del]').click();
    await waitFor(() => $('#alertHost').textContent.includes('deleted') || $('#alertHost').textContent.includes('protected')
      || $('#alertHost').textContent.includes('Failed') || $('#alertHost').textContent.length > 0, 'protection alert', 5000);
    await sleep(300);
    ok($('#mediaGrid').querySelectorAll('.media-tile').length === countBeforeBad, 'bundled image refused for deletion');

    /* ---------- subscribers ---------- */
    $('#sideNav').querySelector('button[data-view="subscribers"]').click();
    await waitFor(() => $('#newSubEmail'), 'subscribers view');
    $('#newSubEmail').value = 'e2e-parent@example.com';
    $('#addSubBtn').click();
    await waitFor(() => $('#view-subscribers').textContent.includes('e2e-parent@example.com'), 'subscriber row added');
    ok(true, 'add subscriber from SPA');
    $('#view-subscribers').querySelector('[data-remove]').click();
    await waitFor(() => !$('#view-subscribers').textContent.includes('e2e-parent@example.com'), 'subscriber row removed');
    ok(true, 'remove subscriber from SPA');

    /* ---------- messages ---------- */
    $('#sideNav').querySelector('button[data-view="messages"]').click();
    await waitFor(() => $('#msgTitle'), 'messages view');
    $('#msgTitle').value = 'E2E announcement';
    $('#msgBody').value = 'A test announcement.';
    const radios = $$('#view-messages input[name="sendTo"]');
    radios.forEach((r) => { r.checked = r.value === 'site-only'; });
    $('#sendMsgBtn').click();
    await waitFor(() => $('#msgHistory').textContent.includes('E2E announcement'), 'message appears in history');
    ok(true, 'compose + send from SPA (site-only)');

    $('#msgHistory').querySelector('[data-toggle]').click();
    await waitFor(() => $('#msgHistory').textContent.includes('Hidden'), 'message toggled hidden');
    ok(true, 'toggle message visibility');

    $('#msgHistory').querySelector('[data-delete]').click();
    await waitFor(() => $('#msgHistory').textContent.includes('No messages sent yet'), 'message deleted');
    ok(true, 'delete message from SPA');

    /* ---------- settings ---------- */
    $('#sideNav').querySelector('button[data-view="settings"]').click();
    await waitFor(() => $('#pwForm'), 'settings view');
    ok($('#view-settings').textContent.includes('Netlify Blobs'), 'settings documents Netlify storage');

    /* ---------- logout ---------- */
    $('#logoutBtn').click();
    await waitFor(() => $('#loginView').hidden === false, 'back at login view');
    ok(true, 'logout returns to login');
  } catch (e) {
    failed += 1;
    console.log('  FAIL  unhandled step — ' + e.message);
    console.log(e.stack || '');
  }

  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  try { w.close(); } catch (e) { /* ignore */ }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
