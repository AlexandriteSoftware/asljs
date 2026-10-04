# data-binding-docs-layout

The package's reference material lives in the README, `REFERENCE.md` is
empty, and there is no `docs` directory for the root `AGENTS.md` to point at.

Package: `data-binding`.

The root `AGENTS.md` says a package's `docs/` owns its behaviour and is the
source of truth to check before changing it. `libs/data-binding` has no
`docs/`. What it has:

- `README.md`, which carries the whole surface: binding syntax per family,
  reactivity rules, the pipe list, error handling, nullish rules. Its level 2
  headings (`Public Exports`, `Binding Contract At A Glance`,
  `Unsupported Syntax`, `Choosing The Right Binding Family`,
  `Safe Authoring Rules`, `Binding Syntax`, `Built-ins`, `Error Handling`,
  `API Reference`, `Related Packages`) fail the `Package README` artefact's
  `RL1` and `RL2`, and `Unsupported Syntax` is the "not supported" list that
  artefact asks to express as scope instead.
- `REFERENCE.md`, two lines: a heading and nothing else. `components`,
  `machine` and `app-builder` fill theirs.
- `AGENTS.md`, which repeats the README's quick reference rather than adding
  AI-facing constraints beyond it.

The effect on this review was that several behaviours had no documented
answer to check against: what a property binding does with a nullish value,
what `safeHtml` does, what `default` treats as absent, what `this` is inside
an action, whether the root element's own attributes are bound (they are not).
Each is now its own task; this one is the structural fix that gives those
answers a home.

Proposed layout, matching `libs/observable`:

- `README.md` trimmed to the artefact's sections, with one example per binding
  family and links onward.
- `docs/bindings.md` for the syntax and reactivity rules per family, including
  the context rules now in the README.
- `docs/pipes.md` for the built-ins, their arguments, nullish handling,
  locale and time zone.
- `REFERENCE.md` either filled with the export list and signatures or deleted,
  since an empty file misleads more than a missing one.

## Where

- `libs/data-binding/README.md` - the headings and the reference content.
- `libs/data-binding/REFERENCE.md` - empty.
- `libs/data-binding/AGENTS.md` - the duplicated quick reference.
- `aftefacts/Package README.md` - `RL1`, `RL2` and the scope-not-negation
  rule.
