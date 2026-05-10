# App Builder Dual-Channel Workflow Plan

## Goal

Replace the current single staged README conversation loop with a two-lane
workflow:

- `README.md` is the current app state and source of truth.
- `PLAN.md` is the next pending changeset being discussed in chat.
- `CHANGE.md` is the active implementation queue for the running generation
  cycle.

The host app must support a chat lane and a generation lane at the same time.
Chat can continue while generation is running, but generation only consumes the
snapshot moved into `CHANGE.md` at the moment generation starts.

## Explicit Decisions

- Scrap auto-selection of models.
- Use explicit model dropdowns per lane:
  - chat lane dropdown below the chat input
  - generation lane dropdown below the files/preview area
- Keep OpenAI model discovery on startup so the dropdowns can be populated from
  real available models.
- Preserve direct-file commands as an escape hatch when the user explicitly
  asks to modify a specific file or asset outside the normal
  `PLAN.md -> CHANGE.md -> README.md` cycle.

## Current Baseline

- Host control path is still single-lane in
  `src/app-builder/main.ts` via `handleGenerate()`.
- Generated-app workflow and prompt rules still assume README-driven staging in
  `src/app-builder/ai/ai-instruction.ts`.
- The current UI only has one chat send control and one preview refresh/run
  button in `src/app-builder/index.html`.

## Target Workflow

### Chat lane

- Reads project files and current workflow files.
- Can edit `PLAN.md`.
- Can request or start a generation cycle.
- Must not modify arbitrary app files during normal chat turns.

### Generation lane

- Uses `CHANGE.md` as the active implementation queue.
- Implements changes one by one.
- Removes completed changes from `CHANGE.md`.
- Updates `README.md` to match implemented app state.
- Cannot start its own nested generation cycle.
- Can be stopped by the host.

### File lifecycle

- New or empty apps should contain:
  - `README.md`
  - `PLAN.md`
  - `CHANGE.md`
- When generation starts:
  - lock the current `PLAN.md` snapshot for that cycle
  - transform that snapshot into actionable items in `CHANGE.md`
  - clear or unlock the cycle snapshot while allowing new chat changes to keep
    accumulating in `PLAN.md`
- When generation completes:
  - `README.md` reflects implemented state
  - `CHANGE.md` is cleared
  - `PLAN.md` keeps any newly accumulated post-start changes

## Implementation Phases

## Phase 1: Planning And File Scaffolding

Status: in progress

- Add this plan file.
- Bootstrap `README.md`, `PLAN.md`, and `CHANGE.md` for new apps and for
  existing apps when opened.
- Add helper functions for reading, creating, and updating workflow files.
- Add host state for:
  - chat request in flight
  - generation request in flight
  - generation stop requested
  - generation status text
  - current generation cycle snapshot metadata

## Phase 2: Split UI Controls

Status: not started

- Replace the current single chat send strip with:
  - chat model dropdown
  - chat send button
- Add a separate generation control strip below the editor/preview area with:
  - generation model dropdown
  - generation start button
  - generation stop button
  - generation status text
- Prevent generation start when chat is currently waiting for a response.

## Phase 3: Chat-Lane Tool Restrictions

Status: not started

- Add a chat-specific AI prompt.
- Add a chat-lane tool surface that allows:
  - reading files
  - editing `PLAN.md`
  - optionally reading `CHANGE.md`
  - requesting generation start
- Prevent normal chat turns from editing arbitrary app runtime files.
- Preserve explicit direct-file commands as a host-detected bypass path.

## Phase 4: Generation-Lane Execution

Status: not started

- Add generation-lane prompt rules centered on `CHANGE.md` execution.
- Start generation by copying the current develop snapshot into `CHANGE.md`.
- Run implementation work against `CHANGE.md` and app files.
- Update `README.md` as changes are implemented.
- Clear completed items from `CHANGE.md`.
- Finish with `CHANGE.md` empty and generation status reset.

## Phase 5: Artifact Alignment

Status: not started

- Update `README.md` package docs.
- Update `src/app-builder/ai/ai-instruction.ts`.
- Update host UI hints in `index.html`.
- Update samples if they depend on the old README-only staging rules.
- Keep prompt docs and host behavior aligned.

## Phase 6: Tests

Status: not started

- Add host tests for workflow-file bootstrapping.
- Add tests for generation-start gating.
- Add tests for model dropdown population.
- Add tests for chat/generation lane status transitions.
- Add prompt/contract tests for `PLAN.md` and `CHANGE.md` usage.

## Progress Log

- [x] Plan created.
- [ ] Workflow files bootstrapped automatically.
- [ ] Separate chat and generation controls rendered.
- [ ] Chat lane restricted to workflow-safe edits.
- [ ] Generation lane consumes `CHANGE.md`.
- [ ] Prompts and docs aligned.
- [ ] Tests added for the new workflow.

## First Implementation Slice

The first code slice should do the following without attempting the full prompt
rewrite in one jump:

1. Add workflow-file helpers and automatic bootstrapping.
2. Add separate chat and generation UI controls with explicit per-lane model
   dropdowns.
3. Add host generation state and start/stop scaffolding.
4. Leave a clear seam for the later chat-lane and generation-lane prompt split.

This gives the repository a stable host-level foundation before changing the AI
contracts in a broader second slice.
