# Requirements Milestore 1

COG is a command line tool that maintains project changing session for
AI agents.

It operates by creating and maintaining an envelope file, and applying patches
to it.

## Envelope

Envelope is a JSON file that contains a list of commands and a list of
files, produced by these commands.

Envelope file is specified either by `COG_ENVELOPE_PATH` environment variable.

Envelope file has the following structure:

```json
{
  "instruction": "...",
  "commands": [
    { "command": "read", "path": "path/to/file", "lines": 500, "sizeKB": 20 }
  ],
  "files": [
    {
      "path": "path/to/file",
      "type": "text",
      "content": "...",
      "complete": true
    },
    {
      "path": "path/to/binary",
      "type": "binary"
    }
  ]
}
```

The `instruction` field is populated from the instruction file,
[src/files/Instruction.txt][1].

[1]: <../src/files/Instruction.txt>

## Patch

Patch is a series of commands that are applied to the envelope.

Patch file is specified either by `COG_PATCH_PATH` environment variable.

There are following commands:

- `read`: reads files and add them to the envelope.
- `write`: creates a file or sets content of a file
- `remove`: removes a file

```json
{ "commands":
  [ { "command": "read",
      "path": "path/to/file",
      "lines": 100,
      "sizeKB": 20 },
    { "command": "write",
      "path": "path/to/folder",
      "content": "..." } ] }
```

## Instruction

Instruction should describe the envelope and patch formats, available commands,
workflow.

Some key points to include in the instruction:

- The AI agent task is to provide a patch, either as downlodablel link to
  a file, or as a JSON object in fenced JSON code block.

## CLI

Usage is `cog <command> [args...]`.

`<command>` is a command to execute. It can be one of the following:

- `read <path> [ <path> ...]` reads files, specified by paths, and adds them to
  the envelope. Records command in the envelope.
- `apply-patch` tries to apply the patch to the envelope. It if is failed, it
  saves the patch with an error message to the envelope.

## Commands

### Read

Record read commands as:

```json
{ "command": "read", "path": "path/to/file" }
```  

If read target exists, adds it to commands and its content to files in
the envelope.

What to add to the envelope:

```json
{ "path": "path/to/file",
  "type": "text",
  "content": "...",
  "complete": true },
```

### Apply-Patch

`patch` command applies the patch to the files, and updates the envelope.
