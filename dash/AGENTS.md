# ASLJS Dash AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-dash`.

This package is a personal performance dashboard: scheduled agents collect
values, an Express server stores them in SQLite, and a static page renders them
as cards. Each project is one config file, and several projects can be loaded at
once. It is a private application, not a published library. Treat it as an app,
not as a public API.

## Package Scope

- Package name: `asljs-dash`
- Visibility: private monorepo package
- Language: JavaScript, ES modules, no TypeScript and no build step
- Runtime: Node for the server and runner, the browser for the page
- Persistence: SQLite through `node:sqlite`, so Node 22 or later
- Only runtime dependency: `express`

Key modules:

- `server.js` — the HTTP surface and the static assets
- `config.js` — the command line, the project configs, and which project a key
  belongs to
- `store.js` — the sticky put, get, history and sweep, one store per project
- `samples.js` — the policy syntax only; which policy applies is `config.js`
- `cron.js` — the cron expression: parse, match, and the next and previous
  minute a schedule fires
- `runner.js` — counter execution and putting stdout
- `dash.js`, `layout.js`, `renderers/*.js` — the page, served as written

## Source Of Truth Map

- `docs/concept.md` owns the design: layers, storage model, value conventions,
  and decisions that are not to be revisited
- `docs/operations.md` owns how to run it, the HTTP API, and backup
- `docs/monitors.md` owns how a monitor is added and configured, the git agent's
  value, and how a project is added
- `README.md` owns the landing page for a first-time reader
- `AGENTS.md` owns AI editing rules for this package

Check `docs/concept.md` before changing behavior. If a request contradicts it,
ask before proceeding rather than changing the design silently.

## Preferred Change Patterns

- Adding a monitor touches `agents/` and one project config — its counter and
  its card. It never touches `server.js`.
- Adding a project is a new config file and a new `--config`; nothing in the
  package changes.
- Data shaping belongs in the agent; drawing belongs in the renderer. If the
  change is about what is shown, edit the agent; about how, edit the renderer.
- Keep the three layers joined only by the HTTP API and the key namespace: the
  server knows nothing about agents, and renderers know nothing about where a
  value came from.
- Keep the page free of a build step: `index.html`, `dash.js`, `layout.js` and
  `renderers/*.js` are served exactly as written, as ES modules.
- Keep the API textual and curl-friendly. Anything doable from PowerShell in one
  line stays that way.
- Resolve paths with `import.meta.dirname`; there is no `__dirname` here. A path
  that comes out of a config resolves against that config's own directory, not
  the package folder.
- Keep the layering `samples.js` <- `config.js` <- `store.js` <- `server.js`.
  `samples.js` reads policy syntax and nothing else, and `store.js` asks
  `config.js` which project a key belongs to.

## Common Wrong Assumptions

- `asljs-dash` is a library with package exports
- the store keeps one row per poll — it appends only when the value changes, so
  samples are not evenly spaced and staleness is `now - seen`, never `now - ts`
- retention only applies on write — it is also swept once a minute, because
  expiry is a clock event
- a key can be unbounded — every field of a policy must be greater than zero
- the runner is required — anything that can issue a `PUT` can feed the store
- the card countdown measures the page's own polling — it measures the counter's
  schedule against the sample's `seen`, so it reads `stale` when nothing is
  running the counters
- the page can import from other workspace packages — it is served unbundled
- there is one database — there is one per project, and a key is routed to its
  project's database by `config.projectOf`
- keys can be scoped per project — the key namespace is global, so a key, a tab
  name and a project name must each be unique across every loaded config

## Constraints To Preserve

- Do not add a bundler, a framework, or a build step.
- Do not add authentication, accounts, sharing, or alert delivery; they are out
  of scope by design.
- Do not serve the databases, `agents/` or the configs as static files, and keep
  database paths and counter commands out of `/api/dashboards`.
- Do not add dependencies without a clear reason; the app is deliberately one
  dependency deep.
- Do not commit a `dash.sqlite` or its `-wal` / `-shm` sidecars; they are
  ignored by `dash/.gitignore` and by the repository root `.gitignore`.

## Change Safety Checklist

- If the sample model changes, then re-check `store.js`, `samples.js`, the chart
  renderer's step plot, and `docs/concept.md` section 5 together.
- If an endpoint changes, then re-check `dash.js`, `runner.js` and
  `docs/operations.md`.
- If the config shape changes, then re-check `config.js`, both
  `dash.config.json` files, `docs/concept.md` section 11 and `docs/monitors.md`.
- If the cron syntax changes, then re-check the configs and `docs/monitors.md`.
- If a renderer's `params` change, then re-check the configs using it and the
  renderer list in `docs/monitors.md` and `docs/concept.md` section 10.
- If a new environment variable is added, then document it in
  `docs/operations.md`.

## Validation

There is no automated test suite in this package yet. Validate changes with:

- `npm -w asljs-dash run lint`
- `npm -w asljs-dash run format`
- `npm -w asljs-dash run start`, then exercise the endpoints with curl
- `npm -w asljs-dash run once` to run every counter and confirm samples land

Lint depends on `asljs-sfmt`, which depends on `asljs-logging`. If `eslint`
cannot resolve them, build their dist output first:

- `npm -w asljs-logging run build:dist`
- `npm -w asljs-sfmt run build:dist`

Update this file when AI-facing constraints, module boundaries, or validation
commands change. Update `README.md` separately only when user-facing behavior
changes, and `docs/` when the documented behavior changes.
