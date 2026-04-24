import { type EventName, type Listener } from './types.js';
export interface EventfulLike {
    on(event: EventName, listener: Listener): () => boolean;
}
export declare function isEventfulLike(value: unknown): value is EventfulLike;
export declare function asEventfulLike(value: unknown): EventfulLike | undefined;
