# Requirements

COG is a command line tool that maintains project changing session for
AI agents.

It operates by creating and maintaining an envelope file, and applying patches
to it.

## Envelope

Envelope is a JSON file that contains a list of commands and a list of
files, produced by these commands.

Envelope file is specified either by `COG_ENVELOPE_PATH` environment variable or
by `--envelope` command line argument.

Envelope file has the following structure:

```json
{ "id": "unique-id",
  "date": "2024-06-01T12:00:00Z",
  "instruction": "...",
  "plan": "...",
  "task": "...",
  "commands":
    [ { "command": "read",
        "patterns": [ "path/to/file" ],
        "lines": 100,
        "sizeKB": 20 },
      { "command": "read",
        "path": "path/to/folder" } ],
  "patch":
    { "commands":
        [ { "command": "read",
            "patterns": [ "path/to/file" ],
            "lines": 100,
            "sizeKB": 20 },
          { "command": "write",
            "path": "path/to/folder",
            "content": "..." } ],
      "error": "error message" },
  "files":
    [ { "path": "path/to/file",
        "type": "text",
        "content": "...",
        "complete": true },
      { "path": "path/to/binary",
        "type": "binary" } ] }
```

The `instruction` field is populated from the instruction file,
[src/files/Instruction.txt][1].

[1]: <../src/files/Instruction.txt>

## Patch

Patch is a series of commands that are applied to the envelope.

Patch file is specified either by `COG_PATCH_PATH` environment variable or by
`--patch` command line argument.

Commands:

- `read`: reads files and add them to the envelope.
- `write`: creates a file or sets content of a file
- `remove`: removes a file
- `replace`: replaces part of the file, specified by search, with new content,
  specified by replacement.
- `exec`: executes a command and writes its output to file, adds this file to
  the envelope and sync commands.
- `task`: sets the task field in the envelope.

When patch is applied, it is applied as a whole, and if any command fails,
the patch is not applied.

It is saved to the envelope file as "patch" field with an error message.

```json
{ "commands":
  [ { "command": "read",
      "patterns": [ "path/to/file" ],
      "lines": 100,
      "sizeKB": 20 },
    { "command": "write",
      "path": "path/to/folder",
      "content": "..." } ] }
```

## Applying patch

`apply-patch` command applies the patch to the files, run checks, and either
succeeds or fails.

If it fails, it saves the patch with an error message to the envelope and
restores the files.

If it succeeds, it updates the files in the envelope and removes the patch from
the envelope.

Command to verify the patch is specified by `--patch-verify-cmd` command line
argument or by `COG_PATCH_VERIFY_CMD` environment variable.

The command is executed in the current working directory, and it should return
0 if the patch is valid, and non-zero if the patch is invalid.

## Instruction

Instruction should describe the envelope and patch formats, available commands,
workflow.

Some key points to include in the instruction:

- When the envelope contains a patch, this means that the application of the
  patch failed. Before proceeding with the task, try to re-create a patch
  that can be applied successfully.

## CLI

`--envelope <path>` sets the path to the envelope. Overwrites env variable
`COG_ENVELOPE_PATH`. Creates envelope file if it does not exist.

`--patch <path>` sets the path to the patch. Overwrites env variable
`COG_PATCH_PATH`. Shows an error if the patch file does not exist.

`<command>` is a command to execute. It can be one of the following:

- `read <path> [--lines N] [--sizeKb M] [--read-to-end] [--with-binary-b64]`
  adds a read command to the envelope. Path can be a file, folder or glob.
- `apply-patch` tries to apply the patch to the envelope. It if is failed, it
  saves the patch with an error message to the envelope.

Read arguments:

- `--lines N` if file is a text file, only read first N lines. Optional, default
  is 150.
- `--sizeKb M` if file is a text file, only read first M kilobytes. Optional,
  default is 15.
- `--read-to-end` if file is a text file, read to the end. Optional, default is
  false.
- `--with-binary-b64` if file is a binary file, read it as base64. Optional,
  default is false.

## Commands

### Read

This command reads files and adds them to the envelope.

Example:

```json
{ "command": "read",
  "patterns": [ "path/to/file" ] }
```

Each pattern can be a file, folder or glob. The relative paths are resolved
relative to the current working directory.

- If read pattern is a path to a single file and the file exists, add it.
- If read pattern is a path to a missing file, throw an error.
- If read pattern is a folder, remove existing envelope files under it, then add
  all files under it.
- If read pattern is a glob, remove matching envelope files, then add matching
  filesystem files.

Optional properties:

- `lines` - if file is a text file, only read first N lines. If omitted, there
  is no limit.
- `sizeKb` - if file is a text file, only read first M kilobytes. If omitted,
  there is no limit.
- `withBinary` - if file is a binary file, read it as base64. If omitted, binary
  files added without content. Optional, default is false.

### Write

This command creates a file or sets content of a file.

### Remove

This command removes a file.

### Replace

This command replaces part of the file, specified by search, with new content,
specified by replacement.

If there are multiple matches, the command fails.

### Exec

This command executes a command and writes its output to file, adds this file to
the envelope and sync commands.

### Task

This command sets the task field in the envelope. It is to keep the continuity
of the task in the envelope, so that the AI agent can continue the task from
where it left off.
