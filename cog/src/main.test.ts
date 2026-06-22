import assert
  from 'node:assert/strict';
import { readFile }
  from 'node:fs/promises';
import { existsSync }
  from 'node:fs';
import test
  from 'node:test';
import { main }
  from './main.js';
import { TmpDir }
  from './tmp-dir.js';
import { createLogger }
  from './logging.js';

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

test(
  'apply-patch rolls back file writes through command rollback feed',
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
            content: 'new\n' },
          { command: 'unknown' }
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
          'apply-patch')),
      /Unknown patch command unknown/);

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
  'apply-patch rolls repeated command rollback entries from last to first',
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
            content: 'middle\n' },
          { command: 'write',
            path: filePath,
            content: 'new\n' },
          { command: 'unknown' }
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
          'apply-patch')),
      /Unknown patch command unknown/);

    assert.equal(
      workspace.readText(
        'file.txt'),
      'old\n');
  });

test(
  'apply-patch stops when backup.json exists',
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

    workspace.writeText(
      'backup.json',
      `${JSON.stringify(
        { files: [] },
        null,
        2)}\n`);

    workspace.writeText(
      'patch.json',
      `${JSON.stringify(
        { commands: [] },
        null,
        2)}\n`);

    await assert.rejects(
      () => main(
        argv(
          '--envelope',
          envelopePath,
          '--patch',
          patchPath,
          'apply-patch')),
      /backup\.json exists/);
  });

test(
  'restore restores files from backup and removes backup.json',
  async t => {
    const workspace =
      new TmpDir(
        logger);

    t.after(
      () => workspace.cleanup());

    const envelopePath =
      workspace.resolve(
        'envelope.json');

    const filePath =
      workspace.resolve(
        'file.txt');

    const createdPath =
      workspace.resolve(
        'created.txt');

    workspace.writeText(
      'file.txt',
      'changed\n');

    workspace.writeText(
      'created.txt',
      'created\n');

    workspace.writeText(
      'backup.json',
      `${JSON.stringify(
        { files: [
          { path: filePath,
            existed: true,
            content: Buffer.from(
              'old\n')
              .toString(
                'base64') },
          { path: createdPath,
            existed: false }
        ] },
        null,
        2)}\n`);

    await main(
      argv(
        '--envelope',
        envelopePath,
        'restore'));

    assert.equal(
      workspace.readText(
        'file.txt'),
      'old\n');

    assert.equal(
      existsSync(
        createdPath),
      false);

    assert.equal(
      existsSync(
        workspace.resolve(
          'backup.json')),
      false);
  });

test(
  'apply-patch deletes backup and updates envelope files after success',
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
      'envelope.json',
      `${JSON.stringify(
        { instruction: '',
          files: [
            { path: filePath,
              type: 'text',
              content: 'old\n',
              complete: true,
              update: {
                command: 'read',
                pattern: filePath,
                exclude: [],
                lines: 150,
                sizeKb: 15,
                readToEnd: false,
                withBinaryB64: false
              } }
          ] },
        null,
        2)}\n`);

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
        'apply-patch'));

    const envelope =
      JSON.parse(
        await readFile(
          envelopePath,
          'utf8'));

    assert.equal(
      workspace.readText(
        'file.txt'),
      'new\n');

    assert.equal(
      envelope.files[0].content,
      'new\n');

    assert.equal(
      existsSync(
        workspace.resolve(
          'backup.json')),
      false);
  });
