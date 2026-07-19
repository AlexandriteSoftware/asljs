import { observable }
  from 'asljs-observable';
import { bindEventModel }
  from './bind-event-model.js';
import { bindValueModel }
  from './bind-value-model.js';
import { parseEventBindingExpression,
         parseValueBindingExpression }
  from './parse-data-model-binding.js';
import { readModelPath }
  from './read-model-path.js';
import { BindDataModelOptions,
         BindingSpec,
         BindingTarget,
         DataModel }
  from './types.js';

const CONTEXT_ATTR =
  'data-bind-context';

const BIND_PREFIX = 'data-bind-';

type WarnOnce = (
  key: string,
  message: string,
  error?: unknown
) => void;

/**
 * Applies `data-bind-*` bindings under a root element and wires optional
 * model reactivity via `observable.watch(model, '<path>', ...)`.
 *
 * Supported syntax:
 * - `data-bind-text="path | pipe[:arg]"` => textContent
 * - `data-bind-html="path | pipe[:arg]"` => innerHTML
 * - `data-bind-href="path | pipe[:arg]"` => attribute binding
 * - `data-bind-onclick="actionPath"` => event binding
 * - `data-bind-class-active="path | pipe[:arg]"` => class toggle
 * - `data-bind-context="path"` => subtree context switch
 * - quoted pipe args are supported, e.g. `| wrap:'<span>':'</span>'`
 *
 * @example
 * Value bindings:
 * ```html
 * <div data-bind-text="name"></div>
 * <div data-bind-text="createdAt | date:short"></div>
 * <a data-bind-href="url"></a>
 * ```
 *
 * @example
 * Context switch:
 * ```html
 * <div data-bind-context="user">
 *   <span data-bind-text="name"></span>
 * </div>
 * ```
 *
 * @example
 * Event bindings:
 * ```html
 * <button data-bind-onclick="activate"></button>
 * <form data-bind-onsubmit="save"></form>
 * ```
 *
 * @example
 * Custom pipes:
 * ```ts
 * bindDataModel(root, model, {
 *   pipes: {
 *     yesno: value => value ? 'Yes' : 'No'
 *   }
 * });
 * ```
 */
export function bindDataModel(
    root: ParentNode,
    model: DataModel,
    options: BindDataModelOptions = {}
  ): () => void
{
  const warned =
    new Set<string>();

  const warnOnce: WarnOnce =
    (
    key: string,
    message: string,
    error: unknown = null
  ): void =>
  {
    if (warned.has(key)) {
      return;
    }

    warned.add(key);

    if (error === null) {
      console.warn(message);
    } else {
      console.warn(
        message,
        error
      );
    }
  };

  let counter = 0;

  const nextPrefix =
    (): string => `data-bind[${counter++}]`;

  return bindSubtree(
    root,
    model,
    options,
    warnOnce,
    nextPrefix
  );
}

function bindSubtree(
    root: ParentNode,
    model: DataModel,
    options: BindDataModelOptions,
    warnOnce: WarnOnce,
    nextPrefix: () => string
  ): () => void
{
  const disposers: Array<() => void> = [];

  for (const child of [...root.children] as HTMLElement[]) {
    const contextPath =
      child.getAttribute(CONTEXT_ATTR);

    if (contextPath !== null) {
      disposers.push(
        bindContextElement(
          child,
          contextPath,
          model,
          options,
          warnOnce,
          nextPrefix
        )
      );
    } else {
      bindElementAttributes(
        child,
        model,
        options,
        warnOnce,
        nextPrefix,
        disposers
      );

      disposers.push(
        bindSubtree(
          child,
          model,
          options,
          warnOnce,
          nextPrefix
        )
      );
    }
  }

  return (): void =>
  {
    for (const dispose of disposers) {
      dispose();
    }
  };
}

function bindContextElement(
    element: HTMLElement,
    contextPath: string,
    model: DataModel,
    options: BindDataModelOptions,
    warnOnce: WarnOnce,
    nextPrefix: () => string
  ): () => void
{
  const ownDisposers: Array<() => void> = [];

  bindElementAttributes(
    element,
    model,
    options,
    warnOnce,
    nextPrefix,
    ownDisposers,
    CONTEXT_ATTR
  );

  let childDisposer: (() => void) | null = null;

  const bindChildren =
    (): void =>
  {
    childDisposer?.();

    const contextValue =
      readModelPath(
        model,
        contextPath);

    const childModel =
      (contextValue !== null
        && contextValue !== undefined
        && typeof contextValue === 'object')
      ? contextValue as DataModel
      : {} as DataModel;

    childDisposer = bindSubtree(
      element,
      childModel,
      options,
      warnOnce,
      nextPrefix
    );
  };

  bindChildren();

  let unsubscribe: (() => boolean) | null = null;

  if (contextPath !== '') {
    const maybeUnsubscribe =
      observable.watch(
        model as any,
        contextPath,
        () => bindChildren());

    if (typeof maybeUnsubscribe === 'function') {
      unsubscribe = maybeUnsubscribe;
    }
  }

  return (): void =>
  {
    for (const dispose of ownDisposers) {
      dispose();
    }

    childDisposer?.();
    unsubscribe?.();
  };
}

function bindElementAttributes(
    element: HTMLElement,
    model: DataModel,
    options: BindDataModelOptions,
    warnOnce: WarnOnce,
    nextPrefix: () => string,
    disposers: Array<() => void>,
    skipAttr?: string
  ): void
{
  for (const attribute of [...element.attributes]) {
    if (!attribute.name.startsWith(BIND_PREFIX)) {
      continue;
    }

    if (
      skipAttr !== undefined
      && attribute.name === skipAttr
    ) {
      continue;
    }

    const suffix =
      attribute.name.slice(
        BIND_PREFIX.length);

    const expression =
      attribute.value ?? '';

    const spec =
      createBindingSpec(
        suffix,
        expression);

    const prefix =
      nextPrefix();

    try {
      if (spec.kind === 'value') {
        disposers.push(
          bindValueModel(
            element,
            spec,
            model,
            options
          )
        );
      } else {
        disposers.push(
          bindEventModel(
            element,
            spec,
            model,
            prefix,
            warnOnce
          )
        );
      }
    } catch (error) {
      if (spec.kind === 'value') {
        throw error;
      }

      warnOnce(
        `${prefix}:bind-error`,
        `${prefix}: binding setup failed`,
        error
      );
    }
  }
}

function createBindingSpec(
    suffix: string,
    expression: string
  ): BindingSpec
{
  if (suffix.startsWith('on') && suffix.length > 2) {
    return parseEventBindingExpression(
      suffix.slice(2),
      expression
    );
  }

  return parseValueBindingExpression(
    resolveValueTarget(suffix),
    expression
  );
}

function resolveValueTarget(
    suffix: string
  ): BindingTarget
{
  if (suffix === 'text') {
    return { kind: 'text' };
  }

  if (suffix === 'html') {
    return { kind: 'html' };
  }

  if (suffix.startsWith('class-') && suffix.length > 6) {
    return {
      kind: 'class',
      name: suffix.slice(
        'class-'.length
      )
    };
  }

  if (suffix.startsWith('prop-') && suffix.length > 5) {
    return {
      kind: 'prop',
      name: suffix.slice(
        'prop-'.length
      )
    };
  }

  return {
    kind: 'attr',
    name: suffix
  };
}
