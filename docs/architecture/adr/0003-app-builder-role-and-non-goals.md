# ADR 0003: App Builder Role And Non-Goals

## Status

Accepted

## Decision

`app-builder` is a private browser application and demo surface for the
repository. It is not a publishable library API and should not define the
public contract of the reusable packages.

Its role is to demonstrate packages working together in a local-first browser
application.

## Why

The repository contains both publishable libraries and one demo app. Treating
`app-builder` as an app keeps the library boundaries clear and avoids turning
demo internals into accidental public API.

The current repository already reflects this:

- `app-builder` is marked private
- root documentation lists it as an app or demo package
- it depends on several published libraries rather than serving as their API
  boundary
- it builds static output for GitHub Pages deployment

## Alternatives Considered

### Treat app-builder as another published package

Rejected because its purpose is demonstration and integration, not a reusable
library contract.

### Move all repository-specific integration examples into package READMEs only

Rejected because a working demo app is useful for validating how packages fit
together in practice.

## Consequences

- Internal modules under `app-builder/src/app-builder/*` remain app internals.
- Changes in `app-builder` do not automatically imply public API changes in the
  publishable libraries.
- Demo-specific shortcuts or AI flows should stay in `app-builder`, not leak
  into lower-level package APIs unless there is a clear reusable need.
- Deployment decisions for `app-builder` can optimize for the demo without
  redefining release expectations for libraries.

## Non-Goals

- `app-builder` is not a shared runtime foundation for the libraries.
- `app-builder` is not the place to expose package internals as public API.
- `app-builder` should not introduce server-side assumptions into library
  packages just to support demo behavior.

## Must Stay True

- `app-builder` remains private unless an explicit repository-level decision
  changes that status.
- Package-root exports of publishable libraries stay separate from app-builder
  implementation details.
- Demo integration remains valuable, but it does not override the library-first
  package boundaries of the repository.
