# ADR 0001: Public API Boundary Policy

## Status

Accepted

## Decision

For publishable packages in `asljs`, the public API boundary is the package root
export defined by `package.json#exports`.

Internal `src/*` files are implementation details unless the package code,
exports, or package-specific AI guidance explicitly says otherwise.

## Why

The repository contains multiple independently releasable libraries. A stable
package-root boundary keeps those libraries predictable to use and safer to
change.

This boundary is already reflected in the current repository structure:

- package manifests export package-root entrypoints only
- root documentation describes package-root exports as the public surface
- package-level guidance treats internal source files as non-public by default

## Alternatives Considered

### Allow direct `src/*` imports as an informal public surface

Rejected because it would make refactors much harder and would blur the line
between implementation detail and supported API.

### Use multiple public entrypoints per package by default

Rejected because the current repository does not need that complexity and it
would increase release and compatibility burden.

## Consequences

- Public API changes should happen through package-root exports.
- Refactors inside `src/*` can remain package-internal unless they change the
  package-root surface.
- Tests that verify package-root exports are high-value contract checks.
- Documentation should describe public behavior at the package boundary, not at
  arbitrary internal file paths.

## Must Stay True

- Published libraries expose their supported API through `package.json#exports`.
- Internal source layout may change without implying a public API change.
- Package release decisions should be made per package, against its own public
  boundary.
