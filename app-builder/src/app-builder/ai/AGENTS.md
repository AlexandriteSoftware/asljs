# App Builder AI Subsystem Guidance

Use this file when editing `src/app-builder/ai/*` or the host wiring that makes
the AI loop work.

## Scope

- `ai-instruction.ts` defines the generated-app agent behavior.
- `conversation-loop.ts` defines host-side kickoff text, transcript shaping,
  and the stable README snapshot file name.
- `main.ts` is responsible for preserving recent chat turns so the AI can
  understand short follow-up answers.

## Conversation Architecture

This subsystem is intentionally split across host code and prompt rules.

- The host app owns short-term conversation memory for the open app.
- The generator prompt owns the staged behavior: clarify, update README, ask
  the next question, request implementation approval, implement, test, and ask
  whether the result works.
- The generated app itself remains tool-driven and does not get hidden access
  to host chat state.

Do not remove the host-side transcript shaping unless you replace it with an
equivalent stateful input model. Without that context, short answers like
"yes" or "2 players" become ambiguous.

## README Contract

- `README.md` is the live vision document for the current loop.
- `.README.md` is the last completed README snapshot.
- During clarification and implementation, keep `.README.md` unchanged.
- Only refresh `.README.md` after implementation or repair work is done
  and tested.
- Direct user edits to `README.md` are intentional requirements.

## User Language Profile

- Default to simple, child-friendly wording.
- Use one clear question at a time.
- Become more technical only when the user's vocabulary shows they want it.

## Change Safety

- Keep `main.ts`, `conversation-loop.ts`, and `ai-instruction.ts` aligned.
- If you change the loop stages, update package docs and prompt tests.
- If you change the snapshot file name, update every reference in code, tests,
  and docs together.
