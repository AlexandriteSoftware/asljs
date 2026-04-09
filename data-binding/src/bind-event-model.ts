import {
    observable
  } from 'asljs-observable';
import {
    applyEventMiddleware,
    type EventMiddlewareWarning
  } from './apply-event-middleware.js';
import {
    mergeEventMiddleware
  } from './event-middleware.js';
import {
    readModelPath
  } from './read-model-path.js';
import {
    type BindDataModelOptions,
    type DataModel,
    type EventBindingSpec
  } from './types.js';

type ActionFn = (
    event: Event,
    model: DataModel,
    element: Element
  ) => unknown;

export function bindEventModel(
    element: HTMLElement,
    spec: EventBindingSpec,
    model: DataModel,
    options: BindDataModelOptions,
    warnPrefix: string,
    warnOnce: (
      key: string,
      message: string,
      error?: unknown
    ) => void
  ): () => void
{
  const middlewareRegistry =
    mergeEventMiddleware(options);

  let currentAction: unknown =
    readModelPath(
      model,
      spec.actionPath);

  const refreshAction =
    () => {
      currentAction =
        readModelPath(
          model,
          spec.actionPath);
    };

  const listener =
    (event: Event) => {
      applyEventMiddleware(
        event,
        spec.middleware,
        middlewareRegistry,
        { model,
          element },
        warning => {
          reportMiddlewareWarning(
            warning,
            warnPrefix,
            warnOnce);
        });

      if (typeof currentAction !== 'function') {
        warnOnce(
          `${warnPrefix}:missing-action:${spec.actionPath}`,
          `${warnPrefix}: action '${spec.actionPath}' is not a function`);

        return;
      }

      try {
        (currentAction as ActionFn)(
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

  let unsubscribe: (() => boolean) | null = null;

  if (spec.actionPath !== '') {
    const maybeUnsubscribe =
      observable.watch(
        model as any,
        spec.actionPath,
        () => {
          refreshAction();
        });

    if (typeof maybeUnsubscribe === 'function') {
      unsubscribe = maybeUnsubscribe;
    }
  }

  return () => {
    element.removeEventListener(
      spec.eventName,
      listener);

    unsubscribe?.();
  };
}

function reportMiddlewareWarning(
    warning: EventMiddlewareWarning,
    warnPrefix: string,
    warnOnce: (
      key: string,
      message: string,
      error?: unknown
    ) => void
  ): void
{
  if (warning.type === 'unknown') {
    warnOnce(
      `${warnPrefix}:unknown-middleware:${warning.middlewareName}`,
      `${warnPrefix}: unknown middleware '${warning.middlewareName}'`);

    return;
  }

  warnOnce(
    `${warnPrefix}:middleware-error:${warning.middlewareName}`,
    `${warnPrefix}: middleware '${warning.middlewareName}' failed`,
    warning.error);
}
