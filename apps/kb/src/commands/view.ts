import { serverUrl }
  from 'asljs-mdcli';
import { Server }
  from 'node:http';
import { Environment }
  from '../environment.js';
import { writeLine }
  from '../output.js';
import { startView }
  from '../view.js';

export interface ViewCommandOptions
{
  port?: string;
  host?: string;
}

/**
 * Serve the library in a browser, and print its address. It reads the
 * library itself rather than through a server, and returns once it listens;
 * the server keeps the process running.
 */
export async function execView(
    environment: Environment,
    options: ViewCommandOptions
  ): Promise<Server>
{
  const port =
    options.port === undefined
    ? undefined
    : Number(options.port);

  if (
    port !== undefined
    && (!Number.isInteger(port)
        || port < 0
        || port > 65535)
  ) {
    throw new Error(
      `Invalid port: ${options.port}`);
  }

  const server =
    await startView(
      environment,
      { port,
        host: options.host });

  writeLine(
    environment,
    `Serving ${environment.library} at ${serverUrl(server)}`);

  return server;
}
