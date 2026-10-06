import { bindEventModel }
  from './bind-event-model.js';
import { bindValueModel }
  from './bind-value-model.js';
import { BIND_PREFIX,
         CONTEXT_ATTR,
         createBindingSpec,
         isEventSuffix }
  from './binding-attribute.js';
import { createDisposer }
  from './create-disposer.js';
import { readModelPath,
         splitPath }
  from './read-model-path.js';
import { BindDataModelOptions,
         DataModel }
  from './types.js';
import { watchModelPath }
  from './watch-model-path.js';

type WarnOnce =
  (
    key: string,
    message: string,
    error?: unknown
  ) =>
    void;

/**
 * Applies `data-bind-*` bindings under a root element and wires optional
 * model reactivity via `observe(model).at('<path>')` from `asljs-observable`.
 *
 * Supported syntax:
 * - `data-bind-text="path | pipe[:arg]"` => textContent
 * - `data-bind-html="path | pipe[:arg]"` => innerHTML
 * - `data-bind-href="path | pipe[:arg]"` => attribute binding
 * - `data-bind-on-click="actionPath"` => event binding
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
 * <button data-bind-on-click="activate"></button>
 * <form data-bind-on-submit="save"></form>
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
  ): () => boolean
{
  const warned = new Set<string>();

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
        error);
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
    nextPrefix);
}

function bindSubtree(
    root: ParentNode,
    model: DataModel,
    options: BindDataModelOptions,
    warnOnce: WarnOnce,
    nextPrefix: () => string
  ): () => boolean
{
  const disposers: Array<() => boolean> = [ ];

  const dispose =
    createDisposer(
      (): void =>
      {
      for (const disposer of disposers) {
        disposer();
      }
    });

  // A binding that fails to set up throws out of the walk, and the caller then
  // has no disposer: the bindings made so far are released here first.
  try {
    bindSubtreeChildren(
      root,
      model,
      options,
      warnOnce,
      nextPrefix,
      disposers);
  } catch (error) {
    dispose();

    throw error;
  }

  return dispose;
}

function bindSubtreeChildren(
    root: ParentNode,
    model: DataModel,
    options: BindDataModelOptions,
    warnOnce: WarnOnce,
    nextPrefix: () => string,
    disposers: Array<() => boolean>
  ): void
{
  for (const child of [ ...root.children ] as HTMLElement[]) {
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
          nextPrefix));
    } else {
      bindElementAttributes(
        child,
        model,
        options,
        warnOnce,
        nextPrefix,
        disposers);

      disposers.push(
        bindSubtree(
          child,
          model,
          options,
          warnOnce,
          nextPrefix));
    }
  }
}

function bindContextElement(
    element: HTMLElement,
    contextPath: string,
    model: DataModel,
    options: BindDataModelOptions,
    warnOnce: WarnOnce,
    nextPrefix: () => string
  ): () => boolean
{
  // Checked before anything is bound, like the value and event paths.
  splitPath(contextPath);

  const ownDisposers: Array<() => boolean> = [ ];

  let childDisposer: (() => boolean) | null = null;

  const bindChildren =
    (
        contextValue: unknown
      ): void =>
    {
    childDisposer?.();

    // Cleared before rebinding: a rebind that throws leaves no children bound,
    // and the old disposer has already run.
    childDisposer = null;

    const childModel =
      (contextValue !== null
        && contextValue !== undefined
        && typeof contextValue === 'object')
      ? contextValue as DataModel
      : {} as DataModel;

    childDisposer =
      bindSubtree(
        element,
        childModel,
        options,
        warnOnce,
        nextPrefix);
  };

  let unsubscribe: (() => boolean) | null = null;

  const dispose =
    createDisposer(
      (): void =>
      {
      for (const disposer of ownDisposers) {
        disposer();
      }

      childDisposer?.();
      unsubscribe?.();
    });

  try {
    bindElementAttributes(
      element,
      model,
      options,
      warnOnce,
      nextPrefix,
      ownDisposers,
      CONTEXT_ATTR);

    if (contextPath === '') {
      bindChildren(
        readModelPath(
          model,
          contextPath));
    } else {
      unsubscribe =
        watchModelPath(
          model,
          contextPath,
          bindChildren);
    }
  } catch (error) {
    dispose();

    throw error;
  }

  return dispose;
}

function bindElementAttributes(
    element: HTMLElement,
    model: DataModel,
    options: BindDataModelOptions,
    warnOnce: WarnOnce,
    nextPrefix: () => string,
    disposers: Array<() => boolean>,
    skipAttr?: string
  ): void
{
  for (const attribute of [ ...element.attributes ]) {
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

    const expression = attribute.value ?? '';

    // An event binding is written data-bind-on-<event>. Any other name that
    // starts with "on" is skipped rather than bound as an attribute: an on*
    // attribute is an inline event handler, and the expression is not script.
    if (
      suffix.startsWith('on')
      && !isEventSuffix(suffix)
    ) {
      const prefix =
        nextPrefix();

      warnOnce(
        `${prefix}:not-an-event:${attribute.name}`,
        `${prefix}: '${attribute.name}' is ignored; event bindings are `
          + `written data-bind-on-<event>, for example data-bind-on-click`);

      continue;
    }

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
            options));
      } else {
        disposers.push(
          bindEventModel(
            element,
            spec,
            model,
            prefix,
            warnOnce));
      }
    } catch (error) {
      if (spec.kind === 'value') {
        throw error;
      }

      warnOnce(
        `${prefix}:bind-error`,
        `${prefix}: binding setup failed`,
        error);
    }
  }
}
