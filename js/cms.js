/* ============================================================
   THE GREENHILL SCHOOL — Public CMS runtime (js/cms.js)
   ------------------------------------------------------------
   Loaded as a module by every public page. It:
     1. pulls saved content from the admin platform (/api/content)
        and applies it over the static HTML (texts, images, cards);
     2. injects the floating "Subscribe" widget (school news +
        browser notifications);
     3. wires the Journal page's subscribe form;
     4. shows school messages/announcements sent by the admin;
     5. exposes window.__cmsValidate() for schema diagnostics.
   If the API is unreachable (site opened as plain files),
   everything degrades silently to the static HTML.
   ============================================================ */

import { getSchema, pageKeys } from './schema/index.js';
import { applyContent, readField, readList } from './schema/core.js';

const PAGE = location.pathname.split('/').pop() || 'index.html';
const API = '/api';

/* ============================================================
   1. CONTENT
   ============================================================ */
async function loadContent() {
  try {
    const res = await fetch(`${API}/content`, { cache: 'no-store' });
    if (!res.ok) throw new Error('content ' + res.status);
    return await res.json();
  } catch (e) {
    return null; // static mode — keep the HTML as-is
  }
}

function applySavedContent(content) {
  const result = applyContent(document, PAGE, content, () => getSchema('global'));
  if (result.missing.length) {
    console.info('[cms] selectors not found on this page (normal for site-wide fields):', result.missing);
  }
  // Re-run scroll-reveal for any freshly rendered cards
  reobserveReveals();
}

function reobserveReveals() {
  const pending = document.querySelectorAll('.reveal:not(.visible)');
  if (!pending.length || !('IntersectionObserver' in window)) {
    pending.forEach((el) => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  pending.forEach((el) => io.observe(el));
}

/* ============================================================
   2. SUBSCRIBE WIDGET
   ============================================================ */
const WIDGET_ID = 'gh-subscribe-widget';

const widgetCss = `
#${WIDGET_ID}{position:fixed;right:20px;bottom:20px;z-index:9990;font-family:'Source Sans 3',sans-serif;color:#1B2A4A}
#${WIDGET_ID} *{box-sizing:border-box}
#${WIDGET_ID} .gh-sub-btn{display:flex;align-items:center;gap:8px;background:#1B2A4A;color:#FAF7F0;border:none;
  padding:13px 20px;border-radius:999px;font:600 15px 'Source Sans 3',sans-serif;cursor:pointer;
  box-shadow:0 8px 24px rgba(27,42,74,.28);transition:.25s}
#${WIDGET_ID} .gh-sub-btn:hover{background:#A6192E;transform:translateY(-2px)}
#${WIDGET_ID} .gh-sub-btn i{color:#E5C158}
#${WIDGET_ID} .gh-sub-panel{display:none;position:absolute;right:0;bottom:64px;width:330px;max-width:calc(100vw - 40px);
  background:#FAF7F0;border:1px solid #D9D3C5;border-radius:14px;padding:20px;box-shadow:0 24px 60px rgba(27,42,74,.22)}
#${WIDGET_ID} .gh-sub-panel.open{display:block;animation:ghPop .18s ease}
@keyframes ghPop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
#${WIDGET_ID} .gh-sub-panel h4{margin:0 0 4px;font:700 19px 'Libre Baskerville',serif;color:#1B2A4A}
#${WIDGET_ID} .gh-sub-panel p{margin:0 0 12px;font-size:13.5px;color:#5A5A5A;line-height:1.45}
#${WIDGET_ID} .gh-sub-panel input{width:100%;padding:10px 12px;margin-bottom:8px;border:1px solid #D9D3C5;
  border-radius:8px;font:15px 'Source Sans 3',sans-serif;background:#fff;color:#1B2A4A}
#${WIDGET_ID} .gh-sub-panel input:focus{outline:2px solid #C9A227;border-color:transparent}
#${WIDGET_ID} .gh-sub-panel .gh-sub-go{width:100%;padding:11px;border:none;border-radius:8px;background:#A6192E;
  color:#fff;font:600 15px 'Source Sans 3',sans-serif;cursor:pointer}
#${WIDGET_ID} .gh-sub-panel .gh-sub-go:hover{background:#7E1222}
#${WIDGET_ID} .gh-sub-panel .gh-sub-push{width:100%;padding:10px;margin-top:8px;border:1px dashed #C9A227;border-radius:8px;
  background:transparent;color:#1B2A4A;font:600 14px 'Source Sans 3',sans-serif;cursor:pointer}
#${WIDGET_ID} .gh-sub-panel .gh-sub-push:hover{background:#fff}
#${WIDGET_ID} .gh-sub-msg{font-size:13.5px;margin-top:8px;color:#2D5A3D;font-weight:600;min-height:18px}
#${WIDGET_ID} .gh-sub-msg.err{color:#A6192E}
#${WIDGET_ID} .gh-sub-close{position:absolute;top:10px;right:12px;border:none;background:none;font-size:18px;
  color:#5A6B8A;cursor:pointer;line-height:1}
#${WIDGET_ID} .gh-sub-badge{display:inline-block;background:#2D5A3D;color:#fff;font-size:11px;font-weight:700;
  border-radius:999px;padding:2px 8px;margin-left:6px;vertical-align:middle}
`;

function buildWidget() {
  if (document.getElementById(WIDGET_ID)) return;
  const style = document.createElement('style');
  style.textContent = widgetCss;
  document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.id = WIDGET_ID;
  wrap.innerHTML = `
    <div class="gh-sub-panel" id="ghSubPanel" role="dialog" aria-label="Subscribe to Greenhill news">
      <button class="gh-sub-close" id="ghSubClose" aria-label="Close">×</button>
      <h4>Stay in the loop</h4>
      <p>Get Greenhill news, event reminders and messages — in your browser or by email.</p>
      <input type="email" id="ghSubEmail" placeholder="Your email address" autocomplete="email">
      <input type="text" id="ghSubName" placeholder="Your name (optional)" autocomplete="name">
      <button class="gh-sub-go" id="ghSubGo">Subscribe to school news</button>
      <button class="gh-sub-push" id="ghSubPush" hidden><i class="fas fa-bell"></i> Enable browser notifications</button>
      <div class="gh-sub-msg" id="ghSubMsg"></div>
    </div>
    <button class="gh-sub-btn" id="ghSubBtn" aria-expanded="false">
      <i class="fas fa-bell"></i> Subscribe
    </button>`;
  document.body.appendChild(wrap);

  const panel = document.getElementById('ghSubPanel');
  const btn = document.getElementById('ghSubBtn');
  const msg = document.getElementById('ghSubMsg');
  const pushBtn = document.getElementById('ghSubPush');

  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    if (open) document.getElementById('ghSubEmail').focus();
  });
  document.getElementById('ghSubClose').addEventListener('click', () => {
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  function say(text, isErr) {
    msg.textContent = text;
    msg.classList.toggle('err', !!isErr);
  }

  document.getElementById('ghSubGo').addEventListener('click', async () => {
    const email = document.getElementById('ghSubEmail').value.trim();
    const name = document.getElementById('ghSubName').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return say('Please enter a valid email address.', true);
    say('Subscribing…');
    try {
      const res = await fetch(`${API}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: PAGE })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not subscribe.');
      say('✓ Subscribed! Welcome to Greenhill news.');
      localStorage.setItem('gh_sub_email', email);
      if ('Notification' in window && Notification.permission === 'default') pushBtn.hidden = false;
      else if ('Notification' in window && Notification.permission === 'granted') await enablePush(email);
    } catch (e) {
      say(e.message || 'Could not reach the server.', true);
    }
  });

  pushBtn.addEventListener('click', async () => {
    const email = localStorage.getItem('gh_sub_email') || document.getElementById('ghSubEmail').value.trim();
    await enablePush(email);
  });

  async function enablePush(email) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return say('This browser does not support notifications.', true);
    }
    try {
      say('Requesting permission…');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return say('Notifications stay off — you can still read messages here.', true);
      const reg = await navigator.serviceWorker.register('/sw.js');
      const keyRes = await fetch(`${API}/push-key`);
      const { publicKey } = await keyRes.json();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey)
      });
      const res = await fetch(`${API}/push-subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, email: email || null })
      });
      if (!res.ok) throw new Error('Could not save device.');
      pushBtn.hidden = true;
      say('✓ Browser notifications enabled.');
    } catch (e) {
      say(e.message || 'Could not enable notifications.', true);
    }
  }

  // Restore known subscriber state
  const known = localStorage.getItem('gh_sub_email');
  if (known) {
    document.getElementById('ghSubEmail').value = known;
    if ('Notification' in window && Notification.permission === 'default') pushBtn.hidden = false;
    if ('Notification' in window && Notification.permission === 'granted') pushBtn.hidden = true;
  }
}

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

/* ---- Journal page: wire its built-in subscribe form ---- */
function wireJournalForm() {
  const form = document.getElementById('subscribeForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    const input = document.getElementById('subscribeEmail');
    if (!input || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) return;
    try {
      await fetch(`${API}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.value.trim(), source: 'journal.html' })
      });
      localStorage.setItem('gh_sub_email', input.value.trim());
    } catch (err) { /* the inline fallback UI still runs */ }
  });
}

/* ============================================================
   3. SCHOOL MESSAGES (announcements sent by the admin)
   ============================================================ */
const TOAST_ID = 'gh-toast';

const toastCss = `
#${TOAST_ID}{position:fixed;left:20px;bottom:20px;z-index:9989;max-width:360px;background:#fff;color:#1B2A4A;
  border-radius:14px;border:1px solid #D9D3C5;box-shadow:0 24px 60px rgba(27,42,74,.20);padding:16px 38px 16px 18px;
  font-family:'Source Sans 3',sans-serif;animation:ghToastIn .3s ease}
@keyframes ghToastIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
#${TOAST_ID} .gh-t-kicker{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C9A227}
#${TOAST_ID} .gh-t-title{font:700 16px 'Libre Baskerville',serif;margin:4px 0 4px}
#${TOAST_ID} .gh-t-body{font-size:14px;line-height:1.5;color:#5A5A5A;margin:0 0 8px}
#${TOAST_ID} .gh-t-link{font-size:14px;font-weight:600;color:#A6192E;text-decoration:none}
#${TOAST_ID} .gh-t-link:hover{text-decoration:underline}
#${TOAST_ID} .gh-t-close{position:absolute;top:8px;right:10px;border:none;background:none;font-size:17px;color:#5A6B8A;cursor:pointer}
`;

async function showMessageToast() {
  try {
    const res = await fetch(`${API}/messages`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const msg = (data.messages || [])[0];
    if (!msg) return;
    const dismissed = JSON.parse(sessionStorage.getItem('gh_dismissed') || '[]');
    if (dismissed.includes(msg.id)) return;

    if (!document.getElementById('ghToastStyle')) {
      const st = document.createElement('style');
      st.id = 'ghToastStyle';
      st.textContent = toastCss;
      document.head.appendChild(st);
    }
    document.getElementById(TOAST_ID)?.remove();

    const el = document.createElement('div');
    el.id = TOAST_ID;
    el.setAttribute('role', 'status');
    el.innerHTML = `
      <button class="gh-t-close" aria-label="Dismiss">×</button>
      <div class="gh-t-kicker">Message from school</div>
      <div class="gh-t-title"></div>
      ${msg.body ? '<p class="gh-t-body"></p>' : ''}
      ${msg.link ? '<a class="gh-t-link" href="#">Read more →</a>' : ''}`;
    el.querySelector('.gh-t-title').textContent = msg.title;
    if (msg.body) el.querySelector('.gh-t-body').textContent = msg.body;
    if (msg.link) el.querySelector('.gh-t-link').setAttribute('href', msg.link);
    el.querySelector('.gh-t-close').addEventListener('click', () => {
      el.remove();
      dismissed.push(msg.id);
      sessionStorage.setItem('gh_dismissed', JSON.stringify(dismissed.slice(-50)));
    });
    document.body.appendChild(el);
  } catch (e) { /* offline / static mode */ }
}

/* ============================================================
   4. SCHEMA VALIDATION (used during maintenance/testing)
   ============================================================ */
window.__cmsValidate = function validate(page) {
  const report = [];
  const targets = page ? [page] : ['global', PAGE];
  const doc = document;
  targets.forEach((key) => {
    const schema = getSchema(key);
    if (!schema) {
      if (key !== 'global') report.push({ page: key, level: 'error', msg: 'no schema registered' });
      return;
    }
    schema.fields.forEach((f) => {
      const n = doc.querySelectorAll(f.selector).length;
      if (n !== 1) {
        report.push({
          page: key, level: n === 0 ? 'error' : 'warn',
          msg: `field "${f.id}" selector matches ${n} elements: ${f.selector}`
        });
      }
    });
    schema.lists.forEach((l) => {
      const c = doc.querySelectorAll(l.container).length;
      if (c !== 1) {
        report.push({ page: key, level: c === 0 ? 'error' : 'warn', msg: `list "${l.id}" container matches ${c}: ${l.container}` });
      } else {
        const items = doc.querySelector(l.container).querySelectorAll(l.item).length;
        report.push({ page: key, level: 'info', msg: `list "${l.id}" ok — ${items} items (${l.item})` });
      }
      l.fields.forEach((f) => {
        const container = doc.querySelector(l.container);
        if (!container) return;
        const n = container.querySelectorAll(f.selector).length;
        const perItem = container.querySelectorAll(l.item).length || 1;
        if (n !== perItem) {
          report.push({ page: key, level: 'warn', msg: `list "${l.id}" field "${f.id}" matches ${n} but ${perItem} items exist: ${f.selector}` });
        }
      });
    });
  });
  if (!report.some((r) => r.level !== 'info')) report.push({ page: PAGE, level: 'info', msg: 'all selectors OK' });
  return report;
};

/* ============================================================
   BOOT
   ============================================================ */
(async function boot() {
  const content = await loadContent();
  if (content) applySavedContent(content);
  buildWidget();
  wireJournalForm();
  if (content) showMessageToast();
})();
