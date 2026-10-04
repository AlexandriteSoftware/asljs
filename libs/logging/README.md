# logging

> Part of [Alexandrite Software Library][1] – a set of high‑quality, performant
> JavaScript libraries for everyday use.

## Overview

`asljs-logging` defines small logging abstractions, `Logger` and
`LoggerProvider`, and implements them with the [Pino][2] logger. Code that logs
depends on the abstractions only, so the caller decides where messages go, or
passes a null logger to discard them.

## Scope

- **Two interfaces.** A `Logger` writes messages at five levels, from `trace` to
  `error`. A `LoggerProvider` creates loggers per context and disposes their
  output.
- **A Pino implementation.** Messages go to a file, or are pretty-printed to the
  console.
- **Configuration from arguments and the environment.** Level, target and
  format come from `--loglevel`, `--logfile` and `--logformat`, or from
  environment variables with a prefix you choose.
- **Null implementations.** `NullLogger` and `NullLoggerProvider` discard every
  message.

Node.js only.

## Installation

```bash
npm install asljs-logging
```

NPM Package: [asljs-logging][21]

## Usage

```ts
import { createLoggerProvider,
         readLoggerOptions }
  from 'asljs-logging';

await using loggerProvider =
  createLoggerProvider(
    'MY_APP_LOG_',
    readLoggerOptions(process.argv));

const logger =
  loggerProvider
    .getLogger('my-context');

logger.information(
  { port: 8080 },
  'listening');
```

Logging is silent until `--loglevel` or `MY_APP_LOG_LEVEL` sets a level.
`--logfile` or `MY_APP_LOG_FILE` sends it to a file, `stdout` or `stderr`, and
`--logformat` or `MY_APP_LOG_FORMAT` chooses `auto`, `json`, `text` or
`pretty`.

## Further reading

- [Logging][3] - the logger and provider interfaces, levels, options, and
  environment variables.

Questions and bugs: [asljs/issues][4].

## Related packages

- `asljs-tmpdir` and `asljs-locator` trace their work through a `Logger`.

## License

MIT License. See [LICENSE][LIC] for details.

[1]: https://github.com/AlexandriteSoftware/asljs
[2]: https://getpino.io/
[21]: https://www.npmjs.com/package/asljs-logging
[3]: docs/Logging.md
[4]: https://github.com/AlexandriteSoftware/asljs/issues
[LIC]: LICENSE.md
