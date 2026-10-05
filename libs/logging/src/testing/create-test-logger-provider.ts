// Identical copies, kept in sync; everything below the imports must match:
// - libs/logging/src/testing/create-test-logger-provider.ts, for the tests of
//   asljs-logging itself, which cannot depend on asljs-testing;
// - libs/testing/src/create-test-logger-provider.ts, exported by
//   asljs-testing.
import { type LoggerProvider }
  from '../logger-provider.js';
import { NullLoggerProvider }
  from '../null-logger-provider.js';
import { PinoLoggerProviderOptionsBuilder }
  from '../pino-logger-provider-options.js';
import { PinoLoggerProvider }
  from '../pino-logger-provider.js';

/**
 * Creates the logger provider of a test file:
 *
 * - The level is `debug` unless `<prefix>LEVEL` says otherwise; `silent` turns
 *   logging off.
 * - `<prefix>FILE` takes a file path, `stdout` (the default) or `stderr`.
 * - The format is `pretty` on stdout and stderr, because a person reads test
 *   output even though the test runner pipes it, and `json` in a file.
 *   `<prefix>FORMAT` overrides it.
 */
export function createTestLoggerProvider(
    prefix: string = 'ASLJS_TEST_LOG_'
  ): LoggerProvider
{
  const builder =
    new PinoLoggerProviderOptionsBuilder()
    .withLevel('debug')
    .fromEnvironmentVariables(prefix);

  if (!process.env[`${prefix}FORMAT`]) {
    const file =
      process.env[`${prefix}FILE`];

    const isStream =
      file === undefined
      || file === ''
      || file === 'stdout'
      || file === 'stderr';

    builder.withFormat(
      isStream
        ? 'pretty'
        : 'json');
  }

  const options =
    builder.build();

  if (options.level === 'silent') {
    return new NullLoggerProvider();
  }

  return new PinoLoggerProvider(
    options);
}
