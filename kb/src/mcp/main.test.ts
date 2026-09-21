import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { main,
         readOptions }
  from './main.js';

test(
  'options default to an indexed server that only serves standard input',
  () =>
  {
    assert.deepEqual(
      readOptions([ ]),
      { library: null,
        index: true,
        listen: null });
  });

test(
  'options read the library, the index switch and the endpoint',
  () =>
  {
    assert.deepEqual(
      readOptions(
        [ '--library',
          '/tmp/library',
          '--no-index',
          '--listen',
          '/tmp/kb.sock' ]),
      { library: '/tmp/library',
        index: false,
        listen: '/tmp/kb.sock' });
  });

test(
  'listen without an address asks for the address of the library',
  () =>
  {
    assert.deepEqual(
      readOptions(
        [ '--listen' ]),
      { library: null,
        index: true,
        listen: '' });

    assert.deepEqual(
      readOptions(
        [ '--listen',
          '--no-index' ]),
      { library: null,
        index: false,
        listen: '' });
  });

test(
  'a missing library value is not taken from the next option',
  () =>
  {
    assert.deepEqual(
      readOptions(
        [ '--library',
          '--no-index' ]),
      { library: null,
        index: false,
        listen: null });
  });

test(
  'main is the mcp entry point',
  () =>
  {
    assert.equal(
      typeof main,
      'function');
  });
