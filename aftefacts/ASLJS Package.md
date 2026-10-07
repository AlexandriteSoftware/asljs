# ASLJS Package

ASLJS Package, published to npm. The artefact is the package's `package.json`;
the package folder is the folder that holds it.

## Location

- Pattern: `../{libs,apps}/*/package.json`
- Exclude: `../apps/toolkit/package.json`
- GitIgnore

## Properties

### LocalDeps

- Type: Artefact[]

The `package.json` of each local `asljs-*` package this package depends on.

## Rules

### RL1

A published package does not ship test helpers. No directory named `testing`
appears anywhere in `dist`, because `tsconfig.dist.json` excludes every
`testing` directory under `src`, and anything still emitted from there was
dragged in by a published file importing it. Checks a built `dist` only; there
is nothing to report before one exists.
