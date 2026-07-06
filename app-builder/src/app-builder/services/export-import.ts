import { AppRecord,
         AppAuthor,
         FileRecord }
  from '../types.js';

export type ExportPayload =
  { id: string;
    name: string;
    author?: AppAuthor;
    files: Record<string, string>; };

export type ImportedPayload =
  ExportPayload;

export type BuildExportPayloadOptions =
  { app: AppRecord;
    files: FileRecord[]; };

export type CreateImportPlanOptions =
  { payload: ImportedPayload;
    existingApps: AppRecord[];
    navigateToExistingById: boolean;
    now: string;
    createId: () => string;
    createUuid: () => string; };

export type ImportPlan =
  | { kind: 'existing';
      appId: string; }
  | { kind: 'duplicate'; }
  | { kind: 'new';
      app: AppRecord;
      files: FileRecord[]; };

export function buildExportPayload(
    options: BuildExportPayloadOptions
  ): ExportPayload
{
  const files: Record<string, string> = {};

  for (const file of options.files) {
    files[file.name] = file.content;
  }

  return {
    id: options.app.id,
    name: options.app.name,
    author: normalizeAuthor(options.app.author),
    files,
  };
}

export function parseImportedPayloadText(
    text: string
  ): ImportedPayload
{
  const payload =
    JSON.parse(text) as ImportedPayload;

  validateImportedPayload(payload);

  return payload;
}

export function createImportPlan(
    options: CreateImportPlanOptions
  ): ImportPlan
{
  validateImportedPayload(options.payload);

  const existingById =
    options.existingApps.find(item => item.id === options.payload.id);

  if (existingById !== undefined) {
    if (options.navigateToExistingById) {
      return {
        kind: 'existing',
        appId: existingById.id,
      };
    }

    return {
      kind: 'duplicate',
    };
  }

  const app: AppRecord =
    {
      id: options.payload.id,
      uuid: options.createUuid(),
      name: options.payload.name,
      author: normalizeAuthor(options.payload.author),
      createdAt: options.now,
      updatedAt: options.now,
    };

  const files =
    Object.entries(options.payload.files)
      .map(
        ([ name, content ]) =>
          ({ id: options.createId(),
             appId: app.id,
             name,
             content }));

  return {
    kind: 'new',
    app,
    files,
  };
}

function validateImportedPayload(payload: ImportedPayload): void {
  if (typeof payload.id !== 'string' || payload.id.trim() === '') {
    throw new Error('Invalid app JSON format.');
  }

  if (typeof payload.name !== 'string' || payload.name.trim() === '') {
    throw new Error('Invalid app JSON format.');
  }

  if (payload.files === null || typeof payload.files !== 'object') {
    throw new Error('Invalid app JSON format.');
  }

  if (!isValidAuthor(payload.author)) {
    throw new Error('Invalid app JSON format.');
  }

  for (const [ fileName, content ] of Object.entries(payload.files)) {
    if (fileName.trim() === '' || typeof content !== 'string') {
      throw new Error('Invalid app JSON format.');
    }
  }
}

function normalizeAuthor(author: AppAuthor | undefined): AppAuthor | undefined {
  if (author === undefined) {
    return undefined;
  }

  const name =
    typeof author.name === 'string'
      ? author.name.trim()
      : '';
  const email =
    typeof author.email === 'string'
      ? author.email.trim()
      : '';

  if (name === '' && email === '') {
    return undefined;
  }

  return {
    ...(name !== ''
      ? { name }
      : {}),
    ...(email !== ''
      ? { email }
      : {}),
  };
}

function isValidAuthor(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }

  if (value === null || typeof value !== 'object') {
    return false;
  }

  const author = value as { name?: unknown; email?: unknown };

  if (author.name !== undefined && typeof author.name !== 'string') {
    return false;
  }

  if (author.email !== undefined && typeof author.email !== 'string') {
    return false;
  }

  return true;
}
