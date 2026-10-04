# part-multiple-artefact-folders

Multiple artefact definition folders.

Package: `part`. Moved from `part/TODO.md`, where it read "multiple artefact
definitions folders".

Today the definitions come from one folder.

A consumer project is the case that needs it. EdGames keeps copies of
`Artefact Definition`, `Rule File` and `Article` in `docs/artefacts`, next to
its own definitions. `asljs-part` already ships the first two in
`apps/part/artefacts`, and the copies have drifted (`Article` lacks RL3,
`Artefact Definition` lacks the Properties section). With more than one folder,
for example `part check --definitions node_modules/asljs-part/artefacts
--definitions docs/artefacts`, the shared definitions come from the package and
the project keeps only its own.
