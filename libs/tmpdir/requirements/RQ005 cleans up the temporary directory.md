# RQ005 cleans up the temporary directory

The tmpdir object should provide method for removing the temporary directory and
its contents.

The tmpdir object should implement support for `using` blocks. When the `using`
block is exited, the temporary directory and its contents should be
automatically deleted.
