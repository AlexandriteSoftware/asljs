import { EventfulBase } from 'asljs-eventful';
import { observable } from './observable.js';
export class ObservableObject extends EventfulBase {
    watch(properties, callback) {
        const propertiesList = typeof properties === 'string'
            ? [properties]
            : properties;
        return observable.watch(this, propertiesList, callback);
    }
    setAndEmit(property, previous, value, assign) {
        if (Object.is(previous, value)) {
            return false;
        }
        assign(value);
        this.emitSet(property, previous, value);
        return true;
    }
    emitSet(property, previous, value) {
        const payload = { property,
            value,
            previous };
        this.emit(`set:${property}`, payload);
        this.emit('set', payload);
        return true;
    }
}
