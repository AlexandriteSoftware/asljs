import assert
  from 'node:assert/strict';
import os
  from 'node:os';
import test
  from 'node:test';
import { endpointFor,
         endpointIsFile }
  from './endpoint.js';

test(
  'the endpoint is stable for one library and differs between libraries',
  () =>
  {
    assert.equal(
      endpointFor('/tmp/one'),
      endpointFor('/tmp/one'));

    assert.notEqual(
      endpointFor('/tmp/one'),
      endpointFor('/tmp/two'));
  });

test(
  'the endpoint does not depend on how the path is written',
  () =>
  {
    assert.equal(
      endpointFor('/tmp/one'),
      endpointFor('/tmp/other/../one'));
  });

test(
  'the endpoint lives outside the library',
  () =>
  {
    assert.equal(
      endpointFor('/tmp/one').startsWith(
        os.tmpdir()),
      process.platform !== 'win32');
  });

test(
  'a socket endpoint is a file and a named pipe is not',
  () =>
  {
    assert.equal(
      endpointIsFile(
        '/tmp/asljs-kb-one.sock'),
      true);

    assert.equal(
      endpointIsFile(
        '\\\\.\\pipe\\asljs-kb-one'),
      false);
  });
