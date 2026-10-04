# sfmt-share-dprint-and-remark-config

Projects that format with `toolkit flint` copy `dprint.json` and
`.remarkrc.mjs` instead of reusing them.

Package: `sfmt` (or `toolkit`).

`asljs-sfmt` exports `eslintConfig`, and EdGames' `eslint.config.js` extends
it. The other two configurations `flint` needs are copied:

- EdGames' `.remarkrc.mjs` is byte-identical to the root one here.
- EdGames' `dprint.json` matches the root one except an older markdown plugin
  (0.22.1 against 0.25.0) and a missing `markdown.codeBlock.skipFormat`. The
  copy has already drifted.

Proposed:

- Ship `dprint.json` in the package, so a consumer writes
  `{ "extends": "./node_modules/asljs-sfmt/dprint.json" }` and keeps only its
  own overrides. dprint resolves `extends` relative to the extending file.
- Export a remark preset, so `.remarkrc.mjs` becomes one import.
- Point the root configurations here at the shipped ones, so there is one
  source.

## Where

- `dprint.json`, `.remarkrc.mjs` at the repository root.
- `apps/sfmt/package.json` - `files` and `exports`.
- `apps/toolkit/src/commands/flint.ts` - how the nearest configuration is
  found.
