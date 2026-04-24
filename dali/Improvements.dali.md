# Improvements For asljs-dali

This review answers two questions for `asljs-dali`.

This package already has substantial documentation. The main AI improvement is
not adding basic explanations. It is making the boundaries between similar
features clearer, so agents stop guessing about semantics such as local vs
remote observation, live vs snapshot reads, and client-side filtering vs query
composition.

## 1. How to make it more suitable for an AI agent without looking for extra information?

### Current situation

The package already has strong local guidance:

- `README.md` explains `Table`, cross-tab observation, and live views
- `AGENTS.md` captures constraints such as local-only `notify(...)` and the
  limits of `record(...)` and `recordset(...)`
- `package.json` confirms the package-root public surface

That is a strong base. The package is still easy for AI to misread because it
contains several features that look similar at first glance:

- `notify(...)` vs `observe(...)`
- `getOne(...)` / `scan(...)` vs `record(...)` / `recordset(...)`
- client-side predicate filtering vs database query semantics
- local transaction behavior vs cross-tab broadcast behavior

Suggested improvements:

### 1. Add a "choose this API when..." decision table

This package would benefit greatly from a short selection matrix.

Examples:

- one-time single-row read: `getOne(key)`
- one-time filtered scan: `scan(predicate)`
- live single-row tracking: `record(key)`
- live filtered tracking: `recordset(predicate)`
- local-only mutation notifications: `notify(...)`
- local plus remote committed notifications: `observe(...)`

Reasoning:

AI often understands each feature separately but still guesses wrong about the
best API to use in a given situation. A decision table reduces that ambiguity.

### 2. Add a short "public contracts" section near the top

The most important stable behaviors should be highlighted early.

Good candidates:

- `notify(...)` is local-only
- `observe(...)` includes remote committed changes
- broadcasts happen only after successful commit
- remote messages are not re-published
- `record(key)` is key-based only
- `recordset(predicate)` is client-side predicate filtering only

Reasoning:

These are high-value behaviors that an AI must not accidentally weaken during
refactors or usage changes.

### 3. Add a "what this package does not provide" section

This should explicitly say that the package does not promise:

- joins
- server-style query planners
- DB-level query composition through `recordset(...)`
- automatic ordering semantics for live sets
- re-publishing of remote messages

Reasoning:

AI tends to fill in missing capabilities based on similar data libraries. This
package should make its non-features explicit so the agent does not invent a
larger abstraction than the package actually provides.

### 4. Add a compact exported-surface summary

The README has a long API section, which is useful, but a grouped export
overview near the top would help AI discover the right layer faster.

Suggested groups:

- DB helpers
- table and live view APIs
- version and delete strategies
- transaction helpers
- broadcast/observe types
- event-source and saga helpers

Reasoning:

This package is large enough that grouped discoverability matters. AI should be
able to locate the right feature family without scanning the full README.

### 5. Add a package-local edit-safety checklist

Suggested checklist:

- if touching observation, re-check `notify(...)` vs `observe(...)`
- if touching live views, re-check snapshot alternatives and stated limits
- if touching broadcast handling, re-check post-commit only behavior and echo
  suppression
- if touching version strategies, re-check documented conflict behavior
- if touching live containers, re-check their eventful and observable surfaces

Reasoning:

This package has many connected contracts. A short change checklist would make
AI-driven edits safer.

### 6. Add one end-to-end example for each major usage lane

The README already has several strong examples. It would be even better if the
main lanes were clearly separated as canonical examples:

- table CRUD
- cross-tab observe
- live record
- live recordset
- version strategy use

Reasoning:

AI often copies the most complete nearby example. Canonical lane-specific
examples reduce the need to stitch features together from several sections.

## 2. How to make the information about the package more useful for AI agents so they guess less, make less errors, and improve discoverability and usage?

Current situation:

The package information is already quite good. The main remaining issue is that
the package spans several concepts, and the relationships between them are not
yet expressed as a simple concept map.

An AI agent wants to answer questions like:

- is this read snapshot or live?
- is this notification local or also remote?
- is this filtering client-side or database-level?
- when do broadcasts happen?
- when should I use a lower-level transaction helper instead of `Table<T>`?

### Suggested improvements

### 1. Add a package concept map near the top

For example:

- `dbOpen` / `dbDelete` set up databases
- `Table<T>` is the main high-level abstraction
- `notify(...)` / `observe(...)` handle committed change notifications
- `record(...)` / `recordset(...)` provide live-first containers
- transaction helpers support lower-level control
- strategies customize concurrency and deletion behavior

Reasoning:

AI uses top-of-file framing heavily. A concept map reduces the chance that the
agent misclassifies a feature family.

### 2. Add a "common wrong assumptions" section

This package has several likely AI mistakes.

Good entries would be:

- `recordset(predicate)` is not a database query planner
- `notify(...)` does not include remote tab changes
- `observe(...)` does not re-broadcast remote changes
- live views do not imply joins or rich query composition
- broadcast delivery happens after commit, not during tentative mutations

Reasoning:

These are exactly the kinds of mistakes that arise when AI merges ideas from
ORMs, Rx-based stores, and sync frameworks.

### 3. Add a stronger routing guide to neighboring packages

Examples:

- for event primitives, see `asljs-eventful`
- for path watching and reactive property access, see `asljs-observable`
- for DOM binding on top of observable models, see `asljs-data-binding`

Reasoning:

Good package discoverability also means helping the AI stop using `dali` when
the concern really belongs to a lower or higher layer.

### 4. Add a limitations section near each live API

The README already mentions some limitations, which is good. Make them more
structured and more visible.

For `record(key)`:

- key-based only
- single-record semantics

For `recordset(predicate)`:

- client-side predicate only
- no joins
- no DB-level query composition
- ordering is not the point of the abstraction

Reasoning:

AI tends to generalize live data abstractions into richer query systems unless
the limits are made very direct.

### 5. Add a glossary for key package terms

Useful terms to define:

- committed change
- local notification
- observed event
- live view
- origin echo suppression
- optimistic concurrency
- soft delete strategy

Reasoning:

The package uses precise concepts. Making the vocabulary explicit would improve
AI consistency and reduce semantic blending.

### 6. Add a "safe usage rules" section for application authors

This should guide AI when it is writing app code that uses `dali`.

For example:

- use `Table<T>` before dropping to raw transaction helpers
- prefer snapshot reads unless reactivity is actually needed
- use `observe(...)` only when remote-origin changes matter
- dispose live views when they are no longer needed
- do not describe `recordset(predicate)` as a full query engine

Reasoning:

Usage guidance is just as important as implementation guidance because AI will
often use this package from app code rather than edit the package internals.

## Recommended first changes

If only a few changes are made, I would do these first:

1. Add a decision table for snapshot vs live and local vs remote observation.
2. Add a strong "common wrong assumptions" section.
3. Add a grouped public-surface summary near the top.
4. Add explicit limitations blocks for `record(...)` and `recordset(...)`.

## Summary

`asljs-dali` already contains a lot of the right information. The next step is
to make its similar-looking features easier to distinguish quickly.

The package should help an AI answer these questions immediately:

- is this snapshot or live?
- is this local-only or local-plus-remote?
- is this client-side filtering or database query semantics?
- what is guaranteed about broadcast timing?
- when should I use a different layer?

If those answers become easier to scan, AI agents will guess less, misuse fewer
APIs, and describe the package more accurately in application code and edits.
