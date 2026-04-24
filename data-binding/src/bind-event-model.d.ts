import { type DataModel, type EventBindingSpec } from './types.js';
export declare function bindEventModel(element: HTMLElement, spec: EventBindingSpec, model: DataModel, warnPrefix: string, warnOnce: (key: string, message: string, error?: unknown) => void): () => void;
