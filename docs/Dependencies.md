# Dependencies

```mermaid
graph TD
  eventful[asljs-eventful]
  observable[asljs-observable]
  databinding[asljs-data-binding]
  components[asljs-components]
  dali[asljs-dali]
  machine[asljs-machine]
  money[asljs-money]
  locator[asljs-locator]
  part[asljs-part]
  appbuilder[asljs-app-builder]

  eventful --> observable
  observable --> databinding
  databinding --> components
  eventful --> components
  eventful --> dali
  observable --> dali
  eventful --> machine
  observable --> machine
  locator --> part
  components --> appbuilder
  dali --> appbuilder
  databinding --> appbuilder
  eventful --> appbuilder
  observable --> appbuilder
```

## Overrides

`glob` is pinned to `^13.0.6` across the whole tree by `overrides` in the root
`package.json`.

The four packages that use it directly, `cog`, `kb`, `part` and `sfmt`, already
ask for that major. `remark-validate-links`, which `flint` runs, reaches
`glob@^10` through `unified-engine` and again through `@npmcli/config`, and
version 10 is deprecated, so `npm i` printed one deprecation warning per path.

There is no upgrade to take instead: `remark-validate-links@13.1.0` and
`unified-engine@11.2.2` are the current releases, and `unified-engine` still
asks for `^10`. All three consumers import only `glob` and `hasMagic`, both
still exported by 13, which is why forcing the major is safe here.

Remove the override once `unified-engine` and `@npmcli/config` move off
`glob@10`.
