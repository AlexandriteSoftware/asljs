# logging

> Part of [Alexandrite Software Library][1] – a set of high‑quality, performant
> JavaScript libraries for everyday use.

Defines logging abstractions and provides implementation of these abstractions
with [Pino][2] logger.

[1]: https://github.com/AlexandriteSoftware/asljs
[2]: https://getpino.io/

## Installation

```bash
npm install asljs-logging
```

NPM Package: [asljs-logging][21]

[21]: https://www.npmjs.com/package/asljs-logging

## Usage

```ts
import { PinoLoggerProvider,
         PinoLoggerProviderOptionsBuilder }
  from 'asljs-logging';

const options =
  new PinoLoggerProviderOptionsBuilder()
    .fromEnvironmentVariables('MY_APP_LOG_')
    .build();

await using loggerProvider =
  new PinoLoggerProvider(options);

const logger =
  loggerProvider
    .getLogger('my-context');

logger.information('started');
```

## Environment Variables

By default, `PinoLoggerProviderOptionsBuilder.fromEnvironmentVariables()` reads
environment variables prefixed with `ASLJS_LOG_`:

- `ASLJS_LOG_LEVEL`
- `ASLJS_LOG_FILE`

## License

MIT License. See [LICENSE](LICENSE.md) for details.
