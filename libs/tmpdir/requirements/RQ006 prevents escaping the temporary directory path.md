# RQ006 prevents escaping the temporary directory path

All tmpdir object methods that accept a path parameter should prevent escaping
the temporary directory path. For example, attempt to write to a file outside of
the temporary directory should throw an error.
