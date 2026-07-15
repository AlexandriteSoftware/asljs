export type PipeFn = (
  value: unknown,
  ...args: string[]
) => unknown;

/**
 * Represents pipe in data-binding attribute.
 *
 * Example: `date:YYYY-MM-DD`
 *
 * ```json
 * { name: 'date', args: [ 'YYYY-MM-DD' ] }
 * ```
 */
export type PipeSpec = { name: string; args: string[]; };

/**
 * Represents the target of a value binding.
 *
 * Examples:
 *
 * - `data-bind-text="..."` -> `{ kind: 'text' }`
 * - `data-bind-html="..."` -> `{ kind: 'html' }`
 * - `data-bind-attr-title="..."` -> `{ kind: 'attr', name: 'title' }`
 * - `data-bind-prop-disabled="..."` -> `{ kind: 'prop', name: 'disabled' }`
 * - `data-bind-class-active="..."` -> `{ kind: 'class', name: 'active' }`
 */
export type BindingTarget =
  | { kind: 'text'; }
  | { kind: 'html'; }
  | { kind: 'attr'; name: string; }
  | { kind: 'prop'; name: string; }
  | { kind: 'class'; name: string; };

/**
 * Represents a data binding specification, including target, model path, and
 * optional pipes.
 *
 * Example: `data-bind-text="name"`
 *
 * ```json
 * { kind: 'value',
 *   target: { kind: 'text' },
 *   path: 'name' }
 * ```
 *
 * Example: `data-bind-html="body | default: N/A | upper"`
 *
 * ```json
 * { kind: 'value',
 *   target: { kind: 'html' },
 *   path: 'body',
 *   pipes:
 *     [ { name: 'default', args: [ 'N/A' ] },
 *       { name: 'upper', args: [] } ] }
 * ```
 */
export type ValueBindingSpec = {
  kind: 'value';
  target: BindingTarget;
  path: string;
  pipes: PipeSpec[];
};

/**
 * Represents an event binding specification, including event name and action
 * path.
 *
 * Example: `data-bind-click="activate"`
 *
 * ```json
 * { kind: 'event',
 *   eventName: 'click',
 *   actionPath: 'activate' }
 * ```
 */
export type EventBindingSpec = {
  kind: 'event';
  eventName: string;
  actionPath: string;
};

export type BindingSpec =
  | ValueBindingSpec
  | EventBindingSpec;

export type BindDataModelOptions = { pipes?: Record<string, PipeFn>; };

export type DataModel = Record<string, unknown>;

export type DataModelWithOn =
  & DataModel
  & {
    on: (
      event: string,
      listener: (...args: unknown[]) => void
    ) => (() => boolean) | void;
  };

export type DataModelWithWatch =
  & DataModel
  & {
    watch: (
      property: string | readonly string[],
      callback: (...values: unknown[]) => void
    ) => (() => boolean) | void;
  };
