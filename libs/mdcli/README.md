# mdcli

> Part of [Alexandrite Software Library][#1] - a set of high-quality, performant
> JavaScript libraries and tools for everyday use.

Building blocks for command-line tools that manage markdown documents with AI
agents: asking an agent, reading markdown, finding documents, post-processing
what the tool writes, and serving the documents in a browser.

## Overview

The tools of this repository that keep their data in markdown - `asljs-rq` and
`asljs-board` - share these parts:

- **AI agents** - choose `claude` or `copilot`, by name, by detection or by an
  environment variable, with read, run or edit permissions, and ask one for a
  verdict: `OK`, `Fail` or `Blocked`, with what it wrote before it.
- **Markdown** - parse a document, read a section, plain text and local links.
- **Files** - find the markdown files of a folder.
- **Post-processing** - remember the files a command wrote, and run the
  project's formatter on them, named in the tool's configuration file.
- **Server** - serve a folder: an index page, markdown rendered as HTML, and the
  other files as they are, on the first free port from 3000.

## Scope

- Node.js, ES modules. The agents are run as command lines, so any agent that
  reads a prompt on standard input fits.
- The server is for local use: it renders documents as they are and serves every
  file inside its folder.

## Installation

```bash
npm install asljs-mdcli
```

## Usage

```ts
import { askAgent,
         getAgentCommand }
  from 'asljs-mdcli';

const command =
  await getAgentCommand(
    { env: process.env },
    { agent: 'claude' },
    'read',
    'MYTOOL_AI_COMMAND');

const verdict =
  await askAgent(
    command!,
    process.cwd(),
    'Is README.md up to date? End with {"result":"OK"} or {"result":"Fail","message":"..."}.');

console.log(verdict.ok, verdict.message, verdict.answer);
```

## Further reading

- [mdcli][MD] - every export.

## Related packages

- `asljs-rq` manages requirements in markdown.
- `asljs-board` keeps a planning board in markdown.

## License

MIT

[#1]: https://github.com/AlexandriteSoftware/asljs
[MD]: docs/mdcli.md
