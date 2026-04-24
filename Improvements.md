# Improvements

This document reviews the current `asljs` repository and lists the biggest
improvements that would help long term.

The suggestions are based on the current repository structure and files,
especially:

- root docs such as `README.md`, `DEVELOPMENT.md`, `RELEASE.md`, and
  `AGENTS.md`
- workspace package manifests under each package folder
- GitHub workflows under `.github/workflows`
- shared release utilities in `toolkit.js`
- AI guidance files such as package `AGENTS.md`, `components/AI.md`, and the
  app-builder system prompt in `app-builder/src/app-builder/ai/ai-instruction.ts`

The repo is already in a much better state than a typical small monorepo. The
package boundaries are clearer, package scripts are now mostly consistent, and
CI exists. The next gains are less about fixing obvious breakage and more about
reducing drift, reducing search noise, and making both humans and AI agents
work with less wasted effort.

## Priority Order

If only a few things are done, I would do them in this order:

1. Reduce generated-file noise for humans and AI.
2. Replace duplicated AI guidance with one source of truth.
3. Expand development workflow documentation beyond the current minimal notes.
4. Add targeted local scripts for fast package-level work instead of relying on
   full-repo commands.
5. Formalize architecture decisions and public API stability rules.

## 1. Keep Generated Output Out Of Normal Search And Review Paths

What I observed:

- The repository keeps built app-builder output in `docs/` for GitHub Pages.
- The workflow `.github/workflows/build-app-builder.yml` commits changes under
  `docs/` back to the main branch.
- Search results already include large generated files such as
  `docs/assets/app-*.js`.

This means repo searches can return generated bundle code mixed with source
code. That hurts people and AI in the same way.

Recommended improvement:

Treat generated output as a special area of the repository and make that clear
in tooling and instructions.

Suggested actions:

1. Add explicit repository instructions that `docs/assets/**` is generated and
   should be ignored unless the task is specifically about published demo
   output.
2. Add workspace search exclusions for generated files if that fits the team
   workflow.
3. If possible later, move deployment artifacts to a separate branch or a
   separate publish step instead of committing them into the main source tree.

Why this matters:

Generated files are very expensive context. They are large, noisy, and often
contain minified or bundled versions of the same source logic that already
exists elsewhere.

For AI agents, this creates three concrete problems:

1. Search results become less precise.
2. Context windows get filled with build output instead of real source files.
3. Agents can accidentally inspect or reason about compiled output instead of
   the files that should actually be edited.

For humans, it makes code review harder and makes grep-style discovery less
trustworthy.

Why this is a high-value change:

This is one of the cheapest improvements and one of the fastest ways to make AI
requests more accurate.

It does not require changing the library design. It only requires making the
source-of-truth boundaries more explicit.

Good first step:

Add a file-scoped instruction under `.github/instructions/` for generated
content, with a rule like:

"Treat `docs/assets/**` as generated output. Do not read or edit it unless the
task is about published app-builder output or deployment validation."

## 2. Replace Duplicated AI Guidance With One Source Of Truth Per Package

What I observed:

- The repo has a root `AGENTS.md` and package-level `AGENTS.md` files.
- `components` also has a separate `components/AI.md`.
- The app-builder system prompt imports raw package docs directly, including
  `eventful/README.md`, `observable/README.md`, `data-binding/README.md`,
  `dali/README.md`, and `components/AI.md`.

This means AI-facing knowledge is spread across multiple formats:

- README for human docs
- AGENTS for repository guidance
- AI.md for at least one package
- large prompt text embedded in app-builder

Recommended improvement:

Choose one canonical AI guidance format per package and make everything else
derive from it or reference it.

The cleanest shape would be:

1. `README.md` for human-oriented usage and examples.
2. `AGENTS.md` for AI-oriented package constraints, exported surface, common
   patterns, and validation commands.
3. No extra per-package `AI.md` unless there is a very strong reason.

If app-builder needs smaller prompt inputs, create a generated or manually
maintained short AI reference file with a consistent name for every package,
for example `AI-REFERENCE.md` or `docs/ai-reference.md`.

Why this matters:

Duplicate guidance always drifts over time.

The problem is not only maintenance cost. The bigger problem is that AI gets
conflicting or uneven context.

For example, if one package has `AI.md`, another has only `AGENTS.md`, and the
system prompt imports some READMEs directly, the agent will not learn packages
in a consistent way. That makes output less predictable.

Long-term benefit:

One source of truth improves:

- onboarding
- documentation accuracy
- AI prompt quality
- review quality when behavior changes

It also makes automation possible later. A script can validate that every
package has the same AI documentation shape.

Good first step:

Decide this rule and document it:

"For publishable packages, `AGENTS.md` is the canonical AI-facing package
guide. Any extra AI prompt material must be generated from it or explicitly
linked to it."

After that, retire `components/AI.md` or reduce it to a pointer.

## 3. Add Smaller, File-Scoped Instructions Instead Of Relying Mostly On Root Guidance

What I observed:

The repo now has strong root-level guidance in `AGENTS.md`, but most of the AI
behavior still depends on broad always-on instructions plus package docs.

That is helpful, but it is still coarse.

Recommended improvement:

Add `.github/instructions/*.instructions.md` files for recurring work areas.

Examples:

1. `library-package.instructions.md`
   Apply to `eventful/**`, `observable/**`, `data-binding/**`, `components/**`,
   `dali/**`, `machine/**`, `money/**`.
2. `app-builder.instructions.md`
   Apply to `app-builder/**`.
3. `generated-output.instructions.md`
   Apply to `docs/**`.
4. `release.instructions.md`
   Apply to `RELEASE.md`, `toolkit.js`, and package `package.json` files.

Why this matters:

Always-on instructions are useful for global rules. They are not the best tool
for detailed, context-specific rules.

File-scoped instructions improve AI efficiency because they load only when they
match the active files. That means:

- less irrelevant context
- fewer wrong assumptions
- faster routing to the correct package behavior
- better distinction between library code, app code, generated output, and
  release tooling

Important reasoning:

This is not just an AI convenience feature. It is an architecture expression
tool.

When instructions are scoped to the right folders, they mirror the actual
monorepo boundaries. That makes the repo easier to work with because the rules
follow the code layout.

Good first step:

Create only two instruction files first:

1. one for library packages
2. one for generated output

That gives most of the benefit without adding much maintenance.

## 4. Expand `DEVELOPMENT.md` Into A Real Workflow Guide

What I observed:

`DEVELOPMENT.md` currently contains only squash-and-commit notes.

That is far too small for a monorepo that has:

- multiple publishable libraries
- a browser demo app
- package-level build, lint, test, typecheck, coverage, and watch scripts
- a release process
- AI guidance files

Recommended improvement:

Turn `DEVELOPMENT.md` into the main practical guide for day-to-day work.

It should explain at least:

1. how to install and validate the whole repo
2. how to work on one package quickly
3. which commands to use for common tasks
4. what to edit when public behavior changes
5. how to handle app-builder vs library work
6. how to use AI safely in this repository

Why this matters:

The repo already has good technical structure, but the workflow knowledge is
still mostly implicit.

When workflow knowledge lives only in package scripts and in people’s heads,
three things happen:

1. contributors run larger commands than needed
2. fixes take longer because the narrowest validation path is not obvious
3. AI agents need to rediscover the workflow over and over

What good documentation would change:

A strong `DEVELOPMENT.md` would shorten almost every engineering task because
it would answer questions like:

- "I changed one package, what do I run first?"
- "Do I update README, AGENTS, or both?"
- "How do I work on app-builder without touching library packages?"
- "Which files are generated?"

Good first step:

Add these sections first:

- Repo setup
- Fast local workflows
- Package-only command examples
- Documentation update rules
- Generated files and publish output

## 5. Add Root Scripts For Fast Narrow Work, Not Only Full-Repo Work

What I observed:

At the root, `package.json` currently exposes:

- `build`
- `lint`
- `lint:fix`
- `test`
- `typecheck`

That is good for CI and final validation, but it is not enough for fast local
development.

Package-level `test:watch` exists, but there is no strong root workflow for
using targeted commands quickly.

Recommended improvement:

Add root-level convenience scripts for the common narrow workflows.

Examples:

1. `test:watch:<package>` style wrappers, or a small helper script that accepts
   a package name.
2. `typecheck:package <name>` helper.
3. `lint:package <name>` helper.
4. `build:package <name>` helper.
5. optional `validate:package <name>` helper that runs the normal package gate.

Why this matters:

The current setup makes the correct narrow command possible, but not obvious.

That difference matters. Teams and AI both default to the easiest visible
command. If the easiest visible command is the full monorepo check, people will
run expensive commands more often than needed.

Important reasoning:

Fast feedback changes behavior.

When the narrow validation path is easy, contributors validate more often.
That usually improves quality because mistakes are caught earlier, before the
change spreads across multiple files or packages.

This also helps AI agents because they can validate the touched slice first,
which is the cheapest and most informative check.

Good first step:

Add one helper script rather than many wrappers. For example, a root script or
small node tool that runs package-local commands by package folder name.

## 6. Do Not Treat Root `test:watch` As A Workspace Broadcast Problem

What I observed:

Package manifests include `test:watch`, but there is no good root story for
watch mode across the monorepo. In practice, long-running watch commands are
not the same kind of problem as one-shot CI commands.

Recommended improvement:

Design watch mode as an explicitly targeted workflow, not a broad workspace
broadcast command.

Good options:

1. a helper that starts watch mode for one package
2. a helper that starts watch mode for one package plus its direct dependents
3. documented VS Code tasks for common watch workflows

Why this matters:

Watch mode is interactive and long-lived. Workspace-wide command fan-out works
well for short commands. It works poorly for persistent processes.

If the repo treats watch mode the same way as CI-style commands, the result is
usually confusing terminals, unclear ownership, and wasted machine time.

Long-term benefit:

This makes the local development cycle feel much more intentional.

Instead of saying "watch everything", the repo would say:

- "watch this package while editing it"
- "watch this app while developing UI"
- "watch these tests for this slice"

That is faster and easier to teach to AI.

Good first step:

Document the repo rule:

"Use watch mode at package scope. Do not run a monorepo-wide watch fan-out by
default."

## 7. Add Lightweight Architecture Decision Records

What I observed:

The root `README.md` and `AGENTS.md` now describe package boundaries and
dependencies well. That is a strong base.

What is still missing is a simple place to record design decisions over time.

Examples of decisions that deserve a permanent home:

- why package-root exports are the only public boundary
- why `app-builder` is private and not a library API
- why browser-only code belongs only in certain packages
- why live views in `dali` have the current semantic limits
- why event semantics are object-based rather than `EventTarget`-based

Recommended improvement:

Add a small `docs/architecture/adr/` folder with lightweight ADR files.

These do not need to be academic. They can be short and practical.

Each ADR should say:

1. the decision
2. why it was made
3. what alternatives were considered
4. what must stay true because of that decision

Why this matters:

Architecture diagrams explain shape. ADRs explain intent.

Without intent, future changes can slowly weaken the design even if each small
change looks reasonable at the time.

This is especially important in a monorepo of libraries, because consistency is
part of the product.

AI benefit:

ADRs are excellent AI context because they explain why certain edits should not
be made casually. They reduce accidental architectural drift.

Good first step:

Create only three ADRs first:

1. public API boundary policy
2. browser-only package placement policy
3. app-builder role and non-goals

## 8. Add Public API Contract Checks At The Package Level

What I observed:

Several packages already have tests that verify package-root exports. That is a
good start.

Recommended improvement:

Make public API contract checks a standard requirement for every publishable
package.

That can be done with small tests that verify:

1. what the root package exports
2. which documented behaviors are stable
3. which constraints are intentionally preserved

Why this matters:

In a library repo, accidental public API drift is one of the most expensive
mistakes. It causes downstream breakage and forces documentation cleanup later.

The current repo is already disciplined about package-root exports. Contract
checks are the next logical step because they make that discipline automatic.

Long-term reasoning:

This is not about adding lots of tests. It is about adding a small number of
high-value tests that protect the library boundary.

That kind of test gives much better long-term return than many internal tests
that simply restate implementation details.

Good first step:

Write down a repo rule:

"Every publishable package should have at least one explicit public API test at
the package root level."

## 9. Make Release Workflows More Repeatable And Less Manual

What I observed:

`RELEASE.md` is clear, and `toolkit.js` already helps with clean checks and tag
creation. That is good.

The release process is still fairly manual:

- set env vars manually
- bump version manually
- commit manually
- publish manually
- push tag manually

Recommended improvement:

Wrap the release flow in one guided script or a small set of guided commands.

Examples:

1. `npm run release:package -- eventful patch`
2. `node toolkit.js release --workspace eventful --bump patch`
3. a dry-run mode that validates everything before publish

Why this matters:

Manual release steps are error-prone even when documented well.

The main risks are:

- wrong package selected
- wrong version bump
- forgotten validation step
- forgotten tag push
- inconsistent release habits across packages

AI benefit:

AI is much safer when release flows are explicit and scripted. A script reduces
room for interpretation.

That means better automation, safer assisted releases, and clearer recovery if
something fails.

Good first step:

Add a non-publishing dry-run command first. That gives safety without changing
the actual publish behavior immediately.

## 10. Add Coverage Reporting That Produces Actionable Output

What I observed:

Packages already have `coverage` scripts, but the current output is mostly a raw
coverage directory and a message telling the user to use another tool for
reports.

Recommended improvement:

Turn coverage into a report people can actually use.

Options:

1. add a small reporting tool and emit text-summary plus HTML
2. add root aggregation later if useful
3. add a light threshold only for core packages once the signal is trusted

Why this matters:

Coverage is useful only when it helps decision making.

Right now the repo can collect coverage data, but it does not yet turn that
data into a normal part of development feedback.

That means the feature exists technically, but is weaker in practice.

Important reasoning:

This should not become a bureaucracy tool. The goal is not to chase a number.
The goal is to make missing edge-case tests visible.

That is especially useful for packages like `eventful`, `observable`, and
`dali`, where subtle behavioral contracts matter a lot.

Good first step:

Choose one package and make its coverage output readable before standardizing it
repo-wide.

## 11. Build A Smaller, Structured AI Knowledge Layer For App Builder

What I observed:

The app-builder system prompt is large and embeds a lot of raw reference text.
It imports package docs directly and mixes behavior rules, tool protocol,
package guidance, and generation strategy into one large prompt.

Recommended improvement:

Split app-builder AI context into layers:

1. stable system rules
2. tool contract
3. package capability summaries
4. app-specific behavior rules

The package capability summaries should be short, structured, and consistent.
They should focus on:

- exported APIs
- important constraints
- preferred patterns
- things to avoid

Why this matters:

Large mixed prompts are harder to maintain and harder to reason about.

When one prompt contains everything, small updates become risky because it is
easy to break unrelated guidance or create contradictions.

Shorter structured inputs are also cheaper in tokens and easier for the model
to use correctly.

Long-term benefit:

This would improve:

- generation accuracy
- maintainability of AI prompts
- ability to test prompt behavior
- ability to reuse the same package knowledge in more than one AI flow

Good first step:

Create a small normalized AI reference format for one package and have
app-builder consume that instead of a full raw README.

## 12. Define A Clear Rule For When README, AGENTS, And Tests Must Change Together

What I observed:

The repo already follows this idea informally in several places. Package
`AGENTS.md` files often say to update `README.md` when behavior changes.

Recommended improvement:

Promote this into a repo-wide rule with a simple matrix.

Example:

- public behavior changed -> update tests, README, and AGENTS
- internal refactor only -> update tests if behavior risk exists, docs optional
- build/release behavior changed -> update workflow docs and AGENTS if AI needs
  to know
- generated output only changed -> do not edit source docs unless behavior also
  changed

Why this matters:

This removes uncertainty.

A lot of engineering drag comes from small repeated questions like:

- "Do I need to update docs for this?"
- "Is this an AI-guidance change or just a code change?"
- "Should this package README mention this detail?"

When the rule is explicit, contributors and agents spend less time deciding and
more time doing.

Good first step:

Put the matrix in `DEVELOPMENT.md` and repeat the short version in
`AGENTS.md`.

## 13. Add A Thin Repo Memory For Repeated AI Pitfalls

What I observed:

The repository now has some good guidance, but it does not yet seem to capture
repeated AI failure patterns in a compact, reusable way.

Examples of likely recurring pitfalls in this repo:

- editing generated `docs/assets/**` instead of source
- treating `app-builder` as a publishable library
- bypassing package-root exports
- changing browser-only packages in ways that add server assumptions
- changing binding semantics in `data-binding` without updating contract docs

Recommended improvement:

Create a short "AI pitfalls" section in the root guidance or a dedicated
instruction file.

Each entry should be short:

- pitfall
- why it is wrong here
- what to do instead

Why this matters:

Good AI guidance is often less about telling the model what to do and more
about stopping the same wrong moves from happening again.

A compact pitfall list is high value because it prevents known bad paths early.

Good first step:

Start with five pitfalls only. Keep them concrete and repository-specific.

## 14. Separate Source Documentation From Operational Documentation More Clearly

What I observed:

The root documentation set exists, but the division of responsibility is still
light:

- `README.md` mixes overview and architecture
- `DEVELOPMENT.md` is too small
- `RELEASE.md` is release-focused
- `AGENTS.md` is AI-focused

The pieces are good, but the operating model is not yet fully explicit.

Recommended improvement:

Use a clearer documentation split:

1. `README.md`
   What the repo is, package map, high-level architecture.
2. `DEVELOPMENT.md`
   How contributors work locally.
3. `RELEASE.md`
   How packages are shipped.
4. `AGENTS.md`
   How AI should behave in the repo.
5. `docs/architecture/*`
   Durable design decisions and deeper technical rationale.

Why this matters:

When each document has a clear job, it is easier to keep them short and keep
them accurate.

That helps both humans and AI. It also lowers the cost of documentation
updates, because contributors know exactly where a new fact belongs.

Good first step:

Add a short "Document map" section near the top of the root `README.md` or
`DEVELOPMENT.md`.

## Suggested Implementation Plan

If these improvements are taken on gradually, this order gives a good balance
between value and effort:

### Phase 1: Fast wins

1. Mark generated output as generated in AI instructions.
2. Expand `DEVELOPMENT.md` with real local workflow guidance.
3. Decide the canonical AI guidance format for packages.
4. Add a short repo-wide rule for when docs and tests must change together.

### Phase 2: Better developer speed

1. Add targeted root helper scripts for package-local work.
2. Define package-scoped watch workflows.
3. Improve coverage output readability.

### Phase 3: Better long-term architecture control

1. Add lightweight ADRs.
2. Standardize public API contract tests.
3. Script more of the release workflow.

## Final Summary

The repository does not need a big redesign.

The strongest opportunities are operational:

- make source-of-truth boundaries clearer
- reduce generated-file noise
- reduce duplicated AI guidance
- make narrow workflows easier than full-repo workflows
- record architectural intent so future changes do not slowly erode it

Those changes would make the repository easier to maintain, easier to onboard
into, and noticeably better for AI-assisted work over time.
