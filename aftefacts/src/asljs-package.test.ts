import { type ArtefactDataProvidingContext }
  from 'asljs-part';
import { createTestLoggerProvider }
  from 'asljs-testing';
import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { getData }
  from './asljs-package.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () =>
  {
    await loggerProvider.dispose();
  });

test(
  'ASLJS Package data lists the package.json of local asljs dependencies',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger('TmpDir'));

    await workspace.writeText(
      'libs/one/package.json',
      JSON.stringify(
        { name: 'asljs-one',
          dependencies:
            { 'asljs-two': '^0.1.0',
              glob: '^13.0.0' } }));

    const context =
      { files:
          { path:
              () => workspace.resolve(
                'libs/one/package.json') } } as unknown as ArtefactDataProvidingContext;

    assert.deepEqual(
      await getData(
        { location:
            'file:libs/one/package.json',
          name: 'package',
          definitions:
            [ 'ASLJS Package' ] },
        context),
      { LocalDeps:
          [ workspace.resolve(
            'libs/two/package.json') ] });
  });
