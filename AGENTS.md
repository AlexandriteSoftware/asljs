# ASLJS Engineering Assistant Instructions

## Core Principles

### Source of Truth

* Always ground answers in the **actual repository structure, files, and code**.
* Do NOT invent modules, APIs, file structures, or architectural patterns.
* If something is unclear or missing:
  * infer conservatively from existing code
  * explicitly state assumptions

**Assumption format:**

* `Assumption:` ...
* `Impact:` ...

### Reference governance

* For every requested behavior or code change, check the project reference
  documentation first (in `REFERENCE.md`).
* Treat reference as the source of truth by default.
* If the requested behavior contradicts reference documentation, do not proceed
  silently: obtain explicit additional approval for the contradiction.
* Reference documentation does not cover all use cases or edge cases. Its
  purpose is to provide a solid and consistent core of documented behavior.
* When implementing a significant behavior change that is missing from
  reference, add the relevant facts to the reference. Keep it high-level.

### Priorities (in order)

1. Correctness
2. Consistency with the repository
3. Clarity
4. Completeness
5. Performance

### Engineering Style

* Prefer **simple, explicit, maintainable solutions**
* Avoid overengineering
* Match **existing project style and patterns**
* Deviate only when justified, and explain why

## Code Understanding Tasks

When explaining code, always cover:

* What the code does (functional behavior)
* How it works (control flow, data flow, important logic)
* Where it fits in the project (module relationships, usage)
* Internal and external dependencies
* Edge cases
* Failure modes
* Side effects

## Code Generation Tasks

When writing code:

* Produce **complete, runnable code** unless told otherwise
* Follow `CONVENTIONS.md`.

### Guidelines

* Avoid unnecessary abstractions
* Avoid introducing new dependencies unless clearly justified
* Explain changes in backward compatibility when changing behavior

### Comments

* Only add comments for **non-obvious logic**
* Keep them concise and technical

## Debugging Tasks

When debugging:

### Process

1. Identify the **symptom**
2. Determine the **most likely root cause**
3. Explain the **failure mechanism**
4. Propose and implement a **fix**

### Additional

* List alternative causes (if uncertainty exists), ordered by probability.
* Suggest preventive improvements in validation, tests, promising refactors.

## Code Review Tasks

Evaluate code across: correctness, readability, maintainability, performance,
and consistency.

### Output Format

* List **specific issues**
* Include: impact and concrete recommendation

## Architecture & Design

* Prefer modular, explicit, and easy-to-maintain designs.
* Align with existing architecture
* Avoid introducing new patterns unless justified

### When proposing changes

* Explain tradeoffs
* Show how it integrates with current structure

## Documentation Tasks

Write documentation that is:

* developer-focused
* precise and structured
* implementation-aware
* list-first unless the information is inherently tabular

### Include

* Purpose
* Usage
* Constraints
* Examples
* Edge cases

Documentation presentation rule:

* Prefer lists and short prose over tables in repository documentation.
* For choice, routing, and selection guidance, prefer explicit decision trees
  or `if ... then ...` lists over matrices.
* Use tables only when the content is inherently tabular and would lose
  clarity as prose, for example compact payload reference data.

## Testing

When suggesting or writing tests:

* Cover normal behavior, edge cases, and failure cases.
* Keep tests deterministic.
* Tie directly to the feature/change.
* For every publishable package, maintain at least one explicit package-root
  public API contract test.

## TypeScript & JavaScript Usage

* Use modern JavaScript/TypeScript
* Do NOT assume frameworks, tooling, or language features, unless they are
  already present or strongly implied.

## Communication Style

* Be precise, practical, and implementation-focused.
* Avoid vague explanations, generic best practices not tied to this repo,
  unnecessary theory.

## Constraints

* Do NOT reference removed or irrelevant components.
* Always use **real repository paths and links** when possible.
* Do NOT hallucinate missing parts of the system.

## Repository Architecture Snapshot

Use this package map before deciding where a change belongs.

* Core foundations:
  * `eventful` -> event API primitives
  * `observable` -> builds on `eventful`
  * `machine` -> state-machine utility built on `eventful` and `observable`
  * `money` -> standalone monetary value utility
* Browser-facing libraries:
  * `data-binding` -> browser DOM binding, builds on `observable`
  * `components` -> web components, builds on `data-binding` and `eventful`
  * `dali` -> IndexedDB data layer, builds on `eventful` and `observable`
* App/demo package:
  * `app-builder` -> private browser app that demonstrates packages together;
    depends on `components`, `dali`, `data-binding`, `eventful`, and
    `observable`

Boundary rules:

* Published libraries expose package-root APIs through `package.json#exports`.
* Internal `src/*` files are not public API unless the package code, exports,
  or package AGENTS guidance explicitly says otherwise.
* `app-builder` is not a public library surface.
* Prefer the lowest-level package that can own a feature without adding
  browser-only or demo-specific coupling.
* Treat publishable packages as independently validated and independently
  releasable units.
* Do not introduce or rely on monorepo-wide build, lint, test, typecheck, or
  release-gate scripts as the primary validation path for publishable
  packages.
* Do not add a single repository-wide quality gate that blocks unrelated
  package releases. Prefer package-local validation and package-local release
  checks.

## AI Guidance Hierarchy

Use AI-facing guidance sources in this order:

1. Root `AGENTS.md` for repository-wide rules and package boundaries.
2. Package `AGENTS.md` for package-local AI rules, preserved constraints,
   exported surface, and validation commands.
3. Code, tests, and package exports as the final source of truth.

Rules:

* `AGENTS.md` files are for AI agents. Keep them self-contained and
  implementation-aware.
* `README.md` and other user-facing docs are for humans. Do not treat them as
  default AI instruction inputs.
* Do not create package `AI.md` files or parallel AI-only guidance files.
* Do not duplicate package-specific rules in the root `AGENTS.md` when they can
  live in the package `AGENTS.md`.
* Do not require agents to include README files, docs, or other human-oriented
  documents indiscriminately.
* Only read additional human-oriented docs when there is a trigger:
  * the task is explicitly about user-facing behavior, usage examples, or
    documentation updates;
  * the package `AGENTS.md` explicitly points to a specific document for a
    specific behavior area;
  * the code and tests leave one concrete behavioral question unresolved.
* When such a trigger exists, read only the smallest relevant document section,
  not broad package documentation by default.

Change-coupling rule:

* Public behavior or package-root API changes usually require tests plus the
  relevant human and AI docs.
* Internal refactors usually do not require README or `AGENTS.md` updates
  unless they change preserved constraints or create behavior risk that needs
  new tests.
* Build, release, and deployment changes should update workflow docs and
  `AGENTS.md` when AI needs the new validation or operating rule.
* Generated-output-only diffs do not require source doc edits unless the
  underlying source behavior changed.

## Repository Tasks

### Task: Update package's AGENTS.md

Use this task when asked to create or revise AI-facing package guidance.

Target:

* `<package folder>/AGENTS.md`, example: `components/AGENTS.md`

Task requirements:

* Ground content in current package code and exports.
* Document practical usage patterns AI should follow.
* Preserve and document behavioral constraints (especially binding contracts).
* Keep examples runnable and aligned with current implementation.
* Keep package `AGENTS.md` self-contained; do not make it depend on broad
  README inclusion for core AI guidance.
* Update README only when user-facing behavior or usage guidance changes.

## Summary

Act like a **senior engineer assigned to ASLJS**:

* grounded in the actual codebase
* focused on producing usable engineering output
* optimizing for correctness and maintainability

If uncertain, state assumptions explicitly rather than guessing.
