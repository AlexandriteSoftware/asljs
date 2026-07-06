# common

The shared code for ASLJS projects.

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
