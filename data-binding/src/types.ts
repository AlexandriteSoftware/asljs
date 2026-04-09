export type PipeFn = (
    value: unknown,
    ...args: string[]
  ) => unknown;

export type EventMiddlewareFn = (
    event: Event,
    args: string[],
    context: { model: DataModel; element: Element; }
  ) => void;

export type PipeSpec =
  { name: string;
    args: string[]; };

export type BindingTarget =
  | { kind: 'text'; }
  | { kind: 'html'; }
  | { kind: 'attr'; name: string; }
  | { kind: 'prop'; name: string; }
  | { kind: 'class'; name: string; };

export type ValueBindingSpec =
  { kind: 'value';
    target: BindingTarget;
    path: string;
    pipes: PipeSpec[]; };

export type EventMiddlewareSpec =
  { name: string;
    args: string[]; };

export type EventBindingSpec =
  { kind: 'event';
    eventName: string;
    actionPath: string;
    middleware: EventMiddlewareSpec[]; };

export type BindingSpec =
  ValueBindingSpec
  | EventBindingSpec;

export type BindDataModelOptions =
  { pipes?: Record<string, PipeFn>;
    eventMiddleware?: Record<string, EventMiddlewareFn>; };

export type DataModel =
  Record<string, unknown>;

export type DataModelWithOn =
  DataModel &
  { on: (
      event: string,
      listener: (...args: unknown[]) => void
    ) => (() => boolean) | void; };

export type DataModelWithWatch =
  DataModel &
  { watch: (
      property: string | readonly string[],
      callback: (...values: unknown[]) => void
    ) => (() => boolean) | void; };
