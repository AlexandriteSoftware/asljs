import {
  type FileRecord,
} from './types.js';

export const README_FILE = 'README.md';
export const PLAN_FILE = 'PLAN.md';
export const CHANGE_FILE = 'CHANGE.md';

const WORKFLOW_FILE_ORDER = [ README_FILE, PLAN_FILE, CHANGE_FILE ] as const;

export function createDefaultWorkflowFiles(
    appId: string,
    appName: string,
    createId: () => string,
  ): FileRecord[]
{
  return WORKFLOW_FILE_ORDER.map(fileName => ({
    id: createId(),
    appId,
    name: fileName,
    content: buildDefaultWorkflowContent(fileName, appName),
  }));
}

export function ensureWorkflowFiles(options:
    { files: FileRecord[];
      appId: string;
      appName: string;
      createId: () => string; },
  ): { files: FileRecord[];
       changed: boolean; }
{
  const existingByName = new Set(
    options.files.map(file => file.name.toLowerCase()));
  const nextFiles = [ ...options.files ];
  let changed = false;

  for (const fileName of WORKFLOW_FILE_ORDER) {
    if (existingByName.has(fileName.toLowerCase())) {
      continue;
    }

    nextFiles.push({
      id: options.createId(),
      appId: options.appId,
      name: fileName,
      content: buildDefaultWorkflowContent(fileName, options.appName),
    });
    changed = true;
  }

  return {
    files: sortWorkflowFilesFirst(nextFiles),
    changed,
  };
}

export function hasOnlyWorkflowFiles(fileNames: string[]): boolean {
  if (fileNames.length === 0) {
    return true;
  }

  return fileNames.every(fileName =>
    WORKFLOW_FILE_ORDER.includes(fileName as typeof WORKFLOW_FILE_ORDER[number]));
}

export function createEmptyPlanContent(): string {
  return [
    '# PLAN',
    '',
    'Pending changes for the next generation cycle go here.',
  ].join('\n');
}

export function createEmptyChangeContent(): string {
  return [
    '# CHANGE',
    '',
    'Active implementation changes for the current generation cycle go here.',
  ].join('\n');
}

function sortWorkflowFilesFirst(files: FileRecord[]): FileRecord[] {
  const priority = new Map<string, number>(
    WORKFLOW_FILE_ORDER.map((name, index) => [ name, index ]));

  return [ ...files ].sort((left, right) => {
    const leftPriority = priority.get(left.name) ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = priority.get(right.name) ?? Number.MAX_SAFE_INTEGER;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.name.localeCompare(right.name);
  });
}

function buildDefaultWorkflowContent(
    fileName: typeof WORKFLOW_FILE_ORDER[number],
    appName: string,
  ): string
{
  switch (fileName) {
    case README_FILE:
      return [
        `# ${appName}`,
        '',
        '## State',
        '',
        '- This app is empty.',
        '- No changes have been implemented yet.',
      ].join('\n');

    case PLAN_FILE:
      return createEmptyPlanContent();

    case CHANGE_FILE:
      return createEmptyChangeContent();
  }
}
