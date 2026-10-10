/* ============================================================
   GREENHILL CMS — Schema Core (js/schema/core.js)
   Shared by the public site (js/cms.js) and the admin
   platform (admin/admin.js).

   A schema declares what is editable on one page:
     - fields: single elements (text, html, image, bg, attr)
     - lists:  repeatable cards (stats, pillars, news, FAQ…)

   The HTML files on disk hold the ORIGINAL (default) content.
   The admin reads defaults by parsing the page's HTML; the
   public site applies saved overrides from /api/content.
   ============================================================ */

const registry = Object.create(null);

/** Register (or replace) the schema for a page, e.g. 'index.html'. */
export function register(page, schema) {
  schema.fields = schema.fields || [];
  schema.lists = schema.lists || [];
  registry[page] = schema;
}

export function getSchema(page) { return registry[page] || null; }
export function allSchemas() { return registry; }
export function pageKeys() { return Object.keys(registry); }

/* ---------- value helpers ---------- */

/** Escape a value for safe interpolation into HTML text/attributes. */
export function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/** Collapse whitespace — used so multi-line HTML sources read cleanly in forms. */
export function tidy(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

/** Element lookup that tolerates the root itself matching the selector. */
function find(root, selector) {
  if (!root) return null;
  if (root.nodeType === 1 && typeof root.matches === 'function' && root.matches(selector)) return root;
  return typeof root.querySelector === 'function' ? root.querySelector(selector) : null;
}

/* ---------- field read / write ---------- */

/** Read a field's current value from a DOM root (document or card element). */
export function readField(root, field) {
  const el = find(root, field.selector);
  if (!el) return null;
  switch (field.type) {
    case 'html':
      return el.innerHTML.replace(/\n\s*/g, ' ').trim();
    case 'image':
      return el.getAttribute('src') || '';
    case 'bg': {
      const style = el.getAttribute('style') || '';
      const m = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/);
      return m ? m[1] : '';
    }
    case 'attr':
      return el.getAttribute(field.attr || 'href') || '';
    case 'text':
    default:
      return tidy(el.textContent);
  }
}

/** Write a field's value into a live DOM root. Returns false if not found. */
export function writeField(root, field, value) {
  const el = find(root, field.selector);
  if (!el) return false;
  switch (field.type) {
    case 'html':
      el.innerHTML = value == null ? '' : value;
      break;
    case 'image':
      if (value) el.setAttribute('src', value);
      break;
    case 'bg':
      el.style.backgroundImage = value ? `url('${String(value).replace(/'/g, "%27")}')` : '';
      break;
    case 'attr':
      el.setAttribute(field.attr || 'href', value == null ? '' : value);
      break;
    case 'text':
    default:
      el.textContent = value == null ? '' : String(value);
  }
  return true;
}

/* ---------- list (card) read / write ---------- */

/** Read every card in a list container into an array of plain objects. */
export function readList(root, list) {
  const container = find(root, list.container);
  if (!container) return null;
  const items = [];
  container.querySelectorAll(list.item).forEach((node) => {
    const obj = {};
    list.fields.forEach((f) => {
      const v = readField(node, f);
      if (v !== null) obj[f.id] = v;
    });
    items.push(obj);
  });
  return items;
}

/** Re-render a list container from data using the list's template function.
    Existing items are replaced, but any "chrome" inside the container that
    does not match list.item (e.g. a heading above the items) is preserved. */
export function writeList(root, list, items) {
  const container = find(root, list.container);
  if (!container || !Array.isArray(items)) return false;
  // Parse inside a childless clone of the container so the markup context is
  // correct (e.g. <tr> rows only parse inside table/tbody, not inside a div).
  const holder = container.cloneNode(false);
  holder.innerHTML = items.map((it) => list.template(it)).join('\n');
  const fresh = Array.prototype.slice.call(holder.childNodes);
  container.querySelectorAll(list.item).forEach((n) => {
    if (n.parentNode) n.parentNode.removeChild(n);
  });
  fresh.forEach((n) => container.appendChild(n));
  return true;
}

/* ---------- merging saved content ---------- */

/**
 * Apply saved CMS content to a document.
 *  content = { global: {fields:{}, lists:{}}, 'index.html': {...}, ... }
 * Only keys that were actually saved are applied — untouched content keeps
 * whatever lives in the HTML file.
 * Returns { missing: [selectors that did not resolve] } for diagnostics.
 */
export function applyContent(doc, page, content, schemasFn) {
  const missing = [];
  const units = [];
  const globalSchema = schemasFn();
  if (globalSchema && content.global) units.push([globalSchema, content.global]);
  const pageData = content[page];
  const pageSchema = getSchema(page);
  if (pageSchema && pageData) units.push([pageSchema, pageData]);

  for (const [schema, data] of units) {
    const fields = (data && data.fields) || {};
    schema.fields.forEach((f) => {
      if (!(f.id in fields)) return;
      if (!writeField(doc, f, fields[f.id])) missing.push(`${page} :: ${f.selector}`);
    });
    const lists = (data && data.lists) || {};
    schema.lists.forEach((l) => {
      if (!(l.id in lists)) return;
      if (!writeList(doc, l, lists[l.id])) missing.push(`${page} :: ${l.container}`);
    });
  }
  return { missing };
}
