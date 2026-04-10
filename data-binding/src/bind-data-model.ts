import {
    bindEventModel
  } from './bind-event-model.js';
import {
    bindValueModel
  } from './bind-value-model.js';
import {
    parseEventBindingExpression,
    parseValueBindingExpression
  } from './parse-data-model-binding.js';
import {
    type BindDataModelOptions,
    type BindingSpec,
    type BindingTarget,
    type DataModel
  } from './types.js';

type BoundElement =
  { element: HTMLElement;
    spec: BindingSpec;
    warnPrefix: string; };

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
  const bindings =
    collectBindings(root);

  const warned =
    new Set<string>();

  const warnOnce =
    (
      key: string,
      message: string,
      error: unknown = null
    ): void => {
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

  const disposers: Array<() => void> = [];

  for (const binding of bindings) {
    try {
      if (binding.spec.kind === 'value') {
        disposers.push(
          bindValueModel(
            binding.element,
            binding.spec,
            model,
            options));
      } else {
        disposers.push(
          bindEventModel(
            binding.element,
            binding.spec,
            model,
            binding.warnPrefix,
            warnOnce));
      }
    } catch (error) {
      if (binding.spec.kind === 'value') {
        throw error;
      }

      warnOnce(
        `${binding.warnPrefix}:bind-error`,
        `${binding.warnPrefix}: binding setup failed`,
        error);
    }
  }

  return () => {
    for (const dispose of disposers) {
      dispose();
    }
  };
}

function collectBindings(
    root: ParentNode
  ): BoundElement[]
{
  const elements =
    root.querySelectorAll<HTMLElement>('*');

  const bindings: BoundElement[] = [];

  for (const element of elements) {
    for (const attribute of [ ...element.attributes ]) {
      if (!attribute.name.startsWith('data-bind-')) {
        continue;
      }

      const suffix =
        attribute.name.slice('data-bind-'.length);

      const expression =
        attribute.value ?? '';

      const spec =
        createBindingSpec(
          suffix,
          expression);

      bindings.push(
        {
          element,
          spec,
          warnPrefix: `data-bind[${bindings.length}]`
        });
    }
  }

  return bindings;
}

function createBindingSpec(
    suffix: string,
    expression: string
  ): BindingSpec
{
  if (suffix.startsWith('on') && suffix.length > 2) {
    return parseEventBindingExpression(
      suffix.slice(2),
      expression);
  }

  return parseValueBindingExpression(
    resolveValueTarget(suffix),
    expression);
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
      name: suffix.slice('class-'.length)
    };
  }

  if (suffix.startsWith('prop-') && suffix.length > 5) {
    return {
      kind: 'prop',
      name: suffix.slice('prop-'.length)
    };
  }

  return {
    kind: 'attr',
    name: suffix
  };
}
