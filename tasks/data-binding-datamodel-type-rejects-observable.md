# data-binding-datamodel-type-rejects-observable

`DataModel` is `Record<string, unknown>`, which the result of `observable()`
and any interface-typed object fail to satisfy, so every caller casts.

Package: `data-binding`.

`bindDataModel(root, model: DataModel)` with
`type DataModel = Record<string, unknown>` requires an index signature. The
package's primary input, a converted observable, has none:

```text
error TS2345: Argument of type 'ConvertedObject<{ name: string; ... }>' is
not assignable to parameter of type 'DataModel'.
  Index signature for type 'string' is missing in type
  '{ name: string; ... } & Eventful<ObservableEvents>'.
```

Neither does a plain object typed by an `interface`. The result is visible in
every real caller: `libs/components/src/text-input.ts` and `select.ts` pass
`this.#model as unknown as Record<string, unknown>`, and the package's own
tests cast `model as unknown as Record<string, unknown>` in every observable
case. A double cast through `unknown` is the signal that the parameter type is
wrong rather than the argument.

Two smaller type-surface points sit next to it:

- `DataModelWithOn` in `types.ts` is exported from the module and used by
  nothing in the repository.
- `PipeFn` is the type of every entry in `BindDataModelOptions.pipes`, but
  `index.ts` does not export it, so a user cannot name the type of a custom
  pipe they define separately from the options literal.

Proposed behaviour: widen `DataModel` to `object` (the runtime only needs a
non-null object, see `bindContextElement`), or to
`Record<string, unknown> | Observable` if the observable half should stay
visible in the signature. Remove the casts in the tests and in
`asljs-components`, which then act as the type-level check. Delete
`DataModelWithOn` or use it, and export `PipeFn`.

## Where

- `libs/data-binding/src/types.ts` - `DataModel`, `DataModelWithOn`, `PipeFn`.
- `libs/data-binding/src/index.ts` - the export list.
- `libs/data-binding/src/bind-data-model.test.ts` - the `as unknown as`
  casts.
- `libs/components/src/text-input.ts`, `libs/components/src/select.ts` -
  `#renderTemplate` and `#mountControl`, the caller-side casts.
