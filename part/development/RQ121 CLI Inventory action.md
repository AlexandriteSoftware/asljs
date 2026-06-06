# RQ121 CLI Inventory action

When CLI is invoked with Inventory action, it obtains a list of all definitions,
then list of all artefacts, then applies rules to artefacts. Finally, it
produces a report of all artefacts, with these columns:

- `Location` - file or folder path, relative to the working directory.
- `Definitions` - comma-separated list of all definitions that apply to the
  artefact.
- `Rules` - `Ok` if all rules are satisfied, otherwise `Fail`.
