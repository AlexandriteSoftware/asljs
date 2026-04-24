import { isFunction, isObject, } from './guards.js';
export function isEventfulLike(value) {
    if (!isObject(value)
        && !isFunction(value)) {
        return false;
    }
    return typeof value.on === 'function';
}
export function asEventfulLike(value) {
    if (isEventfulLike(value)) {
        return value;
    }
    return undefined;
}
