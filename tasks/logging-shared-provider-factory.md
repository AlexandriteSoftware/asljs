# logging-shared-provider-factory

Every application writes the same logger-provider factory.

Package: `logging`, with `cog`, `kb`, `toolkit` and `part` as callers.

`apps/cog/src/logger.ts`, `apps/kb/src/logger.ts` and
`apps/toolkit/src/lib/logger.ts` are the same function with a different prefix:
build options from `<APP>_LOG_LEVEL` and `<APP>_LOG_FILE`, let explicit options
win, and construct a `PinoLoggerProvider`. `part` does the same inline in
`cli.ts`. `cog` adds `readLoggerOptions(argv)` to read `--loglevel` and
`--logfile` before commander parses the arguments.

Proposed, in `asljs-logging`:

- `createLoggerProvider(prefix, overrides?)` - explicit options, then
  environment variables, then the defaults in `docs/Logging.md`: `silent`, or
  `information` when only a file is given. Returns a `NullLoggerProvider` when
  the resolved level is `silent`.
- `readLoggerOptions(argv)` - the `--loglevel` / `--logfile` reader from cog.

Then replace the copies in the applications. EdGames (API server and build
tools) is the next caller and would otherwise write a fifth copy.

## Where

- `apps/cog/src/logger.ts`, `apps/cog/src/main/logger-options.ts`
- `apps/kb/src/logger.ts`
- `apps/toolkit/src/lib/logger.ts`
- `apps/part/src/cli.ts`
- `libs/logging/src/pino-logger-provider-options.ts`
