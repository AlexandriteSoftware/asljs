import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestEnvironment,
         withLibrary }
  from '../testing/library.js';
import { execConfig }
  from './config.js';

test(
  'config prints the library root and the readable extensions',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await execConfig(environment);

        const output =
          environment.stdout.toString();

        assert.match(
          output,
          new RegExp(
            `^library: ${library.path.replace(
              /\\/g,
              '\\\\')}$`,
            'm'));

        assert.match(
          output,
          /^readable: .*\.md.*\.pdf/m);
      });
  });

test(
  'config prints the configuration as json',
  async () =>
  {
    await withLibrary(
      {},
      async (
          library
        ) =>
      {
        const environment =
          createTestEnvironment(library);

        await execConfig(
          environment,
          { format: 'json' });

        const config =
          JSON.parse(
            environment.stdout.toString()) as
            { library: string; readable: string[]; };

        assert.equal(
          config.library,
          library.path);

        assert.equal(
          config.readable.includes('.pdf'),
          true);
      });
  });
