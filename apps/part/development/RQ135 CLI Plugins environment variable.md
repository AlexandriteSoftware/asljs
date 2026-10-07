# RQ135 CLI Plugins environment variable

When environment variable `PART_PLUGINS` is set, the CLI loads the plugins it
lists. Entries are separated by the platform path delimiter: `;` on Windows, `:`
elsewhere. Empty entries are ignored.

CLI parameter `--plugin` has higher priority than the environment variable: when
at least one `--plugin` is given, `PART_PLUGINS` is not used.

Entries are resolved as described in [RQ134][RQ134].

[RQ134]: <RQ134 CLI Plugin parameter.md>
