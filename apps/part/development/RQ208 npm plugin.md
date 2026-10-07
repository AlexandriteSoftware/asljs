# RQ208 npm plugin

`asljs-part` provides the `NPM Package` and `NPM Dependency` definitions as part
of its package plugin, see [RQ210][RQ210]. Load them with `--definitions
"asljs-part;NPM *"`.

The definitions, their locations, properties and rules are documented in
[NPM Package][2] and [NPM Dependency][1]. The plugin reads the definitions from
those documents, so the documents are the single source of the descriptions,
properties and rule texts; the code provides the locators, the data functions
and the implementation of `NPM Dependency` RL1. Both definitions share one
search for `package.json` files.

Built-in definition documents live in the package `artefacts` folder and are
published with the package. A missing document is an error when the plugin
loads.

[1]: <../artefacts/NPM Dependency.md>
[2]: <../artefacts/NPM Package.md>
[RQ210]: <RQ210 Package plugin.md>
