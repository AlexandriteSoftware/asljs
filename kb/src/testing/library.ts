import { NullLoggerProvider }
  from 'asljs-logging';
import { TmpDir }
  from 'asljs-tmpdir';
import { CommandContext }
  from '../commands/context.js';
import { createEnvironment,
         Environment }
  from '../environment.js';
import { createInProcessClient }
  from '../mcp/client.js';

/**
 * Write a set of library files, keyed by library-relative path.
 */
export async function writeFiles(
    tmpDir: TmpDir,
    files: Record<string, string>
  ): Promise<void>
{
  for (const [ filePath, content ] of Object.entries(files)) {
    await tmpDir.writeText(
      filePath,
      content);
  }
}

/**
 * Run an action against a temporary library pre-populated with the given
 * files. The directory is removed afterwards, including on failure.
 */
export async function withLibrary<T>(
    files: Record<string, string>,
    action: (library: TmpDir) => Promise<T>
  ): Promise<T>
{
  const library =
    new TmpDir(
      new NullLoggerProvider()
        .getLogger());

  try {
    await writeFiles(
      library,
      files);

    return await action(library);
  } finally {
    await library[Symbol.asyncDispose]();
  }
}

/**
 * Create a command context for a temporary library.
 *
 * The client calls the tools in this process, which is the tool layer a
 * command works through without the cost of a second process.
 */
export function createTestContext(
    tmpDir: TmpDir,
    environment: Partial<Environment> = {}
  ): CommandContext
{
  const resolved =
    createTestEnvironment(
      tmpDir,
      environment);

  return { environment: resolved,
           client:
             createInProcessClient(resolved) };
}

/**
 * Create an environment rooted at a temporary library, with in-memory output
 * buffers.
 */
export function createTestEnvironment(
    tmpDir: TmpDir,
    environment: Partial<Environment> = {}
  ): Environment
{
  return createEnvironment(
    { cwd: tmpDir.path,
      library: tmpDir.path,
      ...environment });
}
