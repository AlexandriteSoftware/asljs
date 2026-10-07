# Options

Options every `part` action takes. They can appear anywhere after the action, as
`--name value` or `--name=value`.

## Definitions

`--definitions <source>` loads definitions from a source. Repeat it for several
sources; they load in order and a definition name must be unique across them.
Without `--definitions`, `PART_DEFINITIONS` is used: entries separated by
newlines or `|`. Without either, there are no definitions.

A source is:

- a folder without `package.json` - its `*.md` files, and those of its
  subfolders, are definitions when their level 1 heading matches the file name;
- a folder with `package.json` - a plugin library, whose package entry is
  imported as a plugin;
- a `.js` file - a plugin;
- anything else - a package, e.g. `asljs-part`, resolved from the project root.

A source may be followed by `;<include>;<exclude>`, comma-separated definition
name globs, case-insensitive:

```bash
part inventory --definitions "asljs-part;NPM *,Git *;Git Commits"
```

## Project

`--project <path>` sets the project root, where artefacts are looked for and
which relative locations start from. `PART_PROJECT` sets it when the option is
not given; the default is the working directory.

## Logging

`part` is silent unless asked. `--loglevel <level>` (`trace`, `debug`,
`information`, `warning`, `error`) turns logging on, `--logfile <target>` sends
it to a file, `stdout` or `stderr`, and `--logformat <format>` picks `auto`,
`json`, `text` or `pretty`. `PART_LOG_LEVEL`, `PART_LOG_FILE` and
`PART_LOG_FORMAT` do the same.

Warnings that do not stop an action, e.g. a diagram reference to a missing
artefact, show with `--loglevel warning`.

## See also

- [RQ111 CLI Definitions parameter][RQ111] and
  [RQ112 CLI Definitions environment variable][RQ112].
- [RQ132 CLI Project parameter][RQ132] and
  [RQ133 CLI Project environment variable][RQ133].
- [RQ131 CLI Logging][RQ131].

[RQ111]: <../development/RQ111 CLI Definitions parameter.md>
[RQ112]: <../development/RQ112 CLI Definitions environment variable.md>
[RQ131]: <../development/RQ131 CLI Logging.md>
[RQ132]: <../development/RQ132 CLI Project parameter.md>
[RQ133]: <../development/RQ133 CLI Project environment variable.md>
