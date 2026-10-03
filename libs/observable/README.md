# observable

> Part of [Alexandrite Software Library][#1] – a set of high‑quality,
performant JavaScript libraries for everyday use.

## Overview

`asljs-observable` makes plain JavaScript objects and arrays report their own
changes, and gives you a small query for reading values out of them as they
change.

```js
import { observable, observe } from 'asljs-observable';

const state = observable({ user: { name: 'Alice' } });

observe(state).at('user.name').subscribe(name => console.log(name));

state.user.name = 'Bob';

// Output:
// Alice
// Bob
```

## Scope

Three things:

- **A contract** for observing an object: `on`, `off`, and a `change` event
  carrying a list of what changed.
- **A basic query** over anything that satisfies the contract.
  `observe(source).at('user.name').subscribe(...)` reads a path and re-reads it
  when it changes, with `map`, `filter` and `combine` for the rest.
- **A converter** that makes JSON-like structures -- plain old JavaScript
  objects and arrays -- satisfy the contract, so a model carries no subscription
  code of its own. That fits a model of the size a form, a view, or a small
  application.

Conversion happens at runtime: no build step, no annotations, and
`asljs-eventful` as the only dependency.

Building an advanced application model is out of scope, and the contract is the
extension point instead. A model class of your own implements `on`, `off` and
`change`, and the query then works against it exactly as it works against a
converted object. That is how a class with computed properties, a wrapper over
storage, or a Node `EventEmitter` joins the same query as the rest of a model.

## Installation

```bash
npm install asljs-observable
```

NPM Package: [asljs-observable](https://www.npmjs.com/package/asljs-observable)

## Usage

Listen to a model directly:

```js
import { observable } from 'asljs-observable';

const model = observable({ a: 1, b: 2 });

model.on('change', changes => {
  for (const change of changes) {
    console.log(`${change.property}: ${change.previous} -> ${change.value}`);
  }
});

model.a = 3;

// Output:
// a: 1 -> 3
```

Watch several paths, and group writes into one notification:

```js
import { batch, combine, observable, observe } from 'asljs-observable';

const state = observable({ name: 'Alice', active: false });

combine([
  observe(state).at('name'),
  observe(state).at('active')
]).subscribe(([ name, active ]) => console.log(name, active));

batch(() => {
  state.name = 'Bob';
  state.active = true;
});

// Output:
// Alice false
// Bob true
```

An array operation reports one notification rather than one per element, and the
mutating methods describe themselves:

```js
import { observable } from 'asljs-observable';

const items = observable([ 'a', 'b', 'c' ]);

items.on('change', ([ change ]) =>
  console.log(change.kind, 'at', change.index, 'removed', change.removed));

items.shift();

// Output:
// splice at 0 removed [ 'a' ]
```

`subscribe` returns a function that tears the subscription down, and `.value`
reads a path once without subscribing.

## Further reading

- [The contract](docs/contract.md) — what an object must provide to be observed,
  and how to implement it yourself.
- [The query](docs/query.md) — `observe`, the operators, and how values are
  deduplicated.
- [Batching and delivery](docs/batching.md) — `batch(fn)`, and when a
  notification arrives.
- [The converter](docs/converter.md) — what `observable()` converts, what it
  reports, and the `convert` hook.
- [Performance](docs/performance.md) — what the converter costs, and how to
  write the parts of a model that have to be fast.
- [Using it with RxJS](docs/rxjs.md).
- [Migrating from 0.5](docs/migrating-from-0.5.md) — 0.6 changes every event and
  removes `watch`.

Questions and bugs:
[asljs/issues](https://github.com/AlexandriteSoftware/asljs/issues).

## Related packages

- `asljs-eventful` is the event layer underneath: `on`, `off` and `emit` on any
  object. Conversion uses it, and it is this package's only dependency.
- `asljs-data-binding` builds DOM bindings on top of an observable model.

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
