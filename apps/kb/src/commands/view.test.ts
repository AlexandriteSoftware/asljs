import { serverUrl }
  from 'asljs-mdcli';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { execView }
  from './view.js';

test(
  'view serves the library and prints its address, and refuses an invalid port',
  async () =>
  {
    await withLibrary(
      { 'one.md': '# One\n' },
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        const server =
          await execView(
            environment,
            { port: '0' });

        try {
          assert.equal(
            environment.stdout.toString(),
            `Serving ${library.path} at ${serverUrl(server)}\n`);

          assert.match(
            await (await fetch(
              new URL(
                '/one.md',
                serverUrl(server)))).text(),
            /<h1>One<\/h1>/);
        } finally {
          await new Promise(
            resolve => server.close(resolve));
        }

        await assert.rejects(
          execView(
            environment,
            { port: 'x' }),
          /Invalid port: x/);
      });
  });
