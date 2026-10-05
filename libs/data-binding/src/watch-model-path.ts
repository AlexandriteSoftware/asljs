import { isObservable,
         observe }
  from 'asljs-observable';
import { createDisposer }
  from './create-disposer.js';
import { DataModel }
  from './types.js';

/**
 * Calls back now and whenever the value at `path` changes, and returns a
 * disposer.
 *
 * A model that does not conform to the observable contract is read once: the
 * callback runs immediately and the disposer has nothing to release. `observe()` throws
 * for such a root, while a plain model is a supported, static binding source.
 */
export function watchModelPath(
    model: DataModel,
    path: string,
    callback: () => void
  ): () => boolean
{
  if (!isObservable(model)) {
    callback();

    return createDisposer(
      () => { });
  }

  // The path comes from markup, so it cannot be checked against the model type.
  // The subscription's disposer already runs once and reports whether it did.
  return observe(model)
    .at(
      path as never)
    .subscribe(
      () => callback());
}
