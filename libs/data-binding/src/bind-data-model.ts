import { bindEventModel }
  from './bind-event-model.js';
import { bindValueModel }
  from './bind-value-model.js';
import { createDisposer }
  from './create-disposer.js';
import { parseEventBindingExpression,
         parseValueBindingExpression }
  from './parse-data-model-binding.js';
import { readModelPath,
         splitPath }
  from './read-model-path.js';
import { BindDataModelOptions,
         BindingSpec,
         BindingTarget,
         DataModel }
  from './types.js';
import { watchModelPath }
  from './watch-model-path.js';

const CONTEXT_ATTR = 'data-bind-context';

const BIND_PREFIX = 'data-bind-';

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

  return createDisposer(
    (): void =>
    {
      for (const dispose of disposers) {
        dispose();
      }
    });
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

  bindElementAttributes(
    element,
    model,
    options,
    warnOnce,
    nextPrefix,
    ownDisposers,
    CONTEXT_ATTR);

  let childDisposer: (() => boolean) | null = null;

  const bindChildren =
    (
        contextValue: unknown
      ): void =>
    {
    childDisposer?.();

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

  return createDisposer(
    (): void =>
    {
      for (const dispose of ownDisposers) {
        dispose();
      }

      childDisposer?.();
      unsubscribe?.();
    });
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

function createBindingSpec(
    suffix: string,
    expression: string
  ): BindingSpec
{
  if (isEventSuffix(suffix)) {
    return parseEventBindingExpression(
      suffix.slice(
        'on-'.length),
      expression);
  }

  return parseValueBindingExpression(
    resolveValueTarget(suffix),
    expression);
}

/**
 * True for `on-<event>`: the event name follows `on-` and is used as written,
 * so `on-click` listens to `click` and `on-key-submit` to `key-submit`.
 */
function isEventSuffix(
    suffix: string
  ): boolean
{
  return suffix.startsWith('on-')
    && suffix.length > 'on-'.length;
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

  if (
    suffix.startsWith('class-')
    && suffix.length > 6
  ) {
    return { kind: 'class',
             name:
               suffix.slice(
                 'class-'.length) };
  }

  if (
    suffix.startsWith('prop-')
    && suffix.length > 5
  ) {
    return { kind: 'prop',
             name:
               toPropertyName(
                 suffix.slice(
                   'prop-'.length)) };
  }

  return { kind: 'attr',
           name: suffix };
}

/**
 * Converts the property part of a `data-bind-prop-<name>` attribute the way
 * `dataset` converts a `data-*` name: each hyphen followed by a lowercase
 * letter is removed and the letter uppercased, so `read-only` becomes
 * `readOnly`. The HTML parser lowercases attribute names, so this is the only
 * way to reach a camel-case property.
 */
function toPropertyName(
    name: string
  ): string
{
  return name.replace(
    /-([a-z])/g,
    (
      _match: string,
      letter: string
    ) => letter.toUpperCase());
}
