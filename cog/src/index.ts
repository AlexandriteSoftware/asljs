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
  type TaskRunner
} from './task.js';

export {
  BuildTask,
  type BuildTaskParameters,
  type BuildTaskResult
} from './tasks/build.js';

export {
  CleanWorkingFolderTask,
  type CleanWorkingFolderTaskParameters
} from './tasks/clean-working-folder.js';

export {
  CommitTask,
  type CommitTaskParameters
} from './tasks/commit.js';

export {
  CommitIfChangedTask,
  type CommitIfChangedTaskParameters
} from './tasks/commit-if-changed.js';

export {
  CopilotTask
} from './tasks/copilot.js';

export {
  CopilotCheckTask,
  type CopilotCheckResult,
  type CopilotCheckTaskParameters
} from './tasks/copilot-check.js';

export {
  ContextAddFilesTask
} from './tasks/context-add-files.js';

export {
  ContextInstructionTask,
  type ContextInstructionTaskParameters
} from './tasks/context-instruction.js';

export {
  ContextProcessTask,
  type ContextProcessTaskParameters
} from './tasks/context-process.js';

export {
  ContextRemoveFileTask
} from './tasks/context-remove-file.js';

export {
  ContextTaskTask,
  type ContextTaskTaskParameters
} from './tasks/context-task.js';

export {
  ContextUpdateFilesTask
} from './tasks/context-update-files.js';

export {
  ContextWriteFileTask,
  type ContextWriteFileTaskParameters
} from './tasks/context-write-file.js';

export {
  ExtractTodosTask,
  type ExtractTodosTaskParameters
} from './tasks/extract-todos.js';

export {
  FindTodoTask,
  type FindTodoTaskParameters
} from './tasks/find-todo.js';

export {
  FormatChangedFilesTask,
  type FormatChangedFilesTaskParameters
} from './tasks/format-changed-files.js';

export {
  GetChangedFilesTask,
  type GetChangedFilesTaskParameters
} from './tasks/get-changed-files.js';

export {
  GetCommitMessageTask,
  type GetCommitMessageTaskParameters
} from './tasks/get-commit-message.js';

export {
  registerCoreTasks
} from './tasks/register.js';

export {
  TestTask,
  type TestTaskParameters,
  type TestTaskResult
} from './tasks/test.js';

export {
  TodoTask,
  type TodoTaskParameters,
  type TodoTaskResult
} from './tasks/todo.js';

export {
  AsljsFormatterTool
} from './tools/asljs-formatter.js';

export {
  CopilotAcpTool,
  type CopilotAcpOptions
} from './tools/copilot.js';

export {
  DotnetCliTool,
  type DotnetCommandOptions
} from './tools/dotnet.js';

export {
  DprintFormatterTool
} from './tools/dprint-formatter.js';

export {
  GitTool,
  parsePorcelainStatus
} from './tools/git.js';

export {
  JbDotnetFormatterTool,
  type JbDotnetFormatOptions
} from './tools/jb-dotnet-formatter.js';

export {
  NodeCommandRunner
} from './tools/node-command-runner.js';

export {
  NpmCliTool,
  type NpmCommandOptions
} from './tools/npm.js';

export {
  defaultTodoPatterns,
  extractTodos,
  TodoTool,
  type Todo
} from './tools/todo.js';

export {
  type CommandResult,
  type CommandRunner,
  type Tool
} from './tools/tool.js';
