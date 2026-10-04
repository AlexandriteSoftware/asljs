# part-check-skips-directory-artefacts

`part check` runs no rules for an artefact that is a directory.

Package: `part`.

`ASLJS Package` is the only definition whose `Location` pattern names
directories, `../{libs,apps}/*/`, and it was the first to carry a rule. The rule
is parsed and the artefacts are discovered, but no row is produced:

- `part inventory` lists 18 `ASLJS Package` artefacts.
- `part definition "ASLJS Package"` shows `RL1` with its description.
- `part check --with-positives` produces no row for any of them, and `part check
  libs/observable` returns an empty table.

So `ASLJS Package_RL1` is dormant: it passes its own five tests but never runs
against a package. Every other definition matches files, which is why this went
unnoticed.

## Where

- `aftefacts/ASLJS Package.md` - the directory pattern and `RL1`.
- `aftefacts/parts/ASLJS Package_RL1.js` - the rule that does not run.
- `apps/part/src/commands/check.ts` - the command that produces no row.
- `apps/part/src/providers/artefact-provider.ts` - discovery, which does find
  the directories.
