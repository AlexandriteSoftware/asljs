import { createHash }
  from 'node:crypto';
import os
  from 'node:os';
import path
  from 'node:path';

/**
 * Address of the server that serves one library.
 *
 * The address is derived from the library root, so a client finds a running
 * server without a discovery file: it connects, and a refused connection
 * means no server is there.
 *
 * A unix socket lives in the temporary directory. Windows has no unix
 * sockets, so a named pipe is used instead.
 */
export function endpointFor(
    root: string
  ): string
{
  const name =
    `asljs-kb-${fingerprint(root)}`;

  if (process.platform === 'win32') {
    return `\\\\.\\pipe\\${name}`;
  }

  return path.join(
    os.tmpdir(),
    `${name}.sock`);
}

/**
 * True when the endpoint is backed by a file that has to be removed before it
 * can be listened on again.
 */
export function endpointIsFile(
    endpoint: string
  ): boolean
{
  return !endpoint.startsWith('\\\\.\\pipe\\');
}

function fingerprint(
    root: string
  ): string
{
  return createHash('sha256')
    .update(
      path.resolve(root))
    .digest('hex')
    .slice(
      0,
      16);
}
