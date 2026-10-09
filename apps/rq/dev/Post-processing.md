# Post-processing

How the markdown `rq` writes is handed to the project's tools.

- `rq` does not format markdown itself. Every markdown write goes through
  `writeMarkdown`, which remembers the file; after the command, `runCli` passes
  the files that still exist to `postProcess`, which runs the
  `markdownPostProcessing` command of the nearest `rq.json`.
- The written lines are left long, e.g. a status note, so that the project's
  formatter decides the layout. Links are added as reference links labelled with
  the target's id (`addImplementationLink`, `freeLabel`), because they read
  better in long lists and many linters ask for them.
