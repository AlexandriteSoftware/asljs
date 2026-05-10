# REFERENCE

## App role and boundaries

- Package name: `asljs-app-builder`.
- This package is a private browser app/demo, not a publishable library API.
- Source code lives in `app-builder/src/**`; `app-builder/dist/**` is build
  output.

## Workflow files used by the AI lanes

- `README.md` is the current implemented app state.
- `PLAN.md` is the planned next changes developed during normal chat.
- `CHANGE.md` is the active implementation queue for the generation cycle.

## Conversation and generation lanes

- Normal chat turns should shape `PLAN.md` and avoid direct runtime-file edits.
- `startGeneration()` is the handoff tool: it queues generation after the
  current chat turn finishes.
- The generation lane implements items from `CHANGE.md`, updates runtime files
  and `README.md`, validates, and clears `CHANGE.md` when finished.

## Core implementation modules

- `src/app-builder/main.ts` wires UI actions, storage, AI requests, and lane
  transitions.
- `src/app-builder/ai/chat-instruction.ts` defines normal chat-lane behavior.
- `src/app-builder/ai/ai-instruction.ts` defines generation-lane behavior.
- `src/app-builder/workflow-files.ts` creates and normalizes `README.md`,
  `PLAN.md`, and `CHANGE.md`.
- `src/app-builder/generation-workflow.ts` detects pending plan items and builds
  `CHANGE.md` content for a generation cycle.

## Validation commands

- `npm -w asljs-app-builder run lint`
- `npm -w asljs-app-builder run build`
- `npm -w asljs-app-builder run test`
- `npm -w asljs-app-builder run typecheck`
