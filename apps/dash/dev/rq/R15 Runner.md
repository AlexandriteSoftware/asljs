# R15 Runner

The runner runs each counter's command on its schedule, checked at the top of
every minute, and on start also those marked startup; with --once it runs every
counter once and exits. A command is a shell command line run in its config's
folder. Its stdout, without trailing whitespace, is put to the counter's key
over HTTP: to DASH_URL, by default localhost on PORT, or inside the server with
--with-runner to that server. A non-zero exit records nothing and is logged,
stderr is logged and never stored, and a run longer than DASH_TIMEOUT
milliseconds is killed and records nothing.

## Implementation

- [T11 Runner][T11]

[T11]: <tests/T11 Runner.md>

## Coverage

R15 is fully covered by the seven steps of T11. The Coverage section in the R15
file itself is out of date: it still lists gaps that T11's current steps close.

Statement by statement:

- **"The runner runs each counter's command on its schedule, checked at the top
  of every minute":** T11 start. With `Date` and `setTimeout` mocked at
  12:00:00, run.minute (scheduled `1 12 * * *`) does not run at start. After the
  timer advances 60 000 ms to 12:01 it records "minute", and run.later, due at
  another time, records nothing.
- **"and on start also those marked startup":** T11 start. At 12:00 both run.due
  (`0 12 * * *`) and run.startup (`0 6 * * *`, startup) record their values,
  while run.later (`0 6 * * *`, not startup) does not.
- **"with --once it runs every counter once and exits":** T11 once. It checks
  that every counter with a command gets its value and that run.manual, which
  has no command, gets nothing. The call returns. T11 runner as a program spawns
  `runner.js --once` and checks that the process exits with code 0.
- **"A command is a shell command line run in its config's folder":** T11 once.
  run.cwd stores the config's `project` folder as its working directory. Every
  counter is a quoted command line handed to the shell.
- **"Its stdout, without trailing whitespace, is put to the counter's key over
  HTTP":** T11 once. " 41.3" followed by an empty line is stored as " 41.3", so
  leading whitespace is kept and trailing whitespace is dropped. The put goes
  through a real server's API, and T11 sticky also checks the changed and sticky
  replies.
- **"to DASH_URL, by default localhost on PORT":** T11 runner as a program. With
  DASH_URL empty and PORT set to the server's port, the value lands. With PORT=1
  and DASH_URL set to the server, it lands again, so DASH_URL takes precedence.
- **"or inside the server with --with-runner to that server":** T11 with the
  server, which runs the server.test.js test that starts `server.js
  --with-runner`. A startup counter's "started" is then readable through that
  server's own `/api/get`.
- **"A non-zero exit records nothing and is logged":** T11 failure. No sample is
  stored, and "run.fails exit=3 broken" is logged.
- **"stderr is logged and never stored":** For a successful run, T11 start
  checks that "run.due stderr: noise" is logged and that the value is just
  "due". For a failed run, T11 failure checks that stderr is in the exit log
  line. T11 once checks that run.stderr stores "value", not "noise".
- **"a run longer than DASH_TIMEOUT milliseconds is killed and records
  nothing":** T11 timeout. With DASH_TIMEOUT=300 a 3-second command stores
  nothing and gets an exit log line. The requirement text no longer mentions a
  60-second default, so that does not need covering.

Two notes for the maintainers:

- **Stale Coverage section:** The "Statements nothing covers" list in R15 should
  be regenerated. It still names the top-of-minute check, the DASH_URL and PORT
  target, --with-runner, logging stderr on a successful run, and the 60-second
  default. The current steps cover the first four, and the default is no longer
  in the requirement.
- **Weak alignment check (optional):** The start step begins exactly at
  12:00:00, so a runner that fires every 60 s without aligning to the minute
  would also pass. It also checks only one tick after start. To catch that,
  start at 12:00:30 instead, check that run.minute runs after 30 000 ms, and
  advance one more minute to check that the timer reschedules itself.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
