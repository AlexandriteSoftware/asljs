# R32 Markdown post-processing

`rq` formats no markdown itself: after a command that wrote markdown files, it
runs the `markdownPostProcessing` command of the nearest `rq.json` with those
files, and reports a failure with a non-zero exit code.

## Implementation

- [T28 Markdown post-processing][T28]

[T28]: <../tests/T28 Markdown post-processing.md>

## Coverage

R32 is now fully covered by T28. The gap in the requirement's current `##
Coverage` section, which said nothing tested `rq`'s exit code when
post-processing fails, has been closed in `src/post-process.test.ts`.

Statement by statement:

- **"`rq` formats no markdown itself"** is a design constraint, not something a
  test can observe. T28 step 3 (`rq post-processes the markdown files a command
  wrote`) supports it indirectly: the files `rq add` writes go to the configured
  command, and `rq` does no formatting along the way. Nothing more is needed.
- **"after a command that wrote markdown files, it runs the
  `markdownPostProcessing` command"** is covered by T28 step 3:
  - It runs `add requirement R2 Speed` through `runCli` and checks that the
    command received `reqs/R2 Part.md` and `reqs/R3 Speed.md`.
  - It then runs `list reqs`, which writes nothing, and checks that the command
    did not run again (`args.txt` still has 2 lines).
- **"of the nearest `rq.json`"** is covered by T28 step 1 (`findConfig reads the
  nearest rq.json of the folder or a parent`). It checks four cases:
  - no config returns `null`;
  - a parent folder's `rq.json` is found from `a/b`;
  - a nearer `a/rq.json` takes precedence, shown by its invalid value being the
    one rejected;
  - invalid JSON is rejected.
- **"with those files"** is covered by T28 step 2 (`postProcess runs the command
  with the written files that still exist`). It checks that the command gets the
  path `writeMarkdown` recorded, relative to the config folder, and that a file
  that no longer exists (`reqs/Gone.md`) is left out. Step 3 checks the same
  through the CLI.
- **"and reports a failure with a non-zero exit code"** is covered in two
  places:
  - Step 2 checks that `postProcess` returns 1 and writes `Post-processing
    failed: … exited with code 2`, with the command's output, to stderr.
  - Step 3 now goes further. It reconfigures `rq.json` with a processor that
    exits with code 3 and runs `add requirement R2 Size` through `runCli`. It
    asserts that `runCli` returns 1, that stderr matches `Post-processing
    failed: node … exited with code 3`, and that `reqs/R4 Size.md` was still
    written.

The `## Coverage` section and the `INCOMPLETE` status in R32 are out of date.
Running `rq coverage` again will replace them.

Optionally, step 3 could also check that when the command itself fails, its own
exit code wins over the post-processing result. The requirement doesn't state
that, so the requirement is covered without it.

## Status

- Result: PASS
- Coverage: COMPLETE
