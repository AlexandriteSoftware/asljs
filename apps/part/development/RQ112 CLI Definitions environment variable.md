# RQ112 CLI Definitions environment variable

When environment variable `PART_DEFINITIONS` is set, the CLI loads the
definition sources it lists. Entries are separated by the platform path
delimiter: `;` on Windows, `:` elsewhere. Empty entries are ignored. Entries are
interpreted as described in [RQ111][RQ111].

CLI parameter `--definitions` has higher priority than the environment variable:
when at least one `--definitions` is given, `PART_DEFINITIONS` is not used.

[RQ111]: <RQ111 CLI Definitions parameter.md>
