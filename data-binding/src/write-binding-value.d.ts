import { type BindingTarget } from './types.js';
/**
 * Last step of value binding: writes the value to the target element.
 */
export declare function writeBindingValue(element: HTMLElement, target: BindingTarget, value: unknown): void;
