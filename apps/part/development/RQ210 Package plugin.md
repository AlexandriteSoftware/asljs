# RQ210 Package plugin

The default export of the `asljs-part` package root is a plugin factory. The
plugin, named `asljs-part`, provides every definition documented in the
package's `artefacts` folder, e.g. `Artefact Definition`, `Git Tag` and `NPM
Dependency`, with the locators, data functions and rule implementations of the
built-in definitions ([RQ208][RQ208], [RQ209][RQ209]). The package does not
export the built-in definitions as separate plugins.

It loads as any definition source, see [RQ111][RQ111]:

- `--definitions asljs-part` - as a package specifier;
- `--definitions .` inside the package folder - as a plugin library, whose entry
  is the package root.

A definition filter picks some of its definitions, e.g. `--definitions
"asljs-part;NPM *,GIT *;GIT Commits"`.

[RQ111]: <RQ111 CLI Definitions parameter.md>
[RQ208]: <RQ208 npm plugin.md>
[RQ209]: <RQ209 git plugin.md>
