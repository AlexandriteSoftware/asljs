import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createTestContext,
         withLibrary }
  from '../testing/library.js';
import { execRender }
  from './render.js';

test(
  'render prints the HTML of a document, or its path, title and HTML as json',
  async () =>
  {
    await withLibrary(
      { 'one.md':
          '---\ntitle: First\n---\n# One\n' },
      async (
          library
        ) =>
      {
        const text =
          createTestContext(library);

        await execRender(
          text,
          { path: 'one.md' });

        assert.equal(
          text.environment.stdout.toString(),
          '<h1>One</h1>\n');

        const json =
          createTestContext(library);

        await execRender(
          json,
          { path: 'one.md',
            format: 'json' });

        assert.deepEqual(
          JSON.parse(
            json.environment.stdout.toString()),
          { path: 'one.md',
            title: 'First',
            html: '<h1>One</h1>\n' });
      });
  });
