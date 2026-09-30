import { readModelPath }
  from './read-model-path.js';
import { DataModel,
         EventBindingSpec }
  from './types.js';
import { watchModelPath }
  from './watch-model-path.js';

type ActionFn =
  (
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
  ): () => void
{
  let currentAction: unknown = null;

  const refreshAction =
    (): void =>
    {
    currentAction =
      readModelPath(
        model,
        spec.actionPath);
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

  return (): void =>
  {
    element.removeEventListener(
      spec.eventName,
      listener);

    unsubscribe?.();
  };
}
