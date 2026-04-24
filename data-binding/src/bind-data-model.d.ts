import { type BindDataModelOptions, type DataModel } from './types.js';
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
export declare function bindDataModel(root: ParentNode, model: DataModel, options?: BindDataModelOptions): () => void;
