import assert
  from 'node:assert/strict';
import { existsSync }
  from 'node:fs';
import test
  from 'node:test';
import { formatFileList,
         main }
  from './main.js';
import { TmpDir }
  from '../tmp-dir.js';
import { createLogger }
  from '../logger.js';

const logger =
  createLogger();

test.after(
  () => logger.dispose());

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

function quoteShellArg(
    value: string
  ): string
{
  return `"${value.replace(
    /"/g,
    '\"')}"`;
}

function nodeCommand(
    source: string
  ): string
{
  return `${quoteShellArg(
    process.execPath)} -e ${quoteShellArg(
    source)}`;
}

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

test(
  'formatFileList returns markdown table of envelope files',
  () => {
    const output =
      formatFileList(
        { instruction: '',
          files: [
            { path: 'src/index.ts',
              type: 'text',
              content: 'content',
              complete: true },
            { path: 'assets/logo.png',
              type: 'binary' },
            { path: 'docs/partial.md',
              type: 'text',
              content: 'partial',
              complete: false }
          ] });

    assert.equal(
      output,
      [
        '| Location | Complete | Type |',
        '| --- | --- | --- |',
        '| src/index.ts | yes | text |',
        '| assets/logo.png |  | binary |',
        '| docs/partial.md | no | text |',
        ''
      ].join(
        '\n'));
  });

test(
  'formatFileList escapes markdown table cell separators',
  () => {
    const output =
      formatFileList(
        { instruction: '',
          files: [
            { path: 'docs/a|b.md',
              type: 'text',
              complete: true }
          ] });

    assert.equal(
      output,
      [
        '| Location | Complete | Type |',
        '| --- | --- | --- |',
        String.raw`| docs/a\|b.md | yes | text |`,
        ''
      ].join(
        '\n'));
  });

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
