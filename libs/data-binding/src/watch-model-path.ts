import { isObservable,
         observe }
  from 'asljs-observable';
import { createDisposer }
  from './create-disposer.js';
import { readModelPath }
  from './read-model-path.js';
import { DataModel }
  from './types.js';

/**
 * Calls back with the value at `path` now and whenever it changes, and returns
 * a disposer. The value is the one binding renders: it is not read again.
 *
 * A model that does not conform to the observable contract is read once, by
 * `readModelPath`: the callback runs immediately and the disposer has nothing
 * to release. `observe()` throws for such a root, while a plain model is a
 * supported, static binding source.
 */
export function watchModelPath(
    model: DataModel,
    path: string,
    callback: (value: unknown) => void
  ): () => boolean
{
  if (!isObservable(model)) {
    callback(
      readModelPath(
        model,
        path));

    return createDisposer(
      () => { });
  }

  // The path comes from markup, so it cannot be checked against the model type.
  // The subscription's disposer already runs once and reports whether it did.
  return observe(model)
    .at(
      path as never)
    .subscribe(callback);
}
