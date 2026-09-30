# observable-tracer-ships-in-dist

`tracer.ts` ships in `dist/`.

Package: `observable`. Moved from the root `TODO.md`.

It is a test helper, unexported from `index.ts`, and adds dead weight plus a
`.d.ts` to the published package. Move it somewhere `tsconfig.dist.json`
excludes.

The shared `tsconfig.dist.json` includes `src/**/*.ts` and excludes only
`src/**/*.test.ts`, so a helper that is not a test file is published. Whatever
the fix is, it decides the rule for every other package's helpers too.

## Where

- `observable/dist/tracer.js` and `observable/dist/tracer.d.ts` — the output.
- `tsconfig.dist.json` — the include and exclude that put it there.
