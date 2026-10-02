# ASLJS Package

ASLJS Package, published to npm.

## Location

- Pattern: `../{libs,apps}/*/`
- Exclude: `../apps/toolkit/`
- GitIgnore

## Properties

### LocalDeps

- Type: Artefact[]

Local dependencies.

## Rules

### RL1

A published package does not ship test helpers. No directory named `testing`
appears anywhere in `dist`, because `tsconfig.dist.json` excludes every
`testing` directory under `src`, and anything still emitted from there was
dragged in by a published file importing it. Checks a built `dist` only; there
is nothing to report before one exists.
