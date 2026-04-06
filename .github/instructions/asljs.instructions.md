---
applyTo: '**'
---

- **Baseline alignment:**
  - While modifying code, align all changes with `CONVENTIONS.md`.

- **Package-specific rules:**
  - Package name begins with `asljs-` and aligns with its domain (e.g.,
    observable, machine, eventful, money).
  - Keep the public API surface minimal, consistent, and orthogonal; avoid
    leaking internal structures.

- **Documentation requirements:**
  - Keep README, types, and runtime synchronized whenever contracts change.
  - README.md should have following sections:
    - Overview (with reference to ASLJS monorepo)
    - Installation (with link to NPM package).
    - Usage (with examples)
    - API Reference (brief, with links to types)
    - License
