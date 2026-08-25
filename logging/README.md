# logging

> Part of [Alexandrite Software Library][1] – a set of high‑quality, performant
> JavaScript libraries for everyday use.

Shared logger provider abstraction used by ASLJS packages.

[1]: https://github.com/AlexandriteSoftware/asljs

## Installation

```bash
npm install asljs-logging
```

NPM Package: [asljs-logging][21]

[21]: https://www.npmjs.com/package/asljs-logging

## Usage

```ts
import {
  createPinoLoggerProvider
} from 'asljs-logging';

await using loggerProvider = createPinoLoggerProvider(
  { level: 'information', envVarPrefix: 'MY_APP_LOG_' }
);

const logger = loggerProvider.getLogger(
  'my-context'
);

logger.information(
  'started'
);
```

## Environment Variables

By default, `createPinoLoggerProvider()` uses `ASLJS_LOG_` and reads:

- `ASLJS_LOG_LEVEL`
- `ASLJS_LOG_FILE`

The prefix can be overridden by `envVarPrefix` option or
`ASLJS_LOG_ENV_VAR_PREFIX`.

## License

MIT License. See [LICENSE](LICENSE.md) for details.
