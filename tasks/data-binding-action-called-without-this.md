# data-binding-action-called-without-this

An event binding invokes the model's action as a bare function, so a model
method that uses `this` fails.

Package: `data-binding`.

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

Clicking the button leaves `count` at `0` and logs
`data-bind[0]: action 'increment' failed TypeError: Cannot read properties of
undefined (reading 'count')`, once, because the error path goes through
`warnOnce`. Nothing in `README.md` or `AGENTS.md` says that actions must be
closures or arrow functions; `README.md` says "Keep event handler names on the
model", and the app-builder prompt in `apps/app-builder/src/app-builder/ai/`
repeats it to the generator. The generated example app avoids the trap by
closing over its `state` variable instead of using `this`, which is a
workaround, not a documented rule.

`asljs-components` sidesteps it in `src/list.ts`: `#createRowScopeContext`
re-binds every function on the shared context to the derived row object with
`value.bind(rowContext)`, precisely so that `context.select` can use `this`.
That is caller work the binding could do.

Proposed behaviour: call the action with the object that holds it as `this`.
For `data-bind-onclick="user.activate"` that is `model.user`, for
`data-bind-onclick="increment"` it is the context model. A function that was
already bound, as the list rows are, ignores the `this` passed by `call`, so
the components keep working. `(event, model, element)` stays as the argument
shape.

There is also no test for the two warning paths in `bindEventModel`, missing
action and action that throws; the task should add them alongside the `this`
test.

## Where

- `libs/data-binding/src/bind-event-model.ts` - `listener`, the bare call.
- `libs/data-binding/src/read-model-path.ts` - resolves the leaf but not its
  owner, which the fix needs.
- `libs/data-binding/README.md` - "Event bindings", the invocation contract.
- `libs/components/src/list.ts` - `#createRowScopeContext`, the caller-side
  workaround.
