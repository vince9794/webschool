# The Greenhill School — Website + Admin Platform

A static school website (8 pages) with a full admin platform on top of it:
edit every text, image and card on the site, manage newsletter subscribers,
send browser notifications + on-site announcements, and manage uploads —
all from a password-protected dashboard.

Two interchangeable backends implement the **same flat API**, so the admin
and the public site work identically on both:

| | Local development | Production (Netlify) |
| --- | --- | --- |
| Server | Express — `server/server.js` | Netlify Functions — `netlify/functions/` |
| Storage | JSON files in `server/data/` | Netlify Blobs (store `greenhill`) |
| Auth | 7-day session tokens | 7-day signed tokens (HMAC) |
| Run | `npm start` → :3000 | `npm run deploy` |

Changing the admin password signs out **every** device on both backends.

## Quick start (local)

```bash
npm install
npm start          # Windows: use npm.cmd start if scripts are blocked
```

| URL | What |
| --- | --- |
| http://localhost:3000/ | The public website |
| http://localhost:3000/admin | The admin platform |

**Default admin password: `greenhill`** — change it in **admin → Settings**
immediately. (The dashboard shows a reminder while the default is still active.)

Requirements: Node.js 18+ (tested on Node 22).

## Deploying to Netlify

The site itself is static, but the admin API runs on Netlify **Functions**
with data in Netlify **Blobs** — a drag-and-drop deploy cannot run either.
Deploy with the Netlify CLI:

```bash
npm install
npm run deploy        # = npx --yes netlify-cli deploy --build --prod
```

The first run asks you to log in and create/link a site. Alternatively,
connect the repo in the Netlify UI — `netlify.toml` already sets the build
command (`npm run stage`), publish dir (`publish`), the Node version and the
`/api/* → functions` redirects, so Git deploys work out of the box.

Things to know:

- **Local and live data are separate.** Local edits live in `server/data/`;
  the live site keeps its own copy in Netlify Blobs. Neither one affects
  the other.
- **Local uploads are not deployed.** Uploads are stored per backend
  (local: `images/uploads/` on disk, live: Blobs) — re-upload images in the
  admin after deploying, or add them again post-deploy.
- `npm run stage` alone just builds the `publish/` folder (static site +
  image manifest) without deploying.
- `npx netlify-cli dev` runs the functions + Blobs locally instead of Express.
- Netlify caps function payloads at 6 MB, so **uploads are limited to 4 MB**.

## Admin platform

**Dashboard** — subscribers, registered devices, messages sent, pages edited,
plus quick actions.

**Content** — pick a page tab (Site-wide, Home, About, Learning, Admissions,
Campus, Journal, Contact, Parent Portal), then edit:

- **Text fields** — plain inputs; some accept small HTML (`<em>`, `<strong>`).
- **Image / background fields** — type a path or click 📂 to pick from the
  media library. The preview updates live.
- **Cards & lists** — add, remove, reorder, duplicate-into-empty items.
  Everything (fees tables, FAQs, departments, galleries…) is a list.

Changed controls are highlighted, the toolbar shows **Unsaved changes**,
and a green **All selectors OK** chip confirms the page is wired correctly.
**Save changes** publishes immediately; **Reset page** reverts the page to the
original website content.

**Media** — upload JPG/PNG/WEBP/GIF/AVIF up to 4 MB. Click a tile to copy its
path; only *uploaded* images can be deleted (original site photos are protected).
SVG uploads are blocked for safety.

**Subscribers** — everyone who opted in to school news (add/remove manually too).

**Messages** — compose a message and send via **browser notifications + website
banner** or **banner only**. The banner appears to every visitor until dismissed;
push notifications go to devices that enabled them. Toggle visibility or delete
from the history.

**Settings** — change the admin password; see where data is stored.

## How content editing works

The site stays fully static — no build step:

1. The original HTML files hold the **default content**.
2. `js/schema/*.js` declares every editable field with a CSS selector, and every
   list with a container + item selector + re-render template.
3. Edits are stored as a content overlay (local: `server/data/content.json`,
   live: the `data/content` blob) — only what the admin changed.
4. On page load, `js/cms.js` fetches the saved content and overlays it onto the
   original HTML. Pages with no saved edits render exactly as authored.

Admin and public site share the same schema files, so selectors are validated
live: the editor's selector chip warns if a selector stops matching exactly one
element after site changes. `window.__cmsValidate()` in the browser console runs
the same check on demand.

To add/edit a field, change its entry in the matching file under `js/schema/`
(`selector`, `type` — `text` | `html` | `image` | `bg` | `attr` — and for lists
`container`/`item`/`fields`/`template`).

## Project structure

```
index.html, about.html, …      the 8 public pages (original site)
js/cms.js                      public runtime: applies saved content, subscribe
                               widget, announcement banner, push registration
js/schema/                     shared schema (fields, lists, templates)
js/main.js, css/, images/      original site assets (untouched)
sw.js                          service worker (push + notification click)
admin/                         admin SPA (index.html, admin.js, admin.css)
server/server.js               Express API + static server (local dev)
server/data/                   local data: content, subscribers, settings…
netlify/functions/             the same API as Netlify Functions (17 files)
netlify/_lib/                  shared function code (auth, storage, push…)
netlify.toml                   build + /api/* → functions redirects
tools/stage.js                 builds publish/ + image manifest (npm run stage)
tools/function-server.js       runs the functions locally on :3005 (npm run harness)
tools/api-test.js, e2e-admin.js  test suites for both backends
images/uploads/                local admin uploads (not deployed)
```

## API overview

Identical on both backends (admin calls send `Authorization: Bearer <token>`;
deletes pass `id`/`path` as query params):

| Method & path | Auth | Purpose |
| --- | --- | --- |
| `POST /api/login` · `POST /api/logout` | – | password sign-in, token |
| `GET /api/content` · `PUT /api/content` | read open / write admin | saved content overlay |
| `GET /api/media` · `POST /api/media/upload` · `DELETE /api/media?path=` | admin | media library |
| `GET /api/media/file?path=uploads/…` | – | serve an uploaded image |
| `POST /api/subscribe` | – | public newsletter opt-in |
| `GET /api/subscribers` · `POST /api/subscribers` · `DELETE ?id=` | admin | subscriber management |
| `GET /api/push-key` | – | public VAPID key |
| `POST /api/push-subscribe` · `POST /api/push-unsubscribe` | – | device register/remove |
| `GET /api/messages` | – | active announcements (banner) |
| `GET /api/messages-all` · `POST /api/messages` · `POST /api/messages-toggle` · `DELETE ?id=` | admin | history & broadcast |
| `GET /api/stats` | admin | dashboard numbers |
| `POST /api/password` · `POST /api/password-changed` | admin | password management |

## Testing

Both suites run against either backend and must run **e2e first** (the API
suite ends by locking logins for 5 minutes):

```bash
# Express (local dev server)
npm start
node tools/e2e-admin.js http://localhost:3000
node tools/api-test.js  http://localhost:3000

# Netlify functions (in-memory harness on :3005)
npm run harness
node tools/e2e-admin.js http://localhost:3005
node tools/api-test.js  http://localhost:3005
```

`e2e-admin.js` drives the real admin SPA in jsdom (login, content edit,
upload, subscribers, messages, settings, logout); `api-test.js` checks the
whole API contract (auth, uploads, sniffing, traversal, throttle, password
rotation). It changes the password twice and sets the
`passwordChanged` flag — back up `server/data/settings.json` first if you
care about its state.

## Push notifications

- Visitors opt in via **Enable browser notifications** in the Subscribe widget
  (or the journal page form). Nothing is sent without opt-in.
- VAPID keys are generated on first start and stored with the settings
  (local: `server/data/settings.json`, live: the `data/settings` blob) —
  never share that file.
- Browser notifications require **HTTPS or localhost**.
- Sending prunes expired subscriptions automatically (404/410).

## Security notes

- Admin API needs a bearer token from `POST /api/login`; 5 failed attempts
  lock that IP for 5 minutes. Tokens last 7 days; changing the password
  (with the old one) rotates the credential and invalidates all tokens.
- On Netlify, tokens are stateless signed values — there is no server-side
  session list; the login throttle is stored in Blobs.
- `server/`, `netlify/`, `tools/`, `node_modules/`, `package.json` and data
  files are never served.
- SVG uploads are blocked (script vector); image types are sniffed server-side.
- Uploads are capped at 4 MB; only files under `images/uploads/` can be
  deleted, and path traversal is rejected.
- Content, subscribers, messages are stored as JSON (atomic file writes
  locally, one blob each on Netlify) — back up `server/data/` to back up
  your local copy.

## Troubleshooting

- **`npm.ps1` blocked** (Windows execution policy): use `npm.cmd start`.
- **Port busy**: `PORT=4000 npm.cmd start`.
- **`/api/*` shows "Not found" (404) or "Request failed (502)"**: the live
  site was deployed without functions — drag-and-drop uploads cannot build
  them. Redeploy with `npm run deploy` (Netlify CLI) or a Git-based deploy.
  The admin now shows the server's actual error message instead of a bare
  502; check **Netlify → Logs → Functions** for the full stack.
- **Selector warnings in the editor**: the HTML changed under a schema —
  update the selector in `js/schema/` to match the new markup.
- **Banner not appearing**: the visitor may have dismissed it (stored locally),
  or the message is toggled off in the admin history.
