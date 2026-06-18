# RQ121 CLI Inventory action

Inventory command enumerates all files and folders in the project folder and
for each of them lists all artefact definitions that apply to it. The produced
report includes these columns:

- `Location` - file or folder path, relative to the working directory.
- `Definitions` - comma-separated list of all definitions that apply to the
  artefact.

Parameters:

- `--inventory-definitions=...` - limit check to specific definitions,
  comma-separated list.

See also:

- [RQ111 CLI Definitions parameter][1]

[1]: <RQ111 CLI Definitions parameter.md>
