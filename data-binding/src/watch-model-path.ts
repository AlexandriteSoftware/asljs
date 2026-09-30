import { isObservable,
         observe }
  from 'asljs-observable';
import { DataModel }
  from './types.js';

/**
 * Calls back now and whenever the value at `path` changes, and returns a
 * disposer.
 *
 * A model that does not conform to the observable contract is read once: the
 * callback runs immediately and the disposer does nothing. `observe()` throws
 * for such a root, while a plain model is a supported, static binding source.
 */
export function watchModelPath(
    model: DataModel,
    path: string,
    callback: () => void
  ): () => void
{
  if (!isObservable(model)) {
    callback();

    return () => { };
  }

  // The path comes from markup, so it cannot be checked against the model type.
  const unsubscribe =
    observe(model)
    .at(
      path as never)
    .subscribe(
      () => callback());

  return (): void =>
  {
    unsubscribe();
  };
}
