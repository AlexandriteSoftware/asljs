import assert
  from 'node:assert/strict';
import { existsSync }
  from 'node:fs';
import test
  from 'node:test';
import { main }
  from './main.js';
import { TmpDir }
  from '../tmp-dir.js';
import { createLogger }
  from '../logger.js';
import { argv,
         nodeCommand,
         withEnv }
  from './test-helpers.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

test(
  'apply-patch accepts a patch when --patch-verify-cmd exits with zero',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    const envelopePath =
      workspace.resolve(
        'envelope.json');

    const patchPath =
      workspace.resolve(
        'patch.json');

    const filePath =
      workspace.resolve(
        'file.txt');

    workspace.writeText(
      'patch.json',
      `${JSON.stringify(
        { commands: [
          { command: 'write',
            path: filePath,
            content: 'new\n' }
        ] },
        null,
        2)}\n`);

    await main(
      argv(
        '--envelope',
        envelopePath,
        '--patch',
        patchPath,
        'apply-patch',
        '--patch-verify-cmd',
        nodeCommand(
          'process.exit(0)')));

    assert.equal(
      workspace.readText(
        'file.txt'),
      'new\n');

    assert.equal(
      existsSync(
        workspace.resolve(
          'backup.json')),
      false);
  });

test(
  'apply-patch rolls back when --patch-verify-cmd exits non-zero',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    const envelopePath =
      workspace.resolve(
        'envelope.json');

    const patchPath =
      workspace.resolve(
        'patch.json');

    const filePath =
      workspace.resolve(
        'file.txt');

    workspace.writeText(
      'file.txt',
      'old\n');

    workspace.writeText(
      'patch.json',
      `${JSON.stringify(
        { commands: [
          { command: 'write',
            path: filePath,
            content: 'new\n' }
        ] },
        null,
        2)}\n`);

    await assert.rejects(
      () => main(
        argv(
          '--envelope',
          envelopePath,
          '--patch',
          patchPath,
          'apply-patch',
          '--patch-verify-cmd',
          nodeCommand(
            'process.exit(7)'))),
      /Patch verify command failed with exit code 7/);

    assert.equal(
      workspace.readText(
        'file.txt'),
      'old\n');

    assert.equal(
      existsSync(
        workspace.resolve(
          'backup.json')),
      false);
  });

test(
  'apply-patch uses COG_PATCH_VERIFY_CMD when --patch-verify-cmd is omitted',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    const envelopePath =
      workspace.resolve(
        'envelope.json');

    const patchPath =
      workspace.resolve(
        'patch.json');

    const filePath =
      workspace.resolve(
        'file.txt');

    workspace.writeText(
      'file.txt',
      'old\n');

    workspace.writeText(
      'patch.json',
      `${JSON.stringify(
        { commands: [
          { command: 'write',
            path: filePath,
            content: 'new\n' }
        ] },
        null,
        2)}\n`);

    await withEnv(
      { COG_PATCH_VERIFY_CMD:
          nodeCommand(
            'process.exit(3)') },
      async () => {
        await assert.rejects(
          () => main(
            argv(
              '--envelope',
              envelopePath,
              '--patch',
              patchPath,
              'apply-patch')),
          /Patch verify command failed with exit code 3/);
      });

    assert.equal(
      workspace.readText(
        'file.txt'),
      'old\n');
  });

test(
  '--patch-verify-cmd takes precedence over COG_PATCH_VERIFY_CMD',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    const envelopePath =
      workspace.resolve(
        'envelope.json');

    const patchPath =
      workspace.resolve(
        'patch.json');

    const filePath =
      workspace.resolve(
        'file.txt');

    workspace.writeText(
      'patch.json',
      `${JSON.stringify(
        { commands: [
          { command: 'write',
            path: filePath,
            content: 'new\n' }
        ] },
        null,
        2)}\n`);

    await withEnv(
      { COG_PATCH_VERIFY_CMD:
          nodeCommand(
            'process.exit(9)') },
      async () => {
        await main(
          argv(
            '--envelope',
            envelopePath,
            '--patch',
            patchPath,
            'apply-patch',
            '--patch-verify-cmd',
            nodeCommand(
              'process.exit(0)')));
      });

    assert.equal(
      workspace.readText(
        'file.txt'),
      'new\n');
  });
