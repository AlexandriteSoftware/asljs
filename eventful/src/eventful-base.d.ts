import { type EventMap, type Eventful, type EventfulOptions } from './types.js';
export declare class EventfulBase<E extends EventMap = EventMap> implements Eventful<E> {
    on: Eventful<E>['on'];
    once: Eventful<E>['once'];
    off: Eventful<E>['off'];
    emit: Eventful<E>['emit'];
    emitAsync: Eventful<E>['emitAsync'];
    has: Eventful<E>['has'];
    constructor(options?: EventfulOptions);
}
