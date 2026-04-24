import { eventful, } from './eventful.js';
export class EventfulBase {
    constructor(options = {}) {
        eventful(this, options);
    }
}
