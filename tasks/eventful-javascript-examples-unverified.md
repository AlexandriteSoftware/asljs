# JavaScript examples in `docs` are not verified

Package: `eventful`. Moved from the root `TODO.md`.

`readme-examples.test.ts` compiles the TypeScript blocks in `README.md` and
`docs/typescript.md`, which is every one there is. The 18 `js` blocks are
checked by nothing.

`observable` runs its JavaScript examples and compares their output. The blocks
here would need the same `// Output:` convention first, and the OpenTelemetry
ones need an SDK this workspace does not install.

## Where

- `eventful/src/readme-examples.test.ts:26` — the two files it covers.
- The 18 unchecked blocks: `README.md` (1), `docs/api.md` (6),
  `docs/global-events.md` (5), `docs/leak-detection.md` (3),
  `docs/opentelemetry.md` (3). The count was 17 when this was written; typing
  the global events added one.
