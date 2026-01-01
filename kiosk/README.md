# asljs-kiosk

Build a single HTML file by inlining a JavaScript entrypoint into a kiosk HTML
template.

## CLI

After installing:

- `asljs-kiosk`

Or without installing:

- `npx asljs-kiosk`

### Examples

- Build `app.html` from `app.js`:
  - `asljs-kiosk ./app.js`

- Write to a specific file:
  - `asljs-kiosk ./app.js --out ./public/index.html`

- Print to stdout:
  - `asljs-kiosk ./app.js --out -`

- Watch and rebuild on changes:
  - `asljs-kiosk ./app.js --watch`

## API

- `renderKioskHtml({ scriptSource, title? })`
