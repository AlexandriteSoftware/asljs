import { createDisposer }
  from './create-disposer.js';
import { readModelPathOwner }
  from './read-model-path.js';
import { DataModel,
         EventBindingSpec }
  from './types.js';
import { watchModelPath }
  from './watch-model-path.js';

type ActionFn =
  (
    this: unknown,
    event: Event,
    model: DataModel,
    element: Element
  ) =>
    unknown;

export function bindEventModel(
    element: HTMLElement,
    spec: EventBindingSpec,
    model: DataModel,
    warnPrefix: string,
    warnOnce: (
    key: string,
    message: string,
    error?: unknown
  ) => void
  ): () => boolean
{
  let currentAction: unknown = null;

  const refreshAction =
    (
        action: unknown
      ): void =>
    {
    currentAction = action;
  };

  const listener =
    (
        event: Event
      ): void =>
    {
    if (
      typeof currentAction
      !== 'function'
    ) {
      warnOnce(
        `${warnPrefix}:missing-action:${spec.actionPath}`,
        `${warnPrefix}: action '${spec.actionPath}' is not a function`);

      return;
    }

    // The owner is read when the event fires rather than with the action: a
    // replaced owner can carry the same function, which the watch does not
    // report as a change.
    const owner =
      readModelPathOwner(
        model,
        spec.actionPath);

    try {
      (currentAction as ActionFn).call(
        owner,
        event,
        model,
        element);
    } catch (error) {
      warnOnce(
        `${warnPrefix}:action-error:${spec.actionPath}`,
        `${warnPrefix}: action '${spec.actionPath}' failed`,
        error);
    }
  };

  element.addEventListener(
    spec.eventName,
    listener);

  const unsubscribe =
    spec.actionPath === ''
    ? null
    : watchModelPath(
      model,
      spec.actionPath,
      refreshAction);

  return createDisposer(
    (): void =>
    {
      element.removeEventListener(
        spec.eventName,
        listener);

      unsubscribe?.();
    });
}
