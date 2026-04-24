import { type EventName } from './types.js';
export declare function eventNameTypeGuard(value: unknown): asserts value is EventName;
export declare function isFunction(value: unknown): value is Function;
export declare function asFunction(value: unknown): Function | undefined;
export declare function isObject(value: unknown): value is object;
export declare function functionTypeGuard(value: unknown): asserts value is Function;
