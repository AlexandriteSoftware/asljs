import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createEnvironment }
  from './environment.js';
import { resolveOutputFormat,
         writeJson,
         writeLine,
         writeLines }
  from './output.js';

test(
  'resolveOutputFormat falls back and rejects unknown values',
  () =>
  {
    assert.equal(
      resolveOutputFormat(undefined),
      'text');

    assert.equal(
      resolveOutputFormat(
        '',
        'json'),
      'json');

    assert.equal(
      resolveOutputFormat(' JSON '),
      'json');

    assert.throws(
      () => resolveOutputFormat('yaml'),
      /Unknown output format/);
  });

test(
  'writeJson writes indented json',
  () =>
  {
    const environment =
      createEnvironment();

    writeJson(
      environment,
      { one: 1 });

    assert.equal(
      environment.stdout.toString(),
      '{\n  "one": 1\n}\n');
  });

test(
  'writeLine and writeLines append line breaks',
  () =>
  {
    const environment =
      createEnvironment();

    writeLine(
      environment,
      'one');

    writeLines(
      environment,
      [ 'two',
        'three' ]);

    writeLine(environment);

    assert.equal(
      environment.stdout.toString(),
      'one\ntwo\nthree\n\n');
  });
