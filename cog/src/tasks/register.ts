import { type CopilotRequest }
  from '../copilot.js';
import { TaskRegistry }
  from '../task.js';
import { type ReadParameters }
  from '../tools/read.js';
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
import { ContextAddFilesTask }
  from './context-add-files.js';
import { ContextInstructionTask,
         type ContextInstructionTaskParameters }
  from './context-instruction.js';
import { ContextProcessTask,
         type ContextProcessTaskParameters }
  from './context-process.js';
import { ContextRemoveFileTask,
         type ContextRemoveFileTaskParameters }
  from './context-remove-file.js';
import { ContextTaskTask,
         type ContextTaskTaskParameters }
  from './context-task.js';
import { ContextUpdateFilesTask }
  from './context-update-files.js';
import { ContextWriteFileTask,
         type ContextWriteFileTaskParameters }
  from './context-write-file.js';
import { CopilotCheckTask,
         type CopilotCheckTaskParameters }
  from './copilot-check.js';
import { CopilotTask }
  from './copilot.js';
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
            type: 'string' },
          { name: 'files',
            type: 'object[]' } ] });

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
    'context-add-files',
    parameters =>
      new ContextAddFilesTask(
        parameters as ReadParameters),
    { description:
        'add matching files to the context',
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
    'context-write-file',
    parameters =>
      new ContextWriteFileTask(
        parameters as ContextWriteFileTaskParameters),
    { description:
        'create a project file or replace its content',
      parameters:
        [ { name: 'path',
            type: 'string' },
          { name: 'content',
            type: 'string' } ] });

  registry.register(
    'context-remove-file',
    parameters =>
      new ContextRemoveFileTask(
        parameters as ContextRemoveFileTaskParameters),
    { description:
        'remove a project file and its envelope entry',
      parameters:
        [ { name: 'path',
            type: 'string' } ] });

  registry.register(
    'context-update-files',
    () => new ContextUpdateFilesTask(),
    { description:
        'refresh envelope files using their update commands' });

  registry.register(
    'context-instruction',
    parameters =>
      new ContextInstructionTask(
        parameters as ContextInstructionTaskParameters),
    { description:
        'set the instruction field of the envelope',
      parameters:
        [ { name: 'instruction',
            type: 'string' } ] });

  registry.register(
    'context-task',
    parameters =>
      new ContextTaskTask(
        parameters as ContextTaskTaskParameters),
    { description:
        'set the task field of the envelope',
      parameters:
        [ { name: 'task',
            type: 'string' } ] });

  registry.register(
    'context-process',
    () => new ContextProcessTask(),
    { description:
        'send the envelope instruction, task, and files to the copilot task' });

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
