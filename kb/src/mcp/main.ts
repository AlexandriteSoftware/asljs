import { createEnvironment }
  from '../environment.js';
import { resolveLibraryRoot }
  from '../library.js';
import { createLoggerProvider }
  from '../logger.js';
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
