# data-binding-dispose-returns-nothing

The disposer `bindDataModel` returns is `() => void` and re-runs its work on
every call, against the repository rule for idempotent operations.

Package: `data-binding`.

`CONVENTIONS.md` under "Encapsulation": idempotent operations such as
unsubscribe closures "report whether the call did anything: the first call
returns `true`, and every later call returns `false` without side effects". The
`subscribe` disposer in `asljs-observable` follows it. The disposer from
`bindDataModel`, and the inner ones from `bindSubtree`, `bindContextElement`,
`bindValueModel` and `bindEventModel`, all return `void`, and a second call
walks the whole tree again: `removeEventListener` for every event binding, the
child disposer of every context, and `unsubscribe()` on every watcher.

Calling it twice is harmless today only because each leaf happens to tolerate
it. It leaves a caller that keeps several disposers, as `asljs-list` does in
`#itemBindingDisposers`, no way to tell a live binding from a disposed one, and
makes the return type differ from the one the observable package hands back for
the same job.

Proposed behaviour: guard each disposer with an `active` flag, return `true` on
the first call and `false` after, and declare `() => boolean`. Add a test that
disposes twice and checks both return values.

## Where

- `libs/data-binding/src/bind-data-model.ts` - `bindDataModel`, `bindSubtree`,
  `bindContextElement`, the returned closures.
- `libs/data-binding/src/bind-value-model.ts`,
  `libs/data-binding/src/bind-event-model.ts`,
  `libs/data-binding/src/watch-model-path.ts` - the leaf disposers.
- `CONVENTIONS.md` - "Encapsulation", the rule.
