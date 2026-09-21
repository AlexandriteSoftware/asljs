import { createEnvironment,
         Environment }
  from '../environment.js';
import { createLinkGraph }
  from '../graph.js';
import { resolveLibraryRoot }
  from '../library.js';
import { messageOf }
  from '../formatting.js';
import { createLoggerProvider }
  from '../logger.js';
import { watchLibrary }
  from '../watcher.js';
import { endpointFor }
  from './endpoint.js';
import { runMcpServer,
         serveEndpoint }
  from './server.js';

export interface ServerOptions
{
  library: string | null;

  /**
   * Index the library and follow it. Off for a server that serves one command
   * and exits, where an index is pure cost.
   */
  index: boolean;

  /**
   * Address to serve as well as standard input, so that a client can find
   * this server. `null` serves standard input only.
   */
  listen: string | null;
}

/**
 * Entry point of the `kb-mcp` executable.
 *
 * The library root comes from `--library <path>`, then from the `KB_LIBRARY`
 * environment variable, then from the working directory.
 *
 * Standard output carries the JSON-RPC stream, so logging is silent unless
 * `KB_LOG_FILE` names a file to write to.
 *
 * The library is indexed before the first request is served, and the index is
 * then kept current by watching the library, so link questions are answered
 * from memory. `--no-index` skips both.
 *
 * `--listen` also serves an endpoint, which a command line client finds
 * without being told where it is. A listening server outlives its standard
 * input and stops on SIGINT or SIGTERM.
 */
export async function main(
    argv: string[] = process.argv.slice(2)
  ): Promise<void>
{
  const options =
    readOptions(argv);

  const loggerProvider =
    createLoggerProvider(
      logLevel());

  const environment =
    createEnvironment(
      { loggerProvider,
        library:
          resolveLibraryRoot(
            process.cwd(),
            options.library) });

  ignoreBrokenPipe();

  if (options.index) {
    await startIndex(environment);
  }

  const listening =
    options.listen !== null;

  if (listening) {
    await startEndpoint(
      environment,
      options.listen ?? '');
  }

  try {
    await serve(
      environment,
      listening);
  } finally {
    await environment.dispose();
    await loggerProvider.dispose();
  }
}

/**
 * Serve until there is nothing left to serve.
 *
 * A server that only answers standard input is done when standard input
 * ends. One that also listens outlives its standard input, because it is
 * there for clients that have not connected yet, so it runs until it is
 * asked to stop.
 */
async function serve(
    environment: Environment,
    listening: boolean
  ): Promise<void>
{
  const stdin =
    runMcpServer(
      environment,
      process.stdin,
      line => process.stdout.write(line));

  if (!listening) {
    await stdin;

    return;
  }

  await untilStopped();
}

function untilStopped(
  ): Promise<void>
{
  return new Promise<void>(
    (
        resolve
      ) =>
    {
      process.once(
        'SIGINT',
        () => resolve());

      process.once(
        'SIGTERM',
        () => resolve());
    });
}

export function readOptions(
    argv: string[]
  ): ServerOptions
{
  const options: ServerOptions =
    { library: null,
      index: true,
      listen: null };

  for (
    let index = 0;
    index < argv.length;
    index += 1
  ) {
    const argument = argv[index];

    if (argument === '--no-index') {
      options.index = false;

      continue;
    }

    if (argument === '--library') {
      const value =
        valueAt(
          argv,
          index + 1);

      options.library = value;

      // Only a value is consumed; the next option is left for the loop.
      if (value !== null) {
        index += 1;
      }

      continue;
    }

    if (argument === '--listen') {
      options.listen =
        valueAt(
          argv,
          index + 1) ?? '';

      if (options.listen !== '') {
        index += 1;
      }
    }
  }

  return options;
}

async function startIndex(
    environment: Environment
  ): Promise<void>
{
  const logger =
    environment.loggerProvider.getLogger('kb.mcp');

  try {
    const graph =
      await createLinkGraph(environment.library);

    environment.graph = graph;

    const stats =
      graph.stats();

    logger.information(
      `Indexed ${stats.articles} article(s) and ${stats.links} link(s)`);

    const watcher =
      watchLibrary(
        environment.library,
        graph,
        { logger });

    environment.onDispose(
      (): Promise<void> =>
      {
        watcher.close();

        return Promise.resolve();
      });
  } catch (error) {
    logger.warning(
      `Cannot index the library: ${messageOf(error)}`);
  }
}

async function startEndpoint(
    environment: Environment,
    requested: string
  ): Promise<void>
{
  const logger =
    environment.loggerProvider.getLogger('kb.mcp');

  const endpoint =
    addressOf(
      environment,
      requested);

  try {
    const server =
      await serveEndpoint(
        environment,
        endpoint);

    logger.information(
      `Listening on ${endpoint}`);

    environment.onDispose(server.close);
  } catch (error) {
    logger.warning(
      `Cannot listen on ${endpoint}: ${messageOf(error)}`);
  }
}

/**
 * An address that was asked for, or the address of the library.
 */
function addressOf(
    environment: Environment,
    requested: string
  ): string
{
  if (requested === '') {
    return endpointFor(environment.library);
  }

  return requested;
}

/**
 * The host closes the pipe on shutdown; that is not a failure.
 */
function ignoreBrokenPipe(
  ): void
{
  process.stdout.on(
    'error',
    (
        error: NodeJS.ErrnoException
      ) =>
    {
      if (error.code !== 'EPIPE') {
        throw error;
      }
    });
}

function logLevel(
  ): { level?: string; }
{
  if (process.env.KB_LOG_FILE) {
    return {};
  }

  return { level: 'silent' };
}

function valueAt(
    argv: string[],
    index: number
  ): string | null
{
  const value = argv[index];

  if (
    value === undefined
    || value.startsWith('--')
  ) {
    return null;
  }

  return value;
}

