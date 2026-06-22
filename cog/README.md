# cog

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
> performant JavaScript libraries for everyday use.

Context-building library and CLI for AI agents that work with project files
through a structured envelope and patch workflow.

COG helps an agent keep a changing project session explicit. It stores file
snapshots in an envelope with per-file update commands, and applies structured
patch commands back to the project.

## Installation

```bash
npm install asljs-cog
```

For CLI usage in a project or automation:

```bash
npx cog read README.md
```

## CLI

```bash
cog <command> [args...]
```

Available commands:

- `read <path> [arguments]` reads matching files and adds them to the envelope.
- `update` refreshes envelope files using their stored update commands.
- `restore` restores project files from backup.
- `apply-patch` applies the current patch.

### `read <path> [arguments]`

The read path can be a file, folder, or glob pattern.

Options:

- `--lines N` if file is a text file, only read first N lines. Default is 150.
- `--sizeKb M` if file is a text file, only read first M kilobytes. Default is 15.
- `--read-to-end` if file is a text file, read to the end. Default is false.
- `--with-binary-b64` if file is a binary file, read it as base64. Default is false.
- `--exclude <path>` excludes a file, folder, or glob pattern. Can be used more than once.

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
`backup.json`. If `backup.json` already exists, the command stops so
the previous interrupted patch can be restored or explicitly completed.

After the patch succeeds, COG refreshes envelope files using their stored update
commands.

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
