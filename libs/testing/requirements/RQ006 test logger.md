# RQ006 test logger

`createTestLoggerProvider(prefix)` creates the logger provider of a test file:
`debug` unless `<prefix>LEVEL` says otherwise, `silent` giving a
`NullLoggerProvider`; `<prefix>FILE` choosing the target; `pretty` on a stream
and `json` in a file unless `<prefix>FORMAT` says otherwise.
