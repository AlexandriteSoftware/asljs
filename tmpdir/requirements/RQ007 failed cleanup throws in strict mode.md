# RQ007 failed cleanup throws in strict mode

- Status: Proposed

When `strict` is set to `true` while creating the tmpdir instance, the tmpdir
object should throw an exception if the cleanup fails.
