import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { main }
  from './main.js';
import { TmpDir }
  from '../tmp-dir.js';
import { createLogger }
  from '../logger.js';
import { argv }
  from './test-helpers.js';
import { type Envelope }
  from '../envelope/envelope.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

test(
  'read CLI normalises Windows path separators in stored update pattern',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    const envelopePath =
      workspace.resolve(
        'envelope.json');

    workspace.writeText(
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
        workspace.readText(
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
