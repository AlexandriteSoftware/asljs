# RQ136 CLI Check cache

`check` stores rule results in `.part/check-cache.json` under the project root
and reuses them. The folder is meant to be gitignored.

A cached result of a rule for an artefact is reused when all of these hold:

- the artefact is a `file:` artefact, and its modification time is not newer
  than the time the cached check started. A rule that reads other files, such as
  the files next to a `package.json`, is not rerun when only those change;
- the rule content is unchanged;
- the result was produced the same way: by the same plugin with the same
  `version`, or by an AI agent (see [RQ137][RQ137]).

Otherwise the rule runs and its result replaces the cached one. Non-file
artefacts are always checked and never cached. `Skip` results are not cached.

A reused result is reported as if the rule ran: the row is shown under the usual
flags, and a cached failure sets a non-zero exit code.

Changing a plugin's `version` discards the results cached for the rules it
implements. Nothing else about a plugin, such as its files, affects the cache. A
change in another artefact a rule reads does not invalidate the result either.

`--force-check` runs every selected rule and refreshes the cache.

When the cache is written, entries for artefacts or rules that no longer exist
are dropped. A missing or unreadable cache file is treated as empty.

[RQ137]: <RQ137 CLI AI check.md>
