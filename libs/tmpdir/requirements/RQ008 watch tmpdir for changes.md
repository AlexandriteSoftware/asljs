# RQ008 watch tmpdir for changes

- Status: Proposed

Add optional `watch` parameter to the tmpdir constructor. If set to `true`, the
tmpdir object calls `change` event handler when a underlying filessytem watcher
returns notifies that a change has occurred in the tmpdir.
