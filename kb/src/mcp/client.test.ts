import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import path
  from 'node:path';
import test
  from 'node:test';
import { LibraryEntry }
  from '../files.js';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { connectToEndpoint,
         createInProcessClient,
         openClient }
  from './client.js';
import { serveEndpoint }
  from './server.js';

const FILES =
  { 'notes/budget.md': '# Budget\n' };

function endpointIn(
    directory: string
  ): string
{
  return path.join(
    directory,
    'kb.sock');
}

test(
  'the in-process client calls a tool and parses the result',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const client =
          createInProcessClient(
            createTestEnvironment(library));

        const entries =
          await client.call(
            'kb_list',
            { pattern: '**/*.md' }) as LibraryEntry[];

        assert.deepEqual(
          entries.map(entry => entry.path),
          [ 'notes/budget.md' ]);

        await client.close();
      });
  });

test(
  'a tool failure becomes a rejection',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const client =
          createInProcessClient(
            createTestEnvironment(library));

        await assert.rejects(
          () =>
          client.call(
            'kb_read',
            { path: 'missing.md' }),
          /does not exist/);
      });
  });

test(
  'a client connects to a server that is already listening',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const endpoint =
          endpointIn(library.path);

        const server =
          await serveEndpoint(
            createTestEnvironment(library),
            endpoint);

        try {
          const client =
            await openClient(
              library.path,
              { endpoint });

          assert.equal(
            client.kind,
            'connected');

          const entries =
            await client.call(
              'kb_list',
              { pattern: '**/*.md' }) as LibraryEntry[];

          assert.deepEqual(
            entries.map(entry => entry.path),
            [ 'notes/budget.md' ]);

          await client.close();
        } finally {
          await server.close();
        }
      });
  });

test(
  'connecting reports nothing when no server is listening',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        assert.equal(
          await connectToEndpoint(
            endpointIn(library.path)),
          null);
      });
  });

test(
  'connecting reports nothing when the peer is not a knowledge base server',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const { createServer } =
          await import('node:net');

        const endpoint =
          endpointIn(library.path);

        const accepted: { destroy: () => void; }[] = [ ];

        const stranger =
          createServer(
            (
                socket
              ) =>
            {
              accepted.push(socket);

              socket.write(
                '{"jsonrpc":"2.0","id":1,"result":{"serverInfo":'
                + '{"name":"something-else"}}}\n');
            });

        await new Promise<void>(
          resolve =>
            stranger.listen(
              endpoint,
              resolve));

        try {
          assert.equal(
            await connectToEndpoint(endpoint),
            null);
        } finally {
          for (const socket of accepted) {
            socket.destroy();
          }

          stranger.close();
        }
      });
  });

test(
  'a server listening again replaces the socket left by the last one',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const endpoint =
          endpointIn(library.path);

        await fs.writeFile(
          endpoint,
          '',
          'utf8');

        const server =
          await serveEndpoint(
            createTestEnvironment(library),
            endpoint);

        await server.close();

        assert.equal(
          await fs.stat(endpoint)
            .then(() => true)
            .catch(() => false),
          false);
      });
  });

test(
  'openClient starts a server when none is listening',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        const client =
          await openClient(
            library.path,
            { endpoint:
                endpointIn(library.path) });

        try {
          assert.equal(
            client.kind,
            'internal');

          const entries =
            await client.call(
              'kb_list',
              { pattern: '**/*.md' }) as LibraryEntry[];

          assert.deepEqual(
            entries.map(entry => entry.path),
            [ 'notes/budget.md' ]);
        } finally {
          await client.close();
        }
      });
  });

test(
  'openClient can refuse to start a server',
  async () =>
  {
    await withLibrary(
      FILES,
      async (
          library
        ) =>
      {
        await assert.rejects(
          () =>
          openClient(
            library.path,
            { endpoint:
                endpointIn(library.path),
              connectOnly: true }),
          /No knowledge base server is listening/);
      });
  });
