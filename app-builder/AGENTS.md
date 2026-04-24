# ASLJS App Builder AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-app-builder`.

This package is the GitHub Pages front page and interactive demo for ASLJS. It
is a private, browser-only, local-first application. Treat it as an app, not a
published library API.

## Package Scope

- Package name: `asljs-app-builder`
- Visibility: private monorepo package
- Runtime: browser only, static assets built by Vite
- Persistence: IndexedDB via `asljs-dali`
- Reactive state: `asljs-observable`

Key internal modules documented by the README:

- `src/app-builder/state.ts`
- `src/app-builder/storage.ts`
- `src/app-builder/ai/*`
- `src/app-builder/preview.ts`
- `src/app-builder/main.ts`

## Preferred Change Patterns

- Keep the app fully static and browser-based.
- Preserve the local-first model: app data stays in IndexedDB and does not
  require a server.
- Limit network activity to the AI request flow already described by the app.
- Prefer changes in the existing module boundaries instead of adding new app
  layers.
- Keep preview execution sandboxed in the iframe flow.

## Constraints To Preserve

- Do not turn this package into a public library or add package exports unless
  explicitly requested.
- Do not introduce server-side assumptions into storage, preview, or AI flows.
- Build output is staged into the repository-level `docs/` folder, then the
  deployment workflow force-pushes that output to the `pages` branch root.
- Keep imports and code compatible with the repo ESM conventions.

## Validation

Use the package scripts when validating changes:

- `npm -w asljs-app-builder run dev`
- `npm -w asljs-app-builder run build`
- `npm -w asljs-app-builder run test`
- `npm -w asljs-app-builder run typecheck`

If a change affects published demo output, rebuild `docs/` locally and verify
the deployment workflow contract still matches the `pages` branch publish flow.
