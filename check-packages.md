# check-packages

Rows that `npm outdated` reports permanently. They are understood, and none of
them should be actioned without revisiting the reason below.

## @babel/parser

- `Latest` is the `latest` dist tag, not the highest published version. Babel
  leaves that tag on the 7.x line for the parser, while `@babel/generator` moved
  it to 8.x. The two rows disagree for that reason alone.
- The installed 8.0.6 is the newest published version. Installing `latest` is a
  downgrade to 7.29.9, across a major boundary, backwards.
- Keep the `^8.0.4` range. The row never clears, because `Current` cannot equal
  a `Latest` that is below it.

## typescript

- TypeScript 7.0 ships without the programmatic compiler API
  (`ts.createProgram`, `ts.transform`, `ts.factory`). `typescript-eslint` parses
  through that API, so its peer range stops below 6.1 and npm refuses the
  install. Forcing it past the peer check crashes in
  `@typescript-eslint/typescript-estree` instead.
- The configuration itself is ready: the workspaces typecheck under 7.0.2
  unchanged. The blocker is the lint toolchain, and `sfmt`, which parses with
  `@typescript-eslint/typescript-estree` directly.
- Revisit when TypeScript 7.1 restores the API and `typescript-eslint` releases
  support for it.

## @mermaid-js/mermaid-cli

- 12.0.0 pulls `mermaid` 12, which pulls `chevrotain` 11.1.2, which depends on
  `lodash-es` at exactly 4.17.23. That version carries 6 high severity
  advisories, and the exact pin means the patched 4.18.1 cannot satisfy it.
- `part` only runs `mmdc -i -o -q`, and those flags are unchanged in 11.
- Keep the `^11.16.0` range until `mermaid` moves off that `chevrotain`.
