import { existsSync }
  from 'node:fs';
import { mkdir,
         readFile,
         rm,
         writeFile }
  from 'node:fs/promises';
import { dirname }
  from 'node:path';

interface Backup
{
  files: BackupFile[];
}

interface BackupFile
{
  path: string;
  existed: boolean;
  content?: string;
}

export interface RollbackFeed
{
  saveFileState: (
    path: string
  ) => Promise<void>;
  rollbackLast: () => Promise<void>;
  rollbackAll: () => Promise<void>;
}

export class BackupRollbackFeed implements RollbackFeed
{
  constructor(
    private readonly backupPath: string
  )
  {
  }

  static async create(
    backupPath: string
  ): Promise<BackupRollbackFeed>
  {
    const backup: Backup =
      { files: [] };

    await mkdir(
      dirname(
        backupPath),
      { recursive: true });

    await writeFile(
      backupPath,
      `${
        JSON.stringify(
          backup,
          null,
          2)
      }\n`,
      'utf8');

    return new BackupRollbackFeed(
      backupPath
    );
  }

  static async restoreAndDelete(
    backupPath: string
  ): Promise<void>
  {
    const rollbackFeed =
      new BackupRollbackFeed(
      backupPath
    );

    await rollbackFeed.rollbackAll();
    await rollbackFeed.delete();
  }

  async delete(): Promise<void>
  {
    await rm(
      this.backupPath,
      { force: true });
  }

  async saveFileState(
    filePath: string
  ): Promise<void>
  {
    const backup =
      await this.load();

    if (
      existsSync(
        filePath)
    ) {
      backup.files
        .push(
          {
            path: filePath,
            existed: true,
            content: (await readFile(
              filePath))
              .toString(
                'base64')
          });
    } else {
      backup.files
        .push(
          { path: filePath, existed: false });
    }

    await this.save(
      backup);
  }

  async rollbackLast(): Promise<void>
  {
    const backup =
      await this.load();

    const file =
      backup.files.pop();

    if (file === undefined) {
      return;
    }

    await restoreFile(
      file);

    await this.save(
      backup);
  }

  async rollbackAll(): Promise<void>
  {
    const backup =
      await this.load();

    for (
      const file of [
        ...backup.files
      ].reverse()
    ) {
      await restoreFile(
        file);
    }

    backup.files = [];

    await this.save(
      backup);
  }

  private async load(): Promise<Backup>
  {
    return JSON.parse(
      await readFile(
        this.backupPath,
        'utf8')) as Backup;
  }

  private async save(
    backup: Backup
  ): Promise<void>
  {
    await writeFile(
      this.backupPath,
      `${
        JSON.stringify(
          backup,
          null,
          2)
      }\n`,
      'utf8');
  }
}

async function restoreFile(
    file: BackupFile
  ): Promise<void>
{
  if (file.existed) {
    await mkdir(
      dirname(
        file.path),
      { recursive: true });

    await writeFile(
      file.path,
      Buffer.from(
        file.content ?? '',
        'base64'));
  } else {
    await rm(
      file.path,
      { recursive: true, force: true });
  }
}
