import assert
  from 'node:assert/strict';
import { readFile, writeFile }
  from 'node:fs/promises';
import { join }
  from 'node:path';
import test
  from 'node:test';
import { ensureEnvelopeFile,
         getRequiredEnv,
         resolveEnvelopePath }
  from './main.js';
import { withTmpDir }
  from './tmp-dir.js';

test(
  'resolveEnvelopePath uses --envelope before COG_ENVELOPE_PATH',
  () => {
    const previous =
      process.env.COG_ENVELOPE_PATH;

    process.env.COG_ENVELOPE_PATH =
      'env-envelope.json';

    try {
      assert.equal(
        resolveEnvelopePath(
          'cli-envelope.json'),
        'cli-envelope.json');
    } finally {
      if (previous === undefined) {
        delete process.env.COG_ENVELOPE_PATH;
      } else {
        process.env.COG_ENVELOPE_PATH =
          previous;
      }
    }
  });

test(
  'resolveEnvelopePath falls back to COG_ENVELOPE_PATH',
  () => {
    const previous =
      process.env.COG_ENVELOPE_PATH;

    process.env.COG_ENVELOPE_PATH =
      'env-envelope.json';

    try {
      assert.equal(
        resolveEnvelopePath(),
        'env-envelope.json');
    } finally {
      if (previous === undefined) {
        delete process.env.COG_ENVELOPE_PATH;
      } else {
        process.env.COG_ENVELOPE_PATH =
          previous;
      }
    }
  });

test(
  'resolveEnvelopePath keeps existing missing-envelope error behavior',
  () => {
    const previous =
      process.env.COG_ENVELOPE_PATH;

    delete process.env.COG_ENVELOPE_PATH;

    try {
      assert.throws(
        () => resolveEnvelopePath(),
        /COG_ENVELOPE_PATH is required/);
    } finally {
      if (previous !== undefined) {
        process.env.COG_ENVELOPE_PATH =
          previous;
      }
    }
  });

test(
  'getRequiredEnv returns configured environment variable',
  () => {
    const previous =
      process.env.COG_TEST_ENV;

    process.env.COG_TEST_ENV =
      'configured';

    try {
      assert.equal(
        getRequiredEnv(
          'COG_TEST_ENV'),
        'configured');
    } finally {
      if (previous === undefined) {
        delete process.env.COG_TEST_ENV;
      } else {
        process.env.COG_TEST_ENV =
          previous;
      }
    }
  });

test(
  'ensureEnvelopeFile creates a missing envelope file',
  async () => {
    await withTmpDir(
      async dir => {
        const envelopePath =
          join(
            dir,
            'nested',
            'envelope.json');

        await ensureEnvelopeFile(
          envelopePath);

        const envelope =
          JSON.parse(
            await readFile(
              envelopePath,
              'utf8'));

        assert.deepEqual(
          envelope,
          { instruction: '',
            commands: [],
            files: [] });
      });
  });

test(
  'ensureEnvelopeFile does not overwrite an existing envelope file',
  async () => {
    await withTmpDir(
      async dir => {
        const envelopePath =
          join(
            dir,
            'envelope.json');

        const existing =
          '{"instruction":"keep","commands":[1],"files":[2]}\n';

        await writeFile(
          envelopePath,
          existing,
          'utf8');

        await ensureEnvelopeFile(
          envelopePath);

        assert.equal(
          await readFile(
            envelopePath,
            'utf8'),
          existing);
      });
  });
