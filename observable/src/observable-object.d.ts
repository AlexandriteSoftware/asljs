import { EventfulBase } from 'asljs-eventful';
import type { ObservableEventsObject, WatchedValues } from './types.js';
export declare class ObservableObject<T extends object> extends EventfulBase<ObservableEventsObject<T>> {
    watch<K extends Extract<keyof T, string>>(property: K, callback: (value: T[K]) => void): () => boolean;
    watch<K extends readonly (Extract<keyof T, string>)[]>(properties: K, callback: (...values: WatchedValues<T, K>) => void): () => boolean;
    watch(properties: readonly string[], callback: (...values: any[]) => void): () => boolean;
    watch(property: string, callback: (value: any) => void): () => boolean;
    protected setAndEmit<K extends Extract<keyof T, string>>(property: K, previous: T[K], value: T[K], assign: (value: T[K]) => void): boolean;
    protected emitSet<K extends Extract<keyof T, string>>(property: K, previous: T[K], value: T[K]): boolean;
}
