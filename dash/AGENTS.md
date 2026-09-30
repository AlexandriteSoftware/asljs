# ASLJS Dash AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-dash`.

This package is a personal performance dashboard: scheduled agents collect
values, an Express server stores them in SQLite, and a static page renders them
as cards. It is a private application, not a published library. Treat it as an
app, not as a public API.

## Package Scope

- Package name: `asljs-dash`
- Visibility: private monorepo package
- Language: JavaScript, ES modules, no TypeScript and no build step
- Runtime: Node for the server and runner, the browser for the page
- Persistence: SQLite through `node:sqlite`, so Node 22 or later
- Only runtime dependency: `express`

Key modules:

- `server.js` — the HTTP surface and the static assets
- `store.js` — the sticky put, get, history and sweep
- `samples.js` — per-key persistence policy parsed from `samples.json`
- `runner.js` — cron parsing, agent execution, and putting stdout
- `dash.js`, `layout.js`, `renderers/*.js` — the page, served as written

## Source Of Truth Map

- `docs/concept.md` owns the design: layers, storage model, value conventions,
  and decisions that are not to be revisited
- `docs/operations.md` owns how to run it, the HTTP API, and backup
- `docs/monitors.md` owns how a monitor is added and configured
- `README.md` owns the landing page for a first-time reader
- `AGENTS.md` owns AI editing rules for this package

Check `docs/concept.md` before changing behavior. If a request contradicts it,
ask before proceeding rather than changing the design silently.

## Preferred Change Patterns

- Adding a monitor touches `agents/`, `cronfile`, `dashboards.json` and
  sometimes `samples.json`. It never touches `server.js`.
- Data shaping belongs in the agent; drawing belongs in the renderer. If the
  change is about what is shown, edit the agent; about how, edit the renderer.
- Keep the three layers joined only by the HTTP API and the key namespace: the
  server knows nothing about agents, and renderers know nothing about where a
  value came from.
- Keep the page free of a build step: `index.html`, `dash.js`, `layout.js` and
  `renderers/*.js` are served exactly as written, as ES modules.
- Keep the API textual and curl-friendly. Anything doable from PowerShell in one
  line stays that way.
- Resolve paths with `import.meta.dirname`; there is no `__dirname` here.

## Common Wrong Assumptions

- `asljs-dash` is a library with package exports
- the store keeps one row per poll — it appends only when the value changes, so
  samples are not evenly spaced and staleness is `now - seen`, never `now - ts`
- retention only applies on write — it is also swept once a minute, because
  expiry is a clock event
- a key can be unbounded — every field of a policy must be greater than zero
- the runner is required — anything that can issue a `PUT` can feed the store
- the page can import from other workspace packages — it is served unbundled

## Constraints To Preserve

- Do not add a bundler, a framework, or a build step.
- Do not add authentication, accounts, sharing, or alert delivery; they are out
  of scope by design.
- Do not serve `dash.sqlite`, `agents/`, `cronfile`, `samples.json` or
  `dashboards.json` as static files.
- Do not add dependencies without a clear reason; the app is deliberately one
  dependency deep.
- Do not commit `dash.sqlite` or its `-wal` / `-shm` sidecars; they are ignored
  by `dash/.gitignore`.

## Change Safety Checklist

- If the sample model changes, then re-check `store.js`, `samples.js`, the chart
  renderer's step plot, and `docs/concept.md` section 5 together.
- If an endpoint changes, then re-check `dash.js`, `runner.js` and
  `docs/operations.md`.
- If the cron syntax changes, then re-check `cronfile` and `docs/monitors.md`.
- If a renderer's `params` change, then re-check `dashboards.json` and the
  renderer list in `docs/monitors.md`.
- If a new environment variable is added, then document it in
  `docs/operations.md`.

## Validation

There is no automated test suite in this package yet. Validate changes with:

- `npm -w asljs-dash run lint`
- `npm -w asljs-dash run format`
- `npm -w asljs-dash run start`, then exercise the endpoints with curl
- `npm -w asljs-dash run once` to run every agent and confirm samples land

Lint depends on `asljs-sfmt`, which depends on `asljs-logging`. If `eslint`
cannot resolve them, build their dist output first:

- `npm -w asljs-logging run build:dist`
- `npm -w asljs-sfmt run build:dist`

Update this file when AI-facing constraints, module boundaries, or validation
commands change. Update `README.md` separately only when user-facing behavior
changes, and `docs/` when the documented behavior changes.
