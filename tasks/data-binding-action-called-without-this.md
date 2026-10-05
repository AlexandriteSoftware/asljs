# data-binding-action-called-without-this

An event binding invokes the model's action as a bare function, so a model
method that uses `this` fails.

Package: `data-binding`.

## Context

`bindDataModel(root, model)` walks the elements under `root`. For each
`data-bind-on<event>` attribute, `createBindingSpec` in `bind-data-model.ts`
calls `parseEventBindingExpression`, which produces `{ kind: 'event', eventName,
actionPath }`, and `bindEventModel` wires it:

- `refreshAction` reads the action with `readModelPath(model, actionPath)` and
  stores it in `currentAction`; `watchModelPath` runs it once now and again
  whenever the path changes on an observable model.
- `listener`, attached with `addEventListener`, calls `currentAction` on each
  event.

`libs/data-binding/src/bind-event-model.ts`:

```ts
  const refreshAction =
    (): void =>
    {
    currentAction =
      readModelPath(
        model,
        spec.actionPath);
  };
// ...
    try {
      (currentAction as ActionFn)(
        event,
        model,
        element
      );
    } catch (error) {
      warnOnce(
        `${warnPrefix}:action-error:${spec.actionPath}`,
        `${warnPrefix}: action '${spec.actionPath}' failed`,
        error);
    }
```

`readModelPath` returns only the leaf value; the object that held it is lost
while walking:

`libs/data-binding/src/read-model-path.ts`:

```ts
  let current: unknown = source;

  for (const part of parts) {
// ...
    current =
      (current as Record<string, unknown>)[part];
  }

  return current;
```

`warnOnce` is created per `bindDataModel` call and logs each key once with
`console.warn`; `warnPrefix` is `data-bind[<n>]`, numbered per binding.

## Problem

`bindEventModel` resolves the action with `readModelPath` and calls it as
`(currentAction as ActionFn)(event, model, element)`. Nothing is bound, so
inside the action `this` is `undefined`. The most natural way to put an action
on a model, a method that reads or writes its own object, is the one shape that
does not work:

```ts
const model = observable({ count: 0, increment() { this.count++; } });

bindDataModel(root, model);
// <button data-bind-onclick="increment">
```

Clicking the button leaves `count` at `0` and logs `data-bind[0]: action
'increment' failed TypeError: Cannot read properties of undefined (reading
'count')`, once, because the error path goes through `warnOnce`. Nothing in
`docs/Bindings.md` or `AGENTS.md` says that actions must be closures or arrow
functions; `docs/Bindings.md` says "Keep event handler names on the model" under
"Authoring rules", and the app-builder prompts in
`apps/app-builder/src/app-builder/ai/` embed the package `AGENTS.md`, which
states only the `(event, model, element)` shape. The generated example app
avoids the trap by closing over its `state` variable instead of using `this`,
which is a workaround, not a documented rule.

`asljs-components` sidesteps it in `src/list.ts`: `#createRowScopeContext`
re-binds every function on the shared context to the derived row object with
`value.bind(rowContext)`, precisely so that `context.select` can use `this`.
That is caller work the binding could do.

Proposed behaviour: call the action with the object that holds it as `this`. For
`data-bind-onclick="user.activate"` that is `model.user`, for
`data-bind-onclick="increment"` it is the context model. A function that was
already bound, as the list rows are, ignores the `this` passed by `call`, so the
components keep working. `(event, model, element)` stays as the argument shape.

There is also no test for the two warning paths in `bindEventModel`, missing
action and action that throws; the task should add them alongside the `this`
test.

## Where

- `libs/data-binding/src/bind-event-model.ts` - `listener`, the bare call.
- `libs/data-binding/src/read-model-path.ts` - resolves the leaf but not its
  owner, which the fix needs.
- `libs/data-binding/docs/Bindings.md` - "Binding contract" and "Event
  bindings", the invocation contract.
- `libs/components/src/list.ts` - `#createRowScopeContext`, the caller-side
  workaround.
