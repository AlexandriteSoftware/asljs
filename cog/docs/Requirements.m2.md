# Requirements

COG is a command line tool that maintains project changing session for
AI agents.

It operates by creating and maintaining an envelope file, refreshing envelope
file snapshots, and applying patches to project files.

## Envelope

Envelope is a JSON file that contains a list of files produced by read
commands. It does not contain a command log.

## File update commands

Each file may have an `update` property. This property stores a read command
that refreshes the file content.

## Backup and rollback feed

`apply-patch` uses `backup.json` in the envelope directory to make patch
application transactional. The backup file is managed through a rollback feed.

Backup format:

```json
{
  "files": [
    {
      "path": "path/to/file",
      "existed": true,
      "content": "base64-encoded previous file content"
    },
    {
      "path": "path/to/new-file",
      "existed": false
    }
  ]
}
```

A file state is saved to backup before every update or removal. If the same file
is updated multiple times, each previous state is appended. Rollback replays the
backup from last to first.

Rollback responsibility belongs to command modules:

- Command functions accept a rollback feed.
- Commands that mutate local files must save rollback state to the feed before
  mutating files.
- Each command file exports a rollback function for the command.
- `read` rollback is a no-op because read does not mutate local project files.
- `write` rollback restores the latest file state from the feed.
- `remove` rollback restores the latest file state from the feed.

`main.ts` owns rollback feed lifecycle and command dispatch only. It must not
contain command-specific file backup logic.

If the process crashes or is killed and `backup.json` remains, the next
`apply-patch` must stop before applying anything. The user can run `restore` to
restore the backup and remove `backup.json`, or manually delete `backup.json` to
complete the backup without restoring.

## Patch

Patch is a series of commands that are applied to the envelope.

Commands:

- `read`: reads files and adds them to the envelope.
- `write`: creates a file or sets content of a file.
- `remove`: removes a file.
- `replace`: replaces part of the file, specified by search, with new content,
  specified by replacement.
- `exec`: executes a command and writes its output to file, adds this file to
  the envelope.
- `task`: sets the task field in the envelope.

## Applying patch

`apply-patch` command applies the patch transactionally.

The command must:

1. Stop if `backup.json` already exists.
2. Create a rollback feed backed by `backup.json`.
3. Apply patch commands to local files and the in-memory envelope.
4. Pass the rollback feed to each command.
5. Let commands save rollback state before mutating local files.
6. On any failure, restore backup entries from last to first, delete
   `backup.json`, and rethrow the error.
7. Run the patch verification command, if configured.
8. If verification fails, restore backup entries from last to first, delete
   `backup.json`, and rethrow the error.
9. After patching is complete and verified, run update commands for files in the
   envelope.
10. Save the envelope.
11. Delete `backup.json`.

## CLI

`<command>` is a command to execute. It can be one of the following:

- `read <path> [arguments]`
  reads matching files and adds them to the envelope.
- `list`
  prints a markdown table of envelope files with columns `Location`,
  `Complete`, and `Type`.
- `update`
  refreshes envelope files by running each file's stored update command.
- `restore`
  restores files from `backup.json` and removes `backup.json`.
- `apply-patch [--patch-verify-cmd <command>]`
  transactionally applies the patch. If `backup.json` exists, it stops before
  applying anything. `--patch-verify-cmd` specifies the command used to verify
  the applied patch and takes precedence over `COG_PATCH_VERIFY_CMD`.


## Patch verification

`apply-patch` supports an apply-patch-specific `--patch-verify-cmd <command>`
argument.

The verify command is selected in this order:

1. `--patch-verify-cmd <command>`
2. `COG_PATCH_VERIFY_CMD`
3. no verification command

The verify command runs in the current working directory after patch commands
are applied and before the patch is accepted.

If the command exits with code `0`, the patch is valid.

If the command exits with any non-zero code, the patch is invalid and
`apply-patch` must fail. Since verification happens before the patch is accepted,
verification failure must use the normal transactional rollback path.


## List command

`list` prints the files currently stored in the envelope as a markdown table.

The table columns are:

- `Location` - the envelope file path.
- `Complete` - `yes` when `complete` is `true`, `no` when `complete` is `false`,
  and empty when `complete` is omitted.
- `Type` - the envelope file type.

Example output:

```md
| Location | Complete | Type |
| --- | --- | --- |
| src/index.ts | yes | text |
| assets/logo.png |  | binary |
```
