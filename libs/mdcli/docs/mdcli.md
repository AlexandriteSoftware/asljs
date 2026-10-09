# mdcli

The exports of `asljs-mdcli`, by module.

## AI agents

- `AI_AGENTS` - `claude` and `copilot`, in the order `detectAgent` tries them.
- `parseAgentSpec(value)` - reads an `--ai` value: `true` for a bare `--ai`,
  otherwise `[<agent>][:<model>]`, e.g. `claude:fable`, `copilot`, `:fable`. An
  unknown agent is an error.
- `detectAgent(run?)` - the first agent whose `<agent> --version` runs, or
  `null`.
- `getAgentCommand(source, spec, mode, override)` - the agent's command line:
  the environment variable `override` of `source.env` when set, otherwise the
  agent `spec` names, or `source.detectAgent` (or `detectAgent`), with the
  model; `null` when none is found. `mode` is what the agent may do:
  - `read` - read and search files;
  - `run` - also run commands, without editing files;
  - `edit` - also edit files.
- `askAgent(command, cwd, prompt)` - runs the agent in `cwd` with the prompt on
  standard input. Its verdict is the last line of its output that is a JSON
  object with `result` `OK`, `Fail` or `Blocked`:
  - `ok` - true for `OK`;
  - `message` - the verdict's `message`;
  - `blocked` - true for `Blocked`, an agent that needs more from the user;
  - `data` - the whole verdict object, for fields a prompt asks for;
  - `answer` - what the agent wrote to standard output before the verdict;
  - `output` - everything it printed. No verdict, a non-zero exit code or an
    agent that does not start is a failure with the reason in `message`.
- `verdictInstructions(failure)` - the prompt lines that ask for the `OK` or
  `Fail` verdict.

## Markdown

- `parseMarkdown(text)` - the mdast tree.
- `findSectionHeading(root, name)`, `getSection(root, name)` - a level 2
  section: its heading, or its nodes up to the next level 1 or 2 heading.
- `plainText(node)` - the text of a node.
- `splitLocalUrl(url)` - a local link target split into a decoded path and its
  `#` fragment; `null` for a URL with a scheme.
- `formatUrl(url)` - a link target in angle brackets when it has spaces or
  parentheses.

## Files

- `findMarkdownFiles(folder, { skip })` - the `.md` files of a folder and its
  subfolders, sorted, skipping folders whose name starts with `.`,
  `node_modules`, and the `skip` names.
- `toDisplayPath(folder, file)` - a path relative to `folder` with `/`
  separators.

## Post-processing

- `writeMarkdown(file, text)` - writes a markdown file and remembers it.
- `takeWritten()` - the files written since the last call, and forgets them.
- `findConfig(folder, name)` - the nearest configuration file `name`, e.g.
  `rq.json`, of `folder` or a parent; an error when it is not valid JSON or its
  `markdownPostProcessing` is not a string.
- `postProcess(io, files, name)` - runs the `markdownPostProcessing` command of
  the nearest `name` with the files that still exist, relative to the
  configuration file's folder, where it runs. Returns 1 and writes the output to
  `io.stderr` when the command fails, 0 otherwise.

## Commands

- `runCommand(command, cwd, input?)` - runs a shell command line with `input` on
  standard input; resolves to `{ code, stdout, stderr }`.
- `runProgram(program, args, cwd, env?)` - runs a program with arguments,
  without a shell.

## Server

- `startServer({ folder, index, home, style?, port?, host?, pages?, render?,
  allow? })` - serves `/` with `index()`, made again on every request; a path of
  `pages`, e.g. `/search`, with that page of the request URL; a `.md` file of
  `folder` as HTML - `render(file, relative)`, or `markdownToHtml` of its text -
  with a link back to `/` labelled `home`; and any other file of `folder` as it
  is. Nothing outside `folder`, or that `allow(relative)` refuses, is served. It
  listens on `host`, `127.0.0.1` by default, on `port`, or without one on the
  first free port from `DEFAULT_PORT`, 3000, up to 3099.
- `markdownToHtml(text)` - the HTML of a markdown text, with GitHub-flavoured
  tables, task lists and strikethrough; raw HTML is kept.
- `serverUrl(server)` - its address, e.g. `http://127.0.0.1:3000/`.
- `page(title, body, style?)` - an HTML page with the shared style and `style`.
- `escapeHtml(text)` - the text with `&`, `<`, `>` and `"` escaped.

## MCP

- `handleMessage(message, tools, info)` - the response to one JSON-RPC message:
  `initialize` with `info`'s name and version, `tools/list`, `tools/call`, and a
  method-not-found error otherwise; `null` for a notification.
- `serveLines(input, write, tools, info, { onInvalidLine, onRequest })` -
  answers the requests of a stream, one JSON object per line, until it ends.
- `readLines(input, onLine)` - calls back once per complete line.
- `McpTool` - `{ name, description, inputSchema, invoke }`. `invoke`'s result is
  sent as JSON, `<name> completed` for `undefined`, or as it is for a
  `textResult(text, isError)`; a thrown error is an error result.
- `commandTools(program, run, { skip })` - a tool per command of a commander
  program, subcommands joined with `_`, e.g. `add_test`. Its properties are the
  arguments, variadic ones as arrays, and the options by attribute name, e.g.
  `workingDir`: boolean for a flag, string for a value, `""` for an optional
  value left out. A call runs `run` with the command line - options as
  `--name=value`, then `--` and the arguments - one call at a time, and answers
  the output as text, an error result for a non-zero exit code. An unknown
  property or a missing required argument is an error.
- `objectSchema`, `stringProperty`, `booleanProperty`, `numberProperty`,
  `stringArrayProperty`, `enumProperty` - JSON Schema builders.
