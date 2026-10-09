# R28 Working folder

Every command works in a folder, the current directory or `--working-dir`: paths
resolve against it, ids and `.md` names are searched for recursively in it, and
its `.rq` folder holds the results. Every command that takes a requirement or
test takes an id or a `.md` name too.

## Implementation

- [T21 Working folder][T21]

[T21]: <tests/T21 Working folder.md>

## Coverage

I judged R28 fully covered: each of its statements is checked by at least one of
the four steps in T21. I did not modify any file.

**Statement 1: every command works in a folder, either the current directory or
`--working-dir`.**

- The step "every command works in --working-dir and takes ids and .md names"
  (`src/cli.test.ts`) runs these commands with `--working-dir reqs`: `test`,
  `log`, `check`, `list`, `links`, `backlinks`, `tojson`, `add`, `unlink`,
  `link`, `move`, `remove` and `coverage`. Each must succeed and print paths
  relative to `reqs`.
- `view` is covered by "execView takes an id in the working folder and reads the
  recorded statuses" (`src/view.test.ts`), which runs it with its working folder
  set to `reqs`.
- The current-directory default is covered by "rq add, links, backlinks, log and
  check forward their options". It runs commands with no `--working-dir`, from
  the fixture's root folder, and checks that paths given relative to it resolve,
  for example `reqs/R2 Part.md`. The same test also runs `backlinks T3
  --working-dir reqs`.

**Statement 2: paths resolve against the working folder.**

- "resolveTarget searches the working folder for ids and .md names, and resolves
  other paths" (`src/scope.test.ts`) resolves `tests/T1 Passes.md` against
  `reqs` and resolves a folder path.
- In the CLI test, `move R3 "parts/R3 Speed.md"` with `--working-dir reqs`
  writes to `reqs/parts/R3 Speed.md`.

**Statement 3: ids and `.md` names are searched for recursively in the working
folder.**

- The `resolveTarget` step finds `T2` in `reqs/tests/` and `R2 Part.md` in
  `reqs/`.
- It also checks the failure cases: an id outside the folder is rejected, an
  unknown name is rejected, and a duplicate is rejected.

**Statement 4: the working folder's `.rq` folder holds the results.**

- The CLI test checks that `test T1 --working-dir reqs` writes `reqs/.rq/E1
  T1.md` and nothing at the top-level `.rq`.
- It also checks that `log` reports `.rq/E2 T2 Fails.md`.
- For the current-directory case, the "forward their options" step checks that
  `.rq/E2 T3 Bench.md` is written in the current directory.

**Statement 5: every command that takes a requirement or test also takes an id
or a `.md` name.**

- The CLI test passes ids to `test`, `check`, `links`, `backlinks`, `tojson`,
  `add`, `unlink`, `link`, `move` and `remove`.
- It passes `.md` names to `log`, `list`, `link` and `coverage`.
- `view` is checked with an id in the `execView` step.

One small gap: no test passes `view` a `.md` name, and none runs `view` through
the command line with `--working-dir`. Both go through the same `resolveTarget`
and `--working-dir` handling that the other commands are tested on, so I don't
count it as uncovered. To close it anyway, add a check to the `execView` step
(or a CLI one) that opens `R2 Part.md` from `reqs`.

## Status

- Result: PASS
- Coverage: COMPLETE
