import {
    type PipeFn,
    type PipeSpec
  } from './types.js';

export type PipeWarning =
  { type: 'unknown';
    pipeName: string; }
  | { type: 'error';
      pipeName: string;
      error: unknown; };

export function applyPipes(
    value: unknown,
    pipes: PipeSpec[],
    registry: Record<string, PipeFn>,
    onWarning: ((warning: PipeWarning) => void) | null = null
  ): unknown
{
  let current = value;

  for (const pipe of pipes) {
    const formatter =
      registry[pipe.name];

    if (!formatter) {
      onWarning?.({
        type: 'unknown',
        pipeName: pipe.name
      });

      continue;
    }

    try {
      current =
        formatter(
          current,
          ...pipe.args);
    } catch (error) {
      onWarning?.({
        type: 'error',
        pipeName: pipe.name,
        error
      });
    }
  }

  return current;
}
