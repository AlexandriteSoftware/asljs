# R15 Logging

board and board-mcp log nothing unless asked to, with --loglevel, --logfile and
--logformat or with BOARD_LOG_LEVEL, BOARD_LOG_FILE and BOARD_LOG_FORMAT. At
debug, board logs each command and the AI agent it runs: where its command line
came from, when it started, and its exit code. board-mcp refuses a log level
whose log would go to standard output, which carries the protocol, and logs each
line it skips. board view serves until SIGINT or SIGTERM, so that the log is
complete when board exits.

## Implementation

- [T12 Logging][T12]

[T12]: <tests/T12 Logging.md>

## Coverage

R15 is fully covered by T12 and the tests it links. I didn't change any files.
R15's own Coverage and Status sections are out of date: they say board-mcp
`--logfile` is never run and that `--logformat=json` hides board-mcp reading
BOARD_LOG_FORMAT. The board-mcp test in T12 now closes both gaps, so those
sections should be updated to match.

Each statement and what covers it:

- **board and board-mcp log nothing unless asked.** T12's step
  "createLoggerProvider is silent by default" covers this. Both `main` functions
  build their logger provider with that function, using the `BOARD_LOG_` prefix.
- **board with `--loglevel` and `--logfile`.** Covered by T12's step "board
  --loglevel and --logfile log the command and the agent". It runs `plan` with
  both options and reads the entries back from the log file.
- **board with BOARD_LOG_LEVEL, BOARD_LOG_FILE, BOARD_LOG_FORMAT and
  `--logformat`.** Covered by T12's step "board reads BOARD_LOG_LEVEL,
  BOARD_LOG_FILE and BOARD_LOG_FORMAT, and an option overrides its variable".
  - Its first run sets only the three variables. It checks for text-format debug
    lines in the file the environment names.
  - Its second run passes `--logfile` and `--logformat json`, and checks for
    JSON entries.
  - The library steps "createLoggerProvider lets overrides win over the
    environment" and "createLoggerProvider logs when the environment sets a
    level" back this up.
- **board-mcp with its options and variables.** Covered by T12's step "main
  refuses a log level that would log to stdout, and logs to the file BOARD_LOG_
  variables and options name".
  - The first call reads `--loglevel debug`.
  - The second call sets BOARD_LOG_LEVEL and BOARD_LOG_FILE, passes
    `--logformat=json`, and checks that the file holds JSON entries.
  - The third call passes `--logfile=<option.log>` with BOARD_LOG_FORMAT=text
    and no `--logformat`. It checks for a text-format line in that file. So this
    call covers both board-mcp `--logfile` and board-mcp reading
    BOARD_LOG_FORMAT.
- **At debug, board logs each command and the agent: where its command line came
  from, when it started, and its exit code.** The `--loglevel`/`--logfile` step
  checks the exact sequence: "command started", "agent command from the
  environment", "agent started", "agent exited", "command finished". The step
  "askAgent logs the command and the exit code at debug, the prompt and the
  output at trace" checks the exit-code entry.
- **board-mcp refuses a log level whose log would go to standard output.** In
  the board-mcp step, the first call is rejected with an error matching
  `/--logfile stderr/`.
- **board-mcp logs each line it skips.** The same step sends `not json` and
  checks that standard output stays empty. It then checks that the log records
  "ignored a line that is not valid JSON", in both the JSON and the text log.
- **board view serves until SIGINT or SIGTERM, so the log is complete when board
  exits.** Covered by T12's step "board view serves until SIGINT or SIGTERM, and
  logs until it stops". It runs once per signal and checks three things:
  - `main` returns 0;
  - the server stops answering;
  - the log ends with "command finished" and the request entry.

  The step "untilStopped closes the server on a signal and stops listening for
  it" backs up the shared helper.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
