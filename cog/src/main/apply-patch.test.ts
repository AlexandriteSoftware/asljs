import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import { existsSync }
  from 'node:fs';
import test
  from 'node:test';
import { createLogger }
  from '../logger.js';
import { main }
  from './main.js';
import { argv,
         nodeCommand,
         withEnv }
  from './test-helpers.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose()
);

test(
  'apply-patch accepts a patch when --patch-verify-cmd exits with zero',
  async () =>
  {
    await using workspace =
      new TmpDir(
      logger
    );

    const envelopePath =
      workspace.resolve(
        'envelope.json');

    await workspace.writeText(
      'envelope.json',
      JSON.stringify(
        { instruction: '', files: [] },
        null,
        2
      )
    );

    const patchPath =
      workspace.resolve(
        'patch.json');

    const filePath =
      workspace.resolve(
        'file.txt');

    await workspace.writeText(
      'patch.json',
      JSON.stringify(
        {
          commands: [
            { command: 'write', path: filePath, content: 'new\n' }
          ]
        },
        null,
        2
      )
    );

    await main(
      argv(
        '--envelope',
        envelopePath,
        '--patch',
        patchPath,
        'apply-patch',
        '--patch-verify-cmd',
        nodeCommand(
          'process.exit(0)'
        )
      )
    );

    assert.equal(
      await workspace.readText(
        'file.txt'
      ),
      'new\n'
    );

    assert.equal(
      existsSync(
        workspace.resolve(
          '.cog/backup.json'
        )
      ),
      false
    );
  }
);

test(
  'apply-patch rolls back when --patch-verify-cmd exits non-zero',
  async () =>
  {
    await using workspace =
      new TmpDir(
      logger
    );

    const envelopePath =
      workspace.resolve(
        'envelope.json');

    await workspace.writeText(
      'envelope.json',
      JSON.stringify(
        { instruction: '', files: [] },
        null,
        2
      )
    );

    const patchPath =
      workspace.resolve(
        'patch.json');

    const filePath =
      workspace.resolve(
        'file.txt');

    await workspace.writeText(
      'file.txt',
      'old\n'
    );

    await workspace.writeText(
      'patch.json',
      `${
        JSON.stringify(
          {
            commands: [
              { command: 'write', path: filePath, content: 'new\n' }
            ]
          },
          null,
          2
        )
      }\n`
    );

    await assert.rejects(
      () =>
        main(
          argv(
            '--envelope',
            envelopePath,
            '--patch',
            patchPath,
            'apply-patch',
            '--patch-verify-cmd',
            nodeCommand(
              'process.exit(7)'
            )
          )
        ),
      /Patch verify command failed with exit code 7/
    );

    assert.equal(
      await workspace.readText(
        'file.txt'
      ),
      'old\n'
    );

    assert.equal(
      existsSync(
        workspace.resolve(
          '.cog/backup.json'
        )
      ),
      false
    );
  }
);

test(
  'apply-patch uses COG_PATCH_VERIFY_CMD when --patch-verify-cmd is omitted',
  async () =>
  {
    await using workspace =
      new TmpDir(
      logger
    );

    const envelopePath =
      workspace.resolve(
        'envelope.json');

    await workspace.writeText(
      'envelope.json',
      JSON.stringify(
        { instruction: '', files: [] },
        null,
        2
      )
    );

    const patchPath =
      workspace.resolve(
        'patch.json');

    const filePath =
      workspace.resolve(
        'file.txt');

    await workspace.writeText(
      'file.txt',
      'old\n'
    );

    await workspace.writeText(
      'patch.json',
      `${
        JSON.stringify(
          {
            commands: [
              { command: 'write', path: filePath, content: 'new\n' }
            ]
          },
          null,
          2
        )
      }\n`
    );

    await withEnv(
      {
        COG_PATCH_VERIFY_CMD: nodeCommand(
          'process.exit(3)'
        )
      },
      async () =>
      {
        await assert.rejects(
          () =>
            main(
              argv(
                '--envelope',
                envelopePath,
                '--patch',
                patchPath,
                'apply-patch'
              )
            ),
          /Patch verify command failed with exit code 3/
        );
      }
    );

    assert.equal(
      await workspace.readText(
        'file.txt'
      ),
      'old\n'
    );
  }
);

test(
  '--patch-verify-cmd takes precedence over COG_PATCH_VERIFY_CMD',
  async () =>
  {
    await using workspace =
      new TmpDir(
      logger
    );

    const envelopePath =
      workspace.resolve(
        'envelope.json');

    await workspace.writeText(
      'envelope.json',
      JSON.stringify(
        { instruction: '', files: [] },
        null,
        2
      )
    );

    const patchPath =
      workspace.resolve(
        'patch.json');

    const filePath =
      workspace.resolve(
        'file.txt');

    await workspace.writeText(
      'patch.json',
      `${
        JSON.stringify(
          {
            commands: [
              { command: 'write', path: filePath, content: 'new\n' }
            ]
          },
          null,
          2
        )
      }\n`
    );

    await withEnv(
      {
        COG_PATCH_VERIFY_CMD: nodeCommand(
          'process.exit(9)'
        )
      },
      async () =>
      {
        await main(
          argv(
            '--envelope',
            envelopePath,
            '--patch',
            patchPath,
            'apply-patch',
            '--patch-verify-cmd',
            nodeCommand(
              'process.exit(0)'
            )
          )
        );
      }
    );

    assert.equal(
      await workspace.readText(
        'file.txt'
      ),
      'new\n'
    );
  }
);
