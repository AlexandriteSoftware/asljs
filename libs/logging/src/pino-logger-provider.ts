import { once }
  from 'node:events';
import pino
  from 'pino';
import { LoggerProvider }
  from './logger-provider.js';
import { Logger }
  from './logger.js';
import { NullLogger }
  from './null-logger.js';
import { type LogOutput,
         type PinoLoggerProviderOptions,
         resolveLogOutput,
         type Terminals }
  from './pino-logger-provider-options.js';
import { PinoLogger }
  from './pino-logger.js';

/**
 * A logger provider backed by pino.
 *
 * The options are checked when the provider is created, so a process that
 * cannot log where it was asked to fails at startup: `pretty` with a file
 * path, or stdout when `allowStdout` is `false`. At level `silent` no
 * transport is started and every logger discards its entries.
 */
export class PinoLoggerProvider implements LoggerProvider
{
  readonly #logger: pino.Logger | null;
  readonly #level: string;
  readonly #transport: ReturnType<typeof pino.transport> | null;
  #disposed: boolean = false;

  constructor(
    options: Partial<PinoLoggerProviderOptions>,
    terminals: Terminals = currentTerminals()
  )
  {
    const level =
      options.level
      ?? 'silent';

    this.#level = level;

    const output =
      resolveLogOutput(
        { ...options,
          level },
        terminals);

    if (level === 'silent') {
      this.#logger = null;
      this.#transport = null;
      return;
    }

    this.#transport =
      pino.transport(
        transportOptions(output));

    this.#logger =
      pino(
        { base: options.base ?? null,
          level:
            toPinoLevel(level) },
        this.#transport);
  }

  getLogger(
    context?: string
  ): Logger
  {
    if (this.#logger === null) {
      return new NullLogger();
    }

    if (
      context
      && context.length > 0
    ) {
      return new PinoLogger(
        this.#logger.child(
          { context }),
        this.#level);
    }

    return new PinoLogger(
      this.#logger,
      this.#level);
  }

  /**
   * Flushes buffered entries and closes the output. Call it before the
   * process exits, including from fatal error handlers.
   */
  async dispose(): Promise<void>
  {
    const transport =
      this.#transport;

    if (
      transport === null
      || this.#disposed
    ) {
      return;
    }

    this.#disposed = true;

    const stream =
      transport as unknown as { ready: boolean; ref(): void; };

    // pino unreferences the worker once it is ready. Wait for that, then
    // reference it again, so the event loop stays alive until the worker has
    // written the last entries and closed.
    if (!stream.ready) {
      await once(
        transport,
        'ready');
    }

    const closed =
      once(
        transport,
        'close');

    stream.ref();
    transport.flushSync();
    transport.end();

    await closed;
  }

  [Symbol.asyncDispose](): Promise<void>
  {
    return this.dispose();
  }
}

function transportOptions(
    output: LogOutput
  ): pino.TransportSingleOptions
{
  if (output.format === 'json') {
    return { target: 'pino/file',
             options:
               { destination: output.destination,
                 mkdir: true } };
  }

  return { target: 'pino-pretty',
           options:
             { destination: output.destination,
               mkdir: true,
               colorize: output.format === 'pretty',
               messageFormat:
                 '{if context}{context}: {end}{msg}',
               ignore: 'context' } };
}

function toPinoLevel(
    level: string
  ): string
{
  if (level === 'information') {
    return 'info';
  }

  if (level === 'warning') {
    return 'warn';
  }

  return level;
}

function currentTerminals(
  ): Terminals
{
  return { stdout:
             process.stdout.isTTY === true,
           stderr:
             process.stderr.isTTY === true };
}
