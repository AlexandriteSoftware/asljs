import type { EventName } from './types.js';
export declare function eventTypeGuard(value: any): asserts value is EventName;
export declare function isFunction(value: any): value is Function;
export declare function isObject(value: any): value is object;
export declare function functionTypeGuard(value: any): asserts value is Function;
