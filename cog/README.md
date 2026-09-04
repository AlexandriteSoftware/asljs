# cog

> Part of [Alexandrite Software Library][1] - a set of high-quality, performant
> JavaScript libraries for everyday use.

Framework for developing and running automations from composable tasks.

COG provides a shared execution context, a task factory and runner, tool
adapters, and reusable services.

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

COG's structure has two layers:

- Tasks - asynchronous units of work that can create and run other tasks.
- Tools - adapters for external tools such as Git.

While executing, task receive a shared `Context` instance that provides access
to variables, tools, services, the task factory, and the task runner.

### Task

A task unit is one bounded job, the smallest reusable block.

Examples:

- summarize inbox
- extract action items from meeting notes
- draft weekly status update
- reconcile two versions of a document
- generate implementation plan from issue
- review pull request against checklist

Each task unit has:

- parameters - list of input parameters required by the task. When a task is
  called from the command line, they are mapped to named arguments.
- result - the output returned by the task.

When task executes another tasks, they form a workflow.

Example:

1. collect today’s inputs
2. summarize
3. classify by urgency
4. draft outputs
5. ask for approval
6. publish/send/save

## Tool

A tool is an adapter that allows tasks to interact with external systems or
services. Although it is possible to directly interact with external systems
from within a task, using tools provides a consistent and reusable interface.

Examples of tools include:

- Git - wraps Git commands and provides programmatic access to Git operations.
- Copilot - a gateway to GitHub Copilot AI-powered automations.
- dotnet - provides access to .NET CLI commands and project management.
- npm - provides access to npm CLI commands and package management.

## CLI

```bash
cog <command> [args...]
```

For a list of available commands, run:

```bash
cog --help
```

List is dynamically generated from the registered tasks.

There are some global options that can be used with any command:

- `--loglevel <level>` sets the logging level (e.g., trace, debug, info, ...).
- `--logfile <path>` sets the path to the log file.
