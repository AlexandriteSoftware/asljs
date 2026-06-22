import assert
  from 'node:assert/strict';
import { readFile, writeFile }
  from 'node:fs/promises';
import { existsSync }
  from 'node:fs';
import { join }
  from 'node:path';
import test
  from 'node:test';
import { main }
  from './main.js';
import { withTmpDir }
  from './tmp-dir.js';

function withEnv(
    updates: Record<string, string | undefined>,
    action: () => void | Promise<void>
  ): Promise<void>
{
  const previous =
    new Map<string, string | undefined>();

  for (const name of Object.keys(
      updates)) {
    previous.set(
      name,
      process.env[name]);

    const value =
      updates[name];

    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] =
        value;
    }
  }

  return Promise.resolve()
    .then(
      action)
    .finally(
      () => {
        for (const [name, value] of previous) {
          if (value === undefined) {
            delete process.env[name];
          } else {
            process.env[name] =
              value;
          }
        }
      });
}

function argv(
    ...args: string[]
  ): string[]
{
  return [
    'node',
    'cog',
    ...args
  ];
}

test(
  'importing main has no CLI side effects',
  () => {
    assert.equal(
      process.exitCode,
      undefined);
  });

test(
  'main reads files using --envelope before COG_ENVELOPE_PATH',
  async () => {
    await withTmpDir(
      async dir => {
        const cliEnvelopePath =
          join(
            dir,
            'cli-envelope.json');

        const envEnvelopePath =
          join(
            dir,
            'env-envelope.json');

        const filePath =
          join(
            dir,
            'file.txt');

        await writeFile(
          filePath,
          'hello\n',
          'utf8');

        await withEnv(
          { COG_ENVELOPE_PATH: envEnvelopePath },
          async () => {
            await main(
              argv(
                '--envelope',
                cliEnvelopePath,
                'read',
                filePath));
          });

        assert.equal(
          existsSync(
            cliEnvelopePath),
          true);

        assert.equal(
          existsSync(
            envEnvelopePath),
          false);
      });
  });

test(
  'main reads files using COG_ENVELOPE_PATH when --envelope is omitted',
  async () => {
    await withTmpDir(
      async dir => {
        const envelopePath =
          join(
            dir,
            'env-envelope.json');

        const filePath =
          join(
            dir,
            'file.txt');

        await writeFile(
          filePath,
          'hello\n',
          'utf8');

        await withEnv(
          { COG_ENVELOPE_PATH: envelopePath },
          async () => {
            await main(
              argv(
                'read',
                filePath));
          });

        assert.equal(
          existsSync(
            envelopePath),
          true);
      });
  });

test(
  'main keeps existing missing-envelope error behavior',
  async () => {
    await withEnv(
      { COG_ENVELOPE_PATH: undefined },
      async () => {
        await assert.rejects(
          () => main(
            argv(
              'read',
              'file.txt')),
          /COG_ENVELOPE_PATH is required/);
      });
  });

test(
  'apply-patch uses --patch before COG_PATCH_PATH',
  async () => {
    await withTmpDir(
      async dir => {
        const envelopePath =
          join(
            dir,
            'envelope.json');

        const cliPatchPath =
          join(
            dir,
            'cli-patch.json');

        const envPatchPath =
          join(
            dir,
            'env-patch.json');

        await writeFile(
          cliPatchPath,
          '{"commands":[]}\n',
          'utf8');

        await writeFile(
          envPatchPath,
          '{"commands":[{"command":"unknown"}]}\n',
          'utf8');

        await withEnv(
          { COG_PATCH_PATH: envPatchPath },
          async () => {
            await main(
              argv(
                '--envelope',
                envelopePath,
                '--patch',
                cliPatchPath,
                'apply-patch'));
          });

        assert.equal(
          existsSync(
            envelopePath),
          true);
      });
  });

test(
  'apply-patch falls back to COG_PATCH_PATH',
  async () => {
    await withTmpDir(
      async dir => {
        const envelopePath =
          join(
            dir,
            'envelope.json');

        const patchPath =
          join(
            dir,
            'env-patch.json');

        await writeFile(
          patchPath,
          '{"commands":[]}\n',
          'utf8');

        await withEnv(
          { COG_PATCH_PATH: patchPath },
          async () => {
            await main(
              argv(
                '--envelope',
                envelopePath,
                'apply-patch'));
          });

        assert.equal(
          existsSync(
            envelopePath),
          true);
      });
  });

test(
  'apply-patch keeps existing missing-patch error behavior',
  async () => {
    await withTmpDir(
      async dir => {
        const envelopePath =
          join(
            dir,
            'envelope.json');

        await withEnv(
          { COG_PATCH_PATH: undefined },
          async () => {
            await assert.rejects(
              () => main(
                argv(
                  '--envelope',
                  envelopePath,
                  'apply-patch')),
              /COG_PATCH_PATH is required/);
          });
      });
  });

test(
  'apply-patch rejects a missing selected patch file',
  async () => {
    await withTmpDir(
      async dir => {
        const envelopePath =
          join(
            dir,
            'nested',
            'envelope.json');

        const patchPath =
          join(
            dir,
            'missing-patch.json');

        await assert.rejects(
          () => main(
            argv(
              '--envelope',
              envelopePath,
              '--patch',
              patchPath,
              'apply-patch')),
          /Patch file does not exist:/);

        assert.equal(
          existsSync(
            envelopePath),
          false);
      });
  });

test(
  'apply-patch checks the CLI patch path exists before using COG_PATCH_PATH',
  async () => {
    await withTmpDir(
      async dir => {
        const envelopePath =
          join(
            dir,
            'envelope.json');

        const cliPatchPath =
          join(
            dir,
            'missing-cli-patch.json');

        const envPatchPath =
          join(
            dir,
            'env-patch.json');

        await writeFile(
          envPatchPath,
          '{"commands":[]}\n',
          'utf8');

        await withEnv(
          { COG_PATCH_PATH: envPatchPath },
          async () => {
            await assert.rejects(
              () => main(
                argv(
                  '--envelope',
                  envelopePath,
                  '--patch',
                  cliPatchPath,
                  'apply-patch')),
              /Patch file does not exist:/);
          });

        assert.equal(
          existsSync(
            envelopePath),
          false);
      });
  });
