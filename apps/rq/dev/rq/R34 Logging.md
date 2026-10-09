# R34 Logging

rq and rq-mcp log nothing unless asked to, with --loglevel, --logfile and
--logformat or with RQ_LOG_LEVEL, RQ_LOG_FILE and RQ_LOG_FORMAT; an option takes
precedence over its variable. At debug, rq logs each command, each test it runs
and the commands of its steps, the AI agent it runs, and the post-processing.
rq-mcp refuses a log level whose log would go to standard output, which carries
the protocol, and logs each tool call and each line it skips. rq view serves
until SIGINT or SIGTERM, so that the log is complete when rq exits.

## Implementation

- [T31 Logging][T31]

[T31]: <tests/T31 Logging.md>

## Coverage

All of R34's statements are covered by T31. The old `## Coverage` section of R34
said the log format was not covered, but that is out of date. T31's step "rq
reads RQ_LOG_LEVEL, RQ_LOG_FILE and RQ_LOG_FORMAT, and an option overrides its
variable" now checks the format as well.

What covers each statement:

- **Nothing is logged unless asked.** T31's step "createLoggerProvider is silent
  by default" covers this. With no level set, the provider logs nothing, and rq
  and rq-mcp both build their provider this way.
- **The --loglevel and --logfile options.** For rq, the step "rq --loglevel and
  --logfile log the command, each test and the commands of its steps" covers
  them. For rq-mcp, the step "main refuses a log level that would log to stdout,
  and logs the requests to a log file" covers them.
- **The --logformat option.** The RQ_LOG_FORMAT step in T31 covers it. It passes
  `--logformat json` while RQ_LOG_FORMAT is `text`, and checks that the log file
  is JSON lines.
- **The RQ_LOG_LEVEL, RQ_LOG_FILE and RQ_LOG_FORMAT variables.** The same step
  sets only the three variables first. It then checks that the log file named by
  RQ_LOG_FILE gets text-format "DEBUG: rq: command started/finished" lines.
- **An option takes precedence over its variable.** The same step covers this:
  `--logfile` and `--logformat` override RQ_LOG_FILE and RQ_LOG_FORMAT. The step
  "createLoggerProvider lets overrides win over the environment" supports it.
  - The variables are checked through rq only, not rq-mcp. rq-mcp builds its
    provider the same way, so this is acceptable.
- **At debug, rq logs each command, each test it runs and the commands of its
  steps.** The rq --loglevel/--logfile step covers this. It checks the exact
  list of entries: command started/finished, test started/finished, and step
  command started/exited.
- **At debug, rq logs the AI agent it runs.** The step "askAgent logs the
  command and the exit code at debug, the prompt and the output at trace" covers
  this.
- **At debug, rq logs the post-processing.** The step "postProcess runs the
  command with the written files that still exist" covers this.
- **rq-mcp refuses a log level whose log would go to standard output.** The
  rq-mcp "main refuses a log level…" step covers this.
- **rq-mcp logs each tool call and each line it skips.** The same rq-mcp step
  covers this. The step "serveLines answers line-delimited requests and logs
  requests and invalid lines" supports it.
- **rq view serves until SIGINT or SIGTERM.** The step "untilStopped closes the
  server on a signal and stops listening for it" covers this. "So that the log
  is complete when rq exits" only gives the reason and needs no check of its
  own.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
