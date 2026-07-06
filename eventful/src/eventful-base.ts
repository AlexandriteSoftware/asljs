import { eventful }
  from './eventful.js';
import { EventMap,
         Eventful,
         EventfulOptions }
  from './types.js';

export class EventfulBase<E extends EventMap = EventMap>
  implements Eventful<E>
{
  declare on: Eventful<E>['on'];
  declare once: Eventful<E>['once'];
  declare off: Eventful<E>['off'];
  declare emit: Eventful<E>['emit'];
  declare emitAsync: Eventful<E>['emitAsync'];
  declare has: Eventful<E>['has'];

  constructor(
      options: EventfulOptions = {},
    )
  {
    eventful(
      this,
      options);
  }
}
