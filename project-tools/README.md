# project-tools

Repository maintenance commands for ASLJS projects, run as
`project-tools <action>`. Not published.

The package is a workspace, so npm links its `project-tools` binary into
`node_modules/.bin`, and its `prepare` script builds `dist` on install. Every
workspace script reaches it by name rather than by path.

## Notes

The `all` [npm script][21] has `build:dist` twice because the first `build:dist`
is to ensure that the `dist` folder is up to date before running `clean`.

Second `npm run build:dist` follows `npm run clean` to ensure that
the toolkit and other scripts (e.g., `eslint`-related) are available for the subsequent commands.

```pwsh
npm run format `
&& npm run build:dist `
&& npm run clean `
&& npm run build:dist `
&& npm run build `
&& npm run typecheck `
&& npm run lint `
&& npm run test `
&& npm run build:dist
```

[21]: <package.json>
