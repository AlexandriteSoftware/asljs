# Improvements For asljs-app-builder

This review answers two questions for `asljs-app-builder`.

This package is different from the other packages in the repo. It is not a
publishable library. It is a browser-only app and also an AI-driven system that
generates other apps. That means its long-term AI quality depends not only on
the package docs, but also on the prompt structure and the way package
knowledge is imported into that prompt.

## 1. How to make it more suitable for an AI agent without looking for extra information?

### Current situation

The package already has useful local guidance:

- `README.md` explains the app purpose, local-first model, build, and Pages
  deployment
- `AGENTS.md` explains package boundaries and preserved constraints
- `src/app-builder/ai/ai-instruction.ts` contains the actual system prompt that
  shapes generated app behavior

That is better than many AI-assisted apps. The main issue is that the true AI
contract is spread across three different layers:

- package docs
- package AI guidance
- embedded system prompt text

An AI working on the package itself may still need to read all three before it
fully understands the intended behavior.

Suggested improvements:

### 1. Add a single "AI architecture" section to the README

This section should explain, in simple terms:

- what the app does
- where the AI prompt lives
- where runtime app state lives
- where storage lives
- how generated apps are validated
- which parts are host app behavior vs generated app behavior

Reasoning:

Right now, the package README explains the app well, but it does not yet give a
single clear map of the AI system itself. That makes the package harder for AI
agents to navigate safely.

### 2. Add a compact "source of truth" map

The package should say explicitly which file owns which responsibility.

For example:

- `README.md`: human-facing package behavior and workflow
- `AGENTS.md`: AI rules for editing the app-builder package itself
- `ai-instruction.ts`: system prompt for generated app behavior
- imported package guides: library capability context used by the generator

Reasoning:

This package has more than one AI-related document. Without an ownership map,
AI agents can easily edit the wrong file or assume one file automatically covers
another.

### 3. Replace raw imported package docs with smaller structured AI references

The current system prompt imports raw package docs such as README or `AI.md`
content. That works, but it is heavy and inconsistent.

Recommended long-term shape:

- give each package one short structured AI reference
- have app-builder import those smaller normalized references

Reasoning:

Large raw imported docs increase prompt size and also mix human explanation with
AI decision support. Smaller structured references would make generation more
stable and easier to maintain.

### 4. Stop depending on `components/AI.md` as a special case

The prompt currently imports `components/AI.md`, while other packages are pulled
from README files. That is inconsistent.

Reasoning:

Special-case documentation paths are easy to forget and easy to drift. The
package should consume package knowledge through one consistent convention.

### 5. Add a package-local checklist for prompt changes

Suggested checklist:

- if prompt changes package usage rules, re-check imported package guidance
- if prompt changes generated file expectations, re-check README and tests
- if prompt changes tool protocol, re-check the generated app contract
- if prompt changes validation rules, re-check diagnostics and repair loop docs

Reasoning:

Prompt edits can have wide effects even when the code change is small. A short
checklist would reduce accidental drift.

### 6. Add one explicit "what this package is not" section

Examples:

- not a published library
- not a server-backed app platform
- not a generic code assistant shell
- not a source of truth for library package behavior beyond the imported package
  docs

Reasoning:

This helps AI keep package boundaries intact and avoid dragging server-side or
library-oriented assumptions into the app-builder package.

## 2. How to make the information about the package more useful for AI agents so they guess less, make less errors, and improve discoverability and usage?

Current situation:

The package information is reasonably good, but the discoverability problem here
is different from the library packages.

The challenge is not only understanding the app-builder package. The challenge
is also understanding:

- how the app-builder should be edited
- how the generated apps should behave
- how package knowledge is fed into the model

### Suggested improvements

### 1. Add a dedicated "AI system layers" section

This section should explain the layers in order:

1. host app package behavior
2. generator system prompt
3. imported ASLJS package knowledge
4. generated-app tool protocol
5. generated-app validation loop

Reasoning:

AI works better when layered systems are explained as layers. Right now that
knowledge exists, but it is mostly implied across several files.

### 2. Add a "common wrong assumptions" section

Good entries would be:

- `app-builder` is not a public library API
- generated app behavior is not the same thing as host app behavior
- prompt edits can change generated output without changing host runtime code
- imported package docs are part of generator context, not part of host app API
- built `docs/` output is generated and should not be treated as primary source

Reasoning:

This package touches several layers at once. Wrong assumptions here can produce
confusing edits very quickly.

### 3. Add a stronger generated-output boundary section

The package should state clearly:

- source lives in `app-builder/src/**`
- build output goes to repository `docs/`
- generated build output is not the main editing surface

Reasoning:

This matters for both humans and AI. Without that boundary, an agent may inspect
or edit built assets instead of source.

### 4. Add a prompt-input inventory

The package should document exactly what the system prompt consumes.

For example:

- imported package docs
- host context values like `openAiApiKey`
- generated app tool contract
- generated app runtime validation rules

Reasoning:

Prompt maintenance is safer when the inputs are listed explicitly instead of
being discoverable only by reading the prompt source.

### 5. Add a safe maintenance guide for AI prompt editing

This guide should tell AI agents how to update the prompt safely.

Examples:

- keep prompt rules grouped by purpose
- avoid mixing host-app rules with generated-app rules
- prefer structured short references over large raw imported docs
- update nearby docs when behavior expectations change

Reasoning:

Prompt files are easy to grow in a way that stays functional but becomes harder
to reason about. A maintenance guide would reduce that risk.

### 6. Add routing guidance to the library packages

The package should explain that library semantics still belong to the library
package docs.

For example:

- `eventful` semantics belong to `eventful`
- `observable` semantics belong to `observable`
- `data-binding` syntax belongs to `data-binding`
- component usage belongs to `components`
- IndexedDB live data behavior belongs to `dali`

Reasoning:

This improves discoverability by keeping the app-builder package from becoming a
second, drifting documentation system for the whole repo.

## Recommended first changes

If only a few changes are made, I would do these first:

1. Add an AI architecture section to `README.md`.
2. Add a source-of-truth map for prompt, host app, and imported package docs.
3. Replace raw imported package docs with smaller structured references over
   time.
4. Add a common wrong assumptions section to `AGENTS.md`.

## Summary

`asljs-app-builder` already has a strong base, but its AI-related knowledge is
spread across too many layers without one simple map.

The package should help an AI answer these questions immediately:

- am I editing the host app, the generator prompt, or generated-app behavior?
- which file owns which truth?
- where does library package knowledge come from?
- what is generated output vs source?
- what assumptions about this package are wrong?

If those answers become explicit, AI agents will guess less, make fewer
cross-layer mistakes, and maintain the package more safely over time.
