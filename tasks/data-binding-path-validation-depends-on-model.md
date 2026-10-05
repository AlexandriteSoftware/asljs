# data-binding-path-validation-depends-on-model

A malformed binding path is accepted for a plain model and throws for an
observable one, and for an event binding it only warns.

Package: `data-binding`.

## Context

A binding path goes from markup to the model in this order:

- `bindElementAttributes` in `bind-data-model.ts` reads each `data-bind-*`
  attribute and parses it: `parseValueBindingExpression` takes the text before
  the first `|` as `path`, `parseEventBindingExpression` takes the trimmed
  attribute as `actionPath`. Neither checks the path's shape.
- `bindValueModel` or `bindEventModel` passes the path to `watchModelPath`,
  which calls `observe(model).at(path)` only when `isObservable(model)`.
- On each callback the binding reads the value with `readModelPath`.

`libs/data-binding/src/read-model-path.ts`:

```ts
  const parts =
    path
    .split('.')
    .map(
      part => part.trim())
    .filter(
      part => part !== '');
// ...
    if (
      typeof current
      !== 'object'
      || current === null
      || !(part in current)
    ) {
      return null;
    }
```

`libs/observable/src/observe.ts` (`splitPath`, called by `at()` when the chain
is built):

```ts
  const segments =
    path.split('.');

  for (const segment of segments) {
    if (segment.trim() === '') {
      throw new TypeError(
        'Expect path segments to be non-empty.');
    }
  }
```

`libs/data-binding/src/bind-data-model.ts` (`bindElementAttributes`):

```ts
    } catch (error) {
      if (spec.kind === 'value') {
        throw error;
      }

      warnOnce(
        `${prefix}:bind-error`,
        `${prefix}: binding setup failed`,
        error);
    }
```

## Problem

Two path readers disagree about what a path is:

- `readNestedPath` in `read-model-path.ts` splits on `.`, trims, and drops empty
  segments, so `user.` reads `user` and `user..name` reads `user.name`.
- `observe().at()` in `asljs-observable` throws `TypeError: Expect path segments
  to be non-empty.` for the same strings.

`watchModelPath` only calls `observe` when the model conforms, so the same
markup behaves three ways:

- plain model, `data-bind-text="user."`: renders `[object Object]`, no error.
- observable model, `data-bind-text="user."`: `bindDataModel` throws the
  `TypeError`, and whatever it bound before that is leaked (see
  `data-binding-setup-failure-leaks-subscriptions`).
- observable model, `data-bind-on-click="save."`: `bindElementAttributes`
  catches it and logs `binding setup failed`. `bindEventModel` attached its
  listener before `watchModelPath` threw, and that listener is never removed:
  the action is never resolved, so each click only warns `action 'save.' is not
  a function`.

A typo therefore surfaces, or not, depending on which model the template is
tried against first. The components tests bind plain objects in several places
and observables in others, so a template that passes one suite can throw in the
app.

The two readers also disagree about a missing path: `readModelPath` returns
`null`, the observable query reports `undefined`. The binding ignores the value
the subscription delivers and re-reads with `readModelPath`, which hides the
difference today but is the reason the two have drifted.

Proposed behaviour: validate the path once, in `parseValueBindingExpression` and
`parseEventBindingExpression`, with the same rule `observe` applies (no empty
segments, no leading or trailing dot), and throw the same `TypeError` for both
model kinds, for both binding kinds, at parse time. Then `readNestedPath` no
longer needs to filter, and the two readers can share one `split`. Add parse
tests for `user.`, `user..name` and `.user`.

## Where

- `libs/data-binding/src/read-model-path.ts` - `readNestedPath`, the lenient
  reader.
- `libs/data-binding/src/watch-model-path.ts` - the strict path, via
  `observe().at()`.
- `libs/data-binding/src/parse-data-model-binding.ts` - where validation
  belongs.
- `libs/data-binding/src/bind-data-model.ts` - `bindElementAttributes`, the
  catch that turns the event-binding case into a warning.
- `libs/observable/src/observe.ts` - `splitPath`, the rule to match.
