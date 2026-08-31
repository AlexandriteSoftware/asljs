# Requirements

COG is a framework for developing and running automations. It also provides a
command line host for built-in project and envelope tasks.

## Framework

### Task

A task is the unit of work. Every task:

- implements `Task<TResult>`;
- exposes an asynchronous `run(context)` method;
- receives the current `Context` when it runs;
- may create another task through `context.createTask()`;
- may run another task through `context.run()`.

`TaskRegistry` is the standard task factory. It maps stable task names to task
creators. `DefaultTaskRunner` invokes a task with the current context.

A registration may include a definition with a description, parameter list, and
`requiresEnvelope`. Each parameter has a name and a type of `string`, `number`,
`boolean`, or `string[]`. `definitions()` returns those descriptions.

The CLI builds one command per registered task from those definitions, so a new
task becomes callable without editing the CLI. Parameter names map to options in
kebab-case, for example `patterns` becomes `--patterns <value...>`. A task whose
name already belongs to a dedicated CLI command is not generated again. When a
definition sets `requiresEnvelope`, the CLI loads the envelope before the task
runs and saves it afterwards.

Tasks return values rather than writing to the console. When a generated task
command completes, the CLI prints the result as indented JSON. Nothing is
printed when the result is `undefined` or `null`.

Tasks report progress through `context.logger`. Logging is off the output path,
so `--loglevel <level>` and `--logfile <path>` control it. Explicit options take
precedence over `COG_LOG_LEVEL` and `COG_LOG_FILE`, which take precedence over
the default level `information`.

The built-in task registry includes:

- `copilot`;
- `copilot-check`;
- `get-changed-files`;
- `format-changed-files`;
- `extract-todos`;
- `find-todo`;
- `envelope-add-files`;
- `envelope-write-file`;
- `envelope-remove-file`;
- `envelope-update-files`;
- `envelope-instruction`;
- `envelope-task`;
- `envelope-process`;
- `restore`;
- `get-commit-message`;
- `commit`;
- `commit-if-changed`;
- `clean-working-folder`;
- `todo`;
- `build`;
- `test`.

`envelope-update-files` is a workflow task: it creates and runs an
`envelope-add-files` task for every stored file update command.

Patch command names stay `read`, `write`, and `remove`. `apply-patch` maps them
to the `envelope-add-files`, `envelope-write-file`, and `envelope-remove-file`
tasks, and fails on an unknown command.

### Context

`Context` is shared for an automation run. It provides:

- shared data for runtime objects such as the current envelope and rollback
  feed;
- named variables for workflow configuration and intermediate values;
- a task factory;
- a task runner;
- named tool adapters;
- a service provider.

Tasks must receive dependencies through the context or their constructor. They
must not create a new execution context when calling another task.

### Tool

A tool is a named adapter for an external capability, for example Git. Tools
hide tool-specific invocation and data formats from workflow tasks.

Built-in tools include:

- `envelope`, which owns envelope building: adding read files, writing and
  removing project files, and listing stored update parameters. It also owns the
  `envelope` and `rollbackFeed` context data keys;
- `todos`, which collects TODO entries from files matching glob patterns;
- `copilot`, which runs Copilot CLI as an ACP server and exchanges prompts with
  it;
- `dotnet`, which runs `dotnet build` and `dotnet test` with an optional
  solution or project target and additional arguments;
- `jb-dotnet-formatter`, which runs JetBrains `jb cleanupcode` for explicit C#
  files in a solution or project;
- `git`, which reads modified and untracked paths from porcelain status, reports
  whether a directory is a repository, reads the diff against `HEAD`, commits
  all changes with a message, and discards all local changes;
- `npm`, which runs `npm run build` and `npm run test`;
- `asljs-formatter`, which runs dprint and then sfmt for TypeScript files;
- `dprint-formatter`, which formats explicit files with a selected dprint
  configuration.

`NodeCommandRunner` runs tool processes without a shell and captures their exit
code and output. A non-zero formatter, Git, or .NET command result must fail the
calling tool.

### Changed file formatting

`GetChangedFilesTask` returns modified, staged, renamed, copied, and untracked
paths reported by Git. Duplicate paths are removed.

`FormatChangedFilesTask` runs `GetChangedFilesTask`, ignores deleted paths and
unsupported file types, then routes existing files as follows:

- `.ts` and `.tsx` files use `asljs-formatter`;
- `.md` files use `dprint-formatter`;
- `.cs` files use `jb-dotnet-formatter`.

The default TypeScript dprint configuration is `dprint.json`. The default
Markdown configuration is `dprint.md.json`. Both paths are relative to the
working directory and can be overridden.

C# formatting requires a solution or project target. The task uses its
`dotnetTarget` parameter when provided. Otherwise, it searches the working
directory and selects the first `.slnx`, `.sln`, or `.csproj` file in that
order. It fails if C# files need formatting and no target exists.

### TODO extraction

The `todos` tool scans files matching the given glob patterns. A TODO starts on
a line matching `^\s*(// )?TODO:`. Every following non-empty line that starts
with the same optional comment prefix continues the same TODO, unless that line
starts its own TODO, which begins a new entry instead.

Each entry reports:

- `todo`, the TODO body with the leading whitespace and comment prefix removed
  and the remaining relative indentation preserved;
- `excerpt`, the exact source text between `startPosition` and `endPosition`;
- `file`, the absolute file path;
- `startLine` and `endLine`, 1-based line numbers;
- `startPosition`, the offset of the TODO marker;
- `endPosition`, the offset of the end of the last line.

`findOne` returns the first entry or `null`. `ExtractTodosTask` returns every
entry and defaults to `**/*.ts`, `**/*.cs`, and `**/*.md`.

`FindTodoTask` returns the first entry for the same default patterns, or `null`
when there is none. It writes no output of its own and does not change context
data; it reports progress through the context logger.

### Envelope instruction, task, and processing

`Envelope` has an `instruction` string and an optional `task` string, alongside
its `files`. `EnvelopeInstructionTask` (`envelope-instruction`) sets
`envelope.instruction`. `EnvelopeTaskTask` (`envelope-task`) sets
`envelope.task`. Both require the envelope and mutate it in place, the same way
`EnvelopeAddFilesTask`, `EnvelopeWriteFileTask`, and `EnvelopeRemoveFileTask` do.

`EnvelopeProcessTask` (`envelope-process`) builds a single prompt from the
envelope's `instruction`, `task` (when set), and each file (its path and, for
text files, its content; binary files are noted as omitted), then runs that
prompt through the `copilot` task and returns its `CopilotResponse`.

### Commit workflow tasks

`GetCommitMessageTask` stops (throws) when its working directory is not a Git
repository. Otherwise it reads the diff against `HEAD` and the content of
untracked files, asks the `copilot` service for a commit message covering both,
and returns the trimmed response. The prompt instructs Copilot to reply with
only a summary under 200 characters.

`CommitTask` runs `get-commit-message`, stages all changes, commits them with
that message, and returns the message.

`CommitIfChangedTask` behaves like `CommitTask`, except it first checks
`GetChangedFilesTask`; when there are no changed files it does nothing and
returns `null` instead of failing.

`CleanWorkingFolderTask` reads the diff against `HEAD` and the content of every
untracked file, discards all local changes with `git checkout -- .` and
`git clean -fd`, then writes what it read to `clean.<timestamp>.bak` in the
working directory (JSON with a `diff` string and a `untrackedFiles` array of
`{ path, contentBase64 }`). The backup file is written after the working tree
is cleaned, so it is not itself removed by `git clean`.

`TodoTask` is the TODO-driven workflow:

1. Run `commit-if-changed` so the working folder starts clean.
2. Run `find-todo`. If there is no TODO, return `{ todo: null, addressed:
   false }`.
3. Ask the `copilot` service to implement the TODO and remove the comment. The
   prompt asks Copilot to reply with exactly `TODO_DONE` on success, or
   `TODO_STOP` followed by a reason when it cannot make the change. A
   `TODO_STOP` reply stops (throws).
4. Run `find-todo` again. If the same TODO (same file, start line, and text)
   is still present, the task fails, since Copilot reported success without
   removing it.
5. Run `format-changed-files` to format whatever Copilot changed.
6. Run `build`, retrying up to 3 times: on issues, ask Copilot to fix them and
   run `build` again; fail if issues remain after the third attempt.
7. Run `test` the same way.
8. Run `commit-if-changed` to commit the fix.

### Build and test tasks

`BuildTask` and `TestTask` first detect the project kind in their working
directory: `npm` when `package.json` exists there, otherwise `dotnet` when a
`.slnx`, `.sln`, or `.csproj` file exists there, checked in that order. When
neither is found, they return `{ tool: null, issues: [] }` without running any
command.

For `npm`, `BuildTask` runs `npm run build` and `TestTask` runs `npm run test`.
For `dotnet`, `BuildTask` runs `dotnet build` and `TestTask` runs `dotnet test`,
both against the detected target. Neither task lets a failing command throw:
it catches the tool's error and returns `{ tool, issues }`, where `issues` is
the error message split into trimmed, non-empty lines. This lets a caller such
as `TodoTask` inspect and react to failures instead of aborting the workflow.

### Service

A service is a reusable runtime dependency. `SingletonServiceProvider` creates
each registered service lazily, reuses the same instance for all requests, and
disposes created services when the host shuts down.

Copilot integrations must implement `CopilotService` and be registered with the
service provider. A task may call `context.getService('copilot')`, but it must
not start a new Copilot process or client for every request.

### Copilot ACP server

`CopilotAcpTool` starts `copilot --acp --stdio` as a child process and speaks
the Agent Client Protocol over it. Messages are JSON-RPC 2.0 encoded as
newline-delimited JSON on the process stdio.

The tool exposes three operations:

- `start()` spawns the process, sends `initialize`, then `session/new`, and
  keeps the returned session id;
- `prompt(text)` sends `session/prompt`, collects the text of every
  `agent_message_chunk` in `session/update` notifications, and returns it;
- `stop()` closes stdin and waits for the process to exit before killing it.

Agent-to-client `session/request_permission` requests are answered with the
`cancelled` outcome, so a check run never modifies files. Any other
agent-to-client method is answered with a JSON-RPC `method not found` error.

The executable is `copilot` by default, overridden by the `COPILOT_CLI_PATH`
environment variable or the tool's `command` option. Spawning does not use a
shell; set the `shell` option when the executable is a Windows `.bat` or `.cmd`
wrapper that needs shell resolution.

When the process fails to start or exits early, pending and later requests fail
immediately rather than waiting for the request timeout.

`CopilotCheckTask` is the smoke test for that tool. It starts the server, sends
two trivial prompts, fails when a response is empty, and always stops the server
before returning the session id and both responses.

### Workflows

A workflow is a task that composes other tasks. Representative workflows are:

1. Read the Git diff, ask Copilot for a commit message, and commit with that
   message.
2. While TODOs remain, find one, implement it, run tests, and run the commit
   workflow.
3. Read a PDF from a source folder, convert it to text, extract spreadsheet
   data, and move it to a target folder.
4. Create an envelope, find relevant files, ask Copilot to prepare a patch,
   apply it, build, format, test, and commit.

## Built-in envelope automation

The existing envelope and transactional patch behavior is retained as built-in
tasks and CLI workflows. It operates by creating and maintaining an envelope,
and applying commands to project files and the envelope.

## Envelope

Envelope is a folder, with timestamp and optional name. It contains files
produced by read commands, instruction, task, and other files.

Layout:

- `files/` - contains files read from the project. Path to the file in the
  envelope is the same as the path to the file in the project. File suffix is
  `,start-end`, where `start` and `end` are the line offsets of the file content
  in the project. For example, `files/src/index.ts,0-10` is the first 10 lines
  of `src/index.ts`.
- `instruction.md` - contains the instruction for the AI agent.
- `task.md` - contains the task for the AI agent.

Envelope is serialised to JSON as follows:

```json
{
  "files": [
    {
      "path": "path/to/file",
      "complete": true,
      "type": "text",
      "update": "command to update file"
    }
  ],
  "instruction": "instruction text",
  "task": "task text"
}
```

Current envelope folder is stored in `envelope.json`:

```json
{
  "envelope": "timestamp"
}
```

## File update commands

Each file may have an `update` property. This property stores a read command
that refreshes the file content.

## Backup and rollback feed

`apply-patch` uses `backup.json` in the envelope directory to make patch
application transactional. The backup file is managed through a rollback feed.

Backup format:

```json
{
  "files": [
    {
      "path": "path/to/file",
      "existed": true,
      "content": "base64-encoded previous file content"
    },
    {
      "path": "path/to/new-file",
      "existed": false
    }
  ]
}
```

A file state is saved to backup before every update or removal. If the same file
is updated multiple times, each previous state is appended. Rollback replays the
backup from last to first.

Rollback responsibility belongs to command modules:

- Command functions accept a rollback feed.
- Commands that mutate local files must save rollback state to the feed before
  mutating files.
- Each command file exports a rollback function for the command.
- `read` rollback is a no-op because read does not mutate local project files.
- `write` rollback restores the latest file state from the feed.
- `remove` rollback restores the latest file state from the feed.

`main.ts` owns rollback feed lifecycle and command dispatch only. It must not
contain command-specific file backup logic.

If the process crashes or is killed and `backup.json` remains, the next
`apply-patch` must stop before applying anything. The user can run `restore` to
restore the backup and remove `backup.json`, or manually delete `backup.json` to
complete the backup without restoring.

When the patch fails because of verification failure, `apply-patch` must restore
the backup and remove `backup.json`.

## Patch

Patch is a series of commands that are applied to the envelope.

Commands:

- `read`: reads files and adds them to the envelope.
- `write`: creates a file or sets content of a file.
- `remove`: removes a file.
- `replace`: replaces part of the file, specified by search, with new content,
  specified by replacement.
- `rename`: renames a file.

## Applying patch

`apply-patch` command applies the patch transactionally.

The command must:

1. Stop if `backup.json` already exists.
2. Create a rollback feed backed by `backup.json`.
3. Apply patch commands to local files and the in-memory envelope.
4. Pass the rollback feed to each command.
5. Let commands save rollback state before mutating local files.
6. On any failure, restore backup entries from last to first, delete
   `backup.json`, and rethrow the error.
7. Run the patch verification command, if configured.
8. If verification fails, restore backup entries from last to first, delete
   `backup.json`, and rethrow the error.
9. After patching is complete and verified, run update commands for files in the
   envelope.
10. Save the envelope.
11. Delete `backup.json`.

## CLI

`<command>` is a command to execute. It can be one of the following:

- `read <path> [arguments]` reads matching files and adds them to the envelope.
- `list` prints a markdown table of envelope files with columns `Location`,
  `Complete`, and `Type`.
- `update` refreshes envelope files by running each file's stored update
  command.
- `restore` restores files from `backup.json` and removes `backup.json`.
- `apply-patch [--patch-verify-cmd <command>]` transactionally applies the
  patch. If `backup.json` exists, it stops before applying anything.
  `--patch-verify-cmd` specifies the command used to verify the applied patch
  and takes precedence over `COG_PATCH_VERIFY_CMD`.
- `config` prints current resolved settings and key environment variables.

## Patch verification

`apply-patch` supports an apply-patch-specific `--patch-verify-cmd <command>`
argument.

The verify command is selected in this order:

1. `--patch-verify-cmd <command>`
2. `COG_PATCH_VERIFY_CMD`
3. no verification command

The verify command runs in the current working directory after patch commands
are applied and before the patch is accepted.

If the command exits with code `0`, the patch is valid.

If the command exits with any non-zero code, the patch is invalid and
`apply-patch` must fail. Since verification happens before the patch is
accepted, verification failure must use the normal transactional rollback path.

## List command

`list` prints the files currently stored in the envelope as a markdown table.

The table columns are:

- `Location` - the envelope file path.
- `Complete` - `yes` when `complete` is `true`, `no` when `complete` is `false`,
  and empty when `complete` is omitted.
- `Type` - the envelope file type.

Example output:

```md
| Location        | Complete | Type   |
| --------------- | -------- | ------ |
| src/index.ts    | yes      | text   |
| assets/logo.png |          | binary |
```
