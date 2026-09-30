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

Key internal modules:

- `src/app-builder/state.ts`
- `src/app-builder/storage.ts`
- `src/app-builder/ai/*`
- `src/app-builder/preview.ts`
- `src/app-builder/main.ts`

## AI System Layers

Keep these layers distinct when editing the package:

- host app behavior in `app-builder/src/**`
- generator system prompt in `src/app-builder/ai/ai-instruction.ts`
- host-side conversation state and kickoff behavior in `src/app-builder/main.ts`
- conversation transcript and README snapshot helpers in
  `src/app-builder/ai/conversation-loop.ts`
- imported package AI guides used as generator context
- generated-app tool protocol and runtime validation rules

## Source Of Truth Map

- `README.md` owns human-facing package behavior and workflow
- `AGENTS.md` owns AI editing rules for the app-builder package itself
- `src/app-builder/ai/ai-instruction.ts` owns generated app behavior rules
- `src/app-builder/ai/AGENTS.md` owns AI-subsystem architectural notes that
  are specific to the prompt loop and transcript contract
- imported package `AGENTS.md` files own library semantics for generator
  context

Do not treat app-builder docs as the canonical source for library package
semantics when the package-local guide exists.

## Preferred Change Patterns

- Keep the app fully static and browser-based.
- Preserve the local-first model: app data stays in IndexedDB and does not
  require a server.
- Limit network activity to the AI request flow already described by the app.
- Prefer changes in the existing module boundaries instead of adding new app
  layers.
- Keep preview execution sandboxed in the iframe flow.
- Preserve the PLAN-first conversation loop: clarify, update PLAN, ask the next
  question, ask permission to implement, then queue generation.
- Preserve short-term conversation context across turns so follow-up replies
  like "yes" or "2 players" still make sense.
- Treat direct user edits to `README.md` as real product-definition input.
- Treat direct user edits to `PLAN.md` as real pending-change input.
- Keep assistant wording simple unless the user clearly wants more technical
  detail.

## Common Wrong Assumptions

- `app-builder` is a public library API
- generated app behavior is the same thing as host app behavior
- prompt edits only matter when host runtime code also changes
- imported package guides are part of the host app public API
- built `app-builder/dist/` output is the primary editing surface
- the AI call is naturally stateful across turns without host-side transcript
  support
- `PLAN.md` can be skipped and implementation can start directly from vague chat

## Constraints To Preserve

- Do not turn this package into a public library or add package exports unless
  explicitly requested.
- Do not introduce server-side assumptions into storage, preview, or AI flows.
- Build output is staged into `app-builder/dist/`, then the deployment
  workflow force-pushes that output to the `pages` branch root.
- Keep imports and code compatible with the repo ESM conventions.

## Safe Prompt Maintenance Guide

- keep prompt rules grouped by purpose
- avoid mixing host-app rules with generated-app rules
- prefer package-local AI references over ad hoc special-case doc paths
- update nearby docs when generator behavior expectations change

## Change Safety Checklist

- If prompt changes package usage rules, then re-check imported package
  guidance.
- If prompt changes the staged chat loop, then re-check `main.ts` and
  `conversation-loop.ts` together.
- If prompt changes generated file expectations, then re-check README and
  tests.
- If prompt changes tool protocol, then re-check the generated app contract.
- If prompt changes validation rules, then re-check diagnostics and repair-loop
  docs.
- If you change the README snapshot file name or workflow, then update the
  prompt, host helper, and docs in the same slice.

## Related Package Routing

- library semantics for `eventful` belong to `eventful/AGENTS.md`
- library semantics for `observable` belong to `observable/AGENTS.md`
- binding syntax belongs to `data-binding/AGENTS.md`
- component usage belongs to `components/AGENTS.md`
- IndexedDB live-data behavior belongs to `dali/AGENTS.md`

## Validation

Use the package scripts when validating changes:

- `npm -w asljs-app-builder run dev`
- `npm -w asljs-app-builder run build`
- `npm -w asljs-app-builder run lint`
- `npm -w asljs-app-builder run test`
- `npm -w asljs-app-builder run typecheck`

If a change affects published demo output, rebuild `app-builder/dist/`
locally and verify the deployment workflow contract still matches the `pages`
branch publish flow.
Update this file when AI-facing app constraints, module boundaries, or
validation commands change. Update `README.md` separately only when
user-facing app behavior or usage changes.
