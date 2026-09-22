# cog

> Part of [Alexandrite Software Library][1] - a set of high-quality, performant
> JavaScript libraries for everyday use.

Framework for developing and running automations from composable tasks.

COG provides a shared execution context, a task factory and runner, and
reusable services.

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

Tasks are COG's building blocks. Categories such as `git` group related tasks.

While executing, tasks receive a shared `Context` instance that provides access
to data, variables, services, the task factory, and the task runner.

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

When a task executes other tasks, they form a workflow.

Example:

1. collect today’s inputs
2. summarize
3. classify by urgency
4. draft outputs
5. ask for approval
6. publish/send/save

## Writing Tasks

A task implements `Task<TResult>` and has an asynchronous `run(context)`
method. Register it with a stable command name, a description, and its
parameters. Mark command-line positional parameters with `position: true`;
they are required by the CLI.

Tasks may create and run another task with `context.createTask()` and
`context.run()`. Use `context.setData(name, value)` to update a named shared
context bucket, and `context.getData(name)` or `context.requireData(name)` to
read one.

External task modules export `registerTasks(registry)`. COG recursively loads
`.js` and `.mjs` modules from every `--tasks-dir` directory before it creates
commands:

```js
export function registerTasks(registry) {
  registry.register(
    'run-sql',
    parameters => new RunSqlTask(parameters),
    {
      description: 'run a SQL query',
      parameters: [
        { name: 'connection', type: 'string', position: true },
        { name: 'query', type: 'string', position: true }
      ]
    });
}
```

Initialize context data with `--init-context <path>`. The file is a JSON array
of objects with `type`, `data`, and an optional `name`. Named data is available
by name; unnamed data is available by type. For example:

```json
[
  {
    "name": "SQLSERVER1",
    "type": "db-connection",
    "data": { "connectionString": "..." }
  }
]
```

This invokes an externally loaded task with two required positional arguments:

```bash
cog --tasks-dir=. --init-context context.json run-sql SQLSERVER1 "select ..."
```

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
- `--tasks-dir <path>` loads task modules from a directory. Repeat it to load
  multiple task collections.
- `--init-context <path>` loads initial context data for the invoked task.
- `--context <path>` loads persisted context data when the file exists and
  writes it after every task execution.
