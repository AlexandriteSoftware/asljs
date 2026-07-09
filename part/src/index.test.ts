import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import * as part
  from './index.js';

test(
  'package root exposes the supported public API',
  () =>
{
  assert.deepEqual(
    Object.keys(part).sort(),
    [ 'ArtefactProvider',
      'MarkdownDocumentProvider',
      'TmpDir',
      'createPinoLoggerProvider',
      'createRuleValidationContext',
      'runCli' ]);
});