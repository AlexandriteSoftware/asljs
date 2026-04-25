# ADR 0002: Browser-Only Package Placement Policy

## Status

Accepted

## Decision

Browser-only behavior belongs only in packages whose role is explicitly browser
facing:

- `data-binding`
- `components`
- `dali`
- `app-builder`

Core foundations should remain framework-agnostic and usable outside a browser
context:

- `eventful`
- `observable`
- `machine`
- `money`

## Why

The current repository already separates cross-environment foundations from
browser-facing layers. Keeping that split makes the package map coherent and
prevents browser assumptions from leaking downward into reusable core packages.

This also keeps dependency direction clear:

- browser-facing packages may depend on lower-level core packages
- core packages should not need DOM, IndexedDB, custom elements, or browser
  runtime assumptions

## Alternatives Considered

### Allow browser APIs in any package when convenient

Rejected because convenience at edit time would create long-term coupling and
weaken the package hierarchy.

### Collapse browser-facing behavior into app-builder only

Rejected because `data-binding`, `components`, and `dali` are intended as
publishable libraries with clear browser-facing roles.

## Consequences

- DOM binding logic should stay in `data-binding`.
- Web component behavior should stay in `components`.
- IndexedDB and live browser storage behavior should stay in `dali`.
- Demo-specific browser flows should stay in `app-builder`.
- If a feature can live in a lower-level non-browser package, prefer that
  placement over adding browser coupling higher up only by habit.

## Must Stay True

- Core packages remain free of unnecessary browser-only dependencies.
- Dependency direction continues to point from higher-level browser packages to
  lower-level foundations, not the reverse.
- Package placement decisions should preserve the current boundary between core
  reusable primitives and browser-facing behavior.
