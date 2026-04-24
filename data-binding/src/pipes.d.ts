import { type BindDataModelOptions, type PipeFn } from './types.js';
/**
 * Creates the built-in value pipes used by data-bind value bindings.
 *
 * If `locale` is omitted, Intl formatters use the runtime default locale
 * (for example browser language preferences).
 *
 * Built-ins:
 * - `string`
 * - `number`
 * - `currency[:code]`
 * - `date[:format]`
 * - `datetime[:format]`
 * - `fixed[:digits]`
 * - `upper`
 * - `lower`
 * - `json[:spaces]`
 * - `default:value`
 * - `safeHtml`
 *
 * @example
 * ```ts
 * const pipes = createBuiltInPipes('en-GB');
 * pipes.currency(12.5, 'GBP');
 * ```
 */
export declare function createBuiltInPipes(locale?: string): Record<string, PipeFn>;
/**
 * Merges built-in pipes with user-provided pipes.
 * User-provided pipes override built-ins with the same name.
 *
 * @example
 * ```ts
 * const pipes = mergePipes({
 *   pipes: {
 *     yesno: value => value ? 'Yes' : 'No'
 *   }
 * });
 * ```
 */
export declare function mergePipes(options: BindDataModelOptions | undefined): Record<string, PipeFn>;
