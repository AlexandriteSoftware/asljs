import { type ReadParameters }
  from '../commands/read.js';
import { type Remove }
  from '../commands/remove.js';
import { type Write }
  from '../commands/write.js';
import { type CopilotRequest }
  from '../copilot.js';
import { TaskRegistry }
  from '../task.js';
import { BuildTask,
         type BuildTaskParameters }
  from './build.js';
import { CleanWorkingFolderTask,
         type CleanWorkingFolderTaskParameters }
  from './clean-working-folder.js';
import { CommitIfChangedTask,
         type CommitIfChangedTaskParameters }
  from './commit-if-changed.js';
import { CommitTask,
         type CommitTaskParameters }
  from './commit.js';
import { CopilotCheckTask,
         type CopilotCheckTaskParameters }
  from './copilot-check.js';
import { CopilotTask }
  from './copilot.js';
import { EnvelopeAddFilesTask }
  from './envelope-add-files.js';
import { EnvelopeInstructionTask,
         type EnvelopeInstructionTaskParameters }
  from './envelope-instruction.js';
import { EnvelopeProcessTask }
  from './envelope-process.js';
import { EnvelopeRemoveFileTask }
  from './envelope-remove-file.js';
import { EnvelopeTaskTask,
         type EnvelopeTaskTaskParameters }
  from './envelope-task.js';
import { EnvelopeUpdateFilesTask }
  from './envelope-update-files.js';
import { EnvelopeWriteFileTask }
  from './envelope-write-file.js';
import { ExtractTodosTask,
         type ExtractTodosTaskParameters }
  from './extract-todos.js';
import { FindTodoTask,
         type FindTodoTaskParameters }
  from './find-todo.js';
import { FormatChangedFilesTask,
         type FormatChangedFilesTaskParameters }
  from './format-changed-files.js';
import { GetChangedFilesTask,
         type GetChangedFilesTaskParameters }
  from './get-changed-files.js';
import { GetCommitMessageTask,
         type GetCommitMessageTaskParameters }
  from './get-commit-message.js';
import { RestoreTask,
         type RestoreTaskParameters }
  from './restore.js';
import { TestTask,
         type TestTaskParameters }
  from './test.js';
import { TodoTask,
         type TodoTaskParameters }
  from './todo.js';

export function registerCoreTasks(
    registry: TaskRegistry
  ): void
{
  registry.register(
    'copilot',
    parameters =>
      new CopilotTask(
        parameters as CopilotRequest),
    { description:
        'send a prompt to the Copilot service',
      parameters:
        [ { name: 'prompt',
            type: 'string' } ] });

  registry.register(
    'copilot-check',
    parameters =>
      new CopilotCheckTask(
        parameters as CopilotCheckTaskParameters),
    { description:
        'start the Copilot ACP server, send two prompts, then stop it',
      parameters:
        [ { name: 'prompts',
            type: 'string[]' } ] });

  registry.register(
    'get-changed-files',
    parameters =>
      new GetChangedFilesTask(
        parameters as GetChangedFilesTaskParameters),
    { description:
        'list modified and untracked files',
      parameters:
        [ { name: 'workingDirectory',
            type: 'string' } ] });

  registry.register(
    'format-changed-files',
    parameters =>
      new FormatChangedFilesTask(
        parameters as FormatChangedFilesTaskParameters),
    { description:
        'format changed files by file type',
      parameters:
        [ { name: 'workingDirectory',
            type: 'string' },
          { name: 'asljsConfigPath',
            type: 'string' },
          { name:
              'markdownConfigPath',
            type: 'string' },
          { name: 'dotnetTarget',
            type: 'string' },
          { name: 'dotnetProfile',
            type: 'string' } ] });

  registry.register(
    'extract-todos',
    parameters =>
      new ExtractTodosTask(
        parameters as ExtractTodosTaskParameters),
    { description:
        'collect TODO entries from the codebase',
      parameters:
        [ { name: 'patterns',
            type: 'string[]' } ] });

  registry.register(
    'find-todo',
    parameters =>
      new FindTodoTask(
        parameters as FindTodoTaskParameters),
    { description:
        'print the first TODO and add it to the context',
      parameters:
        [ { name: 'patterns',
            type: 'string[]' } ] });

  registry.register(
    'envelope-add-files',
    parameters =>
      new EnvelopeAddFilesTask(
        parameters as ReadParameters),
    { description:
        'add matching files to the envelope',
      requiresEnvelope: true,
      parameters:
        [ { name: 'pattern',
            type: 'string' },
          { name: 'exclude',
            type: 'string[]' },
          { name: 'lines',
            type: 'number' },
          { name: 'sizeKb',
            type: 'number' },
          { name: 'readToEnd',
            type: 'boolean' },
          { name: 'withBinaryB64',
            type: 'boolean' } ] });

  registry.register(
    'envelope-write-file',
    parameters =>
      new EnvelopeWriteFileTask(
        parameters as Write),
    { description:
        'create a project file or replace its content',
      requiresEnvelope: true,
      parameters:
        [ { name: 'path',
            type: 'string' },
          { name: 'content',
            type: 'string' } ] });

  registry.register(
    'envelope-remove-file',
    parameters =>
      new EnvelopeRemoveFileTask(
        parameters as Remove),
    { description:
        'remove a project file and its envelope entry',
      requiresEnvelope: true,
      parameters:
        [ { name: 'path',
            type: 'string' } ] });

  registry.register(
    'envelope-update-files',
    () => new EnvelopeUpdateFilesTask(),
    { description:
        'refresh envelope files using their update commands',
      requiresEnvelope: true });

  registry.register(
    'envelope-instruction',
    parameters =>
      new EnvelopeInstructionTask(
        parameters as EnvelopeInstructionTaskParameters),
    { description:
        'set the instruction field of the envelope',
      requiresEnvelope: true,
      parameters:
        [ { name: 'instruction',
            type: 'string' } ] });

  registry.register(
    'envelope-task',
    parameters =>
      new EnvelopeTaskTask(
        parameters as EnvelopeTaskTaskParameters),
    { description:
        'set the task field of the envelope',
      requiresEnvelope: true,
      parameters:
        [ { name: 'task',
            type: 'string' } ] });

  registry.register(
    'envelope-process',
    () => new EnvelopeProcessTask(),
    { description:
        'send the envelope instruction, task, and files to the copilot task',
      requiresEnvelope: true });

  registry.register(
    'restore',
    parameters =>
      new RestoreTask(
        parameters as RestoreTaskParameters),
    { description:
        'restore files from backup.json',
      parameters:
        [ { name: 'backupPath',
            type: 'string' } ] });

  registry.register(
    'get-commit-message',
    parameters =>
      new GetCommitMessageTask(
        parameters as GetCommitMessageTaskParameters),
    { description:
        'ask Copilot for a commit message summarising the working folder',
      parameters:
        [ { name: 'workingDirectory',
            type: 'string' } ] });

  registry.register(
    'commit',
    parameters =>
      new CommitTask(
        parameters as CommitTaskParameters),
    { description:
        'get a commit message and commit all changes',
      parameters:
        [ { name: 'workingDirectory',
            type: 'string' } ] });

  registry.register(
    'commit-if-changed',
    parameters =>
      new CommitIfChangedTask(
        parameters as CommitIfChangedTaskParameters),
    { description:
        'commit all changes, or do nothing when the working folder is clean',
      parameters:
        [ { name: 'workingDirectory',
            type: 'string' } ] });

  registry.register(
    'clean-working-folder',
    parameters =>
      new CleanWorkingFolderTask(
        parameters as CleanWorkingFolderTaskParameters),
    { description:
        'back up the diff and untracked files, then discard all local changes',
      parameters:
        [ { name: 'workingDirectory',
            type: 'string' } ] });

  registry.register(
    'build',
    parameters =>
      new BuildTask(
        parameters as BuildTaskParameters),
    { description:
        'run npm run build or dotnet build, and return build issues',
      parameters:
        [ { name: 'workingDirectory',
            type: 'string' } ] });

  registry.register(
    'test',
    parameters =>
      new TestTask(
        parameters as TestTaskParameters),
    { description:
        'run npm run test or dotnet test, and return test issues',
      parameters:
        [ { name: 'workingDirectory',
            type: 'string' } ] });

  registry.register(
    'todo',
    parameters =>
      new TodoTask(
        parameters as TodoTaskParameters),
    { description:
        'commit pending changes, then find and address the first TODO',
      parameters:
        [ { name: 'workingDirectory',
            type: 'string' },
          { name: 'patterns',
            type: 'string[]' } ] });
}
