import { type ObservableWatchFn } from './types.js';
export declare const watchImpl: ObservableWatchFn;
export declare function ensureWatchMethod(target: any, watchFn: ObservableWatchFn): void;
