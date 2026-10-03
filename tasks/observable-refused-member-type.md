# observable-refused-member-type

A refused member's type is `never`.

Package: `observable`. Moved from the root `TODO.md`.

`never` is right for a model that genuinely cannot be converted, and wrong for
one where the `convert` hook takes the value over. There is no way for the type
to know; `docs/converter.md` says to type the model with the wrapper instead.

Recorded as an accepted limitation rather than scheduled work: it needs a
decision about whether the `convert` hook should be reflected in the type at
all, not an implementation.

## Context

`never` appears for an unsupported value in three places, each describing the
same decision from a different angle:

```ts
export type UnsupportedValue =
  | Date
  | RegExp
  | Error
  | Promise<unknown>
  | Map<any, any>
  | Set<any>
  | WeakMap<object, any>
  | WeakSet<object>
  | ArrayBuffer
  | ArrayBufferView;
```

In `ObservablePath` at `:137` it stops descent, so a refused value contributes
no paths. In `ConvertedMember` at `:197` it describes the member itself. And
the call signature says the same thing for a top-level value:

```ts
/**
 * Unsupported value overload. Converting one of these throws a `TypeError`,
 * so the call resolves to `never`. Hold the value in a plain object, or take
 * it over with the `convert` option.
 */
<T extends UnsupportedValue | Function>(
  value: T,
  options?: ObservableOptions
): never;
```

The runtime disagrees with all three when `convert` is passed, because the
hook decides before the built-in rule does. `docs/converter.md`, under **The
convert hook**, states that order: return a wrapper to take over the value,
the value itself to keep it, or `undefined` to let observable decide.

So the type is correct for the default and wrong for the configured case, and
nothing in `ObservableOptions` is reflected in it.

## Example

The wrapper is the one `docs/converter.md` uses, cut down to what the example
needs:

```ts
import { eventful } from 'asljs-eventful';
import { observable, observe } from 'asljs-observable';

const observableSet = (source: Set<string>) =>
  eventful({
    contains: (value: string) => source.has(value),
    get size() { return source.size; }
  });

const convert = (value: object) =>
  value instanceof Set ? observableSet(value) : undefined;

type Model = {
  name: string;
  tags: Set<string>;
};

const model = observable<Model>(
  { name: 'Alice', tags: new Set([ 'a' ]) },
  { convert });

// Runtime: a working wrapper. Type: `never`.
model.tags.contains('a');
// error TS2339: Property 'contains' does not exist on type 'never'.

// The member itself is a valid path, but its value is typed `never`.
observe(model).at('tags').subscribe(tags => tags.contains('a'));
// error TS2339: Property 'contains' does not exist on type 'never'.

// Descent stops at the refused member, so nothing below it is a path.
observe(model).at('tags.size');
// error TS2345: Argument of type '"tags.size"' is not assignable to
// parameter of type '"name" | "tags"'.
```

At runtime every line works: `model.tags.contains('a')` returns `true`, and
the subscriber receives the wrapper.

Without the hook the same type is exactly right, because the call throws:

```ts
observable({ tags: new Set([ 'a' ]) });
// TypeError: at value.tags: Set is not supported. ...
```

## Every case, checked

Compiled against `dist` with the repository's TypeScript 6.0.3 and run under
Node. "Mismatch" means the type and the runtime disagree.

| Case                                       | Type                    | Runtime               | Mismatch |
| ------------------------------------------ | ----------------------- | --------------------- | -------- |
| Nested `Set`, no hook                      | `never`                 | throws, with the path | no       |
| Nested `Set`, hook returns a wrapper       | `never`                 | the wrapper           | yes      |
| Nested `Set`, hook returns the value       | `never`                 | the raw `Set`         | yes      |
| Nested `Set`, hook returns `undefined`     | `never`                 | throws, with the path | no       |
| Top-level `Set`, hook returns a wrapper    | `never` (the overload)  | the wrapper           | yes      |
| `at('tags')` on a hook-taken member        | accepted, value `never` | delivers the wrapper  | yes      |
| `at('tags.size')` on a hook-taken member   | rejected                | works                 | yes      |
| Model typed with the wrapper, raw `Set` in | rejected (TS2769)       | works                 | yes      |
| Model built with the wrapper already in it | correct                 | correct, no hook used | no       |

Three of these are not in the task as it was first written:

- **Keeping the value is the same problem.** The hook can return the value
  itself to keep it, which `docs/converter.md` documents. The member then
  holds a raw `Set` and is typed `never`, so the hook's documented "keep it"
  answer is as invisible to the type as its "take it over" answer.
- **The path union is not empty for the member.** `ObservablePath` lists the
  key and stops descent below it, so `at('tags')` compiles and
  `ObservablePathValue` resolves through `ConvertedMember` to `never`. A
  subscriber is accepted and then cannot use what it receives.
- **The documented workaround needs a cast.** Declaring `tags` as the wrapper
  type makes the initial value a type error, because a `Set` is not the
  wrapper:

  ```ts
  type ObservableSet = ReturnType<typeof observableSet>;

  observable<{ tags: ObservableSet }>(
    { tags: new Set([ 'a' ]) },
    { convert });
  // error TS2769: No overload matches this call.
  //   Type 'Set<string>' is not assignable to type '{ contains: ... }'.
  ```

  It compiles only with `as unknown as` on the initial value, or by building
  the wrapper first. Built first, the wrapper conforms, so the converter
  passes it through and the hook is not needed for that member at all:

  ```ts
  const model = observable({ tags: observableSet(new Set([ 'a' ])) });

  model.tags.contains('a'); // compiles, and works
  observe(model).at('tags.size'); // compiles, and works
  ```

  `docs/converter.md` says "type the model with your wrapper rather than with
  `Set`" and does not mention either step.

The opposite mismatch exists too and is out of scope here: a class instance is
typed as a plain object and refused at runtime, because TypeScript cannot tell
an instance type from a structurally identical object. The comment on
`UnsupportedValue` records it.

## The decision

Three options, and the task is to pick one rather than to implement the
obvious.

**Leave it.** `never` is honest about the default, and the workaround is to
declare the model with the wrapper already in it:

```ts
type Model = {
  name: string;
  tags: ObservableSet<string>;
};
```

The hook then returns that wrapper and the member's type matches, but the
initial value has to be cast or wrapped first, as **Every case, checked**
shows. Wrapping first is the honest form, and it makes the hook unnecessary for
that member. This is what `docs/converter.md` recommends today, without the
cast.

**Reflect the hook in the type.** `ObservableOptions` would carry the
converter's type, and `ConvertedMember` would consult it:

```ts
export type ObservableOptions<Convert = never> = {
  convert?: (value: object) => Convert | undefined;
  shallow?: boolean;
  // ...
};

export type ConvertedMember<T, Convert = never, Depth = []> =
  T extends UnsupportedValue
    ? Extract<Convert, { [K in keyof T]?: unknown }> extends never
      ? never
      : Extract<Convert, object>
    : /* ... as now ... */;
```

That is where it stops being attractive. The hook is one function for every
value in the graph, so its return type is a union of every wrapper it can
produce, and the type system cannot tell which member of that union belongs to
which refused member. `Set` and `Map` taken over by the same hook both resolve
to the same union. It would turn `never` into something broader but still
wrong, and it would thread a second type parameter through
`ObservablePath`, `ConvertedMember`, `ConvertedMembers` and every overload.

**Make the hook per-type.** A map from constructor to wrapper, rather than one
function, would carry enough information:

```ts
observable(model, {
  convert: new Map([[Set, observableSet]])
});
```

The type could then look the member's constructor up and resolve it exactly.
This is the only option that produces a correct type, and it is a breaking
change to a documented public hook, for an ergonomic gain in a case the README
already has an answer for.

## Why this is recorded rather than scheduled

The first option costs nothing and is already documented, though the
documentation omits the cast it needs. The second produces a
type that is wrong in a new way. The third is correct and expensive. None of
them is an obvious win, so the next step is a decision about whether the
`convert` hook belongs in the type system at all — and if the answer is no,
this file should be deleted and the limitation stated in `docs/converter.md`
instead, where the hook is described. That statement should cover the three
cases above: a kept value is also `never`, `at()` accepts the member and types
its value `never`, and the model must be built with the wrapper already in it
rather than cast.

## Where

- `observable/src/types.ts:137` — the `never` branch for unsupported values in
  `ObservablePath`.
- `observable/src/types.ts:197` — the same branch in `ConvertedMember`.
- `observable/src/types.ts:261` and `:278` — `Converted` and the unsupported
  value overload.
- `observable/src/types.ts:240` — `UnsupportedValue`, the list all three test
  against.
- `observable/src/types.ts:162` — `ObservablePathValue`, which resolves `at()`
  on the member to `never`.
- `observable/src/observe.ts:46` — `at`, constrained to `ObservablePath<T>`.
- `observable/src/observable.ts:908` — the top-level hook call, which runs
  before the refusal the overload describes.
- `observable/docs/converter.md` — **The convert hook**, which documents the
  runtime behaviour the type does not describe, and the workaround without its
  cast.
