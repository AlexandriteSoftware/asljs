# toolkit

Repository maintenance commands for ASLJS projects, run as
`toolkit <action>`. Not published.

The package is a workspace, so npm links its `toolkit` binary into
`node_modules/.bin`, and its `prepare` script builds `dist` on install. Every
workspace script reaches it by name rather than by path.

`asljs-logging` and `asljs-locator` are workspaces too, and they resolve only
from their own `dist`, which a fresh clone does not have. So `prepare` builds
their `dist` first, `asljs-logging` before `asljs-locator`, which imports it.

## Notes

The `all` [npm script][21] runs `build:dist` straight after `clean`, because
`clean` removes the toolkit's own `dist` and `flint` runs through the toolkit.

```pwsh
npm run clean `
&& npm run build:dist `
&& npm run flint `
&& npm run typecheck `
&& npm run build `
&& npm run test
```

[21]: package.json
