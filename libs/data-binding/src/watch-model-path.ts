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
 *
 * When the first call, made while subscribing, throws, the subscription is
 * released before the error propagates: the caller gets no disposer, so
 * nothing else could release it.
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

  // `subscribe` makes the first call before it returns its disposer, and an
  // error from that call would leave the subscription attached. The error is
  // held until the disposer exists. asljs-observable releases it itself after
  // 0.5.4; drop this once the dependency requires a release that does.
  let subscribing = true;

  let firstError: { error: unknown; } | null = null;

  // The path comes from markup, so it cannot be checked against the model type.
  // The subscription's disposer already runs once and reports whether it did.
  const dispose =
    observe(model)
    .at(
      path as never)
    .subscribe(
      (
          value
        ) =>
      {
        if (!subscribing) {
          callback(value);

          return;
        }

        try {
          callback(value);
        } catch (error) {
          firstError =
            { error };
        }
      });

  subscribing = false;

  if (firstError !== null) {
    dispose();

    throw (firstError as { error: unknown; }).error;
  }

  return dispose;
}
