import { Environment }
  from '../environment.js';
import { connectToEndpoint }
  from '../mcp/client.js';
import { endpointFor }
  from '../mcp/endpoint.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { packageVersion }
  from './version.js';

export interface ConfigCommandOptions
{
  format?: string;
}

interface Configuration
{
  version: string;
  cwd: string;
  library: string;
  readable: string[];

  /**
   * Address a server for this library is reached at.
   */
  endpoint: string;

  /**
   * Whether a server is listening there. When none is, a command starts one
   * for itself.
   */
  server: 'running' | 'none';
}

/**
 * Print the effective configuration: the library, the file types that can be
 * read, and where a server for the library is reached.
 *
 * This describes the tool rather than the library, so it is the one command
 * that does not go through a server.
 */
export async function execConfig(
    environment: Environment,
    options: ConfigCommandOptions = {}
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const endpoint =
    endpointFor(environment.library);

  const configuration: Configuration =
    { version:
        packageVersion(),
      cwd: environment.cwd,
      library: environment.library,
      readable:
        environment.readers.extensions(),
      endpoint,
      server:
        await probe(endpoint) };

  writeResult(
    environment,
    format,
    configuration,
    describe(configuration));
}

async function probe(
    endpoint: string
  ): Promise<'running' | 'none'>
{
  const client =
    await connectToEndpoint(endpoint);

  if (!client) {
    return 'none';
  }

  await client.close();

  return 'running';
}

function describe(
    configuration: Configuration
  ): string[]
{
  return [ `version: ${configuration.version}`,
           `cwd: ${configuration.cwd}`,
           `library: ${configuration.library}`,
           `readable: ${configuration.readable.join(' ')}`,
           `endpoint: ${configuration.endpoint}`,
           `server: ${configuration.server}` ];
}
