import {
    observable
  } from 'asljs-observable';
import {
    applyPipes,
    type PipeWarning
  } from './apply-pipes.js';
import {
    mergePipes
  } from './pipes.js';
import {
    readModelPath
  } from './read-model-path.js';
import {
    type BindDataModelOptions,
    type DataModel,
    type ValueBindingSpec
  } from './types.js';
import {
    writeBindingValue
  } from './write-binding-value.js';

export function bindValueModel(
    element: HTMLElement,
    spec: ValueBindingSpec,
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
  const pipeRegistry =
    mergePipes(options);

  const update =
    () => {
      const rawValue =
        readModelPath(
          model,
          spec.path);

      const formattedValue =
        applyPipes(
          rawValue,
          spec.pipes,
          pipeRegistry,
          warning => {
            reportPipeWarning(
              warning,
              warnPrefix,
              warnOnce);
          });

      writeBindingValue(
        element,
        spec.target,
        formattedValue);
    };

  update();

  if (spec.path === '') {
    return () => {};
  }

  const maybeUnsubscribe =
    observable.watch(
      model as any,
      spec.path,
      () => {
        update();
      });

  if (typeof maybeUnsubscribe !== 'function') {
    return () => {};
  }

  return () => {
    maybeUnsubscribe();
  };
}

function reportPipeWarning(
    warning: PipeWarning,
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
      `${warnPrefix}:unknown-pipe:${warning.pipeName}`,
      `${warnPrefix}: unknown pipe '${warning.pipeName}'`);

    return;
  }

  warnOnce(
    `${warnPrefix}:pipe-error:${warning.pipeName}`,
    `${warnPrefix}: pipe '${warning.pipeName}' failed`,
    warning.error);
}
