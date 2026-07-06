import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { main }
  from './main.js';
import { TmpDir }
  from 'asljs-tmpdir';
import { createLogger }
  from '../logger.js';
import { argv }
  from './test-helpers.js';
import { Envelope }
  from '../envelope/envelope.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

test(
  'read CLI normalises Windows path separators in stored update pattern',
  async () => {
    await using workspace =
      new TmpDir(
        logger);

    const envelopePath =
      workspace.resolve(
        'envelope.json');

    await workspace.writeText(
      'docs/one.txt',
      'one\n');

    const pattern =
      workspace.resolve(
          'docs',
          '*.txt')
        .replace(
          /\//g,
          '\\');

    await main(
      argv(
        '--envelope',
        envelopePath,
        'read',
        pattern,
        '--read-to-end'));

    const envelope =
      JSON.parse(
        await workspace.readText(
          'envelope.json')) as Envelope;

    assert.equal(
      envelope.files.length,
      1);

    assert.equal(
      envelope.files[0].content,
      'one\n');

    assert.deepEqual(
      envelope.files[0].update,
      { command: 'read',
        pattern:
          workspace.resolve(
              'docs',
              'one.txt')
            .replace(
              /\\/g,
              '/'),
        exclude: [],
        lines: 150,
        sizeKb: 15,
        readToEnd: true,
        withBinaryB64: false });
  });
