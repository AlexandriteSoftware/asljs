# RQ208 npm plugin

`asljs-part` provides the `NPM Dependency` definition as part of its package
plugin, see [RQ210][RQ210]. Load it alone with `--definitions "asljs-part;NPM
Dependency"`.

The definition, its locations, properties and rules are documented in
[NPM Dependency][1]. The plugin reads the definition from that document, so the
document is the single source of the description, properties and rule texts; the
code provides the locator, the data function and the implementation of RL1.

Built-in definition documents live in the package `artefacts` folder and are
published with the package. A missing document is an error when the plugin
loads.

[1]: <../artefacts/NPM Dependency.md>
[RQ210]: <RQ210 Package plugin.md>
