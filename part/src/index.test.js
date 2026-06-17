import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import * as part
  from 'asljs-part';

test(
  'package root exposes the supported public API',
  () =>
{
  assert.deepEqual(
    Object.keys(part).sort(),
    [ 'ArtefactProvider',
      'DefinitionProvider',
      'TmpDir',
      'createLogger',     
      'runCli' ]);
});