import { createEnvironment }
  from '../environment.js';
import { createLinkGraph }
  from '../graph.js';
import { resolveLibraryRoot }
  from '../library.js';
import { createLoggerProvider }
  from '../logger.js';
import { watchLibrary }
  from '../watcher.js';
import { runMcpServer }
  from './server.js';

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
 * then kept current by watching the library, so that link questions are
 * answered from memory. Indexing failures are logged and leave the server
 * running on the direct scan path.
 */
export async function main(
    argv: string[] = process.argv.slice(2)
  ): Promise<void>
{
  const loggerProvider =
    createLoggerProvider(
      process.env.KB_LOG_FILE
        ? {}
        : { level: 'silent' });

  const environment =
    createEnvironment(
      { loggerProvider,
        library:
          resolveLibraryRoot(
            process.cwd(),
            readLibraryArgument(argv)) });

  const logger =
    loggerProvider.getLogger('kb.mcp');

  try {
    const started =
      Date.now();

    environment.graph =
      await createLinkGraph(environment.library);

    const stats =
      environment.graph.stats();

    logger.information(
      `Indexed ${stats.articles} article(s) and ${stats.links} link(s) in ${
        Date.now() - started}ms`);

    const watcher =
      watchLibrary(
        environment.library,
        environment.graph,
        { logger });

    environment.onDispose(
      (): Promise<void> =>
      {
        watcher.close();

        return Promise.resolve();
      });
  } catch (error) {
    logger.warning(
      `Cannot index the library: ${
        error instanceof Error
          ? error.message
          : String(error)}`);
  }

  // The host closes the pipe on shutdown; that is not a failure.
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

  try {
    await runMcpServer(
      environment,
      process.stdin,
      line => process.stdout.write(line));
  } finally {
    await environment.dispose();
    await loggerProvider.dispose();
  }
}

function readLibraryArgument(
    argv: string[]
  ): string | null
{
  const index =
    argv.indexOf('--library');

  if (
    index < 0
    || index + 1
       >= argv.length
  ) {
    return null;
  }

  return argv[index + 1] ?? null;
}
