# Dependencies

How the workspace packages depend on each other: solid edges for `dependencies`,
dotted edges for `devDependencies`. The graph is generated from the `NPM
Package` artefacts of `asljs-part`, starting from the root `package.json` and
its workspaces:

```pwsh
npm -w asljs-part run build:dist
npx part diagram --definitions "asljs-part;NPM Package" docs/Dependencies.md --write
```

`--check` in place of `--write` fails when the graph below is out of date.

## Nodes

- Definitions: NPM Package
- Label: Name

## Root

- Artefacts: package.json
- Follow: Workspaces

## Edges

### Workspaces

- Style: invisible

### Dependencies

### DevDependencies

- Style: dotted

## Layout

- Direction: LR
- Group: folder

## Diagram

```mermaid
graph LR
  subgraph gapps["apps"]
    napps_app_builder_package_json["asljs-app-builder"]
    napps_cog_package_json["asljs-cog"]
    napps_dash_package_json["asljs-dash"]
    napps_kb_package_json["asljs-kb"]
    napps_part_package_json["asljs-part"]
    napps_sfmt_package_json["asljs-sfmt"]
    napps_toolkit_package_json["asljs-toolkit"]
  end
  subgraph glibs["libs"]
    nlibs_components_package_json["asljs-components"]
    nlibs_dali_package_json["asljs-dali"]
    nlibs_data_binding_package_json["asljs-data-binding"]
    nlibs_eventful_package_json["asljs-eventful"]
    nlibs_locator_package_json["asljs-locator"]
    nlibs_logging_package_json["asljs-logging"]
    nlibs_machine_package_json["asljs-machine"]
    nlibs_money_package_json["asljs-money"]
    nlibs_observable_package_json["asljs-observable"]
    nlibs_testing_package_json["asljs-testing"]
    nlibs_tmpdir_package_json["asljs-tmpdir"]
  end
  naftefacts_package_json["asljs-artefacts"]
  npackage_json["asljs"]
  naftefacts_package_json --> napps_part_package_json
  naftefacts_package_json -.-> nlibs_testing_package_json
  naftefacts_package_json -.-> nlibs_tmpdir_package_json
  naftefacts_package_json -.-> napps_toolkit_package_json
  napps_app_builder_package_json --> nlibs_components_package_json
  napps_app_builder_package_json --> nlibs_dali_package_json
  napps_app_builder_package_json --> nlibs_data_binding_package_json
  napps_app_builder_package_json --> nlibs_eventful_package_json
  napps_app_builder_package_json --> nlibs_observable_package_json
  napps_app_builder_package_json -.-> nlibs_testing_package_json
  napps_app_builder_package_json -.-> napps_toolkit_package_json
  napps_cog_package_json --> nlibs_locator_package_json
  napps_cog_package_json --> nlibs_logging_package_json
  napps_cog_package_json -.-> nlibs_testing_package_json
  napps_cog_package_json -.-> napps_toolkit_package_json
  napps_dash_package_json -.-> napps_toolkit_package_json
  napps_kb_package_json --> nlibs_logging_package_json
  napps_kb_package_json -.-> nlibs_testing_package_json
  napps_kb_package_json -.-> nlibs_tmpdir_package_json
  napps_kb_package_json -.-> napps_toolkit_package_json
  napps_part_package_json --> nlibs_locator_package_json
  napps_part_package_json --> nlibs_logging_package_json
  napps_part_package_json -.-> nlibs_testing_package_json
  napps_part_package_json -.-> nlibs_tmpdir_package_json
  napps_part_package_json -.-> napps_toolkit_package_json
  napps_sfmt_package_json --> nlibs_logging_package_json
  napps_sfmt_package_json -.-> nlibs_testing_package_json
  napps_sfmt_package_json -.-> napps_toolkit_package_json
  napps_toolkit_package_json --> nlibs_locator_package_json
  napps_toolkit_package_json --> nlibs_logging_package_json
  napps_toolkit_package_json -.-> nlibs_testing_package_json
  napps_toolkit_package_json -.-> nlibs_tmpdir_package_json
  nlibs_components_package_json --> nlibs_data_binding_package_json
  nlibs_components_package_json --> nlibs_eventful_package_json
  nlibs_components_package_json --> nlibs_observable_package_json
  nlibs_components_package_json -.-> nlibs_testing_package_json
  nlibs_components_package_json -.-> napps_toolkit_package_json
  nlibs_dali_package_json --> nlibs_eventful_package_json
  nlibs_dali_package_json --> nlibs_observable_package_json
  nlibs_dali_package_json -.-> nlibs_testing_package_json
  nlibs_dali_package_json -.-> napps_toolkit_package_json
  nlibs_data_binding_package_json --> nlibs_observable_package_json
  nlibs_data_binding_package_json -.-> nlibs_eventful_package_json
  nlibs_data_binding_package_json -.-> nlibs_testing_package_json
  nlibs_data_binding_package_json -.-> nlibs_tmpdir_package_json
  nlibs_data_binding_package_json -.-> napps_toolkit_package_json
  nlibs_eventful_package_json -.-> napps_toolkit_package_json
  nlibs_locator_package_json --> nlibs_logging_package_json
  nlibs_locator_package_json -.-> nlibs_testing_package_json
  nlibs_locator_package_json -.-> nlibs_tmpdir_package_json
  nlibs_locator_package_json -.-> napps_toolkit_package_json
  nlibs_logging_package_json -.-> napps_toolkit_package_json
  nlibs_machine_package_json --> nlibs_eventful_package_json
  nlibs_machine_package_json --> nlibs_observable_package_json
  nlibs_machine_package_json -.-> napps_toolkit_package_json
  nlibs_money_package_json -.-> napps_toolkit_package_json
  nlibs_observable_package_json --> nlibs_eventful_package_json
  nlibs_observable_package_json -.-> napps_toolkit_package_json
  nlibs_testing_package_json --> nlibs_logging_package_json
  nlibs_testing_package_json -.-> napps_toolkit_package_json
  nlibs_tmpdir_package_json --> nlibs_logging_package_json
  nlibs_tmpdir_package_json -.-> nlibs_testing_package_json
  nlibs_tmpdir_package_json -.-> napps_toolkit_package_json
  npackage_json ~~~ naftefacts_package_json
  npackage_json ~~~ napps_app_builder_package_json
  npackage_json ~~~ napps_cog_package_json
  npackage_json ~~~ napps_dash_package_json
  npackage_json ~~~ napps_kb_package_json
  npackage_json ~~~ napps_part_package_json
  npackage_json ~~~ napps_sfmt_package_json
  npackage_json ~~~ napps_toolkit_package_json
  npackage_json ~~~ nlibs_components_package_json
  npackage_json ~~~ nlibs_dali_package_json
  npackage_json ~~~ nlibs_data_binding_package_json
  npackage_json ~~~ nlibs_eventful_package_json
  npackage_json ~~~ nlibs_locator_package_json
  npackage_json ~~~ nlibs_logging_package_json
  npackage_json ~~~ nlibs_machine_package_json
  npackage_json ~~~ nlibs_money_package_json
  npackage_json ~~~ nlibs_observable_package_json
  npackage_json ~~~ nlibs_testing_package_json
  npackage_json ~~~ nlibs_tmpdir_package_json
  npackage_json -.-> napps_sfmt_package_json
  npackage_json -.-> nlibs_tmpdir_package_json
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
