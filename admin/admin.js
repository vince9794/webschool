/* ============================================================
   THE GREENHILL SCHOOL — Admin Platform (admin/admin.js)
   Single-page app:
     Dashboard · Content · Media · Subscribers · Messages · Settings
   Content editing is schema-driven (js/schema/*): the static
   HTML files hold the defaults, saved edits live on the server
   and are applied to the public site by js/cms.js.
   ============================================================ */

import {
  getSchema, pageKeys,
  esc, readField, readList
} from '../js/schema/index.js';

/* ------------------------------------------------------------
   State
   ------------------------------------------------------------ */
const state = {
  token: localStorage.getItem('gh_admin_token') || '',
  content: {},
  contentLoaded: false,
  docCache: {},
  view: 'dashboard',
  editing: null,          // { page, schema, doc, bases, committed, values, touched }
  media: [],
  mediaTarget: null       // callback used by the media picker modal
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function clone(v) { return JSON.parse(JSON.stringify(v)); }

function fmtBytes(n) {
  if (!n && n !== 0) return '';
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(1) + ' MB';
}

function alertMsg(text, type = 'ok') {
  const host = $('#alertHost');
  const el = document.createElement('div');
  el.className = 'alert' + (type === 'error' ? ' error' : type === 'warn' ? ' warn' : '');
  el.textContent = text;
  host.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 320);
  }, 4800);
}

/* ------------------------------------------------------------
   API helper (adds auth token, parses errors)
   ------------------------------------------------------------ */
async function api(path, opts = {}) {
  const headers = Object.assign({}, opts.headers || {});
  const isForm = opts.body instanceof FormData;
  if (!isForm && opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (state.token) headers.Authorization = 'Bearer ' + state.token;

  const res = await fetch('/api' + path, Object.assign({}, opts, {
    headers,
    body: isForm ? opts.body : (opts.body !== undefined ? JSON.stringify(opts.body) : undefined)
  }));

  if (res.status === 401) {
    showLogin();
    throw new Error('Session expired — please sign in again.');
  }
  let data = null;
  try { data = await res.json(); } catch (e) { /* non-JSON response */ }
  if (!res.ok) throw new Error((data && data.error) || ('Request failed (' + res.status + ')'));
  return data;
}

/* Raw upload — the file bytes are the request body (identical
   contract on the Express dev server and Netlify Functions). */
async function uploadFile(file) {
  const headers = {
    'Content-Type': 'application/octet-stream',
    'X-Filename': encodeURIComponent(file.name || 'image')
  };
  if (state.token) headers.Authorization = 'Bearer ' + state.token;
  const res = await fetch('/api/media/upload', { method: 'POST', headers, body: file });
  if (res.status === 401) {
    showLogin();
    throw new Error('Session expired — please sign in again.');
  }
  let data = null;
  try { data = await res.json(); } catch (e) { /* non-JSON response */ }
  if (!res.ok) throw new Error((data && data.error) || ('Request failed (' + res.status + ')'));
  return data;
}

/* ------------------------------------------------------------
   Auth
   ------------------------------------------------------------ */
async function showApp() {
  $('#loginView').hidden = true;
  $('#app').hidden = false;
  if (!state.contentLoaded) {
    state.content = await api('/content');
    state.contentLoaded = true;
  }
  showView('dashboard');
}

function showLogin() {
  $('#app').hidden = true;
  $('#loginView').hidden = false;
}

async function logout() {
  try { await api('/logout', { method: 'POST' }); } catch (e) { /* already invalid */ }
  state.token = '';
  localStorage.removeItem('gh_admin_token');
  showLogin();
}

async function onLoginSubmit(e) {
  e.preventDefault();
  const input = $('#passwordInput');
  const err = $('#loginError');
  err.textContent = '';
  try {
    const data = await api('/login', { method: 'POST', body: { password: input.value } });
    state.token = data.token;
    localStorage.setItem('gh_admin_token', state.token);
    input.value = '';
    await showApp();
  } catch (ex) {
    err.textContent = ex.message;
  }
}

/* ------------------------------------------------------------
   View routing
   ------------------------------------------------------------ */
const VIEW_TITLES = {
  dashboard: 'Dashboard',
  content: 'Content',
  media: 'Media',
  subscribers: 'Subscribers',
  messages: 'Messages',
  settings: 'Settings'
};

async function showView(name) {
  state.view = name;
  $$('.view').forEach((v) => { v.hidden = v.id !== 'view-' + name; });
  $$('#sideNav button').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  $('#viewTitle').textContent = VIEW_TITLES[name] || name;
  try {
    if (name === 'dashboard') await renderDashboard();
    if (name === 'content') await renderContent();
    if (name === 'media') await renderMedia();
    if (name === 'subscribers') await renderSubscribers();
    if (name === 'messages') await renderMessages();
    if (name === 'settings') renderSettings();
  } catch (ex) {
    alertMsg(ex.message, 'error');
  }
  updateDirtyUI();
}

/* ------------------------------------------------------------
   Dashboard
   ------------------------------------------------------------ */
async function renderDashboard() {
  const s = await api('/stats');
  const host = $('#view-dashboard');

  const lastMsg = s.lastMessage
    ? `<div class="message-item" style="margin:0">
         <div class="msg-top"><div>
           <h4>${esc(s.lastMessage.title)}</h4>
           <div class="msg-meta">
             <span><i class="fas fa-clock"></i> ${new Date(s.lastMessage.createdAt).toLocaleString()}</span>
             <span><i class="fas fa-check-double"></i> ${s.lastMessage.stats.delivered}/${s.lastMessage.stats.total} delivered</span>
             <span class="badge ${s.lastMessage.active !== false ? 'green' : 'red'}">${s.lastMessage.active !== false ? 'Visible on site' : 'Hidden'}</span>
           </div>
         </div></div>
         ${s.lastMessage.body ? `<p class="msg-body">${esc(s.lastMessage.body)}</p>` : ''}
       </div>`
    : '<p class="sub">No messages sent yet. Compose one in <strong>Messages</strong>.</p>';

  host.innerHTML = `
    ${s.defaultPassword ? `<div class="alert warn" style="border-left-color:var(--gold)">
      You are still using the default password (<strong>greenhill</strong>).
      <a href="#" data-goto="settings"><strong>Change it now →</strong></a>
    </div>` : ''}

    <div class="stat-grid">
      <div class="stat-tile"><i class="fas fa-users"></i><div class="num">${s.subscribers}</div><div class="lbl">Subscribers</div></div>
      <div class="stat-tile"><i class="fas fa-bell"></i><div class="num">${s.pushDevices}</div><div class="lbl">Browser devices</div></div>
      <div class="stat-tile"><i class="fas fa-bullhorn"></i><div class="num">${s.messages}</div><div class="lbl">Messages sent</div></div>
      <div class="stat-tile"><i class="fas fa-pen-to-square"></i><div class="num">${s.editedPages}</div><div class="lbl">Pages edited</div></div>
      <div class="stat-tile"><i class="fas fa-layer-group"></i><div class="num">${s.editedItems}</div><div class="lbl">Saved changes</div></div>
      <div class="stat-tile"><i class="fas fa-images"></i><div class="num">${s.uploads}</div><div class="lbl">Uploads</div></div>
    </div>

    <div class="dash-grid">
      <div class="card">
        <h3><i class="fas fa-bullhorn"></i> Latest message</h3>
        ${lastMsg}
        <p style="margin-top:14px"><button class="btn btn-crimson btn-sm" data-goto="messages"><i class="fas fa-paper-plane"></i> Send a new message</button></p>
      </div>

      <div class="card">
        <h3><i class="fas fa-bolt"></i> Quick actions</h3>
        <div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:12px">
          <button class="btn btn-navy btn-sm" data-goto="content"><i class="fas fa-pen-to-square"></i> Edit website content</button>
          <button class="btn btn-ghost btn-sm" data-goto="media"><i class="fas fa-upload"></i> Upload images</button>
          <button class="btn btn-ghost btn-sm" data-goto="subscribers"><i class="fas fa-users"></i> View subscribers</button>
          <button class="btn btn-ghost btn-sm" data-goto="settings"><i class="fas fa-gear"></i> Change password</button>
        </div>
      </div>

      <div class="card">
        <h3><i class="fas fa-circle-info"></i> How this works</h3>
        <p class="sub" style="line-height:1.65">
          1. <strong>Content</strong> — pick a page, edit texts / images / cards, then <strong>Save changes</strong>.
          The live site updates immediately.<br>
          2. <strong>Media</strong> — upload photos and use them in image fields.<br>
          3. <strong>Subscribers</strong> — everyone who opted in to school news.<br>
          4. <strong>Messages</strong> — send browser notifications + on-site announcements.
        </p>
      </div>
    </div>`;

  host.onclick = (e) => {
    const b = e.target.closest('[data-goto]');
    if (b) { e.preventDefault(); showView(b.dataset.goto); }
  };
}

/* ============================================================
   CONTENT EDITOR
   ============================================================ */
async function renderContent() {
  if (!state.contentLoaded) {
    state.content = await api('/content');
    state.contentLoaded = true;
  }
  if (!state.editing) await openPage('index.html');
  else { renderPageTabs(); renderEditor(); updateToolbar(); }
}

function renderPageTabs() {
  $('#pageTabs').innerHTML = pageKeys().map((key) => {
    const schema = getSchema(key);
    if (!schema) return '';
    const active = state.editing && state.editing.page === key;
    const edited = !!state.content[key];
    return `<button class="page-tab${active ? ' active' : ''}" data-page="${esc(key)}">
      ${esc(schema.title)}${edited ? '<span class="edited-dot" title="Edited"></span>' : ''}
    </button>`;
  }).join('');
}

async function openPage(key) {
  if (state.editing && state.editing.page === key) return;
  if (isDirty() && !window.confirm('You have unsaved changes on this page. Discard them?')) return;
  const schema = getSchema(key);
  if (!schema) return;

  const defaultPage = schema.defaultPage || key;
  $('#contentEditor').innerHTML = '<div class="card"><p class="sub"><i class="fas fa-spinner fa-spin"></i> Loading page…</p></div>';

  let doc = state.docCache[defaultPage];
  if (!doc) {
    const res = await fetch('/' + defaultPage, { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load /' + defaultPage);
    doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    state.docCache[defaultPage] = doc;
  }

  const posMap = new Map();
  Array.prototype.forEach.call(doc.body.querySelectorAll('*'), (el, i) => posMap.set(el, i));

  const saved = state.content[key] || {};
  const bases = { fields: {}, lists: {} };
  const values = { fields: {}, lists: {} };

  schema.fields.forEach((f) => {
    const v = readField(doc, f);
    bases.fields[f.id] = v;
    values.fields[f.id] = (saved.fields && f.id in saved.fields)
      ? saved.fields[f.id]
      : (v == null ? '' : v);
  });
  schema.lists.forEach((l) => {
    const v = readList(doc, l) || [];
    bases.lists[l.id] = v;
    values.lists[l.id] = (saved.lists && l.id in saved.lists && Array.isArray(saved.lists[l.id]))
      ? saved.lists[l.id]
      : v;
  });

  state.editing = {
    page: key,
    schema,
    doc,
    posMap,
    bases,
    values,
    committed: clone(values),
    touched: { fields: new Set(), lists: new Set() }
  };

  renderPageTabs();
  renderEditor();
  updateToolbar();
}

/** Group schema controls into sections, ordered by position in the page. */
function sectionsFor(ed) {
  const out = [];
  const byName = new Map();
  const ensure = (name) => {
    if (!byName.has(name)) {
      const s = { name, fields: [], lists: [], pos: Infinity };
      byName.set(name, s);
      out.push(s);
    }
    return byName.get(name);
  };
  const posOf = (selector) => {
    try {
      const el = ed.doc.querySelector(selector);
      return el && ed.posMap.has(el) ? ed.posMap.get(el) : Infinity;
    } catch (e) { return Infinity; }
  };
  ed.schema.fields.forEach((f) => {
    const s = ensure(f.section);
    s.fields.push(f);
    s.pos = Math.min(s.pos, posOf(f.selector));
  });
  ed.schema.lists.forEach((l) => {
    const s = ensure(l.section);
    s.lists.push(l);
    s.pos = Math.min(s.pos, posOf(l.container));
  });
  out.sort((a, b) => a.pos - b.pos);
  return out;
}

function renderEditor() {
  const ed = state.editing;
  const host = $('#contentEditor');
  if (!ed) { host.innerHTML = ''; return; }

  host.innerHTML = sectionsFor(ed).map((sec) => {
    const controls = sec.fields.map(fieldControl).join('') + sec.lists.map(listBlock).join('');
    const n = sec.fields.length + sec.lists.length;
    return `<div class="section-card">
      <div class="section-head">
        <h3>${esc(sec.name)}</h3>
        <span class="section-count">${n} ${n === 1 ? 'control' : 'controls'}</span>
      </div>
      <div class="section-body">${controls}</div>
    </div>`;
  }).join('');

  runValidation();
}

/* ---------- controls ---------- */

function control(type, value, o) {
  const v = value == null ? '' : String(value);
  const d = o.dirty ? 'dirty' : '';
  if (type === 'image' || type === 'bg') {
    const has = v.trim() !== '';
    return `<div class="image-field">
      <div class="image-preview empty"${has ? ' hidden' : ''}>none</div>
      <img class="image-preview" src="${esc(v)}" alt=""${has ? '' : ' hidden'}>
      <input type="text" class="${d}" ${o.data} value="${esc(v)}" placeholder="images/…">
      <button type="button" class="btn btn-ghost btn-sm" data-pick title="Choose from media library"><i class="fas fa-folder-open"></i></button>
    </div>`;
  }
  if (type === 'html') return `<textarea class="code ${d}" ${o.data} rows="5">${esc(v)}</textarea>`;
  if (o.multiline) return `<textarea class="${d}" ${o.data} rows="4">${esc(v)}</textarea>`;
  return `<input type="text" class="${d}" ${o.data} value="${esc(v)}">`;
}

function fieldControl(f) {
  const ed = state.editing;
  const wide = (f.type === 'html' || f.multiline) ? ' span2' : '';
  const c = control(f.type, ed.values.fields[f.id], {
    data: `data-field-id="${esc(f.id)}"`,
    dirty: ed.touched.fields.has(f.id),
    multiline: f.multiline
  });
  return `<div class="field${wide}">
    <label>${esc(f.label)}</label>
    ${c}
    ${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}
  </div>`;
}

function listBlock(l) {
  const ed = state.editing;
  const items = Array.isArray(ed.values.lists[l.id]) ? ed.values.lists[l.id] : [];
  const body = items.length
    ? items.map((it, i) => listItem(l, it, i, items.length)).join('')
    : `<div class="list-empty">No items yet — use the button below to add one.</div>`;

  return `<div class="list-block" data-list-block="${esc(l.id)}">
    <div class="list-head">
      <h3>${esc(l.label)}</h3>
      <span class="list-count">${items.length} ${items.length === 1 ? 'item' : 'items'}${ed.touched.lists.has(l.id) ? ' · modified' : ''}</span>
    </div>
    <div class="list-items">${body}</div>
    <div class="list-foot">
      <button type="button" class="btn btn-ghost btn-sm" data-action="add" data-list="${esc(l.id)}">
        <i class="fas fa-plus"></i> ${esc(l.addLabel || 'Add item')}
      </button>
      ${items.length ? `<button type="button" class="btn btn-danger btn-sm" data-action="clear" data-list="${esc(l.id)}">
        <i class="fas fa-trash"></i> Clear all
      </button>` : ''}
    </div>
  </div>`;
}

function listItem(l, item, i, count) {
  const ed = state.editing;
  const dirty = ed.touched.lists.has(l.id);
  const controls = l.fields.map((f) => {
    const wide = (f.type === 'html' || f.multiline) ? ' span2' : '';
    const c = control(f.type, item[f.id], {
      data: `data-list-id="${esc(l.id)}" data-idx="${i}" data-item-field="${esc(f.id)}"`,
      dirty,
      multiline: f.multiline
    });
    return `<div class="field${wide}">
      <label>${esc(f.label)}</label>
      ${c}
      ${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}
    </div>`;
  }).join('');

  return `<div class="list-item">
    <div class="list-item-head">
      <span>${esc(l.label)} · ${i + 1}</span>
      <span class="list-item-tools">
        <button type="button" data-action="up" data-list="${esc(l.id)}" data-idx="${i}" ${i === 0 ? 'disabled' : ''} title="Move up"><i class="fas fa-arrow-up"></i></button>
        <button type="button" data-action="down" data-list="${esc(l.id)}" data-idx="${i}" ${i === count - 1 ? 'disabled' : ''} title="Move down"><i class="fas fa-arrow-down"></i></button>
        <button type="button" class="danger" data-action="del" data-list="${esc(l.id)}" data-idx="${i}" title="Remove"><i class="fas fa-xmark"></i></button>
      </span>
    </div>
    <div class="list-item-body">${controls}</div>
  </div>`;
}

/* ---------- editor events ---------- */

function updatePreview(input) {
  const wrap = input.closest('.image-field');
  if (!wrap) return;
  const val = input.value.trim();
  const ph = wrap.querySelector('.image-preview.empty');
  const img = wrap.querySelector('img.image-preview');
  if (!ph || !img) return;
  if (val) { img.src = val; img.hidden = false; ph.hidden = true; }
  else { img.hidden = true; ph.hidden = false; }
}

function onEditorInput(e) {
  const t = e.target;
  const ed = state.editing;
  if (!ed || !t.dataset) return;

  if (t.dataset.fieldId) {
    const id = t.dataset.fieldId;
    ed.values.fields[id] = t.value;
    if (t.value === ed.committed.fields[id]) ed.touched.fields.delete(id);
    else ed.touched.fields.add(id);
    t.classList.toggle('dirty', ed.touched.fields.has(id));
    updatePreview(t);
  } else if (t.dataset.listId && t.dataset.itemField) {
    const arr = ed.values.lists[t.dataset.listId];
    const idx = Number(t.dataset.idx);
    if (arr && arr[idx]) {
      arr[idx][t.dataset.itemField] = t.value;
      if (JSON.stringify(arr) === JSON.stringify(ed.committed.lists[t.dataset.listId])) {
        ed.touched.lists.delete(t.dataset.listId);
      } else {
        ed.touched.lists.add(t.dataset.listId);
      }
      t.classList.toggle('dirty', ed.touched.lists.has(t.dataset.listId));
      updatePreview(t);
    }
  }
  updateDirtyUI();
}

function defaultItem(ed, l) {
  const item = {};
  const base = ed.bases.lists[l.id] || [];
  l.fields.forEach((f) => {
    if ((f.type === 'image' || f.type === 'bg') && base.length && base[0][f.id]) {
      item[f.id] = base[0][f.id];           // sensible placeholder image
    } else {
      item[f.id] = '';
    }
  });
  return item;
}

function onEditorClick(e) {
  const ed = state.editing;
  if (!ed) return;

  const pickBtn = e.target.closest('[data-pick]');
  if (pickBtn) {
    const input = pickBtn.closest('.image-field');
    const fieldInput = input && input.querySelector('input');
    if (fieldInput) {
      openMediaModal((path) => {
        fieldInput.value = path;
        fieldInput.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
    return;
  }

  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const listId = btn.dataset.list;
  const l = ed.schema.lists.find((x) => x.id === listId);
  if (!l) return;
  const arr = ed.values.lists[listId];

  if (action === 'add') {
    if (!Array.isArray(arr)) ed.values.lists[listId] = [];
    ed.values.lists[listId].push(defaultItem(ed, l));
    ed.touched.lists.add(listId);
  } else if (action === 'del') {
    if (!window.confirm('Remove this item?')) return;
    arr.splice(Number(btn.dataset.idx), 1);
    ed.touched.lists.add(listId);
  } else if (action === 'up' || action === 'down') {
    const i = Number(btn.dataset.idx);
    const j = action === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= arr.length) return;
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    ed.touched.lists.add(listId);
  } else if (action === 'clear') {
    if (!window.confirm('Remove ALL items from this list? (Reset page restores the originals.)')) return;
    ed.values.lists[listId] = [];
    ed.touched.lists.add(listId);
  } else {
    return;
  }
  renderEditor();
  updateDirtyUI();
}

/* ---------- dirty state / save / reset ---------- */

function isDirty() {
  const ed = state.editing;
  return !!(ed && (ed.touched.fields.size || ed.touched.lists.size));
}

function updateDirtyUI() {
  const dirty = isDirty();
  const ind = $('#saveIndicator');
  ind.hidden = !(state.view === 'content' && dirty);
  const saveBtn = $('#savePageBtn');
  if (saveBtn) saveBtn.disabled = !dirty;
}

function updateToolbar() {
  const ed = state.editing;
  if (!ed) return;
  $('#editorPageTitle').textContent = ed.schema.title;
  $('#editorPageDesc').textContent = ed.schema.description || '';
  $('#resetPageBtn').disabled = !state.content[ed.page];
  updateDirtyUI();
}

async function savePage() {
  const ed = state.editing;
  if (!ed || !isDirty()) return;
  const key = ed.page;
  const existing = state.content[key] || { fields: {}, lists: {} };
  const out = { fields: Object.assign({}, existing.fields), lists: Object.assign({}, existing.lists) };

  ed.touched.fields.forEach((id) => { out.fields[id] = ed.values.fields[id]; });
  ed.touched.lists.forEach((id) => { out.lists[id] = ed.values.lists[id]; });
  Object.keys(out.fields).forEach((k) => { if (out.fields[k] == null) delete out.fields[k]; });

  if (!Object.keys(out.fields).length && !Object.keys(out.lists).length) delete state.content[key];
  else state.content[key] = out;

  const btn = $('#savePageBtn');
  btn.disabled = true;
  try {
    await api('/content', { method: 'PUT', body: state.content });
    ed.touched.fields.clear();
    ed.touched.lists.clear();
    ed.committed = clone(ed.values);
    alertMsg('Saved — the live website now shows these changes.');
  } catch (ex) {
    alertMsg(ex.message, 'error');
  } finally {
    renderPageTabs();
    renderEditor();
    updateToolbar();
  }
}

async function resetPage() {
  const ed = state.editing;
  if (!ed) return;
  if (!window.confirm('Reset this page to the original website content? All saved edits for it will be removed.')) return;
  delete state.content[ed.page];
  try {
    await api('/content', { method: 'PUT', body: state.content });
    alertMsg('Page reset to the original content.');
    await openPageFresh(ed.page);
  } catch (ex) {
    alertMsg(ex.message, 'error');
  }
}

async function openPageFresh(key) {
  const ed = state.editing;
  if (ed) ed.page = null;         // force reload
  state.editing = null;
  await openPage(key);
}

/* ---------- selector validation ---------- */

function runValidation() {
  const ed = state.editing;
  const chip = $('#validationChip');
  const box = $('#validationBox');
  if (!ed) { chip.hidden = true; box.hidden = true; return; }

  const doc = ed.doc;
  const issues = [];

  ed.schema.fields.forEach((f) => {
    let n = -1;
    try { n = doc.querySelectorAll(f.selector).length; } catch (e) { issues.push(`Invalid selector for “${f.label}”: ${f.selector}`); return; }
    if (n !== 1) issues.push(`Field “${f.label}” — selector matches ${n} elements (expected 1): ${f.selector}`);
  });

  ed.schema.lists.forEach((l) => {
    let container;
    try { container = doc.querySelector(l.container); } catch (e) { issues.push(`Invalid container for “${l.label}”: ${l.container}`); return; }
    if (!container) { issues.push(`List “${l.label}” — container not found: ${l.container}`); return; }
    const items = container.querySelectorAll(l.item).length;
    l.fields.forEach((f) => {
      let n = -1;
      try { n = container.querySelectorAll(f.selector).length; } catch (e) { issues.push(`Invalid selector in “${l.label}” / “${f.label}”: ${f.selector}`); return; }
      if (n !== items) issues.push(`List “${l.label}” / “${f.label}” — selector matches ${n}, expected ${items} (one per item): ${f.selector}`);
    });
  });

  if (issues.length) {
    chip.hidden = false;
    chip.className = 'validation-chip warn';
    chip.textContent = issues.length + ' selector warning' + (issues.length > 1 ? 's' : '');
    box.hidden = false;
    box.innerHTML = `<strong>Selector check against the original HTML:</strong><ul>${issues.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
  } else {
    chip.hidden = false;
    chip.className = 'validation-chip ok';
    chip.textContent = 'All selectors OK';
    box.hidden = true;
    box.innerHTML = '';
  }
}

/* ============================================================
   MEDIA
   ============================================================ */
async function loadMedia() {
  const data = await api('/media');
  state.media = data.images || [];
}

function mediaTiles() {
  if (!state.media.length) return '<div class="empty-note">No images yet — upload one above.</div>';
  return state.media.map((img) => `
    <div class="media-tile" data-path="${esc(img.path)}" role="button" tabindex="0">
      <img src="/${esc(img.path)}" alt="" loading="lazy">
      <div class="meta">
        <div class="name" title="${esc(img.path)}">${esc(img.name)}</div>
        <div class="size">${fmtBytes(img.bytes)}</div>
      </div>
      <button type="button" class="del" data-del="${esc(img.path)}" title="Delete image"><i class="fas fa-trash"></i></button>
    </div>`).join('');
}

async function handleUpload(input, cb) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) {
    alertMsg('Images must be 4 MB or smaller.', 'error');
    return;
  }
  try {
    const res = await uploadFile(file);
    alertMsg('Uploaded ' + res.name);
    input.value = '';
    if (cb) cb();
  } catch (ex) {
    alertMsg(ex.message, 'error');
  }
}

async function deleteImage(path) {
  if (!window.confirm('Delete ' + path + '?')) return false;
  try {
    await api('/media?path=' + encodeURIComponent(path), { method: 'DELETE' });
    alertMsg('Image deleted.');
    return true;
  } catch (ex) {
    alertMsg(ex.message, 'error');
    return false;
  }
}

async function renderMedia() {
  await loadMedia();
  const host = $('#view-media');
  host.innerHTML = `
    <div class="card">
      <h3>Media library</h3>
      <p class="sub">Click an image to copy its path. Only uploaded images can be deleted — the site's original photos are protected.</p>
      <div class="upload-row">
        <label class="btn btn-crimson file-btn">
          <i class="fas fa-upload"></i> Upload image
          <input type="file" id="mediaUpload" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden>
        </label>
        <span class="upload-hint">JPG, PNG, WEBP, GIF or AVIF — up to 4 MB</span>
        <button type="button" class="btn btn-ghost btn-sm" id="refreshMedia"><i class="fas fa-rotate"></i> Refresh</button>
      </div>
      <div class="media-grid" id="mediaGrid">${mediaTiles()}</div>
    </div>`;

  $('#mediaUpload').addEventListener('change', (e) => handleUpload(e.target, renderMedia));
  $('#refreshMedia').addEventListener('click', renderMedia);
  $('#mediaGrid').addEventListener('click', async (e) => {
    const del = e.target.closest('[data-del]');
    if (del) {
      e.stopPropagation();
      if (await deleteImage(del.dataset.del)) renderMedia();
      return;
    }
    const tile = e.target.closest('.media-tile');
    if (tile) {
      const path = tile.dataset.path;
      try { await navigator.clipboard.writeText(path); alertMsg('Copied ' + path); }
      catch (err) { alertMsg(path); }
    }
  });
}

/* ---------- media picker modal ---------- */
async function openMediaModal(onPick) {
  state.mediaTarget = onPick;
  $('#mediaModal').hidden = false;
  $('#modalGrid').innerHTML = '<div class="empty-note"><i class="fas fa-spinner fa-spin"></i> Loading…</div>';
  try {
    await loadMedia();
    $('#modalGrid').innerHTML = mediaTiles();
  } catch (ex) {
    alertMsg(ex.message, 'error');
  }
}

function closeModal() {
  $('#mediaModal').hidden = true;
  state.mediaTarget = null;
}

async function onModalGridClick(e) {
  const del = e.target.closest('[data-del]');
  if (del) {
    e.stopPropagation();
    if (await deleteImage(del.dataset.del)) {
      await loadMedia();
      $('#modalGrid').innerHTML = mediaTiles();
    }
    return;
  }
  const tile = e.target.closest('.media-tile');
  if (tile && state.mediaTarget) {
    const cb = state.mediaTarget;
    const path = tile.dataset.path;
    closeModal();
    cb(path);
  }
}

/* ============================================================
   SUBSCRIBERS
   ============================================================ */
async function renderSubscribers() {
  const data = await api('/subscribers');
  const list = data.subscribers || [];
  const rows = list.map((s) => `<tr>
      <td><strong>${esc(s.email)}</strong></td>
      <td>${esc(s.name || '—')}</td>
      <td>${esc(s.source || '')}</td>
      <td>${s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : '—'}</td>
      <td>${s.unsubscribed ? '<span class="badge red">Paused</span>' : '<span class="badge green">Active</span>'}</td>
      <td style="text-align:right"><button type="button" class="btn btn-danger btn-sm" data-remove="${esc(s.id)}" title="Remove subscriber"><i class="fas fa-trash"></i></button></td>
    </tr>`).join('');

  const host = $('#view-subscribers');
  host.innerHTML = `
    <div class="stat-grid">
      <div class="stat-tile"><i class="fas fa-user-check"></i><div class="num">${data.activeCount}</div><div class="lbl">Active subscribers</div></div>
      <div class="stat-tile"><i class="fas fa-bell"></i><div class="num">${data.pushCount}</div><div class="lbl">Browser devices</div></div>
      <div class="stat-tile"><i class="fas fa-database"></i><div class="num">${list.length}</div><div class="lbl">Total records</div></div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <h3>Add a subscriber manually</h3>
      <div class="upload-row" style="margin-top:12px">
        <input type="email" id="newSubEmail" placeholder="parent@example.com" style="padding:10px 12px;border:1px solid var(--stone-line);border-radius:8px;min-width:250px;font-family:inherit">
        <input type="text" id="newSubName" placeholder="Name (optional)" style="padding:10px 12px;border:1px solid var(--stone-line);border-radius:8px;min-width:200px;font-family:inherit">
        <button type="button" class="btn btn-navy" id="addSubBtn"><i class="fas fa-plus"></i> Add subscriber</button>
      </div>
    </div>

    <div class="table-wrap">
      <table class="data">
        <thead><tr><th>Email</th><th>Name</th><th>Source</th><th>Joined</th><th>Status</th><th></th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" class="empty-note">No subscribers yet.</td></tr>'}</tbody>
      </table>
    </div>`;

  $('#addSubBtn').addEventListener('click', async () => {
    const email = $('#newSubEmail').value.trim();
    const name = $('#newSubName').value.trim();
    if (!email) return alertMsg('Enter an email address.', 'error');
    try {
      await api('/subscribers', { method: 'POST', body: { email, name } });
      alertMsg('Subscriber added.');
      renderSubscribers();
    } catch (ex) { alertMsg(ex.message, 'error'); }
  });

  host.onclick = async (e) => {
    const rm = e.target.closest('[data-remove]');
    if (!rm) return;
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      await api('/subscribers?id=' + encodeURIComponent(rm.dataset.remove), { method: 'DELETE' });
      alertMsg('Subscriber removed.');
      renderSubscribers();
    } catch (ex) { alertMsg(ex.message, 'error'); }
  };
}

/* ============================================================
   MESSAGES
   ============================================================ */
async function renderMessages() {
  const results = await Promise.all([api('/messages-all'), api('/subscribers')]);
  const messages = (results[0].messages) || [];
  const subs = results[1];
  const host = $('#view-messages');

  host.innerHTML = `
    <div class="compose-grid">
      <div class="card">
        <h3><i class="fas fa-paper-plane"></i> Compose a message</h3>
        <p class="sub">Sent to everyone who subscribed to Greenhill news.</p>

        <div class="form-group" style="margin-top:14px">
          <label for="msgTitle">Title *</label>
          <input type="text" id="msgTitle" maxlength="120" placeholder="e.g. Term 3 opens on 28 April">
        </div>
        <div class="form-group">
          <label for="msgBody">Message</label>
          <textarea id="msgBody" rows="4" maxlength="600" placeholder="Short message shown in the notification…" style="padding:10px 12px;border:1px solid var(--stone-line);border-radius:8px;font-family:inherit;font-size:15px"></textarea>
        </div>
        <div class="form-group">
          <label for="msgLink">Link (optional)</label>
          <input type="text" id="msgLink" placeholder="/admissions.html — opened when the notification is clicked">
        </div>
        <div class="form-group">
          <label>Send via</label>
          <div class="radio-row">
            <label><input type="radio" name="sendTo" value="all" checked>
              <span><span class="rr-title">Browser notifications + website banner</span>
              <span class="rr-desc">Pushes to ${subs.pushCount} registered device${subs.pushCount === 1 ? '' : 's'} and shows the announcement on the site.</span></span></label>
            <label><input type="radio" name="sendTo" value="site-only">
              <span><span class="rr-title">Website banner only</span>
              <span class="rr-desc">Visitors see the announcement card; no push notification.</span></span></label>
          </div>
        </div>
        <button type="button" class="btn btn-crimson" id="sendMsgBtn"><i class="fas fa-paper-plane"></i> Send message</button>
      </div>

      <div class="card">
        <h3><i class="fas fa-circle-info"></i> Before you send</h3>
        <div class="channel-note" style="margin-top:10px">
          <strong>Browser notifications</strong> reach only visitors who clicked
          “Enable browser notifications” in the Subscribe widget
          (<strong>${subs.pushCount}</strong> registered device${subs.pushCount === 1 ? '' : 's'}).<br><br>
          <strong>The website banner</strong> appears to every visitor until they dismiss it.<br><br>
          <strong>Subscribers:</strong> ${subs.activeCount} active · ${subs.pushCount} devices.
        </div>
        <p class="sub" style="margin-top:12px">
          <a href="/index.html" target="_blank" rel="noopener">Preview the site <i class="fas fa-arrow-up-right-from-square"></i></a>
        </p>
      </div>
    </div>

    <h3 style="margin:24px 0 12px">Message history</h3>
    <div id="msgHistory">${messages.map(messageCard).join('') || '<div class="card"><p class="empty-note">No messages sent yet.</p></div>'}</div>`;

  $('#sendMsgBtn').onclick = sendMessage;
  $('#msgHistory').onclick = onHistoryClick;
}

function messageCard(m) {
  const when = new Date(m.createdAt).toLocaleString();
  const stats = m.stats
    ? `<span><i class="fas fa-check-double"></i> ${m.stats.delivered}/${m.stats.total} delivered</span>`
    : '';
  return `<div class="message-item">
    <div class="msg-top">
      <div>
        <h4>${esc(m.title)}</h4>
        <div class="msg-meta">
          <span><i class="fas fa-clock"></i> ${when}</span>
          <span class="badge ${m.sendTo === 'site-only' ? 'gold' : 'green'}">${m.sendTo === 'site-only' ? 'Site only' : 'Push + site'}</span>
          <span class="badge ${m.active !== false ? 'green' : 'red'}">${m.active !== false ? 'Visible' : 'Hidden'}</span>
          ${stats}
        </div>
      </div>
      <div class="msg-tools">
        <button type="button" class="btn btn-ghost btn-sm" data-toggle="${esc(m.id)}" title="Show / hide on site">
          <i class="fas fa-eye${m.active !== false ? '' : '-slash'}"></i>
        </button>
        <button type="button" class="btn btn-danger btn-sm" data-delete="${esc(m.id)}" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    ${m.body ? `<p class="msg-body">${esc(m.body)}</p>` : ''}
    ${m.link ? `<p class="msg-meta"><i class="fas fa-link"></i>&nbsp;<a href="${esc(m.link)}">${esc(m.link)}</a></p>` : ''}
  </div>`;
}

async function sendMessage() {
  const title = $('#msgTitle').value.trim();
  if (!title) return alertMsg('Give the message a title.', 'error');
  const body = $('#msgBody').value.trim();
  const link = $('#msgLink').value.trim();
  const checked = $$('input[name="sendTo"]').find((r) => r.checked);
  const sendTo = checked ? checked.value : 'all';

  const btn = $('#sendMsgBtn');
  btn.disabled = true;
  try {
    const res = await api('/messages', { method: 'POST', body: { title, body, link, sendTo } });
    const s = res.message.stats;
    if (sendTo === 'site-only') alertMsg('Message published — visitors will see the announcement.');
    else alertMsg(`Message sent — delivered to ${s.delivered} of ${s.total} device${s.total === 1 ? '' : 's'}.`);
    renderMessages();
  } catch (ex) {
    alertMsg(ex.message, 'error');
    btn.disabled = false;
  }
}

async function onHistoryClick(e) {
  const t = e.target.closest('[data-toggle]');
  const d = e.target.closest('[data-delete]');
  if (!t && !d) return;
  try {
    if (t) {
      await api('/messages-toggle', { method: 'POST', body: { id: t.dataset.toggle } });
      renderMessages();
    } else if (d) {
      if (!window.confirm('Delete this message from the history?')) return;
      await api('/messages?id=' + encodeURIComponent(d.dataset.delete), { method: 'DELETE' });
      alertMsg('Message deleted.');
      renderMessages();
    }
  } catch (ex) { alertMsg(ex.message, 'error'); }
}

/* ============================================================
   SETTINGS
   ============================================================ */
function renderSettings() {
  const host = $('#view-settings');
  host.innerHTML = `
    <div class="settings-grid">
      <div class="card">
        <h3><i class="fas fa-key"></i> Change admin password</h3>
        <p class="sub">Used to sign in to this platform.</p>
        <form id="pwForm" style="margin-top:14px">
          <div class="form-group"><label for="pwCurrent">Current password</label>
            <input type="password" id="pwCurrent" autocomplete="current-password" required></div>
          <div class="form-group"><label for="pwNext">New password</label>
            <input type="password" id="pwNext" autocomplete="new-password" minlength="6" required></div>
          <div class="form-group"><label for="pwConfirm">Confirm new password</label>
            <input type="password" id="pwConfirm" autocomplete="new-password" minlength="6" required></div>
          <button class="btn btn-navy" type="submit"><i class="fas fa-floppy-disk"></i> Update password</button>
        </form>
      </div>

      <div class="card">
        <h3><i class="fas fa-database"></i> Where things live</h3>
        <p class="sub" style="line-height:1.75">
          <strong>Live site (Netlify)</strong> — content edits, subscribers, messages
          and uploaded images are stored in <em>Netlify Blobs</em> (site dashboard →
          Data &amp; Storage → Blobs). Only the staged <code>publish/</code> folder is
          deployed — server code and data are never published.<br><br>
          <strong>Local development</strong> — start the platform with
          <code>npm start</code>, then open
          <code>http://localhost:3000/admin</code>. Local data lives in
          <code>server/data/</code> and <code>images/uploads/</code>.<br><br>
          Local and live data are stored separately — edit wherever you deploy.
        </p>
        <h3 style="margin-top:18px"><i class="fas fa-shield-halved"></i> Security notes</h3>
        <p class="sub" style="line-height:1.75">
          • Change the default password as soon as you sign in.<br>
          • Sessions last 7 days; changing the password signs out every device.<br>
          • SVG uploads are blocked to keep the site safe from scripts.<br>
          • Local dev never serves <code>server/</code>, <code>netlify/</code> or
          <code>tools/</code>; on Netlify only <code>publish/</code> is public.
        </p>
      </div>
    </div>`;

  $('#pwForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = $('#pwCurrent').value;
    const next = $('#pwNext').value;
    const confirmV = $('#pwConfirm').value;
    if (next !== confirmV) return alertMsg('New passwords do not match.', 'error');
    if (next.length < 6) return alertMsg('New password must be at least 6 characters.', 'error');
    try {
      await api('/password', { method: 'POST', body: { current, next } });
      try { await api('/password-changed', { method: 'POST' }); } catch (e2) { /* best effort */ }
      alertMsg('Password updated.');
      $('#pwForm').reset();
    } catch (ex) {
      alertMsg(ex.message, 'error');
    }
  });
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */
function init() {
  $('#loginForm').addEventListener('submit', onLoginSubmit);
  $('#logoutBtn').addEventListener('click', logout);

  $('#sideNav').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-view]');
    if (b) showView(b.dataset.view);
  });

  $('#savePageBtn').addEventListener('click', savePage);
  $('#resetPageBtn').addEventListener('click', resetPage);
  $('#pageTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-page]');
    if (tab) openPage(tab.dataset.page);
  });
  $('#contentEditor').addEventListener('input', onEditorInput);
  $('#contentEditor').addEventListener('click', onEditorClick);

  $('#mediaModal').addEventListener('click', (e) => {
    if (e.target.id === 'mediaModal' || e.target.closest('[data-close-modal]')) closeModal();
  });
  $('#modalGrid').addEventListener('click', onModalGridClick);
  $('#modalUpload').addEventListener('change', (e) => handleUpload(e.target, () => {
    loadMedia().then(() => { $('#modalGrid').innerHTML = mediaTiles(true); });
    if (state.view === 'media') renderMedia();
  }));

  if (state.token) {
    api('/stats')
      .then(() => showApp())
      .catch(() => showLogin());
  } else {
    showLogin();
  }
}

init();
