import { createDisposer }
  from './create-disposer.js';
import { mergePipes }
  from './pipes.js';
import { readModelPath }
  from './read-model-path.js';
import { BindDataModelOptions,
         DataModel,
         PipeFn,
         PipeSpec,
         ValueBindingSpec }
  from './types.js';
import { watchModelPath }
  from './watch-model-path.js';
import { writeBindingValue }
  from './write-binding-value.js';

type CompiledPipe = { args: string[]; formatter: PipeFn; };

export function bindValueModel(
    element: HTMLElement,
    spec: ValueBindingSpec,
    model: DataModel,
    options: BindDataModelOptions
  ): () => boolean
{
  const pipeRegistry =
    mergePipes(options);

  const compiledPipes =
    compilePipes(
      spec.pipes,
      pipeRegistry);

  const update =
    (): void =>
    {
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

  if (spec.path === '') {
    update();

    return createDisposer(
      () => { });
  }

  return watchModelPath(
    model,
    spec.path,
    update);
}

function compilePipes(
    pipes: PipeSpec[],
    registry: Record<string, PipeFn>
  ): CompiledPipe[]
{
  const compiled: CompiledPipe[] = [ ];

  for (const pipe of pipes) {
    const formatter =
      registry[pipe.name];

    if (!formatter) {
      throw new Error(
        `Unknown pipe: ${pipe.name}`);
    }

    compiled.push(
      { args:
          [ ...pipe.args ],
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
