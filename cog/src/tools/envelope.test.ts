import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLoggerProvider }
  from '../logger.js';
import { type Envelope }
  from '../working-folder/envelope.js';
import { EnvelopeTool }
  from './envelope.js';

const loggerProvider =
  createLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

test(
  'envelope tool returns update parameters of tracked files',
  () =>
  {
    const envelope: Envelope =
      { instruction: '',
        files:
          [ { path: 'one.txt',
              type: 'text',
              update:
                { command: 'read',
                  pattern: 'one.txt' } },
            { path: 'two.txt',
              type: 'text' } ] };

    assert.deepEqual(
      new EnvelopeTool()
        .getUpdateParameters(
          envelope),
      [ { command: 'read',
          pattern: 'one.txt' } ]);
  });

test(
  'envelope tool writes and removes project files',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'envelope.test'));

    const filePath =
      workspace.resolve(
        'file.txt');

    const envelope: Envelope =
      { instruction: '',
        files:
          [ { path: filePath,
              type: 'text' } ] };

    const tool =
      new EnvelopeTool();

    await tool.writeFile(
      envelope,
      { command: 'write',
        path: filePath,
        content: 'content' });

    assert.equal(
      await workspace.readText(
        'file.txt'),
      'content');

    await tool.removeFile(
      envelope,
      { command: 'remove',
        path: filePath });

    assert.deepEqual(
      envelope.files,
      [ ]);
  });

test(
  'envelope tool adds files to the envelope',
  async () =>
  {
    await using workspace =
      new TmpDir(
        loggerProvider.getLogger(
          'envelope.test'));

    await workspace.writeText(
      'file.txt',
      'content');

    const envelope: Envelope =
      { instruction: '',
        files: [ ] };

    await new EnvelopeTool()
      .addFiles(
        envelope,
        { command: 'read',
          pattern:
            workspace.resolve(
              'file.txt')
            .replace(
              /\\/g,
              '/'),
          readToEnd: true });

    assert.equal(
      envelope.files.length,
      1);

    assert.equal(
      envelope.files[0].content,
      'content');
  });

test(
  'envelope tool sets the instruction and task fields',
  () =>
  {
    const envelope: Envelope =
      { instruction: '',
        files: [ ] };

    const tool =
      new EnvelopeTool();

    tool.setInstruction(
      envelope,
      'do the thing');

    tool.setTask(
      envelope,
      'implement the feature');

    assert.equal(
      envelope.instruction,
      'do the thing');

    assert.equal(
      envelope.task,
      'implement the feature');
  });
