import { createTestLoggerProvider }
  from 'asljs-logging';
import assert
  from 'node:assert/strict';
import console
  from 'node:console';
import fs
  from 'node:fs/promises';
import os
  from 'node:os';
import path
  from 'node:path';
import test
  from 'node:test';
import { printFile }
  from './print-file.js';

const loggerProvider =
  createTestLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

const logger =
  loggerProvider.getLogger('print-file');

async function capturePrintFile(
    args?: string[]
  ): Promise<string[]>
{
  const lines: string[] = [ ];

  const originalLog = console.log;

  console.log =
    (
        message?: unknown
      ): void =>
    {
    lines.push(
      String(message));
  };

  try {
    await printFile(
      logger,
      args);
  } finally {
    console.log = originalLog;
  }

  return lines;
}

test(
  'printFile writes the file contents without the trailing newline',
  async (): Promise<void> =>
  {
    const dir =
      await fs.mkdtemp(
        path.join(
          os.tmpdir(),
          'print-file-'));

    const filePath =
      path.join(
        dir,
        'notes.md');

    await fs.writeFile(
      filePath,
      '# notes\n\nfirst line\n\n',
      'utf8');

    const lines =
      await capturePrintFile(
        [ filePath ]);

    assert.deepEqual(
      lines,
      [ '# notes\n\nfirst line' ]);

    await fs.rm(
      dir,
      { recursive: true,
        force: true });
  });

test(
  'printFile rejects when no file is given',
  async (): Promise<void> =>
  {
    await assert.rejects(
      () => printFile(logger),
      /print-file requires a file path\./);
  });

test(
  'printFile rejects when the file name is blank',
  async (): Promise<void> =>
  {
    await assert.rejects(
      () =>
        printFile(
          logger,
          [ '   ' ]),
      /print-file requires a file path\./);
  });

test(
  'printFile rejects when the file does not exist',
  async (): Promise<void> =>
  {
    const missing =
      path.join(
        os.tmpdir(),
        'print-file-missing',
        'nothing.md');

    await assert.rejects(
      () =>
        printFile(
          logger,
          [ missing ]));
  });
