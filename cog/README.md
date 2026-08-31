# cog

> Part of [Alexandrite Software Library][1] - a set of high-quality, performant
> JavaScript libraries for everyday use.

Framework for developing and running automations from composable tasks.

COG provides a shared execution context, task factory and runner, tool adapters,
and reusable services. Its built-in tasks retain the structured envelope and
transactional patch workflow for AI-assisted project changes.

[1]: https://github.com/AlexandriteSoftware/asljs

## Installation

```bash
npm install asljs-cog
```

For CLI usage in a project or automation:

```bash
npx cog read README.md
```

## Framework

- `Task` is an asynchronous unit of work. A task can create and run other tasks.
- `Context` carries shared data, variables, tools, services, the task factory,
  and the task runner.
- `Tool` is a named adapter for an external tool such as Git.
- `SingletonServiceProvider` lazily creates and reuses runtime services.
- `CopilotService` is the service contract for persistent Copilot integration.
- `CopilotTask` sends a completion request through that shared service.
- `CopilotAcpTool` runs Copilot CLI as an ACP server over stdio.
- `CopilotCheckTask` starts that server, sends two prompts, and stops it.
- `DotnetCliTool` runs .NET builds and tests.
- `JbDotnetFormatterTool` formats selected C# files with `jb cleanupcode`.
- `EnvelopeTool` owns envelope building and the envelope context data keys.
- `TodoTool` collects TODO entries from files matching glob patterns.
- `FindTodoTask` returns the first TODO found, or `null`.
- `GetChangedFilesTask` returns modified and untracked Git files.
- `FormatChangedFilesTask` formats changed TypeScript with ASLJS formatters,
  Markdown with dprint, and C# with JetBrains cleanup.
- `GetCommitMessageTask` stops if the working directory is not a Git
  repository, then asks the `copilot` service for a commit message covering
  the diff against `HEAD` and untracked files.
- `CommitTask` runs `GetCommitMessageTask`, stages all changes, and commits
  with that message.
- `CommitIfChangedTask` runs `CommitTask`, or does nothing and returns `null`
  when there are no changed files.
- `CleanWorkingFolderTask` saves the diff and untracked files to
  `clean.<timestamp>.bak`, then discards all local changes.
- `BuildTask` and `TestTask` detect an `npm` (`package.json`) or `dotnet`
  (`.slnx`/`.sln`/`.csproj`) project and run its build or test command,
  returning `{ tool, issues }` instead of throwing on failure.
- `TodoTask` commits pending changes, asks the `copilot` service to address the
  first TODO, verifies it was removed, formats changed files, retries `build`
  and `test` with Copilot fixes up to 3 times each, and commits the fix. A
  `TODO_STOP` reply stops the workflow.
- `EnvelopeInstructionTask` and `EnvelopeTaskTask` set the envelope's
  `instruction` and `task` fields.
- `EnvelopeProcessTask` sends the envelope's instruction, task, and files
  through the `copilot` task and returns its response.

`FormatChangedFilesTask` defaults to `dprint.json` for TypeScript and
`dprint.md.json` for Markdown. Pass `dotnetTarget` for C# formatting, or keep a
`.slnx`, `.sln`, or `.csproj` file in the working directory for automatic
selection. Deleted and unsupported files are skipped.

```js
import {
  Context,
  DefaultTaskRunner,
  SingletonServiceProvider,
  TaskRegistry
} from 'asljs-cog';

const tasks = new TaskRegistry();
const services = new SingletonServiceProvider();

tasks.register('greet', name => ({
  async run(context) {
    const prefix = context.getVariable('prefix') ?? 'Hello';
    return `${prefix}, ${name}`;
  }
}));

const context = new Context({
  taskFactory: tasks,
  taskRunner: new DefaultTaskRunner(),
  serviceProvider: services,
  variables: [ [ 'prefix', 'Welcome' ] ]
});

const greeting = await context.run(
  context.createTask('greet', 'Alex'));

await services.dispose();
```

Register Copilot as a singleton service during host startup. Tasks retrieve that
service with `await context.getService('copilot')`; they do not launch or create
a Copilot client for each completion request.

## CLI

```bash
cog <command> [args...]
```

Available commands:

- `read <path> [arguments]` reads matching files and adds them to the envelope.
- `list` prints a markdown table of envelope files.
- `update` refreshes envelope files using their stored update commands.
- `restore` restores project files from backup.
- `apply-patch` applies the current patch.
- `config` prints current resolved settings and related environment variables.
- `version` prints the current `cog` package version.

Every registered task is also available as a command. Task commands are
generated from the registry, and their options come from the task definition, so
`cog find-todo --patterns "src/**/*.ts"` works without CLI changes. Run
`cog --help` for the current list.

Task commands print the task result as JSON, and print nothing when the result
is `undefined` or `null`. Use `--loglevel <level>` and `--logfile <path>` to see
what a task is doing:

```bash
cog find-todo
cog find-todo --loglevel trace
cog find-todo --loglevel trace --logfile test.log
```

### `read <path> [arguments]`

The read path can be a file, folder, or glob pattern.

Options:

- `--lines N` if file is a text file, only read first N lines. Default is 150.
- `--sizeKb M` if file is a text file, only read first M kilobytes. Default
  is 15.
- `--read-to-end` if file is a text file, read to the end. Default is false.
- `--with-binary-b64` if file is a binary file, read it as base64. Default is
  false.
- `--exclude <path>` excludes a file, folder, or glob pattern. Can be used more
  than once.

### `list`

Prints a markdown table of envelope files with columns `Location`, `Complete`,
and `Type`.

### `update`

Refreshes each envelope file that has an `update` command by running those read
commands and saving the refreshed file snapshots back to the envelope. Files
without an `update` command are left unchanged.

### `restore`

Restores project files from backup in the envelope directory and removes that
backup file. Use this after an interrupted patch application. To complete a
backup without restoring, delete `backup.json` manually.

### `apply-patch`

Applies the current patch. `apply-patch` creates a rollback feed backed by
`backup.json`, passes that feed to each patch command, and lets each command
record its own rollback state before changing local files.

If a command fails, COG rolls the feed back from last entry to first and removes
`backup.json`. If `backup.json` already exists, the command stops so the
previous interrupted patch can be restored or explicitly completed.

`apply-patch` accepts `--patch-verify-cmd <command>`. The command runs in the
current working directory after patch commands are applied and before the patch
is accepted. It takes precedence over `COG_PATCH_VERIFY_CMD`. Exit code `0`
accepts the patch; any non-zero exit code fails the patch and rolls back.

After the patch succeeds, COG refreshes envelope files using their stored update
commands.

### `config`

Prints current COG settings and key environment variables.

The output includes resolved values for:

- envelope path
- patch path
- patch verify command
- log level
- log file

It also prints these environment variables:

- `COG_LOG_LEVEL`
- `COG_LOG_FILE`
- `COG_ENVELOPE_PATH`
- `COG_PATCH_PATH`
- `COG_PATCH_VERIFY_CMD`

### `version`

Prints the installed `asljs-cog` version.

## Envelope

COG stores the session in an envelope JSON file. The envelope path is configured
with the `COG_ENVELOPE_PATH` environment variable.

An envelope contains the original instruction and the file snapshots produced by
read commands. Each file stores an `update` command that can refresh that file:

```json
{
  "instruction": "...",
  "files": [
    {
      "path": "path/to/file",
      "type": "text",
      "content": "...",
      "complete": true,
      "update": {
        "command": "read",
        "pattern": "path/to/file",
        "exclude": [],
        "lines": 150,
        "sizeKb": 15,
        "readToEnd": false,
        "withBinaryB64": false
      }
    }
  ]
}
```

## Patch

Patch files are JSON documents that describe changes to apply to the envelope.
The patch path is configured with the `COG_PATCH_PATH` environment variable.

Supported patch commands:

- `read` reads matching files into the envelope.
- `write` creates a file or replaces its content.
- `remove` removes a file.

Example patch:

```json
{
  "commands": [
    {
      "command": "read",
      "pattern": "src/**/*.ts",
      "exclude": [ "src/**/*.test.ts" ]
    },
    {
      "command": "write",
      "path": "docs/example.md",
      "content": "# Example\n"
    }
  ]
}
```

## Library Usage

COG is published as an ES module package. Import package-root helpers from
`asljs-cog` when embedding the envelope and patch workflow in your own tooling.

```js
import * as cog from 'asljs-cog';
```
