export {
  CopilotAcpService,
  type CopilotRequest,
  type CopilotResponse,
  type CopilotService
} from './copilot.js';

export {
  Context,
  type ContextFile,
  type ContextOptions
} from './context.js';

export {
  main
} from './main/main.js';

export {
  SingletonServiceProvider,
  type Service,
  type ServiceFactory,
  type ServiceProvider
} from './service.js';

export {
  DefaultTaskRunner,
  TaskRegistry,
  type Task,
  type TaskCreator,
  type TaskFactory,
  type TaskModule,
  type TaskRunner
} from './task.js';

export {
  BuildTask,
  type BuildTaskParameters,
  type BuildTaskResult
} from './tasks/workflow/build.js';

export {
  CleanWorkingFolderTask,
  type CleanWorkingFolderTaskParameters
} from './tasks/git/clean-working-folder.js';

export {
  CommitTask,
  type CommitTaskParameters
} from './tasks/git/commit.js';

export {
  CommitIfChangedTask,
  type CommitIfChangedTaskParameters
} from './tasks/git/commit-if-changed.js';

export {
  CopilotTask
} from './tasks/copilot/copilot.js';

export {
  CopilotCheckTask,
  type CopilotCheckResult,
  type CopilotCheckTaskParameters
} from './tasks/copilot/copilot-check.js';

export {
  ContextAddFilesTask
} from './tasks/context/context-add-files.js';

export {
  ContextInstructionTask,
  type ContextInstructionTaskParameters
} from './tasks/context/context-instruction.js';

export {
  ContextProcessTask,
  type ContextProcessTaskParameters
} from './tasks/context/context-process.js';

export {
  ContextRemoveFileTask
} from './tasks/context/context-remove-file.js';

export {
  ContextTaskTask,
  type ContextTaskTaskParameters
} from './tasks/context/context-task.js';

export {
  ContextUpdateFilesTask
} from './tasks/context/context-update-files.js';

export {
  ContextWriteFileTask,
  type ContextWriteFileTaskParameters
} from './tasks/context/context-write-file.js';

export {
  ExtractTodosTask,
  type ExtractTodosTaskParameters
} from './tasks/workflow/extract-todos.js';

export {
  FindTodoTask,
  type FindTodoTaskParameters
} from './tasks/workflow/find-todo.js';

export {
  FormatChangedFilesTask,
  type FormatChangedFilesTaskParameters
} from './tasks/workflow/format-changed-files.js';

export {
  GetChangedFilesTask,
  type GetChangedFilesTaskParameters
} from './tasks/git/get-changed-files.js';

export {
  GetUntrackedFilesTask,
  type GetUntrackedFilesTaskParameters
} from './tasks/git/get-untracked-files.js';

export {
  GetCommitMessageTask,
  type GetCommitMessageTaskParameters
} from './tasks/git/get-commit-message.js';

export {
  registerCoreTasks
} from './tasks/register.js';

export {
  TestTask,
  type TestTaskParameters,
  type TestTaskResult
} from './tasks/workflow/test.js';

export {
  TodoTask,
  type TodoTaskParameters,
  type TodoTaskResult
} from './tasks/workflow/todo.js';

export {
  AsljsFormatterTool
} from './tasks/formatting/asljs-formatter.js';

export {
  CopilotAcpTool,
  type CopilotAcpOptions
} from './tasks/copilot/acp-client.js';

export {
  DotnetCliTool,
  type DotnetCommandOptions
} from './tasks/workflow/dotnet.js';

export {
  DprintFormatterTool
} from './tasks/formatting/dprint-formatter.js';

export {
  GitTool,
  parsePorcelainStatus
} from './tasks/git/git.js';

export {
  JbDotnetFormatterTool,
  type JbDotnetFormatOptions
} from './tasks/formatting/jb-dotnet-formatter.js';

export {
  NodeCommandRunner
} from './node-command-runner.js';

export {
  NpmCliTool,
  type NpmCommandOptions
} from './tasks/workflow/npm.js';

export {
  defaultTodoPatterns,
  extractTodos,
  TodoTool,
  type Todo
} from './tasks/workflow/todo-reader.js';

export {
  type CommandResult,
  type CommandRunner,
  type Tool
} from './tool.js';
