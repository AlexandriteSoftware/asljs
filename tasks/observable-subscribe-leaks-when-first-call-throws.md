# observable-subscribe-leaks-when-first-call-throws

When the listener throws on the first call, which `subscribe` makes before it
returns, the subscription stays attached and no disposer is ever returned.

Package: `observable`.

## Context

`subscribe(listener)` on a query chain calls `execute(chain, listener)`, which
builds the stages, collects their disposers, and then delivers the current value
synchronously (`entry(root.source)` in `libs/observable/src/observe.ts`). Only
after that delivery does it return the disposer over the collected stages.

## Problem

An exception from the first call to the listener propagates out of `execute`
before the disposer is returned. The stages are already subscribed to `change`
on the source, so the listener keeps being called, and the caller has nothing to
release it with:

```ts
const model = observable({ a: 1 });

let calls = 0;

try {
  observe(model).at('a').subscribe(() => {
    calls++;
    if (calls === 1) throw new Error('first');
  });
} catch { }

model.a = 2; // calls is 2: the listener is still attached
```

`libs/data-binding/src/watch-model-path.ts` works around it: it holds the error
from the first call, disposes the subscription it gets back, and rethrows. Every
other caller of `subscribe` has the same leak.

Proposed behaviour: in `execute`, run the collected disposers when the first
delivery throws, then rethrow, so `subscribe` either returns a disposer or
leaves nothing attached. Document it in `docs/query.md`, and once released, drop
the workaround in `watch-model-path.ts`.

## Where

- `libs/observable/src/observe.ts` - `execute`, the first delivery for a
  `source` root and for a `combine` root.
- `libs/observable/docs/query.md` - the `subscribe` behaviour.
- `libs/data-binding/src/watch-model-path.ts` - the workaround.
