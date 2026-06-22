# Milestone 1 to Milestone 2 Transition Tasks

This document is an implementation checklist for transforming the Milestone 1 COG CLI into the application described by `docs/Requirements.m2.md`.

## Step 1: Add `--envelope` command line argument

Add a global `--envelope <path>` command line argument.

It specifies the path to the envelope JSON file and takes precedence over the `COG_ENVELOPE_PATH` environment variable when both are set.

If neither `--envelope` nor `COG_ENVELOPE_PATH` is provided, keep the existing error behavior unless the current implementation already has a default path.

When the selected envelope file does not exist, create a new envelope file at that path.

Use "commander" npm package to implement the command line argument parsing.

Create unit tests alongside the project files. E.g., for `main.ts` create file
`main.test.ts`. Use standard Node.js `assert` for assertions.

For tests, adapt the `tmp-dir.js` - make it ts, initialise with a silent logger.

## Step 2: Add `--patch` command line argument

Add a global `--patch <path>` command line argument.

It specifies the path to the patch JSON file and takes precedence over the `COG_PATCH_PATH` environment variable when both are set.

Unlike the envelope path, the patch path must point to an existing file. If the selected patch file does not exist, show an error and do not apply anything.

Update `apply-patch` to resolve the patch path from this precedence order:

1. `--patch <path>`
2. `COG_PATCH_PATH`
3. existing fallback behavior, if any

Add unit tests for this functionality, including precedence and missing-file behavior.

## Step 3: Add `--patch-verify-cmd` command line argument

Add a global or `apply-patch`-specific `--patch-verify-cmd <command>` argument.

It specifies the command used to verify an applied patch and takes precedence over the `COG_PATCH_VERIFY_CMD` environment variable.

The verify command must be executed in the current working directory after patch commands are applied and before the patch is accepted.

If the command exits with code `0`, the patch is valid.

If the command exits with any non-zero code, the patch is invalid and `apply-patch` must fail atomically.

## Step 4: Extend the envelope schema with metadata fields

Update envelope creation and serialization to support these top-level fields:

```json
{
  "id": "unique-id",
  "date": "2024-06-01T12:00:00Z",
  "instruction": "...",
  "plan": "...",
  "task": "...",
  "commands": [],
  "patch": null,
  "files": []
}
```

The new fields are:

- `id`: a stable unique identifier for the envelope session.
- `date`: the envelope creation or update timestamp in ISO-8601 UTC format.
- `plan`: free-form text reserved for the agent plan.
- `task`: free-form text describing the current task continuity.
- `patch`: the last failed patch plus its error message, or absent/null when there is no failed patch.

Keep backward compatibility with Milestone 1 envelope files that only contain `instruction`, `commands`, and `files`.

When loading an old envelope, do not fail because these new fields are missing.

## Step 5: Preserve and update `instruction` generation

Keep populating `instruction` from `src/files/Instruction.txt`.

Update the instruction text so it describes the Milestone 2 envelope and patch formats, including:

- `--envelope`, `--patch`, and `--patch-verify-cmd`.
- `read`, `write`, `remove`, `replace`, `exec`, and `task` patch commands.
- Atomic patch application.
- Failed patch persistence in the envelope.
- The rule that an existing `patch` field means the previous patch failed and should be repaired before continuing.

## Step 6: Change read command records from `path` to `patterns`

Replace the Milestone 1 read command record shape:

```json
{ "command": "read", "path": "path/to/file" }
```

with the Milestone 2 shape:

```json
{ "command": "read", "patterns": ["path/to/file"] }
```

Every read command stored in the envelope should use `patterns`.

For backward compatibility, continue accepting old patch/envelope read commands that use `path`, but normalize them internally to `patterns`.

## Step 7: Expand `read` targets to files, folders, and globs

Update read logic so every read pattern can be:

- a path to a single file;
- a path to a folder;
- a glob pattern.

Relative patterns are resolved relative to the current working directory.

Behavior must be:

- If the pattern is an existing file, add that file to the envelope.
- If the pattern is a missing literal file path, fail with an error.
- If the pattern is a folder, remove existing envelope file entries under that folder, then add all files under it.
- If the pattern is a glob, remove existing envelope file entries matching that glob, then add all matching filesystem files.

When one `read` command contains multiple patterns, process all of them as one logical read command and record all patterns in the envelope command entry.

## Step 8: Add read limits and binary options to the CLI

Extend the CLI `read` command to support:

```text
cog read <path> [--lines N] [--sizeKb M] [--read-to-end] [--with-binary-b64]
```

Implement these options:

- `--lines N`: for text files, read only the first `N` lines. Default is `150`.
- `--sizeKb M`: for text files, read only the first `M` kilobytes. Default is `15`.
- `--read-to-end`: for text files, ignore line and size limits and read the whole file. Default is `false`.
- `--with-binary-b64`: for binary files, include base64 content. Default is `false`.

Store the corresponding read command metadata in the envelope.

Use one internal spelling for the field, preferably `sizeKb`, and accept the legacy/example spelling `sizeKB` when reading old envelopes or patches.

## Step 9: Update text file envelope entries for partial reads

Keep the existing text file entry shape:

```json
{
  "path": "path/to/file",
  "type": "text",
  "content": "...",
  "complete": true
}
```

Set `complete` accurately:

- `true` when the whole text file was read.
- `false` when `lines` or `sizeKb` truncation was applied.

When both line and size limits are set, stop at whichever limit is reached first.

## Step 10: Add binary file base64 support

Keep the existing binary entry without content when binary content is not requested:

```json
{
  "path": "path/to/binary",
  "type": "binary"
}
```

When `withBinary` or `--with-binary-b64` is enabled, include base64 content:

```json
{
  "path": "path/to/binary",
  "type": "binary",
  "contentBase64": "..."
}
```

Use a consistent property name in code and tests. Accept older variations only as compatibility input if already present.

## Step 11: Add the `replace` patch command

Implement a new patch command:

```json
{
  "command": "replace",
  "path": "path/to/file",
  "search": "old content",
  "replacement": "new content"
}
```

Behavior:

- Read the target file as text.
- Search for the exact `search` string.
- If there is exactly one match, replace it with `replacement`.
- If there are zero matches, fail the patch.
- If there are multiple matches, fail the patch.
- Do not modify the target file if the command fails.

After a successful patch, refresh the corresponding file entry in the envelope.

## Step 12: Add the `exec` patch command

Implement a new patch command that executes a shell command, writes its output to a file, adds that output file to the envelope, and records/syncs the command.

Recommended command shape:

```json
{
  "command": "exec",
  "cmd": "dotnet test",
  "path": "logs/dotnet-test.txt"
}
```

Behavior:

- Execute `cmd` in the current working directory.
- Capture standard output and standard error.
- Write captured output to `path`.
- If the process exits non-zero, fail the patch unless the final implementation explicitly supports an allow-failure option.
- Add or refresh `path` in the envelope files list.
- Add the executed command to the envelope commands list so the envelope records how the output file was produced.

## Step 13: Add the `task` patch command

Implement a new patch command:

```json
{
  "command": "task",
  "content": "current task description"
}
```

or, if the existing code prefers a named property:

```json
{
  "command": "task",
  "task": "current task description"
}
```

Behavior:

- Set the top-level `task` field in the envelope.
- Do not create, modify, or remove project files.
- Include this command in patch atomicity: if another command in the same patch fails, the task update is rolled back too.

Pick one canonical property name and document it in `Instruction.txt`. Accept the other property as compatibility input if useful.

## Step 14: Make `apply-patch` atomic

Change `apply-patch` so patch commands are applied as a single transaction.

Required behavior:

- Before applying commands, snapshot all files that may be changed or removed.
- Also snapshot the envelope state.
- Apply every command in order.
- Run the verify command if one is configured.
- If any command fails or verification fails, restore all changed files and restore the previous envelope state except for the failed patch record.
- If all commands and verification succeed, commit all file changes and envelope updates.

Do not leave partially written, partially replaced, or partially removed files after a failed patch.

## Step 15: Store failed patches in the envelope

When `apply-patch` fails, store the failed patch in the top-level `patch` field of the envelope together with an error message.

Use this shape:

```json
{
  "patch": {
    "commands": [
      { "command": "write", "path": "file.txt", "content": "..." }
    ],
    "error": "error message"
  }
}
```

The failed patch should remain available to the next AI agent turn.

Update error handling so the envelope still saves successfully even when the project files are rolled back.

## Step 16: Remove successful patches from the envelope

When `apply-patch` succeeds:

- Update project files.
- Refresh affected file entries in the envelope.
- Record relevant commands in the envelope command history.
- Remove the top-level `patch` field, or set it to `null`.

The final envelope must not retain a stale failed patch after a successful patch application.

## Step 17: Refresh envelope files after patch commands

After successful `write`, `replace`, `remove`, `read`, and `exec` patch commands, synchronize the envelope `files` list.

Behavior:

- `write`: create or overwrite the file, then add or refresh its envelope entry.
- `replace`: modify the file, then add or refresh its envelope entry.
- `remove`: remove the file, then remove its envelope entry.
- `read`: add or refresh all matched file entries.
- `exec`: write the output file, then add or refresh its envelope entry.

Avoid duplicate `files` entries for the same normalized path.

## Step 18: Update `write` patch command behavior and validation

Keep the existing `write` command:

```json
{
  "command": "write",
  "path": "path/to/file",
  "content": "..."
}
```

Ensure it creates parent directories as needed.

Validate that `path` is a file path, not a folder path. The Milestone 1 example says `"path/to/folder"`, but Milestone 2 behavior is to create or set file content.

If `content` is omitted, fail the patch.

## Step 19: Update `remove` patch command behavior and validation

Keep the existing `remove` command:

```json
{
  "command": "remove",
  "path": "path/to/file"
}
```

Behavior:

- Remove the target file.
- Remove the target file entry from the envelope.
- If the file does not exist, fail the patch unless the existing implementation already treats removal as idempotent and this behavior is explicitly documented.

Include `remove` in atomic rollback.

## Step 20: Update command parsing and validation errors

Update validation so malformed patch commands fail clearly before changing files where possible.

Validate:

- `command` is present.
- Unknown commands are rejected.
- `read` has `patterns` or legacy `path`.
- `write` has `path` and `content`.
- `remove` has `path`.
- `replace` has `path`, `search`, and `replacement`.
- `exec` has command text and output path.
- `task` has task content.
- Numeric limits such as `lines` and `sizeKb` are positive integers.

Error messages should be stored in the failed envelope `patch.error` field when failure happens during `apply-patch`.

## Step 21: Update `apply-patch` command behavior and help text

Update CLI help and command behavior for:

```text
cog apply-patch
```

It should:

1. Load the selected envelope.
2. Load the selected patch.
3. Apply the patch atomically.
4. Run configured verification.
5. On success, update envelope files and remove failed patch state.
6. On failure, restore project files and save the failed patch with an error message in the envelope.

Also fix any existing typo or confusing text that says "`patch` command applies the patch"; the CLI command is `apply-patch`.

## Step 22: Update read command help text

Update CLI help for:

```text
cog read <path> [--lines N] [--sizeKb M] [--read-to-end] [--with-binary-b64]
```

Make it clear that `<path>` can be repeated or can represent a file, folder, or glob.

If the parser supports multiple positional paths, document it as:

```text
cog read <path> [<path> ...] [--lines N] [--sizeKb M] [--read-to-end] [--with-binary-b64]
```

Store repeated paths in a single `patterns` array.

## Step 23: Add tests for command line precedence

Add tests proving precedence and missing-file behavior:

- `--envelope` overrides `COG_ENVELOPE_PATH`.
- `--patch` overrides `COG_PATCH_PATH`.
- `--patch-verify-cmd` overrides `COG_PATCH_VERIFY_CMD`.
- Missing envelope file is created.
- Missing patch file produces an error.

## Step 24: Add tests for read files, folders, globs, limits, and binary content

Add read tests for:

- reading one text file;
- reading multiple files;
- reading a folder recursively;
- reading a glob;
- missing literal file path failure;
- `--lines`;
- `--sizeKb`;
- line limit plus size limit;
- `--read-to-end`;
- binary file without base64;
- binary file with base64.

Verify the envelope records `patterns`, file entries, and `complete` correctly.

## Step 25: Add tests for all patch commands

Add patch command tests for:

- `read`;
- `write`;
- `remove`;
- `replace` with exactly one match;
- `replace` with zero matches fails;
- `replace` with multiple matches fails;
- `exec` writes output and adds it to the envelope;
- `exec` failure rolls back;
- `task` sets envelope `task`.

## Step 26: Add tests for atomic patch behavior

Add failure and rollback tests:

- A patch with two writes where the second command fails leaves neither write committed.
- A patch that removes then fails restores the removed file.
- A patch that replaces then fails restores the original file content.
- A patch that updates `task` then fails restores the old task.
- A failed patch is stored in `envelope.patch.error`.
- A later successful patch clears `envelope.patch`.

## Step 27: Add tests for verification command behavior

Add verification tests:

- Successful verify command commits the patch.
- Non-zero verify command rolls back files.
- Non-zero verify command stores the patch and error in the envelope.
- CLI verify command overrides environment verify command.

## Step 28: Update documentation examples

Update all docs and examples from Milestone 1 to Milestone 2:

- Replace `path` read examples with `patterns`.
- Show new envelope fields.
- Show failed `patch` field shape.
- Show `replace`, `exec`, and `task` commands.
- Show `--envelope`, `--patch`, and `--patch-verify-cmd`.
- Show read options and folder/glob behavior.
- Explain atomic patch application.

## Step 29: Keep Milestone 1 compatibility where practical

Add compatibility handling so old Milestone 1 inputs continue to work:

- Existing envelopes without `id`, `date`, `plan`, `task`, or `patch` can still load.
- Existing read commands with `path` are accepted and normalized to `patterns`.
- Existing patch files without top-level `task` still apply.
- Existing `sizeKB` spelling is accepted where it already appears.

Do not emit new Milestone 1 shapes from the updated implementation unless required for compatibility.

## Step 30: Final acceptance check

The project satisfies Milestone 2 when all of these are true:

- `cog --envelope e.json read src --lines 100 --sizeKb 20` creates or updates `e.json`.
- The envelope contains `id`, `date`, `instruction`, `commands`, and `files`.
- Read commands are recorded with `patterns`.
- `cog --envelope e.json --patch p.json apply-patch` applies the selected patch.
- `write`, `remove`, `replace`, `exec`, `read`, and `task` patch commands work.
- Failed patch application is atomic and stores the failed patch plus an error in `envelope.patch`.
- Successful patch application updates `files` and clears `envelope.patch`.
- `--patch-verify-cmd` or `COG_PATCH_VERIFY_CMD` controls verification.
- Documentation and instruction text match the Milestone 2 behavior.
