# `RestoreTask` (`restore`)

## Purpose

Restores project files from a patch backup and removes the backup file. Used
to recover after an `apply-patch` run was interrupted (for example, by a
crash) and left `backup.json` behind.

## Parameters

- `backupPath` (`string`, required) - path to the backup file (typically
  `backup.json` in the envelope directory).

## How it works

1. Checks that `backupPath` exists; throws `backup.json does not exist:
   <backupPath>` if not.
2. Calls `BackupRollbackFeed.restoreAndDelete(backupPath)`, which replays the
   backup entries from last to first (restoring or removing each file to its
   pre-patch state) and then deletes the backup file.

## Failure modes

- Throws if the backup file does not exist.
- Propagates any file system error encountered while restoring.

## Notes

- Does not require an envelope; it only needs a backup file path.
- The CLI's `restore` command wraps this task with backup path resolution
  (`resolveBackupPath`) from the current envelope path.
