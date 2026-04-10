import {
    observable
  } from 'asljs-observable';
import {
    mergePipes
  } from './pipes.js';
import {
    readModelPath
  } from './read-model-path.js';
import {
    type BindDataModelOptions,
    type DataModel,
    type PipeFn,
    type PipeSpec,
    type ValueBindingSpec
  } from './types.js';
import {
    writeBindingValue
  } from './write-binding-value.js';

type CompiledPipe =
  { args: string[];
    formatter: PipeFn; };

export function bindValueModel(
    element: HTMLElement,
    spec: ValueBindingSpec,
    model: DataModel,
    options: BindDataModelOptions
  ): () => void
{
  const pipeRegistry =
    mergePipes(options);

  const compiledPipes =
    compilePipes(
      spec.pipes,
      pipeRegistry);

  const update =
    (): void => {
      const rawValue =
        readModelPath(
          model,
          spec.path);

      const formattedValue =
        applyPipes(
          rawValue,
          compiledPipes);

      writeBindingValue(
        element,
        spec.target,
        formattedValue);
    };

  update();

  if (spec.path === '')
    return () => {};

  const maybeUnsubscribe =
    observable.watch(
      model as any,
      spec.path,
      () => update());

  if (typeof maybeUnsubscribe !== 'function')
    return () => {};

  return () => maybeUnsubscribe();
}

function compilePipes(
    pipes: PipeSpec[],
    registry: Record<string, PipeFn>
  ): CompiledPipe[]
{
  const compiled: CompiledPipe[] = [];

  for (const pipe of pipes) {
    const formatter =
      registry[pipe.name];

    if (!formatter) {
      throw new Error(
        `Unknown pipe: ${pipe.name}`);
    }

    compiled.push(
      { args: [ ...pipe.args ],
        formatter });
  }

  return compiled;
}

function applyPipes(
    value: unknown,
    pipes: CompiledPipe[]
  ): unknown
{
  let current = value;

  for (const pipe of pipes) {
    current =
      pipe.formatter(
        current,
        ...pipe.args);
  }

  return current;
}
