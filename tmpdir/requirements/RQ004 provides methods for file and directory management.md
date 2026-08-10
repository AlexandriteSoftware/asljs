# RQ004 provides methods for file and directory management

- Status: Partially Done

The tmpdir object should provide methods for file and directory management,
including:

- writing text to a file
- writing binary content to a file
- reading text from a file
- reading binary content from a file
- generating a text file of a specified size
- generating a binary file of a specified size
- creating a directory
- deleting a directory
- deleting a file
- checking if a file exists
- checking if a directory exists

Both sync and async versions of these methods should be provided.

The async versions of these methods should return a Promise.

The sync version of these methods should has the same name as the async version,
but with a `Sync` suffix.
