# RQ111 CLI Definitions parameter

The CLI loads definitions from the sources given with the `--definitions`
parameter. The parameter can be repeated; sources load in the given order and
their definitions are merged. Without `--definitions` and without
`PART_DEFINITIONS` (see [RQ112][RQ112]) there are no definitions.

```pwsh
part check --definitions artefacts --definitions asljs-part/plugins/npm
```

A source is one of:

- a folder without `package.json` - md-only: its `*.md` files and those of its
  subfolders are definitions when their level 1 heading matches the file name
  (see [Artefact Definition][1]); `.gitignore`d files are skipped. No rule has
  an implementation;
- a folder with `package.json` - plugin library: its package entry
  (`exports['.']`, else `main`) is imported as a plugin. A library without an
  entry is an error;
- a file - plugin file, imported as a plugin;
- anything else - a package specifier, e.g. `asljs-part/plugins/npm`, resolved
  from the project root first, then from the `asljs-part` package.

A value that is absolute, starts with `.`, or names an existing path is a path,
resolved from the working directory. A path that does not exist is an error.

A plugin provides all of its definitions; the `*.md` files of a library are read
only when the plugin reads them. See [RQ207 Plugin][RQ207].

Definition names are unique across all sources; a clash is an error.

[1]: <../artefacts/Artefact Definition.md>
[RQ112]: <RQ112 CLI Definitions environment variable.md>
[RQ207]: <RQ207 Plugin.md>
