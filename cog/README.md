# cog

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
> performant JavaScript libraries for everyday use.

Context-building library and CLI for AI agents that work with project files
through a structured envelope and patch workflow.

COG helps an agent keep a changing project session explicit. It records file
read commands, stores file snapshots in an envelope, and applies structured
patch commands back to the project.

## Installation

```bash
npm install asljs-cog
```

For CLI usage in a project or automation:

```bash
npx cog read README.md package.json
```

## CLI

```bash
cog <command> [args...]
```

Available commands:

- `read <path> [<path> ...]` reads files and adds them to the envelope.
- `apply-patch` applies the current patch to the envelope files.

## Envelope

COG stores the session in an envelope JSON file. The envelope path is configured
with the `COG_ENVELOPE_PATH` environment variable.

An envelope contains the original instruction, commands that were run, and the
file snapshots produced by those commands:

```json
{
  "instruction": "...",
  "commands": [
    { "command": "read", "path": "path/to/file" }
  ],
  "files": [
    {
      "path": "path/to/file",
      "type": "text",
      "content": "...",
      "complete": true
    }
  ]
}
```

## Patch

Patch files are JSON documents that describe changes to apply to the envelope.
The patch path is configured with the `COG_PATCH_PATH` environment variable.

Supported patch commands:

- `read` reads files into the envelope.
- `write` creates a file or replaces its content.
- `remove` removes a file.

Example patch:

```json
{
  "commands": [
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

## Development

Build the package before publishing:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run type checking:

```bash
npm run typecheck
```

[#1]: https://github.com/AlexandriteSoftware/asljs
